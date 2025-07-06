import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Alert,
  Snackbar,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Person,
  Donate,
  VolunteerActivism,
  Receipt,
  Edit,
  Save,
  Cancel,
  CheckCircle,
  Schedule,
  TrendingUp,
  Star,
  Email,
  Phone,
  LocationOn,
  CalendarToday
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { donationsAPI, volunteersAPI, usersAPI } from '../services/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function UserDashboard() {
  const { user, updateProfile } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // User data
  const [userDonations, setUserDonations] = useState([]);
  const [userVolunteerApps, setUserVolunteerApps] = useState([]);
  const [userStats, setUserStats] = useState({
    totalDonated: 0,
    totalVolunteerHours: 0,
    programsSupported: 0,
    impactScore: 0
  });

  // Profile editing
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || ''
  });

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load user's donations
      const donationsResponse = await donationsAPI.getUserDonations({ limit: 20 });
      setUserDonations(donationsResponse.donations || []);

      // Load user's volunteer applications
      const volunteersResponse = await volunteersAPI.getApplications({ 
        email: user.email,
        limit: 20 
      });
      setUserVolunteerApps(volunteersResponse.applications || []);

      // Calculate stats
      const totalDonated = userDonations.reduce((sum, donation) => sum + donation.amount, 0);
      const programsSupported = new Set(userDonations.map(d => d.program?.name)).size;
      
      setUserStats({
        totalDonated,
        totalVolunteerHours: userVolunteerApps.length * 10, // Estimate
        programsSupported,
        impactScore: Math.round((totalDonated / 100) + (userVolunteerApps.length * 5))
      });

    } catch (error) {
      console.error('Error loading user data:', error);
      setSnackbar({ open: true, message: 'Failed to load user data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleProfileSave = async () => {
    try {
      setLoading(true);
      
      // Update profile via API
      await usersAPI.updateProfile(profileData);
      
      // Update local user context
              updateProfile(profileData);
      
      setEditMode(false);
      setSnackbar({ open: true, message: 'Profile updated successfully', severity: 'success' });

    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileCancel = () => {
    setProfileData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || ''
    });
    setEditMode(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'success';
      case 'pending':
      case 'processing':
        return 'warning';
      case 'rejected':
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderUserIcon = (iconType) => {
    switch (iconType) {
      case 'donate':
        return <Donate />;
      case 'volunteer_activism':
        return <VolunteerActivism />;
      case 'star':
        return <Star />;
      case 'trending_up':
        return <TrendingUp />;
      default:
        return <Donate />;
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!user) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ color: 'var(--primary-green)', mb: 2 }}>
          Please Login
        </Typography>
        <Typography variant="body1">
          You need to be logged in to access your dashboard.
        </Typography>
      </Box>
    );
  }

  return (
    <Box id="user-dashboard" sx={{ py: { xs: 4, md: 6 }, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ 
            fontWeight: 700, 
            color: 'var(--primary-green)',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Person />
            My Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: '#666' }}>
            Welcome back, {user.firstName}! Here's your impact summary.
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { 
              title: 'Total Donations', 
              value: `$${userStats.totalDonated.toLocaleString()}`, 
              icon: 'donate', 
              color: '#4CAF50' 
            },
            { 
              title: 'Volunteer Applications', 
              value: userStats.totalVolunteerApps, 
              icon: 'volunteer_activism', 
              color: '#2196F3' 
            },
            { 
              title: 'Programs Supported', 
              value: userStats.programsSupported, 
              icon: 'star', 
              color: '#FF9800' 
            },
            { 
              title: 'Monthly Donations', 
              value: `$${userStats.monthlyDonations.toLocaleString()}`, 
              icon: 'trending_up', 
              color: '#9C27B0' 
            }
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ 
                p: 3, 
                borderRadius: 3,
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0,0,0,0.05)'
              }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color, mb: 1 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {stat.title}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color, fontSize: '2rem' }}>
                    {renderUserIcon(stat.icon)}
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Tabs */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{ 
              background: 'var(--primary-green)',
              '& .MuiTab-root': { color: 'white' },
              '& .Mui-selected': { color: '#01371f', fontWeight: 700 }
            }}
          >
            <Tab label="Profile" />
            <Tab label="Donations" />
            <Tab label="Volunteer" />
            <Tab label="Impact" />
          </Tabs>

          {/* Profile Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Profile Information</Typography>
              {!editMode ? (
                <Button 
                  startIcon={<Edit />}
                  onClick={() => setEditMode(true)}
                  variant="outlined"
                  sx={{ borderColor: 'var(--primary-green)', color: 'var(--primary-green)' }}
                >
                  Edit Profile
                </Button>
              ) : (
                <Box display="flex" gap={1}>
                  <Button 
                    startIcon={<Save />}
                    onClick={handleProfileSave}
                    variant="contained"
                    disabled={loading}
                    sx={{ background: 'var(--primary-green)' }}
                  >
                    Save
                  </Button>
                  <Button 
                    startIcon={<Cancel />}
                    onClick={handleProfileCancel}
                    variant="outlined"
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  disabled={!editMode}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  disabled={!editMode}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  disabled={!editMode}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  disabled={!editMode}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  value={profileData.location}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  disabled={!editMode}
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Donations Tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" sx={{ mb: 3 }}>Your Donation History</Typography>
            
            {userDonations.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Donate sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                  No donations yet
                </Typography>
                <Typography variant="body2" sx={{ color: '#888' }}>
                  Start making a difference by making your first donation!
                </Typography>
                <Button 
                  variant="contained" 
                  href="#donate"
                  sx={{ 
                    background: 'var(--primary-green)', 
                    mt: 2,
                    '&:hover': { background: '#00e67a' }
                  }}
                >
                  Donate Now
                </Button>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Program</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userDonations.map((donation) => (
                      <TableRow key={donation._id}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 32, height: 32, background: 'var(--primary-green)' }}>
                              <Receipt />
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {donation.program?.name || 'General Fund'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--primary-green)' }}>
                            ${donation.amount}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={donation.paymentStatus} 
                            color={getStatusColor(donation.paymentStatus)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(donation.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          {/* Volunteer Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" sx={{ mb: 3 }}>Your Volunteer Applications</Typography>
            
            {userVolunteerApps.length === 0 ? (
              <Box textAlign="center" py={4}>
                <VolunteerActivism sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                  No volunteer applications yet
                </Typography>
                <Typography variant="body2" sx={{ color: '#888' }}>
                  Join our volunteer team and make a direct impact!
                </Typography>
                <Button 
                  variant="contained" 
                  href="#volunteer"
                  sx={{ 
                    background: 'var(--primary-green)', 
                    mt: 2,
                    '&:hover': { background: '#00e67a' }
                  }}
                >
                  Apply to Volunteer
                </Button>
              </Box>
            ) : (
              <List>
                {userVolunteerApps.map((application) => (
                  <ListItem key={application._id} sx={{ 
                    border: '1px solid #eee', 
                    borderRadius: 2, 
                    mb: 2,
                    background: 'white'
                  }}>
                    <ListItemAvatar>
                      <Avatar sx={{ background: 'var(--primary-green)' }}>
                        <VolunteerActivism />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={2}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            Volunteer Application
                          </Typography>
                          <Chip 
                            label={application.status} 
                            color={getStatusColor(application.status)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                            Skills: {application.skills.join(', ')}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            Applied: {new Date(application.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </TabPanel>

          {/* Impact Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" sx={{ mb: 3 }}>Your Impact</Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp />
                    Impact Summary
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Children Helped"
                        secondary={`${Math.round(userStats.totalDonated / 25)} children`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Communities Supported"
                        secondary={`${userStats.programsSupported} programs`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Volunteer Hours"
                        secondary={`${userStats.totalVolunteerHours} hours`}
                      />
                    </ListItem>
                  </List>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Star />
                    Achievements
                  </Typography>
                  <List>
                    {userStats.totalDonated >= 100 && (
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ background: '#FFD700' }}>
                            <Star />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Generous Donor"
                          secondary="Donated $100+ to our cause"
                        />
                      </ListItem>
                    )}
                    {userStats.programsSupported >= 3 && (
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ background: '#4CAF50' }}>
                            <CheckCircle />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Multi-Program Supporter"
                          secondary="Supported 3+ different programs"
                        />
                      </ListItem>
                    )}
                    {userVolunteerApps.length > 0 && (
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ background: '#2196F3' }}>
                            <VolunteerActivism />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Volunteer"
                          secondary="Applied to volunteer with us"
                        />
                      </ListItem>
                    )}
                  </List>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
} 