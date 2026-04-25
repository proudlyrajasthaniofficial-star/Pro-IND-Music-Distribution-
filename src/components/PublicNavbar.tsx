import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Music, MessageCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const PublicNavbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isTransparent = location.pathname === '/';

  const navLinks = [
    { label: "Features", to: "/#features", isHash: true },
    { label: "Pricing", to: "/#pricing", isHash: true },
    { label: "Founder", to: "/founder-developer" },
    { label: "Blog", to: "/blog" },
    { label: "Contact", to: "/contact" },
  ];

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 px-6 py-4 flex items-center justify-between mt-4 mx-auto max-w-7xl left-0 right-0 rounded-full border border-white/5 backdrop-blur-md transition-all duration-300",
      isTransparent ? "bg-black/20" : "bg-white/80 border-slate-200 shadow-sm"
    )}>
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
          <Music className="text-white w-5 h-5" />
        </div>
        <span className={cn(
          "font-display font-bold tracking-tighter text-xl",
          isTransparent ? "text-white" : "text-slate-900"
        )}>
          IND<span className="text-brand-blue">.</span>
        </span>
      </Link>
      
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          link.isHash ? (
            <a 
              key={link.label}
              href={link.to} 
              className={cn(
                "text-[10px] font-black uppercase tracking-widest transition-colors",
                isTransparent ? "text-white/60 hover:text-brand-blue" : "text-slate-500 hover:text-brand-blue"
              )}
            >
              {link.label}
            </a>
          ) : (
            <Link 
              key={link.label}
              to={link.to} 
              className={cn(
                "text-[10px] font-black uppercase tracking-widest transition-colors",
                isTransparent ? "text-white/60 hover:text-brand-blue" : "text-slate-500 hover:text-brand-blue"
              )}
            >
              {link.label}
            </Link>
          )
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Link 
          to={user ? "/dashboard" : "/auth?mode=login"} 
          className={cn(
            "text-sm font-medium transition-colors",
            isTransparent ? "text-white hover:text-brand-blue" : "text-slate-600 hover:text-brand-blue"
          )}
        >
          {user ? "Dashboard" : "Login"}
        </Link>
        <Link 
          to={user ? "/dashboard/upload" : "/auth?mode=signup"} 
          className="px-6 py-2.5 bg-brand-blue text-white rounded-full font-bold text-xs uppercase tracking-widest hover:shadow-lg transition-all"
        >
          {user ? "Upload" : "Start Now"}
        </Link>
      </div>
    </nav>
  );
};

export default PublicNavbar;
