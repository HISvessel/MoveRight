import React, { useState } from 'react';
import { userAPI, authAPI } from '../services/api';
import '../styles/Signup.css';


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

    // First Name
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }

    // Last Name
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }

    // Email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Age
    const age = parseInt(formData.age);
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(age) || age <= 0) {
      newErrors.age = 'Age must be a positive number';
    }

    // Feet
    const feet = parseInt(formData.feet);
    if (!formData.feet) {
      newErrors.feet = 'Height (feet) is required';
    } else if (isNaN(feet) || feet < 3 || feet > 7) {
      newErrors.feet = 'Height (feet) must be between 3 and 7';
    }

    // Inches
    const inches = parseInt(formData.inches);
    if (!formData.inches && formData.inches !== 0) {
      newErrors.inches = 'Height (inches) is required';
    } else if (isNaN(inches) || inches < 0 || inches > 11) {
      newErrors.inches = 'Height (inches) must be between 0 and 11';
    }

    // Weight
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
      // Create user account
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

      // Auto-login with same credentials
      const loginData = await authAPI.login(formData.email, formData.password);
      
      //  Save token
      localStorage.setItem('token', loginData.token);
      
      //  Notify parent
      onSignUpSuccess(loginData.user);

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
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.firstName && <span>{errors.firstName}</span>}
        </div>

        <div>
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.lastName && <span>{errors.lastName}</span>}
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
          {errors.age && <span>{errors.age}</span>}
        </div>

        <div>
          <label htmlFor="feet">Height (Feet)</label>
          <input
            type="number"
            id="feet"
            name="feet"
            value={formData.feet}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.feet && <span>{errors.feet}</span>}
        </div>

        <div>
          <label htmlFor="inches">Height (Inches)</label>
          <input
            type="number"
            id="inches"
            name="inches"
            value={formData.inches}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.inches && <span>{errors.inches}</span>}
        </div>

        <div>
          <label htmlFor="weight">Weight</label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.weight && <span>{errors.weight}</span>}
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
