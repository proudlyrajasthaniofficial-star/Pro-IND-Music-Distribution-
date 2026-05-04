import React, { useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs, orderBy, onSnapshot, doc, limit } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { MessageSquare, Send, Clock, CheckCircle2, AlertCircle, HelpCircle, LifeBuoy, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

export default function Support() {
  const { user, profile } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("General Inquiry");
  const [submitting, setSubmitting] = useState(false);
  const [releaseId, setReleaseId] = useState("");
  const [myReleases, setMyReleases] = useState<any[]>([]);

  // Chat state
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (selectedTicket) {
      const q = query(
        collection(db, "support_tickets", selectedTicket.id, "messages"),
        orderBy("createdAt", "asc")
      );
      const unsub = onSnapshot(q, (snap) => {
        setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => unsub();
    }
  }, [selectedTicket]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket || !user) return;
    
    const msg = newMessage;
    setNewMessage("");
    try {
      await addDoc(collection(db, "support_tickets", selectedTicket.id, "messages"), {
        userId: user.uid,
        userName: profile?.displayName || "Artist",
        message: msg,
        isAdmin: false,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      toast.error("Signal failure");
    }
  };

  const fetchTickets = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "support_tickets"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      const sorted = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => {
         return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
      setTickets(sorted);

      // Fetch releases
      const rq = query(collection(db, "releases"), where("userId", "==", user.uid));
      const rSnap = await getDocs(rq);
      setMyReleases(rSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Support fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !subject || !message) return;
    
    setSubmitting(true);
    try {
      const selectedRelease = myReleases.find(r => r.id === releaseId);
      await addDoc(collection(db, "support_tickets"), {
        userId: user.uid,
        userName: profile?.displayName || user.displayName || "Artist",
        userEmail: user.email,
        subject,
        message,
        type,
        releaseId,
        releaseTitle: selectedRelease?.title || "",
        status: "pending",
        createdAt: new Date().toISOString()
      });
      setSubject("");
      setMessage("");
      setReleaseId("");
      fetchTickets();
      toast.success("Support ticket transmitted. Our task force will respond shortly.");
    } catch (err) {
      toast.error("Transmission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row gap-12">
         {/* New Ticket Form */}
         <div className="flex-1 space-y-6 md:space-y-8">
            <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight uppercase px-2 md:px-0 text-left">Support <span className="text-brand-blue">Nexus</span></h1>
            <p className="text-sm md:text-base text-slate-400 font-medium px-2 md:px-0 text-left">Connect with our technical support team for priority assistance and issue resolution.</p>

            <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] p-6 sm:p-10 md:p-12 border border-slate-100 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center text-white shadow-2xl rotate-3 group-hover:rotate-0 transition-transform">
                        <MessageSquare className="w-8 h-8" />
                     </div>
                     <h3 className="text-2xl font-black font-display uppercase tracking-tight">Open New Ticket</h3>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Subject</label>
                           <input 
                              required
                              value={subject}
                              onChange={e => setSubject(e.target.value)}
                              placeholder="Describe the issue in 5-6 words..."
                              className="w-full bg-slate-50 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-brand-blue/10 transition-all"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Category</label>
                           <select 
                              value={type}
                              onChange={e => setType(e.target.value)}
                              className="w-full bg-slate-50 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none appearance-none"
                           >
                              <option>General Inquiry</option>
                              <option>Technical Issue</option>
                              <option>Financial Tracking</option>
                              <option>Asset Discrepancy</option>
                              <option>Account Security</option>
                           </select>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Associate Release (Optional)</label>
                           <select 
                               value={releaseId}
                               onChange={e => setReleaseId(e.target.value)}
                               className="w-full bg-slate-50 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none appearance-none"
                           >
                               <option value="">No Release Selected</option>
                               {myReleases.map(r => (
                                 <option key={r.id} value={r.id}>{r.title}</option>
                               ))}
                           </select>
                        </div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Detailed Signal</label>
                        <textarea 
                           required
                           rows={5}
                           value={message}
                           onChange={e => setMessage(e.target.value)}
                           placeholder="Explain the technical situation in detail..."
                           className="w-full bg-slate-50 border-slate-100 rounded-3xl p-6 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-brand-blue/10 transition-all leading-relaxed"
                        />
                     </div>
                     <button 
                        disabled={submitting}
                        className="w-full py-5 bg-slate-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-brand-blue transition-all disabled:opacity-50 active:scale-95 shadow-2xl shadow-slate-900/20"
                     >
                        {submitting ? "TRANSMITTING DATA..." : "SUBMIT TICKET"}
                     </button>
                  </form>
               </div>
            </div>
         </div>

         {/* Ticket History */}
         <div className="w-full lg:w-[400px] space-y-8">
            <h2 className="text-2xl font-black font-display tracking-tight uppercase flex items-center gap-4">
               <Clock className="w-6 h-6 text-brand-blue" /> Support Log
            </h2>
            <div className="space-y-6">
                {tickets.map((t, i) => (
                   <motion.div 
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.1 }}
                     key={t.id} 
                     onClick={() => setSelectedTicket(t)}
                     className={cn(
                        "bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border shadow-sm space-y-4 group hover:shadow-xl transition-all cursor-pointer",
                        selectedTicket?.id === t.id ? "border-brand-blue ring-2 ring-brand-blue/10" : "border-slate-50"
                     )}
                   >
                      <div className="flex items-start justify-between">
                         <span className={cn(
                            "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                            t.status === 'resolved' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-amber-50 border-amber-100 text-amber-600"
                         )}>{(t.status || 'pending').toUpperCase()}</span>
                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'recent'}</span>
                      </div>
                     <div>
                        <h4 className="font-bold text-slate-900 uppercase text-xs tracking-tight group-hover:text-brand-blue transition-colors">{t.subject}</h4>
                        <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-widest">{t.type}</p>
                     </div>
                     <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2 italic">"{t.message}"</p>
                  </motion.div>
               ))}
               {tickets.length === 0 && (
                  <div className="p-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
                     <LifeBuoy className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No support transmissions documented</p>
                  </div>
               )}
            </div>
         </div>
      </div>

      {/* Chat Overlay */}
      <AnimatePresence>
         {selectedTicket && (
            <div className="fixed inset-0 z-[100] flex items-center justify-end p-6 md:p-10 pointer-events-none">
               <motion.div 
                  initial={{ x: '100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '100%', opacity: 0 }}
                  className="w-full max-w-2xl h-full bg-[#1E293B] rounded-[3rem] shadow-[0_32px_64px_rgba(0,0,0,0.5)] border border-slate-800 flex flex-col pointer-events-auto overflow-hidden"
               >
                  {/* Chat Header */}
                  <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center text-white">
                           <MessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                           <h3 className="text-white font-bold uppercase text-xs tracking-widest">{selectedTicket.subject}</h3>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Ticket: {selectedTicket.id.slice(0,8)}</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => setSelectedTicket(null)}
                        className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:text-white transition-colors"
                     >
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                     <div className="bg-slate-800/30 p-6 rounded-3xl border border-slate-700/50 italic text-slate-400 text-xs leading-relaxed">
                        Signal Initialized: {selectedTicket.message}
                     </div>
                     
                     {messages.map((m, i) => (
                        <div key={m.id} className={cn(
                           "flex",
                           m.isAdmin ? "justify-start" : "justify-end"
                        )}>
                           <div className={cn(
                              "max-w-[80%] p-5 rounded-2xl md:rounded-3xl shadow-lg",
                              m.isAdmin ? "bg-slate-800 text-slate-300 rounded-bl-none" : "bg-brand-blue text-white rounded-br-none"
                           )}>
                              {m.isAdmin && <p className="text-[8px] font-black uppercase tracking-widest text-brand-blue mb-2">Technical Support</p>}
                              <p className="text-xs font-medium leading-relaxed">{m.message}</p>
                              <p className={cn("text-[8px] mt-2 font-bold", m.isAdmin ? "text-slate-500" : "text-white/50")}>
                                 {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                           </div>
                        </div>
                     ))}
                     <div ref={chatEndRef} />
                  </div>

                  {/* Input Area */}
                  <form onSubmit={handleSendMessage} className="p-8 bg-slate-900/50 border-t border-slate-800">
                     <div className="relative">
                        <input 
                           value={newMessage}
                           onChange={e => setNewMessage(e.target.value)}
                           placeholder="Transmit message..."
                           className="w-full bg-slate-800 border-none rounded-2xl py-5 pl-6 pr-16 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all placeholder:text-slate-500"
                        />
                        <button 
                           type="submit"
                           className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-brand-blue text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
                        >
                           <Send className="w-4 h-4" />
                        </button>
                     </div>
                  </form>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
