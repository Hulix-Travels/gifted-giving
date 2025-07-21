import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  TextField, 
  Button, 
  Link,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  YouTube,
  LocationOn,
  Phone,
  Email,
  AccessTime
} from '@mui/icons-material';
import { newsletterAPI } from '../services/api';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Handle smooth scrolling to sections
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle newsletter subscription
  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter your email address',
        severity: 'error'
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid email address',
        severity: 'error'
      });
      return;
    }

    setIsSubscribing(true);
    
    try {
      const response = await newsletterAPI.subscribe(email);
      setSnackbar({
        open: true,
        message: response.message,
        severity: 'success'
      });
      setEmail('');
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to subscribe. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Quick links configuration
  const quickLinks = [
    { name: 'About Us', sectionId: 'about' },
    { name: 'Our Programs', sectionId: 'programs' },
    { name: 'Success Stories', sectionId: 'stories' },
    { name: 'Ways to Give', sectionId: 'donate' },
    { name: 'Volunteer', sectionId: 'volunteer' }
  ];

  return (
    <Box id="contact" sx={{ bgcolor: '#01371f', color: '#fff', py: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Organization Info */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Gifted Giving
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6 }}>
              Empowering children through education, health, and opportunity since 2020.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                size="small" 
                sx={{ color: '#fff', '&:hover': { color: '#00ff8c' } }}
                onClick={() => window.open('https://facebook.com', '_blank')}
              >
                <Facebook />
              </IconButton>
              <IconButton 
                size="small" 
                sx={{ color: '#fff', '&:hover': { color: '#00ff8c' } }}
                onClick={() => window.open('https://twitter.com', '_blank')}
              >
                <Twitter />
              </IconButton>
              <IconButton 
                size="small" 
                sx={{ color: '#fff', '&:hover': { color: '#00ff8c' } }}
                onClick={() => window.open('https://instagram.com', '_blank')}
              >
                <Instagram />
              </IconButton>
              <IconButton 
                size="small" 
                sx={{ color: '#fff', '&:hover': { color: '#00ff8c' } }}
                onClick={() => window.open('https://linkedin.com', '_blank')}
              >
                <LinkedIn />
              </IconButton>
              <IconButton 
                size="small" 
                sx={{ color: '#fff', '&:hover': { color: '#00ff8c' } }}
                onClick={() => window.open('https://youtube.com', '_blank')}
              >
                <YouTube />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Quick Links
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {quickLinks.map((link) => (
                <Box component="li" key={link.name} sx={{ mb: 1 }}>
                  <Link 
                    component="button"
                    onClick={() => scrollToSection(link.sectionId)}
                    sx={{ 
                    color: 'rgba(255,255,255,0.7)', 
                    textDecoration: 'none',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 'inherit',
                      fontFamily: 'inherit',
                    '&:hover': { color: '#00ff8c' }
                    }}
                  >
                    {link.name}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ fontSize: 20 }} />
                <Typography variant="body2">
                  123 Buganda Road, Kampala, Uganda
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ fontSize: 20 }} />
                <Link 
                  href="tel:+19783823964" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.7)', 
                    textDecoration: 'none',
                    '&:hover': { color: '#00ff8c' }
                  }}
                >
                  +1(978)-382-3964
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ fontSize: 20 }} />
                <Link 
                  href="mailto:giftedhands1256@gmail.com" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.7)', 
                    textDecoration: 'none',
                    '&:hover': { color: '#00ff8c' }
                  }}
                >
                  giftedhands1256@gmail.com
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime sx={{ fontSize: 20 }} />
                <Typography variant="body2">
                  Mon-Fri: 9AM - 5PM EAT
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Newsletter */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Newsletter
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6 }}>
              Subscribe to receive updates on our work and how you can help.
            </Typography>
            <Box component="form" onSubmit={handleSubscribe} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                size="small"
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubscribing}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#00ff8c' }
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255,255,255,0.7)',
                    opacity: 1
                  }
                }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={isSubscribing}
                sx={{
                  background: '#00ff8c',
                  color: '#01371f',
                  fontWeight: 700,
                  '&:hover': { background: '#00e67a' },
                  '&:disabled': { 
                    background: 'rgba(0,255,140,0.5)', 
                    color: 'rgba(1,55,31,0.5)' 
                  }
                }}
              >
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Footer Bottom */}
        <Box sx={{ 
          borderTop: '1px solid rgba(255,255,255,0.1)', 
          mt: 4, 
          pt: 3,
          textAlign: 'center'
        }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            © 2025 Gifted Giving. All rights reserved. | Registered NGO #12345 |
            <Link href="#" sx={{ color: 'rgba(255,255,255,0.7)', ml: 1 }}>
              Privacy Policy
            </Link>
            |
            <Link href="#" sx={{ color: 'rgba(255,255,255,0.7)', ml: 1 }}>
              Financial Reports
            </Link>
          </Typography>
        </Box>
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 