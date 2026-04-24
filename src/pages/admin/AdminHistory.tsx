import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { 
  History, 
  Activity, 
  Clock, 
  Calendar,
  Layers,
  Zap,
  ArrowUpRight,
  TrendingUp,
  FileText,
  Search
} from "lucide-react";
import { formatCurrency, cn } from "../../lib/utils";
import { motion } from "motion/react";

export default function AdminHistory() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Combine transactions and notifications for a "System History" view
      const tSnap = await getDocs(query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(50)));
      const tLogs = tSnap.docs.map(d => ({ id: d.id, ...d.data(), logType: 'transaction' }));

      const nSnap = await getDocs(query(collection(db, "system_notifications"), orderBy("createdAt", "desc"), limit(20)));
      const nLogs = nSnap.docs.map(d => ({ id: d.id, ...d.data(), logType: 'broadcast' }));

      const combined = [...tLogs, ...nLogs].sort((a: any, b: any) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );

      setLogs(combined);
    } catch (e) {
      console.error("Error fetching logs:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l => 
    (l.userId || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.title || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12 pb-24 text-left">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
         <div className="space-y-2">
            <h1 className="text-5xl font-black font-display tracking-tight uppercase text-white">System <span className="text-brand-purple">Log</span></h1>
            <p className="text-slate-400 font-medium text-xs uppercase tracking-widest ">Comprehensive audit trail of global financial and system operations.</p>
         </div>

         <div className="flex items-center gap-4 bg-[#1E293B] p-2 pl-6 rounded-[2.5rem] border border-slate-800 shadow-2xl w-full lg:w-auto">
            <Search className="w-5 h-5 text-slate-500" />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter by ID or title..."
              className="bg-transparent border-none focus:ring-0 text-sm font-bold text-white flex-1 min-w-[250px] outline-none"
            />
         </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            {filteredLogs.map((log, i) => (
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: i * 0.05 }}
                 key={log.id}
                 className="bg-[#1E293B] p-8 rounded-[3rem] border border-slate-800 flex items-center justify-between group hover:border-slate-700 transition-all font-sans"
               >
                  <div className="flex items-center gap-6">
                     <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                        log.logType === 'transaction' ? "bg-emerald-500/10 text-emerald-500" : "bg-brand-blue/10 text-brand-blue"
                     )}>
                        {log.logType === 'transaction' ? <Zap className="w-6 h-6" /> : <Layers className="w-6 h-6" />}
                     </div>
                     <div className="text-left">
                        <div className="flex items-center gap-3">
                           <p className="text-xs font-black text-white uppercase tracking-tight">
                             {log.logType === 'transaction' ? (log.type === 'earning' ? 'Financial Credit' : 'Financial Debit') : 'System Broadcast'}
                           </p>
                           <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
                           <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-300 mt-1 uppercase tracking-wider line-clamp-1">
                           {log.logType === 'transaction' ? (log.description || `${log.type} request`) : log.title}
                        </h4>
                        <p className="text-[9px] font-mono text-slate-600 mt-1 uppercase">Ref: {log.id}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     {log.logType === 'transaction' && (
                        <p className={cn(
                           "text-xl font-black font-display font-sans",
                           log.type === 'earning' ? "text-emerald-500" : "text-rose-500"
                        )}>
                           {log.type === 'earning' ? '+' : '-'}{formatCurrency(log.amount)}
                        </p>
                     )}
                     {log.logType === 'broadcast' && (
                        <span className="px-4 py-1.5 rounded-full bg-brand-blue/5 border border-brand-blue/20 text-[9px] font-black text-brand-blue uppercase tracking-widest">
                           SIGNAL
                        </span>
                     )}
                  </div>
               </motion.div>
            ))}
            {filteredLogs.length === 0 && !loading && (
               <div className="py-24 text-center bg-slate-900/50 rounded-[4rem] border-2 border-dashed border-slate-800">
                  <Activity className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Historical records not found in current sector.</p>
               </div>
            )}
         </div>

         <div className="space-y-6 text-left">
            <div className="bg-[#1E293B] p-10 rounded-[3rem] border border-slate-800 shadow-3xl text-left font-display">
               <h3 className="text-xl font-black font-display text-white mb-6 uppercase">AUDIT OVERVIEW</h3>
               <div className="space-y-4 font-sans">
                  {[
                     { label: "Financial Events", val: logs.filter(l => l.logType === 'transaction').length, color: "text-emerald-500" },
                     { label: "Broadcast Events", val: logs.filter(l => l.logType === 'broadcast').length, color: "text-brand-blue" },
                     { label: "Retention Window", val: "30 Days", color: "text-slate-400" },
                  ].map((s, i) => (
                     <div key={i} className="flex items-center justify-between p-5 bg-slate-900/50 rounded-2xl border border-slate-800">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</span>
                        <span className={cn("text-xs font-black", s.color)}>{s.val}</span>
                     </div>
                  ))}
               </div>
            </div>
            
            <div className="bg-brand-purple p-10 rounded-[3rem] text-white shadow-2xl shadow-purple-900/40 relative overflow-hidden group">
               <History className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:rotate-12 transition-transform" />
               <h3 className="text-xl font-black font-display uppercase mb-2">Immutable Protocol</h3>
               <p className="text-[10px] font-bold opacity-70 uppercase leading-relaxed">System logs are maintained for security audits and cannot be modified via administrative interfaces. Financial records are synchronized with database state.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
