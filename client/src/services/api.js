const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to handle API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // Create a more detailed error object
      const error = new Error(data.message || 'Something went wrong');
      error.status = response.status;
      error.errors = data.errors; // Include validation errors if present
      error.responseData = data; // Include full response data for debugging
      throw error;
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  getProfile: () => apiRequest('/auth/me'),
  
  updateProfile: (profileData) => apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  }),
  
  forgotPassword: (email) => apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  
  resetPassword: (token, password) => apiRequest('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  }),
};

// Programs API
export const programsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/programs?${queryString}`);
  },
  
  getById: (id) => apiRequest(`/programs/${id}`),
  
  getBySlug: (slug) => apiRequest(`/programs/slug/${slug}`),
  
  getFeatured: () => apiRequest('/programs/featured'),
  
  getCategories: () => apiRequest('/programs/categories'),
  
  getStats: () => apiRequest('/programs/stats/overview'),
  
  create: (programData) => apiRequest('/programs', {
    method: 'POST',
    body: JSON.stringify(programData),
  }),
  
  update: (id, programData) => apiRequest(`/programs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(programData),
  }),
  
  delete: (id) => apiRequest(`/programs/${id}`, {
    method: 'DELETE',
  }),
};

// Donations API
export const donationsAPI = {
  create: (donationData) => apiRequest('/donations', {
    method: 'POST',
    body: JSON.stringify(donationData),
  }),
  
  getUserDonations: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/donations?${queryString}`);
  },
  
  getById: (id) => apiRequest(`/donations/${id}`),
  
  updateStatus: (id, status) => apiRequest(`/donations/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  
  getStats: () => apiRequest('/donations/stats/overview'),
  
  getByProgram: (programId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/donations/program/${programId}?${queryString}`);
  },
};

// Volunteers API
export const volunteersAPI = {
  apply: (applicationData) => apiRequest('/volunteers/apply', {
    method: 'POST',
    body: JSON.stringify(applicationData),
  }),
  
  getApplications: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/volunteers/applications?${queryString}`);
  },
  
  updateApplicationStatus: (id, status) => apiRequest(`/volunteers/applications/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  
  getStats: () => apiRequest('/volunteers/stats'),
};

// Users API
export const usersAPI = {
  getProfile: () => apiRequest('/users/profile'),
  
  getDonations: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/users/donations?${queryString}`);
  },
  
  getStats: () => apiRequest('/users/stats'),
};

// Health check
export const healthCheck = () => apiRequest('/health');

export default {
  auth: authAPI,
  programs: programsAPI,
  donations: donationsAPI,
  volunteers: volunteersAPI,
  users: usersAPI,
  healthCheck,
}; 