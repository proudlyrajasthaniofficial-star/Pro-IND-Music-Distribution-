import React, { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  orderBy, 
  writeBatch,
  where,
  increment
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../../lib/firebase";
import { 
  TrendingUp, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  BarChart3, 
  Music,
  Users,
  ChevronRight,
  Filter,
  Search,
  Download,
  Play,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { formatCurrency, cn, formatDate } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

export default function AdminRoyalties() {
  const [reports, setReports] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [reportForm, setReportForm] = useState({
    name: "",
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear().toString(),
    totalAmount: "",
    source: "All Stores",
    csvData: "",
    targetUserId: "",
    targetUserName: "",
    fileData: null as string | null,
    fileName: "",
    fileType: ""
  });

  useEffect(() => {
    fetchReports();
    fetchUsers();
  }, []);

  const fetchReports = async () => {
    try {
      const q = query(collection(db, "royalty_reports"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Fetch Reports Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const snap = await getDocs(collection(db, "users"));
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Fetch Users Error:", err);
    }
  };

  const openUploadForUser = (user: any) => {
    setReportForm({
      ...reportForm,
      targetUserId: user.id,
      targetUserName: user.displayName || user.email || user.id,
      name: `${user.displayName || "Artist"} Royalty Report`,
    });
    setUploadModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use two readers: one for the preview/extraction, one for the binary preservation
    const textReader = new FileReader();
    const dataReader = new FileReader();

    textReader.onload = (event) => {
      const content = event.target?.result as string;
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        setReportForm(prev => ({ 
          ...prev, 
          csvData: `[PDF ATTACHED: ${file.name}]\nNote: Automated extraction not available for binary files.`,
          fileName: file.name,
          fileType: file.type
        }));
      } else {
        setReportForm(prev => ({ 
          ...prev, 
          csvData: content,
          fileName: file.name,
          fileType: file.type
        }));
      }
    };

    dataReader.onload = (event) => {
      const base64 = event.target?.result as string;
      setReportForm(prev => ({ ...prev, fileData: base64 }));
    };

    textReader.readAsText(file);
    dataReader.readAsDataURL(file);
    
    toast.success(`${file.name} successfully staged.`);
  };

  const handleProcessCSV = async () => {
    if (!reportForm.targetUserId || !reportForm.totalAmount) {
      toast.error("Please provide target artist and total amount.");
      return;
    }

    setProcessing(true);
    try {
      const amount = parseFloat(reportForm.totalAmount);
      
      let totalStreams = 0;
      const entriesToCreate: any[] = [];

      // Check if we have valid CSV/XML data to parse
      const hasContent = reportForm.csvData && !reportForm.csvData.includes("[PDF DOCUMENT ATTACHED");

      if (hasContent) {
        // Basic support for XML (extracting <isrc>, <streams>, <revenue> or similar)
        if (reportForm.csvData.trim().startsWith('<')) {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(reportForm.csvData, "text/xml");
          const items = xmlDoc.getElementsByTagName("row").length > 0 
            ? xmlDoc.getElementsByTagName("row") 
            : xmlDoc.getElementsByTagName("item");
          
          if (items.length > 0) {
            for (let i = 0; i < items.length; i++) {
              const isrc = items[i].getElementsByTagName("isrc")[0]?.textContent || "unknown";
              const streams = parseInt(items[i].getElementsByTagName("streams")[0]?.textContent || "0");
              const revenue = parseFloat(items[i].getElementsByTagName("revenue")[0]?.textContent || "0");
              totalStreams += streams;
              
              entriesToCreate.push({
                isrc,
                streams,
                revenue,
                platform: reportForm.source,
                userId: reportForm.targetUserId,
                userName: reportForm.targetUserName,
                matched: true,
                createdAt: new Date().toISOString()
              });
            }
          }
        } else {
          // Standard CSV Logic
          const lines = reportForm.csvData.split("\n").filter(l => l.trim());
          const dataRows = lines.length > 1 && lines[0].toLowerCase().includes('isrc') ? lines.slice(1) : lines;

          for (const row of dataRows) {
            const parts = row.split(",").map(p => p.trim());
            if (parts.length < 3) continue;
            const streams = parseInt(parts[1]) || 0;
            const revenue = parseFloat(parts[2]) || 0;
            totalStreams += streams;

            entriesToCreate.push({
              isrc: parts[0],
              streams,
              revenue,
              platform: parts[3] || reportForm.source,
              userId: reportForm.targetUserId,
              userName: reportForm.targetUserName,
              matched: true,
              createdAt: new Date().toISOString()
            });
          }
        }
      }

      const batch = writeBatch(db);

      // 1. Create Report Meta
      const reportRef = doc(collection(db, "royalty_reports"));
      batch.set(reportRef, {
        reportName: reportForm.name,
        period: `${reportForm.month} ${reportForm.year}`,
        source: reportForm.source,
        status: "approved",
        totalRevenue: amount,
        totalStreams,
        userId: reportForm.targetUserId, // Visibility filter
        fileData: reportForm.fileData,
        fileName: reportForm.fileName,
        fileType: reportForm.fileType,
        createdAt: serverTimestamp(),
        approvedAt: serverTimestamp()
      });

      // 2. Add Entries (Limited to 400 per batch)
      entriesToCreate.slice(0, 400).forEach(entry => {
        const entryRef = doc(collection(db, "royalty_entries"));
        batch.set(entryRef, { ...entry, reportId: reportRef.id });
      });

      // 3. Update Wallet Balance Automatically
      const uRef = doc(db, "users", reportForm.targetUserId);
      batch.update(uRef, {
        walletBalance: increment(amount),
        totalEarned: increment(amount),
        updatedAt: serverTimestamp()
      });

      // 4. Create Wallet Transaction Record
      const txRef = doc(collection(db, "transactions"));
      batch.set(txRef, {
        userId: reportForm.targetUserId,
        amount: amount,
        type: "earning",
        status: "completed",
        description: `Royalty: ${reportForm.month} ${reportForm.year} - ${reportForm.source}`,
        createdAt: serverTimestamp()
      });

      // 5. User Notification
      const notifRef = doc(collection(db, "user_notifications"));
      batch.set(notifRef, {
        userId: reportForm.targetUserId,
        title: "Royalty Credits Applied",
        message: `₹${amount.toFixed(2)} for ${reportForm.month} has been added as royalties.`,
        type: "success",
        read: false,
        createdAt: serverTimestamp()
      });

      await batch.commit();

      toast.success("Identity Report Transmitted & Wallet Credited.");
      setUploadModalOpen(false);
      setReportForm({ 
        name: "", month: "", year: "", totalAmount: "", source: "All Stores", csvData: "", targetUserId: "", targetUserName: "",
        fileData: null, fileName: "", fileType: "" 
      });
      fetchReports();
    } catch (err: any) {
      console.error(err);
      toast.error("Protocol Error during execution.");
    } finally {
      setProcessing(false);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.displayName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.id || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
           <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
              <TrendingUp className="text-brand-blue w-10 h-10" /> Royalty <span className="text-slate-600">Command</span>
           </h1>
           <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Direct Financial Distribution Matrix</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* User Sidebar / Selection */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-[#1E293B] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                 <Users className="text-brand-blue w-5 h-5" /> Artist Registry
              </h3>
              
              <div className="relative">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                 <input 
                   placeholder="SEARCH CID / EMAIL..."
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                   className="w-full bg-slate-900/50 border border-white/5 pl-14 pr-6 py-5 rounded-2xl text-[10px] font-black text-white focus:border-brand-blue transition-all outline-none"
                 />
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredUsers.map(user => (
                  <div key={user.id} className="p-5 bg-slate-900/50 rounded-2xl border border-white/5 hover:border-brand-blue/30 transition-all group">
                     <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                           <p className="text-xs font-black text-white truncate">{user.displayName || "Unknown Artist"}</p>
                           <p className="text-[9px] font-bold text-slate-500 truncate">{user.email}</p>
                           <p className="text-[8px] font-mono text-brand-blue mt-1 uppercase opacity-50">CID: {user.id}</p>
                        </div>
                        <button 
                          onClick={() => openUploadForUser(user)}
                          className="p-3 bg-brand-blue/10 text-brand-blue rounded-xl hover:bg-brand-blue hover:text-white transition-all shadow-lg active:scale-90"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Global Reports Feed */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3 ml-4">
             <Clock className="text-brand-blue w-5 h-5" /> Transmission History
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
              </div>
            ) : reports.length === 0 ? (
              <div className="bg-[#1E293B] border border-white/5 rounded-[2.5rem] p-20 text-center space-y-6">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto">
                    <Music className="w-10 h-10 text-slate-700" />
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Awaiting financial transmissions</p>
              </div>
            ) : (
              reports.map((report) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={report.id}
                  className="group bg-[#1E293B] border border-white/5 rounded-[2rem] p-8 hover:border-brand-blue/30 transition-all cursor-pointer relative overflow-hidden"
                  onClick={() => {
                    setSelectedReport(report);
                    // fetchEntries(report.id);
                  }}
                >
                  <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-8">
                      <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div>
                          <h3 className="text-lg font-black text-white uppercase tracking-tight">{report.reportName}</h3>
                          <div className="flex items-center gap-6 mt-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{report.period}</span>
                            <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">{report.source}</span>
                          </div>
                      </div>
                    </div>

                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Credited Amount</p>
                        <p className="text-2xl font-black text-emerald-400 font-mono">{formatCurrency(report.totalRevenue || 0)}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Action Pop-up / Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
              onClick={() => setUploadModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-[#1E293B] border border-white/5 rounded-[3rem] p-10 md:p-16 shadow-3xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/10 blur-[150px] -mr-48 -mt-48" />
              
              <div className="relative space-y-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Upload <span className="text-emerald-500">Royalty Report</span></h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">Deploying credits to: {reportForm.targetUserName}</p>
                  </div>
                  <button onClick={() => setUploadModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                     <AlertCircle className="w-6 h-6 text-slate-500" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Fiscal Month</label>
                    <select 
                      value={reportForm.month}
                      onChange={e => setReportForm({...reportForm, month: e.target.value})}
                      className="w-full bg-slate-900 border border-white/5 p-6 rounded-2xl text-sm font-bold text-white focus:border-brand-blue outline-none"
                    >
                      {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Fiscal Year</label>
                    <select 
                      value={reportForm.year}
                      onChange={e => setReportForm({...reportForm, year: e.target.value})}
                      className="w-full bg-slate-900 border border-white/5 p-6 rounded-2xl text-sm font-bold text-white focus:border-brand-blue outline-none"
                    >
                      {["2024", "2025", "2026", "2027"].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-brand-blue tracking-widest ml-4">Total Royalty Amount (INR)</label>
                    <input 
                      type="number"
                      placeholder="₹ 0.00"
                      value={reportForm.totalAmount}
                      onChange={e => setReportForm({...reportForm, totalAmount: e.target.value})}
                      className="w-full bg-slate-900 border border-white/5 p-6 rounded-2xl text-2xl font-black text-emerald-400 focus:border-emerald-500 outline-none placeholder:text-slate-800"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Source Platform</label>
                    <select 
                      value={reportForm.source}
                      onChange={e => setReportForm({...reportForm, source: e.target.value})}
                      className="w-full bg-slate-900 border border-white/5 p-6 rounded-2xl text-sm font-bold text-white focus:border-brand-blue outline-none"
                    >
                      <option>All Stores</option>
                      <option>Spotify</option>
                      <option>Apple Music</option>
                      <option>YouTube Music</option>
                      <option>Universal Distribution</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Official Document Source</label>
                  {!reportForm.fileName ? (
                    <label className="group relative flex flex-col items-center justify-center w-full h-48 bg-slate-900/50 border-2 border-dashed border-white/5 rounded-[2.5rem] hover:border-brand-blue/50 transition-all cursor-pointer overflow-hidden">
                       <div className="absolute inset-0 bg-brand-blue/0 group-hover:bg-brand-blue/5 transition-colors" />
                       <Upload className="w-10 h-10 text-slate-700 group-hover:text-brand-blue group-hover:scale-110 transition-all mb-4" />
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Drop or Click to Stage Document</p>
                       <p className="text-[9px] font-bold text-slate-700 mt-2">XML, CSV, PDF, XLSX accepted</p>
                       <input 
                         type="file" 
                         className="hidden" 
                         onChange={handleFileUpload}
                         accept=".csv,.xml,.pdf,.xlsx,.xls,.txt"
                       />
                    </label>
                  ) : (
                    <div className="bg-slate-900 border border-emerald-500/30 p-8 rounded-[2.5rem] flex items-center justify-between group">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                             <FileText className="text-emerald-500 w-6 h-6" />
                          </div>
                          <div>
                             <p className="text-xs font-black text-white truncate max-w-[200px]">{reportForm.fileName}</p>
                             <p className="text-[9px] font-bold text-emerald-500/50 uppercase tracking-widest">{reportForm.fileType || "Application Data"}</p>
                          </div>
                       </div>
                       <button 
                         onClick={() => setReportForm(prev => ({ ...prev, fileName: "", fileData: null, csvData: "" }))}
                         className="p-3 bg-white/5 text-slate-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                       >
                          <AlertCircle className="w-4 h-4" />
                       </button>
                    </div>
                  )}
                </div>

                <button 
                  disabled={processing}
                  onClick={handleProcessCSV}
                  className="w-full py-6 bg-brand-blue text-white rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3"
                >
                  {processing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {processing ? "Synchronizing Ledger..." : "DEPLOY ROYALTIES & UPDATE WALLET"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
