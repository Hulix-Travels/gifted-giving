import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  Alert,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AuthModal({ open, onClose, initialLoginEmail = '', setLoginEmail }) {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const { login, register, error, clearError } = useAuth();

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [registerSuccess, setRegisterSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (open && initialLoginEmail) {
      setTab(0); // Switch to login tab
      setLoginData((prev) => ({ ...prev, email: initialLoginEmail }));
      if (setLoginEmail) setLoginEmail(initialLoginEmail);
    }
  }, [open, initialLoginEmail, setLoginEmail]);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    clearError();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginData);
      onClose();
      setLoginData({ email: '', password: '' });
    } catch {
      // Error is handled by the auth context
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      return;
    }
    setLoading(true);
    try {
      await register({
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        email: registerData.email,
        password: registerData.password
      });
      setRegisterSuccess(true);
      setRegisterData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      // Do NOT log in or close modal immediately
    } catch {
      // Error is handled by the auth context
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    clearError();
    setLoginData({ email: '', password: '' });
    setRegisterData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setRegisterSuccess(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Welcome to Gifted Giving
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ color: 'grey.500' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={handleTabChange} centered>
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>
      </Box>

      {error && (
        <Box sx={{ p: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      <DialogContent>
        {registerSuccess ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              Registration successful! Please check your email to verify your account.
            </Alert>
            <Button variant="contained" color="primary" onClick={handleClose}>Close</Button>
          </Box>
        ) : tab === 0 ? (
          // Login Form
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={loginData.email}
              onChange={(e) => {
                setLoginData({ ...loginData, email: e.target.value });
                if (setLoginEmail) setLoginEmail(e.target.value);
              }}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  background: '#00ff8c',
                  color: '#01371f',
                  '&:hover': { background: '#00e67a' }
                }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </DialogActions>
          </Box>
        ) : (
          // Register Form
          <Box component="form" onSubmit={handleRegister} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="First Name"
              value={registerData.firstName}
              onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Last Name"
              value={registerData.lastName}
              onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={registerData.confirmPassword}
              onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
              required
              sx={{ mb: 2 }}
              error={registerData.password !== registerData.confirmPassword && registerData.confirmPassword !== ''}
              helperText={registerData.password !== registerData.confirmPassword && registerData.confirmPassword !== '' ? 'Passwords do not match' : ''}
            />
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || registerData.password !== registerData.confirmPassword}
                sx={{
                  background: '#00ff8c',
                  color: '#01371f',
                  '&:hover': { background: '#00e67a' }
                }}
              >
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </DialogActions>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
} 