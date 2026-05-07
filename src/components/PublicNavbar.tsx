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
    <>
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only fixed top-0 left-0 z-[100] bg-brand-blue text-white px-6 py-3 font-bold rounded-br-2xl shadow-2xl"
      >
        Skip to main content
      </a>
      <nav 
        role="navigation"
        aria-label="Global Navigation"
        className={cn(
          "fixed top-0 w-full z-50 px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-slate-100 transition-all duration-300 shadow-sm",
          isTransparent ? "max-w-full mt-0 rounded-none border-x-0" : "max-w-7xl mt-4 rounded-full border shadow-lg"
        )}
        style={{ WebkitBackdropFilter: 'blur(24px)', backdropFilter: 'blur(24px)' }}
      >
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
          <Music className="text-white w-5 h-5" />
        </div>
        <span className="font-display font-bold tracking-tighter text-xl text-slate-900">
          IND<span className="text-brand-blue">.</span>
        </span>
      </Link>
      
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          link.isHash ? (
            <a 
              key={link.label}
              href={link.to} 
              className="text-[10px] font-black uppercase tracking-widest transition-colors text-slate-500 hover:text-brand-blue min-h-[44px] flex items-center"
            >
              {link.label}
            </a>
          ) : (
            <Link 
              key={link.label}
              to={link.to} 
              className="text-[10px] font-black uppercase tracking-widest transition-colors text-slate-500 hover:text-brand-blue min-h-[44px] flex items-center"
            >
              {link.label}
            </Link>
          )
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Link 
          to={user ? "/dashboard" : "/auth?mode=login"} 
          className="text-sm font-bold text-slate-600 hover:text-brand-blue transition-colors min-h-[44px] flex items-center"
        >
          {user ? "Dashboard" : "Login"}
        </Link>
        <Link 
          to={user ? "/dashboard/upload" : "/auth?mode=signup"} 
          className="px-6 py-2.5 bg-brand-blue text-white rounded-full font-bold text-xs uppercase tracking-widest hover:shadow-lg transition-all min-h-[44px] flex items-center"
        >
          {user ? "Upload" : "Start Now"}
        </Link>
      </div>
    </nav>
  </>
  );
};

export default PublicNavbar;
