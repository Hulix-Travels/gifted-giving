import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
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
  Divider,
  Paper,
  IconButton,
  InputAdornment,
  FormHelperText,
  CircularProgress
} from '@mui/material';
import {
  Favorite,
  School,
  LocalHospital,
  Restaurant,
  Construction,
  Payment,
  CreditCard,
  AccountBalance,
  Receipt,
  TrendingUp,
  People,
  Star
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { donationsAPI, programsAPI } from '../services/api';
import StripePayment from './StripePayment';
import useLiveStats from '../hooks/useLiveStats';
import formatShortNumber from '../utils/formatShortNumber';

const paymentMethods = [
  { value: 'stripe', label: 'Credit/Debit Card', icon: 'credit_card' }
];

export default function Donate() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('stripe');
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
  const [loading, setLoading] = useState(false);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [_showStripePayment, setShowStripePayment] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { stats: liveStats, loading: statsLoading } = useLiveStats();

  // Fetch programs on component mount
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setProgramsLoading(true);
        const response = await programsAPI.getAll({ status: 'active' });
        const programsList = response.programs || [];
        setPrograms(programsList);
        
        // Check if there's a program ID stored in sessionStorage (from support button)
        const storedProgramId = sessionStorage.getItem('selectedProgramId');
        
        if (storedProgramId && programsList.some(p => p._id === storedProgramId)) {
          // Program exists, select it
          setSelectedProgram(storedProgramId);
          // Clear the stored ID so it doesn't persist on page reload
          sessionStorage.removeItem('selectedProgramId');
        } else if (programsList.length > 0) {
          // No stored program, select first program
          setSelectedProgram(programsList[0]._id);
        }
      } catch (error) {
        setSnackbar({ 
          open: true, 
          message: 'Failed to load programs. Please refresh the page.', 
          severity: 'error' 
        });
      } finally {
        setProgramsLoading(false);
      }
    };

    fetchPrograms();
  }, []);

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

  const renderCategoryIcon = (category) => {
    switch (category) {
      case 'education':
        return <School />;
      case 'health':
        return <LocalHospital />;
      case 'nutrition':
        return <Restaurant />;
      default:
        return <School />;
    }
  };

  const renderPaymentIcon = (iconType) => {
    switch (iconType) {
      case 'credit_card':
        return <CreditCard />;
      case 'payment':
        return <Payment />;
      case 'account_balance':
        return <AccountBalance />;
      default:
        return <CreditCard />;
    }
  };

  const renderImpactIcon = (iconType) => {
    switch (iconType) {
      case 'people':
        return <People />;
      case 'trending_up':
        return <TrendingUp />;
      case 'star':
        return <Star />;
      case 'receipt':
        return <Receipt />;
      default:
        return <People />;
    }
  };

  const renderButtonIcon = () => {
    return loading ? <CircularProgress size={20} /> : <Favorite />;
  };

  const handleDonation = async () => {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
    
    if (!amount || amount < 1) {
      setSnackbar({ open: true, message: 'Please enter a valid amount', severity: 'error' });
      return;
    }

    if (!selectedProgram) {
      setSnackbar({ open: true, message: 'Please select a program', severity: 'error' });
      return;
    }

    // Check if recurring is selected but user is not logged in
    if (recurring && !user) {
      setSnackbar({ 
        open: true, 
        message: 'Please log in to set up recurring donations', 
        severity: 'warning' 
      });
      return;
    }

    // Always use Stripe for card payments
    setShowStripePayment(true);
  };

  const handleStripeSuccess = (_paymentResult) => {
    setShowStripePayment(false);
    setSnackbar({ 
      open: true, 
      message: 'Payment successful! Thank you for your donation.', 
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
    setShowStripePayment(false);
    setSnackbar({ 
      open: true, 
      message: error || 'Payment failed. Please try again.', 
      severity: 'error' 
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };


  const selectedProgramData = programs.find(p => p._id === selectedProgram);
  const donationOptions = getDonationOptions();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const getImageUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('/uploads/')) {
      const base = API_BASE_URL.replace(/\/api$/, '');
      return base + img;
    }
    return img;
  };

  return (
    <Box id="donate" sx={{ py: { xs: 8, md: 12 }, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box textAlign="center" sx={{ mb: 8 }}>
          <Typography variant="h3" component="h2" sx={{ 
            mb: 3, 
            fontWeight: 700, 
            color: 'var(--primary-green)',
            fontSize: { xs: '2rem', md: '2.5rem' }
          }}>
            Make a Difference Today
          </Typography>
          
          <Typography variant="body1" sx={{ 
            mb: 4, 
            maxWidth: 800, 
            mx: 'auto',
            fontSize: '1.1rem',
            lineHeight: 1.7,
            color: '#666'
          }}>
            Your donation provides immediate help to children in need. 100% of funds go directly to programs, 
            with complete transparency about how every dollar is spent.
          </Typography>

          {/* Impact Stats */}
          {statsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress size={40} sx={{ color: 'var(--primary-green)' }} />
            </Box>
          ) : (
            <Grid container spacing={3} justifyContent="center" sx={{ mb: 6 }}>
              {[
                { number: liveStats ? formatShortNumber(liveStats.childrenHelped) : '—', label: 'Children Helped', icon: 'people' },
                { number: liveStats ? `$${formatShortNumber(liveStats.funds)}` : '—', label: 'Funds Raised', icon: 'trending_up' },
                { number: liveStats ? formatShortNumber(liveStats.communities) : '—', label: 'Communities', icon: 'star' },
                { number: '100%', label: 'Transparency', icon: 'receipt' }
              ].map((stat, index) => (
                <Grid xs={6} md={3} key={index}>
                  <Paper elevation={2} sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <Box sx={{ color: 'var(--primary-green)', mb: 1 }}>
                      {renderImpactIcon(stat.icon)}
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--primary-green)', mb: 1 }}>
                      {stat.number}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {stat.label}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        <Grid container spacing={6} justifyContent="center" alignItems="stretch">
          {/* Program Selection and Donation Options */}
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 4, borderRadius: 3, height: '100%', boxShadow: 4, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'var(--primary-green)' }}>
                Choose Your Program
              </Typography>

              {programsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <FormControl fullWidth sx={{ mb: 4 }}>
                    <InputLabel>Select Program</InputLabel>
                    <Select
                      value={selectedProgram}
                      onChange={(e) => setSelectedProgram(e.target.value)}
                      label="Select Program"
                    >
                      {programs.map((program) => (
                        <MenuItem key={program._id} value={program._id}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar 
                              src={getImageUrl(program.image)} 
                              sx={{ width: 32, height: 32 }}
                            />
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {program.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {program.category}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {selectedProgramData && (
                    <Box sx={{ mb: 4, p: 3, bgcolor: 'rgba(0,255,140,0.05)', borderRadius: 2 }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        {selectedProgramData.name}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        {selectedProgramData.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {(selectedProgramData.impactMetrics?.childrenHelped > 0 || 
                          selectedProgramData.impactMetrics?.communitiesReached > 0 || 
                          selectedProgramData.impactMetrics?.schoolsBuilt > 0 || 
                          selectedProgramData.impactMetrics?.mealsProvided > 0 || 
                          selectedProgramData.impactMetrics?.medicalCheckups > 0) && (
                          <Chip 
                            label={`${selectedProgramData.impactMetrics?.childrenHelped || 0}+ Children Helped`}
                            size="small"
                            sx={{ bgcolor: 'var(--light-green)', color: 'var(--primary-green)' }}
                          />
                        )}
                        <Chip 
                          label={`${Math.round((selectedProgramData.currentAmount / selectedProgramData.targetAmount) * 100)}% Funded`}
                          size="small"
                          sx={{ bgcolor: 'var(--accent-green)', color: 'var(--primary-green)' }}
                        />
                      </Box>
                    </Box>
                  )}

                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: 'var(--primary-green)' }}>
                    Choose Your Impact
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 4 }}>
                    {donationOptions.map((option, index) => (
                      <Grid xs={6} key={index}>
                        <Card 
                          onClick={() => {
                            setSelectedAmount(option.amount);
                            setCustomAmount(''); // Clear custom amount when selecting preset
                          }}
                          sx={{ 
                            cursor: 'pointer',
                            textAlign: 'center',
                            p: 2,
                            border: selectedAmount === option.amount ? '2px solid var(--primary-green)' : '2px solid #f5f5f5',
                            bgcolor: selectedAmount === option.amount ? 'rgba(0, 255, 140, 0.1)' : '#fff',
                            '&:hover': { 
                              borderColor: 'var(--primary-green)',
                              transform: 'translateY(-2px)'
                            },
                            transition: 'all 0.3s ease',
                            borderRadius: 2
                          }}
                        >
                          <Box sx={{ color: 'var(--primary-green)', mb: 1 }}>
                            {renderCategoryIcon(option.category)}
                          </Box>
                          <Typography variant="h5" sx={{ 
                            fontWeight: 700, 
                            color: 'var(--primary-green)',
                            mb: 1
                          }}>
                            ${option.amount}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                            {option.description}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#888', fontSize: '0.75rem' }}>
                            {option.impact}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  <TextField
                    fullWidth
                    label="Or enter custom amount"
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      if (e.target.value) {
                        setSelectedAmount(null); // Clear preset selection when entering custom amount
                      }
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    sx={{ mb: 3 }}
                  />
                  
                  {/* Impact Display */}
                  {selectedProgram && (
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(0, 255, 140, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 255, 140, 0.2)' }}>
                      <Typography variant="h6" sx={{ mb: 2, color: 'var(--primary-green)', fontWeight: 600 }}>
                        Your Impact
                      </Typography>
                      <Grid container spacing={1}>
                        {(() => {
                          const impact = getCurrentImpact();
                          const impactItems = [];
                          
                          if (impact.children > 0) {
                            impactItems.push(
                              <Grid item xs={6} key="children">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{ color: '#4CAF50', fontSize: '1.2rem' }}>👶</Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {impact.children} children
                                  </Typography>
                                </Box>
                              </Grid>
                            );
                          }
                          
                          if (impact.communities > 0) {
                            impactItems.push(
                              <Grid item xs={6} key="communities">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{ color: '#2196F3', fontSize: '1.2rem' }}>🏘️</Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {impact.communities} communities
                                  </Typography>
                                </Box>
                              </Grid>
                            );
                          }
                          
                          if (impact.schools > 0) {
                            impactItems.push(
                              <Grid item xs={6} key="schools">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{ color: '#FF9800', fontSize: '1.2rem' }}>🏫</Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {impact.schools} schools
                                  </Typography>
                                </Box>
                              </Grid>
                            );
                          }
                          
                          if (impact.meals > 0) {
                            impactItems.push(
                              <Grid item xs={6} key="meals">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{ color: '#FF5722', fontSize: '1.2rem' }}>🍽️</Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {impact.meals} meals
                                  </Typography>
                                </Box>
                              </Grid>
                            );
                          }
                          
                          if (impact.checkups > 0) {
                            impactItems.push(
                              <Grid item xs={6} key="checkups">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{ color: '#9C27B0', fontSize: '1.2rem' }}>🏥</Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {impact.checkups} checkups
                                  </Typography>
                                </Box>
                              </Grid>
                            );
                          }
                          
                          return impactItems.length > 0 ? impactItems : (
                            <Grid item xs={12}>
                              <Typography variant="body2" color="text.secondary">
                                Impact will be calculated based on your donation amount
                              </Typography>
                            </Grid>
                          );
                        })()}
                      </Grid>
                    </Box>
                  )}
                </>
              )}
            </Card>
          </Grid>

          {/* Donation Form */}
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 4, borderRadius: 3, boxShadow: 4, position: 'sticky', top: 100, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, color: 'var(--primary-green)', fontSize: '1.75rem' }}>
                Complete Your Donation
              </Typography>

              {/* Enhanced Donation Summary */}
              {selectedProgramData && (
                <Box sx={{ 
                  mb: 4, 
                  p: 3, 
                  background: 'linear-gradient(135deg, rgba(0,255,140,0.1) 0%, rgba(0,255,140,0.05) 100%)',
                  borderRadius: 3, 
                  border: '2px solid rgba(0,255,140,0.2)',
                  boxShadow: '0 4px 12px rgba(0,255,140,0.1)'
                }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar 
                      src={getImageUrl(selectedProgramData.image)} 
                      sx={{ width: 50, height: 50, border: '2px solid var(--primary-green)' }} 
                    />
                    <Box flex={1}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--primary-green)', mb: 0.5 }}>
                        {selectedProgramData.name}
                      </Typography>
                      <Chip 
                        label={selectedProgramData.category}
                        size="small"
                        sx={{ 
                          bgcolor: 'var(--primary-green)', 
                          color: 'white',
                          fontWeight: 500,
                          textTransform: 'capitalize'
                        }}
                      />
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  {(customAmount || selectedAmount) && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#666' }}>
                        Donation Amount:
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--primary-green)' }}>
                        ${customAmount ? parseFloat(customAmount).toFixed(2) : selectedAmount.toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                  {!customAmount && !selectedAmount && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        Please select or enter a donation amount above
                      </Typography>
                    </Alert>
                  )}
                  
                  {/* Impact summary */}
                  <Box sx={{ 
                    mt: 2, 
                    p: 2, 
                    bgcolor: 'rgba(255,255,255,0.7)', 
                    borderRadius: 2,
                    border: '1px solid rgba(0,255,140,0.2)'
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--primary-green)', mb: 1.5 }}>
                      Your Impact:
                    </Typography>
                    {(() => {
                      const impact = getCurrentImpact();
                      const impactItems = [];
                      if (impact.children > 0) impactItems.push({ icon: '👶', text: `${impact.children} children`, color: '#4CAF50' });
                      if (impact.communities > 0) impactItems.push({ icon: '🏘️', text: `${impact.communities} communities`, color: '#2196F3' });
                      if (impact.schools > 0) impactItems.push({ icon: '🏫', text: `${impact.schools} schools`, color: '#FF9800' });
                      if (impact.meals > 0) impactItems.push({ icon: '🍽️', text: `${impact.meals} meals`, color: '#FF5722' });
                      if (impact.checkups > 0) impactItems.push({ icon: '🏥', text: `${impact.checkups} checkups`, color: '#9C27B0' });
                      return impactItems.length > 0 ? (
                        <Grid container spacing={1}>
                          {impactItems.map((item, idx) => (
                            <Grid item xs={6} key={idx}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" sx={{ fontSize: '1.1rem' }}>{item.icon}</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: item.color, fontSize: '0.9rem' }}>
                                  {item.text}
                                </Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          Impact will be calculated based on your donation amount
                        </Typography>
                      );
                    })()}
                  </Box>
                </Box>
              )}

              {/* Payment Method Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'var(--primary-green)', mb: 2 }}>
                  Payment Method
                </Typography>
                <Box sx={{ 
                  p: 2.5, 
                  bgcolor: '#f8f9fa', 
                  borderRadius: 2, 
                  border: '2px solid #e9ecef',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <Box sx={{ 
                    p: 1.5, 
                    bgcolor: 'white', 
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CreditCard sx={{ color: 'var(--primary-green)', fontSize: 32 }} />
                  </Box>
                  <Box flex={1}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#333', mb: 0.5 }}>
                      Credit/Debit Card
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem' }}>
                      Secure payment powered by Stripe • SSL Encrypted
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Donation Preferences */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'var(--primary-green)', mb: 2 }}>
                  Donation Preferences
                </Typography>
                
                {!user && (
                  <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                      You're making an anonymous donation. <strong>Log in</strong> to make public donations and track your giving history.
                    </Typography>
                  </Alert>
                )}

                <Box sx={{ 
                  p: 2.5, 
                  bgcolor: '#fafbfc', 
                  borderRadius: 2, 
                  border: '1px solid #e9ecef'
                }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={anonymous}
                        onChange={(e) => setAnonymous(e.target.checked)}
                        color="primary"
                        disabled={!user}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                          Make this donation anonymous
                        </Typography>
                        {!user && (
                          <Typography variant="caption" sx={{ color: '#666', display: 'block', mt: 0.5 }}>
                            Login required to make public donations
                          </Typography>
                        )}
                      </Box>
                    }
                    sx={{ mb: 2.5, width: '100%', alignItems: 'flex-start' }}
                  />
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={recurring}
                        onChange={(e) => setRecurring(e.target.checked)}
                        color="primary"
                        disabled={!user}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                          Make this a recurring donation
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666', display: 'block', mt: 0.5 }}>
                          {user 
                            ? 'Help sustain our programs with regular giving'
                            : 'Login required to set up recurring donations'}
                        </Typography>
                      </Box>
                    }
                    sx={{ mb: recurring ? 2 : 0, width: '100%', alignItems: 'flex-start' }}
                  />
                  
                  {!user && (
                    <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                        <strong>Recurring donations require an account.</strong> Please log in or register to set up automatic recurring donations and manage them from your dashboard.
                      </Typography>
                    </Alert>
                  )}

                  {recurring && (
                    <FormControl fullWidth sx={{ mt: 2 }}>
                      <InputLabel sx={{ fontWeight: 500 }}>Recurring Frequency</InputLabel>
                      <Select
                        value={recurringFrequency}
                        onChange={(e) => setRecurringFrequency(e.target.value)}
                        label="Recurring Frequency"
                        sx={{ bgcolor: 'white' }}
                      >
                        <MenuItem value="daily">
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>Daily</Typography>
                            <Typography variant="caption" sx={{ color: '#666' }}>Every day</Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem value="weekly">
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>Weekly</Typography>
                            <Typography variant="caption" sx={{ color: '#666' }}>Every week</Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem value="monthly">
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>Monthly</Typography>
                            <Typography variant="caption" sx={{ color: '#666' }}>Every month</Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem value="quarterly">
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>Quarterly</Typography>
                            <Typography variant="caption" sx={{ color: '#666' }}>Every 3 months</Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem value="yearly">
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>Yearly</Typography>
                            <Typography variant="caption" sx={{ color: '#666' }}>Once per year</Typography>
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  )}
                </Box>
              </Box>

              {/* Optional Message */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'var(--primary-green)', mb: 2 }}>
                  Personal Message <Typography component="span" variant="caption" sx={{ color: '#999', fontWeight: 400 }}>(Optional)</Typography>
                </Typography>
                <TextField
                  fullWidth
                  label="Share your message"
                  multiline
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us why you're making this donation... Your words inspire others!"
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'white',
                      '&:hover fieldset': {
                        borderColor: 'var(--primary-green)',
                      },
                    }
                  }}
                  helperText="Your message may be shared to inspire others (anonymous donations won't show your name)"
                />
              </Box>

              {/* Payment Button Section */}
              {(customAmount || selectedAmount) && (
                <Box sx={{ 
                  mt: 4, 
                  p: 3, 
                  bgcolor: '#f8f9fa', 
                  borderRadius: 2,
                  border: '2px solid #e9ecef'
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666', mb: 2, textAlign: 'center' }}>
                    Ready to make a difference?
                  </Typography>
                  <StripePayment
                    amount={customAmount ? parseFloat(customAmount) : (selectedAmount || 0)}
                  currency="usd"
                  onSuccess={handleStripeSuccess}
                  onError={handleStripeError}
                  donationData={{
                    programId: selectedProgram,
                    anonymous: user ? (anonymous || false) : true,
                    message: message || '',
                    recurring: {
                      isRecurring: recurring || false,
                      frequency: recurringFrequency || 'monthly'
                    },
                    donorName: user && user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Anonymous Donor',
                    email: user && user.email ? user.email : ''
                  }}
                />
                </Box>
              )}
              {!customAmount && !selectedAmount && (
                <Alert severity="info" sx={{ mt: 4 }}>
                  <Typography variant="body2">
                    Please select or enter a donation amount to proceed with payment
                  </Typography>
                </Alert>
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