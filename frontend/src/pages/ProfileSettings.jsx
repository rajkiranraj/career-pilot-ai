import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import { RotateCcw, Settings, User as UserIcon } from "lucide-react";

const ProfileSettings = () => {
  const { user } = useAuth();
  const [opacity, setOpacity] = useState(0.21);
  const [activeTab, setActiveTab] = useState("account");

  // Load initial value from localStorage
  useEffect(() => {
    const savedOpacity = localStorage.getItem("glass-opacity");
    if (savedOpacity) {
      const val = parseFloat(savedOpacity);
      setOpacity(val);
      document.documentElement.style.setProperty("--glass-opacity", val);
    }
  }, []);

  const handleOpacityChange = (value) => {
    const newOpacity = value[0];
    setOpacity(newOpacity);
    document.documentElement.style.setProperty("--glass-opacity", newOpacity);
    localStorage.setItem("glass-opacity", newOpacity);
  };

  const handleReset = () => {
    const defaultOpacity = 0.21;
    setOpacity(defaultOpacity);
    document.documentElement.style.setProperty("--glass-opacity", defaultOpacity);
    localStorage.removeItem("glass-opacity");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-12 px-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl md:text-5xl font-heading italic text-white">
          Profile Settings
        </h1>
        <p className="text-white/50 font-body font-light">
          Manage your account preferences and customize your UI experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab("account")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === "account" 
                ? "bg-white/10 text-white font-medium shadow-sm" 
                : "text-white/40 hover:text-white hover:bg-white/5"
            }`}
          >
            <UserIcon className="h-4 w-4" />
            Account Information
          </button>
          <button 
            onClick={() => setActiveTab("ui")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === "ui" 
                ? "bg-white/10 text-white font-medium shadow-sm" 
                : "text-white/40 hover:text-white hover:bg-white/5"
            }`}
          >
            <Settings className="h-4 w-4" />
            UI Customization
          </button>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          {/* User Info Section */}
          {activeTab === "account" && (
            <div className="liquid-glass rounded-3xl p-8 border border-white/10 space-y-6">
              <h2 className="text-xl font-heading italic text-white flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-white/50" />
                User Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white/40 text-[10px] uppercase tracking-widest">Full Name</Label>
                  <div className="text-white font-medium">{user?.name || "Not provided"}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/40 text-[10px] uppercase tracking-widest">Email Address</Label>
                  <div className="text-white font-medium">{user?.email}</div>
                </div>
              </div>
            </div>
          )}

          {/* UI Customization Section */}
          {activeTab === "ui" && (
            <div className="liquid-glass rounded-3xl p-8 border border-white/10 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-heading italic text-white flex items-center gap-2">
                  <Settings className="h-5 w-5 text-white/50" />
                  UI Customization
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleReset}
                  className="text-[10px] uppercase tracking-widest gap-2 text-white/40 hover:text-white"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset Defaults
                </Button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label className="text-white font-medium">Glass Effect Opacity</Label>
                  <span className="text-white/50 font-mono text-sm">
                    {(opacity * 100).toFixed(0)}%
                  </span>
                </div>
                
                <div className="px-2">
                  <Slider
                    value={[opacity]}
                    min={0.1}
                    max={0.9}
                    step={0.01}
                    onValueChange={handleOpacityChange}
                    className="py-4"
                  />
                </div>

                <p className="text-xs text-white/30 font-body font-light leading-relaxed">
                  Adjust the transparency of the "Liquid Glass" elements throughout the application. 
                  Higher values make elements more solid, while lower values increase transparency.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
