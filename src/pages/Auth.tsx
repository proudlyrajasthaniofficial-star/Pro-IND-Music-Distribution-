import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import SEO from "../components/SEO";
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, googleProvider, db } from "../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, Music, Chrome, ArrowRight, User } from "lucide-react";
import GalaxyBackground from "../components/GalaxyBackground";

import { triggerNotification } from "../lib/notifications";

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
      
      // Check if profile exists, if not create it
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

        // Trigger Backend Notification
        await triggerNotification("/auth/signup", {
          email: userData.email,
          name: userData.displayName
        });
      }
      
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Auth Error:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError("Sign-in window was closed before completion.");
      } else if (err.code === 'auth/popup-blocked') {
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
        
        // Update Firebase Auth profile
        await updateProfile(result.user, { displayName: name });
        
        // Create Firestore profile
        await setDoc(doc(db, 'users', result.user.uid), {
          displayName: name,
          email: email,
          role: 'artist',
          walletBalance: 0,
          createdAt: new Date().toISOString(),
          status: 'active'
        });

        // Trigger Backend Notification
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
        setError("Email/Password authentication is not enabled in your Firebase Console. Please enable it in the 'Authentication' tab under 'Sign-in method'.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Please sign in instead.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.");
      } else if (err.code === 'auth/invalid-credential') {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 overflow-hidden relative text-white">
      <GalaxyBackground />
      <SEO 
        title={mode === 'login' ? "Login to Artist Portal" : "Create Artist Account"}
        description="Join thousands of global artists with IND Distribution. Manage your royalties, distribution, and analytics with ease."
      />
      {/* Decorative Blobs */}
      <div className="absolute top-0 -left-20 w-[40rem] h-[40rem] bg-brand-blue/10 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-0 -right-20 w-[40rem] h-[40rem] bg-brand-purple/10 blur-[100px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-dark p-10 rounded-[4rem] relative z-10 border border-white/10"
      >
        <div className="flex flex-col items-center mb-10">
          <Link to="/" className="w-16 h-16 bg-brand-blue rounded-2xl flex items-center justify-center rotate-12 shadow-xl mb-6">
            <Music className="text-white w-8 h-8 -rotate-12" />
          </Link>
          <h1 className="font-display text-4xl font-bold tracking-tighter text-center">
            {mode === "login" ? "WELCOME BACK" : "CREATE ACCOUNT"}
          </h1>
          <p className="text-white/60 text-sm mt-2">The future of distribution awaits you.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {mode === "signup" && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-2"
              >
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Full Name</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all font-light"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input 
                type="email" 
                placeholder="you@email.com" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all font-light"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Password</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input 
                type="password" 
                placeholder="••••••••" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all font-light"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs ml-4">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-premium btn-glow py-4 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? "Processing..." : mode === "login" ? "Sign In" : "Sign Up"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-4">
          <div className="flex-1 h-[1px] bg-white/10"></div>
          <span className="text-xs uppercase tracking-widest text-white/20 font-bold">Or continue with</span>
          <div className="flex-1 h-[1px] bg-white/10"></div>
        </div>

        <button 
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full glass mt-6 py-4 flex items-center justify-center gap-3 hover:bg-brand-blue/5 transition-all rounded-3xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Chrome className="w-5 h-5 text-brand-blue" />
          <span className="text-sm font-medium">Google Account</span>
        </button>

        <p className="text-center text-sm mt-8 text-white/40">
          {mode === "login" ? "New to IND?" : "Already have an account?"}
          <Link 
            to={mode === "login" ? "/auth?mode=signup" : "/auth?mode=login"}
            className="text-brand-blue font-bold ml-1 hover:underline"
          >
            {mode === "login" ? "Create Account" : "Sign In"}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
