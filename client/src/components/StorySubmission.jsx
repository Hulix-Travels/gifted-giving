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
  MenuItem
} from '@mui/material';
import { Close, Send, Star } from '@mui/icons-material';
import { successStoriesAPI } from '../services/api';

const storyCategories = [
  'Education Program',
  'Healthcare Initiative',
  'Nutrition Program',
  'Volunteer Experience',
  'General Impact',
  'Other'
];

export default function StorySubmission({ open, onClose }) {
  const [formData, setFormData] = useState({
    author: '',
    email: '',
    category: '',
    rating: 5,
    content: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleRatingChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      rating: newValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.author || !formData.content || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const storyData = {
        author: formData.author,
        email: formData.email,
        content: formData.content,
        category: formData.category,
        rating: formData.rating,
        location: formData.location,
        status: 'pending' // Will be reviewed before publishing
      };
      
      console.log('Submitting story data:', storyData);
      
      const response = await successStoriesAPI.create(storyData);
      console.log('Story submission response:', response);
      
      setSuccess(true);
      setFormData({
        author: '',
        email: '',
        category: '',
        rating: 5,
        content: '',
        location: ''
      });
      
      // Close dialog after a short delay
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
      
    } catch (err) {
      console.error('Story submission error:', err);
      setError(err.message || 'Failed to submit story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        author: '',
        email: '',
        category: '',
        rating: 5,
        content: '',
        location: ''
      });
      setError('');
      onClose();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, var(--primary-green), var(--dark-green))',
          color: 'var(--white)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Star sx={{ fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Share Your Success Story
            </Typography>
          </Box>
          <IconButton 
            onClick={handleClose} 
            disabled={loading}
            sx={{ color: 'var(--white)' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          <Typography variant="body1" sx={{ mb: 3, color: 'var(--gray)' }}>
            Help us inspire others by sharing how Gifted givings has made a difference in your life or community. 
            Your story will be reviewed before being published on our website.
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="Your Name *"
                value={formData.author}
                onChange={handleChange('author')}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'var(--primary-green)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--primary-green)',
                    },
                  }
                }}
              />
              <TextField
                fullWidth
                label="Email Address *"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'var(--primary-green)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--primary-green)',
                    },
                  }
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={handleChange('category')}
                  disabled={loading}
                  sx={{
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--primary-green)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--primary-green)',
                    },
                  }}
                >
                  {storyCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Location (Optional)"
                value={formData.location}
                onChange={handleChange('location')}
                disabled={loading}
                placeholder="City, Country"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'var(--primary-green)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--primary-green)',
                    },
                  }
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, color: 'var(--gray)' }}>
                How would you rate your experience? *
              </Typography>
              <Rating
                value={formData.rating}
                onChange={handleRatingChange}
                disabled={loading}
                sx={{ color: 'var(--accent-green)' }}
                size="large"
              />
            </Box>

            <TextField
              fullWidth
              multiline
              rows={6}
              label="Your Story *"
              value={formData.content}
              onChange={handleChange('content')}
              disabled={loading}
              placeholder="Tell us about your experience with Gifted givings. How has it impacted you or your community? What difference has it made?"
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: 'var(--primary-green)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'var(--primary-green)',
                  },
                }
              }}
            />

            <Typography variant="caption" sx={{ color: 'var(--gray)', fontSize: '0.8rem' }}>
              * Required fields. Your story will be reviewed before being published.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{
              color: 'var(--gray)',
              fontWeight: 600
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            variant="contained"
            startIcon={loading ? null : <Send />}
            sx={{
              background: 'linear-gradient(135deg, var(--accent-green), #00cc6a)',
              color: 'var(--primary-green)',
              fontWeight: 700,
              px: 4,
              py: 1.5,
              borderRadius: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #00cc6a, var(--accent-green))',
                transform: 'translateY(-1px)'
              },
              '&:disabled': {
                background: 'var(--light-gray)',
                color: 'var(--gray)'
              }
            }}
          >
            {loading ? 'Submitting...' : 'Submit Story'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccess(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Thank you for sharing your story! It will be reviewed and published soon.
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setError('')} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}
