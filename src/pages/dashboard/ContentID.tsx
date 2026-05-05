import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, addDoc, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { 
  Youtube, 
  ShieldCheck, 
  AlertCircle, 
  Plus, 
  Music,
  CheckCircle2,
  Clock,
  ExternalLink,
  Info,
  Zap,
  MessageSquare
} from "lucide-react";
import { cn } from "../../lib/utils";
import { motion } from "motion/react";
import { toast } from "sonner";

export default function ContentID() {
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ 
    releaseId: "", 
    songName: "", 
    artistName: "", 
    singerName: "",
    labelName: "",
    platform: "YouTube",
    songLink: "" 
  });

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const rSnap = await getDocs(query(collection(db, "releases"), where("userId", "==", user.uid)));
      const filteredReleases = rSnap.docs
        .map(d => ({ id: d.id, ...d.data() } as any))
        .filter(r => r.status === "live" || r.status === "approved");
      setReleases(filteredReleases);

      const qSnap = await getDocs(query(collection(db, "content_id_requests"), where("userId", "==", user.uid)));
      const sortedDocs = qSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => {
         const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
         const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
         return dateB - dateA;
      });
      setRequests(sortedDocs);
    } catch (err) {
      console.error("Error fetching Content ID data:", err);
      toast.error("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleReleaseSelect = (releaseId: string) => {
    const selectedRelease = releases.find(r => r.id === releaseId);
    if (selectedRelease) {
      setFormData({
        ...formData,
        releaseId,
        songName: selectedRelease.title,
        artistName: selectedRelease.artist || profile?.artistName || "",
        labelName: selectedRelease.label || profile?.labelName || ""
      });
    } else {
      setFormData({
        ...formData,
        releaseId,
        songName: "",
        artistName: "",
        labelName: ""
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.releaseId || !formData.songLink || !formData.singerName) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, "content_id_requests"), {
        releaseId: formData.releaseId,
        songName: formData.songName,
        artistName: formData.artistName,
        singerName: formData.singerName,
        labelName: formData.labelName,
        platform: formData.platform,
        songLink: formData.songLink,
        userId: user.uid,
        userEmail: user.email,
        userName: profile?.displayName || user.displayName || "Unknown",
        status: "pending",
        createdAt: new Date().toISOString()
      });
      setFormData({ 
        releaseId: "", 
        songName: "", 
        artistName: "", 
        singerName: "",
        labelName: "",
        platform: "YouTube",
        songLink: "" 
      });
      fetchData();
      toast.success("Content ID request submitted successfully.");
    } catch (err) {
      toast.error("Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 animate-pulse text-slate-400 font-black uppercase tracking-widest">Checking Content Data...</div>;

  return (
    <div className="space-y-12 pb-20 text-left">
      <div className="flex flex-col xl:flex-row gap-12 text-left">
         <div className="flex-1 space-y-8 text-left">
            <div className="text-left">
              <h1 className="text-4xl md:text-7xl font-black font-display tracking-tight uppercase leading-none mb-4">
                Content <span className="text-brand-blue">ID</span>
              </h1>
              <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Protect your music and manage rights across YouTube</p>
            </div>
            
            <div className="bg-slate-950 rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-10 text-white shadow-premium-dark relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-brand-blue/10 blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
               <div className="noise absolute inset-0 opacity-[0.03] pointer-events-none"></div>
               
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-xl group-hover:scale-110 transition-transform">
                        <Youtube className="w-7 h-7 text-brand-blue" />
                     </div>
                     <div className="text-left">
                        <h3 className="text-xl font-black uppercase tracking-tight">Request Protection</h3>
                        <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Secure your music metadata for fingerprinting (Live Tracks Only)</p>
                     </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                           <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 ml-4">Select Live Track</label>
                           <select 
                             required
                             value={formData.releaseId}
                             onChange={(e) => handleReleaseSelect(e.target.value)}
                             className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 text-sm font-black uppercase tracking-tight text-white outline-none focus:border-brand-blue transition-all appearance-none cursor-pointer"
                           >
                              <option value="" className="bg-slate-950">Select Track...</option>
                              {releases.map(r => <option key={r.id} value={r.id} className="bg-slate-950">{r.title}</option>)}
                           </select>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 ml-4">Platform</label>
                           <select 
                             required
                             value={formData.platform}
                             onChange={(e) => setFormData({...formData, platform: e.target.value})}
                             className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 text-sm font-black uppercase tracking-tight text-white outline-none focus:border-brand-blue transition-all appearance-none cursor-pointer"
                           >
                              <option value="YouTube" className="bg-slate-950">YouTube</option>
                              <option value="Facebook" className="bg-slate-950">Facebook / Instagram</option>
                              <option value="TikTok" className="bg-slate-950">TikTok</option>
                              <option value="All" className="bg-slate-950">All Global Platforms</option>
                           </select>
                        </div>
                     </div>

                     <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                           <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 ml-4">Singer Name</label>
                           <input 
                             required
                             value={formData.singerName}
                             onChange={(e) => setFormData({...formData, singerName: e.target.value})}
                             className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 text-sm font-black text-white outline-none focus:border-brand-blue transition-all placeholder:text-slate-700"
                             placeholder="Lead Vocalist Name"
                           />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 ml-4">Label Name</label>
                           <input 
                             required
                             value={formData.labelName}
                             onChange={(e) => setFormData({...formData, labelName: e.target.value})}
                             className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 text-sm font-black text-white outline-none focus:border-brand-blue transition-all placeholder:text-slate-700"
                             placeholder="Music Label"
                           />
                        </div>
                     </div>

                     <div className="space-y-3 text-left">
                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 ml-4">Song URL / Link</label>
                        <input 
                           required
                           value={formData.songLink}
                           onChange={(e) => setFormData({...formData, songLink: e.target.value})}
                           className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 text-sm font-black text-white outline-none focus:border-brand-blue transition-all placeholder:text-slate-700"
                           placeholder="https://youtube.com/watch?v=..."
                        />
                     </div>

                     <button 
                       disabled={submitting || !formData.releaseId}
                       className="w-full py-6 bg-brand-blue text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-white hover:text-slate-950 transition-all shadow-[0_20px_40px_-10px_rgba(0,102,255,0.4)] disabled:opacity-30 disabled:cursor-not-allowed group/btn overflow-hidden relative"
                     >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500"></div>
                        <span className="relative z-10 flex items-center justify-center gap-3">
                           {submitting ? "SUBMITTING..." : "SUBMIT CONTENT ID REQUEST"}
                           <Zap className="w-4 h-4 fill-current" />
                        </span>
                     </button>
                  </form>
               </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex items-start gap-6 backdrop-blur-xl">
               <div className="w-14 h-14 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue shadow-lg border border-brand-blue/20">
                  <ShieldCheck className="w-7 h-7" />
               </div>
               <div>
                  <h4 className="font-black text-white uppercase text-sm tracking-widest mb-2">Protection Guidelines</h4>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed tracking-wide">
                     Our automated system will scan and protect your music across YouTube. 
                     Processing usually takes about 3-5 business days. 
                     Make sure the provided link is valid to avoid any delays.
                  </p>
               </div>
            </div>
         </div>

         <div className="w-full xl:w-[450px] space-y-8">
            <div className="flex items-center justify-between">
               <h3 className="text-2xl font-black font-display tracking-tight uppercase flex items-center gap-3">
                  <Clock className="w-7 h-7 text-brand-blue" /> Request History
               </h3>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{requests.length} Requests</span>
            </div>

            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
               {requests.map((r, i) => (
                  <motion.div 
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    key={r.id} 
                    className="bg-white rounded-[2rem] border border-slate-100 shadow-premium p-6 group hover:border-brand-blue transition-all duration-500"
                  >
                     <div className="flex items-start justify-between mb-4">
                        <div className="flex flex-col gap-1">
                           <span className={cn(
                              "text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border w-fit",
                              r.status === 'approved' ? "bg-emerald-50 border-emerald-100 text-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.2)]" : 
                              r.status === 'pending' ? "bg-brand-blue/5 border-brand-blue/10 text-brand-blue" : "bg-rose-50 border-rose-100 text-rose-600"
                           )}>{r.status}</span>
                           <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mt-2">Request ID: {r.id.slice(-8).toUpperCase()}</h4>
                        </div>
                        <a href={r.songLink} target="_blank" rel="noreferrer" className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 transition-all">
                           <ExternalLink className="w-4 h-4" />
                        </a>
                     </div>
                     
                     <div className="space-y-3 pb-4 border-b border-slate-50">
                        <div>
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Metadata</p>
                           <p className="text-xs font-black text-slate-900 uppercase truncate mt-0.5">{r.songName}</p>
                        </div>
                        <div>
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Artist Name</p>
                           <p className="text-[10px] font-bold text-slate-600 uppercase mt-0.5">{r.artistName}</p>
                        </div>
                     </div>

                     <div className="flex items-center justify-between mt-4">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">{new Date(r.createdAt).toLocaleDateString()}</span>
                        {r.adminResponse && (
                           <div className="flex items-center gap-1.5 text-brand-purple">
                              <MessageSquare className="w-3 h-3" />
                              <span className="text-[8px] font-black uppercase tracking-widest">Admin Reply</span>
                           </div>
                        )}
                     </div>
                  </motion.div>
               ))}
               {requests.length === 0 && (
                  <div className="py-24 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                     <ShieldCheck className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">No Requests Found</p>
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}

