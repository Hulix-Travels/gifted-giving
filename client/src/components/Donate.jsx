import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Snackbar,
  Chip,
  Avatar,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { programsAPI } from '../services/api';
import StripePayment from './StripePayment';
import ApiErrorState from './ApiErrorState';
import { getUploadUrl } from '../config/api';
import { sectionWhite, siteCard, fieldSx } from '../theme/styles';
import ImpactMetricsList from './ui/ImpactMetricsList';
import SectionHeader from './ui/SectionHeader';
import FormSection from './ui/FormSection';

const DONATION_MESSAGE_MAX_LENGTH = 500;

export default function Donate() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('monthly');
  
  // Reset recurring if user logs out
  useEffect(() => {
    if (!user && recurring) {
      setRecurring(false);
    }
  }, [user, recurring]);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [programsError, setProgramsError] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchPrograms = useCallback(async () => {
    try {
      setProgramsLoading(true);
      setProgramsError(false);
      const response = await programsAPI.getAll({ status: 'active' });
      const programsList = response.programs || [];
      setPrograms(programsList);

      const storedProgramId = sessionStorage.getItem('selectedProgramId');

      if (storedProgramId && programsList.some(p => p._id === storedProgramId)) {
        setSelectedProgram(storedProgramId);
        sessionStorage.removeItem('selectedProgramId');
      } else if (programsList.length > 0) {
        setSelectedProgram(programsList[0]._id);
      }
    } catch {
      setProgramsError(true);
    } finally {
      setProgramsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  // Listen for program selection events from other components
  useEffect(() => {
    const handleProgramSelect = (event) => {
      const programId = event.detail?.programId || sessionStorage.getItem('selectedProgramId');
      
      if (!programId) return;
      
      // Check if programs are loaded and the program exists
      if (programs.length > 0) {
        const programExists = programs.some(p => p._id === programId);
        if (programExists) {
          setSelectedProgram(programId);
          // Clear the stored ID after selecting
          sessionStorage.removeItem('selectedProgramId');
        }
      }
    };

    // Listen for the custom event
    window.addEventListener('program-selected', handleProgramSelect);
    
    // Also check sessionStorage when programs load
    if (programs.length > 0) {
      const storedProgramId = sessionStorage.getItem('selectedProgramId');
      if (storedProgramId) {
        handleProgramSelect({ detail: { programId: storedProgramId } });
      }
    }

    return () => {
      window.removeEventListener('program-selected', handleProgramSelect);
    };
  }, [programs]);

  // Get donation options based on selected program
  const getDonationOptions = () => {
    if (!selectedProgram) return [];
    
    const program = programs.find(p => p._id === selectedProgram);
    if (!program || !program.donationOptions) return [];

    return program.donationOptions.map(option => ({
      amount: option.amount,
      description: option.description,
      impact: option.impact,
      category: program.category
    }));
  };

  // Calculate impact based on donation amount
  const calculateImpact = (amount) => {
    if (!selectedProgram || !amount) return {};
    
    const program = programs.find(p => p._id === selectedProgram);
    if (!program || !program.impactPerDollar) return {};
    
    const impact = program.impactPerDollar;
    return {
      children: Math.floor(amount * (impact.children || 0)),
      communities: Math.floor(amount * (impact.communities || 0)),
      schools: Math.floor(amount * (impact.schools || 0)),
      meals: Math.floor(amount * (impact.meals || 0)),
      checkups: Math.floor(amount * (impact.checkups || 0))
    };
  };

  // Get current impact for display
  const getCurrentImpact = () => {
    const amount = customAmount ? parseFloat(customAmount) : (selectedAmount || 0);
    if (!amount || amount === 0) return {};
    return calculateImpact(amount);
  };

  const handleStripeSuccess = (_paymentResult) => {
    setSnackbar({ 
      open: true, 
      message: 'Thank you! Your donation was successful.', 
      severity: 'success' 
    });
    
    // Refetch programs after donation (webhook will handle metrics update)
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new Event('programs:refresh'));
    }

    // Reset form
    setCustomAmount('');
    setMessage('');
    setAnonymous(false);
    setRecurring(false);
  };

  const handleStripeError = (error) => {
    setSnackbar({ 
      open: true, 
      message: error || 'Your donation could not be processed. Please try again.', 
      severity: 'error' 
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };


  const selectedProgramData = programs.find(p => p._id === selectedProgram);
  const donationOptions = getDonationOptions();
  const donationAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
  const hasValidAmount =
    donationAmount && !Number.isNaN(donationAmount) && donationAmount >= 0.5;

  const formatAmount = (value) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  return (
    <Box id="donate" sx={sectionWhite}>
      <Container maxWidth="lg">
        <SectionHeader
          title="Give today"
          subtitle="Over 90% of every gift goes directly to programs. Choose a cause, pick an amount, and checkout securely."
        />

        <Grid container spacing={4} alignItems="flex-start">
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ ...siteCard, p: { xs: 3, md: 4 }, boxShadow: 'var(--shadow-sm)' }}>
              <FormSection title="1. Program & amount" last>
                {programsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress sx={{ color: 'var(--accent-green)' }} />
                  </Box>
                ) : programsError ? (
                  <ApiErrorState
                    title="Programs unavailable"
                    message="We couldn't load donation programs. Please try again."
                    onRetry={fetchPrograms}
                    compact
                  />
                ) : (
                  <>
                    <FormControl fullWidth sx={{ ...fieldSx, mb: 2.5 }}>
                      <InputLabel>Program</InputLabel>
                      <Select
                        value={selectedProgram}
                        onChange={(e) => setSelectedProgram(e.target.value)}
                        label="Program"
                      >
                        {programs.map((program) => (
                          <MenuItem key={program._id} value={program._id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar src={getUploadUrl(program.image)} sx={{ width: 28, height: 28 }} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {program.name}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {selectedProgramData && (
                      <Box
                        sx={{
                          mb: 3,
                          p: 2,
                          backgroundColor: 'var(--light-green)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-border)'
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--primary-green)', mb: 0.5 }}>
                          {selectedProgramData.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--gray)', display: 'block', mb: 1.5, lineHeight: 1.5 }}>
                          {selectedProgramData.description}
                        </Typography>
                        <Chip
                          label={`${Math.round((selectedProgramData.currentAmount / selectedProgramData.targetAmount) * 100)}% funded`}
                          size="small"
                          sx={{ bgcolor: 'var(--white)', color: 'var(--primary-green)', fontWeight: 600 }}
                        />
                      </Box>
                    )}

                    {donationOptions.length > 0 && (
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--primary-green)', mb: 1.5 }}>
                        Select an amount
                      </Typography>
                    )}
                    <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                      {donationOptions.map((option, index) => (
                        <Grid size={6} key={index}>
                          <Box
                            onClick={() => {
                              setSelectedAmount(option.amount);
                              setCustomAmount('');
                            }}
                            sx={{
                              cursor: 'pointer',
                              textAlign: 'center',
                              p: 1.5,
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid',
                              borderColor:
                                selectedAmount === option.amount ? 'var(--accent-green)' : 'var(--color-border)',
                              backgroundColor:
                                selectedAmount === option.amount ? 'var(--light-green)' : 'var(--white)',
                              '&:hover': { borderColor: 'var(--accent-green)' }
                            }}
                          >
                            <Typography sx={{ fontWeight: 700, color: 'var(--primary-green)', mb: 0.5 }}>
                              ${option.amount}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'var(--gray)', lineHeight: 1.4, display: 'block' }}>
                              {option.description}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>

                    <TextField
                      fullWidth
                      label="Custom amount"
                      type="number"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        if (e.target.value) setSelectedAmount(null);
                      }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>
                      }}
                      sx={{ ...fieldSx, mb: 2.5 }}
                    />

                    {selectedProgram && (
                      <Box
                        sx={{
                          p: 2,
                          backgroundColor: 'var(--cream)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-border)'
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--primary-green)', mb: 1 }}>
                          Estimated impact
                        </Typography>
                        <ImpactMetricsList impact={getCurrentImpact()} />
                      </Box>
                    )}
                  </>
                )}
              </FormSection>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <Card
              sx={{
                ...siteCard,
                p: { xs: 3, md: 4 },
                boxShadow: 'var(--shadow-sm)',
                position: { lg: 'sticky' },
                top: { lg: 96 }
              }}
            >
              {!hasValidAmount ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 600,
                      color: 'var(--primary-green)',
                      mb: 1
                    }}
                  >
                    2. Checkout
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--gray)', mb: 0.5 }}>
                    Choose a program and amount first.
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'var(--gray)' }}>
                    Your donation summary and payment form will appear here.
                  </Typography>
                </Box>
              ) : (
                <>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 600,
                      color: 'var(--primary-green)',
                      mb: 2,
                      fontSize: '1.0625rem'
                    }}
                  >
                    2. Checkout
                  </Typography>
                  <FormSection
                    title="Donation summary"
                    description="Review what you chose in step 1 before you donate."
                  >
                    <Box
                      sx={{
                        p: 2,
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--cream)'
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: 2,
                          mb: 1.5
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--primary-green)' }}>
                            {selectedProgramData?.name || 'Selected program'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'var(--gray)', display: 'block', mt: 0.25 }}>
                            {recurring
                              ? `Recurring · ${recurringFrequency}`
                              : 'One-time gift'}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            fontFamily: 'var(--font-heading)',
                            fontWeight: 600,
                            color: 'var(--primary-green)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {formatAmount(donationAmount)}
                        </Typography>
                      </Box>
                      {user && (
                        <Typography variant="caption" sx={{ color: 'var(--gray)', display: 'block', mb: 1.5 }}>
                          Giving as {user.firstName} {user.lastName}
                          {anonymous ? ' · shown as anonymous' : ''}
                        </Typography>
                      )}
                      <Box
                        sx={{
                          pt: 1.5,
                          borderTop: '1px solid var(--color-border)'
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'var(--primary-green)', display: 'block', mb: 1 }}>
                          Estimated impact
                        </Typography>
                        <ImpactMetricsList impact={getCurrentImpact()} />
                      </Box>
                    </Box>
                  </FormSection>

                  <FormSection title="Preferences">
                    {!user && (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Guest checkout is anonymous. Log in for public donations or recurring giving.
                      </Alert>
                    )}
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={anonymous}
                          onChange={(e) => setAnonymous(e.target.checked)}
                          disabled={!user}
                        />
                      }
                      label={<Typography variant="body2">Anonymous donation</Typography>}
                      sx={{ display: 'flex', mb: 1 }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={recurring}
                          onChange={(e) => setRecurring(e.target.checked)}
                          disabled={!user}
                        />
                      }
                      label={<Typography variant="body2">Recurring donation</Typography>}
                      sx={{ display: 'flex', mb: recurring ? 2 : 0 }}
                    />
                    {recurring && (
                      <FormControl fullWidth sx={{ ...fieldSx, mb: 2 }}>
                        <InputLabel>Frequency</InputLabel>
                        <Select
                          value={recurringFrequency}
                          onChange={(e) => setRecurringFrequency(e.target.value)}
                          label="Frequency"
                        >
                          {['daily', 'weekly', 'monthly', 'quarterly', 'yearly'].map((freq) => (
                            <MenuItem key={freq} value={freq} sx={{ textTransform: 'capitalize' }}>
                              {freq}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                    <TextField
                      fullWidth
                      label="Message (optional)"
                      multiline
                      minRows={2}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      inputProps={{ maxLength: DONATION_MESSAGE_MAX_LENGTH }}
                      helperText={`${message.length}/${DONATION_MESSAGE_MAX_LENGTH}`}
                      FormHelperTextProps={{ sx: { textAlign: 'right', mx: 0 } }}
                      sx={fieldSx}
                    />
                  </FormSection>

                  <FormSection title="Complete donation" last>
                    <StripePayment
                      amount={donationAmount}
                      currency="usd"
                      onSuccess={handleStripeSuccess}
                      onError={handleStripeError}
                      donationData={{
                        programId: selectedProgram,
                        anonymous: user ? anonymous : true,
                        message: message || '',
                        recurring: {
                          isRecurring: recurring,
                          frequency: recurringFrequency
                        },
                        isLoggedIn: Boolean(user),
                        donorName:
                          user?.firstName && user?.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : '',
                        email: user?.email || '',
                        phone: user?.phone || ''
                      }}
                    />
                  </FormSection>
                </>
              )}
            </Card>
          </Grid>
        </Grid>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
} 