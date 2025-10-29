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

// Workout Results API
export const workoutAPI = {
  // Save a workout to database
  save: async (workoutData) => {
    return apiRequest('/workout-results/', {
      method: 'POST',
      body: JSON.stringify(workoutData),
    });
  },

  // Get all workouts (optionally filter by exercise type)
  getAll: async (exerciseType = null) => {
    const query = exerciseType ? `?exercise_type=${exerciseType}` : '';
    return apiRequest(`/workout-results/${query}`);
  },

  // Calculate statistics from all workouts
  getStats: async () => {
    const workouts = await apiRequest('/workout-results/');
    
    if (!workouts || workouts.length === 0) {
      return { totalWorkouts: 0, weekWorkouts: 0, avgFormScore: 0, totalMinutes: 0 };
    }

    // Count workouts from last 7 days
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekWorkouts = workouts.filter(w => new Date(w.created_at) >= weekAgo).length;
    
    // Sum up total minutes
    const totalMinutes = workouts.reduce((sum, w) => sum + Math.floor(w.session_duration / 60), 0);
    
    // Calculate average form score
    const avgFormScore = Math.round(
      workouts.reduce((sum, w) => sum + w.average_form_score, 0) / workouts.length
    );

    return { totalWorkouts: workouts.length, weekWorkouts, avgFormScore, totalMinutes };
  },

  // Get most recent workouts
  getRecent: async (limit = 5) => {
    const workouts = await apiRequest('/workout-results/');
    return workouts.slice(0, limit);
  }
};