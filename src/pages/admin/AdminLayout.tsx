import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Disc, 
  Users, 
  Building2, 
  CheckSquare, 
  Radio, 
  Info, 
  Settings,
  Bell,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Wallet,
  History,
  MessageSquare,
  ShieldCheck,
  Megaphone,
  CreditCard,
  Target
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";

const ADMIN_MENU = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { id: 'withdrawals', label: 'Withdrawals', icon: Wallet, path: '/admin/withdrawals' },
  { id: 'finance', label: 'Finance', icon: CreditCard, path: '/admin/finance' },
  { id: 'releases', label: 'Releases', icon: Disc, path: '/admin/releases' },
  { id: 'artists', label: 'Artists', icon: Users, path: '/admin/artists' },
  { id: 'labels', label: 'Labels', icon: Building2, path: '/admin/labels' },
  { id: 'content-id', label: 'Content ID', icon: ShieldCheck, path: '/admin/content-id' },
  { id: 'oac', label: 'OAC Requests', icon: Radio, path: '/admin/oac' },
  { id: 'user-requests', label: 'User Requests', icon: MessageSquare, path: '/admin/user-requests' },
  { id: 'support', label: 'Support Tickets', icon: Info, path: '/admin/support' },
  { id: 'broadcasts', label: 'Broadcasts', icon: Megaphone, path: '/admin/broadcasts' },
  { id: 'history', label: 'History', icon: History, path: '/admin/history' },
  { id: 'users', label: 'Users', icon: Settings, path: '/admin/users' },
];

export default function AdminLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const location = useLocation();
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  // Close sidebar on navigation on mobile
  React.useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-300 font-sans selection:bg-brand-blue/30">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {(isSidebarOpen) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Primary Navigation */}
      <aside className={cn(
        "fixed inset-y-0 left-0 bg-[#1E293B] border-r border-slate-800 z-[110] transition-all duration-500 ease-in-out overflow-hidden shadow-2xl",
        isSidebarOpen ? "w-80" : "w-0 lg:w-24"
      )}>
        <div className="flex flex-col h-full py-10">
          {/* Brand Identity */}
          <div className="px-8 mb-12 flex items-center justify-between">
             <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 group-hover:scale-110 transition-transform">
                   <Target className="w-8 h-8 text-slate-950" />
                </div>
                {isSidebarOpen && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-xl font-black font-display text-white tracking-tighter uppercase line-clamp-1">IND <span className="text-brand-blue">ADMIN</span></h1>
                    <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase mt-0.5">Control Mesh</p>
                  </motion.div>
                )}
             </div>
          </div>

          {/* Navigation Matrix */}
          <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide">
            {ADMIN_MENU.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/admin' && location.pathname === '/admin/');
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group relative",
                    isActive 
                      ? "bg-brand-blue text-white shadow-xl shadow-blue-900/40" 
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className={cn("w-6 h-6 flex-shrink-0 group-hover:scale-110 transition-transform", isActive ? "text-white" : "text-slate-400")} />
                  {isSidebarOpen && (
                    <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                  )}
                  {isActive && !isSidebarOpen && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-l-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Utility */}
          <div className="px-6 pt-8 border-t border-white/5">
             <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all group"
             >
                <LogOut className="w-6 h-6 flex-shrink-0" />
                {isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest text-left">Sign Out</span>}
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content Arena */}
      <main className={cn(
        "transition-all duration-500 min-h-screen",
        isSidebarOpen ? "lg:pl-80" : "lg:pl-24"
      )}>
        {/* Arena Header */}
        <header className="sticky top-0 z-[90] bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/5 px-8 md:px-12 py-8 flex items-center justify-between font-display">
           <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)} 
              className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl text-white hover:bg-white/10 transition-colors"
           >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
           </button>

           <div className="flex items-center gap-8">
              <div className="hidden md:flex flex-col items-end text-right">
                 <p className="text-xs font-black text-white uppercase tracking-tight">{profile?.displayName || 'Administrator'}</p>
                 <p className="text-[10px] text-brand-blue font-bold uppercase tracking-widest">System Node Alpha</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-brand-blue to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-900/40 hover:rotate-6 transition-all ring-4 ring-white/5 cursor-pointer overflow-hidden">
                 {profile?.photoURL ? (
                    <img src={profile.photoURL} className="w-full h-full object-cover" />
                 ) : (
                    <ShieldCheck className="w-7 h-7" />
                 )}
              </div>
           </div>
        </header>

        {/* Content Portal */}
        <div className="px-8 md:px-12 py-12 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
