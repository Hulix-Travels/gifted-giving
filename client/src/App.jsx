import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import AdminDashboard from './components/AdminDashboard';
import FeedbackForm from './components/FeedbackForm';
import UserDashboard from './components/UserDashboard';
import VerifyEmail from './components/VerifyEmail';
import { Box } from '@mui/material';

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null; // or a spinner
  if (!user || user.role !== 'admin') return <Navigate to="/" />;
  return children;
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</Box>;
  if (!user) return <Navigate to="/" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
          <Box sx={{ flex: 1 }}>
        <Routes>
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/" element={<Home />} />
        </Routes>
          </Box>
        <Footer />
        </Box>
      </Router>
    </AuthProvider>
  );
}

export default App;
