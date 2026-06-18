import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { getTokenFromUrl, clearTokenFromUrl } from '../utils/hashToken';
import { fieldSx, panelCard } from '../theme/styles';

const submitButtonSx = {
  py: 1.5,
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem'
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [token, setToken] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setToken(getTokenFromUrl());
  }, []);

  const passwordsMatch = password === confirmPassword;
  const passwordValid = password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
  const canSubmit = passwordValid && passwordsMatch && !!token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError('');
    try {
      await resetPassword(token, password);
      setSuccess(true);
      clearTokenFromUrl('/reset-password');
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    window.openLoginModal?.();
    navigate('/');
  };

  if (token === null) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, mt: 8 }}>
        <CircularProgress sx={{ color: 'var(--primary-green)' }} />
      </Box>
    );
  }

  if (!token) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, mt: 8, backgroundColor: 'var(--cream)' }}>
        <Card sx={{ ...panelCard, maxWidth: 500, width: '100%', p: { xs: 2.5, md: 3 } }}>
          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            <Typography variant="h5" sx={{ mb: 2, color: 'error.main', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
              Invalid reset link
            </Typography>
            <Alert severity="error" sx={{ mb: 3, borderRadius: 'var(--radius-sm)' }}>
              No reset token was provided. Please request a new password reset link.
            </Alert>
            <Button variant="contained" color="primary" onClick={() => navigate('/')} fullWidth sx={submitButtonSx}>
              Go to home
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, mt: 8, backgroundColor: 'var(--cream)' }}>
      <Card sx={{ ...panelCard, maxWidth: 500, width: '100%', p: { xs: 2.5, md: 3 } }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {success ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ mb: 2, color: 'var(--primary-green)', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                Password updated
              </Typography>
              <Alert severity="success" sx={{ mb: 3, borderRadius: 'var(--radius-sm)', textAlign: 'left' }}>
                Your password has been updated. You can now log in with your new password.
              </Alert>
              <Button variant="contained" color="primary" onClick={handleContinue} fullWidth sx={submitButtonSx}>
                Continue to log in
              </Button>
            </Box>
          ) : (
            <>
              <Typography variant="h5" sx={{ mb: 1, color: 'var(--primary-green)', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                Reset your password
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--gray)', mb: 3, lineHeight: 1.6 }}>
                Enter a new password for your account.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 'var(--radius-sm)' }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="New password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  sx={{ ...fieldSx, mb: 2 }}
                  helperText="At least 8 characters with one letter and one number"
                />
                <TextField
                  fullWidth
                  label="Confirm new password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  sx={{ ...fieldSx, mb: 3 }}
                  error={confirmPassword !== '' && !passwordsMatch}
                  helperText={confirmPassword !== '' && !passwordsMatch ? 'Passwords do not match' : ''}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading || !canSubmit}
                  fullWidth
                  sx={submitButtonSx}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset password'}
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
