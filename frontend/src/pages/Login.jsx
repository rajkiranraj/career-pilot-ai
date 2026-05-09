import React from "react";
import { useNavigate } from "react-router-dom";
import { SignInPage } from "../components/ui/sign-in";
import { useAuth } from "../context/AuthContext";
import { getAuthRedirectUrl, supabase } from "../lib/supabase";
import { toast } from "sonner";

const sampleTestimonials = [
  {
    avatarSrc:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    name: "Priya Patel",
    handle: "Software Engineer",
    text: "The AI career coach completely transformed my job search. I landed a lead role at a top tech company!",
  },
  {
    avatarSrc:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    name: "Rahul Verma",
    handle: "Product Manager",
    text: "The interview prep is incredibly realistic. I felt so much more confident during the actual hiring process.",
  },
  {
    avatarSrc:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    name: "Sneha Nair",
    handle: "Data Scientist",
    text: "Intuitive, powerful, and truly life-changing for my professional growth. Best investment I've made.",
  },
];

const Login = () => {
  const navigate = useNavigate();
  const { checkUser } = useAuth();

  const handleResetPassword = async () => {
    // Basic implementation; you might want to show a modal to capture email first
    const email = prompt("Enter your email address to reset password:");
    if (!email) return;

    try {
      const redirectTo = getAuthRedirectUrl();
      const { error } = await supabase.auth.resetPasswordForEmail(
        email,
        redirectTo ? { redirectTo } : undefined,
      );
      if (error) throw error;
      toast.success("Password reset email sent!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSignIn = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message?.toLowerCase().includes("email not confirmed")) {
          toast.error("Please verify your email before signing in.");
          return;
        }

        throw error;
      }

      await checkUser(); // Update auth state
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(
        error.message || "Login failed. Please check your credentials.",
      );
    }
  };

  return (
    <SignInPage
      heroImageSrc="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=2160&q=80"
      testimonials={sampleTestimonials}
      onSignIn={handleSignIn}
      onResetPassword={handleResetPassword}
      onCreateAccount={() => navigate("/register")}
    />
  );
};

export default Login;
