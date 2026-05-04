import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Music, Search, Filter, ArrowRight, Clock, CheckCircle, XCircle, Trash2, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export default function AdminReleases() {
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<string, any>>({});
  const [userMap, setUserMap] = useState<Record<string, any>>({});

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
        const releasesData = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
        setReleases(releasesData);
        
        // Fetch uploader details
        const uniqueUserIds = [...new Set(releasesData.map(r => r.userId).filter(Boolean))] as string[];
        const usersInfo: Record<string, any> = {};
        for(const uid of uniqueUserIds) {
          try {
            const uDoc = await getDoc(doc(db, "users", uid));
            if (uDoc.exists()) {
              usersInfo[uid] = uDoc.data();
            }
          } catch(e) {
            console.warn("Could not fetch user", uid, e);
          }
        }
        setUserMap(usersInfo);
      } catch (err) {
        console.error("Error fetching releases:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReleases();
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      const newStats: Record<string, any> = {};
      const pending: Promise<void>[] = [];
      
      releases.forEach(r => {
        if (!stats[r.id] && r.status === 'live') {
          pending.push(
            new Promise((resolve) => {
               // Mock API Call to fetch statistics
               setTimeout(() => {
                 newStats[r.id] = {
                   streams: Math.floor(Math.random() * 5000000) + 10000,
                   listeners: Math.floor(Math.random() * 2000000) + 5000,
                   topPlatform: ["Spotify", "Apple Music", "YouTube Music", "Wynk", "JioSaavn", "Gaana"][Math.floor(Math.random() * 6)]
                 };
                 resolve();
               }, 400 + Math.random() * 800);
            })
          );
        }
      });

      if (pending.length > 0) {
        await Promise.all(pending);
        setStats(prev => ({ ...prev, ...newStats }));
      }
    };

    if (releases.length > 0) {
      loadStats();
    }
  }, [releases]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleBulkAction = async (status: string) => {
    if (selectedIds.length === 0) return;
    const tId = toast.loading(`Updating ${selectedIds.length} releases...`);
    try {
      const { updateDoc, doc } = await import("firebase/firestore");
      await Promise.all(selectedIds.map(id => updateDoc(doc(db, "releases", id), { 
        status,
        updatedAt: new Date().toISOString()
      })));
      setReleases(prev => prev.map(r => selectedIds.includes(r.id) ? { ...r, status } : r));
      setSelectedIds([]);
      toast.success(`Batch update successful: ${status.toUpperCase()}`, { id: tId });
    } catch (err: any) {
      console.error("Bulk update error:", err);
      toast.error("Batch update failed.", { id: tId });
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(r => r.id));
    }
  };

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
            <table className="w-full text-left min-w-[1200px]">
            <thead>
               <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  <th className="px-6 py-8">
                     <input 
                        type="checkbox" 
                        checked={selectedIds.length === filtered.length && filtered.length > 0} 
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded bg-slate-700 border-slate-600 border-2 checked:bg-brand-purple cursor-pointer"
                     />
                  </th>
                  <th className="px-6 py-8">Asset</th>
                  <th className="px-6 py-8">Primary Details</th>
                  <th className="px-6 py-8">Status</th>
                  <th className="px-6 py-8">Statistics</th>
                  <th className="px-6 py-8">Identifiers</th>
                  <th className="px-12 py-8 text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
               {filtered.map((r, i) => (
                 <tr key={r.id} className={cn(
                   "group hover:bg-slate-800/50 transition-colors",
                   selectedIds.includes(r.id) && "bg-brand-purple/10 border-l-4 border-brand-purple"
                 )}>
                    <td className="px-6 py-8">
                       <input 
                          type="checkbox" 
                          checked={selectedIds.includes(r.id)} 
                          onChange={() => toggleSelect(r.id)}
                          className="w-4 h-4 rounded bg-slate-700 border-slate-600 border-2 checked:bg-brand-purple cursor-pointer"
                       />
                    </td>
                    <td className="px-6 py-8">
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
                       <p className="font-bold text-white uppercase text-xs truncate max-w-[150px]" title={r.artist || r.singerName}>{r.artist || r.singerName}</p>
                       <p className="text-slate-500 mt-1 text-[10px] font-medium truncate max-w-[150px]">{r.labelName || r.label || "Independent"}</p>
                       {userMap[r.userId] && (
                          <div className="mt-3 pt-3 border-t border-slate-800/50">
                             <p className="text-[9px] uppercase font-bold tracking-widest text-slate-500 mb-1">Uploaded By:</p>
                             <div className="flex items-center gap-2">
                               <div className="w-4 h-4 rounded-full bg-brand-blue/20 flex items-center justify-center">
                                 <span className="text-[8px] font-bold text-brand-blue">{userMap[r.userId].displayName?.charAt(0) || "U"}</span>
                               </div>
                               <p className="text-[10px] text-slate-300 truncate max-w-[150px]" title={userMap[r.userId].email}>{userMap[r.userId].email}</p>
                             </div>
                          </div>
                       )}
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
                    <td className="px-6 py-8 text-xs text-slate-500">
                       {stats[r.id] ? (
                          <div className="space-y-1.5">
                             <div className="flex items-center gap-2">
                                <Activity className="w-3 h-3 text-brand-purple" />
                                <span className="font-mono text-white/50">{stats[r.id].streams.toLocaleString()} Streams</span>
                             </div>
                             <div className="flex items-center justify-between gap-4 max-w-[160px]">
                                <span className="text-[9px] uppercase font-bold tracking-widest">Listeners:</span>
                                <span className="font-mono text-brand-blue font-bold">{stats[r.id].listeners.toLocaleString()}</span>
                             </div>
                             <div className="flex items-center justify-between gap-4 max-w-[160px]">
                                <span className="text-[9px] uppercase font-bold tracking-widest">Top App:</span>
                                <span className="font-mono text-emerald-400 font-bold truncate max-w-[80px]" title={stats[r.id].topPlatform}>{stats[r.id].topPlatform}</span>
                             </div>
                          </div>
                       ) : r.status === 'live' ? (
                          <span className="animate-pulse inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-600"><div className="w-3 h-3 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div> Fetching...</span>
                       ) : (
                          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-700">N/A</span>
                       )}
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

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-4xl px-4"
          >
            <div className="bg-[#1E293B] border border-slate-700 rounded-[2.5rem] p-6 shadow-[0_32px_64px_rgba(0,0,0,0.5)] flex items-center justify-between gap-6 backdrop-blur-3xl">
               <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-brand-purple rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl shadow-purple-500/20">
                    {selectedIds.length}
                  </div>
                  <div className="text-left">
                    <p className="text-white font-bold uppercase tracking-widest text-xs">Assets Selected</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">Initialize batch operation</p>
                  </div>
               </div>
               <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
                  <button onClick={() => handleBulkAction('live')} className="px-6 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap">Approve & Live</button>
                  <button onClick={() => handleBulkAction('approved')} className="px-6 py-3 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-blue-500/20 whitespace-nowrap">Mark Approved</button>
                  <button onClick={() => handleBulkAction('rejected')} className="px-6 py-3 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-rose-500/20 whitespace-nowrap">Reject Batch</button>
                  <button onClick={() => handleBulkAction('pending')} className="px-6 py-3 bg-slate-700 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all whitespace-nowrap">Reset to Pending</button>
                  <button onClick={() => setSelectedIds([])} className="p-3 bg-slate-800 text-slate-500 hover:text-white rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
