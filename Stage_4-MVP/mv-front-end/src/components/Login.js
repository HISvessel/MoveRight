import React, { useState } from 'react';
import { authAPI } from '../services/api';
import '../styles/Login.css';
import '../styles/App.css';

function Login({ onNavigate, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      const data = await authAPI.login(formData.email, formData.password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user_id', data.user.id);
      onLoginSuccess(data.user);
      
    } catch (error) {
      setErrors({ general: error.message || 'Login failed. Please check your credentials.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert('Forgot password functionality coming soon!');
  };

  return (
    <div className="page-login">
      <div className="login-container">
        <div className="login-card">
          <h2>Welcome Back</h2>
          
          <form onSubmit={handleSubmit}>
            {errors.general && <div className="general-error">{errors.general}</div>}
            
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
              {errors.email && <span className="error">{errors.email}</span>}
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
              {errors.password && <span className="error">{errors.password}</span>}
            </div>

            <button 
              type="button" 
              className="forgot-password-btn"
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </button>

            <button type="submit" className="primary" disabled={isLoading}>
              {isLoading ? 'Logging In...' : 'Log In'}
            </button>
          </form>

          <p>
            Don't have an account?{' '}
            <button onClick={() => onNavigate('signup')}>Sign Up</button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
