import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { TubesBackground } from "./TubesBackground";

// --- SUB-COMPONENTS ---
const GlassInputWrapper = ({ children }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-colors focus-within:border-white/30 focus-within:bg-white/10">
    {children}
  </div>
);

const TestimonialCard = ({ testimonial, delay }) => (
  <div
    className={`animate-testimonial ${delay} flex items-start gap-3 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 w-64`}
  >
    <img
      src={testimonial.avatarSrc}
      className="h-10 w-10 object-cover rounded-2xl"
      alt="avatar"
    />
    <div className="text-sm leading-snug">
      <p className="flex items-center gap-1 font-medium text-white">
        {testimonial.name}
      </p>
      <p className="text-white/40">{testimonial.handle}</p>
      <p className="mt-1 text-white/70">{testimonial.text}</p>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export const SignUpPage = ({
  title = (
    <span className="font-heading italic text-white tracking-tighter">
      Start Your Journey
    </span>
  ),
  description = "Join 10,000+ professionals using AI to fast-track their careers.",
  heroImageSrc,
  testimonials = [],
  onSignUp,
  onSignInClick,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black text-white font-body">
      {/* Left column: sign-up form */}
      <section className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-8">
            <div className="space-y-4">
              <h1 className="animate-element animate-delay-100 text-5xl md:text-6xl font-heading italic leading-tight text-white">
                {title}
              </h1>
              <p className="animate-element animate-delay-200 text-white/50 text-lg font-light leading-relaxed">
                {description}
              </p>
            </div>

            <form className="space-y-6" onSubmit={onSignUp}>
              <div className="animate-element animate-delay-300 space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/40 ml-1">
                  Full Name
                </label>
                <GlassInputWrapper>
                  <input
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-white placeholder:text-white/20"
                  />
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-400 space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/40 ml-1">
                  Email Address
                </label>
                <GlassInputWrapper>
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-white placeholder:text-white/20"
                  />
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-500 space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/40 ml-1">
                  Password
                </label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none text-white placeholder:text-white/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-4 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-white/40 hover:text-white transition-colors" />
                      ) : (
                        <Eye className="w-5 h-5 text-white/40 hover:text-white transition-colors" />
                      )}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              <button
                type="submit"
                className="animate-element animate-delay-600 w-full rounded-full bg-white py-4 font-medium text-black hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-[0.2em] text-[10px]"
              >
                Create Account
              </button>
            </form>

            <p className="animate-element animate-delay-800 text-center text-xs text-white/40 uppercase tracking-widest">
              Already have an account?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onSignInClick?.();
                }}
                className="text-white hover:underline transition-colors ml-2"
              >
                Sign In
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Right column: interactive tubes + testimonials */}
      <section className="hidden md:block flex-1 relative p-6">
        <div className="animate-slide-right animate-delay-300 absolute inset-6 rounded-[2.5rem] overflow-hidden">
          <TubesBackground enableClickInteraction={true} />
        </div>
        {testimonials.length > 0 && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-6 px-12 w-full justify-center z-10">
            <TestimonialCard
              testimonial={testimonials[0]}
              delay="animate-delay-800"
            />
            {testimonials[1] && (
              <div className="hidden xl:flex">
                <TestimonialCard
                  testimonial={testimonials[1]}
                  delay="animate-delay-1000"
                />
              </div>
            )}
            {testimonials[2] && (
              <div className="hidden 2xl:flex">
                <TestimonialCard
                  testimonial={testimonials[2]}
                  delay="animate-delay-1200"
                />
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
