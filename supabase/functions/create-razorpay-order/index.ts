import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("[create-razorpay-order] Request received");
    
    const authHeader = req.headers.get("Authorization");
    console.log("[create-razorpay-order] Auth header present:", !!authHeader);
    
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

      // Extract token from Authorization header
      const token = authHeader.replace("Bearer ", "");
      const {
        data: { user },
        error: userError,
      } = await supabaseClient.auth.getUser(token);

    console.log("[create-razorpay-order] User auth result:", { hasUser: !!user, hasError: !!userError });

    if (userError || !user) {
      throw new Error("Unauthorized: " + (userError?.message || "No user found"));
    }

    const { amount, currency = "INR", planName = "Pro", callbackUrl } = await req.json();

    console.log("[create-razorpay-order] Request body:", { amount, currency, planName, callbackUrl });

    if (!amount || amount <= 0) {
      throw new Error("Invalid amount");
    }

    if (!callbackUrl) {
      throw new Error("Callback URL is required for payment links");
    }

    let keyId = Deno.env.get("RAZORPAY_KEY_ID");
    let keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    console.log("[create-razorpay-order] Keys check:", { keyIdExists: !!keyId, keySecretExists: !!keySecret });

    if (keySecret && keySecret.includes(",")) {
      const parts = keySecret.split(",");
      keyId = parts[0].trim();
      keySecret = parts[1].trim();
    }

    if (!keyId || !keySecret) {
      throw new Error("Razorpay keys are not configured on the server.");
    }

    // Call Razorpay API to create payment link
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/payment_links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(`${keyId}:${keySecret}`),
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // convert to smallest currency unit (paise)
        currency,
        description: `Upgrade to ${planName} Plan`,
        customer: {
          name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
          email: user.email || "user@example.com",
        },
        notify: {
          sms: false,
          email: true,
        },
        reminder_enable: true,
        callback_url: callbackUrl,
        callback_method: "get",
      }),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error("[create-razorpay-order] Razorpay Error:", errorText);
      throw new Error("Failed to create Razorpay payment link: " + errorText);
    }

    const orderData = await razorpayResponse.json();
    console.log("[create-razorpay-order] Payment link created successfully");

    return new Response(JSON.stringify(orderData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("[create-razorpay-order] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
