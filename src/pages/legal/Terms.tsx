import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  User, 
  CreditCard, 
  Lock, 
  Ban, 
  BarChart3, 
  AlertCircle, 
  Terminal, 
  Power, 
  Globe, 
  Scale, 
  Mail,
  Copy,
  Check,
  ChevronRight,
  Music
} from "lucide-react";
import { Link } from "react-router-dom";
import LegalNavbar from "../../components/legal/LegalNavbar";
import SEO from "../../components/SEO";
import { cn } from "../../lib/utils";

const SECTIONS = [
  {
    id: "services",
    title: "Services Overview",
    icon: Music,
    content: (
      <ul className="space-y-3">
        <li className="flex gap-3 text-slate-600">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
          Global music distribution across platforms like Spotify, Apple Music, JioSaavn, and 250+ other digital stores.
        </li>
        <li className="flex gap-3 text-slate-600">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
          YouTube Content ID activation and monetization for your original music.
        </li>
        <li className="flex gap-3 text-slate-600">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
          Caller Tune (CRBT) services for major Indian telecom operators (Jio, Airtel, Vi).
        </li>
        <li className="flex gap-3 text-slate-600">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
          Real-time analytics and revenue tracking dashboard.
        </li>
      </ul>
    )
  },
  {
    id: "accounts",
    title: "User Accounts",
    icon: User,
    content: (
      <div className="space-y-4 text-slate-600">
        <p>Your account represents your digital identity on IND Distribution. By registering, you agree to provide accurate, current, and complete information.</p>
        <p>You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Any suspected unauthorized use must be reported immediately. IND Distribution reserves the right to suspend or terminate accounts that provide false information or violate security protocols.</p>
      </div>
    )
  },
  {
    id: "payments",
    title: "Payments & Subscriptions",
    icon: CreditCard,
    content: (
      <div className="space-y-4 text-slate-600">
        <p>Our distribution services are provided on a yearly subscription basis. Rates vary depending on the chosen tier (Starter, Pro, Premium, Label, or Enterprise).</p>
        <p>All payments are processed securely. Unless explicitly stated otherwise in our Refund Policy, subscription fees are non-refundable once the distribution process has been initiated. Revenue sharing percentages are defined by your active plan at the time of stream reporting.</p>
      </div>
    )
  },
  {
    id: "ownership",
    title: "Content Ownership",
    icon: Lock,
    content: (
      <div className="space-y-4 text-slate-600">
        <p><strong>You retain 100% of your master rights and publishing ownership.</strong> IND Distribution acts solely as a service provider.</p>
        <p>By uploading music, you grant IND Distribution a non-exclusive, sub-licensable license to distribute, perform, and display your content globally for the purpose of distribution only. You represent and warrant that you own or have obtained all necessary rights to the audio, art, and metadata provided.</p>
      </div>
    )
  },
  {
    id: "prohibited",
    title: "Prohibited Content",
    icon: Ban,
    content: (
      <div className="space-y-4 text-slate-600">
        <p>To maintain platform integrity, we strictly prohibit:</p>
        <ul className="space-y-2">
          <li className="flex gap-3"><ChevronRight className="w-4 h-4 text-slate-300" /> Copyrighted material used without permission</li>
          <li className="flex gap-3"><ChevronRight className="w-4 h-4 text-slate-300" /> Artificially inflated streams (Fake streams/Bots)</li>
          <li className="flex gap-3"><ChevronRight className="w-4 h-4 text-slate-300" /> Content that promotes illegal acts, hate speech, or extreme violence</li>
        </ul>
        <p>Violation of these rules will result in immediate content removal and account permanent ban without a refund.</p>
      </div>
    )
  },
  {
    id: "royalties",
    title: "Royalties",
    icon: BarChart3,
    content: (
      <div className="space-y-4 text-slate-600">
        <p>Royalties are collected from third-party platforms. IND Distribution processes these payments according to your plan's payout percentage.</p>
        <p>Please note that streaming reports are usually delayed by 2-3 months by the stores themselves. We report what we receive; any discrepancies in stream counts between your dashboard and the store's public count are due to the stores' internal filtering protocols.</p>
      </div>
    )
  },
  {
    id: "disclaimer",
    title: "Disclaimer",
    icon: AlertCircle,
    content: (
      <div className="space-y-4 text-slate-600 italic">
        <p>IND Distribution provides a bridge to global stores. We do not guarantee any specific amount of earnings, streams, or placement on editorial playlists.</p>
        <p>Approval of content is at the sole discretion of the storefronts (Spotify, Apple, etc.). We are not liable for stores' decisions to reject or remove content based on their own internal policies.</p>
      </div>
    )
  },
  {
    id: "third-party",
    title: "Third-Party Services",
    icon: Globe,
    content: (
      <p className="text-slate-600">Our services rely on integrations with third-party platforms. By using IND Distribution, you also agree to be bound by the Terms of Service of platforms such as YouTube, Spotify, and Indian telecom operators.</p>
    )
  },
  {
    id: "termination",
    title: "Termination",
    icon: Power,
    content: (
      <p className="text-slate-600">You may terminate your account at any time by requesting content takedown. IND Distribution reserves the right to terminate access for users who repeatedly violate these terms or participate in fraudulent stream activities.</p>
    )
  },
  {
    id: "force-majeure",
    title: "Force Majeure",
    icon: Terminal,
    content: (
      <p className="text-slate-600">We shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including but not limited to acts of God, war, revolution, store outages, or internet infrastructure failures.</p>
    )
  },
  {
    id: "legal",
    title: "Governing Law",
    icon: Scale,
    content: (
      <div className="space-y-4 text-slate-600">
        <p>These terms are governed by the laws of India, specifically the state of Rajasthan.</p>
        <p>Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts located in <strong>Ganganagar, Rajasthan</strong>.</p>
      </div>
    )
  },
  {
    id: "contact",
    title: "Contact Information",
    icon: Mail,
    content: (
      <div className="space-y-4 text-slate-600">
        <p>If you have any questions regarding these Terms, please reach out to our legal compliance team:</p>
        <a href="mailto:musicdistributionindia.in@gmail.com" className="text-indigo-600 font-bold hover:underline">musicdistributionindia.in@gmail.com</a>
      </div>
    )
  }
];

