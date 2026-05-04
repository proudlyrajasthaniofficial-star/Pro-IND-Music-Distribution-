import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import SEO from "../components/SEO";
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, googleProvider, db } from "../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, Music, Chrome, ArrowRight, User, Zap, ShieldCheck } from "lucide-react";
import NeuralGrid from "../components/ui/NeuralGrid";

import { triggerNotification } from "../lib/notifications";
import { cn } from "../lib/utils";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "login";
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await signInWithPopup(auth, googleProvider);
      
      const docRef = doc(db, 'users', result.user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        const userData = {
          displayName: result.user.displayName || result.user.email?.split("@")[0] || "Artist",
          email: result.user.email || "",
          photoURL: result.user.photoURL || "",
          role: 'artist',
          walletBalance: 0,
          createdAt: new Date().toISOString(),
          status: 'active'
        };
        await setDoc(docRef, userData);

        await triggerNotification("/auth/signup", {
          email: userData.email,
          name: userData.displayName
        });
      }
      
      navigate("/dashboard");
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        // Silent for user-closed popups as it's not a system error
        return;
      }
      console.error("Auth Error:", err);
      if (err.code === 'auth/popup-blocked') {
        setError("Pop-up was blocked. Please enable pop-ups for this site.");
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError("A previous sign-in request was cancelled. Please wait a moment and try again.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "signup") {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        await setDoc(doc(db, 'users', result.user.uid), {
          displayName: name,
          email: email,
          role: 'artist',
          walletBalance: 0,
          createdAt: new Date().toISOString(),
          status: 'active'
        });

        await triggerNotification("/auth/signup", {
          email: email,
          name: name
        });
      } else {
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (signInErr: any) {
          if (signInErr.code === 'auth/user-not-found' && email.toLowerCase() === "musicdistributionindia.in@gmail.com") {
            setError("Admin account not initialized. Please use 'Create Account' with these credentials first.");
            return;
          }
          throw signInErr;
        }
      }
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Auth Error:", err);
      if (err.code === 'auth/operation-not-allowed') {
        setError("Email/Password authentication is not enabled.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.");
      } else if (err.code === 'auth/invalid-credential') {
        setError("Invalid email or password.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 overflow-hidden relative">
      <SEO 
        title={mode === 'login' ? "Sign In - IND Distribution" : "Create Artist Account - IND"}
        description="Access your artist dashboard. Manage your music distribution and royalties easily."
      />
      
      <NeuralGrid />

      {/* Extreme Background Gradients */}
      <div className="absolute top-0 -left-24 w-[50rem] h-[50rem] bg-brand-blue/20 blur-[150px] rounded-full animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-0 -right-24 w-[50rem] h-[50rem] bg-brand-purple/20 blur-[150px] rounded-full animate-pulse delay-1000 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-pink-500/5 blur-[180px] rounded-full pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md w-full bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[4rem] border border-white/5 relative z-10 shadow-premium-dark overflow-hidden group"
      >
        <div className="absolute inset-0 noise opacity-[0.05] pointer-events-none"></div>
        <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col items-center mb-12">
            <Link to="/" className="group/logo relative">
              <div className="w-20 h-20 bg-slate-950 rounded-[2rem] flex items-center justify-center rotate-12 group-hover/logo:rotate-0 transition-all duration-700 shadow-2xl relative overflow-hidden ring-1 ring-white/10 uppercase font-black text-white">
                <div className="absolute inset-0 bg-brand-blue/20 animate-pulse"></div>
                <Music className="text-white w-10 h-10 -rotate-12 group-hover/logo:rotate-0 transition-all duration-700 relative z-10" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-blue rounded-xl flex items-center justify-center shadow-lg transform rotate-[-15deg] group-hover/logo:rotate-0 transition-all duration-500">
                <Zap className="w-4 h-4 text-white fill-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
              </div>
            </Link>
            
            <div className="mt-8 text-center">
              <h1 className="font-display text-4xl font-black tracking-tighter text-white uppercase leading-none">
                {mode === "login" ? "SIGN" : "ARTIST"} <span className="text-brand-blue">{mode === "login" ? "IN" : "SIGNUP"}</span>
              </h1>
              <div className="flex items-center justify-center gap-3 mt-4">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                <p className="text-slate-400 text-[10px] uppercase font-black tracking-[0.4em]">Secure Artist Portal</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="space-y-3"
                >
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 ml-4">Full Name</label>
                  <div className="relative group/input">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-brand-blue transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Enter your name..." 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/5 rounded-3xl py-5 pl-14 pr-6 focus:outline-none focus:border-brand-blue/50 focus:ring-4 focus:ring-brand-blue/10 transition-all font-black text-sm uppercase tracking-tight text-white placeholder:text-slate-700"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 ml-4">Email Address</label>
              <div className="relative group/input">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-brand-blue transition-colors" />
                <input 
                  type="email" 
                  placeholder="your@email.com" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/5 rounded-3xl py-5 pl-14 pr-6 focus:outline-none focus:border-brand-blue/50 focus:ring-4 focus:ring-brand-blue/10 transition-all font-black text-sm uppercase tracking-tight text-white placeholder:text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 ml-4">Password (Secure)</label>
              <div className="relative group/input">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-brand-blue transition-colors" />
                <input 
                  type="password" 
                  placeholder="Enter Password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/5 rounded-3xl py-5 pl-14 pr-6 focus:outline-none focus:border-brand-blue/50 focus:ring-4 focus:ring-brand-blue/10 transition-all font-black text-sm text-white placeholder:text-slate-700"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl"
                >
                  <ShieldCheck className="w-4 h-4 text-rose-500" />
                  <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full relative group/btn py-6 bg-brand-blue text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-white hover:text-slate-950 transition-all shadow-[0_20px_40px_-10px_rgba(0,102,255,0.4)] disabled:opacity-50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500"></div>
              <span className="relative z-10 flex items-center justify-center gap-3">
                {loading ? "PLEASE WAIT..." : mode === "login" ? "LOGIN NOW" : "CREATE ACCOUNT"}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </span>
            </button>
          </form>

          <div className="mt-10 flex items-center gap-6">
            <div className="flex-1 h-[1px] bg-white/5"></div>
            <span className="text-[9px] uppercase tracking-[0.3em] text-slate-500 font-black">Or continue with</span>
            <div className="flex-1 h-[1px] bg-white/5"></div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full mt-8 py-5 flex items-center justify-center gap-4 bg-white/5 border border-white/10 hover:bg-brand-blue hover:border-brand-blue transition-all duration-500 rounded-3xl disabled:opacity-50 disabled:cursor-not-allowed group/social"
          >
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center group-hover/social:scale-110 transition-transform">
              <Chrome className="w-4 h-4 text-brand-blue" />
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Connect with Google</span>
          </button>

          <div className="mt-10 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              {mode === "login" ? "Need an account?" : "Already a member?"}
              <Link 
                to={mode === "login" ? "/auth?mode=signup" : "/auth?mode=login"}
                className="text-brand-blue ml-2 hover:text-white transition-colors"
              >
                {mode === "login" ? "Register Here" : "Sign In"}
              </Link>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Floor Footer */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8 opacity-30">
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">Encryption: SHA-256</span>
        <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">Region: IND-01</span>
        <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">Nexus Network v4.2</span>
      </div>
    </div>
  );
}
