import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Upload, 
  Music, 
  Wallet, 
  User, 
  LogOut,
  Bell,
  Search,
  Settings,
  Shield,
  MessageSquare,
  Globe,
  Youtube,
  FileText,
  ShieldAlert,
  ChevronRight,
  Plus,
  Zap,
  Menu,
  X,
  LifeBuoy,
  Clock,
  CheckCircle2,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { auth, db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { collection, query, where, onSnapshot, orderBy, limit, doc, updateDoc, writeBatch } from "firebase/firestore";
import { toast } from "sonner";
import SEO from "./SEO";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Upload Music", icon: Upload, path: "/dashboard/upload" },
  { label: "My Releases", icon: Music, path: "/dashboard/releases" },
  { label: "Growth Tools", icon: Zap, path: "/dashboard/growth" },
  { label: "Wallet", icon: Wallet, path: "/dashboard/wallet" },
  { label: "Subscription", icon: ShieldCheck, path: "/dashboard/subscription" },
  { label: "Artists", icon: User, path: "/dashboard/artists" },
  { label: "Labels", icon: Globe, path: "/dashboard/labels" },
  { label: "Content ID", icon: ShieldAlert, path: "/dashboard/content-id" },
  { label: "OAC Request", icon: Youtube, path: "/dashboard/oac" },
  { label: "Reports", icon: FileText, path: "/dashboard/reports" },
  { label: "Requests", icon: MessageSquare, path: "/dashboard/requests" },
  { label: "Support", icon: LifeBuoy, path: "/dashboard/support" },
  { label: "Profile", icon: Settings, path: "/dashboard/profile" },
  { label: "Our Founder", icon: Sparkles, path: "/founder" },
];

