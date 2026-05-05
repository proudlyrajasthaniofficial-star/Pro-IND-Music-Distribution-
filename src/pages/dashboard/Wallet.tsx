import React, { useEffect, useState } from "react";
import { triggerNotification } from "../../lib/notifications";
import { collection, query, where, getDocs, orderBy, limit, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { 
  Wallet, 
  ArrowUpRight, 
  History, 
  Banknote,
  TrendingUp,
  CreditCard,
  HelpCircle,
  Clock,
  XCircle,
  ChevronRight
} from "lucide-react";
import { formatCurrency, cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

const WITHDRAWAL_STATUSES = [
  { id: 'pending', label: 'Processing', color: 'bg-amber-50 rounded-full text-amber-600 border border-amber-100' },
  { id: 'approved', label: 'Disbursed', color: 'bg-emerald-50 rounded-full text-emerald-600 border border-emerald-100' },
  { id: 'rejected', label: 'Failed', color: 'bg-rose-50 rounded-full text-rose-600 border border-rose-100' },
];

export default function WalletPage() {
  const { user, profile } = useAuth();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Bank Transfer");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [upiId, setUpiId] = useState("");
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    
      // Fetch Recent Withdrawals
      try {
        const wQ = query(
          collection(db, "withdrawals"), 
          where("userId", "==", user.uid)
        );
        const wSnap = await getDocs(wQ);
        setWithdrawals(wSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => {
           return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }).slice(0, 20));
      } catch (e: any) {
        console.error("Error fetching withdrawals:", e);
      }

      // Fetch Recent Transactions
      try {
        const tQ = query(
          collection(db, "transactions"),
          where("userId", "==", user.uid)
        );
        const tSnap = await getDocs(tQ);
        setTransactions(tSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => {
           return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }).slice(0, 10));
      } catch (e: any) {
         console.error("Error fetching transactions:", e);
      }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = parseFloat(amount);
    if (!user || isNaN(withdrawAmount) || withdrawAmount < 1000) {
      toast.error("Minimum withdrawal is ₹1,000");
      return;
    }
    if (withdrawAmount > (profile?.walletBalance || 0)) {
      toast.error("Insufficient funds in treasury.");
      return;
    }

    let submitDetails = "";
    if (method === "Bank Transfer") {
       if (!bankName || !accountName || !accountNumber || !ifscCode) {
          toast.error("Please fill all bank details");
          return;
       }
       submitDetails = `Bank: ${bankName}\nName: ${accountName}\nA/C: ${accountNumber}\nIFSC: ${ifscCode}`;
    } else {
       if (!upiId) {
          toast.error("Please enter your UPI ID");
          return;
       }
       submitDetails = `UPI: ${upiId}`;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "withdrawals"), {
        userId: user.uid,
        userName: profile?.displayName || "Artist",
        amount: withdrawAmount,
        method,
        details: submitDetails,
        status: "pending",
        createdAt: new Date().toISOString()
      });

      // Trigger Backend Notification
      await triggerNotification("/finance/withdrawal-request", {
        email: user.email,
        name: profile?.displayName || "Artist",
        amount: withdrawAmount
      });

      setAmount("");
      setBankName("");
      setAccountName("");
      setAccountNumber("");
      setIfscCode("");
      setUpiId("");
      setShowForm(false);
      fetchData();
      toast.success("Withdrawal request initiated. Expected processing: 3-5 business rotations.");
    } catch (err) {
      toast.error("Transmission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !profile) return <div className="p-10 animate-pulse text-slate-400">Syncing Treasury Assets...</div>;

  return (
    <div className="space-y-12 pb-32">
      {/* Treasury Header */}
      <div className="grid lg:grid-cols-3 gap-8 items-start">
         <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <div className="text-center md:text-left">
               <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight uppercase">TREASURY <span className="text-brand-blue">VAULT</span></h1>
               <p className="text-slate-400 font-medium text-xs md:text-base">Manage your global royalties and financial distribution.</p>
            </div>

            <div className="bg-slate-950 rounded-[2.5rem] md:rounded-[4rem] p-6 sm:p-10 md:p-12 text-white relative overflow-hidden shadow-3xl group">
               <div className="absolute top-0 right-0 w-80 h-80 bg-brand-blue/20 blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000"></div>
               <div className="relative z-10 space-y-8 md:space-y-10">
                  <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                     <div className="w-14 h-14 md:w-16 md:h-16 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center">
                        <Wallet className="w-7 h-7 md:w-8 md:h-8 text-brand-blue" />
                     </div>
                     <div className="text-center md:text-left flex flex-col items-center md:items-start gap-1">
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest md:tracking-[0.3em] text-white/40">Consolidated Balance</p>
                        <h2 className="text-4xl sm:text-5xl md:text-7xl font-black font-display tracking-tighter break-all">
                           {formatCurrency(profile?.walletBalance || 0)}
                        </h2>
                     </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 md:gap-6 pt-4 border-t border-white/5">
                     <div className="flex-1 p-4 md:p-6 bg-white/5 rounded-2xl md:rounded-3xl border border-white/5 text-left">
                        <p className="text-[8px] md:text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1">Total Earned</p>
                        <p className="text-xl md:text-2xl font-black">{formatCurrency(profile?.totalEarned || 0)}</p>
                     </div>
                     <div className="flex-1 p-4 md:p-6 bg-white/5 rounded-2xl md:rounded-3xl border border-white/5 text-left">
                        <p className="text-[8px] md:text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1">Total Withdrawn</p>
                        <p className="text-xl md:text-2xl font-black text-rose-400">{formatCurrency(profile?.totalWithdrawn || 0)}</p>
                     </div>
                  </div>

                  <button 
                    onClick={() => setShowForm(true)}
                    className="w-full py-5 md:py-6 bg-white text-slate-950 rounded-[2rem] md:rounded-[2.5rem] font-black text-[10px] md:text-xs uppercase tracking-widest md:tracking-[0.4em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all group overflow-hidden relative"
                  >
                     <span className="relative z-10 flex items-center justify-center gap-2 md:gap-3">
                        Initiate Withdrawal <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />
                     </span>
                     <div className="absolute inset-0 bg-brand-blue translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                  </button>
               </div>
            </div>
         </div>

         {/* Stats Panel */}
         <div className="space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-50 shadow-sm flex flex-col gap-6">
               <h3 className="text-lg md:text-xl font-black font-display flex items-center gap-3 uppercase"><TrendingUp className="text-brand-blue" /> PERFORMANCE</h3>
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Growth Rate</span>
                     <span className="text-xs font-black text-emerald-500">+14.8%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Sources</span>
                     <span className="text-xs font-black hover:text-brand-blue cursor-pointer transition-colors uppercase">24 Stores</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Next Report</span>
                     <span className="text-xs font-black uppercase">May 20, 2026</span>
                  </div>
               </div>
            </div>

            <div className="bg-brand-blue p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
               <HelpCircle className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:rotate-12 transition-transform" />
               <h3 className="text-xl font-black font-display mb-2 uppercase text-left">Financial Guard</h3>
               <p className="text-[10px] font-bold opacity-70 uppercase leading-relaxed text-left">Royalties are calculated based on DSP reporting windows. Minimum disbursement is ₹1,000 INR.</p>
            </div>
         </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 pt-12">
         {/* Withdrawal History */}
         <div className="space-y-8">
            <div className="flex items-center justify-between">
               <h3 className="text-3xl font-black font-display tracking-tight uppercase flex items-center gap-4">
                  <History className="w-8 h-8 text-brand-blue" /> WITHDRAWAL LOG
               </h3>
               <button className="text-[10px] font-black uppercase tracking-widest text-brand-blue border-b border-brand-blue/20">Expand History</button>
            </div>

            <div className="space-y-4">
               {withdrawals.map((w, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={w.id} 
                    className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between group hover:shadow-xl transition-all gap-4 text-left"
                  >
                     <div className="flex items-center gap-4 md:gap-6">
                        <div className={cn(
                          "w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shrink-0",
                          w.status === 'approved' ? "bg-emerald-50 text-emerald-500" : "bg-slate-50 text-slate-400"
                        )}>
                           <Banknote className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                           <p className="text-sm font-black text-slate-800 tracking-tight">{formatCurrency(w.amount)}</p>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{w.method}</p>
                        </div>
                     </div>
                     <div className="text-left md:text-right flex flex-row md:flex-col items-center md:items-end justify-between md:justify-end gap-2 w-full md:w-auto">
                        <span className={cn(
                           "text-[8px] font-black px-4 py-1.5 uppercase tracking-widest border rounded-full",
                           WITHDRAWAL_STATUSES.find(s => s.id === w.status)?.color || "bg-slate-50 border-slate-100 text-slate-500"
                        )}>{w.status}</span>
                        <p className="text-[9px] font-bold text-slate-300 uppercase">{new Date(w.createdAt).toLocaleDateString()}</p>
                     </div>
                  </motion.div>
               ))}
               {withdrawals.length === 0 && (
                  <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
                     <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No withdrawal signals detected</p>
                  </div>
               )}
            </div>
         </div>

         {/* Transaction Ledger */}
         <div className="space-y-8">
            <div className="flex items-center justify-between">
               <h3 className="text-3xl font-black font-display tracking-tight uppercase flex items-center gap-4">
                  <CreditCard className="w-8 h-8 text-brand-blue" /> ROYALTY FEED
               </h3>
               <button className="text-[10px] font-black uppercase tracking-widest text-brand-blue border-b border-brand-blue/20">Ledger View</button>
            </div>

            <div className="space-y-4">
               {transactions.map((t, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={t.id} 
                    className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between group hover:-translate-y-1 transition-all gap-4 text-left"
                  >
                     <div className="flex items-center gap-4 md:gap-6">
                        <div className={cn(
                          "w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shrink-0",
                          t.type === 'earning' ? "bg-brand-blue/5 text-brand-blue" : "bg-rose-50 text-rose-500"
                        )}>
                           {t.type === 'earning' ? <ArrowUpRight className="w-5 h-5" /> : <ChevronRight className="w-5 h-5 rotate-90" />}
                        </div>
                        <div className="text-left">
                           <p className="text-[10px] md:text-xs font-black text-slate-800 uppercase tracking-tight">{t.description}</p>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{new Date(t.createdAt).toLocaleDateString()}</p>
                        </div>
                     </div>
                     <p className={cn(
                        "text-xs md:text-sm font-black text-left md:text-right",
                        t.type === 'earning' ? "text-emerald-500" : "text-rose-500"
                     )}>
                        {t.type === 'earning' ? "+" : "-"}{formatCurrency(Math.abs(t.amount))}
                     </p>
                  </motion.div>
               ))}
               {transactions.length === 0 && (
                  <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
                     <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Ledger is currently empty</p>
                  </div>
               )}
            </div>
         </div>
      </div>

      {/* Withdrawal Modal Form */}
      <AnimatePresence>
         {showForm && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6"
            >
               <motion.div 
                  initial={{ scale: 0.9, y: 50, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.9, y: 50, opacity: 0 }}
                  className="bg-white w-full max-w-lg rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-12 relative shadow-3xl overflow-hidden max-h-[90vh] overflow-y-auto"
               >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                  <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 md:top-10 md:right-10 text-slate-300 hover:text-slate-900 transition-colors z-20">
                     <XCircle className="w-6 h-6 md:w-8 md:h-8" />
                  </button>

                  <div className="space-y-6 md:space-y-10 relative z-10">
                     <div className="flex items-center gap-4 md:gap-6">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-950 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl">
                           <ArrowUpRight className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <div className="text-left">
                           <h3 className="text-xl md:text-3xl font-black font-display uppercase tracking-tight">Initiate Payout</h3>
                           <p className="text-[10px] md:text-sm text-slate-400 font-medium">Global Royalty Distribution</p>
                        </div>
                     </div>

                     <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                        <div className="space-y-1 md:space-y-2 text-left">
                           <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Withdrawal Amount (₹)</label>
                           <input 
                              required
                              type="number"
                              min="1000"
                              value={amount}
                              onChange={e => setAmount(e.target.value)}
                              className="w-full bg-slate-50 border-none rounded-2xl md:rounded-3xl p-4 md:p-6 text-xl md:text-2xl font-black text-slate-900 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all shadow-inner"
                              placeholder="₹0.00"
                           />
                           <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-4 mt-1 md:mt-2">Available: {formatCurrency(profile?.walletBalance || 0)}</p>
                        </div>

                        <div className="space-y-1 md:space-y-2 text-left">
                           <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Transfer Method</label>
                           <div className="grid grid-cols-2 gap-3 md:gap-4">
                              {["Bank Transfer", "UPI / Digital"].map(m => (
                                 <button 
                                    key={m}
                                    type="button"
                                    onClick={() => setMethod(m)}
                                    className={cn(
                                       "py-3 md:py-4 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest border transition-all",
                                       method === m ? "bg-slate-900 text-white border-slate-900 shadow-xl" : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                                    )}
                                 >
                                    {m}
                                 </button>
                              ))}
                           </div>
                        </div>

                        <div className="space-y-3 md:space-y-4 text-left">
                           <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Account Metadata</label>
                           {method === "Bank Transfer" ? (
                              <div className="space-y-2 md:space-y-3">
                                 <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} required placeholder="Bank Name" className="w-full bg-slate-50 border-none rounded-xl md:rounded-2xl p-3 md:p-4 text-xs md:text-sm font-bold text-slate-900 focus:ring-4 focus:ring-brand-blue/10 outline-none" />
                                 <input type="text" value={accountName} onChange={e => setAccountName(e.target.value)} required placeholder="Account Holder Name" className="w-full bg-slate-50 border-none rounded-xl md:rounded-2xl p-3 md:p-4 text-xs md:text-sm font-bold text-slate-900 focus:ring-4 focus:ring-brand-blue/10 outline-none" />
                                 <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} required placeholder="Account Number" className="w-full bg-slate-50 border-none rounded-xl md:rounded-2xl p-3 md:p-4 text-xs md:text-sm font-bold text-slate-900 focus:ring-4 focus:ring-brand-blue/10 outline-none" />
                                 <input type="text" value={ifscCode} onChange={e => setIfscCode(e.target.value)} required placeholder="IFSC Code" className="w-full bg-slate-50 border-none rounded-xl md:rounded-2xl p-3 md:p-4 text-xs md:text-sm font-bold text-slate-900 focus:ring-4 focus:ring-brand-blue/10 outline-none" />
                              </div>
                           ) : (
                              <div className="space-y-2 md:space-y-3">
                                 <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} required placeholder="Enter UPI ID (e.g., name@ybl)" className="w-full bg-slate-50 border-none rounded-xl md:rounded-2xl p-3 md:p-4 text-xs md:text-sm font-bold text-slate-900 focus:ring-4 focus:ring-brand-blue/10 outline-none" />
                              </div>
                           )}
                        </div>

                        <button 
                           disabled={submitting}
                           className="w-full py-6 bg-brand-blue text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                           {submitting ? "TRANSMITTING DATA..." : "TRANSMIT WITHDRAWAL SIGNAL"}
                        </button>

                        <div className="pt-4 flex items-start gap-4 text-slate-400 opacity-60 text-left">
                           <Clock className="w-4 h-4 flex-shrink-0" />
                           <p className="text-[10px] font-medium leading-relaxed italic">By initiating this signal, you authorize IND Distribution to process financial disbursements to the provided account metadata. ETA: 3-5 Business Rotations.</p>
                        </div>
                     </form>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
