import React, { useEffect, useState, useMemo } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp,
  FileBarChart,
  Table as TableIcon,
  Music,
  Map,
  ArrowUpRight
} from "lucide-react";
import { formatCurrency, cn, formatDate } from "../../lib/utils";
import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { toast } from "sonner";

export default function Reports() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const qEntries = query(collection(db, "royalty_entries"), where("userId", "==", user.uid));
        const snapEntries = await getDocs(qEntries);
        setEntries(snapEntries.docs.map(d => ({ id: d.id, ...d.data() })));

        const qReports = query(collection(db, "royalty_reports"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
        const snapReports = await getDocs(qReports);
        setReports(snapReports.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "royalty_entries");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const stats = useMemo(() => {
    const total = entries.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
    const streams = entries.reduce((acc, curr) => acc + (curr.streams || 0), 0);
    
    // Group by platform
    const platformMap: Record<string, number> = {};
    entries.forEach(e => {
      platformMap[e.platform] = (platformMap[e.platform] || 0) + (e.revenue || 0);
    });
    
    const topPlatform = Object.entries(platformMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    return { total, streams, topPlatform };
  }, [entries]);

  const chartData = useMemo(() => {
    // Basic aggregation for display
    return entries.slice(0, 10).map(e => ({
      name: e.isrc,
      amount: e.revenue
    }));
  }, [entries]);

  const handleDownload = (report: any) => {
    if (!report.fileData) {
      toast.error("Official source document unavailable for this historical cycle.");
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = report.fileData;
      // Use the stored filename or generate a logical fallback
      const cleanPeriod = report.period.replace(/\s+/g, '_');
      link.download = report.fileName || `Royalty_Report_${cleanPeriod}_${report.source}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Source document retrieved from vault.");
    } catch (err) {
      console.error("Download Error:", err);
      toast.error("Transmission failed during file extraction.");
    }
  };

  if (loading) return <div className="p-10 animate-pulse text-slate-400 font-black uppercase text-[10px] tracking-widest">Aggregating Financial Pulse...</div>;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
         <div className="text-left">
            <h1 className="text-4xl md:text-6xl font-black font-display tracking-tighter uppercase leading-none">
              Royalty <span className="text-brand-blue">Vault</span>
            </h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-4">Enterprise Financial Analytics Feed</p>
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "Lifetime Earnings", value: formatCurrency(stats.total), icon: TrendingUp, color: "text-emerald-400" },
          { label: "Total Stream Count", value: stats.streams.toLocaleString(), icon: Music, color: "text-cyan-400" },
          { label: "Primary Platform", value: stats.topPlatform, icon: Map, color: "text-brand-blue" },
          { label: "Reports Issued", value: reports.length, icon: Calendar, color: "text-rose-400" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#1E293B] border border-white/5 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <stat.icon className={cn("w-5 h-5 md:w-6 md:h-6", stat.color)} />
                <span className="text-[8px] md:text-[9px] font-black uppercase text-slate-500 tracking-[0.2em]">{stat.label}</span>
              </div>
              <p className="text-xl md:text-2xl font-black text-white font-display tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
         <div className="lg:col-span-2 space-y-6 md:space-y-10">
            {/* Published Reports Feed */}
            <div className="bg-[#1E293B] p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-white/5 shadow-2xl space-y-6 md:space-y-10">
               <h3 className="text-lg md:text-2xl font-black font-display uppercase tracking-tight flex items-center gap-4 text-left text-white">
                  <FileBarChart className="w-6 h-6 md:w-8 md:h-8 text-brand-blue" /> PUBLISHED CYCLES
               </h3>
               
               <div className="space-y-4">
                  {reports.length === 0 ? (
                    <div className="p-12 md:p-20 text-center border-2 border-dashed border-white/5 rounded-[2rem] md:rounded-[3rem] text-slate-600 font-bold uppercase tracking-widest text-[8px] md:text-[10px]">
                       No finalized reports detected in vault
                    </div>
                  ) : (
                    reports.map(report => (
                      <div key={report.id} className="p-4 md:p-8 bg-slate-900/50 border border-white/5 rounded-2xl md:rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 hover:border-brand-blue/30 transition-all text-left group">
                         <div className="flex items-center gap-4 md:gap-6">
                            <div className="w-10 h-10 md:w-14 md:h-14 bg-brand-blue/10 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:bg-brand-blue transition-all shrink-0">
                               <Calendar className="text-brand-blue w-5 h-5 md:w-6 md:h-6 group-hover:text-white transition-all" />
                            </div>
                            <div className="min-w-0">
                               <p className="text-[10px] md:text-xs font-black text-white uppercase tracking-tight truncate">{report.reportName || "Standard Cycle Report"}</p>
                               <div className="flex items-center gap-3 md:gap-4 mt-1">
                                  <span className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{report.period}</span>
                                  <span className="text-[8px] md:text-[9px] font-black text-brand-blue uppercase tracking-widest whitespace-nowrap">{report.source}</span>
                               </div>
                            </div>
                         </div>
                         <div className="flex items-center justify-between md:justify-end gap-4 md:gap-10 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                            <div className="text-left md:text-right">
                               <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Cycle Earnings</p>
                               <p className="text-xl md:text-2xl font-black text-emerald-400 font-mono">{formatCurrency(report.totalRevenue || 0)}</p>
                            </div>
                            <button 
                               onClick={() => handleDownload(report)}
                               className="p-3 md:p-4 bg-white/5 text-white rounded-xl hover:bg-brand-blue hover:text-white transition-all shadow-lg active:scale-95 group/btn"
                             >
                               <Download className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            </button>
                         </div>
                      </div>
                    ))
                  )}
               </div>
            </div>
         </div>

         <div className="space-y-6 md:space-y-8">
            <div className="bg-brand-blue p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] text-white space-y-8 md:space-y-10 shadow-3xl relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-white/10 to-transparent opacity-40"></div>
               <div className="relative z-10 space-y-8 md:space-y-10">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-xl rounded-xl md:rounded-2xl flex items-center justify-center border border-white/20">
                        <TrendingUp className="w-6 h-6 md:w-8 md:h-8" />
                     </div>
                     <h4 className="text-xl md:text-2xl font-black font-display uppercase tracking-tighter leading-none">Vault <br/> Intelligence</h4>
                  </div>
                  
                  <div className="space-y-6 md:space-y-8">
                     <div>
                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Aggregate Life-Earnings</p>
                        <p className="text-3xl md:text-5xl font-black font-display tracking-tight text-white font-mono break-all">{formatCurrency(stats.total)}</p>
                     </div>
                     <div className="flex items-center justify-between p-4 md:p-6 bg-white/5 rounded-2xl border border-white/10">
                        <div>
                          <p className="text-[8px] md:text-[9px] font-black uppercase text-white/40 mb-1">Grid Efficiency</p>
                          <p className="text-lg md:text-xl font-black">99.8%</p>
                        </div>
                        <FileBarChart className="w-6 h-6 md:w-8 md:h-8 text-white/20" />
                     </div>
                  </div>

                  <div className="pt-6 md:pt-8 border-t border-white/5 space-y-4">
                     <div className="flex items-center justify-between text-[9px] md:text-[11px] font-black uppercase tracking-widest text-white/60">
                        <span>Node Reach</span>
                        <span className="text-white">Active</span>
                     </div>
                     <div className="h-1.5 md:h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: "92%" }} className="h-full bg-white rounded-full" />
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-[#1E293B] p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 shadow-2xl space-y-6 md:space-y-8">
               <h4 className="text-lg md:text-xl font-black font-display uppercase tracking-tight text-white">System Feed</h4>
               <div className="space-y-4">
                  <div className="p-8 md:p-10 text-center border-2 border-dashed border-white/5 rounded-[1.5rem] md:rounded-[2rem]">
                     <p className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] leading-relaxed">Neural analysis of stream patterns in progress...</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
