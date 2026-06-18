import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import DocumentHead from './components/DocumentHead';
import { Box, CircularProgress } from '@mui/material';

const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const UserDashboard = lazy(() => import('./components/UserDashboard'));
const VerifyEmail = lazy(() => import('./components/VerifyEmail'));
const ResetPassword = lazy(() => import('./components/ResetPassword'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const FinancialReports = lazy(() => import('./components/FinancialReports'));
const VolunteerPage = lazy(() => import('./components/VolunteerPage'));
const NotFound = lazy(() => import('./components/NotFound'));

function PageLoader() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
      <CircularProgress sx={{ color: 'var(--primary-green)' }} />
    </Box>
  );
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user || user.role !== 'admin') return <Navigate to="/" />;
  return children;
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/" />;
  return children;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    scrollToTop();
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(scrollToTop);
    });

    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}

function LegacyHashRedirect() {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (pathname === '/' && hash === '#volunteer') {
      navigate('/volunteer', { replace: true });
    }
  }, [pathname, hash, navigate]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <LegacyHashRedirect />
        <DocumentHead />
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          <Box sx={{ flex: 1 }}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/financial-reports" element={<FinancialReports />} />
                <Route path="/volunteer" element={<VolunteerPage />} />
                <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/" element={<Home />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Box>
          <Footer />
        </Box>
      </Router>
    </AuthProvider>
  );
}

export default App;
