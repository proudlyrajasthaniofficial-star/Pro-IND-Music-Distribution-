import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { 
  Music, 
  Search, 
  ExternalLink,
  ChevronRight,
  Filter,
  AlertCircle,
  XCircle,
  FileText,
  ArrowRight,
  Download,
  RotateCcw,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

const STATUSES = [
  { id: 'all', label: 'All Releases' },
  { id: 'pending', label: 'Pending', color: 'bg-amber-500/10 text-amber-600 border border-amber-500/20' },
  { id: 'action_required', label: 'Correction', color: 'bg-rose-500/10 text-rose-600 border border-rose-500/20' },
  { id: 'approved', label: 'Approved', color: 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-500/10 text-blue-600 border border-blue-500/20' },
  { id: 'live', label: 'Live', color: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' },
  { id: 'takedown_requested', label: 'Takedown Requested', color: 'bg-slate-500/10 text-slate-600 border border-slate-500/20' },
  { id: 'completed', label: 'Completed', color: 'bg-slate-900 text-white' },
  { id: 'rejected', label: 'Rejected', color: 'bg-rose-500/10 text-rose-600 border border-rose-500/20' },
];

const PLATFORMS = [
  { id: 'spotify', name: 'Spotify' },
  { id: 'apple', name: 'Apple Music' },
  { id: 'yt', name: 'YouTube Music' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'jio', name: 'JioSaavn' },
  { id: 'gaana', name: 'Gaana' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'snapchat', name: 'Snapchat' },
  { id: 'amazon', name: 'Amazon Music' },
  { id: 'wynk', name: 'Wynk Music' }
];

export default function MyReleases() {
  const { user } = useAuth();
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const q = query(
      collection(db, "releases"), 
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setReleases(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error("Releases snapshot error:", err);
      toast.error("Discography synchronization offline.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredReleases = releases.filter(r => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const matchesSearch = r.title?.toLowerCase().includes(search.toLowerCase()) || 
                          r.artist?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const downloadFile = async (url: string, filename: string) => {
    try {
      toast.loading("Preparing asset for secure transmission...");
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Extraction complete.");
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: Open in new tab
      window.open(url, "_blank");
      toast.info("Secondary transmission protocol initiated.");
    }
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Header with Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8">
        <div>
           <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight uppercase">Discography</h1>
           <p className="text-xs md:text-sm text-slate-400 font-medium">Manage and track your global catalog in high definition.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 pl-4 md:pl-6 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-slate-50 w-full lg:w-auto">
           <Search className="w-4 h-4 md:w-5 md:h-5 text-slate-300" />
           <input 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             placeholder="Search releases..."
             className="bg-transparent border-none focus:ring-0 text-xs md:text-sm font-bold flex-1 md:min-w-[200px]"
           />
           <button className="w-10 h-10 md:w-12 md:h-12 bg-slate-950 text-white rounded-[1.2rem] md:rounded-3xl flex items-center justify-center hover:bg-brand-blue transition-colors">
              <Filter className="w-4 h-4 md:w-5 md:h-5" />
           </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide py-2">
         {STATUSES.map((s) => (
            <button 
              key={s.id}
              onClick={() => setFilter(s.id)}
              className={cn(
                "px-6 md:px-8 py-2.5 md:py-3.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap",
                filter === s.id ? "bg-brand-blue text-white shadow-2xl shadow-blue-500/30 -translate-y-1" : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50"
              )}
            >
               {s.label}
            </button>
         ))}
      </div>

      {/* Releases Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
         <AnimatePresence mode="popLayout">
            {filteredReleases.map((release, i) => (
               <motion.div 
                 key={release.id}
                 layout
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 transition={{ delay: i * 0.05 }}
                 className="bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[4rem] shadow-sm border border-slate-100 group hover:shadow-3xl transition-all duration-700 relative flex flex-col"
               >
                  {/* Status Indicator */}
                  <div className="absolute top-4 right-4 md:top-10 md:right-10 z-20">
                     <span className={cn(
                        "px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] shadow-sm backdrop-blur-md",
                        STATUSES.find(s => s.id === release.status)?.color || "bg-slate-100 text-slate-500"
                     )}>
                        {release.status?.replace("_", " ")}
                     </span>
                  </div>

                   {/* Artwork Section */}
                  <div className="relative aspect-square rounded-[2rem] md:rounded-[3rem] overflow-hidden mb-6 md:mb-8 shadow-2xl bg-slate-100">
                     <img 
                       src={release.coverUrl} 
                       className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                       referrerPolicy="no-referrer" 
                     />
                     <div className="absolute inset-x-0 bottom-0 p-6 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-30">
                        <button 
                          onClick={() => downloadFile(release.coverUrl, `${release.title}_Artwork.jpg`)}
                          className="flex-1 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                        >
                          <ImageIcon className="w-3 h-3" /> Artwork
                        </button>
                        <button 
                          onClick={() => downloadFile(release.audioUrl, `${release.title}_Master.wav`)}
                          className="flex-1 py-3 bg-brand-blue text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-brand-blue/90 shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                        >
                          <Download className="w-3 h-3" /> Audio
                        </button>
                     </div>
                     <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8 gap-4">
                        <Link 
                          to={`/dashboard/releases/${release.id}`}
                          className="w-full py-4 bg-white rounded-2xl text-slate-950 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-brand-blue hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0"
                        >
                           Detailed Dossier <ChevronRight className="w-4 h-4" />
                        </Link>
                        <div className="flex gap-3 transform translate-y-8 group-hover:translate-y-0 transition-transform delay-75 invisible group-hover:visible">
                           {(release.status === 'action_required' || release.status === 'rejected') && (
                             <Link 
                               to={`/dashboard/edit/${release.id}`}
                               className="flex-1 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/20 transition-all text-center flex items-center justify-center gap-2"
                             >
                               <RotateCcw className="w-3 h-3" /> Fix Assets
                             </Link>
                           )}
                           {release.status === 'live' && (
                             deletingId === release.id ? (
                               <button 
                                 onClick={async () => {
                                   try {
                                     await updateDoc(doc(db, "releases", release.id), { status: "takedown_requested" });
                                     setReleases(prev => prev.map(r => r.id === release.id ? { ...r, status: "takedown_requested" } : r));
                                     toast.success("Takedown protocol initiated.");
                                     setDeletingId(null);
                                   } catch (err) {
                                     toast.error("Failed to initiate takedown.");
                                   }
                                 }}
                                 className="flex-1 py-3 bg-red-600 backdrop-blur-md text-white rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-red-700 transition-all cursor-pointer"
                               >
                                 CONFIRM TAKEDOWN
                               </button>
                             ) : (
                               <button 
                                 onClick={() => setDeletingId(release.id)}
                                 className="flex-1 py-3 bg-rose-500/80 backdrop-blur-md text-white rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-rose-600 transition-all cursor-pointer"
                               >
                                 Takedown
                               </button>
                             )
                           )}
                        </div>
                     </div>
                  </div>

                  {/* Info Section */}
                  <div className="flex-1 space-y-4 md:space-y-6">
                     <div>
                        <div className="flex items-center justify-between mb-2">
                           <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest">{release.releaseType || "Single"}</p>
                           <p className="text-[8px] md:text-[9px] font-bold text-slate-300 uppercase tracking-widest">{new Date(release.createdAt).toLocaleDateString()}</p>
                        </div>
                        <h3 className="text-xl md:text-2xl font-black font-display tracking-tight text-slate-800 line-clamp-1 group-hover:text-brand-blue transition-colors">
                           {release.title}
                        </h3>
                        <p className="text-xs md:text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">
                           {release.artist}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                           <span className="text-[8px] font-black uppercase px-2 py-1 bg-slate-50 text-slate-400 rounded-lg border border-slate-100 italic">Lang: {release.language}</span>
                           <span className="text-[8px] font-black uppercase px-2 py-1 bg-slate-50 text-slate-400 rounded-lg border border-slate-100 italic">Genre: {release.primaryGenre}</span>
                           <span className="text-[8px] font-black uppercase px-2 py-1 bg-slate-50 text-slate-400 rounded-lg border border-slate-100 italic">Label: {release.labelName}</span>
                        </div>
                        <div className="mt-4 space-y-1.5">
                           <p className="text-[9px] font-medium text-slate-400 italic">Lyricist: {release.lyricist}</p>
                           <p className="text-[9px] font-medium text-slate-400 italic">Composer: {release.composer}</p>
                           <p className="text-[9px] font-medium text-slate-400 italic">Producer: {release.producer}</p>
                        </div>

                        {(release.status === 'rejected' || release.status === 'action_required') && release.adminNotes && (
                           <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl md:rounded-[2rem] space-y-2">
                              <p className="text-[8px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-1.5">
                                <AlertCircle className="w-3 h-3" /> System Feedback
                              </p>
                              <p className="text-[10px] text-rose-700 font-medium italic line-clamp-2">
                                "{release.adminNotes}"
                              </p>
                           </div>
                        )}
                     </div>

                     <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                        <div>
                           <p className="text-[8px] uppercase font-black text-slate-300 tracking-[0.2em] mb-1">ISRC</p>
                           <p className="text-[10px] font-mono font-black text-slate-800 truncate">
                              {release.isrc || "TBD"}
                           </p>
                        </div>
                        <div>
                           <p className="text-[8px] uppercase font-black text-slate-300 tracking-[0.2em] mb-1">UPC</p>
                           <p className="text-[10px] font-mono font-black text-slate-800 truncate">
                              {release.upc || "TBD"}
                           </p>
                        </div>
                     </div>

                     {(release.status === 'live' || release.status === 'approved') && release.platformLinks && Object.values(release.platformLinks).some(link => !!link) && (
                        <div className="pt-6 border-t border-slate-50">
                           <p className="text-[8px] uppercase font-black text-brand-blue tracking-[0.2em] mb-3">Release Live On</p>
                           <div className="flex flex-wrap gap-2">
                              {Object.entries(release.platformLinks).map(([pid, lnk]) => {
                                if (!lnk) return null;
                                const pName = PLATFORMS.find(p => p.id === pid)?.name || pid;
                                return (
                                  <a 
                                    key={pid}
                                    href={lnk as string}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 bg-slate-50 hover:bg-brand-blue border border-slate-100 hover:border-brand-blue rounded-lg flex items-center gap-2 group/link transition-all"
                                  >
                                    <span className="text-[9px] font-bold text-slate-600 group-hover/link:text-white uppercase">{pName}</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-slate-300 group-hover/link:text-white" />
                                  </a>
                                );
                              })}
                           </div>
                        </div>
                     )}

                     <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-1.5 underline decoration-brand-blue/20 underline-offset-4 decoration-dotted">
                          <Link to={`/dashboard/releases/${release.id}`} className="flex items-center gap-1.5 group/link">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-slate-400 group-hover/link:text-brand-blue uppercase tracking-widest transition-colors">Global Status Sync</span>
                          </Link>
                        </div>
                        <div className="flex gap-2">
                           <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300">
                             <Music className="w-4 h-4" />
                           </div>
                           <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300">
                             <FileText className="w-4 h-4" />
                           </div>
                        </div>
                     </div>
                  </div>
               </motion.div>
            ))}
         </AnimatePresence>

         {filteredReleases.length === 0 && !loading && (
           <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white rounded-[4rem] border-4 border-dashed border-slate-100 text-center mx-10">
              <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mb-8 border-2 border-slate-100">
                 <Music className="w-12 h-12" />
              </div>
              <h3 className="font-black font-display text-4xl uppercase tracking-tighter mb-4 text-slate-800">No signals detected</h3>
              <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed mb-10">Your catalog is currently void of activity. Start your legacy by deploying your first master recording.</p>
              <Link to="/dashboard/upload" className="btn-premium btn-glow flex items-center gap-3 py-4 px-10">
                 Upload New Release <ArrowRight className="w-5 h-5" />
              </Link>
           </div>
         )}
      </div>
    </div>
  );
}
