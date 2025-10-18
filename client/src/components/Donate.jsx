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
  const [selectedAmount, setSelectedAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('monthly');
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
        setPrograms(response.programs || []);
        if (response.programs && response.programs.length > 0) {
          setSelectedProgram(response.programs[0]._id);
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
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
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

        <Grid container spacing={6} justifyContent="center" alignItems="flex-start">
          {/* Program Selection and Donation Options */}
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 4, borderRadius: 3, height: 'fit-content', boxShadow: 4 }}>
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
                          onClick={() => setSelectedAmount(option.amount)}
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
                    onChange={(e) => setCustomAmount(e.target.value)}
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
            <Card sx={{ p: 4, borderRadius: 3, boxShadow: 4 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'var(--primary-green)' }}>
                Complete Your Donation
              </Typography>

              {/* Donation Summary at the top */}
              {selectedProgramData && (
                <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(0,255,140,0.07)', borderRadius: 2, border: '1px solid rgba(0,255,140,0.15)' }}>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Avatar src={getImageUrl(selectedProgramData.image)} sx={{ width: 40, height: 40 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'var(--primary-green)' }}>
                        {selectedProgramData.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {selectedProgramData.category}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    <strong>Amount:</strong> ${customAmount ? customAmount : selectedAmount}
                  </Typography>
                  {/* Impact summary */}
                  <Box mt={1}>
                    {(() => {
                      const impact = getCurrentImpact();
                      const impactItems = [];
                      if (impact.children > 0) impactItems.push(`${impact.children} children`);
                      if (impact.communities > 0) impactItems.push(`${impact.communities} communities`);
                      if (impact.schools > 0) impactItems.push(`${impact.schools} schools`);
                      if (impact.meals > 0) impactItems.push(`${impact.meals} meals`);
                      if (impact.checkups > 0) impactItems.push(`${impact.checkups} checkups`);
                      return impactItems.length > 0 ? (
                        <Typography variant="caption" sx={{ color: 'var(--primary-green)' }}>
                          Impact: {impactItems.join(', ')}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Impact will be calculated based on your donation amount
                        </Typography>
                      );
                    })()}
                  </Box>
                </Box>
              )}

              <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <CreditCard sx={{ color: '#666' }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, color: '#333' }}>
                    Credit/Debit Card Payment
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#666', mt: 1, fontSize: '0.9rem' }}>
                  Secure payment processing powered by Stripe
                </Typography>
              </Box>

              {!user && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    You're making an anonymous donation. <strong>Log in</strong> to make public donations and track your giving history.
                  </Typography>
                </Alert>
              )}

              <FormControlLabel
                control={
                  <Checkbox
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                    color="primary"
                    disabled={!user} // Disable if user is not logged in
                  />
                }
                label={user ? "Make this donation anonymous" : "Anonymous donation (login required to make public donations)"}
                sx={{ mb: 3 }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={recurring}
                    onChange={(e) => setRecurring(e.target.checked)}
                    color="primary"
                  />
                }
                label="Make this a recurring donation"
                sx={{ mb: 2 }}
              />

              {recurring && (
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Frequency</InputLabel>
                  <Select
                    value={recurringFrequency}
                    onChange={(e) => setRecurringFrequency(e.target.value)}
                    label="Frequency"
                  >
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                  </Select>
                </FormControl>
              )}

              <TextField
                fullWidth
                label="Message (optional)"
                multiline
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share why you're making this donation..."
                sx={{ mb: 4 }}
              />

              <Box sx={{ mt: 3 }}>
                <StripePayment
                  amount={customAmount ? parseFloat(customAmount) : selectedAmount}
                  currency="usd"
                  onSuccess={handleStripeSuccess}
                  onError={handleStripeError}
                  donationData={{
                    programId: selectedProgram,
                    anonymous: user ? (anonymous || false) : true, // Force anonymous if not logged in
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