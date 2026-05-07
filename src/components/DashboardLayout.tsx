import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Upload, Music, Wallet, User, LogOut, Bell, Search, Settings, 
  Shield, MessageSquare, Globe, Youtube, FileText, ShieldAlert, ChevronRight, 
  Plus, Zap, Menu, X, LifeBuoy, Clock, CheckCircle2, Sparkles, ShieldCheck, Activity 
} from "lucide-react";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { collection, query, where, onSnapshot, limit, doc, updateDoc, writeBatch } from "firebase/firestore";
import { toast } from "sonner";
import SEO from "./SEO";
import NeuralGrid from "./ui/NeuralGrid";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile default closed
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "user_notifications"), where("userId", "==", user.uid), limit(20));
    const unsubscribe = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, "user_notifications");
    });
    return unsubscribe;
  }, [user]);

  const markAsRead = async (id: string) => {
    try { await updateDoc(doc(db, "user_notifications", id), { read: true }); } 
    catch (err) { console.error("Failed to mark notification as read:", err); }
  };

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;
    try {
      const batch = writeBatch(db);
      notifications.filter(n => !n.read).forEach(n => { batch.update(doc(db, "user_notifications", n.id), { read: true }); });
      await batch.commit();
      toast.success("Notifications cleared.");
    } catch (err) { toast.error("Error updating notifications."); }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => { await auth.signOut(); navigate("/"); };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans relative">
      <SEO title="Artist Dashboard" description="Manage your music distribution, assets, and royalties with IND Distribution." />
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && window.innerWidth < 1024 && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Adjusted for mobile width */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-slate-100 transition-transform duration-300 lg:relative lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col p-6 bg-white overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
                <Zap className="text-white w-5 h-5 fill-brand-blue stroke-brand-blue relative z-10" />
              </div>
              <span className="font-display text-xl font-black tracking-tighter uppercase text-slate-800">IND<span className="text-brand-blue">.</span></span>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400"><X /></button>
          </div>

          <nav className="flex-1 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link 
                key={item.label} to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest",
                  location.pathname === item.path ? "bg-slate-950 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"
                )}
              >
                <item.icon className={cn("w-4 h-4", location.pathname === item.path ? "text-brand-blue" : "text-slate-400")} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-50 space-y-4">
             <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-rose-500 text-[10px] font-black uppercase tracking-widest">
               <LogOut className="w-4 h-4" /> Logout
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        <NeuralGrid />
        
        {/* Header - Fixed overlapping issues on mobile */}
        <header className="h-16 lg:h-20 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md border-b border-slate-100 z-30 shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 lg:hidden text-slate-500"><Menu /></button>
            <div className="flex-1 max-w-[200px] sm:max-w-xs">
              <div className="flex items-center bg-slate-50 p-2 px-3 rounded-lg border border-slate-100 gap-2">
                <Search className="w-3 h-3 text-slate-300" />
                <input placeholder="Search..." className="bg-transparent border-none focus:ring-0 text-[10px] uppercase w-full" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 ml-2">
            <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="p-2 text-slate-400 relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-brand-blue rounded-full border-2 border-white" />}
            </button>
            <Link to="/dashboard/upload" className="bg-slate-950 text-white p-2 sm:px-4 sm:py-2 rounded-lg flex items-center gap-2 transition-transform active:scale-95">
              <Plus className="w-4 h-4 text-brand-blue" />
              <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Upload</span>
            </Link>
          </div>
        </header>

        {/* Viewport Container - Fixing Scroll and Padding for Mobile */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 md:p-8 lg:p-10 pb-24 max-w-7xl mx-auto w-full"
          >
             <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
        }
