import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, where, doc, updateDoc, addDoc, limit } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter,
  MoreVertical,
  ChevronRight,
  ShieldCheck,
  Banknote,
  User,
  ExternalLink
} from "lucide-react";
import { formatCurrency, cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";

const STATUS_FILTERS = [
  { id: 'all', label: 'All Requests' },
  { id: 'pending', label: 'Pending Payouts' },
  { id: 'approved', label: 'Disbursed' },
  { id: 'rejected', label: 'Failed/Rejected' },
];

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  const fetchWithdrawals = async () => {
    setLoading(true);
    let q = query(collection(db, "withdrawals"), orderBy("createdAt", "desc"));
    if (filter !== "all") {
      q = query(collection(db, "withdrawals"), where("status", "==", filter), orderBy("createdAt", "desc"));
    }
    const snap = await getDocs(q);
    setWithdrawals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [filter]);

  const handleAction = async (withdrawal: any, status: 'approved' | 'rejected') => {
    if (!withdrawal || !status) return;
    if (!confirm(`Confirm ${status} for ₹${withdrawal.amount}?`)) return;

    setProcessing(true);
    try {
      const wRef = doc(db, "withdrawals", withdrawal.id);
      
      if (status === 'approved') {
        const uRef = doc(db, "users", withdrawal.userId);
        const uSnap = await getDocs(query(collection(db, "users"), where("__name__", "==", withdrawal.userId)));
        const userData = uSnap.docs[0]?.data();

        if (!userData || (userData.walletBalance || 0) < withdrawal.amount) {
           alert("Insufficient funds in user treasury for this liquidation.");
           setProcessing(false);
           return;
        }

        // Deduct balance
        await updateDoc(uRef, { 
          walletBalance: userData.walletBalance - withdrawal.amount,
          totalWithdrawn: (userData.totalWithdrawn || 0) + withdrawal.amount
        });

        // Log transaction
        await addDoc(collection(db, "transactions"), {
          userId: withdrawal.userId,
          amount: withdrawal.amount,
          type: 'withdrawal',
          status: 'completed',
          description: `Withdrawal Disbursed (${withdrawal.method})`,
          createdAt: new Date().toISOString()
        });
      }

      await updateDoc(wRef, { 
        status, 
        processedAt: new Date().toISOString() 
      });

      setSelectedWithdrawal(null);
      fetchWithdrawals();
      alert(`Withdrawal signal ${status} successfully.`);
    } catch (err) {
      console.error(err);
      alert("Transmission Failure.");
    } finally {
      setProcessing(false);
    }
  };

  const filteredWithdrawals = withdrawals.filter(w => 
    w.userName?.toLowerCase().includes(search.toLowerCase()) ||
    w.userId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12 pb-24">
      {/* Header Panel */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
         <div className="space-y-2">
            <h1 className="text-5xl font-black font-display tracking-tight uppercase text-left">Liquidation <span className="text-brand-purple">Control</span></h1>
            <p className="text-slate-400 font-medium text-xs uppercase tracking-[0.2em] text-left">Financial audit and manual disbursement management console.</p>
         </div>

         <div className="flex items-center gap-4 bg-[#1E293B] p-2 pl-6 rounded-[2.5rem] border border-slate-800 shadow-2xl w-full lg:w-auto">
            <Search className="w-5 h-5 text-slate-500" />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search user or UID..."
              className="bg-transparent border-none focus:ring-0 text-sm font-bold text-white flex-1 min-w-[250px]"
            />
         </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide py-2">
         {STATUS_FILTERS.map((s) => (
            <button 
              key={s.id}
              onClick={() => setFilter(s.id)}
              className={cn(
                "px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap",
                filter === s.id ? "bg-brand-purple text-white shadow-2xl shadow-purple-500/30" : "bg-[#1E293B] text-slate-500 border border-slate-800 hover:text-white"
              )}
            >
               {s.label}
            </button>
         ))}
      </div>

      {/* Requests Table */}
      <div className="bg-[#1E293B] rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-3xl">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/50">
                     <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Identity</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Liquid Capital</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Transmission Method</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Signal Status</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Time Registered</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Control</th>
                  </tr>
               </thead>
               <tbody>
                  {filteredWithdrawals.map((w, i) => (
                     <motion.tr 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: i * 0.05 }}
                       key={w.id} 
                       className="group border-b border-slate-800/50 hover:bg-white/5 transition-colors cursor-pointer"
                       onClick={() => setSelectedWithdrawal(w)}
                     >
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-xs text-brand-blue group-hover:rotate-12 transition-transform uppercase">
                                 {w.userName?.charAt(0) || "U"}
                              </div>
                              <div className="text-left">
                                 <p className="font-bold text-white text-sm tracking-tight">{w.userName}</p>
                                 <p className="text-[9px] font-mono text-slate-500 mt-0.5">{w.userId}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <p className="text-lg font-black text-white font-display">{formatCurrency(w.amount)}</p>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2 text-left">
                              <Banknote className="w-3.5 h-3.5 text-slate-500" />
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{w.method}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-left">
                           <span className={cn(
                              "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                              w.status === 'approved' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : 
                              w.status === 'pending' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                           )}>{w.status}</span>
                        </td>
                        <td className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">{new Date(w.createdAt).toLocaleDateString()}</td>
                        <td className="px-8 py-6 text-right">
                           <button className="p-3 bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-colors">
                              <ChevronRight className="w-5 h-5" />
                           </button>
                        </td>
                     </motion.tr>
                  ))}
               </tbody>
            </table>
         </div>
         {filteredWithdrawals.length === 0 && !loading && (
            <div className="py-24 text-center">
               <ShieldCheck className="w-16 h-16 text-slate-800 mx-auto mb-6" />
               <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">No financial signals detected in this range.</p>
            </div>
         )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
         {selectedWithdrawal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[400] flex items-center justify-center p-6"
            >
               <motion.div 
                  initial={{ scale: 0.9, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-[#1E293B] w-full max-w-2xl rounded-[4rem] border border-slate-800 overflow-hidden shadow-3xl"
               >
                  <div className="bg-slate-900/50 p-12 border-b border-slate-800 relative">
                     <button onClick={() => setSelectedWithdrawal(null)} className="absolute top-10 right-10 text-slate-500 hover:text-white">
                        <XCircle className="w-8 h-8" />
                     </button>
                     <div className="flex items-center gap-8">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-brand-purple flex items-center justify-center text-white shadow-2xl shadow-purple-900/40">
                           <Banknote className="w-12 h-12" />
                        </div>
                        <div className="text-left">
                           <h3 className="text-4xl font-black font-display text-white uppercase tracking-tighter">Liquidate <span className="text-brand-purple">Funds</span></h3>
                           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Audit ID: {selectedWithdrawal.id}</p>
                        </div>
                     </div>
                  </div>

                  <div className="p-12 space-y-10">
                     <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-4 text-left">
                           <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                              <User className="w-4 h-4" /> Identity Signal
                           </div>
                           <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 text-left">
                              <p className="font-black text-white">{selectedWithdrawal.userName}</p>
                              <p className="text-[9px] font-mono text-slate-500 mt-1">{selectedWithdrawal.userId}</p>
                              <a href={`mailto:${selectedWithdrawal.userEmail}`} className="text-[9px] font-bold text-brand-blue uppercase tracking-widest mt-4 block hover:underline">Transmit to email</a>
                           </div>
                        </div>
                        <div className="space-y-4 text-left">
                           <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                              <History className="w-4 h-4" /> Financial Data
                           </div>
                           <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 text-left">
                              <p className="text-3xl font-black font-display text-emerald-500">{formatCurrency(selectedWithdrawal.amount)}</p>
                              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-2">{selectedWithdrawal.method}</p>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-4 text-left">
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                           <Filter className="w-4 h-4" /> Account Metadata
                        </div>
                        <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 text-left">
                           <p className="text-sm font-bold text-white leading-relaxed italic">"{selectedWithdrawal.details}"</p>
                        </div>
                     </div>

                     {selectedWithdrawal.status === 'pending' ? (
                       <div className="grid grid-cols-2 gap-6 pt-6">
                          <button 
                            disabled={processing}
                            onClick={() => handleAction(selectedWithdrawal, 'rejected')}
                            className="py-6 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                          >
                             REJECT DISBURSEMENT
                          </button>
                          <button 
                            disabled={processing}
                            onClick={() => handleAction(selectedWithdrawal, 'approved')}
                            className="py-6 bg-emerald-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-900/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                          >
                             FINALIZE & DISBURSE
                          </button>
                       </div>
                     ) : (
                       <div className="p-8 bg-white/5 rounded-[2.5rem] text-center border border-white/5">
                          <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">This signal has reached a terminal state: {selectedWithdrawal.status}</p>
                          <p className="text-[9px] font-bold text-slate-500 mt-2 uppercase">ARCHIVED ON {new Date(selectedWithdrawal.processedAt || selectedWithdrawal.createdAt).toLocaleString()}</p>
                       </div>
                     )}
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
