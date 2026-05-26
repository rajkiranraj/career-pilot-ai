import React from "react";
import { Button } from "./ui/button";
import {
  PenBox,
  LayoutDashboard,
  FileText,
  GraduationCap,
  ChevronDown,
  StarsIcon,
  LogOut,
  User,
  Settings,
  BriefcaseIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-8 lg:px-16 py-3">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img
            src="/logo.png"
            alt="CareerPilot Logo"
            className="h-16 w-16 md:h-20 md:w-20 object-contain rounded-2xl md:rounded-3xl"
          />
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Main Nav Pill */}
              <div className="hidden md:flex items-center liquid-glass rounded-full px-1.5 py-1 mr-2">
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>

                {/* Growth Tools Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <StarsIcon className="h-4 w-4" />
                      Growth Tools
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 liquid-glass border-white/10 bg-black/80 backdrop-blur-xl rounded-2xl p-2 mt-4"
                  >
                    <DropdownMenuItem
                      asChild
                      className="rounded-xl focus:bg-white/10 focus:text-white cursor-pointer p-3"
                    >
                      <Link to="/resume" className="flex items-center gap-3">
                        <FileText className="h-4 w-4" />
                        <div className="flex flex-col">
                          <span className="font-medium">Build Resume</span>
                          <span className="text-[10px] text-white/40">
                            AI-powered optimization
                          </span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="rounded-xl focus:bg-white/10 focus:text-white cursor-pointer p-3"
                    >
                      <Link
                        to="/ai-cover-letter"
                        className="flex items-center gap-3"
                      >
                        <PenBox className="h-4 w-4" />
                        <div className="flex flex-col">
                          <span className="font-medium">Cover Letter</span>
                          <span className="text-[10px] text-white/40">
                            Custom tailored drafts
                          </span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="rounded-xl focus:bg-white/10 focus:text-white cursor-pointer p-3"
                    >
                      <Link to="/interview" className="flex items-center gap-3">
                        <GraduationCap className="h-4 w-4" />
                        <div className="flex flex-col">
                          <span className="font-medium">Interview Prep</span>
                          <span className="text-[10px] text-white/40">
                            AI mock interviews
                          </span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="rounded-xl focus:bg-white/10 focus:text-white cursor-pointer p-3"
                    >
                      <Link to="/ats-analyzer" className="flex items-center gap-3">
                        <FileText className="h-4 w-4" />
                        <div className="flex flex-col">
                          <span className="font-medium">ATS Analyzer</span>
                          <span className="text-[10px] text-white/40">
                            Check resume match
                          </span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="rounded-xl focus:bg-white/10 focus:text-white cursor-pointer p-3"
                    >
                      <Link to="/ai-roadmap" className="flex items-center gap-3">
                        <GraduationCap className="h-4 w-4" />
                        <div className="flex flex-col">
                          <span className="font-medium">AI Roadmap</span>
                          <span className="text-[10px] text-white/40">
                            Career learning path
                          </span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="rounded-xl focus:bg-white/10 focus:text-white cursor-pointer p-3"
                    >
                      <Link to="/remote-jobs" className="flex items-center gap-3">
                        <BriefcaseIcon className="h-4 w-4" />
                        <div className="flex flex-col">
                          <span className="font-medium">Job Board</span>
                          <span className="text-[10px] text-white/40">
                            Remote & on-site opportunities
                          </span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* User Profile / Logout */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="glass" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 liquid-glass border-white/10 bg-black/80 backdrop-blur-xl rounded-2xl p-2 mt-4"
                >
                  <div className="px-3 py-2 text-sm">
                    <p className="font-medium text-white">
                      {user.name || "User"}
                    </p>
                    <p className="text-xs text-white/40 truncate">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    asChild
                    className="rounded-xl focus:bg-white/10 focus:text-white cursor-pointer p-3 gap-3"
                  >
                    <Link to="/settings" className="flex items-center gap-3">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={logout}
                    className="rounded-xl focus:bg-destructive/10 focus:text-destructive text-destructive cursor-pointer p-3 gap-3"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button variant="glass-strong">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
