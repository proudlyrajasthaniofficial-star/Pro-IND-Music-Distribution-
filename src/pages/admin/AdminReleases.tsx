import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, deleteDoc, doc, writeBatch } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Music, Search, Filter, ArrowRight, Clock, CheckCircle, XCircle, Trash2, Activity, Download, CheckSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { Skeleton } from "../../components/ui/Skeleton";

export default function AdminReleases() {
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<string, any>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [selectedReleases, setSelectedReleases] = useState<Set<string>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const toggleSelection = (id: string) => {
     setSelectedReleases(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
     });
  };

  const toggleAll = (filteredIds: string[]) => {
     if (selectedReleases.size === filteredIds.length) {
        setSelectedReleases(new Set());
     } else {
        setSelectedReleases(new Set(filteredIds));
     }
  };

  const handleBulkAction = async (status: 'live' | 'rejected') => {
     if (selectedReleases.size === 0) return;
     // window.confirm removed to support iframe execution

     setIsBulkProcessing(true);
     const tId = toast.loading(`Processing ${selectedReleases.size} assets...`);
     
     try {
       const batch = writeBatch(db);
       selectedReleases.forEach(id => {
          const ref = doc(db, "releases", id);
          batch.update(ref, { 
             status, 
             reviewedAt: new Date().toISOString()
          });
       });
       await batch.commit();

       setReleases(prev => prev.map(r => 
          selectedReleases.has(r.id) ? { ...r, status } : r
       ));
       setSelectedReleases(new Set());
       toast.success(`Bulk update successful (${status})`, { id: tId });
     } catch (err: any) {
       console.error(err);
       toast.error(`Bulk update failed: ${err.message}`, { id: tId });
     } finally {
       setIsBulkProcessing(false);
     }
  };

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

  const exportCSV = () => {
    setIsExporting(true);
    try {
      const headers = ["ID", "Title", "Artist", "Label", "Status", "ISRC", "UPC", "Streams", "Listeners", "Top Platform", "Created Date"];
      const rows = filtered.map(r => {
        const s = stats[r.id] || {};
        return [
          r.id,
          `"${(r.title || r.songName || "").replace(/"/g, '""')}"`,
          `"${(r.artist || r.singerName || "").replace(/"/g, '""')}"`,
          `"${(r.labelName || r.label || "Independent").replace(/"/g, '""')}"`,
          r.status,
          r.isrc || "",
          r.upc || "",
          s.streams || "0",
          s.listeners || "0",
          s.topPlatform || "",
          new Date(r.createdAt).toISOString()
        ].join(",");
      });

      const csvContent = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `ind_releases_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Catalog exported successfully!");
    } catch (err) {
      toast.error("Failed to export data.");
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const filtered = releases.filter(r => {
    const matchesFilter = filter === "all" || r.status === filter;
    const searchLower = searchQuery.toLowerCase();
    const title = (r.title || r.songName || "").toLowerCase();
    const artist = (r.artist || r.singerName || "").toLowerCase();
    const isrc = (r.isrc || "").toLowerCase();
    const matchesSearch = title.includes(searchLower) || artist.includes(searchLower) || isrc.includes(searchLower);
    return matchesFilter && matchesSearch;
  });

  const filteredIds = filtered.map(r => r.id);

  if (loading) {
     return (
       <div className="space-y-10">
         <div className="flex justify-between items-center">
            <div>
               <Skeleton className="h-12 w-64 rounded-xl mb-4 bg-slate-800" />
               <Skeleton className="h-4 w-96 rounded-md bg-slate-800" />
            </div>
            <Skeleton className="h-10 w-32 rounded-xl bg-slate-800" />
         </div>
         <div className="bg-[#1E293B] rounded-[3.5rem] p-10 border border-slate-800 flex flex-col gap-6">
            <Skeleton className="h-16 w-full rounded-2xl bg-slate-800" />
            <Skeleton className="h-24 w-full rounded-2xl bg-slate-800" />
            <Skeleton className="h-24 w-full rounded-2xl bg-slate-800" />
            <Skeleton className="h-24 w-full rounded-2xl bg-slate-800" />
         </div>
       </div>
     );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 md:gap-8 border-b border-slate-800 pb-8">
        <div>
           <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight uppercase">Global Release Catalog</h1>
           <p className="text-xs md:text-sm text-slate-400 font-medium mt-2">Comprehensive oversight of all submissions across the distribution network.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
           <div className="relative flex-1 sm:w-64 xl:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-brand-blue transition-colors" />
              <input 
                type="text"
                placeholder="Search Title, Artist, or ISRC..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#1E293B] border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white focus:outline-none focus:border-brand-blue transition-all"
              />
           </div>
           <button 
             onClick={exportCSV} 
             disabled={isExporting}
             className="px-6 py-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
           >
             <Download className="w-5 h-5" /> {isExporting ? "Compiling..." : "Export CSV"}
           </button>
        </div>
      </div>

      <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2 scrollbar-hide align-middle max-w-full">
         {["all", "pending", "action_required", "approved", "in_progress", "live", "takedown_requested", "completed", "rejected"].map(f => (
           <button 
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-5 md:px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                filter === f ? "bg-brand-purple text-white shadow-xl shadow-purple-900/40" : "bg-[#1E293B] border border-slate-800 text-slate-400 hover:text-white"
              )}
           >
             {f.replace(/_/g, " ").toUpperCase()}
           </button>
         ))}
      </div>

      {selectedReleases.size > 0 && (
         <div className="bg-brand-blue/10 border border-brand-blue/30 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <CheckSquare className="w-5 h-5 text-brand-blue" />
               <span className="font-bold text-sm text-brand-blue">{selectedReleases.size} Asset(s) Selected</span>
            </div>
            <div className="flex items-center gap-3">
               <button 
                  onClick={() => handleBulkAction('live')}
                  disabled={isBulkProcessing}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl text-[10px] uppercase font-black tracking-widest disabled:opacity-50"
               >
                 Approve & Set Live
               </button>
               <button 
                  onClick={() => handleBulkAction('rejected')}
                  disabled={isBulkProcessing}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl text-[10px] uppercase font-black tracking-widest disabled:opacity-50"
               >
                 Reject Selected
               </button>
            </div>
         </div>
      )}

      <div className="bg-[#1E293B] rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl relative">
         <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left min-w-[1300px]">
            <thead>
               <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 bg-slate-900/50">
                  <th className="px-6 py-8 relative w-16 text-center">
                     <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded appearance-none checked:bg-brand-blue bg-slate-800 border-none cursor-pointer relative after:content-['✓'] after:invisible checked:after:visible after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:text-white after:text-xs" 
                        checked={selectedReleases.size > 0 && selectedReleases.size === filteredIds.length}
                        onChange={() => toggleAll(filteredIds)}
                     /> 
                  </th>
                  <th className="px-10 py-8 relative">
                     Asset
                     <div className="absolute top-0 right-0 bottom-0 w-px bg-slate-800 h-full"></div>
                  </th>
                  <th className="px-8 py-8 relative">
                     Primary Details
                     <div className="absolute top-0 right-0 bottom-0 w-px bg-slate-800 h-full"></div>
                  </th>
                  <th className="px-8 py-8 relative">
                     Status
                     <div className="absolute top-0 right-0 bottom-0 w-px bg-slate-800 h-full"></div>
                  </th>
                  <th className="px-8 py-8 relative">
                     Performance Array
                     <div className="absolute top-0 right-0 bottom-0 w-px bg-slate-800 h-full"></div>
                  </th>
                  <th className="px-8 py-8 relative">
                     Identifiers
                     <div className="absolute top-0 right-0 bottom-0 w-px bg-slate-800 h-full"></div>
                  </th>
                  <th className="px-10 py-8 text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
               {filtered.map((r, i) => (
                 <tr key={r.id} className={cn("group transition-colors", selectedReleases.has(r.id) ? "bg-brand-blue/5" : "hover:bg-slate-800/80")}>
                    <td className="px-6 py-8 text-center">
                       <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded appearance-none checked:bg-brand-blue bg-slate-800 border border-slate-700 cursor-pointer relative after:content-['✓'] after:invisible checked:after:visible after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:text-white after:text-xs" 
                          checked={selectedReleases.has(r.id)}
                          onChange={() => toggleSelection(r.id)}
                       />
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-[1.25rem] overflow-hidden bg-slate-800 border border-slate-700 shadow-md group-hover:scale-105 transition-transform shrink-0">
                             <img src={r.coverUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div className="min-w-0">
                             <p className="font-black text-white text-base md:text-lg tracking-tight truncate max-w-[200px]" title={r.title || r.songName}>{r.title || r.songName}</p>
                             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">ID: <span className="font-mono text-slate-400">{r.id.slice(0, 8)}</span></p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-8 text-sm">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0">
                             <Music className="w-4 h-4 text-brand-blue" />
                          </div>
                          <div className="min-w-0 flex-1">
                             <p className="font-black text-white uppercase text-xs tracking-tight truncate max-w-[180px]" title={r.artist || r.singerName}>{r.artist || r.singerName}</p>
                             <p className="text-slate-500 mt-0.5 text-[9px] font-bold uppercase tracking-widest truncate max-w-[180px]">{r.labelName || r.label || "Independent"}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-8">
                       <span className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-max shadow-inner",
                          r.status === 'live' ? "bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/30" : 
                          r.status === 'pending' ? "bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/30" :
                          r.status === 'rejected' ? "bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/30" :
                          r.status === 'approved' ? "bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/30" :
                          "bg-slate-500/10 text-slate-500"
                       )}>
                          {r.status === 'live' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
                          {r.status?.replace(/_/g, " ")}
                       </span>
                    </td>
                    <td className="px-8 py-8 text-xs text-slate-500">
                       {stats[r.id] ? (
                          <div className="space-y-2 bg-[#172033] p-4 rounded-2xl border border-slate-800/50">
                             <div className="flex items-center gap-3 text-white">
                                <Activity className="w-4 h-4 text-emerald-500" />
                                <span className="font-mono font-black tracking-tight">{stats[r.id].streams.toLocaleString()} <span className="text-slate-500 font-sans text-[9px] uppercase tracking-widest">Streams</span></span>
                             </div>
                             <div className="h-px w-full bg-slate-800/50 my-2"></div>
                             <div className="flex items-center justify-between gap-4 max-w-[200px]">
                                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500">Listeners:</span>
                                <span className="font-mono text-brand-blue font-bold">{stats[r.id].listeners.toLocaleString()}</span>
                             </div>
                             <div className="flex items-center justify-between gap-4 max-w-[200px]">
                                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500">Top DSP:</span>
                                <span className="font-mono text-emerald-400 font-bold truncate max-w-[100px]" title={stats[r.id].topPlatform}>{stats[r.id].topPlatform}</span>
                             </div>
                          </div>
                       ) : r.status === 'live' ? (
                          <div className="bg-[#172033] p-4 rounded-2xl border border-slate-800/50 flex items-center justify-center gap-3 h-[90px]">
                             <span className="w-4 h-4 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></span>
                             <span className="text-[10px] uppercase font-bold text-brand-blue/70">Syncing...</span>
                          </div>
                       ) : (
                          <div className="bg-[#172033]/50 p-4 rounded-2xl border border-slate-800/30 flex items-center justify-center h-[90px]">
                             <span className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-600">Pending Origin</span>
                          </div>
                       )}
                    </td>
                    <td className="px-8 py-8 font-mono text-xs text-slate-500 text-left">
                       <div className="space-y-2 bg-[#172033] p-4 rounded-2xl border border-slate-800/50 w-max">
                         <p className="flex items-center gap-4"><span className="text-[9px] uppercase font-bold tracking-widest text-slate-600 font-sans w-10">ISRC</span> <span className={cn("font-bold text-white", !r.isrc && "text-slate-600")}>{r.isrc || "UNASSIGNED"}</span></p>
                         <p className="flex items-center gap-4"><span className="text-[9px] uppercase font-bold tracking-widest text-slate-600 font-sans w-10">UPC</span> <span className={cn("font-bold text-white", !r.upc && "text-slate-600")}>{r.upc || "UNASSIGNED"}</span></p>
                       </div>
                    </td>
                    <td className="px-10 py-8 text-right align-middle">
                       <div className="flex items-center justify-end gap-3">
                          <Link to={`/admin/review/${r.id}`} className="p-4 bg-brand-blue/10 rounded-[1.25rem] text-brand-blue hover:text-white hover:bg-brand-blue transition-all inline-flex border border-brand-blue/20 hover:scale-105 active:scale-95 shadow-lg group">
                             <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </Link>
                          {deletingId === r.id ? (
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                deleteRelease(r.id, r.title || r.songName);
                              }}
                              className="px-6 py-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-[1.25rem] transition-all inline-flex cursor-pointer relative z-10 shadow-lg shadow-rose-600/30"
                            >
                              Confirm Purge
                            </button>
                          ) : (
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDeletingId(r.id);
                              }}
                              className="p-4 bg-slate-800/80 border border-slate-700 text-slate-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 rounded-[1.25rem] transition-all inline-flex cursor-pointer relative z-10 hover:scale-105"
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
                    <td colSpan={6} className="px-10 py-32 text-center">
                       <div className="max-w-md mx-auto text-center">
                          <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                             <Search className="w-8 h-8 text-slate-600" />
                          </div>
                          <p className="text-sm font-black text-white uppercase tracking-widest mb-2">No Matching Assets</p>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Adjust your filters or search query to locate records.</p>
                       </div>
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
