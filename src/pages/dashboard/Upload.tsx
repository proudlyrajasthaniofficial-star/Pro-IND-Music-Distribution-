import React, { useState, useEffect } from "react";
import { triggerNotification } from "../../lib/notifications";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../../lib/firebase";
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { uploadToCloudinary } from "../../lib/cloudinary";
import { 
  Music, 
  Upload as UploadIcon, 
  ArrowRight, 
  ArrowLeft,
  X,
  Image as ImageIcon,
  Check,
  Disc,
  Mic2,
  Calendar,
  Building,
  Plus,
  ShieldAlert,
  Zap,
  CheckCircle,
  UserPlus
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import { INDIAN_GENRES } from "../../lib/constants";

const schema = z.object({
  releaseType: z.enum(["Single", "Album", "EP"]),
  songName: z.string().min(1, "Song Name is required"),
  singerName: z.string().min(1, "Singer Name is required"),
  featuringArtist: z.string().optional(),
  lyricist: z.string().min(1, "Lyricist Name is required"),
  instagramId: z.string().optional(),
  lyrics: z.string().optional(),
  composer: z.string().min(1, "Composer is required"),
  producer: z.string().min(1, "Producer is required"),
  copyrightYear: z.string().min(1, "Copyright Year is required"),
  copyrightHolder: z.string().min(1, "Copyright Holder is required"),
  publisherYear: z.string().min(1, "Publisher Year is required"),
  publisherHolder: z.string().min(1, "Publisher Holder is required"),
  language: z.string().min(1, "Language is required"),
  primaryGenre: z.string().min(1, "Primary Genre is required"),
  secondaryGenre: z.string().min(1, "Secondary Genre is required"),
  isrc: z.string().optional(),
  upc: z.string().optional(),
  releaseDate: z.string().min(1, "Release Date is required"),
  releaseTime: z.string().optional(),
  labelName: z.string().min(1, "Label is required"),
  callertuneName: z.string().optional(),
  callertuneTimeCut: z.string().optional(),
});

const STEPS = [
  "Release Type", 
  "Details", 
  "Timeline", 
  "Label", 
  "Audio", 
  "Artwork", 
  "Platforms", 
  "Review"
];

const LANGUAGES = [
  "Hindi", "English", "Punjabi", "Haryanvi", "Bhojpuri", "Rajasthani", "Bengali", "Marathi", 
  "Telugu", "Tamil", "Gujarati", "Urdu", "Kannada", "Malayalam", "Odia", "Assamese", "Maithili"
];

const YEARS = Array.from({ length: 2070 - 2017 + 1 }, (_, i) => (2017 + i).toString());
const PLATFORMS = [
  { name: "Facebook", logo: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiT4AraHOBV5Z8hsEFIqSk-x4MH9Bq6HCvLcVy0BdUZfa05thWfnrXvS27CHv14oSQ9WCyahaXNoBChRgJ3B8GzDPOqUBKegOqo6bSIgxEHPq8-pDoIMidDxRzhN1Dbcp9AYtrpLOiOvvOlxVaTwmOKUWYfhLt0kKe0MSVwbsxM4W9tIH6Q_QXebieY-FQ/s225/1000625038.png" },
  { name: "YouTube Content ID", logo: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjQEP7K3_JFRWDwHOwB8zvSzwDvb2FHws9aZTtxDlOecHoh4acgXA58jJcJ0SuuJhc0Ins6RGcvL6fM-rXYv7Wzp1t-cYfu6Y35xqKmLDgasn-vadrwvlaMxvP4s-7udpvsgbIUu02xGVfgV8rgPHIsj3UvKRIYgXS9oXKFhLDBZvVlFQbkU6Z49rSEfw8/s390/1000625039.png" },
  { name: "YouTube Music", logo: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhCBvvdrkwgOYchq85w_ntr8jgL_VnWuHbXE8D5xktwlb1RkHQKPEKu25m3pPXULu9r5ZkqUbmjZGh5hjBm-9e8SXeazxM-0_5gyItH6czSh3ZvtFewhHB-pRDvVoJv8lw11Z3qMmVj9TnCA6-hUkLF9yGJR2QdRUe-B9e0r4FHTRgV2sr_UHr6VfekCHM/s900/1000625040.jpg" },
  { name: "YouTube", logo: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgEVQjuWWqit8Sb75qVR7lk36_4Lp5rbYYskV1-p07lnQWiUk1KG2biUAN_Bp-36oaOQk33_x7AuGhL416wD5eFjgk0DHapjlHQooqqJzgYZervYA6_ckhFqJNnNeYrhsQLBbXcTH8eqdw5enYkNO_xLZn2My_uYVTtStDAzjWmuCUOwzy02QVlB0THYHw/s225/1000625041.png" },
  { name: "Apple Music", logo: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjzohmzK39V2QK71HU443ccu-WGjXmGGStVl0E_uUG2xGCaKtjWWHE0r0yvetl7SxWNPUYYc7tHb_bTqL7gRgeQhIG7_e0M4mJdeh1tXR7LVKMfDSrKJdjH9fBk2GEuVsxOJ9VfEv_OsW-TNSuzsOIi-dRVd_g5WlL1Fmc1l-CEko4pcRT8lxUR72ipzJM/s554/1000625034.jpg" },
  { name: "Wynk", logo: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj_8gQQpLDy3RYSgfgDsIglEijRKzfxWtmFrElw25N-b6nRFyM512Na6GN8kFJ_HGDzQy04Uob9hg0OZW_csKFekqMq2w89cSrrE9mdxvH4CWqsK3YNC6_ZQwoULGocxy37eDAh8droYGb7d6eolS6aZ2MAdmLXQAzESaJIHOApjTDVXQfbVsmG8qhb1tc/s225/1000625035.png" },
  { name: "Snapchat", logo: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjnmd1cJShVfhlnQhlwgkW5oBjz_wNUc-j0SgdDJ9Rm8rnPDZNL7gY1sww99LLCOTZ4BBEXVe7Qs_eJEk3s0uRl5k7IQutxtQbx3kWIZCT7N-p5HajRaCcbXDoj_SXaixa5GFhktXabHzy9UONMF3F80n4DDVFE0mZMGif6kULL8LigW1TTRUgCvHiBXec/s210/1000625036.png" },
  { name: "Instagram", logo: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhE0GzAMMtOcf7clhoWZr5xY9cY1EYjqYtZMYl-ndVMiBbr64GCJGX46ShXVTWfky_FNQSnyfMkGXgsgiVrqT67qi2N0uWerrZZt1A3rdaMuEVAx46XgQNiERKWNKkDK1H4bSj9AmZdYluYwpnD-c1AX4IFrnmhEDZMIfy93NFX92fH0RngdU0D9tBR83Y/s225/1000625037.jpg" },
  { name: "Spotify", logo: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEidEVJ6vlUjuTbfUY6oSdwxTadADIm1bzHDcD4L1xAnknuUiO6dTbu6mKc0pyBq-QOFDtnh9sJe1QEMyKBu_eWUH8kLoy2x_vnsp3cQ8pH297d6kMTvig8TgBDpo55BhwbZds0DLuGn4XwNylIeXn3EwubOnw-k-nFIzpiuTPBEbhj7ZsLSCRMOrrylpQQ/s225/1000625032.png" },
  { name: "JioSaavn", logo: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhk0sfcoYPosDFUis2uzahyD1tQD1T2GC_V9ywhvgxtJvVHORzjzhOM83PAT1GhHF9GiXPUwoxAUEXhvGmCE0ofUJz_FGvRNAegRWecVjsF0eXdq-y_7-W90H9NXe4fJTVG6N6Bb71PeZPx6dQZOFjzJyHFGj-UsrhyPNSFLYX6En0NzYDoSlthT1G6224/s160/1000625033.png" },
  { name: "Copyright ©️", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Copyright.svg" }
];

export default function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { releaseId } = useParams();
  const [step, setStep] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: { current: number, name: string } }>({});
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(PLATFORMS.map(p => p.name));
  const [existingRelease, setExistingRelease] = useState<any>(null);
  
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioValidation, setAudioValidation] = useState<{ valid: boolean; error?: string } | null>(null);

  const validateAudio = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".wav")) {
       setAudioValidation({ valid: true }); // Skip for non-wav mp3
       return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (buffer.byteLength < 44) {
        setAudioValidation({ valid: false, error: "Invalid WAV file structure." });
        return;
      }
      const view = new DataView(buffer);
      
      // Sample Rate: Offset 24, 4 bytes, Little Endian
      const sampleRate = view.getUint32(24, true);
      // Bits Per Sample: Offset 34, 2 bytes, Little Endian
      const bitsPerSample = view.getUint16(34, true);

      if (sampleRate !== 44100 && sampleRate !== 48000) {
        setAudioValidation({ valid: false, error: `Invalid Sample Rate: ${sampleRate}Hz. Standard is 44100Hz.` });
      } else if (bitsPerSample !== 16 && bitsPerSample !== 24) {
        setAudioValidation({ valid: false, error: `Invalid Bit Depth: ${bitsPerSample}-bit. Standard is 16-bit.` });
      } else {
        setAudioValidation({ valid: true });
        toast.success(`Audio Verified: ${sampleRate}Hz / ${bitsPerSample}-bit WAV detected.`);
      }
    };
    reader.readAsArrayBuffer(file.slice(0, 44));
  };
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [existingAudioUrl, setExistingAudioUrl] = useState<string | null>(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setAudioPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setAudioPreviewUrl(existingAudioUrl);
    }
  }, [audioFile, existingAudioUrl]);

  useEffect(() => {
    if (coverFile) {
      const url = URL.createObjectURL(coverFile);
      setCoverPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setCoverPreviewUrl(existingCoverUrl);
    }
  }, [coverFile, existingCoverUrl]);

  // States for selection
  const [userArtists, setUserArtists] = useState<any[]>([]);
  const [userLabels, setUserLabels] = useState<any[]>([]);
  const [showQuickArtist, setShowQuickArtist] = useState(false);
  const [showQuickLabel, setShowQuickLabel] = useState(false);
  const [quickArtistName, setQuickArtistName] = useState("");
  const [quickLabelName, setQuickLabelName] = useState("");

  const fetchData = async () => {
    if (!user) return;
    const artistsSnap = await getDocs(query(collection(db, "artists"), where("userId", "==", user.uid)));
    setUserArtists(artistsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    
    const labelsSnap = await getDocs(query(collection(db, "labels"), where("userId", "==", user.uid)));
    setUserLabels(labelsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    if (releaseId) {
      const releaseDoc = await getDoc(doc(db, "releases", releaseId));
      if (releaseDoc.exists()) {
        const data = releaseDoc.data();
        setExistingRelease(data);
        setExistingAudioUrl(data.audioUrl || null);
        setExistingCoverUrl(data.coverUrl || null);
        setSelectedPlatforms(data.platforms || PLATFORMS.map(p => p.name));
        
        // Map data back to form
        if (data.metadata) {
          Object.entries(data.metadata).forEach(([k, v]) => {
            setValue(k as any, v as any);
          });
        }
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const { register, handleSubmit, formState: { errors }, watch, setValue, trigger } = useForm({
    mode: "onChange",
    resolver: zodResolver(schema),
    defaultValues: {
      releaseType: "Single",
      songName: "",
      singerName: "",
      featuringArtist: "",
      lyricist: "",
      instagramId: "",
      lyrics: "",
      composer: "",
      producer: "",
      copyrightYear: new Date().getFullYear().toString(),
      copyrightHolder: "",
      publisherYear: new Date().getFullYear().toString(),
      publisherHolder: "",
      language: "Hindi",
      primaryGenre: "Romantic",
      secondaryGenre: "Desi Pop",
      isrc: "",
      upc: "",
      releaseDate: "",
      releaseTime: "00:00",
      labelName: "",
      callertuneName: "",
      callertuneTimeCut: ""
    }
  });

  const watchAll = watch();

  const handleQuickArtist = async () => {
    if (!user || !quickArtistName) return;
    try {
      const docRef = await addDoc(collection(db, "artists"), {
        name: quickArtistName,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      setValue("singerName", quickArtistName);
      setShowQuickArtist(false);
      setQuickArtistName("");
      fetchData();
      toast.success(`Artist "${quickArtistName}" registered successfully.`);
    } catch (err: any) {
      console.error("Quick artist error:", err);
      toast.error("Failed to register artist: " + (err.message || "Security rejection"));
    }
  };

  const handleQuickLabel = async () => {
    if (!user || !quickLabelName) return;
    try {
      const docRef = await addDoc(collection(db, "labels"), {
        name: quickLabelName,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      setValue("labelName", quickLabelName);
      setShowQuickLabel(false);
      setQuickLabelName("");
      fetchData();
      toast.success(`Label "${quickLabelName}" registered successfully.`);
    } catch (err: any) {
      console.error("Quick label error:", err);
      toast.error("Failed to register label: " + (err.message || "Security rejection"));
    }
  };

  const onError = (errors: any) => {
    console.error(errors);
    const firstError = Object.values(errors)[0] as any;
    setFormError(`Validation Error: ${firstError?.message || 'Please check all fields'}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = async (data: any) => {
    setFormError(null);
    if (!audioFile && !existingAudioUrl) {
      setFormError("Please upload an audio file first.");
      setStep(4);
      return;
    }
    if (!coverFile && !existingCoverUrl) {
      setFormError("Please upload cover art first.");
      setStep(5);
      return;
    }
    if (!user) return;
    
    setIsUploading(true);
    setUploadProgress({}); // Reset progress map
    try {
      const uploadPromises: Promise<any>[] = [];
      let coverUrl = existingCoverUrl;
      let audioUrl = existingAudioUrl;

      // 1. Prepare Cover Upload
      if (coverFile) {
        uploadPromises.push(
          uploadToCloudinary(coverFile, (progress) => {
            setUploadProgress(prev => ({ 
              ...prev, 
              cover: { current: progress, name: "Cover Art" }
            }));
          }).then(url => coverUrl = url)
        );
      }

      // 2. Prepare Audio Upload
      if (audioFile) {
        uploadPromises.push(
          uploadToCloudinary(audioFile, (progress) => {
            setUploadProgress(prev => ({ 
              ...prev, 
              audio: { current: progress, name: "Master Audio" }
            }));
          }).then(url => audioUrl = url)
        );
      }

      // Execute uploads in parallel
      await Promise.all(uploadPromises);

      const generateCustomId = (title: string) => {
        const sanitized = title.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase();
        const num = Math.floor(100000 + Math.random() * 900000);
        return `IND-${sanitized}-${num}`;
      };

      const releaseData = {
        userId: user.uid,
        customId: generateCustomId(data.songName),
        title: data.songName,
        artist: data.singerName,
        genre: data.primaryGenre, 
        secondaryGenre: data.secondaryGenre,
        language: data.language,
        copyright: `${data.copyrightYear} ${data.copyrightHolder}`,
        publisher: `${data.publisherYear} ${data.publisherHolder}`,
        label: data.labelName, 
        releaseDate: data.releaseDate,
        releaseTime: data.releaseTime,
        audioUrl,
        coverUrl,
        status: "pending", 
        platforms: selectedPlatforms,
        metadata: data,
        isrc: data.isrc || existingRelease?.isrc || null,
        upc: data.upc || existingRelease?.upc || null,
        updatedAt: new Date().toISOString()
      };

      if (releaseId) {
        // preserve original customId if editing
        if (existingRelease?.customId) releaseData.customId = existingRelease.customId;
        await updateDoc(doc(db, "releases", releaseId), releaseData);
      } else {
        await addDoc(collection(db, "releases"), {
          ...releaseData,
          createdAt: new Date().toISOString()
        });
      }

      // Trigger Backend Notification
      await triggerNotification("/releases/upload-notify", {
        email: user.email,
        name: user.displayName || "Artist",
        songName: data.songName
      });

      setStep(8); // Finished
    } catch (err: any) {
      console.error(err);
      let errorMessage = "An unexpected error occurred during asset transmission.";
      if (err.message && (err.message.includes("Signature") || err.message.includes("config"))) {
        errorMessage = "Cloudinary connection failure. Please verify Server API keys in settings.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      setFormError(`Transmission Failure: ${errorMessage}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const nextStep = () => {
    // Basic validation for current step
    if (step === 1) {
      const required = ["songName", "singerName", "lyricist", "composer", "producer", "copyrightYear", "copyrightHolder", "publisherYear", "publisherHolder"];
      for (const field of required) {
        if (!watchAll[field as keyof typeof watchAll]) {
          toast.error(`Required: ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
          return;
        }
      }
    }
    if (step === 2 && !watchAll.releaseDate) {
      toast.error("Launch window coordinates required.");
      return;
    }
    if (step === 3 && !watchAll.labelName) {
      toast.error("Corporate entity assignment required.");
      return;
    }
    if (step === 4 && !audioFile && !existingAudioUrl) {
      toast.error("Master audio asset deployment required.");
      return;
    }
    if (step === 5 && !coverFile && !existingCoverUrl) {
      toast.error("Visual anchor asset deployment required.");
      return;
    }
    if (step === 6 && selectedPlatforms.length === 0) {
      toast.error("Select at least one orbital distribution platform.");
      return;
    }
    setStep(s => s + 1);
  };
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="max-w-6xl mx-auto py-6 md:py-10 pb-32 px-4 md:px-0">
      {/* Heavy Stepper - Responsive */}
      <div className="flex items-center justify-between mb-8 md:mb-20 relative px-2 md:px-10 overflow-x-auto scrollbar-hide">
         <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-100 -translate-y-1/2 hidden md:block"></div>
         {STEPS.map((s, i) => (
            <div key={s} className={cn(
              "relative z-10 flex flex-col items-center gap-1.5 md:gap-4 shrink-0 mx-2 md:mx-0",
              step === i ? "opacity-100" : "opacity-40 md:opacity-100"
            )}>
               <motion.div 
                 animate={{ 
                   scale: step === i ? 1.1 : 1,
                   backgroundColor: step >= i ? "#0066FF" : "#FFFFFF",
                   borderColor: step >= i ? "#0066FF" : "#F1F5F9",
                   color: step >= i ? "#FFFFFF" : "#94A3B8"
                 }}
                 className="w-7 h-7 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center font-black font-display text-[9px] md:text-xs shadow-xl transition-all"
               >
                 {step > i ? <Check className="w-3.5 h-3.5 md:w-5 md:h-5" /> : i + 1}
               </motion.div>
               <span className={cn(
                 "text-[6px] md:text-[9px] font-black uppercase tracking-widest md:tracking-[0.2em]",
                 step >= i ? "text-brand-blue" : "text-slate-300",
                 step !== i && "hidden" // Only show label for current step on extreme mobile
               )}>{s}</span>
            </div>
         ))}
      </div>

      {/* Form Error Message */}
      <AnimatePresence>
        {formError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 p-6 bg-rose-50 border-2 border-rose-100 rounded-[2rem] flex items-center gap-4 text-rose-600"
          >
            <div className="w-12 h-12 bg-rose-100 rounded-[1rem] flex items-center justify-center shrink-0">
               <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="flex-1">
               <p className="text-xs font-black uppercase tracking-widest mb-1">Transmission Error</p>
               <p className="text-[11px] font-bold opacity-80">{formError}</p>
            </div>
            <button onClick={() => setFormError(null)} className="p-2 hover:bg-rose-200 rounded-full transition-colors">
               <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[2rem] md:rounded-[4rem] shadow-2xl p-4 sm:p-6 md:p-16 border border-slate-50 relative overflow-hidden">
        {isUploading && (
           <div className="absolute inset-0 bg-white/95 backdrop-blur-2xl z-[100] flex flex-col items-center justify-center p-6 md:p-12 gap-8 md:gap-10">
              <div className="relative group">
                 <motion.div 
                   animate={{ rotate: 360 }} 
                   transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                   className="w-24 h-24 md:w-40 md:h-40 border-[4px] md:border-[6px] border-slate-100 border-t-brand-blue rounded-full shadow-2xl"
                 ></motion.div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <UploadIcon className="w-8 h-8 md:w-12 md:h-12 text-brand-blue animate-bounce" />
                 </div>
              </div>

              <div className="w-full max-w-sm md:max-w-md space-y-6 md:space-y-8 text-center">
                 <div className="space-y-4">
                    {Object.entries(uploadProgress).map(([key, data]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] md:text-[11px] font-black uppercase tracking-widest px-2">
                           <span className="text-slate-400">{data.name}</span>
                           <span className="text-brand-blue">{Math.round(data.current)}%</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 shadow-inner">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${data.current}%` }}
                             className="h-full bg-linear-to-r from-brand-blue to-cyan-400 rounded-full"
                           />
                        </div>
                      </div>
                    ))}
                 </div>
                 
                 <div className="text-center pt-4">
                    <p className="font-display font-black text-3xl text-slate-800 tracking-tighter uppercase mb-2">Transmitting Studio Assets</p>
                    <p className="text-slate-400 font-medium tracking-widest text-[10px] uppercase">Integrating Creative Data with Global Metadata Mesh</p>
                 </div>
              </div>
           </div>
        )}

        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <AnimatePresence mode="wait">
             {/* STEP 1: RELEASE TYPE */}
             {step === 0 && (
                <motion.div key="s1" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="space-y-12">
                   <div className="text-center max-w-2xl mx-auto space-y-4 px-2">
                      <h2 className="text-2xl md:text-5xl font-black font-display tracking-tight uppercase">Select <span className="text-brand-blue">Release Core</span></h2>
                      <p className="text-sm md:text-base text-slate-400 font-medium">Define the architectural scope of your project.</p>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                      {["Single", "EP", "Album"].map((type) => (
                        <button 
                          key={type}
                          type="button"
                          onClick={() => { setValue("releaseType", type as any); nextStep(); }}
                          className={cn(
                            "group p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border-2 flex flex-col items-center gap-6 transition-all transform hover:-translate-y-4",
                            watchAll.releaseType === type ? "border-brand-blue bg-brand-blue/5 shadow-2xl" : "border-slate-100 hover:border-brand-blue bg-slate-50 shadow-sm"
                          )}
                        >
                           <div className="w-20 h-20 rounded-[2.5rem] bg-white shadow-xl flex items-center justify-center text-brand-blue transition-transform group-hover:rotate-12">
                              {type === 'Single' && <Music className="w-10 h-10" />}
                              {type === 'EP' && <Disc className="w-10 h-10" />}
                              {type === 'Album' && <Disc className="w-12 h-12" />}
                           </div>
                           <h4 className="text-2xl font-black font-display uppercase tracking-tight">{type}</h4>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                             {type === 'Single' && "One Master Track"}
                             {type === 'EP' && "2-6 Master Tracks"}
                             {type === 'Album' && "7+ Master Tracks"}
                           </p>
                        </button>
                      ))}
                   </div>
                </motion.div>
             )}

             {/* STEP 2: DETAILS */}
             {step === 1 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-12">
                   <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-brand-blue text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 shrink-0">
                         <Music className="w-6 h-6 md:w-7 md:h-7" />
                      </div>
                      <div className="text-center sm:text-left">
                         <h2 className="text-2xl md:text-4xl font-black font-display tracking-tight uppercase">Metadata Blueprint</h2>
                         <p className="text-slate-400 font-medium text-[10px] md:text-sm">Inject your creative identity into the global catalog.</p>
                      </div>
                   </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 md:gap-y-8">
                      <div className="space-y-2 md:space-y-3">
                         <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest md:tracking-[0.2em] text-slate-400 ml-2 md:ml-4">Song Name *</label>
                         <input {...register("songName")} className={cn("w-full p-4 md:p-5 bg-slate-50 border-none rounded-2xl md:rounded-3xl text-sm font-bold focus:ring-4 focus:ring-brand-blue/10 transition-all shadow-sm", errors.songName && "bg-rose-50 ring-2 ring-rose-500 text-rose-900")} placeholder="Track Title" />
                         {errors.songName?.message && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest ml-4">{errors.songName.message as string}</p>}
                      </div>
                      <div className="space-y-2 md:space-y-3">
                         <div className="flex items-center justify-between px-2 md:px-4">
                            <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest md:tracking-[0.2em] text-slate-400">Singer Name *</label>
                            <button type="button" onClick={() => setShowQuickArtist(true)} className="text-[9px] md:text-[10px] font-black uppercase text-brand-blue flex items-center gap-1 hover:underline">
                               <Plus className="w-3 h-3" /> Create New
                            </button>
                         </div>
                         <div className="relative">
                            <Mic2 className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <select {...register("singerName")} className={cn("w-full p-4 md:p-5 pl-16 bg-slate-50 border-none rounded-2xl md:rounded-3xl text-sm font-bold appearance-none shadow-sm", errors.singerName && "bg-rose-50 ring-2 ring-rose-500 text-rose-900")}>
                               <option value="">Select Artist</option>
                               {userArtists.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                            </select>
                         </div>
                         {errors.singerName?.message && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest ml-4">{errors.singerName.message as string}</p>}
                      </div>
                      <div className="space-y-2 md:space-y-3">
                         <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest md:tracking-[0.2em] text-slate-400 ml-2 md:ml-4">Secondary Artist / Featuring (Optional)</label>
                         <div className="relative">
                            <UserPlus className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <input {...register("featuringArtist")} className="w-full p-4 md:p-5 pl-16 bg-slate-50 border-none rounded-2xl md:rounded-3xl text-sm font-bold shadow-sm" placeholder="Type artist name" />
                         </div>
                      </div>
                      <div className="space-y-2 md:space-y-3">
                         <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest md:tracking-[0.2em] text-slate-400 ml-2 md:ml-4">Instagram ID (Optional)</label>
                         <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-black">@</span>
                            <input {...register("instagramId")} className="w-full p-4 md:p-5 pl-12 bg-slate-50 border-none rounded-2xl md:rounded-3xl text-sm font-bold shadow-sm" placeholder="username" />
                         </div>
                      </div>
                      <div className="space-y-2 md:space-y-3">
                         <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest md:tracking-[0.2em] text-slate-400 ml-2 md:ml-4">Language *</label>
                         <select {...register("language")} className={cn("w-full p-4 md:p-5 bg-slate-50 border-none rounded-2xl md:rounded-3xl text-sm font-bold appearance-none shadow-sm", errors.language && "bg-rose-50 ring-2 ring-rose-500 text-rose-900")}>
                            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                         </select>
                         {errors.language?.message && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest ml-4">{errors.language.message as string}</p>}
                      </div>
                      <div className="space-y-2 md:space-y-3">
                         <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest md:tracking-[0.2em] text-slate-400 ml-2 md:ml-4">Lyricist Name *</label>
                         <input {...register("lyricist")} className={cn("w-full p-4 md:p-5 bg-slate-50 border-none rounded-2xl md:rounded-3xl text-sm font-bold shadow-sm", errors.lyricist && "bg-rose-50 ring-2 ring-rose-500 text-rose-900")} placeholder="Lyricist / Writer Name" />
                         {errors.lyricist?.message && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest ml-4">{errors.lyricist.message as string}</p>}
                      </div>
                      <div className="md:col-span-2 space-y-2 md:space-y-3">
                         <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest md:tracking-[0.2em] text-slate-400 ml-2 md:ml-4">Master Lyrics (Optional)</label>
                         <textarea {...register("lyrics")} rows={5} className="w-full p-6 md:p-8 bg-slate-50 border-none rounded-[2rem] md:rounded-[2.5rem] text-sm font-bold leading-relaxed shadow-sm" placeholder="Place your lyrics here..." />
                      </div>
                      <div className="space-y-2 md:space-y-3">
                         <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest md:tracking-[0.2em] text-slate-400 ml-2 md:ml-4">Composer *</label>
                         <input {...register("composer")} className={cn("w-full p-4 md:p-5 bg-slate-50 border-none rounded-2xl md:rounded-3xl text-sm font-bold shadow-sm", errors.composer && "bg-rose-50 ring-2 ring-rose-500 text-rose-900")} placeholder="Original Composer" />
                         {errors.composer?.message && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest ml-4">{errors.composer.message as string}</p>}
                      </div>
                      <div className="space-y-2 md:space-y-3">
                         <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest md:tracking-[0.2em] text-slate-400 ml-2 md:ml-4">Music *</label>
                         <input {...register("producer")} className={cn("w-full p-4 md:p-5 bg-slate-50 border-none rounded-2xl md:rounded-3xl text-sm font-bold shadow-sm", errors.producer && "bg-rose-50 ring-2 ring-rose-500 text-rose-900")} placeholder="Music Produced By" />
                         {errors.producer?.message && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest ml-4">{errors.producer.message as string}</p>}
                      </div>
                      <div className="space-y-2 md:space-y-3">
                         <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest md:tracking-[0.2em] text-slate-400 ml-2 md:ml-4">Copyright Holder *</label>
                         <div className="flex gap-2 md:gap-4">
                            <select {...register("copyrightYear")} className="w-24 md:w-32 p-4 md:p-5 bg-slate-50 border-none rounded-2xl md:rounded-3xl text-sm font-bold appearance-none shadow-sm">
                               {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <input {...register("copyrightHolder")} className={cn("flex-1 p-4 md:p-5 bg-slate-50 border-none rounded-2xl md:rounded-3xl text-sm font-bold shadow-sm", errors.copyrightHolder && "bg-rose-50 ring-2 ring-rose-500 text-rose-900")} placeholder="Name" />
                         </div>
                         {errors.copyrightHolder?.message && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest ml-4">{errors.copyrightHolder.message as string}</p>}
                      </div>
                      <div className="space-y-2 md:space-y-3">
                         <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest md:tracking-[0.2em] text-slate-400 ml-2 md:ml-4">Publisher *</label>
                         <div className="flex gap-2 md:gap-4">
                            <select {...register("publisherYear")} className="w-24 md:w-32 p-4 md:p-5 bg-slate-50 border-none rounded-2xl md:rounded-3xl text-sm font-bold appearance-none shadow-sm">
                               {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <input {...register("publisherHolder")} className={cn("flex-1 p-4 md:p-5 bg-slate-50 border-none rounded-2xl md:rounded-3xl text-sm font-bold shadow-sm", errors.publisherHolder && "bg-rose-50 ring-2 ring-rose-500 text-rose-900")} placeholder="Name" />
                         </div>
                         {errors.publisherHolder?.message && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest ml-4">{errors.publisherHolder.message as string}</p>}
                      </div>

                      <div className="space-y-4">
                         <div className="flex items-center justify-between px-4">
                            <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest md:tracking-[0.2em] text-slate-400">Primary Genre</label>
                            <button type="button" className="text-[9px] font-black uppercase text-brand-purple flex items-center gap-1.5 hover:scale-105 transition-transform"><Zap className="w-3 h-3 fill-brand-purple" /> Auto Suggest (AI)</button>
                         </div>
                         <select {...register("primaryGenre")} className={cn("w-full p-4 md:p-5 bg-slate-50 border-none rounded-2xl md:rounded-3xl text-sm font-bold appearance-none shadow-sm cursor-pointer hover:bg-slate-100 transition-colors", errors.primaryGenre && "bg-rose-50 ring-2 ring-rose-500 text-rose-900")}>
                            {Object.keys(INDIAN_GENRES).map(category => (
                               <option key={category} value={category}>{category}</option>
                            ))}
                         </select>
                         {errors.primaryGenre?.message && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest ml-4">{errors.primaryGenre.message as string}</p>}
                      </div>
                      <div className="space-y-4">
                         <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest md:tracking-[0.2em] text-slate-400 ml-4">Secondary Genre</label>
                         <select {...register("secondaryGenre")} className={cn("w-full p-4 md:p-5 bg-slate-50 border-none rounded-2xl md:rounded-3xl text-sm font-bold appearance-none shadow-sm cursor-pointer hover:bg-slate-100 transition-colors", errors.secondaryGenre && "bg-rose-50 ring-2 ring-rose-500 text-rose-900")}>
                            {Object.entries(INDIAN_GENRES).map(([category, subgenres]) => (
                               <optgroup key={category} label={category}>
                                  {subgenres.map(g => <option key={g} value={g}>{g}</option>)}
                               </optgroup>
                            ))}
                         </select>
                         {errors.secondaryGenre?.message && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest ml-4">{errors.secondaryGenre.message as string}</p>}
                      </div>
                      <div className="space-y-2 md:space-y-3">
                         <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest md:tracking-[0.2em] text-slate-400 ml-2 md:ml-4">ISRC (Optional)</label>
                         <input {...register("isrc")} className={cn("w-full p-4 md:p-5 bg-slate-50 border-none rounded-2xl md:rounded-3xl text-sm font-mono font-bold tracking-widest text-brand-blue shadow-sm", errors.isrc && "bg-rose-50 ring-2 ring-rose-500 text-rose-900")} placeholder="IN-XXX-00-00000" />
                         {errors.isrc?.message && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest ml-4">{errors.isrc.message as string}</p>}
                      </div>
                      <div className="space-y-2 md:space-y-3">
                         <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest md:tracking-[0.2em] text-slate-400 ml-2 md:ml-4">UPC (Optional)</label>
                         <input {...register("upc")} className={cn("w-full p-4 md:p-5 bg-slate-50 border-none rounded-2xl md:rounded-3xl text-sm font-mono font-bold tracking-widest text-brand-blue shadow-sm", errors.upc && "bg-rose-50 ring-2 ring-rose-500 text-rose-900")} placeholder="190000000000" />
                         {errors.upc?.message && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest ml-4">{errors.upc.message as string}</p>}
                      </div>
                      <div className="md:col-span-2 mt-4 pt-4 border-t border-slate-100">
                         <h4 className="text-sm md:text-base font-black font-display uppercase text-slate-800 mb-4">Caller Tunes Section</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 md:gap-y-8">
                            <div className="space-y-2 md:space-y-3">
                               <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest md:tracking-[0.2em] text-slate-400 ml-2 md:ml-4">Callertune Name (Optional)</label>
                               <input {...register("callertuneName")} className={cn("w-full p-4 md:p-5 bg-slate-50 border-none rounded-2xl md:rounded-3xl text-sm font-bold shadow-sm", errors.callertuneName && "bg-rose-50 ring-2 ring-rose-500 text-rose-900")} placeholder="Title for Jio/Airtel" />
                               {errors.callertuneName?.message && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest ml-4 mt-1">{errors.callertuneName.message as string}</p>}
                            </div>
                            <div className="space-y-2 md:space-y-3">
                               <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest md:tracking-[0.2em] text-slate-400 ml-2 md:ml-4">Callertune Time Cut (Optional)</label>
                               <input {...register("callertuneTimeCut")} className={cn("w-full p-4 md:p-5 bg-slate-50 border-none rounded-2xl md:rounded-3xl text-sm font-mono font-bold text-brand-blue shadow-sm", errors.callertuneTimeCut && "bg-rose-50 ring-2 ring-rose-500 text-rose-900")} placeholder="e.g. 01:15 - 01:45" />
                               {errors.callertuneTimeCut?.message && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest ml-4 mt-1">{errors.callertuneTimeCut.message as string}</p>}
                            </div>
                         </div>
                      </div>
                   </div>
                   <div className="flex justify-end pt-12">
                      <button type="button" onClick={nextStep} className="btn-premium btn-glow py-5 px-12 group">
                        Next Mission Stage <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                      </button>
                   </div>
                </motion.div>
             )}

             {/* STEP 3: RELEASE DATE */}
             {step === 2 && (
                <motion.div key="s3" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 text-center max-w-2xl mx-auto">
                   <div className="space-y-4">
                      <h2 className="text-5xl font-black font-display tracking-tight uppercase">Launch <span className="text-brand-purple">Window</span></h2>
                      <p className="text-slate-400 font-medium leading-relaxed">Schedule your release across the digital universe. Global delivery remains optimal with a 14-day lead time.</p>
                   </div>
                   <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3 text-left">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Release Date *</label>
                         <div className="relative">
                            <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <input {...register("releaseDate")} type="date" min={new Date(Date.now() + 86400000).toISOString().split("T")[0]} className={cn("w-full p-5 pl-16 bg-slate-50 border-none rounded-3xl text-sm font-bold", errors.releaseDate && "bg-rose-50 ring-2 ring-rose-500 text-rose-900")} />
                         </div>
                         {errors.releaseDate?.message && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest ml-4">{errors.releaseDate.message as string}</p>}
                      </div>
                      <div className="space-y-3 text-left">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Time (Optional)</label>
                         <input {...register("releaseTime")} type="time" className={cn("w-full p-5 bg-slate-50 border-none rounded-3xl text-sm font-bold", errors.releaseTime && "bg-rose-50 ring-2 ring-rose-500 text-rose-900")} />
                         {errors.releaseTime?.message && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest ml-4">{errors.releaseTime.message as string}</p>}
                      </div>
                   </div>
                   <div className="pt-12 flex justify-center gap-6">
                      <button type="button" onClick={prevStep} className="btn-premium glass text-slate-500">Back</button>
                      <button type="button" onClick={nextStep} className="btn-premium btn-glow py-5 px-12">Confirm Schedule</button>
                   </div>
                </motion.div>
             )}

             {/* STEP 4: LABEL INFO */}
             {step === 3 && (
                <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                   <div className="text-center space-y-4">
                      <h2 className="text-5xl font-black font-display tracking-tight uppercase">Corporate <span className="text-brand-blue">Identity</span></h2>
                      <p className="text-slate-400 font-medium">Link this project to a master distribution label.</p>
                   </div>
                   <div className="max-w-xl mx-auto space-y-8">
                      <div className="grid grid-cols-2 gap-6">
                         <button type="button" className={cn(
                           "p-10 rounded-[2.5rem] border-2 flex flex-col items-center gap-4 transition-all",
                           watchAll.labelName ? "bg-brand-blue/5 border-brand-blue shadow-xl" : "bg-slate-50 border-slate-100 opacity-60"
                         )}>
                            <Building className="w-10 h-10 text-brand-blue" />
                            <span className="text-xs font-bold uppercase tracking-widest text-brand-blue">Select Entity</span>
                         </button>
                         <button type="button" onClick={() => setShowQuickLabel(true)} className="p-10 rounded-[2.5rem] bg-slate-50 border-2 border-slate-100 hover:border-brand-purple hover:bg-brand-purple/5 transition-all flex flex-col items-center gap-4">
                            <Plus className="w-10 h-10 text-brand-purple" />
                            <span className="text-xs font-bold uppercase tracking-widest text-brand-purple">Register New</span>
                         </button>
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Select Label *</label>
                         <select {...register("labelName")} className={cn("w-full p-6 bg-slate-50 border-none rounded-3xl text-sm font-bold appearance-none", errors.labelName && "bg-rose-50 ring-2 ring-rose-500 text-rose-900")}>
                            <option value="">Select Label</option>
                            <option value="IND Records">IND Records (System Default)</option>
                            {userLabels.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                         </select>
                         {errors.labelName?.message && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest ml-4">{errors.labelName.message as string}</p>}
                      </div>
                      <div className="pt-8 flex justify-center gap-6">
                        <button type="button" onClick={prevStep} className="btn-premium glass text-slate-500">Back</button>
                        <button type="button" onClick={nextStep} className="btn-premium btn-glow py-5 px-12">Proceed to Assets</button>
                      </div>
                   </div>
                </motion.div>
             )}

             {/* STEP 5: AUDIO UPLOAD */}
             {step === 4 && (
                <motion.div key="s5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12">
                   <div className="text-center space-y-4">
                      <h2 className="text-5xl font-black font-display tracking-tight uppercase">Master <span className="text-emerald-500">Audio</span></h2>
                      <p className="text-slate-400 font-medium">Transmit your high-fidelity master recording.</p>
                   </div>
                   <div className="max-w-2xl mx-auto">
                      <div className="relative group">
                         <input 
                              type="file" 
                              accept=".mp3,.wav" 
                              onChange={e => {
                                 const file = e.target.files?.[0] || null;
                                 setAudioFile(file);
                                 if (file) validateAudio(file);
                              }} 
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                         />
                         <div className={cn(
                           "w-full aspect-[21/9] rounded-[4rem] border-2 border-dashed flex flex-col items-center justify-center gap-6 transition-all",
                           (audioFile || existingAudioUrl) ? "border-emerald-500 bg-emerald-50 shadow-2xl shadow-emerald-500/10" : "border-slate-200 bg-slate-50 hover:border-brand-blue hover:bg-slate-100 shadow-sm"
                         )}>
                            {(audioFile || existingAudioUrl) ? <CheckCircle className="w-16 h-16 text-emerald-500 animate-bounce" /> : <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center text-brand-blue"><Music className="w-8 h-8" /></div>}
                            <div className="text-center px-8">
                               <p className="text-lg font-black font-display uppercase tracking-tight">{audioFile ? audioFile.name : (existingAudioUrl ? "Master File Already Loaded" : "Drag & Drop Studio WAV")}</p>
                               {audioValidation?.error && (
                                 <div className="mt-4 px-4 py-2 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 justify-center">
                                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">{audioValidation.error}</span>
                                 </div>
                               )}
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Compatible formats: WAV • MP3 (320kbps)</p>
                            </div>
                         </div>
                      </div>
                      {(audioFile || existingAudioUrl) && (
                        <div className="mt-8 space-y-4">
                           <div className="p-6 bg-slate-900 rounded-3xl flex items-center justify-between shadow-2xl">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white"><Music className="w-5 h-5" /></div>
                                 <span className="text-xs font-bold text-white uppercase tracking-widest">{audioFile ? "Audio Loaded Successfully" : "Using Existing Master"}</span>
                              </div>
                              <button type="button" onClick={() => { setAudioFile(null); setExistingAudioUrl(null); setAudioPreviewUrl(null); }} className="text-white/40 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                           </div>
                           {audioPreviewUrl && (
                             <div className="bg-slate-50 p-4 rounded-3xl shadow-sm border border-slate-100">
                               <audio controls src={audioPreviewUrl} className="w-full h-12" />
                             </div>
                           )}
                        </div>
                      )}
                      <div className="pt-12 flex justify-center gap-6">
                        <button type="button" onClick={prevStep} className="btn-premium glass text-slate-500">Back</button>
                        <button 
                           type="button" 
                           disabled={(!audioFile && !existingAudioUrl) || (audioFile && audioValidation?.valid === false)} 
                           onClick={nextStep} 
                           className="btn-premium btn-glow py-5 px-12 disabled:opacity-50"
                        >
                           {audioValidation?.valid === false ? "Fix Audio Error" : "Continue"}
                        </button>
                      </div>
                   </div>
                </motion.div>
             )}

             {/* STEP 6: COVER ART */}
             {step === 5 && (
                <motion.div key="s6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                   <div className="text-center space-y-4">
                      <h2 className="text-5xl font-black font-display tracking-tight uppercase">Visual <span className="text-brand-purple">Anchor</span></h2>
                      <p className="text-slate-400 font-medium">Capture the soul of your era with high-definition artwork.</p>
                   </div>
                   <div className="max-w-xl mx-auto space-y-8">
                      <div className="relative group aspect-square rounded-[4rem] overflow-hidden shadow-2xl border-4 border-slate-50">
                         <input type="file" accept="image/jpeg,image/png" onChange={e => setCoverFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                         {coverFile ? (
                           <img src={URL.createObjectURL(coverFile)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                         ) : (
                           <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center gap-6">
                              <div className="w-20 h-20 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center text-brand-purple">
                                 <ImageIcon className="w-10 h-10" />
                              </div>
                              <div className="text-center">
                                 <p className="text-sm font-black font-display uppercase tracking-widest">Transmit Image Data</p>
                                 <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">3000 x 3000 • 1:1 • JPG/PNG</p>
                              </div>
                           </div>
                         )}
                      </div>
                      <div className="pt-8 flex justify-center gap-6">
                        <button type="button" onClick={prevStep} className="btn-premium glass text-slate-500">Back</button>
                        <button type="button" disabled={!coverFile && !existingCoverUrl} onClick={nextStep} className="btn-premium btn-glow py-5 px-12 disabled:opacity-50">Confirm Canvas</button>
                      </div>
                   </div>
                </motion.div>
             )}

             {/* STEP 7: PLATFORMS */}
             {step === 6 && (
                <motion.div key="s7" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                   <div className="text-center space-y-4">
                      <h2 className="text-5xl font-black font-display tracking-tight uppercase">Global <span className="text-brand-blue">Footprint</span></h2>
                      <p className="text-slate-400 font-medium tracking-wide">Command distribution across 250+ master music gateways.</p>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                      {PLATFORMS.map((p) => (
                        <button 
                          key={p.name}
                          type="button"
                          onClick={() => {
                            setSelectedPlatforms(prev => prev.includes(p.name) ? prev.filter(i => i !== p.name) : [...prev, p.name]);
                          }}
                          className={cn(
                            "p-8 rounded-[3rem] border-2 flex flex-col items-center gap-4 transition-all group relative",
                            selectedPlatforms.includes(p.name) ? "border-brand-blue bg-brand-blue/5 shadow-2xl" : "border-slate-100 bg-white opacity-40 grayscale group-hover:grayscale-0"
                          )}
                        >
                           <div className="w-16 h-16 rounded-[1.5rem] shadow-xl flex items-center justify-center p-2 relative z-10 bg-white border border-slate-50 group-hover:scale-110 transition-transform">
                              <img 
                                src={p.logo} 
                                alt={p.name} 
                                className="w-full h-full object-contain" 
                                referrerPolicy="no-referrer"
                              />
                           </div>
                           <span className={cn(
                             "text-[9px] font-black uppercase tracking-[0.2em] transition-colors",
                             selectedPlatforms.includes(p.name) ? "text-brand-blue" : "text-slate-400 group-hover:text-slate-600"
                           )}>
                             {p.name}
                           </span>
                           <div className={cn("absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center transition-all", selectedPlatforms.includes(p.name) ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-300")}>
                              <Check className="w-3 h-3" />
                           </div>
                        </button>
                      ))}
                      <button 
                        type="button" 
                        onClick={() => {
                          if (selectedPlatforms.length === PLATFORMS.length) {
                            setSelectedPlatforms([]);
                          } else {
                            setSelectedPlatforms(PLATFORMS.map(p => p.name));
                          }
                        }}
                        className="p-8 rounded-[3.5rem] bg-brand-dark text-white flex flex-col items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all group"
                      >
                         <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight whitespace-pre-line">
                           {selectedPlatforms.length === PLATFORMS.length ? "Deselect All" : "Select All\n250+ Stores"}
                         </span>
                      </button>
                   </div>
                   <div className="pt-12 flex justify-center gap-6">
                      <button type="button" onClick={prevStep} className="btn-premium glass text-slate-500">Back</button>
                      <button type="button" disabled={selectedPlatforms.length === 0} onClick={nextStep} className="btn-premium btn-glow py-5 px-12 disabled:opacity-50">Activate Routes</button>
                   </div>
                </motion.div>
             )}

             {/* STEP 8: REVIEW */}
             {step === 7 && (
                <motion.div key="s8" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12">
                   <div className="flex flex-col md:flex-row items-center justify-between border-b border-slate-100 pb-10 gap-6">
                      <div className="text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-black font-display tracking-tight uppercase">Master <span className="text-brand-blue">Review</span></h2>
                        <p className="text-slate-400 font-medium">Verify your digital artifact before final transmission.</p>
                      </div>
                      <div className="w-24 h-24 rounded-[2rem] overflow-hidden shadow-2xl border-2 border-white shrink-0">
                         {coverPreviewUrl && <img src={coverPreviewUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                      </div>
                   </div>
                   {audioPreviewUrl && (
                      <div className="w-full bg-slate-50 p-4 rounded-3xl shadow-sm border border-slate-100">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 px-2">Master Audio Preview</p>
                         <audio controls src={audioPreviewUrl} className="w-full h-12" />
                      </div>
                   )}

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                      <div className="space-y-8">
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue mb-4">Core Metadata</p>
                            <div className="bg-slate-50 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] space-y-4">
                               <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Title</p><p className="font-black text-slate-800 text-sm">{watchAll.songName}</p></div>
                               <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Singer</p><p className="font-bold text-slate-600 text-sm">{watchAll.singerName}</p></div>
                               {watchAll.featuringArtist && <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Featuring Artist</p><p className="font-bold text-slate-600 text-sm">{watchAll.featuringArtist}</p></div>}
                               <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Label</p><p className="font-bold text-slate-600 text-sm">{watchAll.labelName}</p></div>
                               <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Instagram</p><p className="font-bold text-slate-600 text-sm">@{watchAll.instagramId || "None"}</p></div>
                               <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Language</p><p className="font-bold text-slate-600 text-sm">{watchAll.language}</p></div>
                            </div>
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-purple mb-4">Creative Credits</p>
                            <div className="bg-slate-50 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] space-y-4">
                               <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lyricist</p><p className="font-bold text-slate-600 text-sm">{watchAll.lyricist}</p></div>
                               <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Composer</p><p className="font-bold text-slate-600 text-sm">{watchAll.composer}</p></div>
                               <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Music (Producer)</p><p className="font-bold text-slate-600 text-sm">{watchAll.producer}</p></div>
                            </div>
                         </div>
                      </div>
                      <div className="space-y-8">
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-purple mb-4">Copyright & Tech</p>
                            <div className="bg-slate-50 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] space-y-4">
                               <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Copyright</p><p className="font-bold text-slate-600 text-sm">{watchAll.copyrightYear} {watchAll.copyrightHolder}</p></div>
                               <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Publisher</p><p className="font-bold text-slate-600 text-sm">{watchAll.publisherYear} {watchAll.publisherHolder}</p></div>
                               <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Launch Date</p><p className="font-black text-brand-purple text-sm">{watchAll.releaseDate}</p></div>
                               <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Primary Genre</p><p className="font-bold text-slate-600 text-sm">{watchAll.primaryGenre}</p></div>
                               <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Secondary Genre</p><p className="font-bold text-slate-600 text-sm">{watchAll.secondaryGenre}</p></div>
                               <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">ISRC</p><p className="font-mono font-bold text-brand-blue text-[11px] truncate">{watchAll.isrc || "Auto-Generate"}</p></div>
                               <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">UPC</p><p className="font-mono font-bold text-brand-blue text-[11px] truncate">{watchAll.upc || "Auto-Generate"}</p></div>
                               {(watchAll.callertuneName || watchAll.callertuneTimeCut) && (
                                 <div className="pt-2 border-t border-slate-200">
                                   {watchAll.callertuneName && <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 mt-2">Callertune</p><p className="font-bold text-slate-600 text-sm">{watchAll.callertuneName}</p></div>}
                                   {watchAll.callertuneTimeCut && <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 mt-2">Time Cut</p><p className="font-mono font-bold text-brand-blue text-[11px]">{watchAll.callertuneTimeCut}</p></div>}
                                 </div>
                               )}
                            </div>
                         </div>
                      </div>
                      <div className="space-y-8">
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-4">Master Audio Lyrics</p>
                            <div className="bg-slate-50 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] max-h-[250px] overflow-y-auto scrollbar-hide">
                               <p className="text-xs font-medium text-slate-500 italic leading-relaxed whitespace-pre-wrap">
                                  {watchAll.lyrics || "No lyrics provided for this release."}
                               </p>
                            </div>
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-4">Distribution Gate</p>
                            <div className="bg-slate-50 p-6 md:p-8 rounded-[2.5rem] md:rounded-[3.5rem] grid grid-cols-3 gap-3">
                               {selectedPlatforms.slice(0, 6).map(p => {
                                  const pf = PLATFORMS.find(item => item.name === p);
                                  return pf ? (
                                    <div key={p} className="aspect-square rounded-2xl p-2 flex items-center justify-center shadow-sm bg-white border border-slate-100">
                                       <img src={pf.logo} alt={pf.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                    </div>
                                  ) : null;
                               })}
                               <div className="aspect-square bg-slate-100 rounded-2xl flex items-center justify-center text-[8px] font-black text-slate-400 uppercase">+{selectedPlatforms.length > 6 ? selectedPlatforms.length - 6 : 0} More</div>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="bg-slate-50 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-2 border-slate-100 space-y-6">
                      <div className="flex items-start gap-4">
                        <input required type="checkbox" className="w-5 h-5 rounded-lg text-brand-blue focus:ring-brand-blue border-slate-200 mt-1" />
                        <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wide leading-relaxed">I Hereby certify that I own 100% of the Master Recording and Publishing rights for this digital artifact.</span>
                      </div>
                   </div>

                   <div className="pt-12 flex flex-col sm:flex-row justify-center gap-6">
                      <button type="button" onClick={prevStep} className="btn-premium glass text-slate-500 py-6 px-12 md:py-6 md:px-12 w-full sm:w-auto">Return to Edit</button>
                      <button type="submit" className="btn-premium btn-glow py-6 px-16 md:px-24 text-base md:text-lg font-black tracking-tighter shadow-2xl animate-pulse w-full sm:w-auto">DEPLOY MASTER RELEASE</button>
                   </div>
                </motion.div>
             )}

             {/* SUCCESS STEP */}
             {step === 8 && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center py-20 gap-10">
                   <div className="relative">
                      <div className="w-40 h-40 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 relative z-10 animate-[bounce_2s_infinite]">
                         <CheckCircle className="text-white w-20 h-20" />
                      </div>
                      <div className="absolute -inset-10 bg-emerald-500/10 blur-[60px] rounded-full animate-pulse"></div>
                   </div>
                   <div className="space-y-4">
                      <h2 className="text-6xl font-black font-display tracking-tighter uppercase">Mission <span className="text-emerald-500">Accomplished</span></h2>
                      <p className="text-slate-400 max-w-lg mx-auto font-medium text-lg leading-relaxed">Your release has entered the global distribution pipeline. Our content review board will verify metadata within 24 hours.</p>
                   </div>
                   <div className="flex gap-6">
                      <button type="button" onClick={() => navigate("/dashboard")} className="btn-premium bg-slate-900 text-white rounded-3xl py-5 px-10 shadow-2xl">Return to Overview</button>
                      <button type="button" onClick={() => { setStep(0); setAudioFile(null); setCoverFile(null); }} className="btn-premium glass text-slate-600 rounded-3xl py-5 px-10">Deploy New Asset</button>
                   </div>
                </motion.div>
             )}
          </AnimatePresence>
        </form>
      </div>

      {/* Quick Artist Modal */}
      <AnimatePresence>
        {showQuickArtist && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white p-12 rounded-[3.5rem] shadow-3xl max-w-md w-full space-y-8 border border-slate-100">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-linear-to-br from-brand-blue to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                        <UserPlus className="w-6 h-6" />
                     </div>
                     <h3 className="text-2xl font-black font-display tracking-tight uppercase">Quick Artist</h3>
                  </div>
                  <button onClick={() => setShowQuickArtist(false)} className="text-slate-300 hover:text-slate-900"><X className="w-6 h-6" /></button>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Authorized Artist Name</label>
                  <input value={quickArtistName} onChange={e => setQuickArtistName(e.target.value)} className="w-full p-5 bg-slate-50 border-none rounded-3xl text-sm font-bold" placeholder="Legal or Stage Name" />
               </div>
               <button onClick={handleQuickArtist} className="w-full py-5 bg-slate-950 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-brand-blue transition-all shadow-2xl">Initialize Artist Profile</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Label Modal */}
      <AnimatePresence>
        {showQuickLabel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white p-12 rounded-[3.5rem] shadow-3xl max-w-md w-full space-y-8 border border-slate-100">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-linear-to-br from-brand-purple to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-purple-500/20">
                        <Building className="w-6 h-6" />
                     </div>
                     <h3 className="text-2xl font-black font-display tracking-tight uppercase">Quick Label</h3>
                  </div>
                  <button onClick={() => setShowQuickLabel(false)} className="text-slate-300 hover:text-slate-900"><X className="w-6 h-6" /></button>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Corporate Label Name</label>
                  <input value={quickLabelName} onChange={e => setQuickLabelName(e.target.value)} className="w-full p-5 bg-slate-50 border-none rounded-3xl text-sm font-bold" placeholder="Production / Label Name" />
               </div>
               <button onClick={handleQuickLabel} className="w-full py-5 bg-slate-950 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-brand-purple transition-all shadow-2xl">Register Infrastructure</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
