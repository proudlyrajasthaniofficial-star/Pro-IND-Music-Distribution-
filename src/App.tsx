import React, { lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PageLoader from './components/ui/Loading';
import { Toaster } from 'sonner';

// Lazy loading for optimization
const Home = lazy(() => import('./pages/Home'));
const Features = lazy(() => import('./pages/Features'));
const Auth = lazy(() => import('./pages/Auth'));
const Founder = lazy(() => import('./pages/Founder'));
const SEOLandingPage = lazy(() => import('./pages/SEOLanding'));
const BlogList = lazy(() => import('./pages/BlogList'));
const BlogPost = lazy(() => import('./pages/BlogPost'));

const Pricing = lazy(() => import('./pages/Pricing'));
const Success = lazy(() => import('./pages/checkout/Success'));
const Cancel = lazy(() => import('./pages/checkout/Cancel'));

// Dashboard Components
const DashboardLayout = lazy(() => import('./components/DashboardLayout'));

// Dashboard Pages
const Overview = lazy(() => import('./pages/dashboard/Overview'));
const MyReleases = lazy(() => import('./pages/dashboard/MyReleases'));
const ReleaseDetails = lazy(() => import('./pages/dashboard/ReleaseDetails'));
const Upload = lazy(() => import('./pages/dashboard/Upload'));
const Artists = lazy(() => import('./pages/dashboard/Artists'));
const Labels = lazy(() => import('./pages/dashboard/Labels'));
const Wallet = lazy(() => import('./pages/dashboard/Wallet'));
const Profile = lazy(() => import('./pages/dashboard/Profile'));
const Support = lazy(() => import('./pages/dashboard/Support'));
const Requests = lazy(() => import('./pages/dashboard/Requests'));
const OACRequest = lazy(() => import('./pages/dashboard/OACRequest'));
const ContentID = lazy(() => import('./pages/dashboard/ContentID'));
const Reports = lazy(() => import('./pages/dashboard/Reports'));
const GrowthTools = lazy(() => import('./pages/dashboard/GrowthTools'));

// Legal Pages
const Terms = lazy(() => import('./pages/legal/Terms'));
const Refunds = lazy(() => import('./pages/legal/Refunds'));
const Contact = lazy(() => import('./pages/legal/Contact'));

// Admin Pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminHome = lazy(() => import('./pages/admin/AdminHome'));
const AdminReleases = lazy(() => import('./pages/admin/AdminReleases'));
const AdminReview = lazy(() => import('./pages/admin/AdminReview'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminFinance = lazy(() => import('./pages/admin/AdminFinance'));
const AdminWithdrawals = lazy(() => import('./pages/admin/AdminWithdrawals'));
const AdminArtists = lazy(() => import('./pages/admin/AdminArtists'));
const AdminLabels = lazy(() => import('./pages/admin/AdminLabels'));
const AdminOAC = lazy(() => import('./pages/admin/AdminOAC'));
const AdminContentID = lazy(() => import('./pages/admin/AdminContentID'));
const AdminSupport = lazy(() => import('./pages/admin/AdminSupport'));
const AdminUserRequests = lazy(() => import('./pages/admin/AdminUserRequests'));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'));
const AdminBroadcasts = lazy(() => import('./pages/admin/AdminBroadcasts'));
const AdminHistory = lazy(() => import('./pages/admin/AdminHistory'));

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
          <Route path="/pricing" element={<Pricing />} />
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
