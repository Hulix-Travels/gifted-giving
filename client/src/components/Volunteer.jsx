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
  Alert,
  Snackbar,
  Chip,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  CircularProgress
} from '@mui/material';
import { volunteersAPI } from '../services/api';
import SectionHeader from './ui/SectionHeader';
import { sectionSurface, siteCard } from '../theme/styles';

const skillsOptions = [
  { value: 'teaching', label: 'Teaching / Tutoring' },
  { value: 'medical', label: 'Medical / Healthcare' },
  { value: 'construction', label: 'Construction / Building' },
  { value: 'fundraising', label: 'Fundraising / Grant Writing' },
  { value: 'translation', label: 'Translation' },
  { value: 'counseling', label: 'Counseling / Psychology' },
  { value: 'sports', label: 'Sports / Physical Activities' },
  { value: 'arts', label: 'Arts / Creative' },
  { value: 'technology', label: 'Technology / IT' },
  { value: 'cooking', label: 'Cooking / Nutrition' },
  { value: 'administration', label: 'Administration' },
  { value: 'other', label: 'Other' }
];

const locationOptions = [
  { value: 'local', label: 'Remote / Online' },
  { value: 'nairobi', label: 'Nairobi, Kenya' },
  { value: 'kampala', label: 'Kampala, Uganda' },
  { value: 'dar-es-salaam', label: 'Dar es Salaam, Tanzania' },
  { value: 'kigali', label: 'Kigali, Rwanda' },
  { value: 'other', label: 'Other international' }
];

const availabilityOptions = [
  { value: 'fulltime', label: 'Full-time (3+ months)' },
  { value: 'parttime', label: 'Part-time (10–20 hrs/week)' },
  { value: 'shortterm', label: 'Short-term (1–4 weeks)' },
  { value: 'flexible', label: 'Flexible / Remote' },
  { value: 'weekends', label: 'Weekends only' },
  { value: 'evenings', label: 'Evenings only' }
];

const commitmentOptions = [
  { value: 'high', label: 'High (6+ months)' },
  { value: 'medium', label: 'Medium (3–6 months)' },
  { value: 'low', label: 'Low (1–3 months)' },
  { value: 'flexible', label: 'Flexible' }
];

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'var(--white)'
  }
};

