import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Send,
  Music,
  Zap,
  Trash2,
  FileText,
  AlertTriangle,
  History,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  doc,
  getDocs
} from "firebase/firestore";
import { cn } from "../../lib/utils";
import { toast } from "sonner";

const REQUEST_TYPES = [
  { id: 'instagram_linking', label: 'Instagram Profile Linking', icon: MessageSquare },
  { id: 'profile_correction', label: 'Artist Profile Correction', icon: FileText },
  { id: 'metadata_update', label: 'Song Metadata Update', icon: Music },
  { id: 'platform_manage', label: 'Add/Remove Platform', icon: ExternalLink },
  { id: 'content_id_issue', label: 'YouTube Content ID Issue', icon: AlertTriangle },
  { id: 'royalty_query', label: 'Royalty Query', icon: FileText },
  { id: 'date_change', label: 'Release Date Change', icon: Clock },
  { id: 'takedown', label: 'Takedown Request', icon: Trash2 },
  { id: 'oac', label: 'OAC Request', icon: CheckCircle2 },
  { id: 'custom', label: 'Other Custom Request', icon: MessageSquare },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600 border-amber-100",
  in_review: "bg-blue-50 text-blue-600 border-blue-100",
  approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
  rejected: "bg-rose-50 text-rose-600 border-rose-100",
  completed: "bg-slate-900 text-white border-slate-900",
};

interface UserRequest {
  id: string;
  ticketId: string;
  type: string;
  status: string;
  priority: string;
  createdAt: any;
  data: any;
  adminResponse?: string;
}

