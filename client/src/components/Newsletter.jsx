import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Grid, Paper, Alert, Snackbar } from '@mui/material';
import { Email, Send, CheckCircle } from '@mui/icons-material';
import { newsletterAPI } from '../services/api';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await newsletterAPI.subscribe(email);
      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError(err.message || 'Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError('');
  };

  return (
    <Box 
      sx={{ 
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--dark-green) 100%)',
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
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 800,
                  color: 'var(--white)',
                  mb: 3,
                  fontSize: { xs: '2rem', md: '2.5rem' }
                }}
              >
                Stay Connected
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  mb: 4,
                  fontSize: '1.2rem',
                  lineHeight: 1.6
                }}
              >
                Get the latest updates on our programs, success stories, and impact reports delivered directly to your inbox.
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <CheckCircle sx={{ color: 'var(--accent-green)', fontSize: 20 }} />
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Weekly impact reports
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <CheckCircle sx={{ color: 'var(--accent-green)', fontSize: 20 }} />
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Success stories and testimonials
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <CheckCircle sx={{ color: 'var(--accent-green)', fontSize: 20 }} />
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Exclusive volunteer opportunities
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={8}
              sx={{ 
                p: 4,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Email sx={{ fontSize: 48, color: 'var(--primary-green)', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--primary-green)', mb: 1 }}>
                  Join Our Community
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--gray)' }}>
                  Be the first to know about our impact and opportunities
                </Typography>
              </Box>
              
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  type="email"
                  label="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="outlined"
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      '&:hover fieldset': {
                        borderColor: 'var(--primary-green)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'var(--primary-green)',
                      },
                    }
                  }}
                  placeholder="Enter your email"
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? null : <Send />}
                  sx={{
                    background: 'linear-gradient(135deg, var(--accent-green), #00cc6a)',
                    color: 'var(--primary-green)',
                    fontWeight: 700,
                    py: 2,
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 20px rgba(0,255,140,0.3)',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #00cc6a, var(--accent-green))',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 25px rgba(0,255,140,0.4)'
                    },
                    '&:disabled': {
                      background: 'var(--light-gray)',
                      color: 'var(--gray)'
                    }
                  }}
                >
                  {loading ? 'Subscribing...' : 'Subscribe Now'}
                </Button>
              </Box>
              
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block', 
                  textAlign: 'center', 
                  mt: 2, 
                  color: 'var(--gray)',
                  fontSize: '0.8rem'
                }}
              >
                We respect your privacy. Unsubscribe at any time.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Thank you for subscribing! You'll receive our next newsletter soon.
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
