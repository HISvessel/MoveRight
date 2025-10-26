import React, { useState } from 'react';
import { userAPI, authAPI } from '../services/api';
import '../styles/Signup.css';
import '../styles/App.css';

function SignUp({ onNavigate, onSignUpSuccess }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    feet: '',
    inches: '',
    weight: ''
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

    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }

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

    const age = parseInt(formData.age);
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(age) || age <= 0) {
      newErrors.age = 'Age must be a positive number';
    }

    const feet = parseInt(formData.feet);
    if (!formData.feet) {
      newErrors.feet = 'Height (feet) is required';
    } else if (isNaN(feet) || feet < 3 || feet > 7) {
      newErrors.feet = 'Height (feet) must be between 3 and 7';
    }

    const inches = parseInt(formData.inches);
    if (!formData.inches && formData.inches !== '0') {
      newErrors.inches = 'Height (inches) is required';
    } else if (isNaN(inches) || inches < 0 || inches > 11) {
      newErrors.inches = 'Height (inches) must be between 0 and 11';
    }

    const weight = parseFloat(formData.weight);
    if (!formData.weight) {
      newErrors.weight = 'Weight is required';
    } else if (isNaN(weight) || weight <= 0) {
      newErrors.weight = 'Weight must be a positive number';
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
      await userAPI.create({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        age: parseInt(formData.age),
        feet: parseInt(formData.feet),
        inches: parseInt(formData.inches),
        weight: parseFloat(formData.weight)
      });

      const loginData = await authAPI.login(formData.email, formData.password);
      localStorage.setItem('token', loginData.token);
      localStorage.setItem('user_id', loginData.user.id);
      onSignUpSuccess(loginData.user);

    } catch (error) {
      setErrors({ general: error.message || 'Sign up failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-signup">
      <div className="signup-container">
        <div className="signup-card">
          <h2>Create Account</h2>
          
          <form onSubmit={handleSubmit}>
            {errors.general && <div className="general-error">{errors.general}</div>}
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.firstName && <span className="error">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.lastName && <span className="error">{errors.lastName}</span>}
              </div>
            </div>

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
              {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
            </div>

            <div>
              <label htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.age && <span className="error">{errors.age}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="feet">Height (Feet)</label>
                <input
                  type="number"
                  id="feet"
                  name="feet"
                  value={formData.feet}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.feet && <span className="error">{errors.feet}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="inches">Height (Inches)</label>
                <input
                  type="number"
                  id="inches"
                  name="inches"
                  value={formData.inches}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.inches && <span className="error">{errors.inches}</span>}
              </div>
            </div>

            <div>
              <label htmlFor="weight">Weight (lbs)</label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.weight && <span className="error">{errors.weight}</span>}
            </div>

            <button type="submit" className="primary" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p>
            Already have an account?{' '}
            <button onClick={() => onNavigate('login')}>Log In</button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;