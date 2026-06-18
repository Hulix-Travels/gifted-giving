import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  Alert,
  IconButton,
  Grid,
  Fade,
  Collapse
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { fieldSx } from '../theme/styles';

const submitButtonSx = {
  py: 1.5,
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem'
};

const textButtonSx = {
  textTransform: 'none',
  fontWeight: 600,
  color: 'var(--primary-green)'
};

const panelTransitionMs = 280;

function AuthPanel({ active, children }) {
  return (
    <Box
      aria-hidden={!active}
      sx={{
        width: '100%',
        transition: `opacity ${panelTransitionMs}ms ease, transform ${panelTransitionMs}ms ease, visibility ${panelTransitionMs}ms`,
        opacity: active ? 1 : 0,
        transform: active ? 'translateY(0)' : 'translateY(6px)',
        pointerEvents: active ? 'auto' : 'none',
        position: active ? 'relative' : 'absolute',
        top: 0,
        left: 0,
        visibility: active ? 'visible' : 'hidden'
      }}
    >
      {children}
    </Box>
  );
}

export default function AuthModal({ open, onClose, initialLoginEmail = '', setLoginEmail }) {
  const [tab, setTab] = useState(0);
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(false);
  const { login, register, forgotPassword, error, clearError } = useAuth();

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
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  useEffect(() => {
    if (open && initialLoginEmail) {
      setTab(0);
      setLoginData((prev) => ({ ...prev, email: initialLoginEmail }));
      if (setLoginEmail) setLoginEmail(initialLoginEmail);
    }
  }, [open, initialLoginEmail, setLoginEmail]);

  const handleTabChange = (_event, newValue) => {
    setTab(newValue);
    setView(newValue === 0 ? 'login' : 'register');
    setForgotSuccess(false);
    setRegisterSuccess(false);
    clearError();
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(forgotEmail);
      setForgotSuccess(true);
    } catch {
      // Error handled by auth context
    } finally {
      setLoading(false);
    }
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
    setView('login');
    setTab(0);
    setForgotSuccess(false);
    setForgotEmail('');
  };

  const passwordsMismatch =
    registerData.password !== registerData.confirmPassword && registerData.confirmPassword !== '';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          px: 3,
          py: 2.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'var(--font-heading)',
          fontWeight: 600,
          color: 'var(--primary-green)',
          fontSize: '1.25rem'
        }}
      >
        Welcome to Gifted givings
        <IconButton aria-label="close" onClick={handleClose} sx={{ color: 'var(--gray)' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Collapse in={view !== 'forgot' && !registerSuccess} unmountOnExit>
        <Box sx={{ borderBottom: '1px solid var(--color-border)' }}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              minHeight: 48,
              '& .MuiTabs-flexContainer': {
                width: '100%'
              },
              '& .MuiTab-root': {
                flex: 1,
                maxWidth: 'none',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.9375rem',
                color: 'var(--gray)',
                minHeight: 48,
                justifyContent: 'center',
                '&:not(:last-of-type)': {
                  borderRight: '1px solid var(--color-border)'
                },
                '&.Mui-selected': { color: 'var(--primary-green)' }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'var(--accent-green)',
                height: 2,
                transition: 'left 0.28s cubic-bezier(0.4, 0, 0.2, 1), width 0.28s cubic-bezier(0.4, 0, 0.2, 1)'
              }
            }}
          >
            <Tab label="Log in" />
            <Tab label="Register" />
          </Tabs>
        </Box>
      </Collapse>

      <Collapse in={Boolean(error)} unmountOnExit>
        <Box sx={{ px: 3, pt: 2 }}>
          <Alert severity="error" sx={{ borderRadius: 'var(--radius-sm)' }}>
            {error}
          </Alert>
        </Box>
      </Collapse>

      <DialogContent sx={{ px: 3, py: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            position: 'relative',
            minHeight: registerSuccess || view === 'forgot' ? 'auto' : tab === 1 ? 420 : 300,
            transition: 'min-height 0.28s ease'
          }}
        >
          <Fade in={registerSuccess} unmountOnExit timeout={panelTransitionMs}>
            <Box sx={{ textAlign: 'center' }}>
              <Alert severity="success" sx={{ mb: 3, borderRadius: 'var(--radius-sm)', textAlign: 'left' }}>
                Registration successful! Please check your email to verify your account before logging in.
              </Alert>
              <Button variant="contained" color="primary" fullWidth onClick={handleClose} sx={submitButtonSx}>
                Close
              </Button>
            </Box>
          </Fade>

          <Fade in={view === 'forgot' && !registerSuccess} unmountOnExit timeout={panelTransitionMs}>
            <Box component="form" onSubmit={handleForgotPassword}>
              <Typography variant="body2" sx={{ color: 'var(--gray)', mb: 2.5, lineHeight: 1.6 }}>
                Enter your email address and we&apos;ll send you a link to reset your password.
              </Typography>
              {forgotSuccess ? (
                <Alert severity="success" sx={{ mb: 2.5, borderRadius: 'var(--radius-sm)' }}>
                  If an account with that email exists, a password reset link has been sent.
                </Alert>
              ) : (
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  sx={{ ...fieldSx, mb: 2.5 }}
                />
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading || forgotSuccess}
                sx={{ ...submitButtonSx, mb: 1.5 }}
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </Button>
              <Button
                fullWidth
                onClick={() => {
                  setView('login');
                  setForgotSuccess(false);
                  clearError();
                }}
                sx={textButtonSx}
              >
                Back to log in
              </Button>
            </Box>
          </Fade>

          {!registerSuccess && view !== 'forgot' && (
            <>
              <AuthPanel active={tab === 0}>
                <Box component="form" onSubmit={handleLogin}>
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
                    sx={{ ...fieldSx, mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    sx={{ ...fieldSx, mb: 1 }}
                  />
                  <Box sx={{ textAlign: 'right', mb: 2.5 }}>
                    <Button
                      type="button"
                      size="small"
                      onClick={() => {
                        setView('forgot');
                        setForgotEmail(loginData.email);
                        setForgotSuccess(false);
                        clearError();
                      }}
                      sx={textButtonSx}
                    >
                      Forgot password?
                    </Button>
                  </Box>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={loading}
                    sx={{ ...submitButtonSx, mb: 1.5 }}
                  >
                    {loading ? 'Logging in…' : 'Log in'}
                  </Button>
                  <Button fullWidth onClick={handleClose} sx={{ ...textButtonSx, color: 'var(--gray)' }}>
                    Cancel
                  </Button>
                </Box>
              </AuthPanel>

              <AuthPanel active={tab === 1}>
                <Box component="form" onSubmit={handleRegister}>
                  <Grid container spacing={2} sx={{ mb: 0 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="First name"
                        value={registerData.firstName}
                        onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                        required
                        sx={fieldSx}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Last name"
                        value={registerData.lastName}
                        onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                        required
                        sx={fieldSx}
                      />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                        sx={fieldSx}
                      />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                        helperText="At least 8 characters with one letter and one number"
                        sx={fieldSx}
                      />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="Confirm password"
                        type="password"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        required
                        error={passwordsMismatch}
                        helperText={passwordsMismatch ? 'Passwords do not match' : ''}
                        sx={fieldSx}
                      />
                    </Grid>
                  </Grid>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={loading || passwordsMismatch}
                    sx={{ ...submitButtonSx, mt: 2.5, mb: 1.5 }}
                  >
                    {loading ? 'Creating account…' : 'Create account'}
                  </Button>
                  <Button fullWidth onClick={handleClose} sx={{ ...textButtonSx, color: 'var(--gray)' }}>
                    Cancel
                  </Button>
                </Box>
              </AuthPanel>
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
