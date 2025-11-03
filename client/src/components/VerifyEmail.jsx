import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { authAPI } from '../services/api';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function VerifyEmail() {
  const query = useQuery();
  const token = query.get('token');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function verify() {
      if (!token) {
        setLoading(false);
        setSuccess(false);
        setMessage('No verification token provided.');
        return;
      }

      setLoading(true);
      try {
        const data = await authAPI.verifyEmail(token);
        setSuccess(true);
        setMessage(data.message || 'Email verified successfully!');
        if (data.user && data.user.email) {
          setEmail(data.user.email);
        }
      } catch (error) {
        setSuccess(false);
        setMessage(error.message || 'Verification failed. The token may be invalid or expired.');
        console.error('Verification error:', error);
      } finally {
        setLoading(false);
      }
    }
    
    verify();
  }, [token]);

  const handleContinue = () => {
    if (email && window.openLoginModal) {
      window.openLoginModal(email);
    } else {
      window.openLoginModal && window.openLoginModal();
    }
    navigate('/');
  };

  return (
    <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Card sx={{ maxWidth: 500, width: '100%', p: 3, borderRadius: 3, boxShadow: 4 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          {loading ? (
            <>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Verifying your email...
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="h5" sx={{ mb: 2, color: success ? 'success.main' : 'error.main' }}>
                {success ? '✓ Email Verified!' : 'Verification Failed'}
              </Typography>
              <Alert 
                severity={success ? 'success' : 'error'} 
                sx={{ mb: 3, textAlign: 'left' }}
              >
                {message}
              </Alert>
              {success && (
                <>
                  {email && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Your email <strong>{email}</strong> has been verified.
                    </Typography>
                  )}
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleContinue}
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    Continue to Login
                  </Button>
                </>
              )}
              {!success && (
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={() => navigate('/')}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Go to Home
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
} 