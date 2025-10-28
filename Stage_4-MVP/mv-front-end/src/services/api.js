// Centralized API service for all backend communication

// Defines backend URL
const API_BASE_URL = 'http://localhost:5000';

// Helper to get JWT token from storage
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Request handler
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...options.headers,
      },
    });

    // Handle DELETE requests (no content returned)
    if (response.status === 204) {
      return null;
    }

    // Check if request failed FIRST
    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = 'Request failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Only parse JSON if request was successful
    return await response.json();
    
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
};

// User API
export const userAPI = {
  create: async (userData) => {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getAll: async () => {
    return apiRequest('/users');
  },

  getById: async (userId) => {
    return apiRequest(`/users/${userId}`);
  },

  update: async (userId, userData) => {
    return apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  delete: async (userId) => {
    return apiRequest(`/users/${userId}`, {
      method: 'DELETE',
    });
  },
};

// Review API
export const reviewAPI = {
  getAll: async () => {
    return apiRequest('/reviews');
  },

  create: async (reviewData) => {
    return apiRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  update: async (reviewId, reviewData) => {
    return apiRequest(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  },

  delete: async (reviewId) => {
    return apiRequest(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  },
};

// Camera API
export const cameraAPI = {
  start: async (source) => {
    const body = source ? { source } : {};
    return apiRequest('/camera/start', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  stop: async () => {
    return apiRequest('/camera/stop', {
      method: 'POST',
    });
  },

  capture: async () => {
    return apiRequest('/camera/capture', {
      method: 'POST',
    });
  },

  status: async () => {
    return apiRequest('/camera/status');
  },
};