import { ArrowUpRight, Menu, X, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const links = [
    { name: "Home", path: "/" },
    { name: "Resume", path: "/resume" },
    { name: "Interview", path: "/interview" },
    { name: "Cover Letter", path: "/ai-cover-letter" },
    { name: "Pricing", path: "#pricing" },
  ];

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 px-6 lg:px-16 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between relative">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center z-50">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-16 w-16 md:h-20 md:w-20 object-contain rounded-2xl md:rounded-3xl"
          />
        </Link>

        {/* Center: Links (Desktop) */}
        <div className="hidden md:flex items-center liquid-glass rounded-full px-2 py-1.5">
          {links.map((link) => {
            const isPricing = link.name === "Pricing";
            const content = (
              <span className="px-5 py-2 text-xs uppercase tracking-widest font-medium text-white/50 font-body hover:text-white transition-all cursor-pointer">
                {link.name}
              </span>
            );

            if (isPricing) {
              return <div key={link.name}>{content}</div>;
            }

            return (
              <Link
                key={link.name}
                to={!user && link.name !== "Home" ? "/login" : link.path}
              >
                {content}
              </Link>
            );
          })}
        </div>

        {/* Right: CTA & Mobile Toggle */}
        <div className="flex items-center gap-4 z-50">
          {user ? (
            <Link to="/dashboard" className="hidden sm:block">
              <Button
                variant="glass-strong"
                className="gap-2 text-[10px] uppercase tracking-[0.2em] px-6 md:px-8 h-10 md:h-11"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/register" className="hidden sm:block">
              <Button
                variant="glass-strong"
                className="gap-2 text-[10px] uppercase tracking-[0.2em] px-6 md:px-8 h-10 md:h-11"
              >
                Join CareerPilot
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden liquid-glass-strong p-2.5 rounded-full text-white"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-16 left-0 right-0 md:hidden liquid-glass border border-white/10 rounded-3xl p-8 flex flex-col gap-6 backdrop-blur-3xl z-40"
            >
              {links.map((link) => {
                const isPricing = link.name === "Pricing";
                const content = (
                  <span className="text-lg uppercase tracking-[0.2em] font-heading italic text-white/70 hover:text-white cursor-pointer">
                    {link.name}
                  </span>
                );

                if (isPricing) {
                  return <div key={link.name}>{content}</div>;
                }

                return (
                  <Link
                    key={link.name}
                    to={!user && link.name !== "Home" ? "/login" : link.path}
                    onClick={() => setIsOpen(false)}
                  >
                    {content}
                  </Link>
                );
              })}
              {user ? (
                <Link
                  to="/dashboard"
                  className="sm:hidden w-full"
                  onClick={() => setIsOpen(false)}
                >
                  <Button
                    variant="glass-strong"
                    className="w-full gap-2 text-xs uppercase tracking-[0.2em] h-12"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="sm:hidden w-full"
                  onClick={() => setIsOpen(false)}
                >
                  <Button
                    variant="glass-strong"
                    className="w-full gap-2 text-xs uppercase tracking-[0.2em] h-12"
                  >
                    Join CareerPilot
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};
