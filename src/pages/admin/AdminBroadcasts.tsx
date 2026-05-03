import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { 
  Bell, 
  Send, 
  Clock, 
  Trash2, 
  Info,
  ChevronRight,
  ShieldAlert,
  Zap,
  Globe,
  Plus,
  MessageSquare
} from "lucide-react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";

export default function AdminBroadcasts() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [submitting, setSubmitting] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    const snap = await getDocs(query(collection(db, "system_notifications"), orderBy("createdAt", "desc"), limit(20)));
    setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "system_notifications"), {
        title,
        message,
        type,
        createdAt: new Date().toISOString()
      });
      setTitle("");
      setMessage("");
      fetchNotifications();
      alert("Broadcast transmitted to all active users.");
    } catch (err) {
      alert("Transmission Failure.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col lg:flex-row gap-12 text-left">
         {/* New Broadcast Form */}
         <div className="flex-1 space-y-8">
            <div className="space-y-2">
               <h1 className="text-5xl font-black font-display tracking-tight uppercase">System <span className="text-brand-blue">Broadcast</span></h1>
               <p className="text-slate-400 font-medium text-xs uppercase tracking-widest ">Deploy global notifications to the user dashboard mesh.</p>
            </div>

            <div className="bg-[#1E293B] rounded-[4rem] p-12 border border-slate-800 shadow-3xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
               <div className="relative z-10 space-y-10">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl group-hover:rotate-6 transition-transform">
                        <Zap className="w-8 h-8 text-brand-blue fill-brand-blue" />
                     </div>
                     <div>
                        <h3 className="text-2xl font-black font-display uppercase tracking-tight text-white">Transmit Signal</h3>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Global Alert Protocol</p>
                     </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Signal Title</label>
                           <input 
                              required
                              value={title}
                              onChange={e => setTitle(e.target.value)}
                              placeholder="URGENT: Maintenance Window..."
                              className="w-full bg-slate-900 border-none rounded-2xl p-5 text-sm font-bold text-white focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all shadow-inner"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Signal Priority</label>
                           <select 
                              value={type}
                              onChange={e => setType(e.target.value)}
                              className="w-full bg-slate-900 border-none rounded-2xl p-5 text-sm font-bold text-white focus:ring-4 focus:ring-brand-blue/10 outline-none appearance-none"
                           >
                              <option value="info" className="bg-slate-900">Standard Info (Blue)</option>
                              <option value="warning" className="bg-slate-900">Priority Warning (Amber)</option>
                              <option value="urgent" className="bg-slate-900">Critical Urgent (Rose)</option>
                           </select>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Message Body</label>
                        <textarea 
                           required
                           rows={5}
                           value={message}
                           onChange={e => setMessage(e.target.value)}
                           placeholder="Describe the system update or event..."
                           className="w-full bg-slate-900 border-none rounded-[2.5rem] p-8 text-sm font-bold text-white focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all shadow-inner leading-relaxed"
                        />
                     </div>
                     <button 
                        disabled={submitting}
                        className="w-full py-6 bg-brand-blue text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-blue-900/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                     >
                        {submitting ? "TRANSMITTING DATA..." : "INITIATE BROADCAST"}
                     </button>
                  </form>
               </div>
            </div>
         </div>

         {/* History / Log */}
         <div className="w-full lg:w-[400px] space-y-8">
            <h2 className="text-2xl font-black font-display tracking-tight uppercase flex items-center gap-4 text-white">
               <Clock className="w-6 h-6 text-brand-blue" /> Transit Log
            </h2>
            <div className="space-y-6">
               {notifications.map((n, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={n.id} 
                    className="bg-[#1E293B] p-8 rounded-[3.5rem] border border-slate-800 shadow-sm space-y-4 group hover:border-slate-700 transition-all text-left"
                  >
                     <div className="flex items-start justify-between">
                        <span className={cn(
                           "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                           n.type === 'urgent' ? "bg-rose-500/10 border-rose-500/20 text-rose-500" : 
                           n.type === 'warning' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-blue-500/10 border-blue-500/20 text-blue-500"
                        )}>{n.type}</span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{new Date(n.createdAt).toLocaleDateString()}</span>
                     </div>
                     <div>
                        <h4 className="font-bold text-white uppercase text-xs tracking-tight group-hover:text-brand-blue transition-colors line-clamp-1">{n.title}</h4>
                        <p className="text-[10px] text-slate-500 font-medium mt-1 italic line-clamp-2">"{n.message}"</p>
                     </div>
                  </motion.div>
               ))}
               {notifications.length === 0 && !loading && (
                  <div className="py-20 text-center bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-800">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">No active signals in catalog</p>
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
