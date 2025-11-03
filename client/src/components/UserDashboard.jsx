import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, CircularProgress, Button, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Avatar, Chip, LinearProgress, Paper, IconButton, Tooltip, Container, Alert, Snackbar, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Favorite, School, People, TrendingUp, Star, Person, Email, Phone, LocationOn, MonetizationOn, Edit, Share, Download, CalendarToday, AttachMoney, Timeline, EmojiEvents, Public, LocalHospital, Restaurant, Construction, Cancel, Autorenew, Refresh } from '@mui/icons-material';
import { authAPI, donationsAPI, volunteersAPI, stripeAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function UserDashboard() {
  const { user: contextUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [donations, setDonations] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [volunteerApps, setVolunteerApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editProfile, setEditProfile] = useState({});
  const [saving, setSaving] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [modifyForm, setModifyForm] = useState({ amount: '', frequency: '' });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Use context user if available, otherwise fetch from API
        let profileData;
        if (contextUser) {
          // Use context user as base, but fetch fresh data for complete profile
          try {
            profileData = await authAPI.getProfile();
            setProfile(profileData.user || profileData);
          } catch (profileErr) {
            // If API call fails, use context user as fallback
            console.warn('Failed to fetch profile from API, using context user:', profileErr);
            setProfile(contextUser);
          }
        } else {
          // No context user, try to fetch from API
          profileData = await authAPI.getProfile();
          setProfile(profileData.user || profileData);
        }

        // Fetch donations and subscriptions
        try {
          const donationsData = await donationsAPI.getUserDonations({ limit: 100 });
          setDonations(donationsData.donations || []);
        } catch (donationsErr) {
          console.error('Failed to fetch donations:', donationsErr);
          setDonations([]);
        }

        try {
          const subscriptionsData = await stripeAPI.getAllSubscriptions();
          setSubscriptions(subscriptionsData.subscriptions || []);
        } catch (subscriptionsErr) {
          // Silently fail - subscriptions are optional, route might not exist yet
          console.warn('Subscriptions not available:', subscriptionsErr.message);
          setSubscriptions([]);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        // If we have context user, use it as fallback
        if (contextUser) {
          setProfile(contextUser);
          setError(null);
        } else {
          setError(err.message || 'Failed to load dashboard. Please try logging in again.');
          setProfile(null);
        }
      } finally {
        setLoading(false);
      }
    }
    
    if (contextUser) {
      fetchData();
    } else {
      // Wait a bit for AuthContext to load, then fetch
      const timer = setTimeout(() => {
        fetchData();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [contextUser]);

  // Use context user if profile is not loaded yet (define early)
  const displayProfile = profile || contextUser;

  // Impact summary calculations
  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
  const programsSupported = new Set(donations.map(d => d.program?.name)).size;
  // Example: 1 child helped per $25 donated, 1 community per $500
  const childrenHelped = Math.floor(totalDonated / 25);
  const communitiesSupported = Math.floor(totalDonated / 500);

  // Profile editing handlers
  const handleEditOpen = () => {
    if (displayProfile) {
      setEditProfile({ ...displayProfile });
      setEditOpen(true);
    }
  };
  const handleEditClose = () => setEditOpen(false);
  const handleEditChange = (e) => {
    setEditProfile({ ...editProfile, [e.target.name]: e.target.value });
  };
  const handleEditSave = async () => {
    setSaving(true);
    try {
      await authAPI.updateProfile(editProfile);
      setProfile(editProfile);
      setEditOpen(false);
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Avatar initials
  const getInitials = (firstName, lastName) => {
    if (!firstName && !lastName) return '?';
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    return (firstName || lastName)[0].toUpperCase();
  };

  const navigate = useNavigate();

  // Handler for Donate Again button
  const handleDonateAgain = () => {
    navigate('/');
    setTimeout(() => {
      const el = document.getElementById('donate');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  // Subscription management handlers
  const handleCancelSubscription = async (subscriptionId, cancelImmediately = false) => {
    try {
      setSubscriptionsLoading(true);
      await stripeAPI.cancelSubscription(subscriptionId, cancelImmediately);
      setSnackbar({
        open: true,
        message: cancelImmediately ? 'Subscription canceled successfully' : 'Subscription will be canceled at the end of the billing period',
        severity: 'success'
      });
      setCancelDialogOpen(false);
      setSelectedSubscription(null);
      // Refresh subscriptions
      const subscriptionsData = await stripeAPI.getAllSubscriptions();
      setSubscriptions(subscriptionsData.subscriptions || []);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to cancel subscription',
        severity: 'error'
      });
    } finally {
      setSubscriptionsLoading(false);
    }
  };

  const handleModifySubscription = async (subscriptionId, amount, frequency) => {
    try {
      setSubscriptionsLoading(true);
      await stripeAPI.modifySubscription(subscriptionId, { amount, frequency });
      setSnackbar({
        open: true,
        message: 'Subscription modified successfully',
        severity: 'success'
      });
      setModifyDialogOpen(false);
      setSelectedSubscription(null);
      // Refresh subscriptions
      const subscriptionsData = await stripeAPI.getAllSubscriptions();
      setSubscriptions(subscriptionsData.subscriptions || []);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to modify subscription',
        severity: 'error'
      });
    } finally {
      setSubscriptionsLoading(false);
    }
  };

  const handleReactivateSubscription = async (subscriptionId) => {
    try {
      setSubscriptionsLoading(true);
      await stripeAPI.reactivateSubscription(subscriptionId);
      setSnackbar({
        open: true,
        message: 'Subscription reactivated successfully',
        severity: 'success'
      });
      // Refresh subscriptions
      const subscriptionsData = await stripeAPI.getAllSubscriptions();
      setSubscriptions(subscriptionsData.subscriptions || []);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to reactivate subscription',
        severity: 'error'
      });
    } finally {
      setSubscriptionsLoading(false);
    }
  };

  const formatFrequency = (frequency) => {
    const freqMap = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly'
    };
    return freqMap[frequency] || frequency;
  };


  if (loading) return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: '#fafafa'
    }}>
      <CircularProgress size={60} sx={{ mb: 2 }} />
      <Typography variant="h6" sx={{ color: '#666' }}>Loading your dashboard...</Typography>
    </Box>
  );
  
  if (error && !displayProfile) return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: '#fafafa',
      p: 3
    }}>
      <Typography variant="h6" sx={{ color: 'error.main', mb: 2 }}>Error</Typography>
      <Typography variant="body1" sx={{ color: '#666', mb: 3, textAlign: 'center' }}>{error}</Typography>
      <Button variant="contained" color="primary" onClick={() => navigate('/')}>
        Go to Home
      </Button>
    </Box>
  );
  
  if (!displayProfile) return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: '#fafafa'
    }}>
      <CircularProgress size={60} sx={{ mb: 2 }} />
      <Typography variant="h6" sx={{ color: '#666' }}>Loading your profile...</Typography>
    </Box>
  );

  return (
    <Box id="user-dashboard" sx={{ 
      mt: { xs: 10, md: 12 }, 
      py: { xs: 4, md: 6 }, 
      background: '#f8f9fa',
      minHeight: '100vh'
    }}>
      <Container maxWidth={false} sx={{ maxWidth: '95%', px: 2 }}>
        {/* Header Section */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ 
            fontWeight: 700, 
            color: '#2c3e50', 
            mb: 1
          }}>
            {getGreeting()}, {displayProfile.firstName}!
          </Typography>
          <Typography variant="h6" sx={{ color: '#7f8c8d', mb: 2 }}>
            Your Impact Dashboard
        </Typography>
          <Chip 
            icon={<EmojiEvents />} 
            label={`${donations.length} Donations Made`} 
            sx={{ 
              background: '#2c3e50',
              color: 'white',
              fontWeight: 'bold'
            }} 
          />
      </Box>

        {/* Impact Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 6 }} justifyContent="center">
          <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
              background: 'white',
              borderRadius: 3,
              p: 3,
              height: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #e9ecef',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease'
              }
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, color: '#2c3e50' }}>{childrenHelped}</Typography>
                <Typography variant="h6" sx={{ color: '#7f8c8d', mb: 1 }}>Children Helped</Typography>
                <Typography variant="body2" sx={{ color: '#95a5a6' }}>
                  Through your donations
                </Typography>
              </Box>
          </Card>
        </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
              background: 'white',
              borderRadius: 3,
              p: 3,
              height: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #e9ecef',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease'
              }
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, color: '#2c3e50' }}>{communitiesSupported}</Typography>
                <Typography variant="h6" sx={{ color: '#7f8c8d', mb: 1 }}>Communities</Typography>
                <Typography variant="body2" sx={{ color: '#95a5a6' }}>
                  Reached and supported
                </Typography>
              </Box>
          </Card>
        </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
              background: 'white',
              borderRadius: 3,
              p: 3,
              height: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #e9ecef',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease'
              }
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, color: '#2c3e50' }}>{programsSupported}</Typography>
                <Typography variant="h6" sx={{ color: '#7f8c8d', mb: 1 }}>Programs</Typography>
                <Typography variant="body2" sx={{ color: '#95a5a6' }}>
                  You've supported
                </Typography>
              </Box>
            </Card>
            </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'white',
              borderRadius: 3,
              p: 3,
              height: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #e9ecef',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease'
              }
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, color: '#2c3e50' }}>${totalDonated}</Typography>
                <Typography variant="h6" sx={{ color: '#7f8c8d', mb: 1 }}>Total Donated</Typography>
                <Typography variant="body2" sx={{ color: '#95a5a6' }}>
                  Making a difference
                </Typography>
              </Box>
            </Card>
          </Grid>
            </Grid>
        {/* Main Content Grid */}
        <Grid container spacing={4} justifyContent="center">
          {/* Profile Information */}
          <Grid item xs={12} md={4}>
            <Card sx={{
              background: 'white',
              borderRadius: 3,
              p: 4,
              height: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #e9ecef'
            }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2c3e50' }}>Profile Information</Typography>
                <IconButton 
                  onClick={handleEditOpen}
                  sx={{ 
                    color: '#7f8c8d', 
                    background: '#f8f9fa',
                    '&:hover': { 
                      background: '#e9ecef',
                      color: '#6c757d'
                    }
                  }}
                >
                  <Edit />
                </IconButton>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    background: '#e3f2fd', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center'
                  }}>
                    <Person sx={{ fontSize: 20, color: '#1976d2' }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#7f8c8d' }}>Full Name</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                      {displayProfile.firstName} {displayProfile.lastName}
                    </Typography>
                  </Box>
                </Box>
                
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    background: '#f3e5f5', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center'
                  }}>
                    <Email sx={{ fontSize: 20, color: '#7b1fa2' }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#7f8c8d' }}>Email</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                      {displayProfile.email}
                    </Typography>
                  </Box>
                </Box>
                
                {displayProfile.phone && (
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      background: '#e8f5e8', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center'
                    }}>
                      <Phone sx={{ fontSize: 20, color: '#388e3c' }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#7f8c8d' }}>Phone</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                        {displayProfile.phone}
                      </Typography>
                    </Box>
                  </Box>
                )}
                
                {displayProfile.location && (
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      background: '#fff3e0', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center'
                    }}>
                      <LocationOn sx={{ fontSize: 20, color: '#f57c00' }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#7f8c8d' }}>Location</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                        {displayProfile.location}
                      </Typography>
                    </Box>
                  </Box>
                )}
                </Box>
            </Card>
          </Grid>
          {/* Donation History */}
          <Grid item xs={12} md={8}>
            <Card sx={{
              background: 'white',
              borderRadius: 3,
              p: 4,
              height: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #e9ecef'
            }}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ 
                  fontWeight: 700, 
                  color: '#2c3e50',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Timeline sx={{ color: '#7f8c8d' }} />
                  Donation History
                </Typography>
              </Box>
              
              {donations.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 8,
                  background: '#f8f9fa',
                  borderRadius: 3,
                  border: '2px dashed #dee2e6'
                }}>
                  <MonetizationOn sx={{ fontSize: 60, color: '#dee2e6', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: '#7f8c8d', mb: 1 }}>
                    No donations yet
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#95a5a6' }}>
                    Start making a difference today!
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {donations.map((donation, index) => (
                    <Paper key={donation._id} sx={{ 
                      mb: 3, 
                      p: 3, 
                      borderRadius: 3,
                      background: '#f8f9fa',
                      border: '1px solid #e9ecef',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        border: '1px solid #00ff8c'
                      }
                    }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={3}>
                          <Box sx={{ 
                            width: 50, 
                            height: 50, 
                            borderRadius: '50%', 
                            background: '#e8f5e8', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center'
                          }}>
                            <AttachMoney sx={{ fontSize: 24, color: '#388e3c' }} />
                          </Box>
                          <Box>
                            <Typography variant="h6" sx={{ 
                              color: '#2c3e50', 
                              fontWeight: 700,
                              mb: 0.5
                            }}>
                              ${donation.amount}
                            </Typography>
                            <Typography variant="body1" sx={{ 
                              color: '#7f8c8d',
                              fontWeight: 500
                            }}>
                              to {donation.program?.name || 'General Fund'}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} mt={1}>
                              <CalendarToday sx={{ fontSize: 16, color: '#95a5a6' }} />
                              <Typography variant="body2" sx={{ color: '#95a5a6' }}>
                                {new Date(donation.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        <Chip 
                          label={donation.paymentStatus || 'Completed'} 
                          sx={{ 
                            background: '#e8f5e8',
                            color: '#388e3c',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                    </Paper>
                  ))}
                  
                  <Paper sx={{ 
                    mt: 4, 
                    p: 4, 
                    background: '#f8f9fa',
                    borderRadius: 3,
                    textAlign: 'center',
                    border: '1px solid #e9ecef'
                  }}>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 800, 
                      color: '#2c3e50',
                      mb: 1
                    }}>
                      ${totalDonated}
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      color: '#7f8c8d',
                      mb: 1
                    }}>
                      Total Impact Created
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#95a5a6'
                    }}>
                      Thank you for making a difference in the lives of children worldwide
                    </Typography>
                  </Paper>
            </Box>
          )}
      </Card>
          </Grid>
        </Grid>

        {/* Recurring Donations Section */}
        {subscriptions.length > 0 && (
          <Grid container spacing={4} justifyContent="center" sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <Card sx={{
                background: 'white',
                borderRadius: 3,
                p: 4,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '1px solid #e9ecef'
              }}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 700, 
                    color: '#2c3e50',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Autorenew sx={{ color: '#7f8c8d' }} />
                    Recurring Donations
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7f8c8d', mt: 1 }}>
                    Manage your active recurring donations
                  </Typography>
                </Box>

                {subscriptionsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box>
                    {subscriptions.map((sub) => (
                      <Paper key={sub.donation.id} sx={{ 
                        mb: 3, 
                        p: 3, 
                        borderRadius: 3,
                        background: '#f8f9fa',
                        border: sub.subscription?.cancel_at_period_end ? '2px solid #ff9800' : '1px solid #e9ecef',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }
                      }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                          <Box display="flex" alignItems="center" gap={3} flex={1}>
                            <Box sx={{ 
                              width: 50, 
                              height: 50, 
                              borderRadius: '50%', 
                              background: '#e3f2fd', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center'
                            }}>
                              <Autorenew sx={{ fontSize: 24, color: '#1976d2' }} />
                            </Box>
                            <Box>
                              <Typography variant="h6" sx={{ 
                                color: '#2c3e50', 
                                fontWeight: 700,
                                mb: 0.5
                              }}>
                                {sub.donation.program?.name || 'General Fund'}
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 600, color: '#2c3e50', mb: 0.5 }}>
                                ${sub.donation.amount} {formatFrequency(sub.donation.frequency)}
                              </Typography>
                              <Box display="flex" gap={2} flexWrap="wrap" mt={1}>
                                <Chip 
                                  label={`${sub.donation.totalPayments || 0} payments made`}
                                  size="small"
                                  sx={{ bgcolor: '#e8f5e8', color: '#388e3c' }}
                                />
                                {sub.donation.nextPaymentDate && (
                                  <Chip 
                                    icon={<CalendarToday sx={{ fontSize: 16 }} />}
                                    label={`Next: ${new Date(sub.donation.nextPaymentDate).toLocaleDateString()}`}
                                    size="small"
                                    sx={{ bgcolor: '#fff3e0', color: '#f57c00' }}
                                  />
                                )}
                                {sub.subscription?.cancel_at_period_end && (
                                  <Chip 
                                    label="Canceling at period end"
                                    size="small"
                                    sx={{ bgcolor: '#ffebee', color: '#c62828' }}
                                  />
                                )}
                              </Box>
                            </Box>
                          </Box>
                          <Box display="flex" gap={1} flexWrap="wrap">
                            {sub.subscription?.cancel_at_period_end ? (
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<Refresh />}
                                onClick={() => handleReactivateSubscription(sub.subscription.id)}
                                sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
                              >
                                Reactivate
                              </Button>
                            ) : (
                              <>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<Edit />}
                                  onClick={() => {
                                    setSelectedSubscription(sub);
                                    setModifyForm({
                                      amount: sub.donation.amount.toString(),
                                      frequency: sub.donation.frequency
                                    });
                                    setModifyDialogOpen(true);
                                  }}
                                >
                                  Modify
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  startIcon={<Cancel />}
                                  onClick={() => {
                                    setSelectedSubscription(sub);
                                    setCancelDialogOpen(true);
                                  }}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                )}
              </Card>
            </Grid>
          </Grid>
        )}

      {/* Call to Action */}
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Paper sx={{
            background: 'white',
            p: 6,
            borderRadius: 3,
            maxWidth: 1000,
            mx: 'auto',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#2c3e50' }}>
              Continue Making a Difference
            </Typography>
            <Typography variant="h6" sx={{ color: '#7f8c8d', mb: 4 }}>
              Your generosity has already helped {childrenHelped} children. Let's help even more!
            </Typography>
         <Button 
           variant="contained" 
           onClick={handleDonateAgain} 
           size="large"
           sx={{ 
             background: '#2c3e50',
             color: 'white',
             px: 6,
             py: 2,
             fontSize: '1.2rem',
             fontWeight: 'bold',
             borderRadius: 3,
             '&:hover': { 
               background: '#34495e',
               transform: 'translateY(-2px)',
               boxShadow: '0 8px 25px rgba(44,62,80,0.3)'
             },
             transition: 'all 0.3s ease'
           }}
         >
          Donate Again
        </Button>
          </Paper>
      </Box>
      </Container>
      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            label="First Name"
            name="firstName"
            value={editProfile.firstName || ''}
            onChange={handleEditChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Last Name"
            name="lastName"
            value={editProfile.lastName || ''}
            onChange={handleEditChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Email"
            name="email"
            value={editProfile.email || ''}
            onChange={handleEditChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Phone"
            name="phone"
            value={editProfile.phone || ''}
            onChange={handleEditChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Location"
            name="location"
            value={editProfile.location || ''}
            onChange={handleEditChange}
            fullWidth
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => { setCancelDialogOpen(false); setSelectedSubscription(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Recurring Donation</DialogTitle>
        <DialogContent>
          {selectedSubscription && (
            <>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to cancel your recurring donation?
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Program:</strong> {selectedSubscription.donation.program?.name || 'General Fund'}<br />
                  <strong>Amount:</strong> ${selectedSubscription.donation.amount} {formatFrequency(selectedSubscription.donation.frequency)}
                </Typography>
              </Alert>
              <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                You can choose to cancel immediately or at the end of the current billing period.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setCancelDialogOpen(false); setSelectedSubscription(null); }}>
            Keep Active
          </Button>
          <Button 
            onClick={() => selectedSubscription && handleCancelSubscription(selectedSubscription.subscription.id, false)}
            variant="outlined"
            color="error"
          >
            Cancel at Period End
          </Button>
          <Button 
            onClick={() => selectedSubscription && handleCancelSubscription(selectedSubscription.subscription.id, true)}
            variant="contained"
            color="error"
          >
            Cancel Immediately
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modify Subscription Dialog */}
      <Dialog 
        open={modifyDialogOpen} 
        onClose={() => { 
          setModifyDialogOpen(false); 
          setSelectedSubscription(null);
          setModifyForm({ amount: '', frequency: '' });
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Modify Recurring Donation</DialogTitle>
        <DialogContent>
          {selectedSubscription && (
            <>
              <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
                Update your recurring donation amount or frequency.
              </Typography>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={modifyForm.amount || selectedSubscription.donation.amount}
                onChange={(e) => setModifyForm({ ...modifyForm, amount: e.target.value })}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
                sx={{ mb: 3 }}
              />
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={modifyForm.frequency || selectedSubscription.donation.frequency}
                  onChange={(e) => setModifyForm({ ...modifyForm, frequency: e.target.value })}
                  label="Frequency"
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { 
            setModifyDialogOpen(false); 
            setSelectedSubscription(null);
            setModifyForm({ amount: '', frequency: '' });
          }}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              if (selectedSubscription) {
                const amount = parseFloat(modifyForm.amount || selectedSubscription.donation.amount);
                const frequency = modifyForm.frequency || selectedSubscription.donation.frequency;
                if (amount > 0) {
                  handleModifySubscription(selectedSubscription.subscription.id, amount, frequency);
                  setModifyForm({ amount: '', frequency: '' });
                }
              }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 