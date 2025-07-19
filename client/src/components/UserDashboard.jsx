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
        const volunteerData = await volunteersAPI.getMyApplications({ limit: 100 });
        setProfile(profileData.user || profileData);
        setDonations(donationsData.donations || []);
        // Volunteer section removed for donor-only dashboard
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

  if (loading) return <Box sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ py: 8, textAlign: 'center', color: 'red' }}>{error}</Box>;
  if (!profile) return <Box sx={{ py: 8, textAlign: 'center' }}>Could not load profile.</Box>;

  return (
    <Box id="user-dashboard" sx={{ mt: { xs: 10, md: 12 }, py: { xs: 4, md: 6 }, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--primary-green)', mb: 1 }}>
          {getGreeting()}, {profile.firstName}!
        </Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>
          Here’s your impact summary and activity.
        </Typography>
      </Box>
      {/* Impact Summary */}
      <Grid container spacing={3} justifyContent="center" sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4} md={2.5}>
          <Card elevation={4} sx={{
            textAlign: 'center',
            p: 2,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #e8f5e8 60%, #c3cfe2 100%)',
            boxShadow: '0 4px 24px rgba(0,255,140,0.08)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px) scale(1.03)',
              boxShadow: '0 8px 32px rgba(0,255,140,0.16)'
            }
          }}>
            <Box sx={{ color: 'var(--accent-green)', mb: 1, fontSize: 32 }}><Favorite fontSize="inherit" /></Box>
            <Typography variant="h4" sx={{ color: 'var(--primary-green)', fontWeight: 700 }}>{childrenHelped}</Typography>
            <Typography variant="body2">Children Helped</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4} md={2.5}>
          <Card elevation={4} sx={{
            textAlign: 'center',
            p: 2,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #e8f5e8 60%, #c3cfe2 100%)',
            boxShadow: '0 4px 24px rgba(0,255,140,0.08)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px) scale(1.03)',
              boxShadow: '0 8px 32px rgba(0,255,140,0.16)'
            }
          }}>
            <Box sx={{ color: 'var(--accent-green)', mb: 1, fontSize: 32 }}><People fontSize="inherit" /></Box>
            <Typography variant="h4" sx={{ color: 'var(--primary-green)', fontWeight: 700 }}>{communitiesSupported}</Typography>
            <Typography variant="body2">Communities Supported</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4} md={2.5}>
          <Card elevation={4} sx={{
            textAlign: 'center',
            p: 2,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #e8f5e8 60%, #c3cfe2 100%)',
            boxShadow: '0 4px 24px rgba(0,255,140,0.08)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px) scale(1.03)',
              boxShadow: '0 8px 32px rgba(0,255,140,0.16)'
            }
          }}>
            <Box sx={{ color: 'var(--accent-green)', mb: 1, fontSize: 32 }}><School fontSize="inherit" /></Box>
            <Typography variant="h4" sx={{ color: 'var(--primary-green)', fontWeight: 700 }}>{programsSupported}</Typography>
            <Typography variant="body2">Programs Supported</Typography>
          </Card>
        </Grid>
      </Grid>
      {/* Profile Info */}
      <Card elevation={4} sx={{ maxWidth: 500, mx: 'auto', mb: 4, borderRadius: 3, background: '#fff', boxShadow: '0 4px 24px rgba(0,255,140,0.08)' }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: 'var(--primary-green)' }}>Profile Information</Typography>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Person sx={{ color: 'var(--accent-green)' }} />
            <Typography><strong>Name:</strong> {profile.firstName} {profile.lastName}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Email sx={{ color: 'var(--accent-green)' }} />
            <Typography><strong>Email:</strong> {profile.email}</Typography>
          </Box>
          {profile.phone && (
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Phone sx={{ color: 'var(--accent-green)' }} />
              <Typography><strong>Phone:</strong> {profile.phone}</Typography>
            </Box>
          )}
          {profile.location && (
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <LocationOn sx={{ color: 'var(--accent-green)' }} />
              <Typography><strong>Location:</strong> {profile.location}</Typography>
            </Box>
          )}
          <Button variant="outlined" sx={{ mt: 2 }} onClick={handleEditOpen}>Edit Profile</Button>
        </CardContent>
      </Card>
      {/* Donation History */}
      <Card elevation={4} sx={{ maxWidth: 700, mx: 'auto', mb: 4, borderRadius: 3, background: '#fff', boxShadow: '0 4px 24px rgba(0,255,140,0.08)' }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: 'var(--primary-green)' }}>Donation History</Typography>
          {donations.length === 0 ? (
            <Typography>No donations yet.</Typography>
          ) : (
            donations.map(donation => (
              <Box key={donation._id} sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>${donation.amount}</strong> to {donation.program?.name || 'General'} on {new Date(donation.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            ))
          )}
          <Divider sx={{ my: 2 }} />
          <Typography variant="body1" sx={{ fontWeight: 700 }}>
            Total Donated: <strong>${totalDonated}</strong>
          </Typography>
        </CardContent>
      </Card>
      {/* Call to Action */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button variant="contained" color="primary" onClick={handleDonateAgain} sx={{ mr: 2 }}>
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