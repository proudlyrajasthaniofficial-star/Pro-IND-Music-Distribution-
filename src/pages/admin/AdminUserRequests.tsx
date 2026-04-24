import React, { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, updateDoc, doc, addDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { 
  MessageSquare, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  User, 
  X,
  Filter,
  Eye,
  AlertTriangle,
  Zap,
  Send,
  MoreVertical,
  ExternalLink,
  ShieldCheck,
  History,
  Info
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { id: 'pending', label: 'Pending', color: 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' },
  { id: 'in_review', label: 'In Review', color: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' },
  { id: 'approved', label: 'Approve', color: 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' },
  { id: 'rejected', label: 'Reject', color: 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' },
  { id: 'completed', label: 'Complete', color: 'bg-slate-800 text-slate-300 hover:bg-slate-700' },
];

const PRIORITY_COLORS: Record<string, string> = {
  normal: "bg-slate-800 text-slate-400",
  high: "bg-amber-500/10 text-amber-500",
  urgent: "bg-rose-500 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.4)]",
};

export default function AdminUserRequests() {
  const { user: adminUser } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [adminMsg, setAdminMsg] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  useEffect(() => {
    const q = query(collection(db, "user_requests"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    if (!adminUser) return;
    
    try {
      const reqRef = doc(db, "user_requests", requestId);
      const updateData: any = { 
        status: newStatus,
        updatedAt: serverTimestamp(),
      };
      
      if (adminMsg) updateData.adminResponse = adminMsg;
      if (internalNotes) updateData.adminNotes = internalNotes;

      await updateDoc(reqRef, updateData);

      // Log action
      await addDoc(collection(db, "request_logs"), {
        requestId,
        userId: selectedRequest?.userId,
        action: `Status updated to ${newStatus}`,
        adminId: adminUser.uid,
        note: adminMsg || "Status changed by admin",
        timestamp: serverTimestamp(),
      });

      // Send User Notification
      await addDoc(collection(db, "user_notifications"), {
        userId: selectedRequest?.userId,
        title: `Request ${newStatus.toUpperCase()}`,
        message: `Your request ${selectedRequest?.ticketId} (${selectedRequest?.type}) is now ${newStatus.replace('_', ' ')}. ${adminMsg}`,
        type: newStatus === 'approved' || newStatus === 'completed' ? 'success' : 
              newStatus === 'rejected' ? 'error' : 'info',
        read: false,
        createdAt: new Date().toISOString(),
      });

      toast.success(`Request marked as ${newStatus}`);
      if (newStatus === 'completed') {
        setSelectedRequest(null);
      } else if (selectedRequest) {
        setSelectedRequest({ ...selectedRequest, status: newStatus });
      }
      setAdminMsg("");
      setInternalNotes("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status.");
    }
  };

  const filtered = requests.filter(r => {
    const matchesFilter = filter === "all" || r.status === filter;
    const matchesSearch = 
      r.ticketId.toLowerCase().includes(search.toLowerCase()) ||
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-12">
      {/* Admin Interface Header */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-lg mb-3">
             <Zap className="w-3.5 h-3.5" />
             <span className="text-[10px] font-black uppercase tracking-widest">Universal Request Control</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight text-white uppercase leading-none">Transmission Hub</h1>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-white/5 backdrop-blur-md">
           <div className="flex items-center gap-3 px-4 border-r border-white/5">
              <Search className="w-4 h-4 text-slate-500" />
              <input 
                placeholder="Search encrypted signals..." 
                className="bg-transparent border-none focus:ring-0 text-[11px] font-bold text-white placeholder:text-slate-600 w-48"
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <div className="flex gap-2">
              {["all", "pending", "in_review", "approved", "completed"].map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                    filter === f ? "bg-brand-blue text-white shadow-xl shadow-blue-500/20" : "bg-transparent text-slate-500 hover:text-white"
                  )}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Request List Matrix */}
        <div className="lg:col-span-12 xl:col-span-8 bg-slate-900/40 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-xl">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                       <th className="px-10 py-8">Ticket / Origin</th>
                       <th className="px-6 py-8 text-center">Type</th>
                       <th className="px-6 py-8 text-center">Priority</th>
                       <th className="px-6 py-8 text-center">Status</th>
                       <th className="px-10 py-8 text-right">Access</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {filtered.map((r) => (
                       <tr key={r.id} className="group hover:bg-white/[0.02] transition-colors relative">
                          <td className="px-10 py-8">
                             <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-brand-blue group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                   <MessageSquare className="w-6 h-6" />
                                </div>
                                <div className="max-w-[200px]">
                                   <p className="text-sm font-black text-white uppercase tracking-tight line-clamp-1">{r.ticketId}</p>
                                   <div className="flex items-center gap-2 mt-1 Opacity-40">
                                      <User className="w-3 h-3" />
                                      <span className="text-[9px] font-bold text-slate-400 truncate">{r.userName}</span>
                                   </div>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             {r.type.replace('_', ' ')}
                          </td>
                          <td className="px-6 py-8">
                             <div className="flex justify-center">
                                <span className={cn(
                                   "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                                   PRIORITY_COLORS[r.priority] || "bg-slate-800 text-slate-400"
                                )}>
                                   {r.priority}
                                </span>
                             </div>
                          </td>
                          <td className="px-6 py-8">
                             <div className="flex justify-center">
                                <span className={cn(
                                   "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-current bg-transparent",
                                   r.status === 'pending' ? "text-amber-500" : 
                                   r.status === 'approved' ? "text-emerald-500" :
                                   r.status === 'rejected' ? "text-rose-500" : "text-brand-blue"
                                )}>
                                   {r.status.replace('_', ' ')}
                                </span>
                             </div>
                          </td>
                          <td className="px-10 py-8 text-right">
                             <button
                               onClick={() => setSelectedRequest(r)}
                               className="p-3 bg-white/5 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-xl transition-all"
                             >
                                <Eye className="w-5 h-5" />
                             </button>
                          </td>
                       </tr>
                    ))}
                    {filtered.length === 0 && (
                       <tr>
                          <td colSpan={5} className="px-10 py-32 text-center">
                             <div className="opacity-10 flex flex-col items-center gap-4">
                                <ShieldCheck className="w-20 h-20 text-slate-500" />
                                <p className="text-xs font-black uppercase tracking-[0.5em] text-slate-500">Security Clearance: No Pending Signals</p>
                             </div>
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Sidebar Space or Overlay Drawer could be here */}
      </div>

      {/* Selected Request Drawer */}
      <AnimatePresence>
        {selectedRequest && (
           <div className="fixed inset-0 z-[200] flex items-center justify-end p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedRequest(null)}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
              />
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                className="relative w-full max-w-2xl h-full bg-[#1e293b] rounded-[3rem] shadow-2xl border-l border-white/10 overflow-hidden flex flex-col"
              >
                 <div className="p-10 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">{selectedRequest.ticketId}</span>
                            <span className={cn(
                                "px-2 py-0.5 rounded text-[8px] font-black uppercase",
                                PRIORITY_COLORS[selectedRequest.priority]
                            )}>{selectedRequest.priority}</span>
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase leading-none">Inspect Transmission</h2>
                    </div>
                    <button 
                      onClick={() => setSelectedRequest(null)}
                      className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-all"
                    >
                       <X className="w-6 h-6" />
                    </button>
                 </div>

                 <div className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-hide">
                    {/* User Specs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-white/5">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Identity</span>
                            <p className="text-sm font-black text-white uppercase">{selectedRequest.userName}</p>
                            <p className="text-[10px] font-medium text-slate-400 mt-1">{selectedRequest.userEmail}</p>
                        </div>
                        <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-white/5">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Timing</span>
                            <p className="text-sm font-black text-white uppercase">{selectedRequest.createdAt?.toDate().toLocaleDateString()}</p>
                            <p className="text-[10px] font-medium text-slate-400 mt-1">{selectedRequest.createdAt?.toDate().toLocaleTimeString()}</p>
                        </div>
                    </div>

                    {/* Data Specs */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Info className="w-4 h-4 text-brand-blue" />
                            <h3 className="text-xs font-black text-white uppercase tracking-widest">Data Specifications</h3>
                        </div>
                        <div className="bg-white/5 p-8 rounded-[2.5rem] space-y-4 border border-white/5 font-mono">
                            {Object.entries(selectedRequest.data || {}).map(([key, val]) => (
                                val && (
                                    <div key={key} className="flex justify-between border-b border-white/5 pb-3">
                                        <span className="text-[10px] text-slate-500 uppercase font-black">{key}</span>
                                        <span className="text-[11px] text-emerald-400 font-bold">{String(val)}</span>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>

                    {/* Action Panel */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <h3 className="text-xs font-black text-white uppercase tracking-widest">Security Override</h3>
                        </div>
                        <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 block mb-3">Admin Instruction (Public)</label>
                                <textarea 
                                  placeholder="Type response for the artist..."
                                  className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-[11px] font-bold text-white h-24"
                                  value={adminMsg}
                                  onChange={(e) => setAdminMsg(e.target.value)}
                                ></textarea>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                {STATUS_OPTIONS.map(opt => (
                                    <button 
                                      key={opt.id}
                                      onClick={() => handleUpdateStatus(selectedRequest.id, opt.id)}
                                      className={cn(
                                        "px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                        selectedRequest.status === opt.id ? "bg-white text-slate-900 border-white" : opt.color
                                      )}
                                    >
                                      {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* History Logs */}
                    <div className="space-y-6 opacity-40">
                        <div className="flex items-center gap-3">
                            <History className="w-4 h-4 text-slate-400" />
                            <h3 className="text-xs font-black text-white uppercase tracking-widest">Action Logs</h3>
                        </div>
                        <div className="space-y-4 border-l border-white/5 ml-2 pl-6">
                            <div className="relative">
                                <div className="absolute -left-[1.85rem] top-1 w-2.5 h-2.5 bg-brand-blue rounded-full"></div>
                                <p className="text-[10px] font-black text-white uppercase">Request Initialized</p>
                                <p className="text-[9px] text-slate-500 mt-1">Status: Pending</p>
                            </div>
                        </div>
                    </div>
                 </div>
              </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
}