export default function DashboardLayout() {
  const { user, profile, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "user_notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    
    const unsubscribe = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
      console.error("Notifications snapshot error:", err);
      // Don't toast here to avoid spamming the user if it's a persistent error
    });

    return unsubscribe;
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "user_notifications", id), { read: true });
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;
    try {
      const batch = writeBatch(db);
      notifications.filter(n => !n.read).forEach(n => {
        batch.update(doc(db, "user_notifications", n.id), { read: true });
      });
      await batch.commit();
      toast.success("Notification chronicle cleared.");
    } catch (err) {
      toast.error("Batch update failure.");
    }
  };

  // Close sidebar on navigation on mobile
  React.useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <SEO title="Dashboard Architecture" description="Manage your music distribution, assets, and royalties with IND Distribution neural network." />
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-slate-100 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] lg:relative transform",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="h-full flex flex-col p-8 bg-white relative">
          {/* Logo Section */}
          <div className="flex items-center justify-between mb-12">
            <Link to="/dashboard" className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-slate-950 rounded-[1.25rem] flex items-center justify-center rotate-6 group-hover:rotate-0 transition-transform duration-500 shadow-2xl shadow-slate-950/20">
                <Zap className="text-white w-6 h-6 fill-brand-blue stroke-brand-blue" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-2xl font-black tracking-tighter uppercase leading-none">IND<span className="text-brand-blue">.</span></span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mt-1">Nexus-G1</span>
              </div>
            </Link>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-3 bg-slate-50 rounded-xl text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 overflow-y-auto pr-4 -mr-4 scrollbar-hide">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.label}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-4 px-6 py-4 rounded-[1.5rem] transition-all duration-500 font-black text-[11px] uppercase tracking-widest group relative overflow-hidden",
                    isActive 
                      ? "bg-slate-950 text-white shadow-[0_20px_40px_-15px_rgba(15,23,42,0.3)] active-nav" 
                      : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform duration-500 group-hover:scale-110", 
                    isActive ? "text-brand-blue" : "text-slate-300"
                  )} />
                  {item.label}
                  {isActive && (
                    <motion.div 
                      layoutId="active-nav-glow"
                      className="absolute right-4 w-1 h-1 bg-brand-blue rounded-full shadow-[0_0_10px_2px_rgba(59,130,246,0.6)]"
                    />
                  )}
                </Link>
              );
            })}

            {isAdmin && (
              <Link 
                to="/admin"
                onClick={() => {
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className="flex items-center gap-4 px-6 py-5 rounded-[1.5rem] bg-brand-purple/5 text-brand-purple mt-8 font-black text-[11px] uppercase tracking-[0.2em] border border-brand-purple/10 hover:bg-brand-purple hover:text-white transition-all shadow-xl shadow-purple-500/5 group"
              >
                <div className="w-8 h-8 rounded-xl bg-brand-purple/20 flex items-center justify-center group-hover:bg-white/20">
                  <Shield className="w-4 h-4" />
                </div>
                Portal Admin
              </Link>
            )}
          </nav>

          {/* Bottom Profile Section */}
          <div className="mt-8 pt-8 border-t border-slate-50 space-y-6">
            <Link 
              to="/dashboard/profile" 
              onClick={() => {
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className="flex items-center gap-4 p-3 bg-slate-50 rounded-[2rem] hover:bg-slate-100 transition-all group"
            >
              <div className="w-12 h-12 rounded-[1.25rem] bg-slate-950 flex items-center justify-center text-white font-black text-sm relative shadow-xl overflow-hidden">
                 <div className="absolute inset-0 bg-linear-to-br from-brand-blue/20 to-brand-purple/20"></div>
                 <span className="relative z-10">{profile?.displayName?.[0] || "A"}</span>
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-xs font-black truncate text-slate-800 uppercase tracking-tight">{profile?.displayName}</p>
                 <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Authorized</span>
                 </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 mr-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 px-6 py-4 w-full text-slate-400 hover:text-rose-500 transition-all text-[11px] font-black uppercase tracking-widest group"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center group-hover:bg-rose-50">
                 <LogOut className="w-4 h-4" />
              </div>
              Disconnect
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-brand-blue/5 blur-[150px] -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-brand-purple/5 blur-[150px] translate-y-1/2 -translate-x-1/2 rounded-full pointer-events-none"></div>

        {/* Dynamic Header */}
        <header className="h-20 lg:h-28 flex items-center justify-between px-4 md:px-8 lg:px-12 relative z-20 backdrop-blur-sm">
          <div className="flex items-center gap-4 lg:gap-8">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className={cn(
                "p-3 lg:p-4 bg-white rounded-2xl shadow-xl border border-slate-50 text-slate-400 transition-all hover:text-slate-900 group",
                isSidebarOpen ? "lg:hidden" : "block"
              )}
            >
              <Menu className="w-6 h-6 transition-transform group-active:scale-95" />
            </button>
            <div className="hidden lg:flex items-center bg-white p-3 px-6 rounded-[2rem] shadow-xl border border-slate-50 gap-4 w-[28rem] xl:w-[32rem]">
              <Search className="w-4 h-4 text-slate-300" />
              <input 
                placeholder="Search global metadata or assets..."
                className="bg-transparent border-none focus:ring-0 text-xs font-bold w-full placeholder:text-slate-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <div className="hidden xl:flex items-center gap-2 mr-4">
               <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black group hover:z-30 transition-all hover:scale-110 cursor-pointer overflow-hidden">
                       <img src={`https://picsum.photos/seed/artist${i}/100/100`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ))}
               </div>
               <div className="flex flex-col ml-2">
                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">Collaborators</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">Synced & Online</span>
               </div>
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative w-10 h-10 lg:w-14 lg:h-14 bg-white rounded-xl lg:rounded-[1.5rem] flex items-center justify-center text-slate-400 hover:text-slate-950 shadow-xl border border-slate-50 transition-all hover:-translate-y-1 group"
              >
                <Bell className="w-5 h-5 lg:w-6 lg:h-6 transition-transform group-hover:rotate-12" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 lg:top-4 lg:right-4 w-2 h-2 lg:w-3 lg:h-3 bg-brand-blue rounded-full border-2 lg:border-4 border-white shadow-sm animate-pulse"></span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-80 md:w-96 bg-white rounded-[2rem] shadow-4xl border border-slate-100 z-50 overflow-hidden"
                    >
                      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <h4 className="text-sm font-black uppercase tracking-widest">Global Signals</h4>
                        {unreadCount > 0 && (
                          <button 
                            onClick={markAllAsRead}
                            className="text-[9px] font-black text-brand-blue uppercase hover:underline"
                          >
                            Purge Unread
                          </button>
                        )}
                      </div>
                      <div className="max-h-[25rem] overflow-y-auto custom-scrollbar">
                        {notifications.map((n) => (
                          <div 
                            key={n.id} 
                            onClick={() => {
                              markAsRead(n.id);
                              if (n.type === 'request') {
                                window.location.href = '/dashboard/requests';
                              }
                            }}
                            className={cn(
                              "p-6 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors flex gap-4 items-start relative group",
                              !n.read && "bg-brand-blue/5"
                            )}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                              n.type === 'request' ? "bg-amber-100 text-amber-600" : "bg-brand-blue/10 text-brand-blue"
                            )}>
                              {n.type === 'request' ? <Clock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn("text-xs uppercase tracking-tight", n.read ? "font-bold text-slate-500" : "font-black text-slate-900")}>
                                {n.title}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                {n.message}
                              </p>
                              <span className="text-[9px] font-bold text-slate-300 mt-2 block uppercase tracking-widest">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {!n.read && (
                              <div className="w-1.5 h-1.5 bg-brand-blue rounded-full mt-2 shrink-0"></div>
                            )}
                          </div>
                        ))}
                        {notifications.length === 0 && (
                          <div className="p-12 text-center">
                            <Bell className="w-10 h-10 text-slate-100 mx-auto mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Quiet Sector. No signals detected.</p>
                          </div>
                        )}
                      </div>
                      <Link 
                        to="/dashboard/support" 
                        className="block p-4 text-center text-[10px] font-black uppercase tracking-widest bg-slate-50 hover:bg-slate-100 text-slate-400 transition-colors"
                        onClick={() => setIsNotificationsOpen(false)}
                      >
                        Access Nexus Intelligence
                      </Link>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            
            <Link 
              to="/dashboard/upload"
              className="px-4 py-3 lg:px-8 lg:py-4 bg-slate-950 text-white rounded-xl lg:rounded-[1.5rem] font-black text-[10px] lg:text-[11px] uppercase tracking-widest shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] flex items-center gap-2 lg:gap-3 active:scale-95 transition-all group"
            >
              <span className="hidden sm:inline">Primary Release</span>
              <span className="sm:hidden">Upload</span>
              <Plus className="w-4 h-4 text-brand-blue group-hover:scale-125 transition-transform" />
            </Link>
          </div>
        </header>

        {/* Viewport Container */}
        <div className="flex-1 overflow-y-auto scrollbar-hide perspective-1000">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="p-4 md:p-8 lg:p-12 pt-4 max-w-7xl mx-auto w-full"
          >
             <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
