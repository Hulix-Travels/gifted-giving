import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Grid, Paper, Alert, Snackbar } from '@mui/material';
import { newsletterAPI } from '../services/api';
import SectionHeader from './ui/SectionHeader';
import { sectionSurface, fieldSx } from '../theme/styles';

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
    <Box id="newsletter" sx={sectionSurface}>
      <Container maxWidth="md">
        <SectionHeader
          title="Stay in the loop"
          subtitle="Program updates, impact reports, and volunteer opportunities — delivered to your inbox."
        />

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--white)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="body2" sx={{ color: 'var(--gray)', lineHeight: 1.7, mb: { xs: 0, md: 0 } }}>
                Weekly impact summaries, success stories, and ways to get involved. Unsubscribe anytime.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ ...fieldSx, mb: 1.5 }}
                  placeholder="you@example.com"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  sx={{ py: 1.25, fontWeight: 600, textTransform: 'none' }}
                >
                  {loading ? 'Subscribing…' : 'Subscribe'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Thank you for subscribing.
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
