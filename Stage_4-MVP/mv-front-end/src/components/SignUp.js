import React, { useState } from 'react';
import { userAPI } from '../services/api';


function SignUp({ onNavigate, onSignUpSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      // Call Flask backend via userAPI
      const data = await userAPI.create({
        email: formData.email,
        password: formData.password
      });

      // Save JWT token for future authenticated requests
      localStorage.setItem('token', data.token);

      // Notify parent (auto-login behavior)
      onSignUpSuccess(data.user);

    } catch (error) {
      setErrors({ general: error.message || 'Sign up failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Create Account</h2>
      
      <form onSubmit={handleSubmit}>
        {errors.general && <div>{errors.general}</div>}
        
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.email && <span>{errors.email}</span>}
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.password && <span>{errors.password}</span>}
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.confirmPassword && <span>{errors.confirmPassword}</span>}
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <p>
        Already have an account?{' '}
        <button onClick={() => onNavigate('login')}>Log In</button>
      </p>
    </div>
  );
}

export default SignUp;
