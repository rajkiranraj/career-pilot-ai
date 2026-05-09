import { supabase } from "../lib/supabase";

export const createRazorpayOrder = async (amount, planName, callbackUrl) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error("User must be logged in to create an order");
  }

  const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
    body: { amount, planName, callbackUrl },
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) {
    let msg = error.message || "Failed to create order";
    if (error.context && typeof error.context.json === "function") {
      try {
        const errBody = await error.context.json();
        msg = errBody.error || msg;
      } catch (_) {}
    }
    throw new Error(msg);
  }

  return data;
};

export const verifyRazorpayPayment = async (paymentData, planName) => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("User must be logged in to verify payment");
  }

  const { data, error } = await supabase.functions.invoke("verify-razorpay-payment", {
    body: { ...paymentData, planName },
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) {
    let msg = error.message || "Failed to verify payment";
    if (error.context && typeof error.context.json === "function") {
      try {
        const errBody = await error.context.json();
        msg = errBody.error || msg;
      } catch (_) {}
    }
    throw new Error(msg);
  }

  return data;
};
