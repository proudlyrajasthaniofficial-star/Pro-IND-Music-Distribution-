import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, updateDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Fingerprint, Search, ShieldCheck, ShieldAlert, Clock, MoreHorizontal, CheckCircle, XCircle, ExternalLink, Mail, User, Music } from "lucide-react";
import { cn } from "../../lib/utils";
import { toast } from "sonner";

export default function AdminContentID() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      toast.success(`Request marked as ${status}`);
    } catch (err) {
      toast.error("Status update sequence failed.");
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div className="text-left">
            <h1 className="text-5xl font-black font-display tracking-tight uppercase leading-none">Guard <span className="text-brand-blue">Ops</span></h1>
            <p className="text-slate-400 font-black text-[10px] tracking-[0.4em] uppercase mt-3">Content ID Fingerprint Distribution Center</p>
         </div>
         <div className="bg-slate-950 border border-white/5 px-8 py-4 rounded-[2rem] flex items-center gap-6 shadow-premium-dark backdrop-blur-xl">
            <div className="flex flex-col">
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Active Requests</span>
               <span className="text-2xl font-black text-white">{requests.filter(r => r.status === 'pending').length}</span>
            </div>
            <div className="w-[1px] h-8 bg-white/10"></div>
            <div className="flex flex-col">
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Global Status</span>
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
                    <th className="px-10 py-8">Asset Metadata</th>
                    <th className="px-6 py-8">Requester Node</th>
                    <th className="px-6 py-8">Target Signal</th>
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
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-[8px] font-black bg-slate-100 px-2 py-0.5 rounded text-slate-500 uppercase">Release ID: {r.releaseId?.slice(-8)}</span>
                                </div>
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
                              "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
                              r.status === 'approved' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : 
                              r.status === 'pending' ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-rose-50 border-rose-100 text-rose-600"
                          )}>
                              {r.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500">
                            {r.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => updateStatus(r.id, "approved")}
                                  className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                  title="Deploy Signal"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={() => updateStatus(r.id, "rejected")}
                                  className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                  title="Terminate Sequence"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </>
                            )}
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
    </div>
  );
}

