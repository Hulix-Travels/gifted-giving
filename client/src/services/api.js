import { AUTH_STORAGE_KEY } from '../constants/auth';
import { API_BASE_URL } from '../config/api';

const SESSION_EXPIRED_MESSAGE = 'Session expired. Please log in again.';

// Debug log in development
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL:', API_BASE_URL);
  console.log('🌍 Environment:', import.meta.env.MODE);
}

// Helper function to handle API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem(AUTH_STORAGE_KEY);
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  // Remove body for GET requests
  if ((!options.method || options.method === 'GET') && config.body) {
    delete config.body;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Not JSON, probably an error page or server error
      const text = await response.text();
      throw new Error(`Server did not return JSON. Status: ${response.status}. Body: ${text.substring(0, 200)}`);
    }
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'Something went wrong');
      error.status = response.status;
      error.errors = data.errors;
      error.responseData = data;

      if (
        response.status === 401 &&
        (data.message === SESSION_EXPIRED_MESSAGE || data.message === 'Token is not valid')
      ) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }

      throw error;
    }

    return data;
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
  
  verifyEmail: (token) => apiRequest('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
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
  
  updateMetrics: (id, metricsData) => apiRequest(`/programs/${id}/metrics`, {
    method: 'PUT',
    body: JSON.stringify(metricsData),
  }),
  
  delete: (id) => apiRequest(`/programs/${id}`, {
    method: 'DELETE',
  }),
  
  recalculateAmounts: () => apiRequest('/programs/recalculate-amounts', {
    method: 'POST',
  }),
  
  recalculateAmount: (id) => apiRequest(`/programs/${id}/recalculate-amount`, {
    method: 'POST',
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
  
  getAllDonations: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/donations/all?${queryString}`);
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
  
  // For admin use only
  getApplications: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/volunteers/applications?${queryString}`);
  },

  // For regular users
  getMyApplications: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/volunteers/my-applications?${queryString}`);
  },
  
  updateApplicationStatus: (id, status) => apiRequest(`/volunteers/applications/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  
  getStats: () => apiRequest('/volunteers/stats'),

  getPublicSummary: () => apiRequest('/volunteers/stats/summary'),
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

// Stripe API
export const stripeAPI = {
  createPaymentIntent: (data) => apiRequest('/stripe/create-payment-intent', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  getSubscription: (subscriptionId) => apiRequest(`/stripe/subscription/${subscriptionId}`),
  
  getAllSubscriptions: () => apiRequest('/stripe/subscriptions'),
  
  cancelSubscription: (subscriptionId, cancelImmediately = false) => apiRequest(`/stripe/subscription/${subscriptionId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ cancelImmediately }),
  }),
  
  modifySubscription: (subscriptionId, data) => apiRequest(`/stripe/subscription/${subscriptionId}/modify`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  reactivateSubscription: (subscriptionId) => apiRequest(`/stripe/subscription/${subscriptionId}/reactivate`, {
    method: 'POST',
  }),
};

// Newsletter API
export const newsletterAPI = {
  subscribe: (email) => apiRequest('/newsletter/subscribe', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  
  unsubscribe: (email) => apiRequest('/newsletter/unsubscribe', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  
  getSubscribers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/newsletter/subscribers?${queryString}`);
  },
  
  getStats: () => apiRequest('/newsletter/stats'),
  
  sendNewsletter: (subject, content) => apiRequest('/newsletter/send', {
    method: 'POST',
    body: JSON.stringify({ subject, content }),
  }),
};

// Success Stories API
export const successStoriesAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/success-stories?${queryString}`);
  },
  
  getById: (id) => apiRequest(`/success-stories/${id}`),
  
  create: (storyData) => apiRequest('/success-stories', {
    method: 'POST',
    body: JSON.stringify(storyData),
  }),
  
  update: (id, storyData) => apiRequest(`/success-stories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(storyData),
  }),
  
  updateStatus: (id, status) => apiRequest(`/success-stories/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  
  delete: (id) => apiRequest(`/success-stories/${id}`, {
    method: 'DELETE',
  }),
  
  getStats: () => apiRequest('/success-stories/stats'),
};

export { API_BASE_URL } from '../config/api';
export { getUploadUrl } from '../config/api';

export default {
  auth: authAPI,
  programs: programsAPI,
  donations: donationsAPI,
  volunteers: volunteersAPI,
  users: usersAPI,
  stripe: stripeAPI,
  newsletter: newsletterAPI,
  successStories: successStoriesAPI,
  healthCheck,
}; 