export default function Terms() {
  const [activeSection, setActiveSection] = useState("services");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const offsets = SECTIONS.map(section => {
        const el = document.getElementById(section.id);
        if (el) {
          return { id: section.id, offset: el.offsetTop - 150 };
        }
        return null;
      }).filter(Boolean);

      const current = offsets?.reverse().find(o => window.scrollY >= (o?.offset || 0));
      if (current) setActiveSection(current.id);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const copyLink = (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Animated Waves/Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -right-[10%] w-[70rem] h-[70rem] bg-indigo-50/40 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -left-[10%] w-[60rem] h-[60rem] bg-pink-50/30 blur-[120px] rounded-full" 
        />
      </div>
      <SEO 
        title="Terms & Conditions | IND Distribution"
        description="Review the terms and conditions for using IND Distribution music services. Understand your rights, ownership, and our commitment to transparency."
      />
      
      <LegalNavbar />

      <main className="max-w-7xl mx-auto px-6 py-20 relative">
        {/* Header */}
        <div className="max-w-3xl mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-8"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Last Updated: 21 April 2026</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 mb-8 uppercase italic"
          >
            Terms <span className="text-indigo-600">&</span> <br />Conditions
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-500 font-medium leading-relaxed"
          >
            Please read these terms carefully before using our services. They outline your rights as an artist and our role as your distribution partner.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-20 items-start">
          {/* Sidebar */}
          <aside className="hidden lg:block sticky top-32">
            <nav className="space-y-2">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    activeSection === section.id 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                      : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="space-y-12">
            {SECTIONS.map((section, idx) => (
              <motion.section
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="group relative"
              >
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-indigo-600 scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-500 rounded-full" />
                
                <div className="bg-white border border-slate-100 rounded-[2rem] p-8 md:p-12 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-indigo-100/30 transition-all duration-500">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                        <section.icon className="w-6 h-6" />
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">{section.title}</h2>
                    </div>
                    
                    <button 
                      onClick={() => copyLink(section.id)}
                      className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                    >
                      {copiedId === section.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-p:text-slate-600 prose-p:text-lg">
                    {section.content}
                  </div>
                </div>
              </motion.section>
            ))}
          </div>
        </div>
      </main>

      {/* Modern Footer for Legal Pages */}
      <footer className="bg-slate-50 border-t border-slate-100 py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
               <Music className="text-white w-5 h-5" />
             </div>
             <span className="font-display text-xl font-black uppercase italic text-slate-900 tracking-tighter">IND Distribution</span>
          </div>
          
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Link to="/terms" className="text-indigo-600">Terms</Link>
            <Link to="/refunds" className="hover:text-slate-900 transition-colors">Refunds</Link>
            <Link to="/contact" className="hover:text-slate-900 transition-colors">Contact</Link>
          </div>
          
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
            © 2026 IND Distribution. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
