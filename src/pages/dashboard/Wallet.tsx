import React, { useEffect, useState, useMemo } from "react";
import { collection, query, where, getDocs, orderBy, limit, addDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { 
  Wallet, 
  ArrowUpRight, 
  History, 
  Banknote,
  TrendingUp,
  CreditCard,
  Target,
  ArrowRight,
  ShieldCheck,
  Building,
  Smartphone,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Plus
} from "lucide-react";
import { formatCurrency, cn, formatDate } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

const WITHDRAWAL_STATUSES = {
  pending: { label: 'PROCESSING', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  approved: { label: 'APPROVED', color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  rejected: { label: 'REJECTED', color: 'text-rose-400', bg: 'bg-rose-400/10' },
  paid: { label: 'PAID', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
};

export default function WalletPage() {
  const { user, profile } = useAuth();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"UPI" | "BANK">("BANK");
  const [bankDetails, setBankDetails] = useState({
    accountHolder: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    bankName: ""
  });
  const [upiId, setUpiId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "earning" | "withdrawal">("all");

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    
    // Real-time Transactions
    const tQ = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid)
      // Removed orderBy to avoid index requirement; sorting in memo
    );

    const unsubscribeT = onSnapshot(tQ, (snapshot) => {
      const sorted = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) => {
          const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
          const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });
      setTransactions(sorted);
      setLoading(false);
    }, (err) => {
      console.error("Transactions Error:", err);
      setLoading(false);
      handleFirestoreError(err, OperationType.LIST, "transactions");
    });

    // Real-time Withdrawals
    const wQ = query(
      collection(db, "withdrawals"),
      where("userId", "==", user.uid)
    );

    const unsubscribeW = onSnapshot(wQ, (snapshot) => {
      const sorted = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) => {
          const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
          const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });
      setWithdrawals(sorted);
    }, (err) => {
      console.error("Withdrawals Error:", err);
      handleFirestoreError(err, OperationType.LIST, "withdrawals");
    });

    return () => {
      unsubscribeT();
      unsubscribeW();
    };
  };

  useEffect(() => {
    const unsub = fetchData();
    return () => {
      if (typeof unsub === 'function') {
        (unsub as () => void)();
      }
    };
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = parseFloat(amount);
    
    if (!user || isNaN(withdrawAmount) || withdrawAmount < 500) {
      toast.error("Minimum withdrawal is ₹500");
      return;
    }
    
    if (withdrawAmount > (profile?.walletBalance || 0)) {
      toast.error("Withdrawal exceeds available balance.");
      return;
    }

    if (method === "BANK") {
      if (bankDetails.accountNumber !== bankDetails.confirmAccountNumber) {
        toast.error("Account numbers do not match.");
        return;
      }
    } else if (method === "UPI" && !upiId.includes("@")) {
      toast.error("Invalid UPI ID.");
      return;
    }

    setSubmitting(true);
    try {
      const withdrawalData = {
        userId: user.uid,
        userName: profile?.displayName || "Artist",
        userEmail: user.email,
        amount: withdrawAmount,
        method,
        details: method === "BANK" ? {
          accountHolder: bankDetails.accountHolder,
          accountNumber: bankDetails.accountNumber,
          ifscCode: bankDetails.ifscCode,
          bankName: bankDetails.bankName
        } : { upiId },
        status: "pending",
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "withdrawals"), withdrawalData);
      
      toast.success("Withdrawal request submitted successfully.");
      setAmount("");
      setShowForm(false);
      fetchData();
    } catch (err: any) {
      console.error("Withdrawal Error:", err);
      toast.error("Submission failed. Security rules might be blocking this request.");
    } finally {
      setSubmitting(false);
    }
  };

  const lastPayment = useMemo(() => {
    const paid = withdrawals.find(w => w.status === 'paid');
    return paid ? paid.amount : 0;
  }, [withdrawals]);

  const exportCSV = () => {
    const headers = ["Date", "Description", "Type", "Amount", "Status"];
    const rows = filteredTransactions.map(t => [
      formatDate(t.createdAt),
      t.description || t.notes || "System Entry",
      t.type.toUpperCase(),
      t.amount,
      t.status || "COMPLETED"
    ]);

    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ind_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Identity Ledger Exported Contextually.");
  };

  const chartData = useMemo(() => {
    // Generate last 6 months data
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = months[d.getMonth()];
      const earnings = transactions
        .filter(t => {
          const tDate = t.createdAt?.seconds ? new Date(t.createdAt.seconds * 1000) : new Date(t.createdAt);
          return t.type === 'earning' && tDate?.getMonth() === d.getMonth();
        })
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      result.push({ name: mName, amount: earnings });
    }
    return result;
  }, [transactions]);

  const platformData = useMemo(() => {
    const platforms: Record<string, number> = {
      'Spotify': 0,
      'Apple': 0,
      'YouTube': 0,
      'Other': 0
    };
    
    transactions.filter(t => t.type === 'earning').forEach(t => {
      const p = t.platform || 'Other';
      if (platforms[p] !== undefined) platforms[p] += t.amount || 0;
      else platforms['Other'] += t.amount || 0;
    });

    return Object.entries(platforms).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const filteredTransactions = transactions.filter(t => 
    filter === "all" ? true : t.type === filter
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-white p-4 md:p-12 space-y-8 md:space-y-12 pb-32 font-sans overflow-x-hidden">
      <header className="space-y-4 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-3 text-cyan-400">
          <Wallet className="w-6 h-6" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Treasury Ops</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase break-words">IND <span className="text-cyan-400">WALLET</span></h1>
        <p className="text-slate-500 max-w-xl font-medium mx-auto md:mx-0">Manage your global music royalties, track platform earnings, and process payouts securely.</p>
      </header>

      {/* Summary Section */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          { label: "Available Balance", value: profile?.walletBalance || 0, icon: CreditCard, accent: "text-cyan-400" },
          { label: "Lifetime Earnings", value: profile?.totalEarned || 0, icon: TrendingUp, accent: "text-emerald-400" },
          { label: "Last Disbursed", value: lastPayment, icon: History, accent: "text-rose-400" },
          { label: "Pending Vault", value: withdrawals.filter(w => w.status === 'pending').reduce((s, w) => s + w.amount, 0), icon: Target, accent: "text-yellow-400" },
        ].map((stat, i) => (
          <motion.div 
            variants={itemVariants}
            key={i} 
            className="bg-[#161B22]/60 backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-white/10 transition-colors shadow-2xl"
            style={{ WebkitBackdropFilter: 'blur(12px)' }}
          >
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <stat.icon className={cn("w-6 h-6", stat.accent)} />
                {stat.label === "Pending Vault" && stat.value > 0 && (
                   <span className="flex h-2 w-2 rounded-full bg-yellow-400 animate-ping"></span>
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                <h3 className={cn(
                   "text-2xl md:text-3xl font-black tracking-tight",
                   stat.label === "Pending Vault" && stat.value > 0 ? "text-yellow-400" : "text-white"
                )}>{formatCurrency(stat.value)}</h3>
              </div>
            </div>
            <div className={cn("absolute -bottom-4 -right-4 w-24 h-24 blur-[60px] opacity-20 transition-all group-hover:scale-150", stat.accent.replace('text', 'bg'))}></div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-12">
        {/* Left Column: Chart & Form */}
        <div className="lg:col-span-2 space-y-12">
          {/* Earnings Analytics */}
          <section className="bg-[#161B22]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 md:p-12 space-y-6 md:space-y-8 shadow-3xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                <TrendingUp className="text-cyan-400 w-5 h-5 md:w-6 md:h-6" /> Revenue Stream
              </h2>
              <div className="flex flex-wrap gap-3 md:gap-4">
                {platformData.map((p) => (
                   <div key={p.name} className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        p.name === 'Spotify' ? "bg-emerald-500" :
                        p.name === 'Apple' ? "bg-rose-500" :
                        p.name === 'YouTube' ? "bg-red-600" : "bg-slate-500"
                      )}></div>
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{p.name}</span>
                   </div>
                ))}
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#ffffff20" 
                    fontSize={10} 
                    fontWeight="bold" 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#ffffff20" 
                    fontSize={10} 
                    fontWeight="bold" 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#161B22', border: '1px solid #ffffff10', borderRadius: '12px' }}
                    itemStyle={{ color: '#00E5FF', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#00E5FF" strokeWidth={4} fillOpacity={1} fill="url(#colorAmt)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Transaction History Overhaul */}
          <section className="space-y-6 md:space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-6 md:pb-8">
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Ledger <span className="text-slate-600">Sync</span></h2>
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <button 
                  onClick={exportCSV}
                  className="w-full sm:w-auto px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 hover:bg-white text-white hover:text-black transition-all"
                >
                  Export CSV
                </button>
                <div className="flex bg-[#161B22] p-1 rounded-2xl border border-white/5 w-full sm:w-auto overflow-x-auto scrollbar-hide">
                  {(['all', 'earning', 'withdrawal'] as const).map(f => (
                    <button 
                      key={f}
                      onClick={() => setFilter(f)}
                      className={cn(
                        "flex-1 sm:flex-none px-4 md:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                        filter === f ? "bg-cyan-500 text-black shadow-lg shadow-cyan-900/40" : "text-slate-500 hover:text-white"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {filteredTransactions.map((tx, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={tx.id} 
                  className="bg-[#161B22]/40 border border-white/5 p-4 md:p-6 rounded-2xl md:rounded-[2rem] flex flex-row items-center justify-between gap-4 group hover:bg-[#161B22] transition-all"
                >
                  <div className="flex items-center gap-3 md:gap-6 min-w-0">
                    <div className={cn(
                      "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0",
                      tx.type === 'earning' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    )}>
                      {tx.type === 'earning' ? <TrendingUp className="w-5 h-5 md:w-6 md:h-6" /> : <ArrowRight className={cn("w-5 h-5 md:w-6 md:h-6", tx.type === 'withdrawal' && "rotate-45")} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm font-black tracking-tight group-hover:text-cyan-400 transition-colors uppercase truncate">{tx.notes || tx.description || 'System Entry'}</p>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 truncate">
                        {tx.period || `${tx.month || ''} ${tx.year || ''}`} • {formatDate(tx.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn(
                      "text-sm md:text-lg font-black font-display",
                      tx.type === 'earning' || tx.type === 'add' ? "text-emerald-400" : "text-rose-400"
                    )}>
                      {tx.type === 'earning' || tx.type === 'add' ? "+" : "-"}{formatCurrency(tx.amount)}
                    </p>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-600 hidden sm:block mt-1">SECURED</span>
                  </div>
                </motion.div>
              ))}
              {filteredTransactions.length === 0 && (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                  <p className="text-xs font-black text-slate-700 uppercase tracking-[0.3em]">No signals detected in this sector</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Withdrawals & Actions */}
        <div className="space-y-10">
          {/* Action Trigger */}
          <button 
            onClick={() => setShowForm(true)}
            className="w-full bg-cyan-500 p-8 rounded-[2.5rem] group relative overflow-hidden flex items-center justify-between shadow-2xl shadow-cyan-900/20 active:scale-95 transition-all text-black"
          >
            <div className="relative z-10 text-left">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Initiate Protocol</p>
              <h3 className="text-2xl font-black tracking-tighter">REQUEST WITHDRAWAL</h3>
            </div>
            <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center group-hover:translate-x-2 transition-transform">
              <ArrowUpRight className="w-7 h-7 text-cyan-400" />
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white blur-[60px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
          </button>

          {/* Quick Stats / Guard */}
          <div className="bg-[#161B22] p-8 rounded-[2.5rem] border border-white/5 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-3">
              <ShieldCheck className="w-4 h-4" /> DISBURSEMENT POLICIES
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-4 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5"></div>
                <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed">Minimum limit: ₹500 INR</p>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5"></div>
                <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed">Processing span: 3-7 Business rotations</p>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5"></div>
                <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed">Cross-verification on first withdrawal</p>
              </li>
            </ul>
          </div>

          {/* Recent Payout Status Table */}
          <section className="space-y-6">
            <h3 className="text-xl font-black uppercase tracking-tight">VAULT QUEUE</h3>
            <div className="space-y-3">
              {withdrawals.slice(0, 5).map((w) => (
                <div key={w.id} className="bg-[#161B22]/60 border border-white/5 p-5 rounded-3xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black tracking-tight">{formatCurrency(w.amount)}</p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase mt-1">{formatDate(w.createdAt)}</p>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                    WITHDRAWAL_STATUSES[w.status as keyof typeof WITHDRAWAL_STATUSES]?.color || "text-slate-500 border-slate-800",
                    WITHDRAWAL_STATUSES[w.status as keyof typeof WITHDRAWAL_STATUSES]?.bg || "bg-slate-800"
                  )}>
                    {w.status}
                  </div>
                </div>
              ))}
              {withdrawals.length === 0 && (
                <p className="text-[10px] font-bold text-slate-600 uppercase text-center py-10">Queue Empty</p>
              )}
            </div>
          </section>
        </div>
      </div>

          {/* Withdrawal Overlay Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#0D1117]/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto"
                style={{ WebkitBackdropFilter: 'blur(40px)' }}
              >
                <motion.div 
                  initial={{ y: 50, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 50, opacity: 0, scale: 0.9 }}
                  className="bg-[#161B22] w-full max-w-2xl rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-14 border border-white/10 relative shadow-3xl"
                >
                  <button 
                    onClick={() => setShowForm(false)}
                    className="absolute top-6 right-6 md:top-8 md:right-8 text-slate-500 hover:text-white transition-colors p-2"
                  >
                    <Plus className="w-6 h-6 md:w-8 md:h-8 rotate-45" />
                  </button>
    
                  <div className="space-y-8 md:space-y-12">
                    <header className="space-y-3">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-cyan-500 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-black shadow-2xl shadow-cyan-500/20">
                        <ArrowUpRight className="w-8 h-8 md:w-10 md:h-10" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">VAULT DISBURSEMENT</h2>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Authorized Protocol IND-FIN-001</p>
                    </header>
    
                    <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Withdrawal Volume (INR)</label>
                        <div className="relative">
                          <span className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 text-2xl md:text-4xl font-black text-cyan-400/30 font-display">₹</span>
                          <input 
                            required
                            type="number"
                            min="500"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="w-full bg-[#0D1117] border border-white/5 rounded-[1.5rem] md:rounded-[2rem] py-6 md:py-8 pl-12 md:pl-16 pr-6 md:pr-8 text-3xl md:text-5xl font-black font-display text-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all placeholder:text-white/5"
                            placeholder="0.00"
                          />
                        </div>
                    <div className="flex justify-between px-6 pt-2">
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Available Balance: {formatCurrency(profile?.walletBalance || 0)}</p>
                       <button 
                        type="button" 
                        onClick={() => setAmount(Math.floor(profile?.walletBalance || 0).toString())}
                        className="text-[10px] font-black text-cyan-400 uppercase tracking-widest hover:underline"
                       >
                        MAXIMUM
                       </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Disbursement Method</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        type="button"
                        onClick={() => setMethod("BANK")}
                        className={cn(
                          "py-6 rounded-3xl border transition-all flex flex-col items-center gap-3",
                          method === "BANK" ? "bg-white text-black border-white" : "bg-transparent border-white/5 text-slate-500 hover:border-white/10"
                        )}
                      >
                        <Building className="w-8 h-8" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Bank Transfer</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setMethod("UPI")}
                        className={cn(
                          "py-6 rounded-3xl border transition-all flex flex-col items-center gap-3",
                          method === "UPI" ? "bg-white text-black border-white" : "bg-transparent border-white/5 text-slate-500 hover:border-white/10"
                        )}
                      >
                        <Smartphone className="w-8 h-8" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Digital UPI</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    {method === "BANK" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Bank Name</label>
                          <input required placeholder="E.G. HDFC BANK" className="bg-[#0D1117] border border-white/5 px-5 py-4 rounded-2xl text-[11px] font-black tracking-widest outline-none text-white w-full uppercase focus:border-cyan-500/50 transition-colors" value={bankDetails.bankName} onChange={e => setBankDetails({...bankDetails, bankName: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Holder Name</label>
                          <input required placeholder="NAME ON ACCOUNT" className="bg-[#0D1117] border border-white/5 px-5 py-4 rounded-2xl text-[11px] font-black tracking-widest outline-none text-white w-full uppercase focus:border-cyan-500/50 transition-colors" value={bankDetails.accountHolder} onChange={e => setBankDetails({...bankDetails, accountHolder: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Account Number</label>
                          <input required placeholder="1234567890" className="bg-[#0D1117] border border-white/5 px-5 py-4 rounded-2xl text-[11px] font-black tracking-widest outline-none text-white w-full uppercase focus:border-cyan-500/50 transition-colors" value={bankDetails.accountNumber} onChange={e => setBankDetails({...bankDetails, accountNumber: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Confirm Number</label>
                          <input required placeholder="RE-ENTER NUMBER" className="bg-[#0D1117] border border-white/5 px-5 py-4 rounded-2xl text-[11px] font-black tracking-widest outline-none text-white w-full uppercase focus:border-cyan-500/50 transition-colors" value={bankDetails.confirmAccountNumber} onChange={e => setBankDetails({...bankDetails, confirmAccountNumber: e.target.value})} />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-[9px] font-black text-slate-500 uppercase ml-2">IFSC Code</label>
                          <input required placeholder="HDFC0001234" className="bg-[#0D1117] border border-white/5 px-5 py-4 rounded-2xl text-[11px] font-black tracking-widest outline-none text-white w-full uppercase focus:border-cyan-500/50 transition-colors" value={bankDetails.ifscCode.toUpperCase()} onChange={e => setBankDetails({...bankDetails, ifscCode: e.target.value})} />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <label className="text-center block text-[10px] font-black text-slate-500 uppercase tracking-widest">Virtual Payment Address</label>
                        <input required placeholder="ENTER UPI ID (e.g., example@upi)" className="bg-[#0D1117] border border-white/5 p-6 rounded-2xl text-lg md:text-xl font-black tracking-tight outline-none text-cyan-400 w-full text-center focus:border-cyan-500/50 transition-colors" value={upiId} onChange={e => setUpiId(e.target.value)} />
                      </div>
                    )}
                  </div>

                  <button 
                    disabled={submitting}
                    className="w-full py-8 bg-cyan-500 text-black rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-cyan-900/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {submitting ? "ENCRYPTING SIGNAL..." : "INITIATE WITHDRAWAL SIGNAL"}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
