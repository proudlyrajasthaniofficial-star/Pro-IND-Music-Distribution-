import React, { useEffect, useState } from "react";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  doc, 
  updateDoc, 
  addDoc, 
  limit, 
  getDoc,
  writeBatch,
  serverTimestamp,
  onSnapshot
} from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "../../lib/firebase";
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
  ExternalLink,
  FileText
} from "lucide-react";
import { formatCurrency, cn, formatDate } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

const STATUS_FILTERS = [
  { id: 'all', label: 'ALL SIGNALS' },
  { id: 'pending', label: 'PROCESSING' },
  { id: 'approved', label: 'APPROVED' },
  { id: 'paid', label: 'COMPLETED' },
  { id: 'rejected', label: 'REJECTED' }
];

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const ensureAdminRole = async () => {
      const masterEmails = ["musicdistributionindia.in@gmail.com", "summyskji@gmail.com", "admin@musicdistributionindia.in"];
      const { auth } = await import("../../lib/firebase");
      const currentAuthUser = auth.currentUser;
      
      if (currentAuthUser && masterEmails.includes(currentAuthUser.email || "")) {
        const userRef = doc(db, "users", currentAuthUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists() || userDoc.data()?.role !== 'admin') {
          try {
            const { setDoc } = await import("firebase/firestore");
            await setDoc(userRef, { 
              email: currentAuthUser.email,
              displayName: currentAuthUser.displayName || "Administrator",
              role: 'admin',
              updatedAt: new Date().toISOString()
            }, { merge: true });
            console.log("Admin session synchronized and authorized.");
          } catch (e) {
            console.error("Admin sync failure:", e);
          }
        }
      }
    };
    ensureAdminRole();
  }, []);

  const fetchWithdrawals = () => {
    setLoading(true);
    let q = query(collection(db, "withdrawals"));
    if (filter !== "all") {
      q = query(collection(db, "withdrawals"), where("status", "==", filter));
    }
    
    const unsub = onSnapshot(q, (snap) => {
      const sorted = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => {
         const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
         const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
         return timeB - timeA;
      });
      setWithdrawals(sorted);
      setLoading(false);
    }, (err) => {
      console.error("Withdrawals Fetch Error:", err);
      setLoading(false);
      try {
        handleFirestoreError(err, OperationType.LIST, "withdrawals");
      } catch (e) {
        // Error logged
      }
    });

    return unsub;
  };

  useEffect(() => {
    const unsub = fetchWithdrawals();
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [filter]);

  const handleAction = async (withdrawal: any, status: 'approved' | 'rejected' | 'paid') => {
    if (!withdrawal || !status) return;
    
    // Check master admin emails for approval and paid actions
    const masterEmails = ["musicdistributionindia.in@gmail.com", "summyskji@gmail.com", "admin@musicdistributionindia.in"];
    const currentEmail = auth.currentUser?.email;
    
    if ((status === 'approved' || status === 'paid') && !masterEmails.includes((currentEmail || "").toLowerCase())) {
       toast.error(`Security Level Insufficient. Detected: ${currentEmail || "Unknown"}`);
       return;
    }

    setProcessing(true);
    
    try {
      console.log(`[Finance] Sequence Triggered: ${status} for ${withdrawal.id}`);
      const batch = writeBatch(db);
      const wRef = doc(db, "withdrawals", withdrawal.id);
      const uRef = doc(db, "users", withdrawal.userId);
      
      if (status === 'approved') {
        const uSnap = await getDoc(uRef);
        
        if (!uSnap.exists()) {
           throw new Error("Target user record not found in system.");
        }

        const userData = uSnap.data();
        const currentBalance = userData.walletBalance || 0;

        if (currentBalance < withdrawal.amount) {
           throw new Error(`Insufficient Balance (Available: ₹${currentBalance}, Required: ₹${withdrawal.amount})`);
        }

        const now = new Date();
        const month = now.toLocaleString('default', { month: 'long' }).toUpperCase();
        const year = now.getFullYear().toString();

        const tRef = doc(collection(db, "transactions"));
        batch.set(tRef, {
          userId: withdrawal.userId,
          userName: userData.displayName || withdrawal.userName || "Artist",
          userEmail: userData.email || withdrawal.userEmail || "",
          amount: withdrawal.amount,
          type: 'withdrawal',
          status: 'completed',
          month,
          year,
          notes: `Withdrawal Authorized (${withdrawal.method})`,
          createdAt: serverTimestamp()
        });

        batch.update(uRef, { 
          walletBalance: currentBalance - withdrawal.amount,
          totalWithdrawn: (userData.totalWithdrawn || 0) + withdrawal.amount,
          updatedAt: serverTimestamp()
        });
      }

      batch.update(wRef, { 
        status, 
        processedAt: serverTimestamp(),
        admin_notes: adminNotes,
        adminSignOff: true,
        processedBy: currentEmail || "SuperAdmin"
      });

      // 4. Notify User
      const nRef = doc(collection(db, "user_notifications"));
      batch.set(nRef, {
        userId: withdrawal.userId,
        title: `Withdrawal ${status.toUpperCase()}`,
        message: status === 'approved' 
          ? `₹${withdrawal.amount} has been approved and moved to processing.` 
          : status === 'paid'
          ? `₹${withdrawal.amount} has been successfully disbursed via ${withdrawal.method}.`
          : `Your withdrawal request for ₹${withdrawal.amount} was rejected. Note: ${adminNotes}`,
        type: status === 'rejected' ? 'error' : 'success',
        read: false,
        createdAt: serverTimestamp()
      });

      await batch.commit();

      toast.success(`Protocol ${status.toUpperCase()} executed successfully.`);
      setSelectedWithdrawal(null);
      setAdminNotes("");
      await fetchWithdrawals();
    } catch (err: any) {
      console.error("Finance Operation Failure:", err);
      try {
        handleFirestoreError(err, OperationType.WRITE, `withdrawals/${withdrawal.id}`);
      } catch (e: any) {
        toast.error(`System Fault: ${err?.message || "Operation Failed"}`);
      }
    } finally {
      setProcessing(false);
    }
  };

  const renderWithdrawalDetails = (details: any) => {
    if (!details) return "N/A";
    if (typeof details === 'string') return details;
    
    if (details.upiId) {
      return (
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase text-cyan-400">UPI TRANSFER</p>
          <p className="text-sm font-bold text-white">{details.upiId}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-[8px] font-black uppercase text-slate-500">ACCOUNT HOLDER</p>
          <p className="text-[10px] font-bold text-white uppercase">{details.accountHolder}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[8px] font-black uppercase text-slate-500">BANK NAME</p>
          <p className="text-[10px] font-bold text-white uppercase">{details.bankName}</p>
        </div>
        <div className="col-span-2 space-y-1">
          <p className="text-[8px] font-black uppercase text-slate-500">ACCOUNT NUMBER</p>
          <p className="text-xs font-mono font-bold text-white">{details.accountNumber}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[8px] font-black uppercase text-slate-500">IFSC CODE</p>
          <p className="text-xs font-mono font-bold text-cyan-400 uppercase">{details.ifscCode}</p>
        </div>
      </div>
    );
  };

  const filteredWithdrawals = withdrawals.filter(w => 
    (w.userName || "").toLowerCase().includes(search.toLowerCase()) ||
    (w.userId || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12 pb-24">
      {/* Header Panel */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
         <div className="space-y-2">
            <h1 className="text-5xl font-black font-display tracking-tight uppercase text-left">Liquidation <span className="text-cyan-400">Control</span></h1>
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
                filter === s.id ? "bg-cyan-500 text-black shadow-2xl shadow-cyan-500/30" : "bg-[#1E293B] text-slate-500 border border-slate-800 hover:text-white"
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
                     <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-left">Amount Payable</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Transmission Method</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Signal Status</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-left">Time Registered</th>
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
                       onClick={() => {
                          setSelectedWithdrawal(w);
                          setAdminNotes(w.admin_notes || "");
                       }}
                     >
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-xs text-cyan-400 group-hover:rotate-12 transition-transform uppercase">
                                 {w.userName?.charAt(0) || "U"}
                              </div>
                              <div className="text-left">
                                 <p className="font-bold text-white text-sm tracking-tight">{w.userName}</p>
                                 <p className="text-[9px] font-bold text-slate-500 mt-0.5 overflow-hidden text-ellipsis max-w-[150px]">{w.userEmail || w.userId}</p>
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
                              w.status === 'paid' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : 
                              w.status === 'approved' ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-500" : 
                              w.status === 'pending' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                           )}>
                              {w.status === 'pending' ? 'Processing' : 
                               w.status === 'approved' ? 'Approved' : 
                               w.status === 'paid' ? 'Completed' : 
                               w.status === 'rejected' ? 'Rejected' : w.status}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">{formatDate(w.createdAt)}</td>
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
                     <div className="flex items-center gap-8 text-left">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-cyan-500 flex items-center justify-center text-black shadow-2xl shadow-cyan-900/40">
                           <Banknote className="w-12 h-12" />
                        </div>
                        <div className="text-left">
                           <h3 className="text-4xl font-black font-display text-white uppercase tracking-tighter">Liquidate <span className="text-cyan-400">Funds</span></h3>
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
                              <p className="text-left font-black text-white">{selectedWithdrawal.userName}</p>
                              <p className="text-left text-[9px] font-mono text-slate-500 mt-1">{selectedWithdrawal.userId}</p>
                              <a href={`mailto:${selectedWithdrawal.userEmail}`} className="text-left text-[9px] font-bold text-cyan-400 uppercase tracking-widest mt-4 block hover:underline">Transmit to email</a>
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
                           {renderWithdrawalDetails(selectedWithdrawal.details)}
                        </div>
                     </div>

                     <div className="space-y-4 text-left">
                        <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">
                           <FileText className="w-4 h-4" /> Admin Internal Notes
                        </label>
                        <textarea 
                           placeholder="Enter internal audit notes or rejection reasons..."
                           value={adminNotes}
                           onChange={(e) => setAdminNotes(e.target.value)}
                           className="w-full bg-[#0D1117] border border-slate-800 p-6 rounded-3xl text-sm font-bold text-white focus:ring-4 focus:ring-cyan-500/10 outline-none min-h-[100px]"
                        />
                     </div>

                     <div className="flex gap-4 pt-6">
                        {selectedWithdrawal.status === 'pending' ? (
                          <>
                             <button 
                               disabled={processing}
                               onClick={() => handleAction(selectedWithdrawal, 'rejected')}
                               className="flex-1 py-6 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                             >
                                REJECT
                             </button>
                             <button 
                               disabled={processing}
                               onClick={() => handleAction(selectedWithdrawal, 'approved')}
                               className="flex-1 py-6 bg-cyan-500 text-black rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-cyan-900/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                             >
                                APPROVE
                             </button>
                          </>
                        ) : selectedWithdrawal.status === 'approved' ? (
                          <button 
                            disabled={processing}
                            onClick={() => handleAction(selectedWithdrawal, 'paid')}
                            className="w-full py-6 bg-emerald-500 text-black rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-emerald-900/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                          >
                             MARK AS COMPLETED / PAID
                          </button>
                        ) : (
                          <div className="w-full p-8 bg-white/5 rounded-[2.5rem] text-center border border-white/5">
                             <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Terminal state: {selectedWithdrawal.status}</p>
                             <p className="text-[9px] font-bold text-slate-500 mt-2 uppercase">ARCHIVED ON {formatDate(selectedWithdrawal.processedAt || selectedWithdrawal.createdAt)}</p>
                          </div>
                        )}
                     </div>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
