import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("[verify-razorpay-payment] Request received");
    
    const authHeader = req.headers.get("Authorization");
    console.log("[verify-razorpay-payment] Auth header present:", !!authHeader);
    
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);

    console.log("[verify-razorpay-payment] User auth result:", { hasUser: !!user, hasError: !!userError });

    if (userError || !user) {
      throw new Error("Unauthorized: " + (userError?.message || "No user found"));
    }

    const { 
      razorpay_payment_id, 
      razorpay_payment_link_id, 
      razorpay_payment_link_reference_id, 
      razorpay_payment_link_status, 
      razorpay_signature, 
      planName 
    } = await req.json();

    console.log("[verify-razorpay-payment] Verification data:", { planName, hasPaymentId: !!razorpay_payment_id, hasSignature: !!razorpay_signature });

    if (!razorpay_payment_id || !razorpay_payment_link_id || !razorpay_signature) {
      throw new Error("Missing payment verification parameters");
    }

    let keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    console.log("[verify-razorpay-payment] Key secret check:", { exists: !!keySecret });
    
    if (keySecret && keySecret.includes(",")) {
      const parts = keySecret.split(",");
      keySecret = parts[1].trim();
    }

    if (!keySecret) {
      throw new Error("Razorpay secret not configured on the server");
    }

    const payload = `${razorpay_payment_link_id}|${razorpay_payment_link_reference_id}|${razorpay_payment_link_status}|${razorpay_payment_id}`;
    const generated_signature = createHmac("sha256", keySecret).update(payload).digest("hex");

    console.log("[verify-razorpay-payment] Signature verification:", { matches: generated_signature === razorpay_signature });

    if (generated_signature !== razorpay_signature) {
      throw new Error("Payment signature verification failed");
    }

    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({ subscription_plan: planName, subscription_active: true })
      .eq("id", user.id);

    console.log("[verify-razorpay-payment] Profile update:", { hasError: !!updateError });

    if (updateError) {
      console.error("Failed to update profile subscription:", updateError);
    }

    console.log("[verify-razorpay-payment] Payment verified successfully");

    return new Response(JSON.stringify({ success: true, message: "Payment verified successfully" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("[verify-razorpay-payment] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
