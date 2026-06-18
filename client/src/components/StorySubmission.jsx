import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  Snackbar,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { successStoriesAPI } from '../services/api';
import FormSection from './ui/FormSection';
import { fieldSx } from '../theme/styles';

const storyCategories = [
  'Education',
  'Healthcare',
  'Nutrition',
  'Volunteer experience',
  'General impact',
  'Other'
];

const emptyForm = {
  author: '',
  email: '',
  category: '',
  rating: 5,
  content: '',
  location: ''
};

export default function StorySubmission({ open, onClose }) {
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleRatingChange = (_event, newValue) => {
    setFormData((prev) => ({
      ...prev,
      rating: newValue
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.author.trim() || !formData.content.trim() || !formData.email.trim()) {
      setError('Please fill in your name, email, and story.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await successStoriesAPI.create({
        author: formData.author.trim(),
        email: formData.email.trim(),
        content: formData.content.trim(),
        category: formData.category,
        rating: formData.rating,
        location: formData.location.trim(),
        status: 'pending'
      });

      setSuccess(true);
      resetForm();

      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-lg)'
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2.5,
            px: 3,
            borderBottom: '1px solid var(--color-border)'
          }}
        >
          <Typography
            variant="h6"
            component="span"
            sx={{ fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--primary-green)' }}
          >
            Share your story
          </Typography>
          <IconButton onClick={handleClose} disabled={loading} aria-label="Close" size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 3 }}>
          <Typography variant="body2" sx={{ mb: 3, color: 'var(--gray)', lineHeight: 1.65 }}>
            Tell us how Gifted givings has made a difference. Stories are reviewed before they appear on
            the site.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <FormSection title="1. About you">
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Your name"
                    value={formData.author}
                    onChange={handleChange('author')}
                    disabled={loading}
                    required
                    sx={fieldSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    disabled={loading}
                    required
                    sx={fieldSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth sx={fieldSx}>
                    <InputLabel>Program area</InputLabel>
                    <Select
                      value={formData.category}
                      onChange={handleChange('category')}
                      disabled={loading}
                      label="Program area"
                    >
                      {storyCategories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Location (optional)"
                    value={formData.location}
                    onChange={handleChange('location')}
                    disabled={loading}
                    placeholder="City, country"
                    sx={fieldSx}
                  />
                </Grid>
              </Grid>
            </FormSection>

            <FormSection title="2. Your experience" last>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, color: 'var(--gray)' }}>
                  Rating
                </Typography>
                <Rating
                  value={formData.rating}
                  onChange={handleRatingChange}
                  disabled={loading}
                  sx={{ color: 'var(--accent-green)' }}
                />
              </Box>
              <TextField
                fullWidth
                multiline
                minRows={5}
                label="Your story"
                value={formData.content}
                onChange={handleChange('content')}
                disabled={loading}
                required
                placeholder="What changed for you or your community?"
                sx={fieldSx}
              />
            </FormSection>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid var(--color-border)', gap: 1 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{ color: 'var(--gray)', fontWeight: 600, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            variant="contained"
            color="primary"
            sx={{ fontWeight: 600, textTransform: 'none', px: 3 }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={18} color="inherit" />
                Submitting…
              </Box>
            ) : (
              'Submit story'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Thank you. Your story will be reviewed shortly.
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}