export default function Requests() {
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(null);

  // Form State
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [myReleases, setMyReleases] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({
    priority: "normal",
    releaseId: "",
  });

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "user_requests"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserRequest)));
      setLoading(false);
    });

    // Fetch releases for dropdown
    const fetchReleases = async () => {
      const rq = query(collection(db, "releases"), where("userId", "==", user.uid));
      const rSnap = await getDocs(rq);
      setMyReleases(rSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchReleases();

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedType) return;

    setFormLoading(true);
    try {
      const ticketId = `IND-REQ-${Math.floor(1000 + Math.random() * 9000)}`;
      const requestData = {
        ticketId,
        userId: user.uid,
        userName: profile?.displayName || "Artist",
        userEmail: user.email,
        type: selectedType,
        priority: formData.priority,
        releaseId: formData.releaseId,
        data: { ...formData },
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "user_requests"), requestData);
      
      // Log creation
      toast.success("Request submitted successfully!");
      setShowNewForm(false);
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit request.");
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedType("");
    setFormData({ priority: "normal", releaseId: "" });
  };

  const renderFormFields = () => {
    switch (selectedType) {
      case 'instagram_linking':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Instagram Profile Link</label>
              <input 
                required
                className="w-full bg-slate-50 border-none rounded-xl p-4 text-xs font-bold"
                placeholder="https://instagram.com/artistname"
                onChange={(e) => setFormData({...formData, instagramLink: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Platform</label>
              <select 
                className="w-full bg-slate-50 border-none rounded-xl p-4 text-xs font-bold"
                onChange={(e) => setFormData({...formData, platform: e.target.value})}
              >
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>
          </div>
        );
      case 'metadata_update':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Field to Update</label>
              <select 
                className="w-full bg-slate-50 border-none rounded-xl p-4 text-xs font-bold"
                onChange={(e) => setFormData({...formData, updateField: e.target.value})}
              >
                <option value="song_name">Song Name</option>
                <option value="artist_name">Artist Name</option>
                <option value="lyrics">Lyrics</option>
                <option value="genre">Genre</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">New Value</label>
              <input 
                required
                className="w-full bg-slate-50 border-none rounded-xl p-4 text-xs font-bold"
                placeholder="Correct value here..."
                onChange={(e) => setFormData({...formData, newValue: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Reason</label>
              <textarea 
                className="w-full bg-slate-50 border-none rounded-xl p-4 text-xs font-bold h-24"
                placeholder="Why do you want this change?"
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
              ></textarea>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Full Description</label>
              <textarea 
                required
                className="w-full bg-slate-50 border-none rounded-xl p-4 text-xs font-bold h-32"
                placeholder="Explain your request in detail..."
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-display tracking-tight text-slate-950 uppercase">Universal Requests</h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">Centralized support, changes, and metadata management system.</p>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setShowNewForm(true);
          }}
          className="bg-slate-950 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all flex items-center gap-3 w-fit"
        >
          <Plus className="w-4 h-4 text-brand-blue" />
          Create New Request
        </button>
      </div>

      {/* Grid: List and Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Request List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center bg-white p-4 px-6 rounded-3xl shadow-sm border border-slate-50 gap-4">
            <Search className="w-4 h-4 text-slate-300" />
            <input placeholder="Search tickets..." className="bg-transparent border-none focus:ring-0 text-xs font-bold w-full" />
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="p-12 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                <Clock className="w-8 h-8 text-slate-200 mx-auto mb-4 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Synchronizing Matrix...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                <AlertCircle className="w-8 h-8 text-slate-200 mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No active requests found</p>
              </div>
            ) : (
              requests.map((r) => (
                <motion.div 
                  layoutId={r.id}
                  key={r.id}
                  onClick={() => setSelectedRequest(r)}
                  className={cn(
                    "bg-white p-6 rounded-[2.5rem] border transition-all cursor-pointer group",
                    selectedRequest?.id === r.id ? "border-brand-blue shadow-xl ring-4 ring-brand-blue/5" : "border-slate-50 hover:shadow-lg"
                  )}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{r.ticketId}</span>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border",
                        STATUS_COLORS[r.status]
                      )}>{r.status.replace('_', ' ')}</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400">{r.createdAt?.toDate().toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-slate-900 uppercase tracking-tight mb-1">
                        {REQUEST_TYPES.find(t => t.id === r.type)?.label || r.type}
                      </h3>
                      {r.data?.releaseId && (
                        <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest flex items-center gap-1">
                          <Music className="w-3 h-3" />
                          Release Associated
                        </p>
                      )}
                    </div>
                    <ChevronRight className={cn(
                      "w-5 h-5 transition-transform",
                      selectedRequest?.id === r.id ? "translate-x-0 text-brand-blue" : "text-slate-200 group-hover:translate-x-1"
                    )} />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Request Detail / Empty State */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-8">
            <AnimatePresence mode="wait">
              {selectedRequest ? (
                <motion.div 
                  key={selectedRequest.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-50 overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 p-8">
                    {selectedRequest.priority === 'urgent' && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-500 rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="text-[9px] font-black uppercase">URGENT</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-10">
                    <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest block mb-1">Ticket Detail</span>
                    <h2 className="text-3xl font-black text-slate-900 uppercase leading-none">{selectedRequest.ticketId}</h2>
                  </div>

                  <div className="space-y-8">
                    <div className="bg-slate-50 p-6 rounded-[2rem]">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[.2em] block mb-4">Request Specs</span>
                      <div className="space-y-3">
                        {Object.entries(selectedRequest.data || {}).map(([key, val]) => (
                          val && key !== 'priority' && key !== 'releaseId' && (
                            <div key={key} className="flex justify-between items-start gap-4">
                              <span className="text-[10px] font-black text-slate-500 uppercase">{key.replace(/([A-Z])/g, ' $1')}</span>
                              <span className="text-[11px] font-bold text-slate-900 text-right">{String(val)}</span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>

                    {selectedRequest.adminResponse ? (
                      <div className="bg-slate-950 p-8 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 blur-[40px] rounded-full"></div>
                        <span className="text-[10px] font-black text-brand-blue uppercase tracking-[.3em] block mb-4">Admin Response</span>
                        <p className="text-white/80 text-sm font-medium leading-relaxed italic">
                          "{selectedRequest.adminResponse}"
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 p-8 border border-dashed border-slate-200 rounded-[2.5rem]">
                        <Clock className="w-6 h-6 text-slate-300" />
                        <p className="text-xs font-black text-slate-300 uppercase tracking-widest">In Queue for Human Review</p>
                      </div>
                    )}

                    <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                            <History className="w-4 h-4 text-slate-400" />
                         </div>
                         <div>
                            <span className="text-[10px] font-black text-slate-900 block leading-none">TIMELINE History</span>
                            <span className="text-[9px] font-medium text-slate-400">Activity tracked</span>
                         </div>
                      </div>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        selectedRequest.status === 'completed' ? "text-emerald-500" : "text-brand-blue"
                      )}>
                        {selectedRequest.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-slate-100/50 rounded-[3rem] p-12 text-center border border-dashed border-slate-200 py-32">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <MessageSquare className="w-8 h-8 text-slate-200" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase mb-2">Matrix Terminal</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Select a request to decrypt <br /> full ticket specifications</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* New Request Modal */}
      <AnimatePresence>
        {showNewForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/20 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-1 block">New Transmission</span>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Create Request</h2>
                  </div>
                  <button 
                    onClick={() => setShowNewForm(false)}
                    className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-950 hover:bg-slate-100 transition-all"
                  >
                    <Plus className="w-6 h-6 rotate-45" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {step === 1 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {REQUEST_TYPES.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => {
                            setSelectedType(type.id);
                            setStep(2);
                          }}
                          className={cn(
                            "p-6 rounded-[2rem] border text-left flex items-start gap-4 transition-all hover:scale-[1.02] group",
                            selectedType === type.id ? "bg-slate-950 text-white border-slate-950 shadow-xl" : "bg-white border-slate-100 hover:border-slate-200"
                          )}
                        >
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center",
                            selectedType === type.id ? "bg-white/10" : "bg-slate-50 group-hover:bg-slate-100"
                          )}>
                            <type.icon className={cn("w-6 h-6", selectedType === type.id ? "text-brand-blue" : "text-slate-400")} />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40 block mb-1">Request Type</span>
                            <span className="text-xs font-black uppercase tracking-tight">{type.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[2rem]">
                         <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                            <Zap className="w-6 h-6 text-brand-blue" />
                         </div>
                         <div>
                            <span className="text-[10px] font-black text-slate-300 uppercase block mb-0.5">Active Layer</span>
                            <span className="text-xs font-black text-slate-900 uppercase tracking-tight">
                              {REQUEST_TYPES.find(t => t.id === selectedType)?.label}
                            </span>
                         </div>
                         <button 
                           type="button"
                           onClick={() => setStep(1)}
                           className="ml-auto text-[10px] font-black uppercase text-brand-blue hover:underline"
                         >
                           Switch
                         </button>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Associate Release (Optional)</label>
                          <select 
                            className="w-full bg-slate-50 border-none rounded-xl p-4 text-xs font-bold"
                            onChange={(e) => setFormData({...formData, releaseId: e.target.value})}
                          >
                            <option value="">No Release Selected</option>
                            {myReleases.map(r => (
                              <option key={r.id} value={r.id}>{r.title} ({r.artist})</option>
                            ))}
                          </select>
                        </div>

                        {renderFormFields()}

                        <div>
                          <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Priority Matrix</label>
                          <div className="flex gap-4">
                            {['normal', 'high', 'urgent'].map(p => (
                              <button
                                key={p}
                                type="button"
                                onClick={() => setFormData({...formData, priority: p})}
                                className={cn(
                                  "flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                                  formData.priority === p 
                                    ? "bg-slate-950 text-white border-slate-950 shadow-lg" 
                                    : "bg-white border-slate-100 text-slate-300 hover:border-slate-200"
                                )}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button 
                        disabled={formLoading}
                        className="w-full py-6 bg-slate-950 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[.4em] shadow-2xl hover:shadow-brand-blue/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {formLoading ? (
                          <Clock className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5 text-brand-blue" />
                        )}
                        Transmit Request
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
