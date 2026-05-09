import React, { useState } from "react";
import { Check, ArrowUpRight } from "lucide-react";
import ScrollFloat from "./ui/ScrollFloat";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { createRazorpayOrder, verifyRazorpayPayment } from "../services/PaymentService";

export const PricingSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);



  const handlePayment = async (planName, price) => {
    if (!user) {
      toast.error("Please login to purchase a plan");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const callbackUrl = window.location.origin + "/payment/success?plan=" + planName;
      
      // 1. Create payment link on the backend
      const order = await createRazorpayOrder(price, planName, callbackUrl);
      
      if (!order || !order.short_url) {
        throw new Error("Failed to create payment link");
      }

      // 2. Redirect to Razorpay hosted checkout page
      window.location.href = order.short_url;
    } catch (err) {
      toast.error(err.message || "Failed to initiate checkout");
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: "Pro",
      price: "₹999",
      priceRaw: 999,
      period: "per month",
      description: "Everything you need to accelerate your career growth.",
      features: [
        "Unlimited AI Resume Parsing",
        "Unlimited Cover Letter Generations",
        "Unlimited Mock Interviews",
        "ATS Score Analyzer",
        "AI Career Roadmap Generator",
        "Priority Email Support"
      ],
      popular: true,
    },
    {
      name: "Elite",
      price: "₹2499",
      priceRaw: 2499,
      period: "per month",
      description: "Advanced tools for executive and senior roles.",
      features: [
        "Everything in Pro",
        "1-on-1 Expert Review (Monthly)",
        "Advanced Salary Negotiation Scripts",
        "LinkedIn Profile Optimization",
        "Direct Referrals to Partner Companies",
        "24/7 Priority Support"
      ],
      popular: false,
    }
  ];

  return (
    <section id="pricing" className="py-24 md:py-32 lg:py-48 px-6 md:px-8 lg:px-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-6 md:gap-8 mb-16 md:mb-24">
        <div className="liquid-glass rounded-full px-5 py-2 text-[10px] font-medium text-white/80 font-body uppercase tracking-[0.2em]">
          Pricing Plans
        </div>
        <ScrollFloat
          containerClassName="text-4xl md:text-6xl lg:text-7xl font-heading italic tracking-tight leading-[0.9] md:leading-[0.85] text-white"
        >
          Invest in your career.
        </ScrollFloat>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
        {plans.map((plan, i) => (
          <div
            key={i}
            className={`relative overflow-visible liquid-glass rounded-[2rem] p-8 md:p-12 flex flex-col gap-8 border transition-all duration-500 hover:bg-white/[0.04] hover:scale-[1.02] ${
              plan.popular ? "border-white/20 shadow-2xl" : "border-white/5"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                Most Popular
              </div>
            )}
            
            <div className="flex flex-col gap-4 text-center">
              <h3 className="text-2xl font-heading italic text-white">{plan.name}</h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl md:text-6xl font-bold tracking-tight text-white">{plan.price}</span>
                <span className="text-white/50 text-sm font-medium">{plan.period}</span>
              </div>
              <p className="text-white/60 text-sm font-body font-light max-w-md mx-auto line-clamp-none">
                {plan.description}
              </p>
            </div>

            <div className="h-[1px] w-full bg-white/10 my-4" />

            <ul className="flex flex-col gap-4 flex-grow">
              {plan.features.map((feature, j) => (
                <li key={j} className="flex items-start gap-4">
                  <div className="mt-1 bg-white/10 rounded-full p-1 flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white/80 font-body text-sm leading-relaxed">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handlePayment(plan.name, plan.priceRaw)}
              disabled={loading}
              className={`w-full rounded-full px-8 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-all mt-8 ${
                plan.popular
                  ? "bg-white text-black hover:bg-white/90"
                  : "liquid-glass-strong hover:scale-105"
              }`}
            >
              {loading ? "Processing..." : `Upgrade to ${plan.name}`}
              {!loading && <ArrowUpRight className="w-4 h-4" />}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
