import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, updateDoc, doc, where, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { MessageSquare, Search, Clock, CheckCircle2, AlertCircle, Mail, User, ArrowRight, CornerDownRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { sendEmailNotification } from "../../lib/email";

export default function AdminSupport() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [replyTicket, setReplyTicket] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchTickets = async () => {
    const q = query(collection(db, "support_tickets"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const submitReply = async () => {
     if (!replyTicket || !replyMessage.trim()) return;
     setSubmittingReply(true);
     try {
       await updateDoc(doc(db, "support_tickets", replyTicket.id), { 
         adminReply: replyMessage,
         status: "resolved",
         repliedAt: new Date().toISOString()
       });
       
       if (replyTicket.userEmail) {
          await sendEmailNotification(
             replyTicket.userEmail, 
             `Support Reply: ${replyTicket.subject}`,
             `<div style="font-family: sans-serif; padding: 20px;">
                <h2>Support Ticket Update</h2>
                <p>Hello ${replyTicket.userName || 'Artist'},</p>
                <p>Our support team has replied to your ticket "<strong>${replyTicket.subject}</strong>":</p>
                <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin:0; font-family: monospace;">${replyMessage}</p>
                </div>
                <p>Status has been marked as <strong>RESOLVED</strong>.</p>
                <a href="https://yourplatform.com/dashboard/support" style="background: #0066ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View in Dashboard</a>
             </div>`
          );
       }
       
       toast.success("Reply dispatched & ticket resolved.");
       setReplyMessage("");
       setReplyTicket(null);
       fetchTickets();
     } catch (err) {
       toast.error("Failed to send reply");
     } finally {
       setSubmittingReply(false);
     }
  };

  const updateTicketStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "support_tickets", id), { status });
      setTickets(tickets.map(t => t.id === id ? { ...t, status } : t));
      toast.success(`Ticket marked as ${status}`);
    } catch (err) {
      toast.error("Status update failed.");
    }
  };

  const filtered = tickets.filter(t => filter === "all" || t.status === filter);

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight uppercase">Support Command</h1>
            <p className="text-slate-400 font-medium text-xs uppercase tracking-widest mt-2 px-4 md:px-0">Manage artist inquiries, technical disputes, and incident reports.</p>
         </div>
         <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2">
            {["all", "pending", "resolved"].map(f => (
               <button 
                 key={f}
                 onClick={() => setFilter(f)}
                 className={cn(
                   "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                   filter === f ? "bg-brand-blue text-white shadow-xl shadow-blue-500/20" : "bg-slate-800 text-slate-500 hover:text-white"
                 )}
               >
                  {f}
               </button>
            ))}
         </div>
      </div>

      <div className="grid lg:grid-cols-1 gap-8">
         <div className="bg-[#1E293B] rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto custom-scrollbar">
               <table className="w-full text-left min-w-[1000px]">
                  <thead>
                     <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                        <th className="px-12 py-8">Ticket / Subject</th>
                        <th className="px-6 py-8">Requester</th>
                        <th className="px-6 py-8">Category</th>
                        <th className="px-6 py-8">Status</th>
                        <th className="px-12 py-8 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                     {filtered.map((t, i) => (
                        <tr key={i} className="group hover:bg-slate-800/50 transition-colors">
                           <td className="px-12 py-8">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-brand-blue">
                                    <MessageSquare className="w-6 h-6" />
                                 </div>
                                 <div className="max-w-[300px]">
                                    <p className="font-bold text-white text-sm line-clamp-1">{t.subject}</p>
                                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">ID: {t.id.slice(0, 10)}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-8">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                                    <User className="w-4 h-4" />
                                 </div>
                                 <div>
                                    <p className="text-[11px] font-bold text-white uppercase">{t.userName || "Artist"}</p>
                                    <p className="text-[9px] text-slate-600 truncate max-w-[120px]">{t.userEmail}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-8">
                              <span className="px-3 py-1 bg-slate-800 text-slate-400 text-[9px] font-black rounded-lg uppercase tracking-widest">
                                 {t.type || "General Inquiry"}
                              </span>
                           </td>
                           <td className="px-6 py-8">
                              <span className={cn(
                                 "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                                 t.status === 'resolved' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                              )}>
                                 {t.status}
                              </span>
                           </td>
                           <td className="px-12 py-8 text-right">
                              <div className="flex items-center justify-end gap-3">
                                 <button 
                                   onClick={() => setReplyTicket(t)}
                                   className="w-10 h-10 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center justify-center hover:bg-brand-blue transition-all hover:text-white"
                                   title="Reply to Ticket"
                                 >
                                    <CornerDownRight className="w-4 h-4" />
                                 </button>
                                 <button 
                                   onClick={() => updateTicketStatus(t.id, "resolved")}
                                   className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center hover:bg-emerald-500 transition-all hover:text-white"
                                 >
                                    <CheckCircle2 className="w-5 h-5" />
                                 </button>
                                 <button 
                                   onClick={() => updateTicketStatus(t.id, "pending")}
                                   className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center hover:bg-amber-500 transition-all hover:text-white"
                                 >
                                    <Clock className="w-5 h-5" />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                     {tickets.length === 0 && (
                        <tr>
                           <td colSpan={5} className="px-12 py-32 text-center">
                              <div className="flex flex-col items-center gap-4 opacity-20">
                                 <MessageSquare className="w-16 h-16 text-slate-500" />
                                 <p className="text-sm font-black uppercase tracking-widest text-slate-500">No support transmissions found</p>
                              </div>
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>

      <AnimatePresence>
        {replyTicket && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
           >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#1E293B] border border-slate-700 w-full max-w-lg rounded-[2.5rem] p-10 relative overflow-hidden"
              >
                 <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Reply to Support</h2>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">Subject: {replyTicket.subject}</p>
                 
                 <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 mb-6 max-h-32 overflow-y-auto custom-scrollbar">
                    <p className="text-xs text-slate-300 italic">"{replyTicket.message}"</p>
                 </div>

                 <textarea 
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value)}
                    placeholder="Write your response... This will automatically email the artist and mark the ticket as resolved."
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-sm font-bold text-white mb-6 h-32 focus:border-brand-blue transition-colors outline-none resize-none"
                 />
                 
                 <div className="flex justify-end gap-3">
                    <button 
                       onClick={() => setReplyTicket(null)}
                       disabled={submittingReply}
                       className="px-6 py-3 font-bold text-xs text-slate-400 hover:text-white uppercase tracking-widest transition-colors"
                    >
                       Cancel
                    </button>
                    <button 
                       onClick={submitReply}
                       disabled={submittingReply || !replyMessage.trim()}
                       className="bg-brand-blue text-white px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 disabled:opacity-50 transition-colors hover:bg-blue-600"
                    >
                       {submittingReply ? "Dispatching..." : "Send Reply & Resolve"}
                    </button>
                 </div>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
