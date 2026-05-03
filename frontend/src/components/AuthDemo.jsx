import React from "react";
import { SignInPage } from "./ui/sign-in";
import { SignUpPage } from "./ui/sign-up";

const sampleTestimonials = [
  {
    avatarSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    name: "Sarah Chen",
    handle: "Software Engineer",
    text: "The AI career coach completely transformed my job search. I landed a lead role at a top tech company!"
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    name: "Marcus Johnson",
    handle: "Product Manager",
    text: "The interview prep is incredibly realistic. I felt so much more confident during the actual hiring process."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    name: "David Martinez",
    handle: "Data Scientist",
    text: "Intuitive, powerful, and truly life-changing for my professional growth. Best investment I've made."
  },
];

const AuthDemo = () => {
  const [view, setView] = React.useState("login");

  const handleSignIn = (event) => {
    event.preventDefault();
    console.log("Sign In submitted");
  };

  const handleSignUp = (event) => {
    event.preventDefault();
    console.log("Sign Up submitted");
  };

  return (
    <div className="bg-black">
      {view === "login" ? (
        <SignInPage
          heroImageSrc="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=2160&q=80"
          testimonials={sampleTestimonials}
          onSignIn={handleSignIn}
          onResetPassword={() => alert("Reset clicked")}
          onCreateAccount={() => setView("signup")}
        />
      ) : (
        <SignUpPage
          heroImageSrc="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=2160&q=80"
          testimonials={sampleTestimonials}
          onSignUp={handleSignUp}
          onSignInClick={() => setView("login")}
        />
      )}
    </div>
  );
};

export default AuthDemo;
