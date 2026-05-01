import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Music, 
  Share2, 
  FileText, 
  Wand2, 
  Copy, 
  Check, 
  Loader2,
  AlertCircle,
  Hash,
  Tags,
  Instagram,
  Twitter,
  Facebook
} from 'lucide-react';
import { geminiService } from '../../services/geminiService';
import { toast } from 'sonner';

const AILab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'metadata' | 'socials' | 'bio'>('metadata');
  
  // Metadata State
  const [trackDesc, setTrackDesc] = useState('');
  const [metadata, setMetadata] = useState<any>(null);
  const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false);

  // Socials State
  const [socialInfo, setSocialInfo] = useState({ title: '', artist: '', date: '' });
  const [posts, setPosts] = useState<any>(null);
  const [isGeneratingSocials, setIsGeneratingSocials] = useState(false);

  // Bio State
  const [bioDetails, setBioDetails] = useState('');
  const [bio, setBio] = useState('');
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleGenerateMetadata = async () => {
    if (!trackDesc.trim()) return toast.error('Please describe your track first');
    setIsGeneratingMetadata(true);
    try {
      const res = await geminiService.generateMetadata(trackDesc);
      setMetadata(res);
    } catch (error) {
      toast.error('Failed to generate metadata');
    } finally {
      setIsGeneratingMetadata(false);
    }
  };

  const handleGenerateSocials = async () => {
    if (!socialInfo.title || !socialInfo.artist) return toast.error('Fill in track details');
    setIsGeneratingSocials(true);
    try {
      const res = await geminiService.generateSocialPosts({
        title: socialInfo.title,
        artist: socialInfo.artist,
        releaseDate: socialInfo.date || 'Soon'
      });
      setPosts(res);
    } catch (error) {
      toast.error('Failed to generate posts');
    } finally {
      setIsGeneratingSocials(false);
    }
  };

  const handleGenerateBio = async () => {
    if (!bioDetails.trim()) return toast.error('Provide some details for the bio');
    setIsGeneratingBio(true);
    try {
      const res = await geminiService.generateArtistBio(bioDetails);
      setBio(res || '');
    } catch (error) {
      toast.error('Failed to generate bio');
    } finally {
      setIsGeneratingBio(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-blue/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-brand-blue" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">AI Artist Lab</h1>
        </div>
        <p className="text-white/60 text-lg">
          Power your release with Gemini-powered intelligence. Metadata, marketing, and bios in seconds.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-white/5 mb-12 overflow-x-auto no-scrollbar">
        {[
          { id: 'metadata', label: 'Magic Metadata', icon: Music },
          { id: 'socials', label: 'Social Post Generator', icon: Share2 },
          { id: 'bio', label: 'Artist Bio AI', icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-brand-blue text-white shadow-lg' 
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="grid lg:grid-cols-12 gap-12">
        {/* Input Panel */}
        <div className="lg:col-span-5">
          {activeTab === 'metadata' && (
            <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem]">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Music className="w-5 h-5 text-brand-blue" />
                Metadata Assistant
              </h3>
              <p className="text-white/40 text-sm mb-6 leading-relaxed">
                Tell us about your song—mood, genre, or theme—and we'll generate the perfect metadata for global stores.
              </p>
              <textarea
                value={trackDesc}
                onChange={(e) => setTrackDesc(e.target.value)}
                placeholder="Ex: An upbeat Punjabi pop song with heavy bass, a festive vibe, and lyrics about celebration."
                className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-brand-blue transition-colors mb-6 text-sm leading-relaxed"
              />
              <button
                onClick={handleGenerateMetadata}
                disabled={isGeneratingMetadata}
                className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isGeneratingMetadata ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                GENERATE METADATA
              </button>
            </div>
          )}

          {activeTab === 'socials' && (
            <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem]">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-brand-blue" />
                Social Post Generator
              </h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-white/40 text-xs font-black uppercase tracking-widest mb-2">Track Title</label>
                  <input
                    type="text"
                    value={socialInfo.title}
                    onChange={(e) => setSocialInfo({...socialInfo, title: e.target.value})}
                    placeholder="Enter track name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="block text-white/40 text-xs font-black uppercase tracking-widest mb-2">Artist Name</label>
                  <input
                    type="text"
                    value={socialInfo.artist}
                    onChange={(e) => setSocialInfo({...socialInfo, artist: e.target.value})}
                    placeholder="Artist name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="block text-white/40 text-xs font-black uppercase tracking-widest mb-2">Release Date</label>
                  <input
                    type="date"
                    value={socialInfo.date}
                    onChange={(e) => setSocialInfo({...socialInfo, date: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-brand-blue"
                  />
                </div>
              </div>
              <button
                onClick={handleGenerateSocials}
                disabled={isGeneratingSocials}
                className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isGeneratingSocials ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                GENERATE POSTS
              </button>
            </div>
          )}

          {activeTab === 'bio' && (
            <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem]">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-blue" />
                Artist Bio AI
              </h3>
              <p className="text-white/40 text-sm mb-6 leading-relaxed">
                Provide key info like your journey, achievements, and musical style. We'll craft a pro bio for your profiles.
              </p>
              <textarea
                value={bioDetails}
                onChange={(e) => setBioDetails(e.target.value)}
                placeholder="Ex: Started music in 2020 in Delhi. Influenced by AR Rahman. Recent hit reached 1M streams. Focused on indie-soul fusion."
                className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-brand-blue transition-colors mb-6 text-sm leading-relaxed"
              />
              <button
                onClick={handleGenerateBio}
                disabled={isGeneratingBio}
                className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isGeneratingBio ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                CRAFT MY BIO
              </button>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7">
          {activeTab === 'metadata' && (
            <div className="bg-slate-900/50 border border-white/5 p-8 rounded-[2.5rem] min-h-[500px]">
              {!metadata ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20">
                  <Wand2 className="w-16 h-16 mb-4" />
                  <p>Metadata results will appear here</p>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  {/* Titles */}
                  <div>
                    <h4 className="flex items-center gap-2 text-white font-black uppercase tracking-widest text-xs mb-4">
                      <Music className="w-4 h-4 text-brand-blue" /> Suggested Titles
                    </h4>
                    <div className="space-y-3">
                      {metadata.titles.map((t: string, i: number) => (
                        <div key={i} className="group bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between hover:border-brand-blue/30 transition-colors">
                          <span className="text-white/80 font-medium">{t}</span>
                          <button onClick={() => copyToClipboard(t, `title-${i}`)} className="text-white/20 hover:text-brand-blue transition-colors">
                            {copied === `title-${i}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-8 mt-8">
                    {/* Genre & Moods */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="flex items-center gap-2 text-white font-black uppercase tracking-widest text-xs mb-4">
                          Genre
                        </h4>
                        <div className="bg-brand-blue/10 border border-brand-blue/20 rounded-xl p-4 text-brand-blue font-bold">
                          {metadata.genre}
                        </div>
                      </div>
                      <div>
                        <h4 className="flex items-center gap-2 text-white font-black uppercase tracking-widest text-xs mb-4">
                          Mood Tags
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {metadata.moods.map((m: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-white/5 rounded-full text-xs text-white/60 border border-white/5">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <h4 className="flex items-center gap-2 text-white font-black uppercase tracking-widest text-xs mb-4">
                        <Tags className="w-4 h-4 text-brand-blue" /> Relevant Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {metadata.tags.map((t: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] text-white/40 uppercase font-black tracking-wider">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {activeTab === 'socials' && (
            <div className="bg-slate-900/50 border border-white/5 p-8 rounded-[2.5rem] min-h-[500px]">
              {!posts ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20">
                  <Share2 className="w-16 h-16 mb-4" />
                  <p>Social posts will appear here</p>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                   {/* Instagram */}
                   <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-pink-500">
                        <Instagram className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Instagram</span>
                      </div>
                      <button onClick={() => copyToClipboard(posts.instagram, 'ig')} className="text-white/20 hover:text-brand-blue">
                        {copied === 'ig' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-white/70 text-sm whitespace-pre-wrap">{posts.instagram}</p>
                   </div>

                   {/* Twitter */}
                   <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sky-400">
                        <Twitter className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Twitter / X</span>
                      </div>
                      <button onClick={() => copyToClipboard(posts.twitter, 'tw')} className="text-white/20 hover:text-brand-blue">
                        {copied === 'tw' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-white/70 text-sm whitespace-pre-wrap">{posts.twitter}</p>
                   </div>

                   {/* Facebook */}
                   <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-blue-600">
                        <Facebook className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Facebook</span>
                      </div>
                      <button onClick={() => copyToClipboard(posts.facebook, 'fb')} className="text-white/20 hover:text-brand-blue">
                        {copied === 'fb' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-white/70 text-sm whitespace-pre-wrap">{posts.facebook}</p>
                   </div>
                </motion.div>
              )}
            </div>
          )}

          {activeTab === 'bio' && (
            <div className="bg-slate-900/50 border border-white/5 p-8 rounded-[2.5rem] min-h-[500px]">
              {!bio ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20">
                  <FileText className="w-16 h-16 mb-4" />
                  <p>Your artist bio will appear here</p>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-white font-black uppercase tracking-widest text-xs">Generated Biography</h4>
                      <button onClick={() => copyToClipboard(bio, 'bio')} className="text-white/20 hover:text-brand-blue flex items-center gap-2 text-sm font-bold bg-white/5 px-4 py-2 rounded-xl border border-white/5 hover:border-brand-blue/30 transition-all">
                        {copied === 'bio' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied === 'bio' ? 'Copied' : 'Copy Full Bio'}
                      </button>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-8 leading-relaxed text-white/80 space-y-4">
                      {bio.split('\n').map((para, i) => para.trim() && (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Information footer */}
      <div className="mt-20 p-8 rounded-3xl bg-brand-blue/5 border border-brand-blue/20 flex flex-col md:flex-row items-center gap-8">
        <div className="w-16 h-16 rounded-full bg-brand-blue/20 flex items-center justify-center shrink-0">
          <AlertCircle className="w-8 h-8 text-brand-blue" />
        </div>
        <div>
          <h4 className="text-xl font-bold text-white mb-2">AI Accuracy & Best Practices</h4>
          <p className="text-white/60 text-sm leading-relaxed">
            While our AI (Gemini 3.1) is highly advanced, we recommend reviewing all generated content before submitting to stores. Ensure genre selection matches your track perfectly for better playlist placements.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AILab;
