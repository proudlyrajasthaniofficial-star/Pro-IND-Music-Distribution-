import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { toast } from "sonner";
import { 
  Check, 
  X, 
  RotateCcw, 
  Play, 
  Pause, 
  Download, 
  Edit, 
  Save,
  Music,
  FileText,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Zap,
  Globe,
  UploadCloud,
  FileMusic,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { uploadToCloudinary } from "../../lib/cloudinary";
import { analyzeReleaseMetadata, MetadataCheckResult } from "../../services/geminiService";

import { triggerNotification } from "../../lib/notifications";

export default function AdminReview() {
  const { releaseId } = useParams();
  const navigate = useNavigate();
  const [release, setRelease] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [replacingMedia, setReplacingMedia] = useState<"audio" | "cover" | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [isrc, setIsrc] = useState("");
  const [upc, setUpc] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [links, setLinks] = useState<any>({});
  const [aiChecking, setAiChecking] = useState(false);
  const [aiResult, setAiResult] = useState<MetadataCheckResult | null>(null);
  const [updateType, setUpdateType] = useState<"rejected" | "action_required" | "live" | "in_progress" | "approved" | "completed">("rejected");

  const platforms = [
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

  const handleMediaReplace = async (e: React.ChangeEvent<HTMLInputElement>, type: "audio" | "cover") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReplacingMedia(type);
    setUploadProgress(0);
    try {
      const url = await uploadToCloudinary(file, (p) => setUploadProgress(p));
      const updateKey = type === "audio" ? "audioUrl" : "coverUrl";
      await updateDoc(doc(db, "releases", releaseId!), { [updateKey]: url });
      setRelease((prev: any) => ({ ...prev, [updateKey]: url }));
    } catch (err) {
      alert("Media transmission failed during override.");
    } finally {
      setReplacingMedia(null);
    }
  };

   useEffect(() => {
    const fetchRelease = async () => {
      if (!releaseId) return;
      const d = await getDoc(doc(db, "releases", releaseId));
      if (d.exists()) {
        const data = d.data();
        const baseData = { id: d.id, ...data };
        // Merge metadata into baseData for easier access in the table
        const mergedData = { ...baseData, ...(data.metadata || {}) };
        setRelease(mergedData);
        setFormData(mergedData);
        setIsrc(data.isrc || data.metadata?.isrc || "");
        setUpc(data.upc || data.metadata?.upc || "");
        setLinks(data.platformLinks || {});
      }
      setLoading(false);
    };
    fetchRelease();
  }, [releaseId]);

  const handleUpdate = async (newStatus: string) => {
    if (!releaseId || !release) return;
    setSaving(true);
    try {
      // Use original release data as base to avoid losing root fields like ISRC/UPC if they aren't in formData
      const currentReleaseRef = doc(db, "releases", releaseId);
      const currentReleaseDoc = await getDoc(currentReleaseRef);
      const currentRelease = currentReleaseDoc.data();
      
      const { id, ...saveData } = formData;
      await updateDoc(currentReleaseRef, {
        ...currentRelease,
        ...saveData,
        status: newStatus,
        isrc: isrc || currentRelease?.isrc || null,
        upc: upc || currentRelease?.upc || null,
        platformLinks: links || currentRelease?.platformLinks || {},
        adminNotes: rejectionReason,
        reviewedAt: new Date().toISOString()
      });

      // Fetch User details for notification
      const userDoc = await getDoc(doc(db, "users", release.userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        await triggerNotification("/admin/releases/update-status-notify", {
          email: userData.email,
          name: userData.displayName || "Artist",
          songId: releaseId,
          songName: release.title || release.songName,
          status: newStatus,
          reason: rejectionReason
        });
      }

      toast.success(`Protocol updated: ${newStatus.toUpperCase()}`);
      navigate("/admin/releases");
    } catch (err: any) {
      console.error("Update Error:", err);
      toast.error(`Critical: Master Sync Failure - ${err.message}`);
    } finally {
      setSaving(false);
      setShowRejectionModal(false);
    }
  };

  const runAiCheck = async () => {
    setAiChecking(true);
    try {
      const result = await analyzeReleaseMetadata(formData);
      setAiResult(result);
    } catch (err) {
      alert("AI Analysis failed. Check console for logs.");
    } finally {
      setAiChecking(false);
    }
  };

  const applySuggestions = () => {
    if (!aiResult?.suggestions) return;
    setFormData((prev: any) => ({
      ...prev,
      ...aiResult.suggestions
    }));
    setEditMode(true);
    setAiResult(null);
  };

  const downloadFile = async (url: string, filename: string) => {
    try {
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
    } catch (err) {
      // Fallback to direct navigation if fetch fails (CORS issue etc)
      window.open(url, "_blank");
    }
  };

  if (loading) return <div className="p-10 text-white animate-pulse">Initializing Master Reviewer...</div>;
  if (!release) return <div className="p-10 text-white">Release not found.</div>;

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8">
         <div className="flex items-center gap-4 md:gap-6">
            <button onClick={() => navigate("/admin")} className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors">
               <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <h1 className="text-2xl md:text-4xl font-black font-display tracking-tight uppercase truncate">REVIEW: <span className="text-brand-blue">{release.title || release.songName}</span></h1>
         </div>
         <div className="flex flex-wrap gap-3 md:gap-4">
            <button 
              onClick={() => handleUpdate("approved")}
              disabled={saving}
              className="flex-1 lg:flex-none px-6 md:px-8 py-2.5 md:py-3 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/40 hover:bg-indigo-500 transition-all uppercase tracking-widest"
            >
               <Check className="w-4 h-4 md:w-5 md:h-5" /> APPROVE
            </button>
            <button 
              onClick={() => {
                setUpdateType("rejected");
                setShowRejectionModal(true);
              }}
              disabled={saving}
              className="flex-1 lg:flex-none px-6 md:px-8 py-2.5 md:py-3 bg-rose-600 text-white rounded-xl md:rounded-2xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-900/40 hover:bg-rose-500 transition-all uppercase tracking-widest"
            >
               <X className="w-4 h-4 md:w-5 md:h-5" /> REJECT
            </button>
            <button 
              onClick={() => {
                setUpdateType("action_required");
                setShowRejectionModal(true);
              }}
              disabled={saving}
              className="flex-1 lg:flex-none px-6 md:px-8 py-2.5 md:py-3 bg-amber-600 text-white rounded-xl md:rounded-2xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-900/40 hover:bg-amber-500 transition-all uppercase tracking-widest"
            >
               <RotateCcw className="w-4 h-4 md:w-5 md:h-5" /> CORRECTION
            </button>
            {release.status === 'approved' && (
              <button 
                onClick={() => handleUpdate("in_progress")}
                disabled={saving}
                className="flex-1 lg:flex-none px-6 md:px-8 py-2.5 md:py-3 bg-blue-600 text-white rounded-xl md:rounded-2xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 hover:bg-blue-500 transition-all uppercase tracking-widest"
              >
                 <Zap className="w-4 h-4 md:w-5 md:h-5" /> START DISTRIBUTION
              </button>
            )}
            {release.status === 'takedown_requested' && (
              <button 
                onClick={() => {
                  if (window.confirm("Confirm completion of takedown?")) {
                    handleUpdate("completed");
                  }
                }}
                disabled={saving}
                className="flex-1 lg:flex-none px-6 md:px-8 py-2.5 md:py-3 bg-emerald-600 text-white rounded-xl md:rounded-2xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 hover:bg-emerald-500 transition-all uppercase tracking-widest"
              >
                 <Check className="w-4 h-4 md:w-5 md:h-5" /> COMPLETE TAKEDOWN
              </button>
            )}
         </div>
      </div>

      {/* Status Pipeline Visualizer */}
      <div className="bg-[#1E293B] p-6 rounded-[2rem] border border-slate-800 flex items-center gap-8 overflow-x-auto scrollbar-hide mb-2">
        {[
          { id: 'pending', label: 'Pending' },
          { id: 'action_required', label: 'Correction' },
          { id: 'approved', label: 'Approved' },
          { id: 'in_progress', label: 'In Progress' },
          { id: 'live', label: 'Live' },
          { id: 'takedown_requested', label: 'Takedown' },
          { id: 'completed', label: 'Completed' },
          { id: 'rejected', label: 'Rejected' },
        ].map((s, idx) => {
          const isActive = release.status === s.id;
          return (
            <div key={s.id} className="flex items-center gap-4 shrink-0">
              <div className={cn(
                "flex flex-col items-center gap-2 transition-all duration-500",
                isActive ? "opacity-100 scale-110" : "opacity-40"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2",
                  isActive ? "bg-brand-blue border-brand-blue text-white shadow-[0_0_15px_rgba(0,102,255,0.4)]" : "bg-transparent border-slate-700 text-slate-500"
                )}>
                  {idx + 1}
                </div>
                <span className="text-[10px] uppercase font-black tracking-widest">{s.label}</span>
              </div>
              {idx < 7 && <div className="w-8 h-[2px] bg-slate-800" />}
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
         {/* Media Center */}
         <div className="space-y-6 md:space-y-8">
            <div className="bg-[#1E293B] p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
               <img src={release.coverUrl} className="w-full aspect-square object-cover rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
               <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
               
               <div className="absolute top-8 right-8 md:top-12 md:right-12 flex flex-col gap-2 md:gap-3">
                  <div className="relative">
                     <input type="file" accept="image/*" onChange={(e) => handleMediaReplace(e, "cover")} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                     <button className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center hover:bg-white/20 text-white transition-all shadow-xl">
                        {replacingMedia === 'cover' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <ImageIcon className="w-4 h-4 md:w-5 md:h-5" />}
                     </button>
                  </div>
                  <div className="relative">
                     <input type="file" accept="audio/*" onChange={(e) => handleMediaReplace(e, "audio")} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                     <button className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center hover:bg-white/20 text-white transition-all shadow-xl">
                        {replacingMedia === 'audio' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FileMusic className="w-4 h-4 md:w-5 md:h-5" />}
                     </button>
                  </div>
                  <button 
                    onClick={() => downloadFile(release.coverUrl, `${release.title || 'cover'}_artwork.jpg`)}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center hover:bg-white/20 text-white transition-all shadow-xl"
                  >
                     <Download className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
               </div>

               <div className="absolute bottom-6 left-6 right-6 md:bottom-12 md:left-12 md:right-12 flex items-center justify-between">
                  <div className="p-1.5 md:p-2 bg-white/10 backdrop-blur-xl rounded-xl md:rounded-2xl flex items-center gap-3 md:gap-4">
                     <button className="w-10 h-10 md:w-12 md:h-12 bg-brand-blue rounded-full flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 md:w-6 md:h-6 fill-white" />
                     </button>
                     <div className="pr-3 md:pr-4">
                        <p className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-white/60">Audio Quality</p>
                        <p className="text-xs md:text-sm font-bold text-white uppercase">HI-FI MASTER</p>
                     </div>
                  </div>
                  <button 
                    onClick={() => downloadFile(release.audioUrl, `${release.title || 'audio'}_master.wav`)}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                     <Download className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
               </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center gap-4 md:gap-6">
                <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-emerald-500 shrink-0" />
                <div>
                   <h4 className="font-bold text-emerald-500 text-sm md:text-base">ASSET VERIFICATION</h4>
                   <p className="text-[10px] md:text-xs text-slate-400 font-medium">3000x3000px Cover • WAV Master • Original IP</p>
                </div>
            </div>
         </div>

         {/* Metadata Control */}
         <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <div className="bg-[#1E293B] rounded-[2rem] md:rounded-[3.5rem] border border-slate-800 p-6 md:p-12">
               <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-10 gap-4">
                  <h3 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-4 uppercase">
                     <FileText className="text-brand-blue w-6 h-6 md:w-8 md:h-8" /> METADATA TABLE
                  </h3>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={runAiCheck}
                      disabled={aiChecking}
                      className={cn(
                        "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all bg-brand-purple text-white shadow-lg hover:bg-brand-purple/80 disabled:opacity-50",
                        aiChecking && "animate-pulse"
                      )}
                    >
                       <span className="flex items-center gap-2">
                        <Zap className={cn("w-4 h-4", aiChecking && "animate-spin")} /> 
                        {aiChecking ? "Analyzing..." : "AI Smart Check"}
                       </span>
                    </button>
                    <button 
                      onClick={() => setEditMode(!editMode)}
                      className={cn(
                        "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all self-start md:self-auto",
                        editMode ? "bg-emerald-500 text-white shadow-lg" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      )}
                    >
                       {editMode ? <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Save Snapshot</span> : <span className="flex items-center gap-2"><Edit className="w-4 h-4" /> Unlock Table</span>}
                    </button>
                  </div>
               </div>

               <AnimatePresence>
                 {aiResult && (
                   <motion.div 
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     exit={{ opacity: 0, height: 0 }}
                     className="mb-10 p-6 bg-brand-purple/5 border border-brand-purple/20 rounded-3xl overflow-hidden"
                   >
                     <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                           <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", aiResult.isValid ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500")}>
                              {aiResult.isValid ? <Check className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-brand-purple uppercase tracking-[0.2em]">Security Protocol: Gamma</p>
                              <h4 className="text-sm font-black text-white uppercase tracking-tight">AI Audit Report: {aiResult.isValid ? 'Success' : 'Attention Required'}</h4>
                           </div>
                        </div>
                        <button 
                          onClick={applySuggestions}
                          className="px-4 py-1.5 bg-brand-purple text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-brand-purple/80 transition-all"
                        >
                          Apply Auto-Fixes
                        </button>
                     </div>
                     <div className="space-y-4">
                        {aiResult.issues.map((issue, idx) => (
                           <div key={idx} className="flex items-start gap-3 text-xs text-slate-400">
                              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 shrink-0" />
                              <p>{issue}</p>
                           </div>
                        ))}
                        {aiResult.issues.length === 0 && (
                           <p className="text-xs text-slate-500 italic">No structural anomalies detected in metadata matrix.</p>
                        )}
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>

               <div className="grid sm:grid-cols-2 gap-x-8 md:gap-x-12 gap-y-6 md:gap-y-8">
                  {[
                    { label: "Song Name", key: "songName", fallback: "title" },
                    { label: "Singer Name", key: "singerName", fallback: "artist" },
                    { label: "Lyricist Name", key: "lyricist" },
                    { label: "Music", key: "producer" },
                    { label: "Composer", key: "composer" },
                    { label: "Label Name", key: "labelName", fallback: "label" },
                    { label: "Release Date", key: "releaseDate" },
                    { label: "Release Time", key: "releaseTime" },
                    { label: "Primary Genre", key: "primaryGenre", fallback: "genre" },
                    { label: "Secondary Genre", key: "secondaryGenre" },
                    { label: "Language", key: "language" },
                    { label: "Copyright", key: "copyright" },
                    { label: "Publisher", key: "publisher" },
                    { label: "Instagram ID", key: "instagramId" },
                  ].map((field: any) => (
                    <div key={field.key} className="space-y-2 md:space-y-3">
                       <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-2">{field.label}</label>
                       {editMode ? (
                         <input 
                           value={formData[field.key] || formData[field.fallback] || ""}
                           onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                           className="w-full bg-slate-900 border-none rounded-xl md:rounded-2xl p-3.5 md:p-4 text-xs md:text-sm text-white focus:ring-2 focus:ring-brand-blue/30 transition-all font-medium"
                         />
                       ) : (
                         <div className="w-full bg-slate-800/50 rounded-xl md:rounded-2xl p-3.5 md:p-4 text-xs md:text-sm font-bold text-slate-300 border border-slate-700/50 truncate">
                            {release[field.key] || release[field.fallback] || "---"}
                         </div>
                       )}
                    </div>
                  ))}
               </div>
            </div>

            {/* Post-Approval Section */}
            <div className="bg-brand-blue/10 border border-brand-blue/20 rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-12">
               <h3 className="text-xl md:text-2xl font-black font-display tracking-tight mb-8 md:mb-10 uppercase flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue border border-brand-blue/30 font-bold text-xs italic">i</span>
                  Post-Approval Identifiers
               </h3>
               <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-2 md:space-y-3">
                     <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 ml-2">Assigned ISRC</label>
                     <input 
                        value={isrc}
                        onChange={(e) => setIsrc(e.target.value.toUpperCase())}
                        placeholder="IN-XXX-00-00000"
                        className="w-full bg-slate-900 border-brand-blue/20 rounded-xl md:rounded-2xl p-4 md:p-5 font-mono text-xs md:text-sm tracking-widest text-brand-blue focus:ring-2 focus:ring-brand-blue/40"
                     />
                  </div>
                  <div className="space-y-2 md:space-y-3">
                     <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 ml-2">UPC Code</label>
                     <input 
                        value={upc}
                        onChange={(e) => setUpc(e.target.value)}
                        placeholder="1900000000000"
                        className="w-full bg-slate-900 border-brand-blue/20 rounded-xl md:rounded-2xl p-4 md:p-5 font-mono text-xs md:text-sm tracking-widest text-brand-blue focus:ring-2 focus:ring-brand-blue/40"
                     />
                  </div>
               </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-12 mt-4 md:mt-8">
               <h3 className="text-xl md:text-2xl font-black font-display tracking-tight mb-8 md:mb-10 uppercase flex items-center gap-4">
                  <Globe className="text-emerald-500 w-6 h-6 md:w-8 md:h-8" /> Live Platform URIs
               </h3>
               <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                  {platforms.map(p => (
                    <div key={p.id} className="space-y-1 md:space-y-2">
                       <label className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">{p.name} URL</label>
                       <div className="relative">
                          <input 
                            value={links[p.id] || ""}
                            onChange={(e) => setLinks({...links, [p.id]: e.target.value})}
                            placeholder={`https://${p.id}.com/...`}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl md:rounded-2xl py-2.5 md:py-3 pl-3 md:pl-4 pr-8 md:pr-10 text-[10px] md:text-[11px] font-medium text-slate-300 focus:border-brand-blue outline-none transition-all"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700">
                             <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
               <button 
                 onClick={() => handleUpdate("live")}
                 className="w-full mt-8 md:mt-10 py-4 md:py-5 bg-emerald-500 text-white rounded-2xl md:rounded-[2rem] font-black text-[10px] md:text-xs uppercase tracking-[0.3em] shadow-2xl shadow-emerald-900/40 hover:scale-[1.02] transition-all"
               >
                  Finalize & Mark as Live
               </button>
            </div>
         </div>
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="max-w-xl w-full bg-[#1E293B] rounded-[4rem] border border-slate-700 p-12 space-y-8"
           >
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-rose-500 rounded-[2rem] flex items-center justify-center text-white rotate-6 shadow-2xl shadow-rose-900/40">
                    <AlertCircle className="w-8 h-8" />
                 </div>
                 <div>
                    <h3 className="text-3xl font-black font-display uppercase tracking-tight">{updateType === "rejected" ? "Terminal Rejection" : "Protocol Correction"}</h3>
                    <p className="text-slate-500 font-medium">{updateType === "rejected" ? "Explain why this asset was terminated." : "Explain the required metadata recalibration."}</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{updateType === "rejected" ? "Rejection Reason (Sent to Artist)" : "Correction Details (Sent to Artist)"}</label>
                 <textarea 
                   value={rejectionReason}
                   onChange={(e) => setRejectionReason(e.target.value)}
                   rows={6}
                   className="w-full bg-slate-900 border-none rounded-3xl p-8 text-white focus:ring-2 focus:ring-rose-500/30 transition-all font-medium"
                   placeholder={updateType === "rejected" ? "e.g. Artwork contains watermark, Audio quality too low..." : "e.g. Please update artist name spelling, Verify songwriter credits..."}
                 />
              </div>

              <div className="flex gap-4">
                 <button onClick={() => setShowRejectionModal(false)} className="flex-1 py-4 bg-slate-800 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-slate-700 transition-colors">Cancel</button>
                 <button 
                   onClick={() => handleUpdate(updateType)}
                   disabled={!rejectionReason || saving}
                   className="flex-1 py-4 bg-rose-500 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-rose-900/40"
                 >
                   Confirm {updateType === "rejected" ? "Rejection" : "Correction"}
                 </button>
              </div>
           </motion.div>
        </div>
      )}
    </div>
  );
}
