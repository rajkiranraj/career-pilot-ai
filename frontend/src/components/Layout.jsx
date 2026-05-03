import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";

const Layout = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black flex flex-col">
      <Header />
      <main className="flex-grow pt-32 px-8 lg:px-16 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Global Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full" />
      </div>

      <footer className="py-8 mt-auto border-t border-white/10">
        <div className="container mx-auto px-4 text-center text-white/70 text-xs font-body uppercase tracking-widest">
          <p>© {new Date().getFullYear()} CareerPilot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
