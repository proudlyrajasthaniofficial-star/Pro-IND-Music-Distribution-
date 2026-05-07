import React, { useEffect, useState, useMemo } from "react";
import { collection, query, where, addDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { 
  Wallet, ArrowUpRight, History, TrendingUp, CreditCard, Target, ArrowRight, X, Plus
} from "lucide-react";
import { formatCurrency, cn, formatDate } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
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
    accountHolder: "", accountNumber: "", confirmAccountNumber: "", ifscCode: "", bankName: ""
  });
  const [upiId, setUpiId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "earning" | "withdrawal">("all");

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    
    const tQ = query(collection(db, "transactions"), where("userId", "==", user.uid));
    const unsubscribeT = onSnapshot(tQ, (snapshot) => {
      const sorted = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) => {
          const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
          const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });
      setTransactions(sorted);
      setLoading(false);
    }, (err) => { setLoading(false); handleFirestoreError(err, OperationType.LIST, "transactions"); });

    const wQ = query(collection(db, "withdrawals"), where("userId", "==", user.uid));
    const unsubscribeW = onSnapshot(wQ, (snapshot) => {
      const sorted = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) => {
          const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
          const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });
      setWithdrawals(sorted);
    }, (err) => { handleFirestoreError(err, OperationType.LIST, "withdrawals"); });

    return () => { unsubscribeT(); unsubscribeW(); };
  };

  useEffect(() => { fetchData(); }, [user]);

  const lastPayment = useMemo(() => {
    const paid = withdrawals.find(w => w.status === 'paid');
    return paid ? paid.amount : 0;
  }, [withdrawals]);

  const filteredTransactions = transactions.filter(t => filter === "all" ? true : t.type === filter);

  const chartData = useMemo(() => {
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

  if (loading && !profile) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6 md:space-y-12 pb-20">
      {/* Header */}
      <header className="space-y-2 md:space-y-4">
        <div className="flex items-center gap-2 text-cyan-400">
          <Wallet className="w-4 h-4 md:w-6 md:h-6" />
          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">Treasury Ops</span>
        </div>
        <h1 className="text-3xl md:text-6xl font-black tracking-tighter uppercase leading-none">IND <span className="text-cyan-400">WALLET</span></h1>
      </header>

      {/* Summary Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "Balance", value: profile?.walletBalance || 0, icon: CreditCard, color: "text-cyan-400" },
          { label: "Lifetime", value: profile?.totalEarned || 0, icon: TrendingUp, color: "text-emerald-400" },
          { label: "Disbursed", value: lastPayment, icon: History, color: "text-rose-400" },
          { label: "Pending", value: withdrawals.filter(w => w.status === 'pending').reduce((s, w) => s + w.amount, 0), icon: Target, color: "text-yellow-400" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#161B22] border border-white/5 rounded-2xl p-5 md:p-6 relative overflow-hidden">
            <div className="relative z-10 flex flex-col justify-between h-full">
              <stat.icon className={cn("w-5 h-5 mb-4", stat.color)} />
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-xl md:text-2xl font-black text-white">{formatCurrency(stat.value)}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 md:gap-12">
        {/* Chart & Ledger */}
        <div className="lg:col-span-2 space-y-6 md:space-y-12 min-w-0">
          {/* Chart Section */}
          <section className="bg-[#161B22] border border-white/5 rounded-3xl p-4 md:p-8 overflow-hidden">
            <h2 className="text-lg md:text-xl font-black uppercase mb-6 flex items-center gap-2">
              <TrendingUp className="text-cyan-400 w-5 h-5" /> Revenue
            </h2>
            <div className="h-[200px] md:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #ffffff10' }} />
                  <Area type="monotone" dataKey="amount" stroke="#00E5FF" strokeWidth={3} fill="url(#colorAmt)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Ledger Section */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <h2 className="text-xl md:text-2xl font-black uppercase">Ledger <span className="text-slate-600">Sync</span></h2>
              <div className="flex bg-[#161B22] p-1 rounded-xl border border-white/5 w-full sm:w-auto">
                {['all', 'earning', 'withdrawal'].map(f => (
                  <button key={f} onClick={() => setFilter(f as any)} className={cn(
                    "flex-1 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                    filter === f ? "bg-cyan-500 text-black" : "text-slate-500"
                  )}>{f}</button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="bg-[#161B22]/40 border border-white/5 p-4 rounded-xl flex items-center justify-between gap-3 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", tx.type === 'earning' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400")}>
                      {tx.type === 'earning' ? <TrendingUp className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black uppercase truncate text-white">{tx.notes || tx.description || 'Entry'}</p>
                      <p className="text-[8px] font-bold text-slate-500 uppercase">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-xs md:text-sm font-black", tx.type === 'earning' ? "text-emerald-400" : "text-rose-400")}>
                      {tx.type === 'earning' ? "+" : "-"}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Request Panel */}
        <div className="space-y-6">
          <button onClick={() => setShowForm(true)} className="w-full bg-cyan-500 p-6 rounded-2xl flex items-center justify-between text-black active:scale-95 transition-all">
            <div className="text-left">
              <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Initiate Protocol</p>
              <h3 className="text-lg font-black tracking-tight">WITHDRAWAL</h3>
            </div>
            <ArrowUpRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
                                        }
