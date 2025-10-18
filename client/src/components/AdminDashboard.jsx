// AdminDashboard component - Updated to show all donations
import React, { useState, useEffect, useRef } from 'react';
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
  ListItemAvatar,
  Fab,
  Tooltip,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormHelperText,
  InputAdornment,
  Autocomplete,
  LinearProgress,
  Badge
} from '@mui/material';
import {
  Dashboard,
  MonetizationOn,
  People,
  School,
  TrendingUp,
  Visibility,
  Edit,
  Delete,
  Add,
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
  Star,
  Refresh,
  ExpandMore,
  Business,
  Flag,
  Category,
  Description,
  Timeline,
  Assessment,
  PhotoLibrary,
  Settings,
  Help,
  Check,
  Error,
  Upload,
  Image as ImageIcon,
  Save
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { donationsAPI, volunteersAPI, programsAPI, newsletterAPI } from '../services/api';

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

// Helper for image upload
function ImageUploadField({ label, value, onChange, disabled }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        onChange(data.url);
      } else {
        setError('Upload failed');
      }
    } catch (err) {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" sx={{ mb: 0.5 }}>{label}</Typography>
      <Box
        sx={{
          border: '2px dashed #00cc6a',
          borderRadius: 2,
          p: 2,
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          bgcolor: '#f9f9f9',
          mb: 1
        }}
        onClick={() => !disabled && inputRef.current && inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); if (!disabled) e.dataTransfer.dropEffect = 'copy'; }}
        onDrop={e => {
          e.preventDefault();
          if (disabled) return;
          const file = e.dataTransfer.files[0];
          if (file) {
            const fakeEvent = { target: { files: [file] } };
            handleFileChange(fakeEvent);
          }
        }}
      >
        {uploading ? 'Uploading...' : 'Click or drag an image here to upload'}
      </Box>
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={inputRef}
        onChange={handleFileChange}
        disabled={disabled}
      />
      {value && (
        <Box sx={{ mt: 1, mb: 1, textAlign: 'center' }}>
          <img src={value} alt="Preview" style={{ maxWidth: 120, maxHeight: 80, borderRadius: 8 }} />
        </Box>
      )}
      <TextField
        fullWidth
        label="Image URL"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        sx={{ mt: 1 }}
      />
      {error && <Typography color="error" variant="caption">{error}</Typography>}
    </Box>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Dashboard Stats
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalVolunteers: 0,
    totalPrograms: 0,
    monthlyRevenue: 0
  });

  // Detailed donation stats
  const [donationStats, setDonationStats] = useState({
    totalAmount: 0,
    totalDonations: 0,
    completedDonations: 0,
    completedAmount: 0,
    pendingDonations: 0,
    failedDonations: 0,
    monthlyRevenue: 0,
    monthlyDonations: 0
  });

  // Data States
  const [donations, setDonations] = useState([]);
  const [donationsPage, setDonationsPage] = useState(1);
  const [donationsTotalPages, setDonationsTotalPages] = useState(1);
  const [donationsLimit, setDonationsLimit] = useState(20);
  const [donationsTotal, setDonationsTotal] = useState(0);
  const [volunteers, setVolunteers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [programStats, setProgramStats] = useState({
    totalPrograms: 0,
    activePrograms: 0,
    completedPrograms: 0,
    pausedPrograms: 0,
    upcomingPrograms: 0
  });
  const [volunteerStats, setVolunteerStats] = useState({
    totalVolunteers: 0,
    pendingVolunteers: 0,
    reviewedVolunteers: 0,
    approvedVolunteers: 0,
    rejectedVolunteers: 0
  });
  const [feedbackList, setFeedbackList] = useState([]);
  
  // CRUD Dialog States
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'create', 'edit', 'view'
  const [editingData, setEditingData] = useState({});

  const [feedbackPage, setFeedbackPage] = useState(1);
  const [feedbackTotalPages, setFeedbackTotalPages] = useState(1);
  const [feedbackLimit] = useState(10);

  const [stories, setStories] = useState([]);
  const [storiesPage, setStoriesPage] = useState(1);
  const [storiesTotalPages, setStoriesTotalPages] = useState(1);
  const [storiesLimit] = useState(10);
  const [storyDialogOpen, setStoryDialogOpen] = useState(false);
  const [editingStory, setEditingStory] = useState(null);

  // Newsletter state
  const [subscribers, setSubscribers] = useState([]);
  const [subscribersPage, setSubscribersPage] = useState(1);
  const [subscribersTotalPages, setSubscribersTotalPages] = useState(1);
  const [subscribersLimit] = useState(20);
  const [newsletterStats, setNewsletterStats] = useState({
    totalSubscribers: 0,
    totalUnsubscribed: 0,
    newThisMonth: 0,
    totalEmails: 0
  });
  const [newsletterDialogOpen, setNewsletterDialogOpen] = useState(false);
  const [newsletterForm, setNewsletterForm] = useState({
    subject: '',
    content: ''
  });
  const [sendingNewsletter, setSendingNewsletter] = useState(false);

  // Form validation and progress states
  const [formErrors, setFormErrors] = useState({});
  const [formProgress, setFormProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [formSections, setFormSections] = useState({
    basic: false,
    details: false,
    financial: false,
    impact: false,
    media: false
  });

  // Donation options state
  const [donationOptions, setDonationOptions] = useState([]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadDashboardData(donationsPage);
    }
    // eslint-disable-next-line
  }, [user, donationsPage]);

  useEffect(() => {
    if (tabValue === 4) {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      fetch(`${API_BASE_URL}/feedback?page=${feedbackPage}&limit=${feedbackLimit}`)
        .then(res => res.json())
        .then(data => {
          setFeedbackList(data.feedback || []);
          setFeedbackTotalPages(data.totalPages || 1);
        });
    }
  }, [tabValue, feedbackPage, feedbackLimit]);

  useEffect(() => {
    if (tabValue === 5) {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      fetch(`${API_BASE_URL}/success-stories?page=${storiesPage}&limit=${storiesLimit}`)
        .then(res => res.json())
        .then(data => {
          setStories(data.stories || []);
          setStoriesTotalPages(data.totalPages || 1);
        });
    }
  }, [tabValue, storiesPage, storiesLimit]);

  useEffect(() => {
    if (tabValue === 6) {
      loadNewsletterData();
    }
  }, [tabValue, subscribersPage, subscribersLimit]);

  const loadNewsletterData = async () => {
    try {
      const [subscribersData, statsData] = await Promise.all([
        newsletterAPI.getSubscribers({ page: subscribersPage, limit: subscribersLimit }),
        newsletterAPI.getStats()
      ]);

      setSubscribers(subscribersData.subscribers || []);
      setSubscribersTotalPages(subscribersData.totalPages || 1);
      setNewsletterStats(statsData);
    } catch (error) {
      console.error('Error loading newsletter data:', error);
      setSnackbar({ open: true, message: 'Failed to load newsletter data', severity: 'error' });
    }
  };

  const loadDashboardData = async (page = donationsPage) => {
    try {
      setLoading(true);
      
      // Load stats
      const [donationsStats, volunteersStats, programsStats] = await Promise.all([
        donationsAPI.getStats(),
        volunteersAPI.getStats(),
        programsAPI.getStats()
      ]);

      setStats({
        totalDonations: donationsStats.stats?.totalAmount || 0,
        totalVolunteers: volunteersStats.totalApplications || 0,
        totalPrograms: programsStats.totalPrograms || 0,
        monthlyRevenue: donationsStats.stats?.monthlyRevenue || 0
      });

      // Set detailed donation stats
      setDonationStats({
        totalAmount: donationsStats.stats?.totalAmount || 0,
        totalDonations: donationsStats.stats?.totalDonations || 0,
        completedDonations: donationsStats.stats?.completedDonations || 0,
        completedAmount: donationsStats.stats?.completedAmount || 0,
        pendingDonations: donationsStats.stats?.pendingDonations || 0,
        failedDonations: donationsStats.stats?.failedDonations || 0,
        monthlyRevenue: donationsStats.stats?.monthlyRevenue || 0,
        monthlyDonations: donationsStats.stats?.monthlyDonations || 0
      });

      // Load data
      const [donationsData, volunteersData, programsData] = await Promise.all([
        donationsAPI.getAllDonations({ page, limit: donationsLimit }),
        volunteersAPI.getApplications({ limit: 50 }),
        programsAPI.getAll({ limit: 50, status: '' }) // Load all programs regardless of status
      ]);

      setDonations(donationsData.donations || []);
      setDonationsTotalPages(donationsData.totalPages || 1);
      setDonationsTotal(donationsData.totalDonations || 0);
      setVolunteers(volunteersData.applications || []);
      setPrograms(programsData.programs || []);

      // Calculate program statistics
      const programsList = programsData.programs || [];
      const programStatsData = {
        totalPrograms: programsList.length,
        activePrograms: programsList.filter(p => p.status === 'active').length,
        completedPrograms: programsList.filter(p => p.status === 'completed').length,
        pausedPrograms: programsList.filter(p => p.status === 'paused').length,
        upcomingPrograms: programsList.filter(p => p.status === 'upcoming').length
      };
      setProgramStats(programStatsData);

      // Calculate volunteer statistics
      const volunteersList = volunteersData.applications || [];
      const volunteerStatsData = {
        totalVolunteers: volunteersList.length,
        pendingVolunteers: volunteersList.filter(v => v.status === 'pending').length,
        reviewedVolunteers: volunteersList.filter(v => v.status === 'reviewed').length,
        approvedVolunteers: volunteersList.filter(v => v.status === 'approved').length,
        rejectedVolunteers: volunteersList.filter(v => v.status === 'rejected').length
      };
      setVolunteerStats(volunteerStatsData);

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
      }
      // Donations status updates are not allowed for admin

      setSnackbar({ open: true, message: 'Status updated successfully', severity: 'success' });
      loadDashboardData();

    } catch (error) {
      console.error('Error updating status:', error);
      setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // CRUD Operations
  // Form validation functions
  const validateField = (field, value, type = 'program') => {
    const errors = {};
    
    if (type === 'program') {
      switch (field) {
        case 'name':
          if (!value || value.trim().length < 3) {
            errors.name = 'Program name must be at least 3 characters';
          }
          break;
        case 'description':
          if (!value || value.trim().length < 10) {
            errors.description = 'Description must be at least 10 characters';
          }
          break;
        case 'longDescription':
          if (!value || value.trim().length < 50) {
            errors.longDescription = 'Long description must be at least 50 characters';
          }
          break;
        case 'category':
          if (!value || !['education','health','nutrition','emergency','infrastructure','other'].includes(value)) {
            errors.category = 'Please select a valid category';
          }
          break;
        case 'targetAmount':
          if (!value || isNaN(Number(value)) || Number(value) <= 0) {
            errors.targetAmount = 'Target amount must be a positive number';
          }
          break;
        case 'currency':
          if (!value || !['USD','EUR','GBP','KES','UGX'].includes(value)) {
            errors.currency = 'Please select a valid currency';
          }
          break;
        case 'image':
          if (!value || value.trim().length === 0) {
            errors.image = 'Image URL is required';
          }
          break;
        case 'country':
          if (!value || value.trim().length === 0) {
            errors.country = 'Country is required';
          }
          break;
        case 'startDate':
          if (!value) {
            errors.startDate = 'Start date is required';
          } else if (isNaN(Date.parse(value))) {
            errors.startDate = 'Please enter a valid start date';
          }
          break;
        case 'endDate':
          if (!value) {
            errors.endDate = 'End date is required';
          } else if (isNaN(Date.parse(value))) {
            errors.endDate = 'Please enter a valid end date';
          }
          break;
        case 'status':
          if (!value || !['active','completed','paused','upcoming'].includes(value)) {
            errors.status = 'Please select a valid status';
          }
          break;
      }
    }
    
    return errors;
  };

  const validateForm = (data, type = 'program') => {
    const errors = {};
    
    if (type === 'program') {
      const fields = ['name', 'description', 'longDescription', 'category', 'targetAmount', 'currency', 'image', 'country', 'startDate', 'endDate', 'status'];
      fields.forEach(field => {
        let value;
        if (field === 'country') {
          value = data.location?.country;
        } else if (field === 'startDate') {
          value = data.duration?.startDate;
        } else if (field === 'endDate') {
          value = data.duration?.endDate;
        } else {
          value = data[field];
        }
        const fieldErrors = validateField(field, value, type);
        Object.assign(errors, fieldErrors);
      });
    }
    
    return errors;
  };

  const calculateFormProgress = (data, type = 'program') => {
    if (type === 'program') {
      const requiredFields = [
        'name', 'description', 'longDescription', 'category', 'targetAmount', 
        'currency', 'image', 'location.country', 'duration.startDate', 'duration.endDate', 'status'
      ];
      
      let completedFields = 0;
      requiredFields.forEach(field => {
        const value = field.includes('.') ? 
          field.split('.').reduce((obj, key) => obj?.[key], data) : 
          data[field];
        
        if (value && (typeof value === 'string' ? value.trim().length > 0 : true)) {
          completedFields++;
        }
      });
      
      return Math.round((completedFields / requiredFields.length) * 100);
    }
    return 0;
  };

  const handleCreate = (type) => {
    setDialogType('create');
    setFormErrors({});
    setFormProgress(0);
    setActiveStep(0);
    setFormSections({
      basic: false,
      details: false,
      financial: false,
      impact: false,
      media: false
    });
    setDonationOptions([]);
    
    if (type === 'volunteer') {
      setEditingData({
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
        emergencyContact: '',
        emergencyPhone: '',
        message: '',
        status: 'pending',
        agreeToTerms: true // Admin creates volunteer on their behalf
      });
    } else if (type === 'program') {
      setEditingData({
        name: '',
        description: '',
        longDescription: '',
        category: '',
        targetAmount: '',
        currency: 'USD',
        image: '',
        location: {
          country: '',
          region: '',
          city: ''
        },
        duration: {
          startDate: '',
          endDate: ''
        },
        status: 'active',
        priority: 'medium',
        featured: true,
        tags: [],
        gallery: [],
        // Always reset impactMetrics to zero on save
        impactMetrics: {
          childrenHelped: 0,
          communitiesReached: 0,
          schoolsBuilt: 0,
          mealsProvided: 0,
          medicalCheckups: 0
        },
        targetMetrics: {
          childrenToHelp: 0,
          communitiesToReach: 0,
          schoolsToBuild: 0,
          mealsToProvide: 0,
          medicalCheckupsToProvide: 0
        },
        impactPerDollar: {
          children: 0.2,
          communities: 0.01,
          schools: 0.002,
          meals: 2,
          checkups: 0.1
        },
        donationOptions: []
      });
    } else {
      setEditingData({});
    }
    setSelectedItem({ type });
    setDialogOpen(true);
  };

  const handleEdit = (type, item) => {
    if (type === 'donation') return; // Donations cannot be edited by admin
    setDialogType('edit');
    setEditingData({ ...item });
    setSelectedItem({ type, data: item });
    
    // Load existing donation options if editing a program
    if (type === 'program' && item.donationOptions) {
      loadDonationOptionsFromJSON(item.donationOptions);
    } else {
      setDonationOptions([]);
    }
    
    setDialogOpen(true);
  };

  const handleView = (type, item) => {
    setDialogType('view');
    setSelectedItem({ type, data: item });
    setDialogOpen(true);
  };

  const handleDelete = async (type, id) => {
    if (type === 'donation') return; // Donations cannot be deleted by admin
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      setLoading(true);
      
      if (type === 'program') {
        await programsAPI.delete(id);
      } else if (type === 'volunteer') {
        await volunteersAPI.updateApplicationStatus(id, 'rejected');
      }

      setSnackbar({ open: true, message: 'Item deleted successfully', severity: 'success' });
      loadDashboardData();

    } catch (error) {
      console.error('Error deleting item:', error);
      setSnackbar({ open: true, message: 'Failed to delete item', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value, nestedField = null) => {
    let newData;
    if (nestedField) {
      newData = {
        ...editingData,
        [field]: { ...editingData[field], [nestedField]: value }
      };
    } else {
      newData = { ...editingData, [field]: value };
    }
    
    setEditingData(newData);
    
    // Real-time validation
    if (selectedItem?.type === 'program') {
      const fieldErrors = validateField(field, value, 'program');
      setFormErrors(prev => {
        const newErrors = { ...prev };
        // Clear the error for this field if validation passes
        if (!fieldErrors[field]) {
          delete newErrors[field];
        }
        // Add any new errors
        return { ...newErrors, ...fieldErrors };
      });
      
      // Calculate progress
      const progress = calculateFormProgress(newData, 'program');
      setFormProgress(progress);
    }
  };

  // Donation options functions
  const addDonationOption = () => {
    const newOption = {
      id: Date.now(),
      amount: '',
      description: '',
      impact: ''
    };
    setDonationOptions([...donationOptions, newOption]);
  };

  const removeDonationOption = (id) => {
    setDonationOptions(donationOptions.filter(option => option.id !== id));
  };

  const updateDonationOption = (id, field, value) => {
    setDonationOptions(donationOptions.map(option => 
      option.id === id ? { ...option, [field]: value } : option
    ));
  };

  const convertDonationOptionsToJSON = () => {
    const validOptions = donationOptions.filter(option => 
      option.amount && option.description && option.impact
    );
    return validOptions.map(option => ({
      amount: parseFloat(option.amount),
      description: option.description,
      impact: option.impact
    }));
  };

  const loadDonationOptionsFromJSON = (jsonData) => {
    try {
      const options = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      if (Array.isArray(options)) {
        const formattedOptions = options.map((option, index) => ({
          id: Date.now() + index,
          amount: option.amount?.toString() || '',
          description: option.description || '',
          impact: option.impact || ''
        }));
        setDonationOptions(formattedOptions);
      }
    } catch (error) {
      console.error('Error parsing donation options:', error);
      setDonationOptions([]);
    }
  };

  const handleSave = async () => {
    // Frontend validation based on item type
    if (selectedItem?.type === 'program') {
      const errors = validateForm(editingData, 'program');
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        setSnackbar({ 
          open: true, 
          message: 'Please fix the validation errors before saving', 
          severity: 'error' 
        });
        return;
      }
      setFormErrors({});
    }
    
    // For volunteers, we don't need validation since we're only editing specific fields
    // and the backend will handle validation
    try {
      setLoading(true);
      let payload = { ...editingData };
      
      // Convert donation options to JSON format for programs
      if (selectedItem?.type === 'program') {
        payload.donationOptions = convertDonationOptionsToJSON();
      }
      // Ensure nested objects are present
      if (!payload.location) payload.location = {};
      if (!payload.duration) payload.duration = {};
      // Convert targetAmount to number
      if (payload.targetAmount) payload.targetAmount = Number(payload.targetAmount);
      // Only send required fields
      payload = {
        name: payload.name,
        description: payload.description,
        longDescription: payload.longDescription,
        category: payload.category,
        targetAmount: payload.targetAmount,
        currency: payload.currency || 'USD',
        image: payload.image,
        location: { 
          country: payload.location.country,
          region: payload.location.region || '',
          city: payload.location.city || ''
        },
        duration: {
          startDate: payload.duration.startDate,
          endDate: payload.duration.endDate
        },
        status: payload.status || 'active',
        priority: payload.priority || 'medium',
        featured: payload.featured || false,
        tags: payload.tags || [],
        gallery: payload.gallery || [],
        // Always reset impactMetrics to zero on save
        impactMetrics: {
          childrenHelped: 0,
          communitiesReached: 0,
          schoolsBuilt: 0,
          mealsProvided: 0,
          medicalCheckups: 0
        },
        targetMetrics: payload.targetMetrics || {
          childrenToHelp: 0,
          communitiesToReach: 0,
          schoolsToBuild: 0,
          mealsToProvide: 0,
          medicalCheckupsToProvide: 0
        },
        impactPerDollar: payload.impactPerDollar || {
          children: 0.2,
          communities: 0.01,
          schools: 0.002,
          meals: 2,
          checkups: 0.1
        },
        donationOptions: payload.donationOptions || []
      };
      // Parse donation options if it's a string
      let donationOptions = payload.donationOptions || [];
      if (typeof donationOptions === 'string') {
        try {
          donationOptions = JSON.parse(donationOptions);
        } catch (error) {
          donationOptions = [];
        }
      }
      payload.donationOptions = donationOptions;

      if (dialogType === 'create') {
        if (selectedItem.type === 'program') {
          await programsAPI.create(payload);
        } else if (selectedItem.type === 'volunteer') {
          await volunteersAPI.apply(editingData);
        }
      } else if (dialogType === 'edit') {
        if (selectedItem.type === 'program') {
          await programsAPI.update(selectedItem.data._id, payload);
        } else if (selectedItem.type === 'volunteer') {
          // For volunteers, we can only update status through the API
          // Other fields would need a separate update endpoint
          if (editingData.status && editingData.status !== selectedItem.data.status) {
            await volunteersAPI.updateApplicationStatus(selectedItem.data._id, editingData.status);
          }
        }
      }
      setSnackbar({ open: true, message: 'Saved successfully', severity: 'success' });
      setDialogOpen(false);
      loadDashboardData();
    } catch (error) {
      console.error('Error saving:', error);
      let errorMsg = 'Failed to save';
      if (error.errors && Array.isArray(error.errors)) {
        errorMsg = error.errors.map(e => e.msg || e.message).join('; ');
      } else if (error.message) {
        errorMsg = error.message;
      }
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
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
        return <MonetizationOn />;
      case 'people':
        return <People />;
      case 'school':
        return <School />;
      case 'trending_up':
        return <TrendingUp />;
      case 'check_circle':
        return <CheckCircle />;
      default:
        return <MonetizationOn />;
    }
  };

  const handleFeedbackStatus = (id, status) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    fetch(`${API_BASE_URL}/feedback/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
      .then(async res => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setSnackbar({ open: true, message: data.message || 'Failed to update feedback status', severity: 'error' });
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (!data || !data.feedback) return;
        setSnackbar({ open: true, message: 'Feedback status updated!', severity: 'success' });
        // Refetch feedback list for current page after update
        fetch(`${API_BASE_URL}/feedback?page=${feedbackPage}&limit=${feedbackLimit}`)
          .then(res => res.json())
          .then(data => {
            setFeedbackList(data.feedback || []);
            setFeedbackTotalPages(data.totalPages || 1);
          });
      })
      .catch(() => {
        setSnackbar({ open: true, message: 'Failed to update feedback status', severity: 'error' });
      });
  };

  const handleSaveStory = (story) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const method = story._id ? 'PATCH' : 'POST';
    const url = story._id ? `${API_BASE_URL}/success-stories/${story._id}` : `${API_BASE_URL}/success-stories`;
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(story)
    })
      .then(res => res.json())
      .then(() => {
        setStoryDialogOpen(false);
        setEditingStory(null);
        // Refetch stories
        fetch(`${API_BASE_URL}/success-stories?page=${storiesPage}&limit=${storiesLimit}`)
          .then(res => res.json())
          .then(data => {
            setStories(data.stories || []);
            setStoriesTotalPages(data.totalPages || 1);
          });
      });
  };

  const handleUpdateStoryStatus = (storyId, status) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    fetch(`${API_BASE_URL}/success-stories/${storyId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
      .then(res => res.json())
      .then(() => {
        // Refetch stories
        fetch(`${API_BASE_URL}/success-stories?page=${storiesPage}&limit=${storiesLimit}`)
          .then(res => res.json())
          .then(data => {
            setStories(data.stories || []);
            setStoriesTotalPages(data.totalPages || 1);
          });
        
        setSnackbar({
          open: true,
          message: `Story ${status} successfully`,
          severity: 'success'
        });
      })
      .catch(() => {
        setSnackbar({
          open: true,
          message: 'Failed to update story status',
          severity: 'error'
        });
      });
  };

  const handleDeleteStory = (id) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    fetch(`${API_BASE_URL}/success-stories/${id}`, { method: 'DELETE' })
      .then(() => {
        // Refetch stories
        fetch(`${API_BASE_URL}/success-stories?page=${storiesPage}&limit=${storiesLimit}`)
          .then(res => res.json())
          .then(data => {
            setStories(data.stories || []);
            setStoriesTotalPages(data.totalPages || 1);
          });
      });
  };

  const handleSendNewsletter = async () => {
    if (!newsletterForm.subject.trim() || !newsletterForm.content.trim()) {
      setSnackbar({
        open: true,
        message: 'Please fill in both subject and content',
        severity: 'error'
      });
      return;
    }

    setSendingNewsletter(true);
    try {
      const response = await newsletterAPI.sendNewsletter(newsletterForm.subject, newsletterForm.content);
      setSnackbar({
        open: true,
        message: response.message,
        severity: 'success'
      });
      setNewsletterDialogOpen(false);
      setNewsletterForm({ subject: '', content: '' });
      loadNewsletterData(); // Refresh stats
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to send newsletter',
        severity: 'error'
      });
    } finally {
      setSendingNewsletter(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ color: 'var(--primary-green)', mb: 2 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          You need administrator privileges to access this dashboard.
        </Typography>
      </Box>
    );
  }

  return (
    <Box id="admin-dashboard" sx={{ py: { xs: 4, md: 6 }, mt: 8, background: '#f8f9fa' }}>
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
              value: `$${donationStats.totalAmount.toLocaleString()}`, 
              subtitle: `${donationStats.totalDonations} donations`,
              icon: 'donate', 
              color: '#4CAF50' 
            },
            { 
              title: 'Completed Donations', 
              value: `$${donationStats.completedAmount.toLocaleString()}`, 
              subtitle: `${donationStats.completedDonations} completed`,
              icon: 'check_circle', 
              color: '#2196F3' 
            },
            { 
              title: 'Monthly Revenue', 
              value: `$${donationStats.monthlyRevenue.toLocaleString()}`, 
              subtitle: `${donationStats.monthlyDonations} this month`,
              icon: 'trending_up', 
              color: '#FF9800' 
            },
            { 
              title: 'Active Programs', 
              value: programStats.activePrograms, 
              subtitle: 'Active programs',
              icon: 'school', 
              color: '#9C27B0' 
            },
            { 
              title: 'Total Volunteers', 
              value: volunteers.length, 
              subtitle: 'Volunteer applications',
              icon: 'people', 
              color: '#E91E63' 
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
                    <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#888' }}>
                      {stat.subtitle}
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
              '& .MuiTab-root': { 
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: 500,
                fontSize: '0.875rem',
                textTransform: 'none',
                minHeight: '48px',
                '&:hover': {
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              },
              '& .Mui-selected': { 
                color: 'white !important',
                fontWeight: 700,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'white',
                height: '3px'
              }
            }}
          >
            <Tab label="Donations" />
            <Tab label="Volunteers" />
            <Tab label="Programs" />
            <Tab label="Analytics" />
            <Tab label="Feedback" />
            <Tab label="Success Stories" />
            <Tab label="Newsletter" />
          </Tabs>

          {/* Donations Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Donation Management</Typography>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => {
                  loadDashboardData();
                }}
                sx={{ borderColor: 'var(--primary-green)', color: 'var(--primary-green)' }}
              >
                Refresh
              </Button>
            </Box>
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
                          onClick={() => handleView('donation', donation)}
                        >
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/* Pagination Controls for Donations */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setDonationsPage((prev) => Math.max(prev - 1, 1))}
                disabled={donationsPage === 1}
              >
                Previous
              </Button>
              <Typography variant="body2">
                Page {donationsPage} of {donationsTotalPages} ({donationsTotal} donations)
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setDonationsPage((prev) => Math.min(prev + 1, donationsTotalPages))}
                disabled={donationsPage === donationsTotalPages}
              >
                Next
              </Button>
            </Box>
          </TabPanel>

          {/* Volunteers Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Volunteer Applications</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleCreate('volunteer')}
                sx={{ background: 'var(--primary-green)' }}
              >
                Add Volunteer
              </Button>
            </Box>
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
                          {volunteer.skills?.slice(0, 2).map((skill, index) => (
                            <Chip key={index} label={skill} size="small" />
                          ))}
                          {volunteer.skills?.length > 2 && (
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
                        <IconButton 
                          size="small" 
                          onClick={() => handleView('volunteer', volunteer)}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleEdit('volunteer', volunteer)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete('volunteer', volunteer._id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Programs Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Program Management</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const result = await programsAPI.recalculateAmounts();
                      setSnackbar({ 
                        open: true, 
                        message: `Recalculated ${result.updatedPrograms} programs successfully`, 
                        severity: 'success' 
                      });
                      loadDashboardData();
                    } catch (error) {
                      console.error('Error recalculating amounts:', error);
                      setSnackbar({ 
                        open: true, 
                        message: 'Failed to recalculate program amounts', 
                        severity: 'error' 
                      });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  sx={{ borderColor: 'var(--primary-green)', color: 'var(--primary-green)' }}
                >
                  Recalculate Amounts
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleCreate('program')}
                  sx={{ background: 'var(--primary-green)' }}
                >
                  Add Program
                </Button>
              </Box>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Program Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Target Amount</TableCell>
                    <TableCell>Current Amount</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {programs.map((program) => (
                    <TableRow key={program._id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {program.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#666' }}>
                            {program.description?.substring(0, 50)}...
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={program.category} size="small" />
                      </TableCell>
                      <TableCell>${program.targetAmount?.toLocaleString()}</TableCell>
                      <TableCell>${program.currentAmount?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ 
                            width: 60, 
                            height: 8, 
                            backgroundColor: 'var(--light-green)',
                            borderRadius: 4,
                            overflow: 'hidden'
                          }}>
                            <Box 
                              sx={{ 
                                height: '100%', 
                                backgroundColor: 'var(--primary-green)',
                                width: `${Math.min((program.currentAmount / program.targetAmount) * 100, 100)}%`,
                                transition: 'width 0.3s ease'
                              }} 
                            />
                          </Box>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {Math.round((program.currentAmount / program.targetAmount) * 100)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={program.status} 
                          color={getStatusColor(program.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={() => handleView('program', program)}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleEdit('program', program)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete('program', program._id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Analytics Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" sx={{ mb: 3 }}>Analytics Dashboard</Typography>
            <Grid container spacing={3}>
              {/* Program Statistics */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Program Statistics</Typography>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Total Programs: {programStats.totalPrograms}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1, color: 'success.main' }}>
                        Active Programs: {programStats.activePrograms}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1, color: 'info.main' }}>
                        Completed Programs: {programStats.completedPrograms}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1, color: 'warning.main' }}>
                        Paused Programs: {programStats.pausedPrograms}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1, color: 'secondary.main' }}>
                        Upcoming Programs: {programStats.upcomingPrograms}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Donation Statistics */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Donation Statistics</Typography>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Total Donations: {stats.totalDonations}
                      </Typography>
                      <Typography variant="body2">
                        Monthly Revenue: ${stats.monthlyRevenue.toLocaleString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Volunteer Statistics</Typography>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Total Applications: {volunteerStats.totalVolunteers}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1, color: 'info.main' }}>
                        Pending Applications: {volunteerStats.pendingVolunteers}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1, color: 'warning.main' }}>
                        Reviewed Applications: {volunteerStats.reviewedVolunteers}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1, color: 'success.main' }}>
                        Approved Applications: {volunteerStats.approvedVolunteers}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1, color: 'error.main' }}>
                        Rejected Applications: {volunteerStats.rejectedVolunteers}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Recent Activity</Typography>
                    <List>
                      {donations.slice(0, 5).map((donation) => (
                        <ListItem key={donation._id}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'var(--primary-green)' }}>
                              <MonetizationOn />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={`$${donation.amount} donation to ${donation.program?.name}`}
                            secondary={new Date(donation.createdAt).toLocaleDateString()}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* Real-Time Impact Updates */}
            <Card sx={{ p: 4, mt: 4, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: 'var(--primary-green)' }}>
                Real-Time Impact Updates
              </Typography>
              
              <Grid container spacing={3}>
                {programs.map(program => (
                  <Grid item xs={12} md={6} key={program._id}>
                    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {program.name}
                        </Typography>
                        <Chip 
                          label={program.status} 
                          size="small"
                          color={program.status === 'active' ? 'success' : 'default'}
                        />
                      </Box>
                      
                      {/* Progress Bar */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Funding Progress
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {Math.round((program.currentAmount / program.targetAmount) * 100)}%
                          </Typography>
                        </Box>
                        <Box 
                          sx={{ 
                            width: '100%', 
                            height: 8, 
                            backgroundColor: 'var(--light-green)',
                            borderRadius: 4,
                            overflow: 'hidden'
                          }}
                        >
                          <Box 
                            sx={{ 
                              height: '100%', 
                              backgroundColor: 'var(--primary-green)',
                              width: `${Math.min((program.currentAmount / program.targetAmount) * 100, 100)}%`,
                              transition: 'width 0.3s ease'
                            }} 
                          />
                        </Box>
                      </Box>
                      
                      {/* Impact Metrics */}
                      {program.targetMetrics && (
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Impact Progress
                          </Typography>
                          
                          {/* Children Progress */}
                          {program.targetMetrics.childrenToHelp > 0 && (
                            <Box sx={{ mb: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Children: {program.impactMetrics?.childrenHelped || 0} / {program.targetMetrics.childrenToHelp}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {Math.round(((program.impactMetrics?.childrenHelped || 0) / program.targetMetrics.childrenToHelp) * 100)}%
                                </Typography>
                              </Box>
                              <Box 
                                sx={{ 
                                  width: '100%', 
                                  height: 4, 
                                  backgroundColor: 'rgba(0,0,0,0.1)',
                                  borderRadius: 2,
                                  overflow: 'hidden'
                                }}
                              >
                                <Box 
                                  sx={{ 
                                    height: '100%', 
                                    backgroundColor: '#4CAF50',
                                    width: `${Math.min(((program.impactMetrics?.childrenHelped || 0) / program.targetMetrics.childrenToHelp) * 100, 100)}%`,
                                    transition: 'width 0.3s ease'
                                  }} 
                                />
                              </Box>
                            </Box>
                          )}
                          
                          {/* Communities Progress */}
                          {program.targetMetrics.communitiesToReach > 0 && (
                            <Box sx={{ mb: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Communities: {program.impactMetrics?.communitiesReached || 0} / {program.targetMetrics.communitiesToReach}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {Math.round(((program.impactMetrics?.communitiesReached || 0) / program.targetMetrics.communitiesToReach) * 100)}%
                                </Typography>
                              </Box>
                              <Box 
                                sx={{ 
                                  width: '100%', 
                                  height: 4, 
                                  backgroundColor: 'rgba(0,0,0,0.1)',
                                  borderRadius: 2,
                                  overflow: 'hidden'
                                }}
                              >
                                <Box 
                                  sx={{ 
                                    height: '100%', 
                                    backgroundColor: '#2196F3',
                                    width: `${Math.min(((program.impactMetrics?.communitiesReached || 0) / program.targetMetrics.communitiesToReach) * 100, 100)}%`,
                                    transition: 'width 0.3s ease'
                                  }} 
                                />
                              </Box>
                            </Box>
                          )}
                          
                          {/* Schools Progress */}
                          {program.targetMetrics.schoolsToBuild > 0 && (
                            <Box sx={{ mb: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Schools: {program.impactMetrics?.schoolsBuilt || 0} / {program.targetMetrics.schoolsToBuild}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {Math.round(((program.impactMetrics?.schoolsBuilt || 0) / program.targetMetrics.schoolsToBuild) * 100)}%
                                </Typography>
                              </Box>
                              <Box 
                                sx={{ 
                                  width: '100%', 
                                  height: 4, 
                                  backgroundColor: 'rgba(0,0,0,0.1)',
                                  borderRadius: 2,
                                  overflow: 'hidden'
                                }}
                              >
                                <Box 
                                  sx={{ 
                                    height: '100%', 
                                    backgroundColor: '#FF9800',
                                    width: `${Math.min(((program.impactMetrics?.schoolsBuilt || 0) / program.targetMetrics.schoolsToBuild) * 100, 100)}%`,
                                    transition: 'width 0.3s ease'
                                  }} 
                                />
                              </Box>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Card>
          </TabPanel>

          {/* Feedback Tab */}
          <TabPanel value={tabValue} index={4}>
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>User Feedback</Typography>
              {feedbackList.length === 0 ? (
                <Typography>No feedback yet.</Typography>
              ) : (
                <>
                  {feedbackList.map(fb => (
                    <Paper key={fb._id} sx={{ mb: 2, p: 2 }}>
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>{fb.name || 'Anonymous'} ({fb.email || 'No email'})</Typography>
                      <Typography variant="body1" sx={{ my: 1 }}>{fb.feedback}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{new Date(fb.createdAt).toLocaleString()}</Typography>
                      <Typography variant="caption" sx={{ color: fb.status === 'addressed' ? 'green' : fb.status === 'read' ? 'orange' : 'gray', ml: 2 }}>
                        Status: {fb.status}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {fb.status !== 'read' && (
                          <Button size="small" onClick={() => handleFeedbackStatus(fb._id, 'read')} sx={{ mr: 1 }}>Mark as Read</Button>
                        )}
                        {fb.status !== 'addressed' && (
                          <Button size="small" color="success" onClick={() => handleFeedbackStatus(fb._id, 'addressed')}>Mark as Addressed</Button>
                        )}
                      </Box>
                    </Paper>
                  ))}
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={feedbackPage <= 1}
                      onClick={() => setFeedbackPage(p => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Typography variant="body2">
                      Page {feedbackPage} of {feedbackTotalPages}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={feedbackPage >= feedbackTotalPages}
                      onClick={() => setFeedbackPage(p => Math.min(feedbackTotalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </TabPanel>

          {/* Success Stories Tab */}
          <TabPanel value={tabValue} index={5}>
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>Review Success Stories</Typography>
              <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                Review and approve user-submitted success stories. Only approved stories will appear on the public website.
              </Typography>
              
              {stories.length === 0 ? (
                <Typography>No stories to review yet.</Typography>
              ) : (
                <>
                  {stories.map(story => (
                    <Paper key={story._id} sx={{ mb: 2, p: 3, border: story.status === 'pending' ? '2px solid #ff9800' : story.status === 'approved' ? '2px solid #4caf50' : '2px solid #f44336' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6">{story.title}</Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            By: {story.author} • {story.email} • {story.date ? new Date(story.date).toLocaleDateString() : ''}
                          </Typography>
                          {story.category && (
                            <Typography variant="caption" sx={{ 
                              display: 'inline-block', 
                              bgcolor: 'primary.light', 
                              color: 'primary.contrastText', 
                              px: 1, 
                              py: 0.5, 
                              borderRadius: 1,
                              mb: 1
                            }}>
                              {story.category}
                            </Typography>
                          )}
                          {story.rating && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="caption">Rating:</Typography>
                              <Rating value={story.rating} readOnly size="small" />
                            </Box>
                          )}
                          {story.location && (
                            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                              Location: {story.location}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip 
                            label={story.status} 
                            color={story.status === 'pending' ? 'warning' : story.status === 'approved' ? 'success' : 'error'}
                            size="small"
                          />
                        </Box>
                      </Box>
                      
                      <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                        {story.content}
                      </Typography>
                      
                      {story.image && (
                        <Box sx={{ mb: 2 }}>
                          <img src={story.image} alt="story" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }} />
                        </Box>
                      )}
                      
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {story.status === 'pending' && (
                          <>
                            <Button 
                              size="small" 
                              variant="contained" 
                              color="success"
                              onClick={() => handleUpdateStoryStatus(story._id, 'approved')}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="small" 
                              variant="contained" 
                              color="error"
                              onClick={() => handleUpdateStoryStatus(story._id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {story.status === 'approved' && (
                          <Button 
                            size="small" 
                            variant="outlined" 
                            color="warning"
                            onClick={() => handleUpdateStoryStatus(story._id, 'pending')}
                          >
                            Unapprove
                          </Button>
                        )}
                        {story.status === 'rejected' && (
                          <Button 
                            size="small" 
                            variant="outlined" 
                            color="success"
                            onClick={() => handleUpdateStoryStatus(story._id, 'approved')}
                          >
                            Approve
                          </Button>
                        )}
                        <Button 
                          size="small" 
                          variant="outlined" 
                          onClick={() => { setEditingStory(story); setStoryDialogOpen(true); }}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="small" 
                          color="error" 
                          variant="outlined"
                          onClick={() => handleDeleteStory(story._id)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </Paper>
                  ))}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={storiesPage <= 1}
                      onClick={() => setStoriesPage(p => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Typography variant="body2">
                      Page {storiesPage} of {storiesTotalPages}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={storiesPage >= storiesTotalPages}
                      onClick={() => setStoriesPage(p => Math.min(storiesTotalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </Box>
                </>
              )}
              
              {/* Story Edit Dialog */}
              <Dialog open={storyDialogOpen} onClose={() => setStoryDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Edit Story</DialogTitle>
                <DialogContent>
                  <TextField
                    label="Title"
                    fullWidth
                    sx={{ mb: 2 }}
                    value={editingStory?.title || ''}
                    onChange={e => setEditingStory({ ...editingStory, title: e.target.value })}
                  />
                  <TextField
                    label="Author"
                    fullWidth
                    sx={{ mb: 2 }}
                    value={editingStory?.author || ''}
                    onChange={e => setEditingStory({ ...editingStory, author: e.target.value })}
                  />
                  <TextField
                    label="Email"
                    fullWidth
                    sx={{ mb: 2 }}
                    value={editingStory?.email || ''}
                    onChange={e => setEditingStory({ ...editingStory, email: e.target.value })}
                  />
                  <TextField
                    label="Category"
                    fullWidth
                    sx={{ mb: 2 }}
                    value={editingStory?.category || ''}
                    onChange={e => setEditingStory({ ...editingStory, category: e.target.value })}
                  />
                  <TextField
                    label="Location"
                    fullWidth
                    sx={{ mb: 2 }}
                    value={editingStory?.location || ''}
                    onChange={e => setEditingStory({ ...editingStory, location: e.target.value })}
                  />
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>Rating:</Typography>
                    <Rating
                      value={editingStory?.rating || 5}
                      onChange={(event, newValue) => setEditingStory({ ...editingStory, rating: newValue })}
                    />
                  </Box>
                  <ImageUploadField 
                    label="Image" 
                    value={editingStory?.image || ''} 
                    onChange={val => setEditingStory({ ...editingStory, image: val })} 
                  />
                  <TextField
                    label="Content"
                    fullWidth
                    multiline
                    minRows={4}
                    sx={{ mb: 2 }}
                    value={editingStory?.content || ''}
                    onChange={e => setEditingStory({ ...editingStory, content: e.target.value })}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ mr: 2 }}>Featured:</Typography>
                    <input
                      type="checkbox"
                      checked={!!editingStory?.featured}
                      onChange={e => setEditingStory({ ...editingStory, featured: e.target.checked })}
                    />
                  </Box>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={editingStory?.status || 'pending'}
                      onChange={e => setEditingStory({ ...editingStory, status: e.target.value })}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setStoryDialogOpen(false)}>Cancel</Button>
                  <Button onClick={() => handleSaveStory(editingStory || {})} variant="contained">Save</Button>
                </DialogActions>
              </Dialog>
            </Box>
          </TabPanel>

          {/* Newsletter Tab */}
          <TabPanel value={tabValue} index={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Newsletter Subscribers</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setNewsletterDialogOpen(true)}
                  sx={{ background: 'var(--primary-green)' }}
                >
                  Send Newsletter
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => loadNewsletterData()}
                  sx={{ borderColor: 'var(--primary-green)', color: 'var(--primary-green)' }}
                >
                  Refresh
                </Button>
              </Box>
            </Box>

            {/* Newsletter Stats */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #f0f9f4 0%, #e8f5e8 100%)', 
                  color: '#2e7d32',
                  border: '1px solid #c8e6c9'
                }}>
                  <CardContent>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {newsletterStats.totalSubscribers}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#4caf50' }}>Active Subscribers</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #fef7f7 0%, #fce4ec 100%)', 
                  color: '#c62828',
                  border: '1px solid #ffcdd2'
                }}>
                  <CardContent>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {newsletterStats.totalUnsubscribed}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#f44336' }}>Unsubscribed</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #f3f8ff 0%, #e3f2fd 100%)', 
                  color: '#1565c0',
                  border: '1px solid #bbdefb'
                }}>
                  <CardContent>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {newsletterStats.newThisMonth}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#2196f3' }}>New This Month</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)', 
                  color: '#424242',
                  border: '1px solid #e0e0e0'
                }}>
                  <CardContent>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {newsletterStats.totalEmails}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#757575' }}>Total Emails</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Subscribers Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Subscribed Date</TableCell>
                    <TableCell>Last Email Sent</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subscribers.map((subscriber) => (
                    <TableRow key={subscriber._id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            <Email />
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {subscriber.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={subscriber.isActive ? 'Active' : 'Inactive'} 
                          color={subscriber.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(subscriber.subscribedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {subscriber.lastEmailSent 
                          ? new Date(subscriber.lastEmailSent).toLocaleDateString()
                          : 'Never'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination Controls for Subscribers */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setSubscribersPage((prev) => Math.max(prev - 1, 1))}
                disabled={subscribersPage === 1}
              >
                Previous
              </Button>
              <Typography variant="body2">
                Page {subscribersPage} of {subscribersTotalPages} ({subscribers.length} subscribers)
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setSubscribersPage((prev) => Math.min(prev + 1, subscribersTotalPages))}
                disabled={subscribersPage === subscribersTotalPages}
              >
                Next
              </Button>
            </Box>
          </TabPanel>
        </Paper>

        {/* CRUD Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {dialogType === 'create' ? 'Create New' : 
             dialogType === 'edit' ? 'Edit' : 'View'} {selectedItem?.type}
          </DialogTitle>
          <DialogContent>
            {selectedItem?.type === 'program' && (
              <Box sx={{ pt: 2 }}>
                {/* Form Progress Indicator */}
                {dialogType === 'create' && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Progress: {formProgress}% complete
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={formProgress} 
                      sx={{ mt: 1 }}
                    />
                  </Box>
                )}

                {/* Basic Information Section */}
                <Accordion 
                  expanded={formSections.basic} 
                  onChange={() => setFormSections(prev => ({ ...prev, basic: !prev.basic }))}
                  sx={{ mb: 2 }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--primary-green)' }}>
                      📝 Basic Information
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Provide the essential details about your program that will be displayed to donors.
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Program Name"
                          placeholder="e.g., Clean Water for Rural Schools"
                          value={dialogType === 'view' ? selectedItem.data?.name || '' : editingData.name || ''}
                          onChange={(e) => handleFieldChange('name', e.target.value)}
                          disabled={dialogType === 'view'}
                          error={!!formErrors.name}
                          helperText={formErrors.name || "Choose a clear, compelling name that describes your program's impact"}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: 'var(--primary-green)',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth error={!!formErrors.category}>
                          <InputLabel shrink>Category *</InputLabel>
                          <Select
                            value={dialogType === 'view' ? selectedItem.data?.category || '' : editingData.category || ''}
                            onChange={(e) => handleFieldChange('category', e.target.value)}
                            disabled={dialogType === 'view'}
                            label="Category *"
                            required
                            displayEmpty
                            renderValue={(selected) => {
                              if (!selected) {
                                return <em style={{ color: '#999' }}>Select a category</em>;
                              }
                              return selected;
                            }}
                          >
                            <MenuItem value="education">Education</MenuItem>
                            <MenuItem value="health">Health</MenuItem>
                            <MenuItem value="nutrition">Nutrition</MenuItem>
                            <MenuItem value="emergency">Emergency</MenuItem>
                            <MenuItem value="infrastructure">Infrastructure</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                          </Select>
                          {formErrors.category && <FormHelperText>{formErrors.category}</FormHelperText>}
                        </FormControl>
                      </Grid>
                      {(editingData.category === 'other' || selectedItem.data?.category === 'other') && (
                        <Grid item xs={12} md={8}>
                          <TextField
                            fullWidth
                            label="Custom Category"
                            placeholder="Enter your custom category name"
                            value={dialogType === 'view' ? selectedItem.data?.customCategory || '' : editingData.customCategory || ''}
                            onChange={(e) => handleFieldChange('customCategory', e.target.value)}
                            disabled={dialogType === 'view'}
                            error={!!formErrors.customCategory}
                            helperText={formErrors.customCategory || "Specify the custom category name"}
                            required={editingData.category === 'other' || selectedItem.data?.category === 'other'}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: 'var(--primary-green)',
                                },
                              },
                            }}
                          />
                        </Grid>
                      )}
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="Short Description"
                          placeholder="Brief summary of what this program does and its impact..."
                          value={dialogType === 'view' ? selectedItem.data?.description || '' : editingData.description || ''}
                          onChange={(e) => handleFieldChange('description', e.target.value)}
                          disabled={dialogType === 'view'}
                          error={!!formErrors.description}
                          helperText={formErrors.description || "Keep it concise but compelling - this appears on program cards"}
                          required
                          inputProps={{ maxLength: 1000 }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: 'var(--primary-green)',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          label="Detailed Description"
                          placeholder="Provide a comprehensive description of the program, including background, methodology, expected outcomes, and long-term impact..."
                          value={dialogType === 'view' ? selectedItem.data?.longDescription || '' : editingData.longDescription || ''}
                          onChange={(e) => handleFieldChange('longDescription', e.target.value)}
                          disabled={dialogType === 'view'}
                          error={!!formErrors.longDescription}
                          helperText={formErrors.longDescription || "This detailed description helps donors understand the full scope and impact of your program"}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: 'var(--primary-green)',
                              },
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {/* Financial Information Section */}
                <Accordion 
                  expanded={formSections.financial} 
                  onChange={() => setFormSections(prev => ({ ...prev, financial: !prev.financial }))}
                  sx={{ mb: 2 }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--primary-green)' }}>
                      💰 Financial Information
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Set the funding goals and currency for your program. The target amount will be displayed to donors.
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Target Amount"
                          placeholder="e.g., 50000"
                          value={dialogType === 'view' ? selectedItem.data?.targetAmount || '' : editingData.targetAmount || ''}
                          onChange={(e) => handleFieldChange('targetAmount', e.target.value)}
                          disabled={dialogType === 'view'}
                          error={!!formErrors.targetAmount}
                          helperText={formErrors.targetAmount || "The total amount needed to complete this program"}
                          required
                          inputProps={{ min: 1 }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: 'var(--primary-green)',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Current Amount"
                          placeholder="e.g., 15000"
                          value={dialogType === 'view' ? selectedItem.data?.currentAmount || 0 : editingData.currentAmount || 0}
                          onChange={(e) => handleFieldChange('currentAmount', e.target.value)}
                          disabled={dialogType === 'view'}
                          helperText="Amount already raised (leave 0 for new programs)"
                          inputProps={{ min: 0 }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: 'var(--primary-green)',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth error={!!formErrors.currency}>
                          <InputLabel shrink>Currency *</InputLabel>
                          <Select
                            value={dialogType === 'view' ? selectedItem.data?.currency || 'USD' : editingData.currency || 'USD'}
                            onChange={(e) => handleFieldChange('currency', e.target.value)}
                            disabled={dialogType === 'view'}
                            label="Currency *"
                            required
                            displayEmpty
                            renderValue={(selected) => {
                              if (!selected || selected === 'USD') {
                                return <em style={{ color: '#999' }}>Select a currency</em>;
                              }
                              return selected;
                            }}
                          >
                            <MenuItem value="USD">🇺🇸 USD - US Dollar</MenuItem>
                            <MenuItem value="EUR">🇪🇺 EUR - Euro</MenuItem>
                            <MenuItem value="GBP">🇬🇧 GBP - British Pound</MenuItem>
                            <MenuItem value="KES">🇰🇪 KES - Kenyan Shilling</MenuItem>
                            <MenuItem value="UGX">🇺🇬 UGX - Ugandan Shilling</MenuItem>
                          </Select>
                          {formErrors.currency && <FormHelperText>{formErrors.currency}</FormHelperText>}
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: 'rgba(0,255,140,0.05)', 
                          borderRadius: 2, 
                          border: '1px solid rgba(0,255,140,0.1)' 
                        }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Progress Preview:</strong>
                          </Typography>
                          <Typography variant="h6" sx={{ color: 'var(--primary-green)', fontWeight: 600 }}>
                            {editingData.currentAmount || 0} / {editingData.targetAmount || 0} 
                            {editingData.currency || 'USD'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {editingData.targetAmount ? 
                              `${Math.round(((editingData.currentAmount || 0) / editingData.targetAmount) * 100)}% funded` : 
                              '0% funded'
                            }
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {/* Location & Timeline Section */}
                <Accordion 
                  expanded={formSections.details} 
                  onChange={() => setFormSections(prev => ({ ...prev, details: !prev.details }))}
                  sx={{ mb: 2 }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--primary-green)' }}>
                      🌍 Location & Timeline
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Specify where your program will take place and when it will run. This helps donors understand the scope and timeline.
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Country"
                          placeholder="e.g., Kenya"
                          value={dialogType === 'view' ? selectedItem.data?.location?.country || '' : editingData.location?.country || ''}
                          onChange={(e) => handleFieldChange('location', e.target.value, 'country')}
                          disabled={dialogType === 'view'}
                          error={!!formErrors.country}
                          helperText={formErrors.country || "Primary country where the program operates"}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: 'var(--primary-green)',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Region/State"
                          placeholder="e.g., Western Province"
                          value={dialogType === 'view' ? selectedItem.data?.location?.region || '' : editingData.location?.region || ''}
                          onChange={(e) => handleFieldChange('location', e.target.value, 'region')}
                          disabled={dialogType === 'view'}
                          helperText="State, province, or region within the country"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: 'var(--primary-green)',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="City/Town"
                          placeholder="e.g., Kisumu"
                          value={dialogType === 'view' ? selectedItem.data?.location?.city || '' : editingData.location?.city || ''}
                          onChange={(e) => handleFieldChange('location', e.target.value, 'city')}
                          disabled={dialogType === 'view'}
                          helperText="Specific city or town (optional)"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: 'var(--primary-green)',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Latitude"
                          placeholder="e.g., -0.0917"
                          type="number"
                          value={dialogType === 'view' ? selectedItem.data?.location?.coordinates?.lat || '' : editingData.location?.coordinates?.lat || ''}
                          onChange={(e) => handleFieldChange('location', { ...editingData.location, coordinates: { ...editingData.location?.coordinates, lat: parseFloat(e.target.value) || 0 } })}
                          disabled={dialogType === 'view'}
                          helperText="GPS latitude for precise location mapping (optional)"
                          inputProps={{ step: 0.000001, min: -90, max: 90 }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: 'var(--primary-green)',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Longitude"
                          placeholder="e.g., 34.7680"
                          type="number"
                          value={dialogType === 'view' ? selectedItem.data?.location?.coordinates?.lng || '' : editingData.location?.coordinates?.lng || ''}
                          onChange={(e) => handleFieldChange('location', { ...editingData.location, coordinates: { ...editingData.location?.coordinates, lng: parseFloat(e.target.value) || 0 } })}
                          disabled={dialogType === 'view'}
                          helperText="GPS longitude for precise location mapping (optional)"
                          inputProps={{ step: 0.000001, min: -180, max: 180 }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: 'var(--primary-green)',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="date"
                          label="Start Date"
                          InputLabelProps={{ shrink: true }}
                          value={dialogType === 'view' ? selectedItem.data?.duration?.startDate || '' : editingData.duration?.startDate || ''}
                          onChange={(e) => handleFieldChange('duration', e.target.value, 'startDate')}
                          disabled={dialogType === 'view'}
                          error={!!formErrors.startDate}
                          helperText={formErrors.startDate || "When the program will begin"}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: 'var(--primary-green)',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="date"
                          label="End Date"
                          InputLabelProps={{ shrink: true }}
                          value={dialogType === 'view' ? selectedItem.data?.duration?.endDate || '' : editingData.duration?.endDate || ''}
                          onChange={(e) => handleFieldChange('duration', e.target.value, 'endDate')}
                          disabled={dialogType === 'view'}
                          error={!!formErrors.endDate}
                          helperText={formErrors.endDate || "Expected completion date"}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: 'var(--primary-green)',
                              },
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {/* Media & Settings Section */}
                <Accordion 
                  expanded={formSections.media} 
                  onChange={() => setFormSections(prev => ({ ...prev, media: !prev.media }))}
                  sx={{ mb: 2 }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--primary-green)' }}>
                      🖼️ Media & Settings
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Upload images and configure program settings. Featured programs appear prominently on the homepage.
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <ImageUploadField 
                          label="Main Program Image" 
                          value={dialogType === 'view' ? selectedItem.data?.image || '' : editingData.image || ''} 
                          onChange={val => handleFieldChange('image', val)} 
                          disabled={dialogType === 'view'} 
                        />
                        {formErrors.image && (
                          <FormHelperText error>{formErrors.image}</FormHelperText>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          This image will be displayed on program cards and detail pages. Recommended size: 800x600px
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth error={!!formErrors.status}>
                          <InputLabel shrink>Program Status *</InputLabel>
                          <Select
                            value={dialogType === 'view' ? selectedItem.data?.status || 'active' : editingData.status || 'active'}
                            onChange={(e) => handleFieldChange('status', e.target.value)}
                            disabled={dialogType === 'view'}
                            required={dialogType === 'create'}
                            label="Program Status *"
                            displayEmpty
                            renderValue={(selected) => {
                              if (!selected || selected === 'active') {
                                return <em style={{ color: '#999' }}>Select program status</em>;
                              }
                              return selected;
                            }}
                          >
                            <MenuItem value="active">Active - Currently accepting donations</MenuItem>
                            <MenuItem value="upcoming">Upcoming - Not yet started</MenuItem>
                            <MenuItem value="paused">Paused - Temporarily suspended</MenuItem>
                            <MenuItem value="completed">Completed - Program finished</MenuItem>
                          </Select>
                          {formErrors.status && <FormHelperText>{formErrors.status}</FormHelperText>}
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel shrink>Priority Level</InputLabel>
                          <Select
                            value={dialogType === 'view' ? selectedItem.data?.priority || 'medium' : editingData.priority || 'medium'}
                            onChange={(e) => handleFieldChange('priority', e.target.value)}
                            disabled={dialogType === 'view'}
                            label="Priority Level"
                            displayEmpty
                            renderValue={(selected) => {
                              if (!selected || selected === 'medium') {
                                return <em style={{ color: '#999' }}>Select priority level</em>;
                              }
                              return selected;
                            }}
                          >
                            <MenuItem value="low">Low Priority</MenuItem>
                            <MenuItem value="medium">Medium Priority</MenuItem>
                            <MenuItem value="high">High Priority</MenuItem>
                            <MenuItem value="urgent">Urgent Priority</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel shrink>Featured Program</InputLabel>
                          <Select
                            value={dialogType === 'view' ? selectedItem.data?.featured || false : editingData.featured || false}
                            onChange={(e) => handleFieldChange('featured', e.target.value)}
                            disabled={dialogType === 'view'}
                            label="Featured Program"
                          >
                            <MenuItem value={true}>Yes - Show on homepage</MenuItem>
                            <MenuItem value={false}>No - Regular listing</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Tags"
                          placeholder="e.g., education, rural, children, clean water"
                          value={dialogType === 'view' ? (selectedItem.data?.tags || []).join(', ') : (editingData.tags || []).join(', ')}
                          onChange={(e) => handleFieldChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
                          disabled={dialogType === 'view'}
                          helperText="Add relevant keywords separated by commas to help donors find your program"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: 'var(--primary-green)',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          label="Additional Gallery Images"
                          placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
                          value={dialogType === 'view' ? (selectedItem.data?.gallery || []).join('\n') : (editingData.gallery || []).join('\n')}
                          onChange={(e) => handleFieldChange('gallery', e.target.value.split('\n').map(url => url.trim()).filter(url => url))}
                          disabled={dialogType === 'view'}
                          helperText="Enter additional image URLs, one per line. These will be shown in the program gallery."
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: 'var(--primary-green)',
                              },
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {/* Impact Metrics Section */}
                <Accordion 
                  expanded={formSections.impact} 
                  onChange={() => setFormSections(prev => ({ ...prev, impact: !prev.impact }))}
                  sx={{ mb: 2 }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--primary-green)' }}>
                      📊 Impact Metrics & Goals
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Define the measurable impact your program aims to achieve. These metrics help donors understand the tangible outcomes of their contributions.
                    </Typography>
                    
                      {/* Current Impact Metrics */}
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'var(--primary-green)' }}>
                        📈 Current Impact (Achieved So Far)
                        </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Track the impact your program has already made. Leave as 0 for new programs.
                      </Typography>
                      <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Children Helped"
                            placeholder="0"
                          value={dialogType === 'view' ? selectedItem.data?.impactMetrics?.childrenHelped || 0 : editingData.impactMetrics?.childrenHelped || 0}
                          onChange={(e) => handleFieldChange('impactMetrics', { ...editingData.impactMetrics, childrenHelped: parseInt(e.target.value) || 0 })}
                          disabled={dialogType === 'view'}
                            helperText="Number of children directly helped"
                            inputProps={{ min: 0 }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: 'var(--primary-green)',
                                },
                              },
                            }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Communities Reached"
                            placeholder="0"
                          value={dialogType === 'view' ? selectedItem.data?.impactMetrics?.communitiesReached || 0 : editingData.impactMetrics?.communitiesReached || 0}
                          onChange={(e) => handleFieldChange('impactMetrics', { ...editingData.impactMetrics, communitiesReached: parseInt(e.target.value) || 0 })}
                          disabled={dialogType === 'view'}
                            helperText="Number of communities impacted"
                            inputProps={{ min: 0 }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: 'var(--primary-green)',
                                },
                              },
                            }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Schools Built"
                            placeholder="0"
                          value={dialogType === 'view' ? selectedItem.data?.impactMetrics?.schoolsBuilt || 0 : editingData.impactMetrics?.schoolsBuilt || 0}
                          onChange={(e) => handleFieldChange('impactMetrics', { ...editingData.impactMetrics, schoolsBuilt: parseInt(e.target.value) || 0 })}
                          disabled={dialogType === 'view'}
                            helperText="Number of schools constructed"
                            inputProps={{ min: 0 }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: 'var(--primary-green)',
                                },
                              },
                            }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Meals Provided"
                            placeholder="0"
                          value={dialogType === 'view' ? selectedItem.data?.impactMetrics?.mealsProvided || 0 : editingData.impactMetrics?.mealsProvided || 0}
                          onChange={(e) => handleFieldChange('impactMetrics', { ...editingData.impactMetrics, mealsProvided: parseInt(e.target.value) || 0 })}
                          disabled={dialogType === 'view'}
                            helperText="Total meals distributed"
                            inputProps={{ min: 0 }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: 'var(--primary-green)',
                                },
                              },
                            }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Medical Checkups"
                            placeholder="0"
                          value={dialogType === 'view' ? selectedItem.data?.impactMetrics?.medicalCheckups || 0 : editingData.impactMetrics?.medicalCheckups || 0}
                          onChange={(e) => handleFieldChange('impactMetrics', { ...editingData.impactMetrics, medicalCheckups: parseInt(e.target.value) || 0 })}
                          disabled={dialogType === 'view'}
                            helperText="Number of medical checkups provided"
                            inputProps={{ min: 0 }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: 'var(--primary-green)',
                                },
                              },
                            }}
                        />
                      </Grid>
                      </Grid>
                    </Box>

                      {/* Target Metrics */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'var(--primary-green)' }}>
                        🎯 Target Goals (What You Plan to Achieve)
                        </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Set the goals your program aims to achieve. These will be displayed to donors to show the program's potential impact.
                      </Typography>
                      <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Target Children to Help"
                            placeholder="e.g., 500"
                          value={dialogType === 'view' ? selectedItem.data?.targetMetrics?.childrenToHelp || 0 : editingData.targetMetrics?.childrenToHelp || 0}
                          onChange={(e) => handleFieldChange('targetMetrics', { ...editingData.targetMetrics, childrenToHelp: parseInt(e.target.value) || 0 })}
                          disabled={dialogType === 'view'}
                            helperText="Total children you aim to help"
                            inputProps={{ min: 0 }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: 'var(--primary-green)',
                                },
                              },
                            }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Target Communities to Reach"
                            placeholder="e.g., 10"
                          value={dialogType === 'view' ? selectedItem.data?.targetMetrics?.communitiesToReach || 0 : editingData.targetMetrics?.communitiesToReach || 0}
                          onChange={(e) => handleFieldChange('targetMetrics', { ...editingData.targetMetrics, communitiesToReach: parseInt(e.target.value) || 0 })}
                          disabled={dialogType === 'view'}
                            helperText="Number of communities to impact"
                            inputProps={{ min: 0 }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: 'var(--primary-green)',
                                },
                              },
                            }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Target Schools to Build"
                            placeholder="e.g., 3"
                          value={dialogType === 'view' ? selectedItem.data?.targetMetrics?.schoolsToBuild || 0 : editingData.targetMetrics?.schoolsToBuild || 0}
                          onChange={(e) => handleFieldChange('targetMetrics', { ...editingData.targetMetrics, schoolsToBuild: parseInt(e.target.value) || 0 })}
                          disabled={dialogType === 'view'}
                            helperText="Number of schools to construct"
                            inputProps={{ min: 0 }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: 'var(--primary-green)',
                                },
                              },
                            }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Target Meals to Provide"
                            placeholder="e.g., 10000"
                          value={dialogType === 'view' ? selectedItem.data?.targetMetrics?.mealsToProvide || 0 : editingData.targetMetrics?.mealsToProvide || 0}
                          onChange={(e) => handleFieldChange('targetMetrics', { ...editingData.targetMetrics, mealsToProvide: parseInt(e.target.value) || 0 })}
                          disabled={dialogType === 'view'}
                            helperText="Total meals to distribute"
                            inputProps={{ min: 0 }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: 'var(--primary-green)',
                                },
                              },
                            }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Target Medical Checkups"
                            placeholder="e.g., 200"
                          value={dialogType === 'view' ? selectedItem.data?.targetMetrics?.medicalCheckupsToProvide || 0 : editingData.targetMetrics?.medicalCheckupsToProvide || 0}
                          onChange={(e) => handleFieldChange('targetMetrics', { ...editingData.targetMetrics, medicalCheckupsToProvide: parseInt(e.target.value) || 0 })}
                          disabled={dialogType === 'view'}
                            helperText="Number of medical checkups to provide"
                            inputProps={{ min: 0 }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: 'var(--primary-green)',
                                },
                              },
                            }}
                        />
                      </Grid>
                      </Grid>
                    </Box>

                      {/* Impact Per Dollar */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" sx={{ mb: 2, mt: 3, fontWeight: 600, color: 'var(--primary-green)' }}>
                        💰 Impact Per Dollar
                        </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Define how much impact each dollar donated will create. This helps donors understand the value of their contribution.
                      </Typography>
                      <Grid container spacing={3}>
                      <Grid item xs={12} md={2.4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Children per $1"
                            placeholder="0.01"
                          value={dialogType === 'view' ? selectedItem.data?.impactPerDollar?.children || 0 : editingData.impactPerDollar?.children || 0}
                          onChange={(e) => handleFieldChange('impactPerDollar', { ...editingData.impactPerDollar, children: parseFloat(e.target.value) || 0 })}
                          disabled={dialogType === 'view'}
                            helperText="Children helped per dollar"
                            inputProps={{ step: 0.01, min: 0 }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: 'var(--primary-green)',
                                },
                              },
                            }}
                        />
                      </Grid>
                      <Grid item xs={12} md={2.4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Communities per $1"
                            placeholder="0.001"
                          value={dialogType === 'view' ? selectedItem.data?.impactPerDollar?.communities || 0 : editingData.impactPerDollar?.communities || 0}
                          onChange={(e) => handleFieldChange('impactPerDollar', { ...editingData.impactPerDollar, communities: parseFloat(e.target.value) || 0 })}
                          disabled={dialogType === 'view'}
                            helperText="Communities reached per dollar"
                            inputProps={{ step: 0.001, min: 0 }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: 'var(--primary-green)',
                                },
                              },
                            }}
                        />
                      </Grid>
                      <Grid item xs={12} md={2.4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Schools per $1"
                            placeholder="0.0001"
                          value={dialogType === 'view' ? selectedItem.data?.impactPerDollar?.schools || 0 : editingData.impactPerDollar?.schools || 0}
                          onChange={(e) => handleFieldChange('impactPerDollar', { ...editingData.impactPerDollar, schools: parseFloat(e.target.value) || 0 })}
                          disabled={dialogType === 'view'}
                            helperText="Schools built per dollar"
                            inputProps={{ step: 0.0001, min: 0 }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: 'var(--primary-green)',
                                },
                              },
                            }}
                        />
                      </Grid>
                      <Grid item xs={12} md={2.4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Meals per $1"
                            placeholder="0.1"
                          value={dialogType === 'view' ? selectedItem.data?.impactPerDollar?.meals || 0 : editingData.impactPerDollar?.meals || 0}
                          onChange={(e) => handleFieldChange('impactPerDollar', { ...editingData.impactPerDollar, meals: parseFloat(e.target.value) || 0 })}
                          disabled={dialogType === 'view'}
                            helperText="Meals provided per dollar"
                            inputProps={{ step: 0.1, min: 0 }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: 'var(--primary-green)',
                                },
                              },
                            }}
                        />
                      </Grid>
                      <Grid item xs={12} md={2.4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Checkups per $1"
                            placeholder="0.01"
                          value={dialogType === 'view' ? selectedItem.data?.impactPerDollar?.checkups || 0 : editingData.impactPerDollar?.checkups || 0}
                          onChange={(e) => handleFieldChange('impactPerDollar', { ...editingData.impactPerDollar, checkups: parseFloat(e.target.value) || 0 })}
                          disabled={dialogType === 'view'}
                            helperText="Medical checkups per dollar"
                            inputProps={{ step: 0.01, min: 0 }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: 'var(--primary-green)',
                                },
                              },
                            }}
                        />
                      </Grid>
                    </Grid>
                    </Box>

                    {/* Auto-calculate Button */}
                    <Box sx={{ mt: 3, mb: 2 }}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        disabled={dialogType === 'view'}
                        onClick={() => {
                          const ta = parseFloat(editingData.targetAmount) || 1;
                          const currentAmount = parseFloat(editingData.currentAmount) || 0;
                          const remainingAmount = Math.max(ta - currentAmount, 1); // Ensure we don't divide by 0
                          
                          // Calculate remaining impact needed
                          const remainingChildren = Math.max((editingData.targetMetrics?.childrenToHelp || 0) - (editingData.impactMetrics?.childrenHelped || 0), 0);
                          const remainingCommunities = Math.max((editingData.targetMetrics?.communitiesToReach || 0) - (editingData.impactMetrics?.communitiesReached || 0), 0);
                          const remainingSchools = Math.max((editingData.targetMetrics?.schoolsToBuild || 0) - (editingData.impactMetrics?.schoolsBuilt || 0), 0);
                          const remainingMeals = Math.max((editingData.targetMetrics?.mealsToProvide || 0) - (editingData.impactMetrics?.mealsProvided || 0), 0);
                          const remainingCheckups = Math.max((editingData.targetMetrics?.medicalCheckupsToProvide || 0) - (editingData.impactMetrics?.medicalCheckups || 0), 0);
                          
                          setEditingData({
                            ...editingData,
                            impactPerDollar: {
                              children: remainingChildren / remainingAmount,
                              communities: remainingCommunities / remainingAmount,
                              schools: remainingSchools / remainingAmount,
                              meals: remainingMeals / remainingAmount,
                              checkups: remainingCheckups / remainingAmount,
                            }
                          });
                          setSnackbar({ 
                            open: true, 
                            message: `Impact per dollar calculated based on remaining work (${remainingAmount.toLocaleString()} remaining to raise)`, 
                            severity: 'success' 
                          });
                        }}
                        sx={{
                          borderColor: 'var(--primary-green)',
                          color: 'var(--primary-green)',
                          '&:hover': {
                            borderColor: 'var(--dark-green)',
                            backgroundColor: 'rgba(0,255,140,0.05)'
                          }
                        }}
                      >
                        Auto-calculate Impact Per Dollar
                      </Button>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                        Automatically calculates impact per dollar based on target metrics and target amount
                      </Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>

                {/* Donation Options Section */}
                <Accordion 
                  expanded={formSections.impact} 
                  onChange={() => setFormSections(prev => ({ ...prev, impact: !prev.impact }))}
                  sx={{ mb: 2 }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--primary-green)' }}>
                      💳 Donation Options
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Create predefined donation amounts that donors can choose from. These options make it easier for donors to contribute and understand the impact of their donation.
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--primary-green)' }}>
                            Predefined Donation Amounts
                          </Typography>
                          {dialogType !== 'view' && (
                            <Button
                              variant="contained"
                              size="small"
                              onClick={addDonationOption}
                              startIcon={<Add />}
                              sx={{ 
                                background: 'var(--primary-green)',
                                '&:hover': { background: 'var(--dark-green)' }
                              }}
                            >
                              Add Option
                            </Button>
                          )}
                        </Box>
                        
                        {donationOptions.length === 0 ? (
                          <Box sx={{ 
                            textAlign: 'center', 
                            py: 6, 
                            border: '2px dashed rgba(0,255,140,0.3)', 
                            borderRadius: 2,
                            background: 'rgba(0,255,140,0.02)'
                          }}>
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                              No donation options added yet
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                              Add predefined donation amounts to make it easier for donors to contribute
                            </Typography>
                            {dialogType !== 'view' && (
                              <Button
                                variant="contained"
                                onClick={addDonationOption}
                                startIcon={<Add />}
                                sx={{ 
                                  background: 'var(--primary-green)',
                                  '&:hover': { background: 'var(--dark-green)' }
                                }}
                              >
                                Add First Option
                              </Button>
                            )}
                          </Box>
                        ) : (
                          donationOptions.map((option, index) => (
                            <Card key={option.id} sx={{ 
                              mb: 2, 
                              p: 3,
                              border: '1px solid rgba(0,255,140,0.1)',
                              borderRadius: 2,
                              background: 'rgba(0,255,140,0.02)',
                              '&:hover': {
                                boxShadow: '0 4px 12px rgba(0,255,140,0.1)'
                              }
                            }}>
                              <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={3}>
                                  <TextField
                                    fullWidth
                                    label="Amount"
                                    type="number"
                                    value={option.amount}
                                    onChange={(e) => updateDonationOption(option.id, 'amount', e.target.value)}
                                    disabled={dialogType === 'view'}
                                    InputProps={{
                                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                    }}
                                    helperText="Donation amount"
                                    inputProps={{ min: 1 }}
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                          borderColor: 'var(--primary-green)',
                                        },
                                      },
                                    }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <TextField
                                    fullWidth
                                    label="Description"
                                    value={option.description}
                                    onChange={(e) => updateDonationOption(option.id, 'description', e.target.value)}
                                    disabled={dialogType === 'view'}
                                    placeholder="e.g., Monthly Support"
                                    helperText="What this donation represents"
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                          borderColor: 'var(--primary-green)',
                                        },
                                      },
                                    }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <TextField
                                    fullWidth
                                    label="Impact Description"
                                    value={option.impact}
                                    onChange={(e) => updateDonationOption(option.id, 'impact', e.target.value)}
                                    disabled={dialogType === 'view'}
                                    placeholder="e.g., Helps one child for a month"
                                    helperText="What impact this donation will have"
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                          borderColor: 'var(--primary-green)',
                                        },
                                      },
                                    }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={1}>
                                  {dialogType !== 'view' && (
                                    <IconButton
                                      onClick={() => removeDonationOption(option.id)}
                                      color="error"
                                      size="small"
                                      sx={{
                                        '&:hover': {
                                          background: 'rgba(244, 67, 54, 0.1)'
                                        }
                                      }}
                                    >
                                      <Delete />
                                    </IconButton>
                                  )}
                                </Grid>
                              </Grid>
                            </Card>
                          ))
                        )}
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: 3, 
                          bgcolor: 'rgba(0,255,140,0.05)', 
                          borderRadius: 2, 
                          border: '1px solid rgba(0,255,140,0.1)' 
                        }}>
                          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'var(--primary-green)' }}>
                            💡 Tips for Great Donation Options
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            • Offer a range of amounts (e.g., $25, $50, $100, $250, $500)
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            • Use clear, emotional descriptions (e.g., "Feed a child for a month")
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            • Make impact descriptions specific and measurable
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            • Consider your target audience's giving capacity
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Box>
            )}

            {selectedItem?.type === 'volunteer' && (
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={2}>
                  {/* Personal Information */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={dialogType === 'create' ? editingData.firstName || '' : selectedItem.data?.firstName || ''}
                      onChange={(e) => setEditingData({...editingData, firstName: e.target.value})}
                      disabled={dialogType === 'view'}
                      required={dialogType === 'create'}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={dialogType === 'create' ? editingData.lastName || '' : selectedItem.data?.lastName || ''}
                      onChange={(e) => setEditingData({...editingData, lastName: e.target.value})}
                      disabled={dialogType === 'view'}
                      required={dialogType === 'create'}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={dialogType === 'create' ? editingData.email || '' : selectedItem.data?.email || ''}
                      onChange={(e) => setEditingData({...editingData, email: e.target.value})}
                      disabled={dialogType === 'view'}
                      required={dialogType === 'create'}
                      type="email"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={dialogType === 'create' ? editingData.phone || '' : (dialogType === 'view' ? selectedItem.data?.phone || '' : (editingData.phone || selectedItem.data?.phone || ''))}
                      onChange={(e) => setEditingData({...editingData, phone: e.target.value})}
                      disabled={dialogType === 'view'}
                      required={dialogType === 'create'}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Age"
                      value={dialogType === 'create' ? editingData.age || '' : selectedItem.data?.age || ''}
                      onChange={(e) => setEditingData({...editingData, age: e.target.value})}
                      disabled={dialogType === 'view'}
                      required={dialogType === 'create'}
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel shrink>Location</InputLabel>
                      <Select
                        value={dialogType === 'create' ? editingData.location || '' : (dialogType === 'view' ? selectedItem.data?.location || '' : (editingData.location || selectedItem.data?.location || ''))}
                        onChange={(e) => setEditingData({...editingData, location: e.target.value})}
                        disabled={dialogType === 'view'}
                        required={dialogType === 'create'}
                        label="Location"
                        displayEmpty
                        renderValue={(selected) => {
                          if (!selected) {
                            return <em style={{ color: '#999' }}>Select a location</em>;
                          }
                          return selected;
                        }}
                      >
                        <MenuItem value="local">Local</MenuItem>
                        <MenuItem value="nairobi">Nairobi</MenuItem>
                        <MenuItem value="kampala">Kampala</MenuItem>
                        <MenuItem value="dar-es-salaam">Dar es Salaam</MenuItem>
                        <MenuItem value="kigali">Kigali</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel shrink>Skills</InputLabel>
                      <Select
                        multiple
                        value={dialogType === 'create' ? editingData.skills || [] : (selectedItem.data?.skills || [])}
                        onChange={(e) => setEditingData({...editingData, skills: e.target.value})}
                        disabled={dialogType === 'view'}
                        required={dialogType === 'create'}
                        label="Skills"
                        displayEmpty
                        renderValue={(selected) => {
                          if (!selected || selected.length === 0) {
                            return <em style={{ color: '#999' }}>Select skills</em>;
                          }
                          return selected.join(', ');
                        }}
                      >
                        <MenuItem value="teaching">Teaching</MenuItem>
                        <MenuItem value="medical">Medical</MenuItem>
                        <MenuItem value="construction">Construction</MenuItem>
                        <MenuItem value="fundraising">Fundraising</MenuItem>
                        <MenuItem value="translation">Translation</MenuItem>
                        <MenuItem value="counseling">Counseling</MenuItem>
                        <MenuItem value="sports">Sports</MenuItem>
                        <MenuItem value="arts">Arts</MenuItem>
                        <MenuItem value="technology">Technology</MenuItem>
                        <MenuItem value="cooking">Cooking</MenuItem>
                        <MenuItem value="administration">Administration</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Experience"
                      value={dialogType === 'create' ? editingData.experience || '' : selectedItem.data?.experience || ''}
                      onChange={(e) => setEditingData({...editingData, experience: e.target.value})}
                      disabled={dialogType === 'view'}
                      required={dialogType === 'create'}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel shrink>Availability</InputLabel>
                      <Select
                        value={dialogType === 'create' ? editingData.availability || '' : (dialogType === 'view' ? selectedItem.data?.availability || '' : (editingData.availability || selectedItem.data?.availability || ''))}
                        onChange={(e) => setEditingData({...editingData, availability: e.target.value})}
                        disabled={dialogType === 'view'}
                        required={dialogType === 'create'}
                        label="Availability"
                        displayEmpty
                        renderValue={(selected) => {
                          if (!selected) {
                            return <em style={{ color: '#999' }}>Select availability</em>;
                          }
                          return selected;
                        }}
                      >
                        <MenuItem value="fulltime">Full Time</MenuItem>
                        <MenuItem value="parttime">Part Time</MenuItem>
                        <MenuItem value="shortterm">Short Term</MenuItem>
                        <MenuItem value="flexible">Flexible</MenuItem>
                        <MenuItem value="weekends">Weekends</MenuItem>
                        <MenuItem value="evenings">Evenings</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel shrink>Commitment</InputLabel>
                      <Select
                        value={dialogType === 'create' ? editingData.commitment || '' : (dialogType === 'view' ? selectedItem.data?.commitment || '' : (editingData.commitment || selectedItem.data?.commitment || ''))}
                        onChange={(e) => setEditingData({...editingData, commitment: e.target.value})}
                        disabled={dialogType === 'view'}
                        required={dialogType === 'create'}
                        label="Commitment"
                        displayEmpty
                        renderValue={(selected) => {
                          if (!selected) {
                            return <em style={{ color: '#999' }}>Select commitment level</em>;
                          }
                          return selected;
                        }}
                      >
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="flexible">Flexible</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Emergency Contact"
                      value={dialogType === 'create' ? editingData.emergencyContact || '' : selectedItem.data?.emergencyContact || ''}
                      onChange={(e) => setEditingData({...editingData, emergencyContact: e.target.value})}
                      disabled={dialogType === 'view'}
                      required={dialogType === 'create'}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Emergency Phone"
                      value={dialogType === 'create' ? editingData.emergencyPhone || '' : selectedItem.data?.emergencyPhone || ''}
                      onChange={(e) => setEditingData({...editingData, emergencyPhone: e.target.value})}
                      disabled={dialogType === 'view'}
                      required={dialogType === 'create'}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Message"
                      value={dialogType === 'create' ? editingData.message || '' : selectedItem.data?.message || ''}
                      onChange={(e) => setEditingData({...editingData, message: e.target.value})}
                      disabled={dialogType === 'view'}
                      required={dialogType === 'create'}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={dialogType === 'create' ? editingData.status || '' : (dialogType === 'view' ? selectedItem.data?.status || '' : (editingData.status || selectedItem.data?.status || ''))}
                        onChange={(e) => setEditingData({...editingData, status: e.target.value})}
                        disabled={dialogType === 'view'}
                        required={dialogType === 'create'}
                        label="Status"
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="reviewed">Reviewed</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {dialogType !== 'create' && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Application Date"
                        value={selectedItem.data?.createdAt ? new Date(selectedItem.data.createdAt).toLocaleDateString() : ''}
                        disabled
                      />
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}

            {selectedItem?.type === 'donation' && (
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Donor Name"
                      value={selectedItem.data?.anonymous ? 'Anonymous' : `${selectedItem.data?.donor?.firstName || ''} ${selectedItem.data?.donor?.lastName || ''}`}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Amount"
                      value={`$${selectedItem.data?.amount?.toLocaleString()}`}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Program"
                      value={selectedItem.data?.program?.name || 'General'}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Payment Status"
                      value={selectedItem.data?.paymentStatus || 'Unknown'}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Payment Method"
                      value={selectedItem.data?.paymentMethod || 'Unknown'}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Date"
                      value={selectedItem.data?.createdAt ? new Date(selectedItem.data.createdAt).toLocaleDateString() : 'Unknown'}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Message"
                      value={selectedItem.data?.message || 'No message'}
                      disabled
                    />
                  </Grid>
                  {selectedItem.data?.anonymous === false && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Donor Email"
                        value={selectedItem.data?.donor?.email || 'Unknown'}
                        disabled
                      />
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            {dialogType === 'view' && selectedItem?.type === 'program' && (
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={async () => {
                  try {
                    setLoading(true);
                    const result = await programsAPI.recalculateAmount(selectedItem.data._id);
                    setSnackbar({ 
                      open: true, 
                      message: `Recalculated ${selectedItem.data.name}: $${result.previousAmount} → $${result.newAmount}`, 
                      severity: 'success' 
                    });
                    loadDashboardData();
                    setDialogOpen(false);
                  } catch (error) {
                    console.error('Error recalculating amount:', error);
                    setSnackbar({ 
                      open: true, 
                      message: 'Failed to recalculate program amount', 
                      severity: 'error' 
                    });
                  } finally {
                    setLoading(false);
                  }
                }}
                sx={{ borderColor: 'var(--primary-green)', color: 'var(--primary-green)' }}
              >
                Recalculate Amount
              </Button>
            )}
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            {dialogType !== 'view' && (
              <Button 
                onClick={handleSave} 
                variant="contained"
                disabled={loading || (selectedItem?.type === 'program' && dialogType === 'create' && formProgress < 100)}
              >
                {loading ? 'Saving...' : 
                 selectedItem?.type === 'program' && dialogType === 'create' && formProgress < 100 ? 
                 `Complete Form (${formProgress}%)` : 'Save'}
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Newsletter Sending Dialog */}
        <Dialog 
          open={newsletterDialogOpen} 
          onClose={() => setNewsletterDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Send Newsletter to All Subscribers
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subject"
                    value={newsletterForm.subject}
                    onChange={(e) => setNewsletterForm({ ...newsletterForm, subject: e.target.value })}
                    placeholder="Enter newsletter subject"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    label="Content"
                    value={newsletterForm.content}
                    onChange={(e) => setNewsletterForm({ ...newsletterForm, content: e.target.value })}
                    placeholder="Enter newsletter content (HTML supported)"
                    required
                    helperText="You can use HTML tags for formatting"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Alert severity="info">
                    This newsletter will be sent to {newsletterStats.totalSubscribers} active subscribers.
                  </Alert>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNewsletterDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSendNewsletter} 
              variant="contained"
              disabled={sendingNewsletter}
              sx={{ background: 'var(--primary-green)' }}
            >
              {sendingNewsletter ? <CircularProgress size={20} /> : 'Send Newsletter'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
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