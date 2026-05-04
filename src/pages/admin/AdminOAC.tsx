import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, updateDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Youtube, Search, CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react";
import { cn } from "../../lib/utils";

export default function AdminOAC() {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    const fetchRequests = async () => {
      const q = query(collection(db, "oac_requests"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchRequests();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "oac_requests", id), { status });
      setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
    } catch (err) {
      alert("Status update signal failed.");
    }
  };

  return (
    <div className="space-y-10">
      <div>
         <h1 className="text-5xl font-black font-display tracking-tight uppercase">OAC Portal</h1>
         <p className="text-slate-400 font-medium tracking-tight uppercase text-xs">Verify and transmit YouTube Official Artist Channel applications.</p>
      </div>

      <div className="bg-[#1E293B] rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl">
         <table className="w-full text-left">
            <thead>
               <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  <th className="px-12 py-8">Topic / Subject</th>
                  <th className="px-6 py-8">Requester</th>
                  <th className="px-6 py-8">Channel Details</th>
                  <th className="px-6 py-8">Context Song</th>
                  <th className="px-6 py-8">Status</th>
                  <th className="px-12 py-8 text-right">Review</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
               {requests.map((r, i) => (
                 <tr key={i} className="group hover:bg-slate-800/50 transition-colors">
                    <td className="px-12 py-8">
                       <p className="font-bold text-white uppercase text-sm tracking-tight">{r.subject || "OAC Upgrade"}</p>
                       <p className="text-[10px] text-slate-500 uppercase mt-1">Artist: {r.artistName}</p>
                    </td>
                     <td className="px-6 py-8">
                        <div className="flex flex-col">
                           <p className="text-[11px] font-bold text-white uppercase">{r.userName || "Artist"}</p>
                           <p className="text-[9px] text-slate-500 tracking-widest truncate max-w-[150px]" title={r.userEmail}>{r.userEmail}</p>
                           {r.instagramLink && (
                              <a href={r.instagramLink} target="_blank" className="text-[9px] text-brand-blue uppercase mt-1 hover:underline tracking-tighter">Instagram</a>
                           )}
                        </div>
                     </td>
                     <td className="px-6 py-8">
                        <a href={r.channelUrl} target="_blank" className="flex items-center gap-2 text-brand-blue hover:underline text-[10px] font-bold uppercase tracking-widest">
                           Personal <ExternalLink className="w-2 h-2" />
                        </a>
                        {r.topicUrl && (
                           <p className="text-[8px] text-slate-500 mt-1 uppercase max-w-[150px] truncate">{r.topicUrl}</p>
                        )}
                     </td>
                     <td className="px-6 py-8 border-l border-slate-800/30">
                        {r.releaseTitle ? (
                           <div className="flex flex-col">
                              <p className="text-[11px] font-bold text-emerald-400 uppercase line-clamp-1">{r.releaseTitle}</p>
                              <p className="text-[8px] text-slate-600 uppercase">Context Song</p>
                           </div>
                        ) : (
                           <span className="text-[10px] text-slate-600 uppercase font-bold italic">Manual</span>
                        )}
                     </td>
                    <td className="px-6 py-8">
                       <span className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                          r.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                       )}>
                          {r.status}
                       </span>
                    </td>
                    <td className="px-12 py-8 text-right">
                       <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => updateStatus(r.id, "approved")}
                            className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center hover:bg-emerald-500 transition-all hover:text-white"
                          >
                             <CheckCircle className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => updateStatus(r.id, "rejected")}
                            className="w-10 h-10 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 transition-all hover:text-white"
                          >
                             <XCircle className="w-5 h-5" />
                          </button>
                       </div>
                    </td>
                 </tr>
               ))}
               {requests.length === 0 && (
                 <tr>
                    <td colSpan={5} className="px-12 py-24 text-center">
                       <Youtube className="w-16 h-16 text-slate-700 mx-auto mb-4 opacity-20" />
                       <p className="text-slate-500 font-bold uppercase tracking-widest">No OAC requests in transmission.</p>
                    </td>
                 </tr>
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
}
