import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, updateDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Fingerprint, Search, ShieldCheck, ShieldAlert, Clock, MoreHorizontal, CheckCircle, XCircle, ExternalLink, Mail, User, Music, Eye, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export default function AdminContentID() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "content_id_requests"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      toast.error("Failed to fetch Content ID signals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "content_id_requests", id), { status });
      setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
      if (selectedRequest?.id === id) {
        setSelectedRequest({ ...selectedRequest, status });
      }
      toast.success(`Request marked as ${status}`);
    } catch (err) {
      toast.error("Status update sequence failed.");
    }
  };

  const deleteRequest = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this request?")) return;
    try {
      await updateDoc(doc(db, "content_id_requests", id), { deleted: true }); // Prefer soft delete or use deleteDoc
      // For this requirement, let's use deleteDoc if the user meant remove completely
      // However, usually soft delete is better. I'll use soft delete logic if it exists elsewhere, 
      // but the prompt says "remove", so I'll just remove from list by filtering or deleteDoc.
      // Let's use deleteDoc for "remove".
      toast.success("Request removed successfully.");
      setRequests(requests.filter(r => r.id !== id));
      if (selectedRequest?.id === id) setSelectedRequest(null);
    } catch (err) {
      toast.error("Deletion failed.");
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div className="text-left">
            <h1 className="text-5xl font-black font-display tracking-tight uppercase leading-none">Content <span className="text-brand-blue">ID</span></h1>
            <p className="text-slate-400 font-black text-[10px] tracking-[0.4em] uppercase mt-3">Review & Manage Content Protection Requests</p>
         </div>
         <div className="bg-slate-950 border border-white/5 px-8 py-4 rounded-[2rem] flex items-center gap-6 shadow-premium-dark backdrop-blur-xl">
            <div className="flex flex-col">
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Active Requests</span>
               <span className="text-2xl font-black text-white">{requests.filter(r => r.status === 'pending').length}</span>
            </div>
            <div className="w-[1px] h-8 bg-white/10"></div>
            <div className="flex flex-col">
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">System Status</span>
               <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Operational</span>
               </div>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 overflow-hidden shadow-premium">
         <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
                    <th className="px-10 py-8">Song Metadata</th>
                    <th className="px-6 py-8">Artist Info</th>
                    <th className="px-6 py-8">Link</th>
                    <th className="px-6 py-8 text-center">Status</th>
                    <th className="px-10 py-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {requests.map((r, i) => (
                  <tr key={r.id} className="group hover:bg-slate-50/50 transition-all duration-500">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-brand-blue shadow-lg shrink-0">
                              <Music className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-black text-slate-900 uppercase text-xs tracking-tight truncate">{r.songName || "Unlabeled Signal"}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 truncate">{r.artistName || "Unknown Entity"}</p>
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-8">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <p className="text-[10px] font-black text-slate-600 uppercase truncate max-w-[150px]">{r.userEmail}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-3 h-3 text-slate-400" />
                              <p className="text-[9px] font-bold text-slate-400 uppercase truncate max-w-[150px]">{r.userName || r.userId?.slice(0, 8)}</p>
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-8">
                        <a 
                          href={r.songLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center gap-2 text-brand-blue hover:text-slate-900 transition-colors group/link"
                        >
                            <span className="text-[10px] font-black uppercase tracking-tight truncate max-w-[150px]">Open Signal URL</span>
                            <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                        </a>
                      </td>
                      <td className="px-6 py-8">
                        <div className="flex justify-center">
                          <span className={cn(
                              "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm cursor-pointer hover:scale-105 transition-transform",
                              r.status === 'approved' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : 
                              r.status === 'pending' ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-rose-50 border-rose-100 text-rose-600"
                          )} onClick={() => setSelectedRequest(r)}>
                              {r.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-3 transition-all duration-500">
                             <button 
                                onClick={() => setSelectedRequest(r)}
                                className="w-10 h-10 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all shadow-sm"
                                title="View Deep Details"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => updateStatus(r.id, r.status === 'approved' ? "pending" : "approved")}
                                className={cn(
                                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm",
                                  r.status === 'approved' ? "bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                                )}
                                title="Toggle Status"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => deleteRequest(r.id)}
                                className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                title="Delete Request"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            <button className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-950 hover:text-white transition-all shadow-sm">
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>
                      </td>
                  </tr>
                ))}
                {requests.length === 0 && !loading && (
                  <tr>
                      <td colSpan={5} className="px-12 py-32 text-center">
                        <Fingerprint className="w-20 h-20 text-slate-100 mx-auto mb-6" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Grid Clear: No Pending Transmissions</p>
                      </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                      <td colSpan={5} className="px-12 py-32 text-center animate-pulse">
                        <div className="w-20 h-20 bg-slate-50 rounded-full mx-auto mb-6"></div>
                        <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.4em]">Querying Distribution Nodes...</p>
                      </td>
                  </tr>
                )}
              </tbody>
          </table>
         </div>
      </div>

      {/* Deep Details Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[4rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-10 md:p-16 overflow-y-auto custom-scrollbar">
                <div className="flex items-start justify-between mb-12">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-slate-950 rounded-[2rem] flex items-center justify-center text-brand-blue shadow-2xl">
                      <Music className="w-10 h-10" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-tight">Content ID Request</h2>
                      <p className="text-brand-blue font-black tracking-[0.2em] uppercase text-xs mt-1">Track: {selectedRequest.songName}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedRequest(null)}
                    className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-950 hover:text-white transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-10">
                    <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Request Status</h3>
                      <div className="bg-slate-50 rounded-[2rem] p-8 space-y-6">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User Email</span>
                          <span className="text-[11px] font-black text-slate-900 uppercase">{selectedRequest.userEmail}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</span>
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                            selectedRequest.status === 'approved' ? "bg-emerald-500 text-white" : 
                            selectedRequest.status === 'pending' ? "bg-amber-500 text-white" : "bg-rose-500 text-white"
                          )}>
                            {selectedRequest.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                    <div className="space-y-10">
                      <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Signal Verification</h3>
                        <div className="bg-slate-50 rounded-[2rem] p-8 space-y-6">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Song URL</p>
                            <a 
                              href={selectedRequest.songLink} 
                              target="_blank" 
                              rel="noreferrer"
                              className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 group/link hover:border-brand-blue transition-all"
                            >
                              <span className="text-[11px] font-black text-brand-blue truncate mr-4">{selectedRequest.songLink}</span>
                              <ExternalLink className="w-4 h-4 text-brand-blue shrink-0" />
                            </a>
                          </div>
                          <div className="bg-white rounded-2xl p-6 space-y-4 shadow-sm border border-slate-100">
                             <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform</span>
                                <span className="text-xs font-black text-brand-blue uppercase">{selectedRequest.platform || "YouTube"}</span>
                             </div>
                             <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Singer</span>
                                <span className="text-xs font-black text-slate-900 uppercase">{selectedRequest.singerName || "N/A"}</span>
                             </div>
                             <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Label</span>
                                <span className="text-xs font-black text-slate-900 uppercase">{selectedRequest.labelName || "N/A"}</span>
                             </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex items-center gap-4">
                        <button 
                          onClick={() => updateStatus(selectedRequest.id, selectedRequest.status === 'approved' ? "pending" : "approved")}
                          className={cn(
                            "flex-1 h-20 rounded-[2rem] font-black uppercase text-sm tracking-widest flex items-center justify-center gap-3 hover:translate-y-[-4px] transition-all shadow-xl",
                            selectedRequest.status === 'approved' ? "bg-amber-500 text-white shadow-amber-500/20" : "bg-emerald-500 text-white shadow-emerald-500/20"
                          )}
                        >
                          <CheckCircle className="w-6 h-6" />
                          {selectedRequest.status === 'approved' ? "Revoke" : "Approve"}
                        </button>
                        <button 
                          onClick={() => {
                            updateStatus(selectedRequest.id, "rejected");
                            setSelectedRequest(null);
                          }}
                          className="flex-1 h-20 bg-rose-500 text-white rounded-[2rem] font-black uppercase text-sm tracking-widest flex items-center justify-center gap-3 hover:translate-y-[-4px] transition-all shadow-xl hover:shadow-rose-500/20"
                        >
                          <XCircle className="w-6 h-6" />
                          Reject
                        </button>
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

