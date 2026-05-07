import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Eye, FileText, Globe } from 'lucide-react';
import PublicNavbar from '../../components/PublicNavbar';
import PublicFooter from '../../components/PublicFooter';
import SEO from '../../components/SEO';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <SEO 
        title="Privacy Policy | IND Music Distribution India"
        description="Learn how IND Music Distribution India protects your data. Transparency on information collection, usage, and artist rights."
        url="https://musicdistributionindia.online/privacy"
      />
      <PublicNavbar />

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-xs font-black uppercase tracking-widest mb-6">
              <Shield className="w-3 h-3" />
              Privacy Protocol v4.0
            </div>
            <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight mb-6">
              PRIVACY POLICY<span className="text-brand-blue">.</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Last Updated: May 2026. Your privacy is our priority. We are committed to protecting your personal information and your music rights.
            </p>
          </motion.div>

          <div className="space-y-12 prose prose-invert prose-brand max-w-none">
            <section className="bg-white/[0.02] border border-white/5 p-8 md:p-12 rounded-[2.5rem]">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6">
                <Eye className="text-brand-blue" />
                1. Information We Collect
              </h2>
              <p className="text-slate-300 leading-relaxed">
                When you use IND Music Distribution India, we collect information that you provide to us directly:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-400">
                <li>Personal identifiers (Name, Email, Phone Number)</li>
                <li>Music metadata (Song titles, artist names, artwork)</li>
                <li>Payment information (via secure third-party processors like Cashfree)</li>
                <li>Official identification for artist verification purposes</li>
              </ul>
            </section>

            <section className="bg-white/[0.02] border border-white/5 p-8 md:p-12 rounded-[2.5rem]">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6">
                <Lock className="text-brand-blue" />
                2. How We Use Data
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Your data is used strictly for technical and legal purposes:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h3 className="text-brand-blue font-bold mb-2">Distribution</h3>
                  <p className="text-sm text-slate-400">Transmitting your content to 150+ global streaming platforms.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h3 className="text-brand-blue font-bold mb-2">Earnings</h3>
                  <p className="text-sm text-slate-400">Processing royalties and generating transparent financial reports.</p>
                </div>
              </div>
            </section>

            <section className="bg-white/[0.02] border border-white/5 p-8 md:p-12 rounded-[2.5rem]">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6">
                <Globe className="text-brand-blue" />
                3. Third-Party Sharing
              </h2>
              <p className="text-slate-300 leading-relaxed">
                We share your music content and metadata with Digital Service Providers (DSPs) like Spotify, JioSaavn, and Apple Music. We do not sell your personal contact information to advertisers.
              </p>
            </section>

            <section className="bg-white/[0.02] border border-white/5 p-8 md:p-12 rounded-[2.5rem]">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6">
                <FileText className="text-brand-blue" />
                4. Your Rights
              </h2>
              <p className="text-slate-300 leading-relaxed">
                As an artist, you have the right to request access to your data, request deletion of your account (subject to legal distribution contracts), and port your music catalogue to other services.
              </p>
            </section>
          </div>

          <div className="mt-20 p-8 rounded-3xl bg-brand-blue/5 border border-brand-blue/10 text-center">
            <p className="text-slate-400 text-sm italic">
              Questions about our privacy protocols? Reach out to us at <span className="text-brand-blue font-bold">support@musicdistributionindia.online</span>
            </p>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default PrivacyPolicy;
