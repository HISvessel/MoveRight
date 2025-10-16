import React, { useState } from 'react';
import { userAPI } from '../services/api';

function Account({ user, onNavigate, onUpdateUser, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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

  const validateProfileForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    return newErrors;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (formData.newPassword || formData.confirmNewPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }

      if (!formData.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
      }

      if (formData.newPassword !== formData.confirmNewPassword) {
        newErrors.confirmNewPassword = 'Passwords do not match';
      }
    }

    return newErrors;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    const profileErrors = validateProfileForm();
    const passwordErrors = validatePasswordForm();
    const allErrors = { ...profileErrors, ...passwordErrors };
    
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    setIsLoading(true);
    setSuccessMessage('');
    
    try {
      const updatedUser = await userAPI.update(user.id, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        current_password: formData.currentPassword,
        new_password: formData.newPassword
      });

      onUpdateUser(updatedUser);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
      setIsLoading(false);
      
      
    } catch (error) {
      setErrors({ general: 'Update failed. Please try again.' });
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    try {
      await userAPI.delete(user.id);
      alert('Account deleted successfully');
      onLogout();
    } catch (error) {
      alert('Failed to delete account. Please try again.');
    }

  };

  const memberSinceDate = new Date(user.memberSince).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div>
      <header>
        <h1>Account Settings</h1>
        <nav>
          <button onClick={() => onNavigate('dashboard')}>← Back to Dashboard</button>
        </nav>
      </header>

      <main>
        {successMessage && (
          <div>
            <p>{successMessage}</p>
          </div>
        )}

        <section>
          <h2>Profile Information</h2>
          
          {!isEditing ? (
            <div>
              <div>
                <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
              </div>
              <div>
                <p><strong>Email:</strong> {user.email}</p>
              </div>
              <div>
                <p><strong>Member Since:</strong> {memberSinceDate}</p>
              </div>
              <button onClick={() => setIsEditing(true)}>Edit Profile</button>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile}>
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

              <h3>Change Password (Optional)</h3>
              
              <div>
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.currentPassword && <span>{errors.currentPassword}</span>}
              </div>

              <div>
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.newPassword && <span>{errors.newPassword}</span>}
              </div>

              <div>
                <label htmlFor="confirmNewPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.confirmNewPassword && <span>{errors.confirmNewPassword}</span>}
              </div>

              <div>
                <button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setIsEditing(false)} disabled={isLoading}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>

        <section>
          <h2>Workout Statistics</h2>
          <div>
            <div>
              <h3>Total Workouts</h3>
              <p>24</p>
            </div>
            <div>
              <h3>Total Minutes</h3>
              <p>480</p>
            </div>
            <div>
              <h3>Average Form Score</h3>
              <p>85%</p>
            </div>
            <div>
              <h3>Current Streak</h3>
              <p>5 days</p>
            </div>
          </div>
        </section>

        <section>
          <h2>Preferences</h2>
          <div>
            <div>
              <label>
                <input type="checkbox" defaultChecked />
                Email notifications for workout reminders
              </label>
            </div>
            <div>
              <label>
                <input type="checkbox" defaultChecked />
                Weekly progress reports
              </label>
            </div>
            <div>
              <label>
                <input type="checkbox" />
                Share my progress on social media
              </label>
            </div>
          </div>
        </section>

        <section>
          <h2>Danger Zone</h2>
          <div>
            <p>Once you delete your account, there is no going back. Please be certain.</p>
            <button onClick={handleDeleteAccount}>Delete Account</button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Account;