function FormSection({ title, description, children }) {
  return (
    <Box
      sx={{
        mb: 4,
        pb: 4,
        borderBottom: '1px solid var(--color-border)',
        '&:last-of-type': { borderBottom: 'none', mb: 0, pb: 0 }
      }}
    >
      <Typography
        variant="h6"
        component="h3"
        sx={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 600,
          color: 'var(--primary-green)',
          mb: description ? 0.5 : 2
        }}
      >
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" sx={{ color: 'var(--gray)', mb: 2.5, lineHeight: 1.6 }}>
          {description}
        </Typography>
      )}
      {children}
    </Box>
  );
}

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

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'agreeToTerms' ? checked : value
    }));
  };

  const handleSkillsChange = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    } else if (formData.firstName.trim().length > 50) {
      newErrors.firstName = 'First name cannot exceed 50 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    } else if (formData.lastName.trim().length > 50) {
      newErrors.lastName = 'Last name cannot exceed 50 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const cleanPhone = formData.phone.replace(/[\s\-()]/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      newErrors.phone = 'Phone number must be 10–15 digits';
    } else if (!/^[+]?[1-9][\d]{9,14}$/.test(cleanPhone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    const age = parseInt(formData.age, 10);
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (Number.isNaN(age) || age < 18 || age > 100) {
      newErrors.age = 'Age must be between 18 and 100';
    }

    if (!formData.location) {
      newErrors.location = 'Please select a preferred location';
    }

    if (formData.skills.length === 0) {
      newErrors.skills = 'Please select at least one skill';
    }

    if (!formData.availability) {
      newErrors.availability = 'Please select your availability';
    }

    if (!formData.commitment) {
      newErrors.commitment = 'Please select your commitment level';
    }

    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = 'Emergency contact name is required';
    } else if (formData.emergencyContact.trim().length < 2) {
      newErrors.emergencyContact = 'Emergency contact name must be at least 2 characters';
    } else if (formData.emergencyContact.trim().length > 100) {
      newErrors.emergencyContact = 'Emergency contact name cannot exceed 100 characters';
    }

    const cleanEmergencyPhone = formData.emergencyPhone.replace(/[\s\-()]/g, '');
    if (!formData.emergencyPhone.trim()) {
      newErrors.emergencyPhone = 'Emergency contact phone is required';
    } else if (cleanEmergencyPhone.length < 10 || cleanEmergencyPhone.length > 15) {
      newErrors.emergencyPhone = 'Emergency contact phone must be 10–15 digits';
    } else if (!/^[+]?[1-9][\d]{9,14}$/.test(cleanEmergencyPhone)) {
      newErrors.emergencyPhone = 'Please enter a valid emergency contact phone number';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please tell us why you want to volunteer';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    } else if (formData.message.trim().length > 1000) {
      newErrors.message = 'Message cannot exceed 1000 characters';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      const submissionData = {
        ...formData,
        age: parseInt(formData.age, 10),
        phone: formData.phone.replace(/[\s\-()]/g, ''),
        emergencyPhone: formData.emergencyPhone.replace(/[\s\-()]/g, ''),
        agreeToTerms: Boolean(formData.agreeToTerms)
      };

      await volunteersAPI.apply(submissionData);
      setSnackbar({
        open: true,
        message: 'Application submitted. We will contact you within 48 hours.',
        severity: 'success'
      });

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

      if (error.message && error.message.includes('Validation failed')) {
        let validationErrors = [];

        if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
          validationErrors = error.errors;
        } else if (error.responseData && error.responseData.errors) {
          validationErrors = Array.isArray(error.responseData.errors)
            ? error.responseData.errors
            : [error.responseData.errors];
        }

        if (validationErrors.length > 0) {
          const errorMessages = validationErrors
            .map((err) => {
              try {
                const fieldName = err.param
                  ? err.param.charAt(0).toUpperCase() + err.param.slice(1)
                  : 'Field';
                const message = err.msg || err.message || 'Invalid value';
                return `${fieldName}: ${message}`;
              } catch {
                return 'Invalid field value';
              }
            })
            .join(', ');
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
    <Box id="volunteer" sx={{ ...sectionSurface, minHeight: { md: 'calc(100vh - 90px)' } }}>
      <Container maxWidth="md">
        <SectionHeader
          title="Volunteer with us"
          subtitle="Share your time and skills to support children through education, health, and nutrition programs."
        />

        <Card sx={{ ...siteCard, boxShadow: 'var(--shadow-sm)' }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <FormSection title="1. Personal details">
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="First name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      error={!!errors.firstName}
                      helperText={errors.firstName}
                      sx={fieldSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Last name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                      sx={fieldSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      error={!!errors.email}
                      helperText={errors.email}
                      sx={fieldSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      error={!!errors.phone}
                      helperText={errors.phone || 'e.g. 1234567890 or +1234567890'}
                      placeholder="1234567890"
                      sx={fieldSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Age"
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleChange}
                      required
                      error={!!errors.age}
                      helperText={errors.age || 'Must be 18 or older'}
                      inputProps={{ min: 18, max: 100 }}
                      sx={fieldSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth required error={!!errors.location} sx={fieldSx}>
                      <InputLabel>Preferred location</InputLabel>
                      <Select
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        label="Preferred location"
                      >
                        {locationOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.location && (
                        <FormHelperText error>{errors.location}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
              </FormSection>

              <FormSection
                title="2. Skills & experience"
                description="Select all areas that apply to you."
              >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: errors.skills ? 1 : 2.5 }}>
                  {skillsOptions.map((skill) => {
                    const selected = formData.skills.includes(skill.value);
                    return (
                      <Chip
                        key={skill.value}
                        label={skill.label}
                        onClick={() => handleSkillsChange(skill.value)}
                        variant={selected ? 'filled' : 'outlined'}
                        sx={{
                          fontWeight: 500,
                          borderColor: 'var(--color-border)',
                          ...(selected && {
                            backgroundColor: 'var(--light-green)',
                            color: 'var(--primary-green)',
                            borderColor: 'var(--accent-green)'
                          }),
                          '&:hover': { borderColor: 'var(--accent-green)' }
                        }}
                      />
                    );
                  })}
                </Box>
                {errors.skills && (
                  <Typography variant="caption" color="error" sx={{ display: 'block', mb: 2 }}>
                    {errors.skills}
                  </Typography>
                )}
                <TextField
                  fullWidth
                  label="Previous volunteer experience (optional)"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  multiline
                  minRows={3}
                  helperText="Briefly describe any relevant volunteer or professional experience"
                  sx={fieldSx}
                />
              </FormSection>

              <FormSection title="3. Availability & commitment">
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth required error={!!errors.availability} sx={fieldSx}>
                      <InputLabel>Availability</InputLabel>
                      <Select
                        name="availability"
                        value={formData.availability}
                        onChange={handleChange}
                        label="Availability"
                      >
                        {availabilityOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.availability && (
                        <FormHelperText error>{errors.availability}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth required error={!!errors.commitment} sx={fieldSx}>
                      <InputLabel>Commitment level</InputLabel>
                      <Select
                        name="commitment"
                        value={formData.commitment}
                        onChange={handleChange}
                        label="Commitment level"
                      >
                        {commitmentOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.commitment && (
                        <FormHelperText error>{errors.commitment}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
              </FormSection>

              <FormSection title="4. Emergency contact">
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Contact name"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      required
                      error={!!errors.emergencyContact}
                      helperText={errors.emergencyContact}
                      sx={fieldSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Contact phone"
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleChange}
                      required
                      error={!!errors.emergencyPhone}
                      helperText={errors.emergencyPhone}
                      placeholder="1234567890"
                      sx={fieldSx}
                    />
                  </Grid>
                </Grid>
              </FormSection>

              <FormSection
                title="5. Your motivation"
                description="Help us understand why you want to volunteer with Gifted givings."
              >
                <TextField
                  fullWidth
                  label="Why do you want to volunteer?"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  multiline
                  minRows={4}
                  required
                  error={!!errors.message}
                  helperText={errors.message}
                  sx={fieldSx}
                />
              </FormSection>

              <Box sx={{ pt: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      sx={{ color: errors.agreeToTerms ? 'error.main' : 'var(--accent-green)' }}
                    />
                  }
                  label={
                    <Typography variant="body2" color={errors.agreeToTerms ? 'error' : 'var(--gray)'}>
                      I agree to the terms and confirm that all information provided is accurate.
                    </Typography>
                  }
                />
                {errors.agreeToTerms && (
                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                    {errors.agreeToTerms}
                  </Typography>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={loading || !formData.agreeToTerms}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem'
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CircularProgress size={20} color="inherit" />
                      Submitting…
                    </Box>
                  ) : (
                    'Submit application'
                  )}
                </Button>
              </Box>
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
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
