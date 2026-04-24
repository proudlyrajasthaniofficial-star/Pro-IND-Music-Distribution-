import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, where, doc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, FileText, Plus, Search, CreditCard } from "lucide-react";
import { formatCurrency, cn } from "../../lib/utils";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

export default function AdminFinance() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPayouts: 0,
    pendingWithdrawals: 0,
    lastMonthGrowth: 0
  });
  const [pendingWithdrawals, setPendingWithdrawals] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinanceData = async () => {
      setLoading(true);
      try {
        // Fetch stats from transactions (completed ones)
        const tSnap = await getDocs(collection(db, "transactions"));
        const tData = tSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

        const rev = tData.filter(t => t.type === 'earning').reduce((sum, t) => sum + (t.amount || 0), 0);
        const payouts = tData.filter(t => t.type === 'withdrawal' && t.status === 'completed').reduce((sum, t) => sum + (t.amount || 0), 0);

        // Fetch pending withdrawals from dedicated collection
        const wSnap = await getDocs(query(collection(db, "withdrawals"), where("status", "==", "pending")));
        const pendingData = wSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        setStats({
          totalRevenue: rev,
          totalPayouts: payouts,
          pendingWithdrawals: pendingData.length,
          lastMonthGrowth: 0
        });

        setPendingWithdrawals(pendingData);
        
        const recent = query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(6));
        const recentSnap = await getDocs(recent);
        setRecentTransactions(recentSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("Error fetching finance data:", e);
      }
      setLoading(false);
    };
    fetchFinanceData();
  }, []);

  const approveWithdrawal = async (w: any) => {
    if (!confirm(`Approve liquidation of ${formatCurrency(w.amount)}?`)) return;
    try {
      const uRef = doc(db, "users", w.userId);
      const uSnap = await getDocs(query(collection(db, "users"), where("__name__", "==", w.userId)));
      const userData = uSnap.docs[0]?.data();
      
      if (!userData || (userData.walletBalance || 0) < w.amount) {
        alert("Integrity Failure: User balance insufficient for liquidation.");
        return;
      }

      await updateDoc(uRef, { 
        walletBalance: userData.walletBalance - w.amount,
        totalWithdrawn: (userData.totalWithdrawn || 0) + w.amount
      });
      await updateDoc(doc(db, "withdrawals", w.id), { status: 'approved', processedAt: new Date().toISOString() });
      await addDoc(collection(db, "transactions"), {
        userId: w.userId,
        amount: w.amount,
        type: 'withdrawal',
        status: 'completed',
        description: `Withdrawal Approved (${w.method})`,
        createdAt: new Date().toISOString()
      });

      alert("Liquidity successfully disbursed.");
      window.location.reload();
    } catch (err) {
      alert("Transmission Error");
    }
  };

  const [showUpload, setShowUpload] = useState(false);
  const [royaltyData, setRoyaltyData] = useState({ userId: "", amount: "", period: "" });

  const handleRoyaltyUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const uRef = doc(db, "users", royaltyData.userId);
      const uSnap = await getDocs(query(collection(db, "users"), where("__name__", "==", royaltyData.userId)));
      const userData = uSnap.docs[0]?.data();
      
      if (!userData) {
        alert("Target Identity Not Found");
        return;
      }

      const amt = parseFloat(royaltyData.amount);
      await updateDoc(uRef, { walletBalance: (userData.walletBalance || 0) + amt });
      await addDoc(collection(db, "royalty_reports"), {
        ...royaltyData,
        amount: amt,
        createdAt: new Date().toISOString()
      });
      await addDoc(collection(db, "transactions"), {
        userId: royaltyData.userId,
        amount: amt,
        type: 'earning',
        status: 'completed',
        description: `Royalty Credited: ${royaltyData.period}`,
        createdAt: new Date().toISOString()
      });

      alert("Royalties successfully credited.");
      setShowUpload(false);
      window.location.reload();
    } catch (err) {
      alert("Credit Failure");
    }
  };

  return (
    <div className="space-y-12 pb-24 text-left">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
         <div>
            <h1 className="text-5xl font-black font-display tracking-tight uppercase">Finance <span className="text-brand-purple">Treasury</span></h1>
            <p className="text-slate-400 font-medium text-xs uppercase tracking-widest mt-2">Global royalty oversight and payout processing console.</p>
         </div>
         <button 
           onClick={() => setShowUpload(true)}
           className="px-10 py-5 bg-emerald-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-900/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
         >
            <Plus className="w-5 h-5" /> BULK ROYALTY IMPORT
         </button>
      </div>

      {showUpload && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[300] flex items-center justify-center p-6 text-left">
           <div className="bg-[#1E293B] w-full max-w-xl rounded-[4rem] p-12 border border-slate-800 shadow-3xl">
              <h2 className="text-3xl font-black font-display uppercase text-white mb-10 text-left">Inject <span className="text-emerald-500 text-left">Royalties</span></h2>
              <form onSubmit={handleRoyaltyUpload} className="space-y-6">
                 <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Target User UID</label>
                    <input required value={royaltyData.userId} onChange={e => setRoyaltyData({...royaltyData, userId: e.target.value})} className="w-full bg-slate-900 border-none p-5 rounded-3xl text-sm font-bold text-white focus:ring-4 focus:ring-emerald-500/10 outline-none" />
                 </div>
                 <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Volume (INR)</label>
                    <input required type="number" value={royaltyData.amount} onChange={e => setRoyaltyData({...royaltyData, amount: e.target.value})} className="w-full bg-slate-900 border-none p-5 rounded-3xl text-3xl font-black text-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none" />
                 </div>
                 <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Cycle (e.g. MARCH 2024)</label>
                    <input required value={royaltyData.period} onChange={e => setRoyaltyData({...royaltyData, period: e.target.value})} className="w-full bg-slate-900 border-none p-5 rounded-3xl text-sm font-bold text-white focus:ring-4 focus:ring-emerald-500/10 outline-none" />
                 </div>
                 <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setShowUpload(false)} className="flex-1 py-5 bg-slate-800 text-slate-400 rounded-3xl font-black text-xs uppercase tracking-widest">Cancel</button>
                    <button type="submit" className="flex-1 py-5 bg-emerald-500 text-white rounded-3xl font-black text-xs uppercase tracking-widest">Deploy Credits</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
         {[
           { label: "Gross Platform Revenue", val: formatCurrency(stats.totalRevenue), icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
           { label: "Payouts Distributed", val: formatCurrency(stats.totalPayouts), icon: ArrowUpRight, color: "text-brand-blue", bg: "bg-brand-blue/10" },
           { label: "Pending Liquidations", val: stats.pendingWithdrawals, icon: Wallet, color: "text-amber-500", bg: "bg-amber-500/10" },
           { label: "Quarterly Delta", val: "+" + stats.lastMonthGrowth + "%", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
         ].map((s, i) => (
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: i * 0.1 }}
             key={i} 
             className="bg-[#1E293B] p-10 rounded-[3rem] border border-slate-800 transition-all hover:bg-slate-800/50 shadow-sm text-left"
           >
             <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6", s.bg)}>
               <s.icon className={cn("w-7 h-7", s.color)} />
             </div>
             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2 truncate">{s.label}</p>
             <h3 className="text-2xl lg:text-3xl font-black font-display tracking-tighter text-white">{s.val}</h3>
           </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="bg-[#1E293B] rounded-[3.5rem] border border-slate-800 p-12 space-y-8 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex items-center justify-between">
               <h3 className="text-2xl font-black font-display tracking-tight flex items-center gap-4 uppercase text-white">
                  <ArrowDownLeft className="text-amber-500 w-8 h-8" /> Pending Liquidations
               </h3>
               <Link to="/admin/withdrawals" className="text-[9px] font-black text-brand-blue uppercase tracking-widest hover:underline">Nexus View</Link>
            </div>
            <div className="space-y-4 relative z-10">
               {pendingWithdrawals.map((w, i) => (
                 <div key={i} className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-4 text-left">
                       <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-black text-xs text-brand-purple">W</div>
                       <div className="text-left">
                          <p className="font-bold text-white uppercase text-xs tracking-wider">{w.userName || 'Artist'}</p>
                          <p className="text-[10px] text-slate-500 mt-1 uppercase truncate max-w-[150px]">{w.method || 'BANK TRANSFER'}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xl font-black font-display text-white">{formatCurrency(w.amount)}</p>
                       <button 
                         onClick={() => approveWithdrawal(w)}
                         className="text-[9px] font-black text-brand-purple uppercase tracking-widest mt-2 hover:underline"
                       >
                         PROCESS NOW
                       </button>
                    </div>
                 </div>
               ))}
               {pendingWithdrawals.length === 0 && (
                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest py-10 text-center italic">No pending requests in transit.</p>
               )}
            </div>
         </div>

         <div className="bg-[#1E293B] rounded-[3.5rem] border border-slate-800 p-12 space-y-8 shadow-2xl relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex items-center justify-between">
               <h3 className="text-2xl font-black font-display tracking-tight flex items-center gap-4 uppercase text-white">
                  <FileText className="text-brand-blue w-8 h-8" /> Transaction Feed
               </h3>
               <Link to="/admin/history" className="text-[9px] font-black text-brand-blue uppercase tracking-widest hover:underline text-left">Full Log</Link>
            </div>
            <div className="space-y-4 relative z-10 text-left">
               {recentTransactions.map((t, i) => (
                 <div key={i} className="px-6 py-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                       <span className={t.type === 'earning' ? "text-emerald-500" : "text-rose-500"}>{t.type === 'earning' ? 'CREDIT' : 'DEBIT'}</span>
                       <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
                       <span className="truncate max-w-[120px]">{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className={cn("text-sm font-black", t.type === 'earning' ? "text-emerald-500" : "text-white")}>
                      {t.type === 'earning' ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                 </div>
               ))}
               {recentTransactions.length === 0 && (
                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest py-10 text-center italic text-left">Financial Ledger is empty.</p>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
