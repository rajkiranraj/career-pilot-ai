import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { verifyRazorpayPayment } from "../services/PaymentService";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "../components/ui/button";

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      const paymentId = searchParams.get("razorpay_payment_id");
      const paymentLinkId = searchParams.get("razorpay_payment_link_id");
      const paymentLinkReferenceId = searchParams.get("razorpay_payment_link_reference_id");
      const paymentLinkStatus = searchParams.get("razorpay_payment_link_status");
      const signature = searchParams.get("razorpay_signature");
      const planName = searchParams.get("plan");

      if (!paymentId || !paymentLinkId || !signature) {
        setStatus("error");
        setErrorMessage("Invalid payment details returned from Razorpay.");
        return;
      }

      if (paymentLinkStatus !== "paid") {
        setStatus("error");
        setErrorMessage("Payment was not completed successfully.");
        return;
      }

      try {
        await verifyRazorpayPayment(
          {
            razorpay_payment_id: paymentId,
            razorpay_payment_link_id: paymentLinkId,
            razorpay_payment_link_reference_id: paymentLinkReferenceId || "",
            razorpay_payment_link_status: paymentLinkStatus,
            razorpay_signature: signature,
          },
          planName || "Pro"
        );

        setStatus("success");
        toast.success("Payment successful! Your account has been upgraded.");
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate("/dashboard");
        }, 3000);
      } catch (error) {
        setStatus("error");
        setErrorMessage(error.message || "Failed to verify payment signature.");
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
      <div className="liquid-glass border border-white/10 p-12 rounded-[2rem] max-w-md w-full text-center flex flex-col items-center gap-6">
        {status === "verifying" && (
          <>
            <Loader2 className="w-16 h-16 text-white/50 animate-spin" />
            <div className="space-y-2">
              <h2 className="text-2xl font-heading italic text-white">Verifying Payment</h2>
              <p className="text-white/60">Please wait while we confirm your transaction...</p>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-heading italic text-white">Payment Successful!</h2>
              <p className="text-white/60">Your account has been upgraded. Redirecting you to the dashboard...</p>
            </div>
            <Button variant="glass" onClick={() => navigate("/dashboard")} className="mt-4 w-full">
              Go to Dashboard Now
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-heading italic text-white">Payment Failed</h2>
              <p className="text-white/60">{errorMessage}</p>
            </div>
            <Button variant="glass" onClick={() => navigate("/#pricing")} className="mt-4 w-full">
              Try Again
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
