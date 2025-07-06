import React from 'react';
import { CssBaseline, Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Programs from './components/Programs';
import Testimonials from './components/Testimonials';
import Volunteer from './components/Volunteer';
import Donate from './components/Donate';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--white)'
      }}>
        <Header />
        <Box component="main" sx={{ flex: 1 }}>
          <Hero />
          <About />
          <Programs />
          <Testimonials />
          <Volunteer />
          <Donate />
        </Box>
        <Footer />
      </Box>
    </AuthProvider>
  );
}

export default App;
