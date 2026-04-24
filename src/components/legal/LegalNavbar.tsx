import React from "react";
import { Link } from "react-router-dom";
import { Music } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function LegalNavbar() {
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-12 transition-all duration-500 shadow-lg shadow-indigo-200">
            <Music className="text-white w-6 h-6 -rotate-3 group-hover:-rotate-12 transition-all" />
          </div>
          <span className="font-display text-2xl font-black tracking-tighter text-slate-900 uppercase italic">
            IND<span className="text-indigo-600">.</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <Link to="/#pricing" className="hover:text-indigo-600 transition-colors">Pricing</Link>
          <Link to="/terms" className="text-indigo-600">Legal</Link>
          <Link to={user ? "/dashboard" : "/auth?mode=login"} className="hover:text-indigo-600 transition-colors">
            {user ? "Dashboard" : "Login"}
          </Link>
        </div>

        <Link 
          to={user ? "/dashboard/upload" : "/auth?mode=signup"} 
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-full font-bold text-[10px] uppercase tracking-widest hover:shadow-xl hover:shadow-indigo-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}
