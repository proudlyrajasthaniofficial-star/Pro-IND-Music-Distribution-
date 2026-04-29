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
  ShieldCheck
} from "lucide-react";
import { formatCurrency, cn } from "../../lib/utils";
import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from "motion/react";
import { FadeIn } from "../../components/ui/FadeIn";

export default function Overview() {
  const { user, profile, isAdmin } = useAuth();
  const [recentReleases, setRecentReleases] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, live: 0, pending: 0, rejected: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [systemNotifications, setSystemNotifications] = useState<any[]>([]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const qNews = query(collection(db, "system_notifications"), orderBy("createdAt", "desc"), limit(3));
    const unsubNews = onSnapshot(qNews, (snap) => {
      setSystemNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    if (!user) return;
    setError(null);

    // Fetch Recent Releases (Real-time)
    const qRecent = query(
      collection(db, "releases"), 
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(4)
    );
    const unsubRecent = onSnapshot(qRecent, (snap) => {
      setRecentReleases(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Fetch All Releases for stats (Real-time)
    const qAll = query(collection(db, "releases"), where("userId", "==", user.uid));
    const unsubAll = onSnapshot(qAll, (snap) => {
      const allData = snap.docs.map(d => d.data());
      setStats({
        total: allData.length,
        live: allData.filter((r: any) => r.status === 'live').length,
        pending: allData.filter((r: any) => r.status === 'pending' || r.status === 'approved').length,
        rejected: allData.filter((r: any) => r.status === 'rejected').length
      });
    });

    // Fetch Earnings for Chart
    const qEarnings = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      where("type", "==", "earning"),
      orderBy("createdAt", "asc")
    );
    const unsubEarnings = onSnapshot(qEarnings, (snap) => {
      const earningsByDay: Record<string, number> = {};
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString('en-US', { weekday: 'short' });
      }).reverse();

      last7Days.forEach(day => earningsByDay[day] = 0);

      snap.docs.forEach(doc => {
        const data = doc.data();
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
    });

    return () => {
      unsubNews();
      unsubRecent();
      unsubAll();
      unsubEarnings();
    };
  }, [user]);

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

        {isAdmin && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-brand-purple text-white p-6 rounded-[2rem] flex items-center justify-between shadow-2xl shadow-purple-500/20"
          >
            <div className="flex items-center gap-6 text-left">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="font-black uppercase tracking-tighter text-lg leading-tight text-left">Administrative Privilege Detected</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">You have full authority over the distribution network</p>
              </div>
            </div>
            <Link to="/admin" className="px-8 py-3 bg-white text-brand-purple rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-lg">
              Enter Admin Portal
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
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 md:gap-8 px-4 md:px-0">
          <div className="text-left">
            <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight mb-2 uppercase flex flex-wrap items-center gap-2 md:gap-4">
              Welcome, <span className="text-brand-blue">{profile?.displayName?.split(" ")[0]}</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 font-medium mb-6">Your global music empire is scaling. Here's your mission control.</p>
            
            {/* Plan Info Tag */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-slate-900 text-white rounded-xl flex items-center gap-2 group cursor-pointer hover:bg-slate-800 transition-colors">
                <ShieldCheck className="w-4 h-4 text-brand-blue" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                  Plan: {profile?.planId ? profile.planId.toUpperCase() : 'FREE'}
                </span>
              </div>
              <Link to="/pricing" className="text-[10px] font-black uppercase tracking-widest text-brand-blue hover:underline">
                Upgrade Plan
              </Link>
            </div>
          </div>
          
          <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] shadow-2xl border border-slate-100 flex items-center gap-4 md:gap-8 group">
             <div className="w-10 h-10 md:w-16 md:h-16 bg-emerald-500/10 rounded-xl md:rounded-[2rem] flex items-center justify-center text-emerald-500 shrink-0">
                <Wallet className="w-5 h-5 md:w-8 md:h-8" />
             </div>
             <div>
                <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-0.5 md:mb-1 whitespace-nowrap">Treasury Balance</p>
                <h2 className="text-xl md:text-4xl font-black font-display tracking-tight group-hover:scale-105 transition-transform origin-left whitespace-nowrap">
                  {formatCurrency(profile?.walletBalance || 0)}
                </h2>
             </div>
             <Link to="/dashboard/wallet" className="w-8 h-8 md:w-12 md:h-12 bg-slate-950 text-white rounded-lg md:rounded-2xl flex items-center justify-center hover:bg-brand-blue transition-all ml-auto">
                <ArrowUpRight className="w-4 h-4 md:w-6 md:h-6" />
             </Link>
          </div>
        </div>

        {/* 3D Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[
             { label: "Upload Music", icon: Plus, path: "/dashboard/upload", color: "bg-brand-blue shadow-blue-500/40" },
             { label: "My Releases", icon: Music, path: "/dashboard/releases", color: "bg-slate-900 shadow-slate-900/40" },
             { label: "Withdraw Funds", icon: Wallet, path: "/dashboard/wallet", color: "bg-emerald-500 shadow-emerald-500/40" },
             { label: "Artist Profile", icon: User, path: "/dashboard/artists", color: "bg-brand-purple shadow-purple-500/40" },
           ].map((btn, i) => (
             <Link 
               key={i} 
               to={btn.path}
               className={cn(
                 "relative h-24 rounded-[2rem] flex items-center p-6 text-white font-black font-display tracking-wider uppercase text-xs overflow-hidden group transition-all transform hover:-translate-y-2 active:translate-y-0 shadow-lg group-hover:shadow-2xl",
                 btn.color
               )}
             >
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform">
                   <btn.icon className="w-24 h-24" />
                </div>
                <div className="relative z-10 flex items-center gap-4">
                   <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <btn.icon className="w-5 h-5" />
                   </div>
                   {btn.label}
                </div>
             </Link>
           ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
           {/* Analytics Mini View */}
           <div className="lg:col-span-2 bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] shadow-sm border border-slate-100 flex flex-col gap-6 md:gap-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <h3 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-4">
                    <TrendingUp className="text-brand-blue w-6 h-6 md:w-8 md:h-8" /> EARNINGS TREND
                 </h3>
                 <div className="self-start sm:self-auto px-4 py-1.5 bg-emerald-100 rounded-full flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">+12.4% vs last mo</span>
                 </div>
              </div>
              
              <div className="h-[220px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="miniChart" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0066FF" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                      <YAxis hide domain={['dataMin', 'dataMax + 10']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                        labelStyle={{ fontWeight: 800, color: '#111' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#0066FF" strokeWidth={5} fillOpacity={1} fill="url(#miniChart)" animationDuration={2000} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>

              <div className="pt-4 border-t border-slate-50">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 italic">Active Distribution Network</p>
                 <div className="flex flex-wrap items-center gap-10">
                    {[
                      { name: "Facebook", logo: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiT4AraHOBV5Z8hsEFIqSk-x4MH9Bq6HCvLcVy0BdUZfa05thWfnrXvS27CHv14oSQ9WCyahaXNoBChRgJ3B8GzDPOqUBKegOqo6bSIgxEHPq8-pDoIMidDxRzhN1Dbcp9AYtrpLOiOvvOlxVaTwmOKUWYfhLt0kKe0MSVwbsxM4W9tIH6Q_QXebieY-FQ/s225/1000625038.png" },
                      { name: "YouTube Content ID", logo: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjQEP7K3_JFRWDwHOwB8zvSzwDvb2FHws9aZTtxDlOecHoh4acgXA58jJcJ0SuuJhc0Ins6RGcvL6fM-rXYv7Wzp1t-cYfu6Y35xqKmLDgasn-vadrwvlaMxvP4s-7udpvsgbIUu02xGVfgV8rgPHIsj3UvKRIYgXS9oXKFhLDBZvVlFQbkU6Z49rSEfw8/s390/1000625039.png" },
                      { name: "YouTube Music", logo: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhCBvvdrkwgOYchq85w_ntr8jgL_VnWuHbXE8D5xktwlb1RkHQKPEKu25m3pPXULu9r5ZkqUbmjZGh5hjBm-9e8SXeazxM-0_5gyItH6czSh3ZvtFewhHB-pRDvVoJv8lw11Z3qMmVj9TnCA6-hUkLF9yGJR2QdRUe-B9e0r4FHTRgV2sr_UHr6VfekCHM/s900/1000625040.jpg" },
                      { name: "YouTube", logo: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgEVQjuWWqit8Sb75qVR7lk36_4Lp5rbYYskV1-p07lnQWiUk1KG2biUAN_Bp-36oaOQk33_x7AuGhL416wD5eFjgk0DHapjlHQooqqJzgYZervYA6_ckhFqJNnNeYrhsQLBbXcTH8eqdw5enYkNO_xLZn2My_uYVTtStDAzjWmuCUOwzy02QVlB0THYHw/s225/1000625041.png" },
                      { name: "Apple Music", logo: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjzohmzK39V2QK71HU443ccu-WGjXmGGStVl0E_uUG2xGCaKtjWWHE0r0yvetl7SxWNPUYYc7tHb_bTqL7gRgeQhIG7_e0M4mJdeh1tXR7LVKMfDSrKJdjH9fBk2GEuVsxOJ9VfEv_OsW-TNSuzsOIi-dRVd_g5WlL1Fmc1l-CEko4pcRT8lxUR72ipzJM/s554/1000625034.jpg" },
                      { name: "Wynk", logo: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj_8gQQpLDy3RYSgfgDsIglEijRKzfxWtmFrElw25N-b6nRFyM512Na6GN8kFJ_HGDzQy04Uob9hg0OZW_csKFekqMq2w89cSrrE9mdxvH4CWqsK3YNC6_ZQwoULGocxy37eDAh8droYGb7d6eolS6aZ2MAdmLXQAzESaJIHOApjTDVXQfbVsmG8qhb1tc/s259/1000625035.png" },
                      { name: "Snapchat", logo: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjnmd1cJShVfhlnQhlwgkW5oBjz_wNUc-j0SgdDJ9Rm8rnPDZNL7gY1sww99LLCOTZ4BBEXVe7Qs_eJEk3s0uRl5k7IQutxtQbx3kWIZCT7N-p5HajRaCcbXDoj_SXaixa5GFhktXabHzy9UONMF3F80n4DDVFE0mZMGif6kULL8LigW1TTRUgCvHiBXec/s210/1000625036.png" },
                      { name: "Instagram", logo: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhE0GzAMMtOcf7clhoWZr5xY9cY1EYjqYtZMYl-ndVMiBbr64GCJGX46ShXVTWfky_FNQSnyfMkGXgsgiVrqT67qi2N0uWerrZZt1A3rdaMuEVAx46XgQNiERKWNKkDK1H4bSj9AmZdYluYwpnD-c1AX4IFrnmhEDZMIfy93NFX92fH0RngdU0D9tBR83Y/s225/1000625037.jpg" },
                      { name: "Spotify", logo: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEidEVJ6vlUjuTbfUY6oSdwxTadADIm1bzHDcD4L1xAnknuUiO6dTbu6mKc0pyBq-QOFDtnh9sJe1QEMyKBu_eWUH8kLoy2x_vnsp3cQ8pH297d6kMTvig8TgBDpo55BhwbZds0DLuGn4XwNylIeXn3EwubOnw-k-nFIzpiuTPBEbhj7ZsLSCRMOrrylpQQ/s225/1000625032.png" },
                      { name: "JioSaavn", logo: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhk0sfcoYPosDFUis2uzahyD1tQD1T2GC_V9ywhvgxtJvVHORzjzhOM83PAT1GhHF9GiXPUwoxAUEXhvGmCE0ofUJz_FGvRNAegRWecVjsF0eXdq-y_7-W90H9NXe4fJTVG6N6Bb71PeZPx6dQZOFjzJyHFGj-UsrhyPNSFLYX6En0NzYDoSlthT1G6224/s160/1000625033.png" }
                    ].map((p, i) => (
                      <motion.img 
                        key={i}
                        whileHover={{ scale: 1.3, y: -5, rotate: 5 }}
                        src={p.logo} 
                        alt={p.name}
                        title={p.name}
                        className="h-8 md:h-12 w-auto transition-all cursor-pointer drop-shadow-md"
                        referrerPolicy="no-referrer"
                      />
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pt-6">
                 {[
                   { label: "Live", count: stats.live, color: "bg-emerald-500" },
                   { label: "Pending", count: stats.pending, color: "bg-brand-blue" },
                   { label: "Rejected", count: stats.rejected, color: "bg-rose-500" },
                 ].map((item, i) => (
                   <div key={i} className="p-3 md:p-6 bg-slate-50 rounded-xl md:rounded-[2rem] flex flex-col gap-1 md:gap-2">
                      <div className={cn("w-1.5 h-1.5 md:w-2 md:h-2 rounded-full mb-1", item.color)}></div>
                      <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</p>
                      <p className="text-lg md:text-2xl font-black font-display">{item.count}</p>
                   </div>
                 ))}
              </div>
           </div>

           {/* Recent Releases Visual List */}
           <div className="space-y-8">
              <div className="flex items-center justify-between">
                 <h3 className="text-2xl font-black font-display tracking-tight uppercase">Recent Releases</h3>
                 <Link to="/dashboard/releases" className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue hover:underline">Full Catalog</Link>
              </div>

              <div className="space-y-6">
                 {recentReleases.map((release, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex items-center gap-6 group hover:shadow-2xl transition-all"
                    >
                       <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg group-hover:rotate-3 transition-transform">
                          <img src={release.coverUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 tracking-tight truncate">{release.title}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{release.artist}</p>
                          <div className="flex items-center gap-2 mt-3">
                             <div className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                release.status === 'live' ? "bg-emerald-500" : "bg-amber-500"
                             )}></div>
                             <span className={cn(
                               "text-[9px] font-black uppercase tracking-widest",
                               release.status === 'live' ? "text-emerald-500" : "text-amber-500"
                             )}>{release.status}</span>
                          </div>
                       </div>
                       <button className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 hover:text-brand-blue transition-colors">
                          <ArrowUpRight className="w-5 h-5" />
                       </button>
                    </motion.div>
                 ))}
                 {recentReleases.length === 0 && (
                   <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                      <Music className="w-10 h-10 mx-auto mb-4 text-slate-300" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No music found.</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </FadeIn>
  );
}
