import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Snackbar, Alert, Paper, Fab, Modal } from '@mui/material';
import FeedbackIcon from '@mui/icons-material/Feedback';

export default function FeedbackForm() {
  const [form, setForm] = useState({ name: '', email: '', feedback: '' });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [open, setOpen] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.feedback.trim()) {
      setSnackbar({ open: true, message: 'Feedback is required.', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed to send feedback');
      setSnackbar({ open: true, message: 'Thank you for your feedback!', severity: 'success' });
      setForm({ name: '', email: '', feedback: '' });
      setOpen(false);
    } catch {
      setSnackbar({ open: true, message: 'Failed to send feedback. Please try again.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Fab
        color="primary"
        aria-label="feedback"
        onClick={() => setOpen(true)}
        sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1300 }}
      >
        <FeedbackIcon />
      </Fab>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>We value your feedback!</Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                label="Name (optional)"
                name="name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Email (optional)"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Your Feedback"
                name="feedback"
                value={form.feedback}
                onChange={handleChange}
                required
                fullWidth
                multiline
                minRows={4}
                sx={{ mb: 2 }}
              />
              <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                {loading ? 'Sending...' : 'Send Feedback'}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Modal>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
} 