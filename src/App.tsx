import React, { lazy } from 'react';
import Home from './pages/Home';
import Features from './pages/Features';
import Auth from './pages/Auth';
import Founder from './pages/Founder';
import SEOLandingPage from './pages/SEOLanding';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import Success from './pages/checkout/Success';
import Cancel from './pages/checkout/Cancel';
import DashboardLayout from './components/DashboardLayout';
import Overview from './pages/dashboard/Overview';
import MyReleases from './pages/dashboard/MyReleases';
import ReleaseDetails from './pages/dashboard/ReleaseDetails';
import Upload from './pages/dashboard/Upload';
import Artists from './pages/dashboard/Artists';
import Labels from './pages/dashboard/Labels';
import Wallet from './pages/dashboard/Wallet';
import Profile from './pages/dashboard/Profile';
import Support from './pages/dashboard/Support';
import Requests from './pages/dashboard/Requests';
import OACRequest from './pages/dashboard/OACRequest';
import ContentID from './pages/dashboard/ContentID';
import Reports from './pages/dashboard/Reports';
import GrowthTools from './pages/dashboard/GrowthTools';
import Subscription from './pages/dashboard/Subscription';
import Terms from './pages/legal/Terms';
import Refunds from './pages/legal/Refunds';
import Contact from './pages/legal/Contact';
import AdminLayout from './pages/admin/AdminLayout';
import AdminHome from './pages/admin/AdminHome';
import AdminReleases from './pages/admin/AdminReleases';
import AdminReview from './pages/admin/AdminReview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminFinance from './pages/admin/AdminFinance';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminArtists from './pages/admin/AdminArtists';
import AdminLabels from './pages/admin/AdminLabels';
import AdminOAC from './pages/admin/AdminOAC';
import AdminContentID from './pages/admin/AdminContentID';
import AdminSupport from './pages/admin/AdminSupport';
import AdminUserRequests from './pages/admin/AdminUserRequests';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminBroadcasts from './pages/admin/AdminBroadcasts';
import AdminHistory from './pages/admin/AdminHistory';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PageLoader from './components/ui/Loading';
import { Toaster } from 'sonner';

// Dashboad Components - moved to imports
// Legal Pages - moved to imports
// Admin Pages - moved to imports

function PrivateRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) return <PageLoader message="Validating Credentials..." />;
  if (!user) return <Navigate to="/auth?mode=login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" />;
  
  return <>{children}</>;
}

function AppContent() {
  const { user, loading, connectionError } = useAuth();

  if (loading) {
    return <PageLoader message={connectionError ? "Connection Latency Detected..." : "Initializing Core Sync..."} />;
  }

  return (
    <Router>
      <React.Suspense fallback={<PageLoader message="Transmitting View..." />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/founder-developer" element={<Founder />} />
          <Route path="/founder" element={<Navigate to="/founder-developer" replace />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          
          {/* SEO Landing Pages (The Core 10) */}
          <Route path="/best-music-distribution-india" element={<SEOLandingPage />} />
          <Route path="/free-music-distribution-india" element={<SEOLandingPage />} />
          <Route path="/upload-song-on-spotify-india" element={<SEOLandingPage />} />
          <Route path="/music-distribution-pricing-india" element={<SEOLandingPage />} />
          <Route path="/independent-artist-guide-india" element={<SEOLandingPage />} />
          <Route path="/digital-music-distribution-india" element={<SEOLandingPage />} />
          <Route path="/music-marketing-india" element={<SEOLandingPage />} />
          <Route path="/music-publishing-india" element={<SEOLandingPage />} />
          <Route path="/record-label-services-india" element={<SEOLandingPage />} />
          <Route path="/b2b-music-distribution-india" element={<SEOLandingPage />} />
          
          {/* SEO Redirects & Aliases */}
          <Route path="/music-distribution-india" element={<Navigate to="/best-music-distribution-india" replace />} />
          <Route path="/jio-saavn-music-distribution" element={<Navigate to="/best-music-distribution-india" replace />} />
          <Route path="/gaana-wynk-music-distribution" element={<Navigate to="/best-music-distribution-india" replace />} />
          <Route path="/caller-tune-distribution-india" element={<Navigate to="/digital-music-distribution-india" replace />} />
          <Route path="/instagram-reels-music-distribution" element={<Navigate to="/music-marketing-india" replace />} />
          <Route path="/youtube-content-id-india" element={<Navigate to="/music-publishing-india" replace />} />
          <Route path="/music-royalties-in-india" element={<Navigate to="/music-publishing-india" replace />} />
          <Route path="/distribute-music-jiosaavn" element={<Navigate to="/best-music-distribution-india" replace />} />
          <Route path="/indian-music-distribution-platform" element={<Navigate to="/best-music-distribution-india" replace />} />
          <Route path="/white-label-music-distribution-india" element={<Navigate to="/b2b-music-distribution-india" replace />} />
          <Route path="/music-distribution-pricing" element={<Navigate to="/music-distribution-pricing-india" replace />} />
          <Route path="/artist-guide" element={<Navigate to="/independent-artist-guide-india" replace />} />
          <Route path="/music-marketing" element={<Navigate to="/music-marketing-india" replace />} />
          
          <Route path="/terms" element={<Terms />} />
          <Route path="/refunds" element={<Refunds />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<Navigate to="/founder-developer" replace />} />
          <Route path="/pricing" element={<Navigate to="/#pricing" replace />} />
          <Route path="/checkout/success" element={<Success />} />
          <Route path="/checkout/cancel" element={<Cancel />} />
          <Route path="/privacy-policy" element={<Navigate to="/terms" replace />} />
          <Route path="/terms-conditions" element={<Navigate to="/terms" replace />} />
          
          {/* Auth Routes */}
          <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" />} />
          <Route path="/login" element={<Navigate to="/auth?mode=login" />} />
          <Route path="/register" element={<Navigate to="/auth?mode=signup" />} />
          <Route path="/forgot-password" element={<Navigate to="/auth?mode=forgot" />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<PrivateRoute adminOnly><AdminLayout /></PrivateRoute>}>
            <Route index element={<AdminHome />} />
            <Route path="releases" element={<AdminReleases />} />
            <Route path="review/:releaseId" element={<AdminReview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="finance" element={<AdminFinance />} />
            <Route path="withdrawals" element={<AdminWithdrawals />} />
            <Route path="artists" element={<AdminArtists />} />
            <Route path="labels" element={<AdminLabels />} />
            <Route path="oac" element={<AdminOAC />} />
            <Route path="content-id" element={<AdminContentID />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="user-requests" element={<AdminUserRequests />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="broadcasts" element={<AdminBroadcasts />} />
            <Route path="history" element={<AdminHistory />} />
          </Route>

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
            <Route index element={<Overview />} />
            <Route path="releases" element={<MyReleases />} />
            <Route path="releases/:releaseId" element={<ReleaseDetails />} />
            <Route path="upload" element={<Upload />} />
            <Route path="edit/:releaseId" element={<Upload />} />
            <Route path="artists" element={<Artists />} />
            <Route path="labels" element={<Labels />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="profile" element={<Profile />} />
            <Route path="support" element={<Support />} />
            <Route path="requests" element={<Requests />} />
            <Route path="oac" element={<OACRequest />} />
            <Route path="content-id" element={<ContentID />} />
            <Route path="reports" element={<Reports />} />
            <Route path="growth" element={<GrowthTools />} />
            <Route path="subscription" element={<Subscription />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </React.Suspense>
    </Router>
  );
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" expand={false} richColors />
      <AppContent />
    </>
  );
}
