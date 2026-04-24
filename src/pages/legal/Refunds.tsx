import React from "react";
import { motion } from "motion/react";
import { 
  XOctagon, 
  Wallet, 
  Ban, 
  Timer, 
  ArrowRightLeft, 
  HelpCircle,
  ShieldCheck,
  Music,
  ChevronRight
} from "lucide-react";
import LegalNavbar from "../../components/legal/LegalNavbar";
import SEO from "../../components/SEO";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

const REFUND_SECTIONS = [
  {
    title: "Cancellation Política",
    id: "cancellation",
    icon: XOctagon,
    content: (
      <div className="space-y-4 text-slate-600">
        <p>We understand that plans can change. You may request a cancellation of your subscription under its initial setup phase. However, once the music distribution process has been initiated with our partner stores, cancellation of the service itself is not possible.</p>
        <p>If you cancel the subscription within 24 hours of purchase and no distribution has occurred, you will be eligible for a full refund minus any transactional fees.</p>
      </div>
    )
  },
  {
    title: "Refund Eligibility",
    id: "eligibility",
    icon: Wallet,
    content: (
      <div className="space-y-4 text-slate-600">
        <p>Refunds are granted strictly based on the following criteria:</p>
        <ul className="space-y-3">
          {[
            "Failure to deliver the service within the promised timeframe due to technical errors on our end.",
            "Duplicate billing caused by platform glitches.",
            "Plan upgrades where the difference is clearly erroneous."
          ].map((item, i) => (
            <li key={i} className="flex gap-3">
              <ChevronRight className="w-4 h-4 text-indigo-500 mt-1 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  },
  {
    title: "Non-Refundable Cases",
    id: "non-refundable",
    icon: Ban,
    content: (
      <div className="space-y-4 text-slate-600">
        <p>Refunds will <strong>NOT</strong> be issued in the following scenarios:</p>
        <ul className="space-y-3">
          {[
            "The distribution process has already started (Content uploaded to stores).",
            "Violation of our Terms of Service (e.g., Copyright infringement or fake streams).",
            "Change of mind after the first 24 hours of purchase.",
            "Rejection of content by third-party stores due to their own internal policies."
          ].map((item, i) => (
            <li key={i} className="flex gap-3">
              <ChevronRight className="w-4 h-4 text-pink-500 mt-1 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  },
  {
    title: "Processing Time",
    id: "processing",
    icon: Timer,
    content: (
      <p className="text-slate-600 leading-relaxed italic">Approved refunds are processed within 1–3 business days. The actual reflection of the amount in your bank account or wallet may take an additional 5-7 business days depending on your financial institution's policies.</p>
    )
  },
  {
    title: "Digital Limitation",
    id: "limitation",
    icon: ArrowRightLeft,
    content: (
      <p className="text-slate-600 leading-relaxed">Music distribution involves permanent identifiers (UPC/ISRC) and metadata propagation across global networks. Because of this digital footprint, reversing a distributed release is a complex task that cannot be undone purely by a refund.</p>
    )
  },
  {
    title: "Support & Mediation",
    id: "support",
    icon: HelpCircle,
    content: (
      <div className="space-y-4 text-slate-600">
        <p>If you believe you have a special case, please contact our support team immediately. We value our artists and aim for fair resolutions.</p>
        <Link to="/contact" className="inline-flex items-center gap-2 text-indigo-600 font-black uppercase tracking-widest text-[10px] hover:translate-x-2 transition-transform">
          Reach Support Team <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    )
  }
];

export default function Refunds() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Premium Background Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-indigo-50/50 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-blue-50/30 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>
      <SEO 
        title="Cancellation & Refund Policy | IND Distribution"
        description="Learn about our cancellation and refund policies. We maintain fair and transparent billing for all music distribution services."
      />
      
      <LegalNavbar />

      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 mb-8"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Last Updated: 21 April 2026</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 mb-8 uppercase italic"
          >
            Cancellation <br /><span className="text-indigo-600">&</span> Refunds
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 font-medium leading-relaxed"
          >
            Our commitment to artists starts with transparent billing. Understand how we handle cancellations and refund requests.
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto grid gap-8">
          {REFUND_SECTIONS.map((section, idx) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group relative"
            >
              <div className="bg-[#FAFAFA]/50 border border-slate-100 rounded-[2.5rem] p-10 md:p-14 hover:bg-white hover:shadow-2xl hover:shadow-indigo-100/30 hover:border-indigo-100 transition-all duration-500">
                <div className="flex flex-col md:flex-row gap-10">
                  <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-xl shadow-slate-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:-rotate-6 transition-all duration-500 shrink-0">
                    <section.icon className="w-7 h-7" />
                  </div>
                  
                  <div className="space-y-6">
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight italic">{section.title}</h2>
                    <div className="prose prose-slate prose-p:text-lg prose-p:text-slate-500 prose-p:leading-relaxed">
                      {section.content}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-100 py-20 px-6 mt-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
               <Music className="text-white w-5 h-5" />
             </div>
             <span className="font-display text-xl font-black uppercase italic text-slate-900 tracking-tighter">IND Distribution</span>
          </div>
          
          <div className="flex gap-10">
            <Link to="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
            <Link to="/refunds" className="text-indigo-600">Refunds</Link>
            <Link to="/contact" className="hover:text-slate-900 transition-colors">Contact</Link>
          </div>
          
          <p className="text-slate-200">© 2026 IND Distribution.</p>
        </div>
      </footer>
    </div>
  );
}
