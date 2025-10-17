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
    { name: 'Volunteer', sectionId: 'volunteer' },
    { name: 'FAQ', sectionId: 'faq' }
  ];

  return (
    <Box 
      id="contact" 
      sx={{ 
        background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--dark-green) 100%)',
        color: '#fff', 
        py: 6,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 50%, rgba(0,255,140,0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Grid container spacing={4}>
          {/* Organization Info */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#fff', fontSize: '1.2rem' }}>
              Gifted Giving
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6, color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>
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
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#fff', fontSize: '1.2rem' }}>
              Quick Links
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {quickLinks.map((link) => (
                <Box component="li" key={link.name} sx={{ mb: 1.5 }}>
                  <Link 
                    component="button"
                    onClick={() => scrollToSection(link.sectionId)}
                    sx={{ 
                      color: 'rgba(255,255,255,0.85)', 
                      textDecoration: 'none',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit',
                      fontWeight: 500,
                      display: 'block',
                      textAlign: 'left',
                      width: '100%',
                      '&:hover': { 
                        color: '#00ff8c',
                        transform: 'translateX(4px)',
                        transition: 'all 0.2s ease'
                      }
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
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#fff', fontSize: '1.2rem' }}>
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <LocationOn sx={{ fontSize: 20, color: '#00ff8c', mt: 0.2 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  123 Buganda Road, Kampala, Uganda
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Phone sx={{ fontSize: 20, color: '#00ff8c' }} />
                <Link 
                  href="tel:+19783823964" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.9)', 
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    '&:hover': { 
                      color: '#00ff8c',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  +1(978)-382-3964
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Email sx={{ fontSize: 20, color: '#00ff8c', mt: 0.2 }} />
                <Link 
                  href="mailto:giftedhands1256@gmail.com" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.9)', 
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    lineHeight: 1.4,
                    '&:hover': { 
                      color: '#00ff8c',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  giftedhands1256@gmail.com
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <AccessTime sx={{ fontSize: 20, color: '#00ff8c' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>
                  Mon-Fri: 9AM - 5PM EAT
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Newsletter */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#fff', fontSize: '1.2rem' }}>
              Newsletter
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6, color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>
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
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    '& fieldset': { 
                      borderColor: 'rgba(255,255,255,0.4)',
                      borderWidth: 1.5
                    },
                    '&:hover fieldset': { 
                      borderColor: 'rgba(255,255,255,0.6)',
                      backgroundColor: 'rgba(255,255,255,0.15)'
                    },
                    '&.Mui-focused fieldset': { 
                      borderColor: '#00ff8c',
                      backgroundColor: 'rgba(255,255,255,0.2)'
                    }
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255,255,255,0.8)',
                    opacity: 1,
                    fontSize: '0.95rem'
                  },
                  '& .MuiInputBase-input': {
                    fontSize: '0.95rem',
                    padding: '12px 14px'
                  }
                }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={isSubscribing}
                sx={{
                  background: 'linear-gradient(135deg, #00ff8c, #00e67a)',
                  color: '#01371f',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,255,140,0.3)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #00e67a, #00cc6a)',
                    boxShadow: '0 6px 16px rgba(0,255,140,0.4)',
                    transform: 'translateY(-1px)',
                    transition: 'all 0.2s ease'
                  },
                  '&:disabled': { 
                    background: 'rgba(0,255,140,0.5)', 
                    color: 'rgba(1,55,31,0.5)',
                    boxShadow: 'none',
                    transform: 'none'
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
          borderTop: '1px solid rgba(255,255,255,0.2)', 
          mt: 4, 
          pt: 3,
          textAlign: 'center'
        }}>
          <Typography variant="body2" sx={{ 
            color: 'rgba(255,255,255,0.85)', 
            fontSize: '0.9rem',
            lineHeight: 1.6
          }}>
            © 2025 Gifted Giving. All rights reserved. | Registered NGO #12345 |
            <Link href="#" sx={{ 
              color: 'rgba(255,255,255,0.85)', 
              ml: 1,
              textDecoration: 'none',
              '&:hover': { 
                color: '#00ff8c',
                textDecoration: 'underline'
              }
            }}>
              Privacy Policy
            </Link>
            |
            <Link href="#" sx={{ 
              color: 'rgba(255,255,255,0.85)', 
              ml: 1,
              textDecoration: 'none',
              '&:hover': { 
                color: '#00ff8c',
                textDecoration: 'underline'
              }
            }}>
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