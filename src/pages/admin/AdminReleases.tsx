import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Music, Search, Filter, ArrowRight, Clock, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import { toast } from "sonner";

export default function AdminReleases() {
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteRelease = async (id: string, title: string) => {
    setDeletingId(null);
    const tId = toast.loading(`Permanently removing "${title}"...`);
    try {
      await deleteDoc(doc(db, "releases", id));
      setReleases(prev => prev.filter(r => r.id !== id));
      toast.success("Release deleted successfully", { id: tId });
    } catch (err: any) {
      console.error("Deletion failed:", err);
      toast.error(`Deletion failed: ${err.code || err.message || "Unknown error"}`, { id: tId });
    }
  };

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        const q = query(collection(db, "releases"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setReleases(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching releases:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReleases();
  }, []);

  const filtered = releases.filter(r => filter === "all" || r.status === filter);

  if (loading) {
     return <div className="py-40 text-center animate-pulse font-black text-xs uppercase tracking-widest text-slate-500">Initializing Global Data Stream...</div>;
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8">
        <div>
           <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight uppercase">Global Release Catalog</h1>
           <p className="text-xs md:text-sm text-slate-400 font-medium">Comprehensive oversight of all submissions across the global distribution network.</p>
        </div>
        <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2 scrollbar-hide py-1 max-w-full">
           {["all", "pending", "action_required", "approved", "in_progress", "live", "takedown_requested", "completed", "rejected"].map(f => (
             <button 
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  filter === f ? "bg-brand-purple text-white shadow-xl shadow-purple-900/40" : "bg-slate-800 text-slate-500 hover:text-white"
                )}
             >
               {f.replace(/_/g, " ").toUpperCase()}
             </button>
           ))}
        </div>
      </div>

      <div className="bg-[#1E293B] rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl">
         <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left min-w-[1000px]">
            <thead>
               <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  <th className="px-12 py-8">Asset</th>
                  <th className="px-6 py-8">Primary Details</th>
                  <th className="px-6 py-8">Status</th>
                  <th className="px-6 py-8">Identifiers</th>
                  <th className="px-12 py-8 text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
               {filtered.map((r, i) => (
                 <tr key={r.id} className="group hover:bg-slate-800/50 transition-colors">
                    <td className="px-12 py-8">
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700">
                             <img src={r.coverUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                             <p className="font-bold text-white text-lg">{r.title || r.songName}</p>
                             <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">ID: {r.id.slice(0, 8)}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-8 text-sm">
                       <p className="font-bold text-white uppercase text-xs truncate max-w-[150px]">{r.artist || r.singerName}</p>
                       <p className="text-slate-500 mt-1 text-[10px] font-medium truncate max-w-[150px]">{r.labelName || r.label || "Independent"}</p>
                    </td>
                    <td className="px-6 py-8">
                       <span className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                          r.status === 'live' ? "bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/30" : 
                          r.status === 'pending' ? "bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/30" :
                          r.status === 'rejected' ? "bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/30" :
                          r.status === 'approved' ? "bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/30" :
                          "bg-slate-500/10 text-slate-500"
                       )}>
                          {r.status?.toUpperCase()}
                       </span>
                    </td>
                    <td className="px-6 py-8 font-mono text-xs text-slate-500 text-left">
                       <p>ISRC: {r.isrc || "---"}</p>
                       <p>UPC: {r.upc || "---"}</p>
                    </td>
                    <td className="px-12 py-8 text-right">
                       <div className="flex items-center justify-end gap-3">
                          <Link to={`/admin/review/${r.id}`} className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white hover:bg-brand-purple transition-all inline-flex">
                             <ArrowRight className="w-5 h-5" />
                          </Link>
                          {deletingId === r.id ? (
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                deleteRelease(r.id, r.title || r.songName);
                              }}
                              className="px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all inline-flex cursor-pointer relative z-10"
                            >
                              Confirm
                            </button>
                          ) : (
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDeletingId(r.id);
                              }}
                              className="p-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all inline-flex cursor-pointer relative z-10"
                              title="Permanent Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                       </div>
                    </td>
                 </tr>
               ))}
               {filtered.length === 0 && (
                 <tr>
                    <td colSpan={5} className="px-12 py-24 text-center text-slate-500 font-bold uppercase tracking-widest">No matching releases discovered in this sector.</td>
                 </tr>
               )}
            </tbody>
         </table>
      </div>
    </div>
  </div>
);
}
