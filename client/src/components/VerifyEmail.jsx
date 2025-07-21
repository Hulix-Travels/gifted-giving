import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Button, CircularProgress } from '@mui/material';

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
      setLoading(true);
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();
        if (res.ok) {
          setSuccess(true);
          setMessage(data.message || 'Email verified successfully!');
          if (data.user && data.user.email) setEmail(data.user.email);
        } else {
          setSuccess(false);
          setMessage(data.message || 'Verification failed.');
        }
      } catch (e) {
        setSuccess(false);
        setMessage('An error occurred during verification.');
      } finally {
        setLoading(false);
      }
    }
    if (token) verify();
    else {
      setLoading(false);
      setSuccess(false);
      setMessage('No verification token provided.');
    }
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
    <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card sx={{ maxWidth: 400, width: '100%', p: 3, borderRadius: 3, boxShadow: 4 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          {loading ? (
            <CircularProgress />
          ) : (
            <>
              <Typography variant="h5" sx={{ mb: 2, color: success ? 'green' : 'error.main' }}>
                {success ? 'Success!' : 'Verification Failed'}
              </Typography>
              <Typography sx={{ mb: 3 }}>{message}</Typography>
              {success && (
                <Button variant="contained" color="primary" onClick={handleContinue}>Continue</Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
} 