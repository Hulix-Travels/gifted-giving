import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { authAPI } from '../services/api';
import { getTokenFromUrl, clearTokenFromUrl } from '../utils/hashToken';
import { panelCard } from '../theme/styles';

const submitButtonSx = {
  py: 1.5,
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem'
};

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    async function verify() {
      const token = getTokenFromUrl();
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
        if (data.user?.email) {
          setEmail(data.user.email);
        }
        clearTokenFromUrl('/verify-email');
      } catch (error) {
        setSuccess(false);
        setMessage(error.message || 'Verification failed. The token may be invalid or expired.');
        if (import.meta.env.DEV) {
          console.error('Verification error:', error);
        }
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, []);

  const handleContinue = () => {
    if (email && window.openLoginModal) {
      window.openLoginModal(email);
    } else {
      window.openLoginModal?.();
    }
    navigate('/');
  };

  return (
    <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, mt: 8, backgroundColor: 'var(--cream)' }}>
      <Card sx={{ ...panelCard, maxWidth: 500, width: '100%', p: { xs: 2.5, md: 3 } }}>
        <CardContent sx={{ textAlign: 'center', p: 0, '&:last-child': { pb: 0 } }}>
          {loading ? (
            <>
              <CircularProgress sx={{ mb: 2, color: 'var(--accent-green)' }} />
              <Typography variant="body2" sx={{ color: 'var(--gray)' }}>
                Verifying your email…
              </Typography>
            </>
          ) : (
            <>
              <Typography
                variant="h5"
                sx={{
                  mb: 2,
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 600,
                  color: success ? 'var(--primary-green)' : 'error.main'
                }}
              >
                {success ? 'Email verified' : 'Verification failed'}
              </Typography>
              <Alert
                severity={success ? 'success' : 'error'}
                sx={{ mb: 3, borderRadius: 'var(--radius-sm)', textAlign: 'left' }}
              >
                {message}
              </Alert>
              {success && (
                <>
                  {email && (
                    <Typography variant="body2" sx={{ color: 'var(--gray)', mb: 2, lineHeight: 1.6 }}>
                      Your email <strong>{email}</strong> has been verified.
                    </Typography>
                  )}
                  <Button variant="contained" color="primary" onClick={handleContinue} fullWidth sx={submitButtonSx}>
                    Continue to log in
                  </Button>
                </>
              )}
              {!success && (
                <Button
                  variant="outlined"
                  onClick={() => navigate('/')}
                  fullWidth
                  sx={{
                    ...submitButtonSx,
                    borderColor: 'var(--primary-green)',
                    color: 'var(--primary-green)',
                    '&:hover': { borderColor: 'var(--dark-green)', backgroundColor: 'var(--light-green)' }
                  }}
                >
                  Go to home
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
