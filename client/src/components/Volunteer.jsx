import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextareaAutosize,
  Alert,
  Snackbar,
  Chip,
  Avatar,
  Divider,
  Paper,
  IconButton,
  InputAdornment,
  FormHelperText,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  School,
  Work,
  Schedule,
  Message,
  VolunteerActivism,
  CheckCircle,
  Star
} from '@mui/icons-material';
import { volunteersAPI } from '../services/api';

export default function Volunteer() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    location: '',
    skills: [],
    experience: '',
    availability: '',
    commitment: '',
    message: '',
    emergencyContact: '',
    emergencyPhone: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const skillsOptions = [
    { value: 'teaching', label: 'Teaching/Tutoring', icon: '📚' },
    { value: 'medical', label: 'Medical/Healthcare', icon: '🏥' },
    { value: 'construction', label: 'Construction/Building', icon: '🏗️' },
    { value: 'fundraising', label: 'Fundraising/Grant Writing', icon: '💰' },
    { value: 'translation', label: 'Translation Services', icon: '🌍' },
    { value: 'counseling', label: 'Counseling/Psychology', icon: '🧠' },
    { value: 'sports', label: 'Sports/Physical Activities', icon: '⚽' },
    { value: 'arts', label: 'Arts/Creative Activities', icon: '🎨' },
    { value: 'technology', label: 'Technology/IT', icon: '💻' },
    { value: 'cooking', label: 'Cooking/Nutrition', icon: '🍳' },
    { value: 'administration', label: 'Administration/Management', icon: '📋' },
    { value: 'other', label: 'Other Skills', icon: '✨' }
  ];

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'agreeToTerms' ? checked : value
    }));
  };

  const handleSkillsChange = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  // Validation functions
  const validateForm = () => {
    const newErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    } else if (formData.firstName.trim().length > 50) {
      newErrors.firstName = 'First name cannot exceed 50 characters';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    } else if (formData.lastName.trim().length > 50) {
      newErrors.lastName = 'Last name cannot exceed 50 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      newErrors.phone = 'Phone number must be 10-15 digits';
    } else if (!/^[+]?[1-9][\d]{9,14}$/.test(cleanPhone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Age validation
    const age = parseInt(formData.age);
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(age) || age < 18 || age > 100) {
      newErrors.age = 'Age must be between 18 and 100';
    }

    // Location validation
    if (!formData.location) {
      newErrors.location = 'Please select a preferred location';
    }

    // Skills validation
    if (formData.skills.length === 0) {
      newErrors.skills = 'Please select at least one skill';
    }

    // Availability validation
    if (!formData.availability) {
      newErrors.availability = 'Please select your availability';
    }

    // Commitment validation
    if (!formData.commitment) {
      newErrors.commitment = 'Please select your commitment level';
    }

    // Emergency Contact validation
    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = 'Emergency contact name is required';
    } else if (formData.emergencyContact.trim().length < 2) {
      newErrors.emergencyContact = 'Emergency contact name must be at least 2 characters';
    } else if (formData.emergencyContact.trim().length > 100) {
      newErrors.emergencyContact = 'Emergency contact name cannot exceed 100 characters';
    }

    // Emergency Phone validation
    const cleanEmergencyPhone = formData.emergencyPhone.replace(/[\s\-\(\)]/g, '');
    if (!formData.emergencyPhone.trim()) {
      newErrors.emergencyPhone = 'Emergency contact phone is required';
    } else if (cleanEmergencyPhone.length < 10 || cleanEmergencyPhone.length > 15) {
      newErrors.emergencyPhone = 'Emergency contact phone must be 10-15 digits';
    } else if (!/^[+]?[1-9][\d]{9,14}$/.test(cleanEmergencyPhone)) {
      newErrors.emergencyPhone = 'Please enter a valid emergency contact phone number';
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Please tell us why you want to volunteer';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    } else if (formData.message.trim().length > 1000) {
      newErrors.message = 'Message cannot exceed 1000 characters';
    }

    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please fix the validation errors before submitting.',
        severity: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      // Convert age to number and clean phone numbers
      const submissionData = {
        ...formData,
        age: parseInt(formData.age),
        phone: formData.phone.replace(/[\s\-\(\)]/g, ''),
        emergencyPhone: formData.emergencyPhone.replace(/[\s\-\(\)]/g, ''),
        agreeToTerms: Boolean(formData.agreeToTerms) // Ensure boolean conversion
      };

      await volunteersAPI.apply(submissionData);
      setSnackbar({
        open: true,
        message: '🎉 Volunteer application submitted successfully! We will contact you within 48 hours.',
        severity: 'success'
      });
      
      // Reset form and errors
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        age: '',
        location: '',
        skills: [],
        experience: '',
        availability: '',
        commitment: '',
        message: '',
        emergencyContact: '',
        emergencyPhone: '',
        agreeToTerms: false
      });
      setErrors({});
    } catch (error) {
      let errorMessage = 'Failed to submit application. Please try again.';
      
      // Check if it's a validation error from the server
      if (error.message && error.message.includes('Validation failed')) {
        // Try to extract specific validation errors from the response
        let validationErrors = [];
        
        // Try multiple possible error structures
        if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
          validationErrors = error.errors;
        } else if (error.responseData && error.responseData.errors) {
          validationErrors = Array.isArray(error.responseData.errors) ? error.responseData.errors : [error.responseData.errors];
        }
        
        if (validationErrors.length > 0) {
          const errorMessages = validationErrors.map(err => {
            try {
              const fieldName = err.param ? err.param.charAt(0).toUpperCase() + err.param.slice(1) : 'Field';
              const message = err.msg || err.message || 'Invalid value';
              return `${fieldName}: ${message}`;
            } catch {
               return 'Invalid field value';
             }
          }).join(', ');
          errorMessage = `Please fix these issues: ${errorMessages}`;
        } else {
          errorMessage = 'Please check your form data and try again.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      

      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box id="volunteer" sx={{ 
      py: { xs: 8, md: 12 }, 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box textAlign="center" sx={{ mb: 6 }}>
          <Typography variant="h2" component="h2" sx={{ 
            mb: 2, 
            fontWeight: 800, 
            color: 'var(--primary-green)',
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            Join Our Volunteer Team
          </Typography>
          
          <Typography variant="h5" sx={{ 
            mb: 3, 
            color: 'var(--accent-green)',
            fontWeight: 600,
            maxWidth: 800,
            mx: 'auto'
          }}>
            Make a lasting impact in children's lives
          </Typography>
          
          <Typography variant="body1" sx={{ 
            mb: 4, 
            maxWidth: 700, 
            mx: 'auto',
            fontSize: '1.2rem',
            lineHeight: 1.8,
            color: '#555'
          }}>
            Whether you can give time locally or abroad, your skills and passion can create positive change. 
            Join our community of dedicated volunteers making a difference every day.
          </Typography>


        </Box>

        {/* Application Form */}
        <Card sx={{ 
          maxWidth: 1000, 
          mx: 'auto', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          borderRadius: 4,
          overflow: 'hidden'
        }}>
          <Box sx={{ 
            background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--accent-green) 100%)',
            p: 3,
            textAlign: 'center'
          }}>
            <Typography variant="h4" sx={{ 
              color: 'white', 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2
            }}>
              <VolunteerActivism />
              Volunteer Application Form
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 4, md: 6 } }}>
            <Box component="form" onSubmit={handleSubmit}>
              {/* Personal Information */}
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'var(--primary-green)' }}>
                <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                Personal Information
              </Typography>
              
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    error={!!errors.email}
                    helperText={errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    error={!!errors.phone}
                    helperText={errors.phone || "Enter your phone number (e.g., 1234567890 or +1234567890)"}
                    placeholder="1234567890"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    error={!!errors.age}
                    helperText={errors.age || "Must be 18 or older"}
                    inputProps={{ min: 18, max: 100 }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required error={!!errors.location}>
                    <InputLabel>Where would you like to volunteer?</InputLabel>
                    <Select
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      label="Where would you like to volunteer?"
                      startAdornment={
                        <InputAdornment position="start">
                          <LocationOn color="action" />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="local">
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>🌍 Remote/Online</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Work from anywhere in the world
                          </Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="nairobi">
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>🇰🇪 Nairobi, Kenya</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Our main office and community programs
                          </Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="kampala">
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>🇺🇬 Kampala, Uganda</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Education and healthcare initiatives
                          </Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="dar-es-salaam">
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>🇹🇿 Dar es Salaam, Tanzania</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Environmental and youth programs
                          </Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="kigali">
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>🇷🇼 Kigali, Rwanda</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Technology and innovation projects
                          </Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="other">
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>🌐 Other International</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Let us know your preferred location
                          </Typography>
                        </Box>
                      </MenuItem>
                    </Select>
                    <FormHelperText error={!!errors.location}>
                      {errors.location || "Choose where you'd like to make the most impact"}
                    </FormHelperText>
                  </FormControl>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              {/* Skills & Experience */}
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'var(--primary-green)' }}>
                <School sx={{ mr: 1, verticalAlign: 'middle' }} />
                Skills & Experience
              </Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
                    Select your skills and areas of expertise:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {skillsOptions.map((skill) => (
                      <Chip
                        key={skill.value}
                        label={`${skill.icon} ${skill.label}`}
                        onClick={() => handleSkillsChange(skill.value)}
                        color={formData.skills.includes(skill.value) ? 'primary' : 'default'}
                        variant={formData.skills.includes(skill.value) ? 'filled' : 'outlined'}
                        sx={{ 
                          mb: 1,
                          '&:hover': { transform: 'scale(1.05)' },
                          transition: 'all 0.2s ease'
                        }}
                      />
                    ))}
                  </Box>
                  {errors.skills && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                      {errors.skills}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Previous Volunteer Experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    helperText="Tell us about any previous volunteer work or relevant experience"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              {/* Availability & Commitment */}
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'var(--primary-green)' }}>
                <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                Availability & Commitment
              </Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required error={!!errors.availability}>
                    <InputLabel>What's your availability?</InputLabel>
                    <Select
                      name="availability"
                      value={formData.availability}
                      onChange={handleChange}
                      label="What's your availability?"
                    >
                      <MenuItem value="fulltime">
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>⏰ Full-time (3+ months)</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Dedicated volunteer, 30+ hours per week
                          </Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="parttime">
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>📅 Part-time (10-20 hrs/week)</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Regular commitment, flexible schedule
                          </Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="shortterm">
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>⚡ Short-term (1-4 weeks)</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Intensive project or event support
                          </Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="flexible">
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>🔄 Flexible/Remote</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Work on your own schedule
                          </Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="weekends">
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>🌅 Weekends Only</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Saturday and Sunday availability
                          </Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="evenings">
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>🌙 Evenings Only</Typography>
                          <Typography variant="caption" color="text.secondary">
                            After 6 PM on weekdays
                          </Typography>
                        </Box>
                      </MenuItem>
                    </Select>
                    <FormHelperText error={!!errors.availability}>
                      {errors.availability || "Tell us when you're available to help"}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required error={!!errors.commitment}>
                    <InputLabel>How long can you commit?</InputLabel>
                    <Select
                      name="commitment"
                      value={formData.commitment}
                      onChange={handleChange}
                      label="How long can you commit?"
                    >
                      <MenuItem value="high">
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>🎯 High Commitment (6+ months)</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Long-term partnership, leadership roles
                          </Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="medium">
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>📈 Medium Commitment (3-6 months)</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Sustained involvement, project-based
                          </Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="low">
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>🌱 Low Commitment (1-3 months)</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Short-term support, event-based
                          </Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="flexible">
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>🤝 Flexible Commitment</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Let's discuss what works best
                          </Typography>
                        </Box>
                      </MenuItem>
                    </Select>
                    <FormHelperText error={!!errors.commitment}>
                      {errors.commitment || "We value any amount of time you can give"}
                    </FormHelperText>
                  </FormControl>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              {/* Emergency Contact */}
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'var(--primary-green)' }}>
                <Phone sx={{ mr: 1, verticalAlign: 'middle' }} />
                Emergency Contact
              </Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Emergency Contact Name"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    required
                    error={!!errors.emergencyContact}
                    helperText={errors.emergencyContact}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Emergency Contact Phone"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    required
                    error={!!errors.emergencyPhone}
                    helperText={errors.emergencyPhone || "Enter emergency contact phone number"}
                    placeholder="1234567890"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              {/* Motivation */}
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'var(--primary-green)' }}>
                <Message sx={{ mr: 1, verticalAlign: 'middle' }} />
                Why Volunteer With Us?
              </Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tell us why you want to volunteer with Gifted givings"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    multiline
                    rows={5}
                    required
                    error={!!errors.message}
                    helperText={errors.message || "Share your motivation, goals, and what you hope to achieve through volunteering"}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              {/* Terms & Submit */}
              <Box sx={{ mb: 4 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      required
                      sx={{ 
                        color: errors.agreeToTerms ? 'error.main' : 'primary.main'
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" color={errors.agreeToTerms ? 'error' : 'inherit'}>
                      I agree to the terms and conditions and confirm that all information provided is accurate
                    </Typography>
                  }
                />
                {errors.agreeToTerms && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {errors.agreeToTerms}
                  </Typography>
                )}
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading || !formData.agreeToTerms}
                sx={{
                  background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--accent-green) 100%)',
                  color: 'white',
                  fontWeight: 700,
                  borderRadius: 3,
                  py: 2,
                  fontSize: '1.2rem',
                  textTransform: 'none',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, var(--accent-green) 0%, var(--primary-green) 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 35px rgba(0,0,0,0.2)'
                  },
                  '&:disabled': { 
                    background: '#ccc',
                    transform: 'none',
                    boxShadow: 'none'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? (
                  <>
                    <Box component="span" sx={{ animation: 'spin 1s linear infinite', mr: 1 }}>
                      ⏳
                    </Box>
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <CheckCircle sx={{ mr: 1 }} />
                    Submit Volunteer Application
                  </>
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={8000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            fontSize: '1rem',
            '& .MuiAlert-icon': { fontSize: '2rem' }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );
} 