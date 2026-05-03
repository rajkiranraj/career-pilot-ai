import React from "react";
import { useNavigate } from "react-router-dom";
import { SignUpPage } from "../components/ui/sign-up";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

const sampleTestimonials = [
  {
    avatarSrc:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    name: "Sarah Chen",
    handle: "Software Engineer",
    text: "The AI career coach completely transformed my job search. I landed a lead role at a top tech company!",
  },
  {
    avatarSrc:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    name: "Marcus Johnson",
    handle: "Product Manager",
    text: "The interview prep is incredibly realistic. I felt so much more confident during the actual hiring process.",
  },
  {
    avatarSrc:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    name: "David Martinez",
    handle: "Data Scientist",
    text: "Intuitive, powerful, and truly life-changing for my professional growth. Best investment I've made.",
  },
];

const Register = () => {
  const navigate = useNavigate();
  const { checkUser } = useAuth();

  const handleSignUp = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });

      if (error) throw error;

      await checkUser(); // Update auth state
      toast.success("Welcome aboard! Please check your email to verify your account.");
      navigate("/onboarding");
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error(error.message || "Registration failed. Please try again.");
    }
  };

  return (
    <SignUpPage
      heroImageSrc="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=2160&q=80"
      testimonials={sampleTestimonials}
      onSignUp={handleSignUp}
      onSignInClick={() => navigate("/login")}
    />
  );
};

export default Register;
