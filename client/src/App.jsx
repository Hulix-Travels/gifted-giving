import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import AdminDashboard from './components/AdminDashboard';
import FeedbackForm from './components/FeedbackForm';
import UserDashboard from './components/UserDashboard';
import { Box } from '@mui/material';

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null; // or a spinner
  if (!user || user.role !== 'admin') return <Navigate to="/" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
          <Box sx={{ flex: 1 }}>
        <Routes>
              <Route path="/dashboard" element={<UserDashboard />} />
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
