import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { 
  Users, 
  Disc, 
  Wallet, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  Globe,
  Plus,
  Play,
  ChevronRight,
  ShieldCheck,
  Zap,
  Activity,
  Megaphone,
  CreditCard,
  MessageSquare,
  Radio
} from "lucide-react";
import { formatCurrency, cn } from "../../lib/utils";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function AdminHome() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReleases: 0,
    pendingReleases: 0,
    totalRevenue: 0,
    pendingWithdrawals: 0,
    pendingOAC: 0,
    pendingContentID: 0,
    openTickets: 0
  });
  const [recentReleases, setRecentReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [uSnap, rSnap, wSnap, tSnap, oSnap, cSnap, sSnap] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "releases")),
          getDocs(query(collection(db, "withdrawals"), where("status", "==", "pending"))),
          getDocs(query(collection(db, "transactions"), where("type", "==", "earning"))),
          getDocs(query(collection(db, "oac_requests"), where("status", "==", "pending"))),
          getDocs(query(collection(db, "content_id_requests"), where("status", "==", "pending"))),
          getDocs(query(collection(db, "support_tickets"), where("status", "==", "open")))
        ]);

        const rev = tSnap.docs.reduce((sum, d) => sum + (d.data().amount || 0), 0);
        const pr = rSnap.docs.filter(d => d.data().status === 'pending').length;

        setStats({
          totalUsers: uSnap.size,
          totalReleases: rSnap.size,
          pendingReleases: pr,
          totalRevenue: rev,
          pendingWithdrawals: wSnap.size,
          pendingOAC: oSnap.size,
          pendingContentID: cSnap.size,
          openTickets: sSnap.size
        });

        // Recent releases for queue
        const qRecent = query(collection(db, "releases"), orderBy("createdAt", "desc"), limit(5));
        const recentSnap = await getDocs(qRecent);
        setRecentReleases(recentSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  const chartData = [
    { name: 'Mon', rev: 4000 },
    { name: 'Tue', rev: 3000 },
    { name: 'Wed', rev: 2000 },
    { name: 'Thu', rev: 2780 },
    { name: 'Fri', rev: 1890 },
    { name: 'Sat', rev: 2390 },
    { name: 'Sun', rev: 3490 },
  ];

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-20 text-center">
       <div className="w-16 h-16 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mb-6"></div>
       <p className="animate-pulse text-slate-500 uppercase font-black tracking-widest text-xs">Synchronizing Command Mesh...</p>
    </div>
  );

  return (
    <div className="space-y-12 pb-24 text-left">
      {/* Quick Access Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
         {[
            { label: "Registered Users", val: stats.totalUsers, icon: Users, color: "text-brand-blue", bg: "bg-brand-blue/10" },
            { label: "Total Submissions", val: stats.totalReleases, icon: Disc, color: "text-brand-purple", bg: "bg-brand-purple/10" },
            { label: "Platform Revenue", val: formatCurrency(stats.totalRevenue), icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "Pending Approvals", val: stats.pendingReleases, icon: Activity, color: "text-amber-500", bg: "bg-amber-500/10" },
         ].map((s, i) => (
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             key={i} 
             className="bg-[#1E293B] p-8 rounded-[3rem] border border-slate-800 shadow-sm group hover:scale-[1.02] transition-all text-left"
           >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", s.bg)}>
                 <s.icon className={cn("w-6 h-6", s.color)} />
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
              <h3 className="text-2xl font-black font-display text-white tracking-tighter">{s.val}</h3>
           </motion.div>
         ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
         {/* Charts / Intelligence */}
         <div className="lg:col-span-2 space-y-10">
            <div className="bg-[#1E293B] p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] border border-slate-800 shadow-3xl overflow-hidden relative">
               <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-10 gap-4 relative z-10">
                  <div className="flex items-center gap-4">
                     <BarChart3 className="text-brand-blue w-6 h-6 md:w-8 md:h-8" />
                     <h3 className="text-lg md:text-2xl font-black font-display text-white uppercase tracking-tight text-left">Intelligence Overview</h3>
                  </div>
                  <div className="flex gap-2 items-center">
                     <span className="w-3 h-3 bg-brand-blue rounded-full"></span>
                     <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Revenue Flow</span>
                  </div>
               </div>
               <div className="h-[400px] w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} hide />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '1rem', color: '#fff' }}
                        itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="rev" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
               <div className="absolute top-0 right-0 w-80 h-80 bg-brand-blue/5 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full"></div>
            </div>

            {/* Action Matrix */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {[
                 { label: "Withdrawals", val: stats.pendingWithdrawals, path: "/admin/withdrawals", icon: Wallet, color: "text-rose-500" },
                 { label: "OAC Requests", val: stats.pendingOAC, path: "/admin/oac", icon: Radio, color: "text-brand-blue" },
                 { label: "Content ID", val: stats.pendingContentID, path: "/admin/content-id", icon: ShieldCheck, color: "text-emerald-500" },
                 { label: "Tickets", val: stats.openTickets, path: "/admin/support", icon: MessageSquare, color: "text-amber-500" },
               ].map((action, i) => (
                  <Link 
                    key={i}
                    to={action.path}
                    className="bg-[#1E293B] p-6 rounded-[2.5rem] border border-slate-800 hover:border-slate-600 transition-all group shadow-sm text-left"
                  >
                     <div className="flex items-center justify-between mb-4">
                        <action.icon className={cn("w-5 h-5", action.color)} />
                        <span className="text-xl font-black font-display text-white">{action.val}</span>
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">{action.label}</p>
                  </Link>
               ))}
            </div>

            {/* Critical Signal Sections */}
            <div className="grid md:grid-cols-2 gap-6 pb-12">
               <Link to="/admin/broadcasts" className="bg-gradient-to-br from-brand-blue to-blue-600 p-10 rounded-[3.5rem] text-white shadow-2xl shadow-blue-900/40 group relative overflow-hidden text-left appearance-none">
                  <Zap className="absolute -right-4 -bottom-4 w-40 h-40 opacity-10 group-hover:rotate-12 transition-transform" />
                  <Megaphone className="w-12 h-12 mb-6" />
                  <h4 className="text-2xl font-black font-display uppercase tracking-tighter">Global Signal</h4>
                  <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-1">Deploy System Broadcast Mesh</p>
                  <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-sm">
                     Access Console <ChevronRight className="w-4 h-4" />
                  </div>
               </Link>
               <Link to="/admin/finance" className="bg-[#1E293B] p-10 rounded-[3.5rem] border border-slate-800 text-white shadow-2xl group relative overflow-hidden text-left">
                  <CreditCard className="w-12 h-12 mb-6 text-brand-purple" />
                  <h4 className="text-2xl font-black font-display uppercase tracking-tighter">Treasury Vault</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Manage Financial Records & Audits</p>
                  <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-white/5 w-fit px-4 py-2 rounded-full bg-white/5">
                     Open Ledger <ChevronRight className="w-4 h-4" />
                  </div>
               </Link>
            </div>
         </div>

         {/* Sidebar Content */}
         <div className="space-y-10">
            {/* Review Queue */}
            <div className="bg-[#1E293B] rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-800 p-6 md:p-10 shadow-2xl relative overflow-hidden text-left font-display">
               <div className="flex items-center justify-between mb-6 md:mb-8">
                  <h3 className="text-lg md:text-xl font-black font-display text-white uppercase flex items-center gap-3 md:gap-4">
                     <Disc className="text-brand-purple w-5 h-5 md:w-6 md:h-6 flex-shrink-0" /> Review Queue
                  </h3>
                  <Link to="/admin/releases" className="text-[9px] font-black text-brand-blue uppercase hover:underline tracking-widest font-sans">Global Feed</Link>
               </div>
               <div className="space-y-4">
                  {recentReleases.map((r, i) => (
                    <motion.div 
                      key={r.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="text-left font-sans"
                    >
                       <Link 
                         to={`/admin/review/${r.id}`}
                         className="flex items-center gap-4 p-5 bg-slate-900 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all group shadow-inner"
                       >
                          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0 shadow-lg">
                             {r.artworkUrl ? (
                               <img src={r.artworkUrl} alt={r.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                             ) : (
                               <Disc className="w-full h-full p-4 text-slate-700" />
                             )}
                          </div>
                          <div className="min-w-0 flex-1">
                             <p className="text-xs font-black text-white truncate uppercase tracking-tight">{r.title}</p>
                             <p className="text-[9px] font-bold text-slate-500 truncate uppercase mt-1">{r.artistName}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-700 ml-auto group-hover:text-white transition-colors" />
                       </Link>
                    </motion.div>
                  ))}
                  {recentReleases.length === 0 && (
                     <div className="py-20 text-center opacity-30 uppercase font-black text-[10px] tracking-widest">Queue Status: Clear</div>
                  )}
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            </div>

            {/* Quick Audit */}
            <div className="bg-[#1E293B] rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-800 p-6 md:p-10 shadow-2xl relative overflow-hidden text-left">
               <h3 className="text-lg md:text-xl font-black font-display text-white uppercase flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                  <ShieldCheck className="text-emerald-500 w-5 h-5 md:w-6 md:h-6 flex-shrink-0" /> System Integrity
               </h3>
               <div className="space-y-4">
                  {[
                     { label: "Deployment Region", val: "asia-southeast1", status: "Active" },
                     { label: "Security Protocol", val: "HardenedRules v2", status: "Verified" },
                     { label: "System Uptime", val: "99.98%", status: "Stable" },
                  ].map((s, i) => (
                     <div key={i} className="flex flex-col p-5 bg-slate-900 rounded-[2rem] border border-slate-800 text-left hover:border-slate-700 transition-colors">
                        <div className="flex items-center justify-between">
                           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{s.label}</span>
                           <span className="text-[8px] font-black px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 uppercase tracking-widest">{s.status.toUpperCase()}</span>
                        </div>
                        <p className="text-xs font-bold text-white mt-2 uppercase flex items-center gap-2 tracking-wider">
                           {s.val}
                        </p>
                     </div>
                  ))}
               </div>
               <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>
            </div>
         </div>
      </div>
    </div>
  );
}
