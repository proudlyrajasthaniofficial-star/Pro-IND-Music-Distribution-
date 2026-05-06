import React, { useEffect, useState } from "react";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  where, 
  doc, 
  updateDoc, 
  addDoc, 
  writeBatch,
  getDoc,
  serverTimestamp
} from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, FileText, Plus, Search, CreditCard, RefreshCw } from "lucide-react";
import { formatCurrency, cn, generateCustomId, formatDate } from "../../lib/utils";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function AdminFinance() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPayouts: 0,
    pendingWithdrawals: 0,
    lastMonthGrowth: 0
  });
  const [pendingWithdrawals, setPendingWithdrawals] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [migrating, setMigrating] = useState(false);
  
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showAddBalanceModal, setShowAddBalanceModal] = useState(false);
  const [showRoyaltyDetailModal, setShowRoyaltyDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const [payoutData, setPayoutData] = useState({ amount: "", month: "", year: "", notes: "" });
  const [addBalanceData, setAddBalanceData] = useState({ amount: "", month: "", year: "", notes: "" });
  const [directRoyaltyData, setDirectRoyaltyData] = useState({ csvData: "", period: "", source: "Spotify" });

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const tSnap = await getDocs(collection(db, "transactions"));
      const tData = tSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

      const rev = tData.filter(t => t.type === 'earning').reduce((sum, t) => sum + (t.amount || 0), 0);
      const payouts = tData.filter(t => t.type === 'withdrawal' && t.status === 'completed').reduce((sum, t) => sum + (t.amount || 0), 0);

      // Fetch pending withdrawals
      const wSnap = await getDocs(query(collection(db, "withdrawals"), where("status", "==", "pending")));
      const pendingData = wSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Fetch customers
      const uSnap = await getDocs(collection(db, "users"));
      const uData = uSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      setStats({
        totalRevenue: rev,
        totalPayouts: payouts,
        pendingWithdrawals: pendingData.length,
        lastMonthGrowth: 0
      });

      setPendingWithdrawals(pendingData);
      setCustomers(uData);
      
      const recent = query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(20));
      const recentSnap = await getDocs(recent);
      setRecentTransactions(recentSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Error fetching finance data:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    const ensureAdminRole = async () => {
      const masterEmails = [
        "musicdistributionindia.in@gmail.com", 
        "summyskji@gmail.com", 
        "admin@musicdistributionindia.in"
      ];
      
      try {
        const { auth } = await import("../../lib/firebase");
        const currentAuthUser = auth.currentUser;
        
        if (currentAuthUser && masterEmails.includes(currentAuthUser.email || "")) {
          const userRef = doc(db, "users", currentAuthUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists() || userDoc.data()?.role !== 'admin') {
            const { setDoc } = await import("firebase/firestore");
            await setDoc(userRef, { 
              email: currentAuthUser.email,
              displayName: currentAuthUser.displayName || "Administrator",
              role: 'admin',
              updatedAt: serverTimestamp()
            }, { merge: true });
            console.log("Admin identity synchronized.");
          }
        }
      } catch (e) {
        console.error("Admin verification fault:", e);
      }
    };
    ensureAdminRole();
  }, []);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const runIdMigration = async () => {
    if (!confirm("Are you sure? This will update missing User IDs for all customers.")) return;
    setMigrating(true);
    try {
      const batch = writeBatch(db);
      let count = 0;
      
      for (const cust of customers) {
        if (!cust.customId) {
          const newId = generateCustomId(cust.displayName || cust.email || "Artist");
          const uRef = doc(db, "users", cust.id);
          batch.update(uRef, { customId: newId });
          count++;
        }
      }

      if (count > 0) {
        await batch.commit();
        toast.success(`Successfully migrated ${count} user identities.`);
        fetchFinanceData();
      } else {
        toast.info("Database integrity verified: All users already possess custom identities.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Migration Aborted: System Fault");
    } finally {
      setMigrating(false);
    }
  };

  const handleDirectRoyaltyImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !directRoyaltyData.csvData) return;

    setLoading(true);
    try {
      const lines = directRoyaltyData.csvData.split("\n").filter(l => l.trim());
      const dataRows = lines.length > 1 && lines[0].toLowerCase().includes('isrc') ? lines.slice(1) : lines;

      let totalRevenue = 0;
      let totalStreams = 0;
      const entries: any[] = [];

      for (const row of dataRows) {
        const parts = row.split(",").map(p => p.trim());
        if (parts.length < 3) continue;
        const streams = parseInt(parts[1]) || 0;
        const revenue = parseFloat(parts[2]) || 0;
        totalRevenue += revenue;
        totalStreams += streams;
        entries.push({
          isrc: parts[0],
          streams,
          revenue,
          platform: parts[3] || directRoyaltyData.source,
          userId: selectedUser.id,
          userName: selectedUser.displayName || selectedUser.id,
          createdAt: new Date().toISOString()
        });
      }

      if (entries.length === 0) {
        toast.error("No valid lines detected in payload.");
        setLoading(false);
        return;
      }

      const batch = writeBatch(db);
      
      // 1. Create Report
      const reportRef = doc(collection(db, "royalty_reports"));
      batch.set(reportRef, {
        reportName: `Direct Upload - ${selectedUser.displayName}`,
        period: directRoyaltyData.period,
        source: directRoyaltyData.source,
        status: "approved", // Auto-approved for direct uploads
        totalRevenue,
        totalStreams,
        userId: selectedUser.id,
        createdAt: serverTimestamp(),
        approvedAt: serverTimestamp()
      });

      // 2. Add Entries
      entries.forEach(entry => {
        const entryRef = doc(collection(db, "royalty_entries"));
        batch.set(entryRef, { ...entry, reportId: reportRef.id });
      });

      // 3. Update User Wallet
      const uRef = doc(db, "users", selectedUser.id);
      batch.update(uRef, {
        walletBalance: increment(totalRevenue),
        totalEarned: increment(totalRevenue),
        updatedAt: serverTimestamp()
      });

      // 4. Log Transaction
      const tRef = doc(collection(db, "transactions"));
      batch.set(tRef, {
        userId: selectedUser.id,
        amount: totalRevenue,
        type: "earning",
        status: "completed",
        description: `Direct Royalty Import: ${directRoyaltyData.period}`,
        platform: directRoyaltyData.source,
        createdAt: serverTimestamp()
      });

      await batch.commit();
      toast.success("Identity Royalties Synchronized and Credited.");
      setShowRoyaltyDetailModal(false);
      await fetchFinanceData();
    } catch (err: any) {
      console.error(err);
      toast.error("Protocol Error during royalty injection.");
    } finally {
      setLoading(false);
    }
  };

  const approveWithdrawal = async (w: any) => {
    const confirmed = window.confirm(`Approve liquidation of ${formatCurrency(w.amount)} for ${w.userName || 'Artist'}?`);
    if (!confirmed) return;

    setLoading(true);
    console.log(`[Finance] Processing approval for withdrawal ${w.id}`);
    
    try {
      const batch = writeBatch(db);
      const uRef = doc(db, "users", w.userId);
      const uSnap = await getDoc(uRef);
      
      if (!uSnap.exists()) {
        toast.error("Critical Failure: User identity missing from ledger.");
        setLoading(false);
        return;
      }
      
      const userData = uSnap.data();
      const currentBalance = userData.walletBalance || 0;

      if (currentBalance < w.amount) {
        toast.error(`Integrity Failure: User has ${formatCurrency(currentBalance)} but requested ${formatCurrency(w.amount)}.`);
        setLoading(false);
        return;
      }

      const now = new Date();
      const month = now.toLocaleString('default', { month: 'long' }).toUpperCase();
      const year = now.getFullYear().toString();

      // 1. Log Transaction
      const tRef = doc(collection(db, "transactions"));
      batch.set(tRef, {
        userId: w.userId,
        userName: userData.displayName || w.userId,
        userEmail: userData.email || w.userEmail || "",
        amount: w.amount,
        type: 'withdrawal',
        status: 'completed',
        month,
        year,
        notes: `Withdrawal Authorized (${w.method})`,
        createdAt: serverTimestamp()
      });

      // 2. Deduct from User
      batch.update(uRef, { 
        walletBalance: currentBalance - w.amount,
        totalWithdrawn: (userData.totalWithdrawn || 0) + w.amount,
        updatedAt: serverTimestamp()
      });

      // 3. Update Withdrawal Request
      const wRef = doc(db, "withdrawals", w.id);
      batch.update(wRef, { 
        status: 'approved', 
        processedAt: serverTimestamp(),
        adminSignOff: true
      });

      // 4. Notify User
      const nRef = doc(collection(db, "user_notifications"));
      batch.set(nRef, {
        userId: w.userId,
        title: "Withdrawal Processed",
        message: `Your disbursement of ₹${w.amount} is complete via ${w.method || 'BANK'}.`,
        type: 'success',
        read: false,
        createdAt: serverTimestamp()
      });

      await batch.commit();

      toast.success("Liquidity disbursed successfully.");
      await fetchFinanceData();
    } catch (err: any) {
      console.error("Withdrawal Approval Error:", err);
      const msg = err?.message || "System Fault";
      if (msg.includes("offline")) {
        toast.error("Network Failure: Backend unreachable. Please verify your connection.");
      } else {
        toast.error(`Approval Failed: ${msg.includes('permission') ? 'Access Denied: Admin Rights Required' : msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const [showUpload, setShowUpload] = useState(false);
  const [royaltyData, setRoyaltyData] = useState({ userId: "", amount: "", period: "" });

  const handleRoyaltyUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const batch = writeBatch(db);
      const uRef = doc(db, "users", royaltyData.userId);
      const uSnap = await getDoc(uRef);
      
      if (!uSnap.exists()) {
        toast.error("Target Identity Not Found");
        setLoading(false);
        return;
      }

      const userData = uSnap.data();
      const amt = parseFloat(royaltyData.amount);
      
      // 1. Update User Balance
      batch.update(uRef, { 
        walletBalance: (userData.walletBalance || 0) + amt,
        updatedAt: serverTimestamp()
      });
      
      // 2. Add Royalty Report
      const rRef = doc(collection(db, "royalty_reports"));
      batch.set(rRef, {
        userId: royaltyData.userId,
        amount: amt,
        period: royaltyData.period,
        createdAt: serverTimestamp()
      });

      // 3. Log Transaction
      const tRef = doc(collection(db, "transactions"));
      batch.set(tRef, {
        userId: royaltyData.userId,
        userName: userData.displayName || royaltyData.userId,
        userEmail: userData.email,
        amount: amt,
        type: 'earning',
        status: 'completed',
        month: royaltyData.period.split(' ')[0] || "",
        year: royaltyData.period.split(' ')[1] || "",
        notes: `Royalty Credited: ${royaltyData.period}`,
        createdAt: serverTimestamp()
      });

      await batch.commit();

      toast.success("Royalties successfully credited.");
      setShowUpload(false);
      await fetchFinanceData();
    } catch (err: any) {
      console.error("Royalty Error:", err);
      toast.error(`Credit Failure: ${err?.message?.split(':')?.pop() || "System was unable to process this royalty injection."}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    const amt = parseFloat(payoutData.amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Valid amount required.");
      return;
    }

    if (amt > (selectedUser.walletBalance || 0)) {
      toast.error("Withdrawal exceeds available balance.");
      return;
    }

    setLoading(true);
    try {
      const batch = writeBatch(db);
      const uRef = doc(db, "users", selectedUser.id);
      
      // 1. Update Balance
      batch.update(uRef, { 
        walletBalance: (selectedUser.walletBalance || 0) - amt,
        totalWithdrawn: (selectedUser.totalWithdrawn || 0) + amt,
        updatedAt: serverTimestamp()
      });

      // 2. Log Transaction
      const tRef = doc(collection(db, "transactions"));
      batch.set(tRef, {
        userId: selectedUser.id,
        userName: selectedUser.displayName || selectedUser.id,
        userEmail: selectedUser.email || "",
        amount: amt,
        type: 'withdrawal',
        status: 'completed',
        month: payoutData.month,
        year: payoutData.year,
        notes: payoutData.notes,
        createdAt: serverTimestamp()
      });

      await batch.commit();

      toast.success("Payout successfully processed.");
      setShowPayoutModal(false);
      await fetchFinanceData();
    } catch (err: any) {
      console.error("Payout Error:", err);
      toast.error(`System Fault: ${err?.message?.split(':')?.pop() || "Transaction Aborted"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    const amt = parseFloat(addBalanceData.amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Valid amount required.");
      return;
    }

    setLoading(true);
    try {
      const batch = writeBatch(db);
      const uRef = doc(db, "users", selectedUser.id);
      
      // 1. Update Balance
      batch.update(uRef, { 
        walletBalance: (selectedUser.walletBalance || 0) + amt,
        totalEarned: (selectedUser.totalEarned || 0) + amt,
        updatedAt: serverTimestamp()
      });

      // 2. Log Transaction
      const tRef = doc(collection(db, "transactions"));
      batch.set(tRef, {
        userId: selectedUser.id,
        userName: selectedUser.displayName || selectedUser.id,
        userEmail: selectedUser.email || "",
        amount: amt,
        type: 'earning',
        status: 'completed',
        month: addBalanceData.month,
        year: addBalanceData.year,
        notes: addBalanceData.notes,
        createdAt: serverTimestamp()
      });

      await batch.commit();

      toast.success(`Successfully added ₹${amt} to user wallet.`);
      setShowAddBalanceModal(false);
      await fetchFinanceData();
    } catch (err: any) {
      console.error("Top-up Error:", err);
      toast.error(`Failed to add balance: ${err?.message?.split(':')?.pop() || "Database Error"}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 pb-24 text-left">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
         <div>
            <h1 className="text-5xl font-black font-display tracking-tight uppercase">Finance <span className="text-cyan-400">Treasury</span></h1>
            <p className="text-slate-400 font-medium text-xs uppercase tracking-widest mt-2">Global royalty oversight and payout processing console.</p>
         </div>
          <div className="flex flex-wrap gap-4">
             <button 
               onClick={runIdMigration}
               disabled={migrating}
               className="px-8 py-5 bg-slate-800 text-slate-400 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center gap-2 border border-slate-700"
             >
                <RefreshCw className={cn("w-4 h-4", migrating && "animate-spin")} /> {migrating ? "MIGRATING..." : "SYNC USER IDS"}
             </button>
             <Link 
               to="/admin/royalties"
               className="px-10 py-5 bg-brand-blue text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
             >
                <Plus className="w-5 h-5" /> BULK ROYALTY FORGE
             </Link>
          </div>
      </div>

      {showPayoutModal && selectedUser && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[400] flex items-center justify-center p-6 text-left">
           <div className="bg-[#1E293B] w-full max-w-xl rounded-[4rem] p-12 border border-slate-800 shadow-3xl">
              <h2 className="text-3xl font-black font-display uppercase text-white mb-2 text-left underline decoration-cyan-400 decoration-4 underline-offset-8">Disburse <span className="text-cyan-400">Funds</span></h2>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-10">Direct Payout for {selectedUser.displayName} ({selectedUser.id})</p>
              
              <form onSubmit={handleManualPayout} className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 text-left">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Payment Month</label>
                       <input required value={payoutData.month} onChange={e => setPayoutData({...payoutData, month: e.target.value})} placeholder="e.g. MAY" className="w-full bg-slate-900 border-none p-5 rounded-3xl text-sm font-bold text-white focus:ring-4 focus:ring-cyan-400/10 outline-none" />
                    </div>
                    <div className="space-y-2 text-left">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Payment Year</label>
                       <input required value={payoutData.year} onChange={e => setPayoutData({...payoutData, year: e.target.value})} placeholder="2026" className="w-full bg-slate-900 border-none p-5 rounded-3xl text-sm font-bold text-white focus:ring-4 focus:ring-cyan-400/10 outline-none" />
                    </div>
                 </div>
                 <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Disbursement Amount (INR)</label>
                    <input required type="number" step="0.01" value={payoutData.amount} onChange={e => setPayoutData({...payoutData, amount: e.target.value})} className="w-full bg-slate-900 border-none p-5 rounded-3xl text-3xl font-black text-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none px-8" />
                    <p className="text-[9px] font-bold text-slate-500 ml-4">Available Balance: {formatCurrency(selectedUser.walletBalance || 0)}</p>
                 </div>
                 <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Ledger Notes</label>
                    <textarea required value={payoutData.notes} onChange={e => setPayoutData({...payoutData, notes: e.target.value})} placeholder="What is this payment for?" className="w-full bg-slate-900 border-none p-5 rounded-3xl text-sm font-bold text-white focus:ring-4 focus:ring-cyan-400/10 outline-none min-h-[120px]" />
                 </div>
                 <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setShowPayoutModal(false)} className="flex-1 py-5 bg-slate-800 text-slate-400 rounded-3xl font-black text-xs uppercase tracking-widest">Abort</button>
                    <button type="submit" className="flex-1 py-5 bg-rose-500 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-900/40 hover:scale-105 active:scale-95 transition-all">Settle Payout</button>
                 </div>
              </form>
           </div>
        </div>
      )}
      {showAddBalanceModal && selectedUser && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[400] flex items-center justify-center p-6 text-left">
           <div className="bg-[#1E293B] w-full max-w-xl rounded-[4rem] p-12 border border-slate-800 shadow-3xl">
              <h2 className="text-3xl font-black font-display uppercase text-white mb-2 text-left underline decoration-emerald-500 decoration-4 underline-offset-8">Credit <span className="text-emerald-500">Funds</span></h2>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-10">Manual Top-up for {selectedUser.displayName} ({selectedUser.id})</p>
              
              <form onSubmit={handleManualTopUp} className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 text-left">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Payment Month</label>
                       <input required value={addBalanceData.month} onChange={e => setAddBalanceData({...addBalanceData, month: e.target.value})} placeholder="e.g. MAY" className="w-full bg-slate-900 border-none p-5 rounded-3xl text-sm font-bold text-white focus:ring-4 focus:ring-emerald-500/10 outline-none" />
                    </div>
                    <div className="space-y-2 text-left">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Payment Year</label>
                       <input required value={addBalanceData.year} onChange={e => setAddBalanceData({...addBalanceData, year: e.target.value})} placeholder="2026" className="w-full bg-slate-900 border-none p-5 rounded-3xl text-sm font-bold text-white focus:ring-4 focus:ring-emerald-500/10 outline-none" />
                    </div>
                 </div>
                 <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Credit Amount (INR)</label>
                    <input required type="number" step="0.01" value={addBalanceData.amount} onChange={e => setAddBalanceData({...addBalanceData, amount: e.target.value})} className="w-full bg-slate-900 border-none p-5 rounded-3xl text-3xl font-black text-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none px-8" />
                    <p className="text-[9px] font-bold text-slate-500 ml-4">Current Balance: {formatCurrency(selectedUser.walletBalance || 0)}</p>
                 </div>
                 <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Credit Notes</label>
                    <textarea required value={addBalanceData.notes} onChange={e => setAddBalanceData({...addBalanceData, notes: e.target.value})} placeholder="Why are you adding this balance?" className="w-full bg-slate-900 border-none p-5 rounded-3xl text-sm font-bold text-white focus:ring-4 focus:ring-emerald-500/10 outline-none min-h-[120px]" />
                 </div>
                 <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setShowAddBalanceModal(false)} className="flex-1 py-5 bg-slate-800 text-slate-400 rounded-3xl font-black text-xs uppercase tracking-widest">Abort</button>
                    <button type="submit" className="flex-1 py-5 bg-emerald-500 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/40 hover:scale-105 active:scale-95 transition-all">Add Balance</button>
                 </div>
              </form>
           </div>
        </div>
      )}          {showRoyaltyDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[400] flex items-center justify-center p-6 text-left">
           <div className="bg-[#1E293B] w-full max-w-2xl rounded-[4rem] p-12 border border-slate-800 shadow-3xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] -mr-32 -mt-32"></div>
              <h2 className="text-3xl font-black font-display uppercase text-white mb-2 text-left">Import <span className="text-emerald-500">Royalties</span></h2>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-10">Targeted Feed for {selectedUser.displayName}</p>
              
              <form onSubmit={handleDirectRoyaltyImport} className="space-y-6 relative z-10">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Fiscal Cycle</label>
                       <input required value={directRoyaltyData.period} onChange={e => setDirectRoyaltyData({...directRoyaltyData, period: e.target.value})} placeholder="e.g. MAY 2026" className="w-full bg-slate-900 border-none p-5 rounded-3xl text-sm font-bold text-white focus:ring-4 focus:ring-emerald-500/10 outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Main Source</label>
                       <select value={directRoyaltyData.source} onChange={e => setDirectRoyaltyData({...directRoyaltyData, source: e.target.value})} className="w-full bg-slate-900 border-none p-5 rounded-3xl text-sm font-bold text-white focus:ring-4 focus:ring-emerald-500/10 outline-none appearance-none">
                          <option>Spotify</option>
                          <option>Apple Music</option>
                          <option>YouTube Music</option>
                          <option>Direct Injection</option>
                       </select>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Analytics Payload (CSV: ISRC, Streams, Revenue)</label>
                    <textarea 
                      required 
                      value={directRoyaltyData.csvData} 
                      onChange={e => setDirectRoyaltyData({...directRoyaltyData, csvData: e.target.value})} 
                      placeholder="ISRC, Streams, Revenue&#10;ABC1234, 5000, 150.00" 
                      className="w-full bg-slate-900 border-none p-6 rounded-[2.5rem] text-sm font-mono text-emerald-400 focus:ring-4 focus:ring-emerald-500/10 outline-none min-h-[200px] resize-none" 
                    />
                 </div>
                 <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setShowRoyaltyDetailModal(false)} className="flex-1 py-5 bg-slate-800 text-slate-400 rounded-3xl font-black text-xs uppercase tracking-widest transition-all">Discard</button>
                    <button type="submit" disabled={loading} className="flex-1 py-5 bg-emerald-500 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all">Commit to Ledger</button>
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

      <div className="bg-[#1E293B] rounded-[3.5rem] border border-slate-800 p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/5 blur-[80px] -translate-y-1/2 -translate-x-1/2"></div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 relative z-10">
           <h3 className="text-3xl font-black font-display tracking-tight uppercase flex items-center gap-4 text-white">
              <CreditCard className="text-cyan-400 w-10 h-10" /> Customer Directory
           </h3>
           <div className="relative w-full md:w-96">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                placeholder="PROBE USER BY NAME/EMAIL/ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-full py-5 pl-14 pr-8 text-[10px] font-black uppercase tracking-widest text-white focus:ring-4 focus:ring-cyan-400/10 outline-none transition-all placeholder:text-slate-600 shadow-inner"
              />
           </div>
        </div>

        <div className="overflow-x-auto relative z-10">
           <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                 <tr className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                    <th className="px-8 py-4">Identity / Metadata</th>
                    <th className="px-8 py-4">Liquidity Balance</th>
                    <th className="px-8 py-4">Email Nexus</th>
                    <th className="px-8 py-4 text-right">Operations</th>
                 </tr>
              </thead>
              <tbody>
                 {filteredCustomers.map((cust, i) => (
                    <tr key={cust.id} className="group">
                       <td className="px-8 py-6 bg-slate-900/50 rounded-l-[2.5rem] border-y border-l border-slate-800 group-hover:bg-slate-800 transition-colors">
                          <div className="flex items-center gap-5">
                             <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-cyan-400 text-lg border border-slate-700 shadow-lg">
                                {cust.displayName?.charAt(0) || "U"}
                             </div>
                             <div className="text-left">
                                <p className="font-black text-white uppercase text-sm tracking-tight">{cust.displayName || "Unknown Identity"}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">ID: {cust.customId || cust.id}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6 bg-slate-900/50 border-y border-slate-800 group-hover:bg-slate-800 transition-colors">
                          <p className="text-2xl font-black font-display text-white">{formatCurrency(cust.walletBalance || 0)}</p>
                       </td>
                       <td className="px-8 py-6 bg-slate-900/50 border-y border-slate-800 group-hover:bg-slate-800 transition-colors">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cust.email}</p>
                       </td>
                       <td className="px-8 py-6 bg-slate-900/50 rounded-r-[2.5rem] border-y border-r border-slate-800 group-hover:bg-slate-800 transition-colors text-right">
                          <div className="flex items-center justify-end gap-3">
                             <button 
                                onClick={() => {
                                  setSelectedUser(cust);
                                  setShowRoyaltyDetailModal(true);
                                  setDirectRoyaltyData({
                                    csvData: "",
                                    period: new Date().toLocaleString('default', { month: 'long' }).toUpperCase() + " " + new Date().getFullYear(),
                                    source: "Spotify"
                                  });
                                }}
                                className="px-6 py-4 bg-brand-blue/10 text-brand-blue border border-brand-blue/20 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all shadow-md active:scale-95 flex items-center gap-2"
                             >
                                <Music className="w-3 h-3" /> Import Royalties
                             </button>
                             <button 
                                onClick={() => {
                                  setSelectedUser(cust);
                                  setShowAddBalanceModal(true);
                                  setAddBalanceData({
                                    amount: "",
                                    month: new Date().toLocaleString('default', { month: 'long' }).toUpperCase(),
                                    year: new Date().getFullYear().toString(),
                                    notes: ""
                                  });
                                }}
                                className="px-6 py-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-md active:scale-95 flex items-center gap-2"
                             >
                                <Plus className="w-3 h-3" /> Cash Add
                             </button>
                             <button 
                                onClick={() => {
                                  setSelectedUser(cust);
                                  setShowPayoutModal(true);
                                  setPayoutData({
                                    amount: "",
                                    month: new Date().toLocaleString('default', { month: 'long' }).toUpperCase(),
                                    year: new Date().getFullYear().toString(),
                                    notes: ""
                                  });
                                }}
                                className="px-6 py-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-md active:scale-95"
                             >
                                Deduct Funds
                             </button>
                          </div>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
           {filteredCustomers.length === 0 && (
              <div className="py-20 text-center text-slate-500 uppercase font-black text-[10px] tracking-widest italic">
                 No matching identities found in directory.
              </div>
           )}
        </div>
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
                       <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-black text-xs text-cyan-400">W</div>
                       <div className="text-left">
                          <p className="font-bold text-white uppercase text-xs tracking-wider">{w.userName || 'Artist'}</p>
                          <p className="text-[10px] text-slate-500 mt-1 uppercase truncate max-w-[150px]">{w.method || 'BANK TRANSFER'}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xl font-black font-display text-white">{formatCurrency(w.amount)}</p>
                       <button 
                         onClick={() => approveWithdrawal(w)}
                         className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mt-2 hover:underline"
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
                        <span className={(t.type === 'earning' || t.type === 'add') ? "text-emerald-500" : "text-rose-500"}>
                          {(t.type === 'earning' || t.type === 'add') ? 'CREDIT' : 'DEBIT'}
                        </span>
                        <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
                        <span className="truncate max-w-[200px] text-white/50 font-bold">{t.userName || t.userId}</span>
                     </div>
                     <div className="text-right">
                        <p className={cn("text-sm font-black", (t.type === 'earning' || t.type === 'add') ? "text-emerald-500" : "text-white")}>
                          {(t.type === 'earning' || t.type === 'add') ? '+' : '-'}{formatCurrency(t.amount)}
                        </p>
                        <p className="text-[7px] text-slate-500 uppercase mt-1 text-left md:text-right">
                          {t.notes && <span className="block mb-1 text-white/40">{t.notes}</span>}
                          {t.month} {t.year} • {formatDate(t.createdAt)}
                        </p>
                     </div>
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
