import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, CircularProgress, Button, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Favorite, School, People, TrendingUp, Star, Person, Email, Phone, LocationOn, MonetizationOn } from '@mui/icons-material';
import { authAPI, donationsAPI, volunteersAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function UserDashboard() {
  const [profile, setProfile] = useState(null);
  const [donations, setDonations] = useState([]);
  const [volunteerApps, setVolunteerApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editProfile, setEditProfile] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const profileData = await authAPI.getProfile();
        const donationsData = await donationsAPI.getUserDonations({ limit: 100 });
        
        setProfile(profileData.user || profileData);
        setDonations(donationsData.donations || []);
      } catch (err) {
        setError('You must be logged in to view your dashboard.');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Impact summary calculations
  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
  const programsSupported = new Set(donations.map(d => d.program?.name)).size;
  // Example: 1 child helped per $25 donated, 1 community per $500
  const childrenHelped = Math.floor(totalDonated / 25);
  const communitiesSupported = Math.floor(totalDonated / 500);

  // Profile editing handlers
  const handleEditOpen = () => {
    setEditProfile({ ...profile });
    setEditOpen(true);
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
  if (error) return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: '#fafafa'
    }}>
      <Typography variant="h6" sx={{ color: 'red', mb: 2 }}>Error</Typography>
      <Typography variant="body1" sx={{ color: '#666' }}>{error}</Typography>
    </Box>
  );
  if (!profile) return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: '#fafafa'
    }}>
      <Typography variant="h6" sx={{ color: '#666' }}>Could not load profile.</Typography>
    </Box>
  );

  return (
    <Box id="user-dashboard" sx={{ mt: { xs: 10, md: 12 }, py: { xs: 4, md: 6 }, background: '#fafafa' }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#000', mb: 1 }}>
          {getGreeting()}, {profile.firstName}!
        </Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>
          Here's your impact summary and activity.
        </Typography>
      </Box>
      {/* Impact Summary */}
      <Grid container spacing={2} sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{
            textAlign: 'center',
            p: 2,
            borderRadius: 1,
            background: '#fff',
            border: '1px solid #ddd',
            boxShadow: 'none',
            height: '100%'
          }}>
            <Box sx={{ color: '#999', mb: 1, fontSize: 28 }}><Favorite fontSize="inherit" /></Box>
            <Typography variant="h5" sx={{ color: '#000', fontWeight: 600, mb: 0.5 }}>{childrenHelped}</Typography>
            <Typography variant="body2" sx={{ color: '#666', fontSize: '0.875rem' }}>Children Helped</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{
            textAlign: 'center',
            p: 2,
            borderRadius: 1,
            background: '#fff',
            border: '1px solid #ddd',
            boxShadow: 'none',
            height: '100%'
          }}>
            <Box sx={{ color: '#999', mb: 1, fontSize: 28 }}><People fontSize="inherit" /></Box>
            <Typography variant="h5" sx={{ color: '#000', fontWeight: 600, mb: 0.5 }}>{communitiesSupported}</Typography>
            <Typography variant="body2" sx={{ color: '#666', fontSize: '0.875rem' }}>Communities Supported</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{
            textAlign: 'center',
            p: 2,
            borderRadius: 1,
            background: '#fff',
            border: '1px solid #ddd',
            boxShadow: 'none',
            height: '100%'
          }}>
            <Box sx={{ color: '#999', mb: 1, fontSize: 28 }}><School fontSize="inherit" /></Box>
            <Typography variant="h5" sx={{ color: '#000', fontWeight: 600, mb: 0.5 }}>{programsSupported}</Typography>
            <Typography variant="body2" sx={{ color: '#666', fontSize: '0.875rem' }}>Programs Supported</Typography>
          </Card>
        </Grid>
      </Grid>
      {/* Profile Info */}
      <Card sx={{ maxWidth: 600, mx: 'auto', mb: 4, borderRadius: 1, background: '#fff', border: '1px solid #ddd', boxShadow: 'none' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#000' }}>Profile Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Person sx={{ color: '#999', fontSize: 20 }} />
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', fontSize: '0.75rem' }}>Name</Typography>
                  <Typography variant="body1" sx={{ color: '#000', fontWeight: 500 }}>{profile.firstName} {profile.lastName}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Email sx={{ color: '#999', fontSize: 20 }} />
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', fontSize: '0.75rem' }}>Email</Typography>
                  <Typography variant="body1" sx={{ color: '#000', fontWeight: 500 }}>{profile.email}</Typography>
                </Box>
              </Box>
            </Grid>
            {profile.phone && (
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Phone sx={{ color: '#999', fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: '#666', fontSize: '0.75rem' }}>Phone</Typography>
                    <Typography variant="body1" sx={{ color: '#000', fontWeight: 500 }}>{profile.phone}</Typography>
                  </Box>
                </Box>
              </Grid>
            )}
            {profile.location && (
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <LocationOn sx={{ color: '#999', fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: '#666', fontSize: '0.75rem' }}>Location</Typography>
                    <Typography variant="body1" sx={{ color: '#000', fontWeight: 500 }}>{profile.location}</Typography>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
          <Button variant="outlined" sx={{ mt: 2, borderColor: '#ddd', color: '#666' }} onClick={handleEditOpen}>Edit Profile</Button>
        </CardContent>
      </Card>
      {/* Donation History */}
      <Card sx={{ maxWidth: 800, mx: 'auto', mb: 4, borderRadius: 1, background: '#fff', border: '1px solid #ddd', boxShadow: 'none' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#000' }}>Donation History</Typography>
          {donations.length === 0 ? (
            <Typography sx={{ color: '#666', textAlign: 'center', py: 2 }}>No donations yet.</Typography>
          ) : (
            <Box>
              {donations.map((donation, index) => (
                <Box key={donation._id} sx={{ 
                  mb: 2, 
                  p: 2, 
                  border: '1px solid #f0f0f0', 
                  borderRadius: 1,
                  background: '#fafafa'
                }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body1" sx={{ color: '#000', fontWeight: 500 }}>
                        ${donation.amount}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        to {donation.program?.name || 'General'}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              ))}
              <Divider sx={{ my: 3 }} />
              <Box sx={{ textAlign: 'center', p: 2, background: '#f8f8f8', borderRadius: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#000' }}>
                  Total Donated: <strong>${totalDonated}</strong>
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
      {/* Call to Action */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button 
          variant="contained" 
          onClick={handleDonateAgain} 
          sx={{ 
            backgroundColor: '#000', 
            color: '#fff',
            '&:hover': { backgroundColor: '#333' },
            px: 4,
            py: 1.5
          }}
        >
          Donate Again
        </Button>
      </Box>
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
    </Box>
  );
} 