import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { 
  Music, 
  ChevronLeft, 
  Download, 
  Calendar, 
  Globe, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink,
  Zap,
  Info,
  CheckCircle2,
  Clock,
  Play,
  FileText,
  Image as ImageIcon
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";

const PLATFORMS = [
  { id: 'spotify', name: 'Spotify', color: 'text-emerald-500' },
  { id: 'apple', name: 'Apple Music', color: 'text-rose-500' },
  { id: 'yt', name: 'YouTube Music', color: 'text-red-600' },
  { id: 'instagram', name: 'Instagram', color: 'text-pink-500' },
  { id: 'jio', name: 'JioSaavn', color: 'text-teal-500' },
  { id: 'gaana', name: 'Gaana', color: 'text-red-500' },
  { id: 'facebook', name: 'Facebook', color: 'text-blue-600' },
  { id: 'snapchat', name: 'Snapchat', color: 'text-yellow-500' },
  { id: 'amazon', name: 'Amazon Music', color: 'text-cyan-500' },
  { id: 'wynk', name: 'Wynk Music', color: 'text-orange-500' }
];

export default function ReleaseDetails() {
  const { releaseId } = useParams();
  const navigate = useNavigate();
  const [release, setRelease] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelease = async () => {
      if (!releaseId) return;
      try {
        const docRef = doc(db, "releases", releaseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRelease({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error("Error fetching release:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRelease();
  }, [releaseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
      </div>
    );
  }

  if (!release) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Release not found</h2>
        <Link to="/dashboard/releases" className="text-brand-purple mt-4 inline-block font-bold">Back to Discography</Link>
      </div>
    );
  }

  const statusColors: any = {
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    correction: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    action_required: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    approved: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    in_progress: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    live: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    rejected: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    takedown_requested: "bg-slate-500/10 text-slate-600 border-slate-500/20",
    completed: "bg-slate-900 text-white border-slate-800"
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      {/* Top Navigation */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-3 text-slate-400 hover:text-brand-purple transition-all group font-bold uppercase tracking-widest text-[10px]"
      >
        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
          <ChevronLeft className="w-4 h-4" />
        </div>
        Back to Archive
      </button>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-12 gap-12">
        
        {/* Left Column: Visuals & Core Info */}
        <div className="lg:col-span-5 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative aspect-square rounded-[3.5rem] overflow-hidden shadow-3xl border-8 border-white bg-slate-50"
          >
            <img 
              src={release.coverUrl} 
              alt={release.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-8 right-8">
               <span className={cn(
                 "px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl backdrop-blur-md border",
                 statusColors[release.status] || "bg-slate-100 text-slate-500"
               )}>
                 {release.status?.replace("_", " ")}
               </span>
            </div>
          </motion.div>

          <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-black font-display tracking-tight text-slate-800 leading-tight">
                {release.title}
              </h1>
              <div className="w-12 h-12 rounded-2xl bg-brand-purple/5 flex items-center justify-center text-brand-purple shrink-0">
                <Music className="w-6 h-6" />
              </div>
            </div>
            
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-purple mb-1">Lead Artist</p>
              <h2 className="text-xl font-bold text-slate-600 uppercase tracking-widest">{release.artist}</h2>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-50">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Release Date
                </p>
                <p className="text-sm font-black text-slate-800">{release.releaseDate}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                  <Globe className="w-3 h-3" /> Language
                </p>
                <p className="text-sm font-black text-slate-800">{release.language}</p>
              </div>
            </div>
          </div>

          {/* Admin Feedback Block */}
          {(release.status === 'rejected' || release.status === 'action_required') && release.adminNotes && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-rose-50 border-2 border-rose-100 p-8 rounded-[3rem] space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600">
                <AlertCircle className="w-6 h-6" />
                <h3 className="font-black uppercase tracking-tighter text-lg">System Signal: Rejection Detail</h3>
              </div>
              <p className="text-rose-700 font-medium leading-relaxed italic">
                "{release.adminNotes}"
              </p>
              {(release.status === 'rejected' || release.status === 'action_required') && (
                <Link 
                  to={`/dashboard/edit/${release.id}`}
                  className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-rose-700 transition-all shadow-xl shadow-rose-900/20"
                >
                  Recalibrate & Resubmit <Zap className="w-4 h-4 fill-white" />
                </Link>
              )}
            </motion.div>
          )}
        </div>

        {/* Right Column: Metadata Details */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Metadata Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            <section className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50 space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue flex items-center gap-3">
                <ShieldCheck className="w-4 h-4" /> Intellectual Property
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Copyright Holder</p>
                  <p className="font-bold text-slate-800">{release.copyright || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Publisher</p>
                  <p className="font-bold text-slate-800">{release.publisher || "N/A"}</p>
                </div>
              </div>
            </section>

            <section className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50 space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-purple flex items-center gap-3">
                <Zap className="w-4 h-4" /> Technical Labels
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Distribution Label</p>
                  <p className="font-bold text-slate-800">{release.label || release.labelName || "IND Records"}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Primary Genre</p>
                  <p className="font-bold text-slate-800">{release.genre || release.primaryGenre}</p>
                </div>
              </div>
            </section>
          </div>

          <section className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-50 space-y-8">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                <Info className="w-4 h-4" /> Transmission Meta-data
             </h3>
             <div className="grid md:grid-cols-2 gap-12">
               <div className="space-y-6">
                 <div>
                   <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-2 flex items-center gap-2">
                     <Play className="w-3 h-3" /> Creative Credits
                   </p>
                   <div className="space-y-3 pl-5 border-l-2 border-slate-50">
                     <div><p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Lyricist</p><p className="font-bold text-slate-700">{release.lyricist || "N/A"}</p></div>
                     <div><p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Composer</p><p className="font-bold text-slate-700">{release.composer || "N/A"}</p></div>
                     <div><p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Producer</p><p className="font-bold text-slate-700">{release.producer || "N/A"}</p></div>
                   </div>
                 </div>
               </div>
               <div className="space-y-6">
                  <div>
                   <p className="text-[10px] font-black text-brand-purple uppercase tracking-widest mb-2 flex items-center gap-2">
                     <FileText className="w-3 h-3" /> Identifiers
                   </p>
                   <div className="space-y-3 pl-5 border-l-2 border-slate-50">
                     <div><p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">ISRC CODE</p><p className="font-mono font-black text-brand-blue">{release.isrc || "PENDING GENERATION"}</p></div>
                     <div><p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">UPC BARCODE</p><p className="font-mono font-black text-brand-purple">{release.upc || "PENDING GENERATION"}</p></div>
                   </div>
                 </div>
               </div>
             </div>
          </section>

          {/* Social Presence */}
          {release.metadata?.instagramId && (
            <section className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl flex items-center justify-between">
               <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-white">
                     <ImageIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Live Artist Profile</p>
                    <p className="text-xl font-bold text-white tracking-widest">@{release.metadata.instagramId}</p>
                  </div>
               </div>
               <a 
                href={`https://instagram.com/${release.metadata.instagramId}`} 
                target="_blank" 
                rel="noreferrer"
                className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all"
               >
                 <ExternalLink className="w-5 h-5" />
               </a>
            </section>
          )}

          {/* Live Links Grid */}
          {(release.status === 'live' || release.status === 'approved') && release.platformLinks && (
            <section className="space-y-6">
               <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue">Active Distribution Gateways</h3>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-[8px] font-black uppercase rounded-lg border border-emerald-500/20">Sync Active</span>
               </div>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {Object.entries(release.platformLinks).map(([pid, lnk]) => {
                    if (!lnk) return null;
                    const platform = PLATFORMS.find(p => p.id === pid) || { name: pid, color: 'text-slate-400' };
                    return (
                      <a 
                        key={pid}
                        href={lnk as string}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-50 flex flex-col items-center gap-4 hover:scale-105 transition-all group"
                      >
                         <div className={cn("w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-brand-blue/5 transition-colors", platform.color)}>
                            <ExternalLink className="w-5 h-5" />
                         </div>
                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-800">{platform.name}</span>
                      </a>
                    );
                  })}
               </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
