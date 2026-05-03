import React, { useEffect, useState } from "react";
import { collection, query, where, limit, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import SEO from "../../components/SEO";
import { 
  TrendingUp, 
  Music, 
  Globe, 
  Wallet,
  ArrowUpRight,
  MoreVertical,
  Plus,
  User,
  Shield,
  Bell,
  CheckCircle,
  ShieldAlert,
  ShieldCheck,
  Headphones,
  Activity
} from "lucide-react";
import { formatCurrency, cn } from "../../lib/utils";
import { Link } from "react-router-dom";
import { AreaChart, Area, BarChart, Bar, Legend, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from "motion/react";
import { FadeIn } from "../../components/ui/FadeIn";
import { PLANS } from "../../constants/plans";
import { Skeleton } from "../../components/ui/Skeleton";

export default function Overview() {
  const { user, profile, isAdmin } = useAuth();
  const [recentReleases, setRecentReleases] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, live: 0, pending: 0, rejected: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [platformData, setPlatformData] = useState<any[]>([]);
  const [systemNotifications, setSystemNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulated Platform data for professional look
    setPlatformData([
      { name: "Spotify", streams: 15400, color: "#1DB954" },
      { name: "Apple", streams: 12200, color: "#FA243C" },
      { name: "Wynk", streams: 8400, color: "#FF0000" },
      { name: "JioSaavn", streams: 6800, color: "#2E8B57" },
      { name: "YouTube", streams: 18900, color: "#FF0000" }
    ]);

    const qNews = query(collection(db, "system_notifications"), orderBy("createdAt", "desc"), limit(3));
    const unsubNews = onSnapshot(qNews, (snap) => {
      setSystemNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
      console.error("News snapshot error:", err);
      setError("Unable to load latest system notifications. Please contact support if this persists.");
    });

    if (!user) return;
    setError(null);

    // Fetch All Releases for stats (Real-time)
    const qAll = query(collection(db, "releases"), where("userId", "==", user.uid));
    const unsubAll = onSnapshot(qAll, (snap) => {
      const allData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setStats({
        total: allData.length,
        live: allData.filter((r: any) => r.status === 'live').length,
        pending: allData.filter((r: any) => r.status === 'pending' || r.status === 'approved').length,
        rejected: allData.filter((r: any) => r.status === 'rejected').length
      });
      // Derive recent
      const sorted = [...allData].sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setRecentReleases(sorted.slice(0, 4));
    }, (err) => {
      console.error("All releases stats snapshot error:", err);
      // Fail silently for dashboard visuals to prevent crash
    });

    // Fetch Earnings for Chart
    const qEarnings = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid)
    );
    const unsubEarnings = onSnapshot(qEarnings, (snap) => {
      const earningsByDay: Record<string, number> = {};
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString('en-US', { weekday: 'short' });
      }).reverse();

      last7Days.forEach(day => earningsByDay[day] = 0);

      const allEarnings = snap.docs.map(d => d.data()).filter(d => d.type === 'earning');
      allEarnings.forEach(data => {
        const date = new Date(data.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
        if (earningsByDay[date] !== undefined) {
          earningsByDay[date] += data.amount;
        }
      });

      const formattedChart = last7Days.map(day => ({
        name: day,
        revenue: earningsByDay[day]
      }));

      setChartData(formattedChart);
      setLoading(false);
    }, (err) => {
      console.error("Earnings snapshot error:", err);
      // Empty chart data on error
      setChartData([]);
      setLoading(false);
    });

    return () => {
      unsubNews();
      unsubAll();
      unsubEarnings();
    };
  }, [user]);

  if (loading) {
     return (
       <div className="space-y-12 pb-20">
          <div className="grid lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-16 w-3/4 rounded-3xl" />
                <Skeleton className="h-8 w-1/2 rounded-full" />
                <div className="flex gap-4">
                   <Skeleton className="h-24 w-48 rounded-[2rem]" />
                   <Skeleton className="h-24 w-48 rounded-[2rem]" />
                </div>
             </div>
             <Skeleton className="h-40 rounded-[3.5rem]" />
          </div>
          <div className="grid grid-cols-4 gap-6">
             {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-[2rem]" />)}
          </div>
          <Skeleton className="h-96 rounded-[4rem]" />
       </div>
     );
  }

  return (
    <FadeIn>
      <div className="space-y-12 pb-20 text-left">
        <SEO title="Artist Mission Control" />

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] flex items-center gap-4 text-amber-700"
          >
            <ShieldAlert className="w-6 h-6 shrink-0" />
            <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
          </motion.div>
        )}

        {/* Improved Admin Callout */}
        {isAdmin && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative overflow-hidden bg-brand-purple text-white p-6 md:p-8 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl shadow-purple-500/30"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
            <div className="flex items-center gap-6 text-left relative z-10 w-full">
              <div className="w-14 h-14 bg-white/20 rounded-[1.5rem] flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-black uppercase tracking-tighter text-xl leading-tight text-white/90">Administrative System Online</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mt-1">Superuser access confirmed. You have global override authority.</p>
              </div>
            </div>
            <Link to="/admin" className="relative z-10 w-full md:w-auto text-center px-10 py-4 bg-white text-brand-purple rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all shadow-xl whitespace-nowrap">
              Enter Platform Root
            </Link>
          </motion.div>
        )}

        {/* System Notifications */}
        <AnimatePresence>
          {systemNotifications.length > 0 && (
            <div className="space-y-4">
              {systemNotifications.map((n, idx) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "p-4 md:p-6 rounded-[2rem] border flex items-center gap-6 relative overflow-hidden",
                    n.type === 'urgent' ? "bg-rose-50 border-rose-100 text-rose-800" :
                    n.type === 'warning' ? "bg-amber-50 border-amber-100 text-amber-800" :
                    "bg-blue-50 border-blue-100 text-blue-800"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                    n.type === 'urgent' ? "bg-rose-100" :
                    n.type === 'warning' ? "bg-amber-100" :
                    "bg-blue-100"
                  )}>
                     {n.type === 'urgent' ? <ShieldAlert className="w-6 h-6" /> :
                      n.type === 'warning' ? <Bell className="w-6 h-6" /> :
                      <Globe className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-3">
                      <p className="font-black uppercase tracking-tight text-sm md:text-base">{n.title}</p>
                      <span className="text-[9px] font-bold opacity-40 uppercase">{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs md:text-sm font-medium opacity-80 mt-1">{n.message}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Welcome & Earnings Header */}
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8 px-4 md:px-0">
          <div className="lg:col-span-2 text-left">
            <motion.h1 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
               className="text-3xl md:text-5xl font-black font-display tracking-tight mb-2 uppercase flex flex-wrap items-center gap-2 md:gap-4 leading-tight"
            >
              Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-purple-600 block">{profile?.displayName?.trim() ? profile.displayName : (profile?.artistName || 'Artist')}</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-xs md:text-sm text-slate-400 font-bold tracking-widest uppercase mb-8">
               System Initialized • All Systems Operational
            </motion.p>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Refined Plan Info Card */}
              <Link to="/dashboard/subscription" className="group">
                <div className="px-6 py-4 bg-white border border-slate-100 shadow-xl rounded-[2rem] flex items-center gap-4 hover:border-brand-blue transition-all">
                  <div className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5 whitespace-nowrap">Active Plan Status</p>
                    <p className="text-sm font-black uppercase text-slate-900 leading-none tracking-tight">
                      {profile?.planId ? (PLANS.find(p => p.id === profile.planId)?.name || profile.planId.toUpperCase()) : 'FREE TIER'}
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-brand-blue group-hover:translate-x-1 group-hover:-translate-y-1 transition-all ml-2" />
                </div>
              </Link>

              <div className="flex items-center gap-3">
                 <Link to="/dashboard/subscription" className="px-6 py-4 rounded-[2rem] bg-brand-purple/5 text-brand-purple hover:bg-brand-purple hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
                   <Activity className="w-4 h-4" /> Upgrade Capacity
                 </Link>
              </div>
            </div>
          </div>
          
          <div className="bg-[#1E293B] p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] shadow-2xl border-none flex flex-col justify-center gap-4 md:gap-8 group relative overflow-hidden text-white">
             <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-all"></div>
             
             <div className="flex items-center justify-between relative z-10 w-full mb-2">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-[1.5rem] flex items-center justify-center text-emerald-400 shrink-0">
                      <Wallet className="w-5 h-5 md:w-6 md:h-6" />
                   </div>
                   <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Treasury Vault</p>
                </div>
                <Link to="/dashboard/wallet" className="w-8 h-8 md:w-12 md:h-12 bg-white/10 text-white rounded-[1rem] md:rounded-[1.5rem] flex items-center justify-center hover:bg-emerald-500 hover:scale-105 transition-all backdrop-blur-md">
                  <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />
                </Link>
             </div>

             <div className="relative z-10 w-full text-left">
                <h2 className="text-3xl md:text-5xl font-black font-display tracking-tighter group-hover:scale-105 transition-transform origin-left whitespace-nowrap">
                  {formatCurrency(profile?.walletBalance || 0)}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                   <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md text-[9px] font-bold uppercase tracking-widest">+4.2%</span>
                   <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">since last payout</span>
                </div>
             </div>
          </div>
        </div>

        {/* 3D Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
           {[
             { label: "New Release", icon: Headphones, path: "/dashboard/upload", color: "bg-brand-blue shadow-blue-500/40 text-white" },
             { label: "My Catalog", icon: Music, path: "/dashboard/releases", color: "bg-white text-slate-900 border border-slate-200 shadow-xl" },
             { label: "Transactions", icon: Wallet, path: "/dashboard/wallet", color: "bg-white text-slate-900 border border-slate-200 shadow-xl" },
             { label: "Artist Profile", icon: User, path: "/dashboard/artists", color: "bg-brand-purple shadow-purple-500/40 text-white" },
           ].map((btn, i) => (
             <Link 
               key={i} 
               to={btn.path}
               className={cn(
                 "relative h-28 md:h-32 rounded-[2rem] p-6 font-black font-display tracking-wider uppercase text-xs md:text-sm overflow-hidden group transition-all transform hover:-translate-y-2 active:translate-y-0 shadow-lg group-hover:shadow-2xl flex flex-col justify-between",
                 btn.color
               )}
             >
                <div className="flex items-center justify-between w-full relative z-10">
                   <div className={cn(
                      "w-10 h-10 rounded-[1rem] flex items-center justify-center backdrop-blur-sm",
                      btn.color.includes('bg-white') ? "bg-slate-100" : "bg-white/20"
                   )}>
                      <btn.icon className="w-5 h-5" />
                   </div>
                   <ArrowUpRight className={cn("w-5 h-5 opacity-0 group-hover:opacity-100 transition-all", btn.color.includes('bg-white') ? "text-slate-400" : "text-white/60")} />
                </div>
                <div className="relative z-10 text-left mt-2 leading-tight">
                   {btn.label}
                </div>
                
                {/* Background wash icon */}
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
                   <btn.icon className="w-32 h-32" />
                </div>
             </Link>
           ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
           {/* Analytics Mini View */}
           <div className="lg:col-span-2 flex flex-col gap-8">
             <div className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col gap-6 md:gap-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                   <div className="text-left">
                     <h3 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-4">
                        <TrendingUp className="text-brand-blue w-6 h-6 md:w-8 md:h-8" /> EARNINGS VELOCITY
                     </h3>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">7-Day Trajectory</p>
                   </div>
                   <div className="self-start sm:self-auto px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full flex items-center gap-2 shadow-sm">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">+12.4% MoM</span>
                   </div>
                </div>
                
                <div className="h-[260px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="miniChart" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0066FF" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10, fontWeight: 700}} dy={10} />
                        <YAxis hide domain={['dataMin', 'dataMax + 10']} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1E293B', borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', color: 'white' }}
                          labelStyle={{ fontWeight: 800, color: '#94A3B8', marginBottom: '8px' }}
                          cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#0066FF" strokeWidth={4} fillOpacity={1} fill="url(#miniChart)" animationDuration={1500} />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 h-[380px] flex flex-col">
                  <div className="mb-6 flex justify-between items-center text-left">
                     <div>
                       <h4 className="font-black font-display text-lg tracking-tight uppercase">Top Platforms</h4>
                       <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">By Stream Count</p>
                     </div>
                  </div>
                  <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={platformData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 11, fontWeight: 800}} width={80} />
                        <Tooltip 
                          cursor={{fill: '#f8fafc'}}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="streams" radius={[0, 8, 8, 0]} animationDuration={1500}>
                          {platformData.map((entry, index) => (
                            <cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               <div className="bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                  <h4 className="font-black font-display text-lg tracking-tight uppercase mb-6 text-left">Pipeline Status</h4>
                  <div className="flex flex-col gap-4">
                    {[
                      { label: "Live Catalog", count: stats.live, color: "bg-emerald-500", text: "text-emerald-700", ring: "ring-emerald-100" },
                      { label: "Processing", count: stats.pending, color: "bg-brand-blue", text: "text-blue-700", ring: "ring-blue-100" },
                      { label: "Action Required", count: stats.rejected, color: "bg-rose-500", text: "text-rose-700", ring: "ring-rose-100" },
                    ].map((item, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-[1.5rem] flex items-center justify-between group cursor-default">
                         <div className="flex items-center gap-4">
                           <div className={cn("w-4 h-4 rounded-full ring-4 shadow-inner", item.color, item.ring)}></div>
                           <p className="text-xs font-black uppercase tracking-widest text-slate-600">{item.label}</p>
                         </div>
                         <p className={cn("text-2xl font-black font-display", item.text)}>{item.count}</p>
                      </div>
                    ))}
                  </div>
               </div>
             </div>
           </div>

           {/* Recent Releases Visual List */}
           <div className="space-y-6 md:space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                 <h3 className="text-xl md:text-2xl font-black font-display tracking-tight uppercase text-left">Latest Releases</h3>
                 <Link to="/dashboard/releases" className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue hover:underline bg-blue-50 px-4 py-2 rounded-full self-start md:self-auto">View All</Link>
              </div>

              <div className="space-y-4 md:space-y-5">
                 {recentReleases.map((release, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white p-4 md:p-5 rounded-[2rem] border border-slate-100 flex items-center gap-5 group hover:shadow-xl hover:border-brand-blue/20 transition-all cursor-default"
                    >
                       <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.25rem] overflow-hidden flex-shrink-0 shadow-md group-hover:scale-105 transition-transform z-10 relative">
                          <img src={release.coverUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                       </div>
                       <div className="flex-1 min-w-0 text-left">
                          <p className="font-black text-slate-800 tracking-tight truncate text-sm md:text-base">{release.title}</p>
                          <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 truncate">{release.artist}</p>
                          <div className="flex items-center gap-2 mt-2">
                             <div className={cn(
                                "w-1.5 h-1.5 md:w-2 md:h-2 rounded-full",
                                release.status === 'live' ? "bg-emerald-500 animate-pulse" : 
                                release.status === 'pending' || release.status === 'approved' ? "bg-brand-blue" :
                                "bg-amber-500"
                             )}></div>
                             <span className={cn(
                               "text-[8px] md:text-[9px] font-black uppercase tracking-widest leading-none",
                               release.status === 'live' ? "text-emerald-500" : 
                               release.status === 'pending' || release.status === 'approved' ? "text-brand-blue" :
                               "text-amber-500"
                             )}>
                               {release.status.replace("_", " ")}
                             </span>
                          </div>
                       </div>
                       <Link to={`/dashboard/releases`} className="w-8 h-8 md:w-10 md:h-10 bg-slate-50 border border-slate-100 rounded-xl md:rounded-[1rem] flex items-center justify-center text-slate-400 group-hover:bg-brand-blue group-hover:text-white transition-all group-hover:rotate-12 shrink-0">
                          <ArrowUpRight className="w-4 h-4" />
                       </Link>
                    </motion.div>
                 ))}
                 {recentReleases.length === 0 && (
                   <div className="py-16 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 shadow-inner">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                         <Music className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Tracks Yet</p>
                      <Link to="/dashboard/upload" className="inline-block mt-4 text-[10px] text-brand-blue font-bold uppercase tracking-widest underline underline-offset-4 hover:text-brand-purple">Upload your first hit</Link>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </FadeIn>
  );
}

