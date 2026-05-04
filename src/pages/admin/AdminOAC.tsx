import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Youtube, Search, CheckCircle, XCircle, Clock, ExternalLink, Mail, User, Instagram, X, Eye, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

export default function AdminOAC() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "oac_requests"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      toast.error("Failed to fetch OAC requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const deleteRequest = async (id: string) => {
     if (!window.confirm("Are you sure you want to permanently remove this verification request?")) return;
     try {
       await deleteDoc(doc(db, "oac_requests", id));
       setRequests(requests.filter(r => r.id !== id));
       if (selectedRequest?.id === id) setSelectedRequest(null);
       toast.success("OAC Request purged from system.");
     } catch (err) {
       toast.error("Purge failure.");
     }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "oac_requests", id), { status });
      setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
      if (selectedRequest?.id === id) {
        setSelectedRequest({ ...selectedRequest, status });
      }
      toast.success(`OAC request ${status}`);
    } catch (err) {
      toast.error("Status update sequence failed.");
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div className="text-left">
            <h1 className="text-5xl font-black font-display tracking-tight uppercase leading-none text-white">OAC <span className="text-brand-blue">Portal</span></h1>
            <p className="text-slate-400 font-black text-[10px] tracking-[0.4em] uppercase mt-3">Official Artist Channel Verification Terminal</p>
         </div>
         <div className="bg-slate-900 border border-white/5 px-8 py-4 rounded-[2rem] flex items-center gap-6 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col">
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Pending Verification</span>
               <span className="text-2xl font-black text-white">{requests.filter(r => r.status === 'pending').length}</span>
            </div>
            <div className="w-[1px] h-8 bg-white/10"></div>
            <div className="flex flex-col">
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Youtube API</span>
               <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Sync Ready</span>
               </div>
            </div>
         </div>
      </div>

      <div className="bg-[#1e293b] rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl">
         <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    <th className="px-12 py-8">Artist Details</th>
                    <th className="px-6 py-8">Requester</th>
                    <th className="px-6 py-8 text-center">Status</th>
                    <th className="px-12 py-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {requests.map((r, i) => (
                  <tr key={r.id} className="group hover:bg-slate-800/50 transition-colors">
                      <td className="px-12 py-8">
                        <p className="font-bold text-white uppercase text-sm tracking-tight">{r.artistName || "N/A"}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {r.manualArtistName && <span className="text-[7px] bg-brand-blue/10 text-brand-blue px-1.5 py-0.5 rounded-sm uppercase font-black font-mono">Manual Entry</span>}
                        </div>
                      </td>
                      <td className="px-6 py-8">
                          <div className="flex flex-col">
                            <p className="text-[11px] font-bold text-white uppercase">{r.userName || "Artist"}</p>
                            <p className="text-[9px] text-slate-500 tracking-widest truncate max-w-[150px]" title={r.userEmail}>{r.userEmail}</p>
                          </div>
                      </td>
                      <td className="px-6 py-8">
                        <div className="flex justify-center">
                          <span className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                            r.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" : 
                            r.status === 'rejected' ? "bg-rose-500/10 text-rose-500" : "bg-amber-500/10 text-amber-500"
                          )}>
                            {r.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-12 py-8 text-right">
                        <div className="flex items-center justify-end gap-3">
                            <button 
                              onClick={() => setSelectedRequest(r)}
                              className="w-10 h-10 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all shadow-sm"
                              title="View Verification Details"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => updateStatus(r.id, "approved")}
                              className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                r.status === 'approved' ? "bg-emerald-500 text-white cursor-default" : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                              )}
                              disabled={r.status === 'approved'}
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => updateStatus(r.id, "rejected")}
                              className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                r.status === 'rejected' ? "bg-rose-500 text-white cursor-default" : "bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white"
                              )}
                              disabled={r.status === 'rejected'}
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => deleteRequest(r.id)}
                              className="w-10 h-10 bg-slate-900 border border-white/5 text-slate-500 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                              title="Delete Permanent"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                      </td>
                  </tr>
                ))}
                {requests.length === 0 && !loading && (
                  <tr>
                      <td colSpan={6} className="px-12 py-32 text-center">
                        <Youtube className="w-16 h-16 text-slate-700 mx-auto mb-4 opacity-20" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No OAC requests in transmission grid.</p>
                      </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                      <td colSpan={6} className="px-12 py-32 text-center animate-pulse text-slate-700 font-black uppercase text-[10px] tracking-widest">
                        Scanning Youtube Transmission Nodes...
                      </td>
                  </tr>
                )}
              </tbody>
          </table>
         </div>
      </div>

      {/* Verification Details Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[4rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-10 md:p-16 overflow-y-auto custom-scrollbar text-white">
                <div className="flex items-start justify-between mb-12">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-slate-950 rounded-[2rem] flex items-center justify-center text-brand-blue shadow-2xl border border-white/5">
                      <Youtube className="w-10 h-10" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-black text-white tracking-tight uppercase leading-tight">OAC Upgrade Request</h2>
                      <p className="text-emerald-500 font-black tracking-[0.2em] uppercase text-xs mt-1">Artist: {selectedRequest.artistName || "N/A"}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedRequest(null)}
                    className="w-14 h-14 bg-white/5 text-slate-400 rounded-full flex items-center justify-center hover:bg-white hover:text-slate-950 transition-all border border-white/5"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-10">
                    <div>
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 text-left">Transmission Grid</h3>
                      <div className="bg-slate-950/50 rounded-[2.5rem] p-8 space-y-6 border border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol</span>
                          <span className="text-[11px] font-black text-white uppercase tracking-tighter">OAC_VERIFICATION_V1</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Created At</span>
                          <span className="text-[11px] font-black text-white uppercase">
                             {selectedRequest.createdAt?.toDate?.().toLocaleString() || new Date(selectedRequest.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verification Status</span>
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                            selectedRequest.status === 'approved' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : 
                            selectedRequest.status === 'pending' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                          )}>
                            {selectedRequest.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 text-left">Identity Details</h3>
                      <div className="bg-slate-950/50 rounded-[2.5rem] p-8 space-y-6 border border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 border border-white/5">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Artist Name</p>
                            <p className="text-[11px] font-black text-white uppercase">{selectedRequest.artistName || "N/A"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 border border-white/5">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">User Email</p>
                            <p className="text-[11px] font-black text-white uppercase">{selectedRequest.userEmail}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                    <div className="space-y-10 text-left">
                      <div>
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Verification Artifacts</h3>
                        <div className="bg-slate-950/50 rounded-[2.5rem] p-8 space-y-6 border border-white/5 font-bold">
                           <div className="space-y-4">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">// SONG_VERIFICATION_ANCHORS</p>
                              {[selectedRequest.songLink1, selectedRequest.songLink2, selectedRequest.songLink3].map((link, idx) => link && (
                                <a key={idx} href={link} target="_blank" className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-white/5 hover:bg-slate-800 transition-all text-emerald-400">
                                  <span className="text-[9px] font-black uppercase truncate mr-4 tracking-tighter">Song {idx + 1}: {link}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ))}
                              {!selectedRequest.songLink1 && !selectedRequest.songLink2 && !selectedRequest.songLink3 && (
                                <p className="text-[10px] text-slate-700 italic">No historical song artifacts provided.</p>
                              )}
                           </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Channel Topology</h3>
                        <div className="bg-slate-950/50 rounded-[2.5rem] p-8 space-y-6 border border-white/5">
                           <div>
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3 italic">// PRIMARY_CHANNEL_LINK</p>
                              <a href={selectedRequest.channelUrl} target="_blank" className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-white/5 hover:bg-slate-800 transition-all text-brand-blue">
                                 <span className="text-[10px] font-black uppercase truncate mr-4">Open Own Artist Channel</span>
                                 <ExternalLink className="w-4 h-4" />
                              </a>
                           </div>
                           {selectedRequest.topicUrl ? (
                              <div>
                                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3 italic">// TOPIC_CHANNEL_SYNDICATION</p>
                                 <a href={selectedRequest.topicUrl} target="_blank" className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-white/5 hover:bg-slate-800 transition-all text-brand-purple">
                                    <span className="text-[10px] font-black uppercase truncate mr-4">Open Topic Channel</span>
                                    <ExternalLink className="w-4 h-4" />
                                 </a>
                              </div>
                           ) : (
                             <div>
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3 italic">// TOPIC_CHANNEL_SYNDICATION</p>
                                <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5 text-slate-600 text-[10px] items-center justify-center flex font-black uppercase">
                                   Not Provided
                                </div>
                             </div>
                           )}
                           <div className="p-6 bg-slate-800/30 rounded-2xl border border-white/5">
                              <p className="text-[9px] font-black text-slate-600 uppercase mb-2">Original Identity</p>
                              <p className="text-sm font-black text-white uppercase italic">{selectedRequest.artistName || "Unknown"}</p>
                              {selectedRequest.manualArtistName && (
                                <span className="text-[8px] bg-brand-blue/20 text-brand-blue px-2 py-0.5 rounded-md mt-2 inline-block uppercase font-black">Manual Entry</span>
                              )}
                           </div>
                        </div>
                      </div>

                    <div className="pt-4 flex items-center gap-4">
                      <button 
                        onClick={() => updateStatus(selectedRequest.id, "approved")}
                        className={cn(
                          "flex-1 h-20 rounded-[2.5rem] font-black uppercase text-sm tracking-widest flex items-center justify-center gap-3 transition-all shadow-2xl",
                          selectedRequest.status === 'approved' ? "bg-emerald-500 text-white translate-y-0 opacity-50 cursor-default" : "bg-emerald-600 text-white hover:bg-emerald-500 hover:translate-y-[-4px]"
                        )}
                        disabled={selectedRequest.status === 'approved'}
                      >
                        <CheckCircle className="w-6 h-6" />
                        Verify
                      </button>
                      <button 
                        onClick={() => updateStatus(selectedRequest.id, "rejected")}
                        className={cn(
                          "flex-1 h-20 rounded-[2.5rem] font-black uppercase text-sm tracking-widest flex items-center justify-center gap-3 transition-all shadow-2xl",
                          selectedRequest.status === 'rejected' ? "bg-rose-500 text-white translate-y-0 opacity-50 cursor-default" : "bg-rose-600 text-white hover:bg-rose-500 hover:translate-y-[-4px]"
                        )}
                        disabled={selectedRequest.status === 'rejected'}
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
