import React, { useState, useEffect } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import {
  Dashboard,
  Donate,
  People,
  School,
  TrendingUp,
  Visibility,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  Warning,
  Person,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  AttachMoney,
  Receipt,
  Star
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { donationsAPI, volunteersAPI, programsAPI } from '../services/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [_loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Dashboard Stats
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalVolunteers: 0,
    totalPrograms: 0,
    monthlyRevenue: 0
  });

  // Data States
  const [donations, setDonations] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [_dialogOpen, _setDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load stats
      const [donationsStats, volunteersStats, programsStats] = await Promise.all([
        donationsAPI.getStats(),
        volunteersAPI.getStats(),
        programsAPI.getStats()
      ]);

      setStats({
        totalDonations: donationsStats.totalDonations || 0,
        totalVolunteers: volunteersStats.totalApplications || 0,
        totalPrograms: programsStats.totalPrograms || 0,
        monthlyRevenue: donationsStats.monthlyRevenue || 0
      });

      // Load data
      const [donationsData, volunteersData, programsData] = await Promise.all([
        donationsAPI.getUserDonations({ limit: 10 }),
        volunteersAPI.getApplications({ limit: 10 }),
        programsAPI.getAll({ limit: 10 })
      ]);

      setDonations(donationsData.donations || []);
      setVolunteers(volunteersData.applications || []);
      setPrograms(programsData.programs || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setSnackbar({ open: true, message: 'Failed to load dashboard data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleStatusUpdate = async (type, id, status) => {
    try {
      setLoading(true);
      
      if (type === 'volunteer') {
        await volunteersAPI.updateApplicationStatus(id, status);
      } else if (type === 'donation') {
        await donationsAPI.updateStatus(id, status);
      }

      setSnackbar({ open: true, message: 'Status updated successfully', severity: 'success' });
      loadDashboardData();

    } catch (error) {
      console.error('Error updating status:', error);
      setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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

  const renderAdminIcon = (iconType) => {
    switch (iconType) {
      case 'donate':
        return <Donate />;
      case 'people':
        return <People />;
      case 'school':
        return <School />;
      case 'trending_up':
        return <TrendingUp />;
      default:
        return <Donate />;
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ color: 'var(--primary-green)', mb: 2 }}>
          Access Denied
        </Typography>
        <Typography variant="body1">
          You need administrator privileges to access this dashboard.
        </Typography>
      </Box>
    );
  }

  return (
    <Box id="admin-dashboard" sx={{ py: { xs: 4, md: 6 }, background: '#f8f9fa' }}>
      <Container maxWidth="xl">
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
            <Dashboard />
            Admin Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: '#666' }}>
            Manage donations, volunteer applications, and programs
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { 
              title: 'Total Donations', 
              value: `$${stats.totalDonations.toLocaleString()}`, 
              icon: 'donate', 
              color: '#4CAF50' 
            },
            { 
              title: 'Volunteer Applications', 
              value: stats.totalVolunteers, 
              icon: 'people', 
              color: '#2196F3' 
            },
            { 
              title: 'Active Programs', 
              value: stats.totalPrograms, 
              icon: 'school', 
              color: '#FF9800' 
            },
            { 
              title: 'Monthly Revenue', 
              value: `$${stats.monthlyRevenue.toLocaleString()}`, 
              icon: 'trending_up', 
              color: '#9C27B0' 
            }
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ 
                p: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
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
                    {renderAdminIcon(stat.icon)}
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
            <Tab label="Donations" />
            <Tab label="Volunteers" />
            <Tab label="Programs" />
            <Tab label="Analytics" />
          </Tabs>

          {/* Donations Tab */}
          <TabPanel value={tabValue} index={0}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Donor</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Program</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {donations.map((donation) => (
                    <TableRow key={donation._id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            <Person />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {donation.anonymous ? 'Anonymous' : donation.donor?.firstName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#666' }}>
                              {donation.donor?.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--primary-green)' }}>
                          ${donation.amount}
                        </Typography>
                      </TableCell>
                      <TableCell>{donation.program?.name}</TableCell>
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
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={() => setSelectedItem({ type: 'donation', data: donation })}
                        >
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Volunteers Tab */}
          <TabPanel value={tabValue} index={1}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Applicant</TableCell>
                    <TableCell>Skills</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {volunteers.map((volunteer) => (
                    <TableRow key={volunteer._id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            <Person />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {volunteer.firstName} {volunteer.lastName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#666' }}>
                              {volunteer.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5} flexWrap="wrap">
                          {volunteer.skills.slice(0, 2).map((skill, index) => (
                            <Chip key={index} label={skill} size="small" />
                          ))}
                          {volunteer.skills.length > 2 && (
                            <Chip label={`+${volunteer.skills.length - 2}`} size="small" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{volunteer.location}</TableCell>
                      <TableCell>
                        <Chip 
                          label={volunteer.status} 
                          color={getStatusColor(volunteer.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(volunteer.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <IconButton 
                            size="small" 
                            onClick={() => setSelectedItem({ type: 'volunteer', data: volunteer })}
                          >
                            <Visibility />
                          </IconButton>
                          {volunteer.status === 'pending' && (
                            <>
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => handleStatusUpdate('volunteer', volunteer._id, 'approved')}
                              >
                                <CheckCircle />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleStatusUpdate('volunteer', volunteer._id, 'rejected')}
                              >
                                <Cancel />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Programs Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Active Programs</Typography>
              <Button variant="contained" sx={{ background: 'var(--primary-green)' }}>
                Add New Program
              </Button>
            </Box>
            
            <Grid container spacing={3}>
              {programs.map((program) => (
                <Grid item xs={12} md={6} lg={4} key={program._id}>
                  <Card sx={{ height: '100%', borderRadius: 3 }}>
                    <Box sx={{ 
                      height: 200, 
                      background: `linear-gradient(135deg, ${program.color || '#00ff8c'}20 0%, ${program.color || '#00ff8c'}10 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <School sx={{ fontSize: 60, color: program.color || 'var(--primary-green)' }} />
                    </Box>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        {program.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                        {program.description}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Chip 
                          label={program.status} 
                          color={program.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                        <Box display="flex" gap={0.5}>
                          <IconButton size="small">
                            <Edit />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <Delete />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {/* Analytics Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" sx={{ mb: 3 }}>Analytics Overview</Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Recent Activity</Typography>
                  <List>
                    {donations.slice(0, 5).map((donation) => (
                      <ListItem key={donation._id}>
                        <ListItemAvatar>
                          <Avatar sx={{ background: 'var(--primary-green)' }}>
                            <Receipt />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`$${donation.amount} donation received`}
                          secondary={new Date(donation.createdAt).toLocaleDateString()}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Top Programs</Typography>
                  <List>
                    {programs.slice(0, 5).map((program) => (
                      <ListItem key={program._id}>
                        <ListItemAvatar>
                          <Avatar sx={{ background: program.color || 'var(--primary-green)' }}>
                            <Star />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={program.name}
                          secondary={`${program.donations || 0} donations`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>

        {/* Detail Dialog */}
        <Dialog 
          open={!!selectedItem} 
          onClose={() => setSelectedItem(null)}
          maxWidth="md"
          fullWidth
        >
          {selectedItem && (
            <>
              <DialogTitle>
                {selectedItem.type === 'donation' ? 'Donation Details' : 'Volunteer Application'}
              </DialogTitle>
              <DialogContent>
                {selectedItem.type === 'donation' ? (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      ${selectedItem.data.amount} - {selectedItem.data.program?.name}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Status:</Typography>
                        <Chip 
                          label={selectedItem.data.paymentStatus} 
                          color={getStatusColor(selectedItem.data.paymentStatus)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Date:</Typography>
                        <Typography variant="body2">
                          {new Date(selectedItem.data.createdAt).toLocaleDateString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {selectedItem.data.firstName} {selectedItem.data.lastName}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Email:</Typography>
                        <Typography variant="body2">{selectedItem.data.email}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Phone:</Typography>
                        <Typography variant="body2">{selectedItem.data.phone}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Skills:</Typography>
                        <Box display="flex" gap={0.5} flexWrap="wrap" mt={1}>
                          {selectedItem.data.skills.map((skill, index) => (
                            <Chip key={index} label={skill} size="small" />
                          ))}
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setSelectedItem(null)}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>

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