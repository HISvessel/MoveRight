import React, { useState, useEffect } from 'react';
import { userAPI, workoutAPI } from '../services/api';
import '../styles/Account.css';
import '../styles/App.css';
import accountBg from '../assets/landmark2.jpeg';

function Account({ user, onNavigate, onUpdateUser, onLogout }) {
  console.log('User object:', user);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.first_name || '',
    lastName: user.last_name || '',
    email: user.email || '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    age: user.age || '',
    feet: user.height ? parseInt(user.height.split("'")[0]) : '',
    inches: user.height ? parseInt(user.height.split("'")[1]) : '',
    weight: user.weight || ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [workoutStats, setWorkoutStats] = useState({
    totalWorkouts: 0,
    totalMinutes: 0,
    avgFormScore: 0
  });
  const [activityHistory, setActivityHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchWorkoutData = async () => {
      try {
        // Fetch stats
        const stats = await workoutAPI.getStats();
        setWorkoutStats(stats);

        // Fetch ALL workout history
        const workouts = await workoutAPI.getAll();
        const formatted = workouts.map(w => ({
          id: w.id,
          exercise: w.exercise_type.charAt(0).toUpperCase() + w.exercise_type.slice(1),
          date: w.created_at,
          duration: formatTime(w.session_duration),
          reps: w.total_reps,
          sets: 1,
          formScore: Math.round(w.average_form_score)
        }));
        setActivityHistory(formatted);

        setIsLoadingHistory(false);
      } catch (error) {
        console.error('Error fetching workout data:', error);
        setIsLoadingHistory(false);
      }
    };
    fetchWorkoutData();
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFormScoreBadge = (score) => {
    if (score >= 90) return 'success';
    if (score >= 75) return 'info';
    return 'warning';
  };

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

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

    const age = parseInt(formData.age);
    if (!formData.age) newErrors.age = 'Age is required';
    else if (isNaN(age) || age <= 0) newErrors.age = 'Age must be a positive number';

    const feet = parseInt(formData.feet);
    const inches = parseInt(formData.inches);
    if (!formData.feet) newErrors.feet = 'Height (feet) is required';
    else if (isNaN(feet) || feet < 3 || feet > 7) newErrors.feet = 'Height (feet) must be 3–7';
    if (!formData.inches && formData.inches !== 0) newErrors.inches = 'Height (inches) is required';
    else if (isNaN(inches) || inches < 0 || inches > 11) newErrors.inches = 'Height (inches) must be 0–11';

    const weight = parseFloat(formData.weight);
    if (!formData.weight) newErrors.weight = 'Weight is required';
    else if (isNaN(weight) || weight <= 0) newErrors.weight = 'Weight must be positive';

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
        new_password: formData.newPassword,
        age: formData.age,
        feet: formData.feet,
        inches: formData.inches,
        weight: formData.weight
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

  const memberSinceDate = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div 
      className="page-account"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(15, 15, 15, 0.93) 0%, rgba(15, 15, 15, 0.85) 100%), url(${accountBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh'
      }}
    >
      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' }}>
          <h1>Account Settings</h1>
          <button onClick={() => onNavigate('dashboard')}>← Back to Dashboard</button>
        </div>
      </header>

      <main>
        {successMessage && (
          <div style={{ 
            color: 'var(--accent-green)', 
            marginBottom: '2rem', 
            padding: '1rem', 
            background: 'rgba(164, 255, 0, 0.1)', 
            borderRadius: '8px' 
          }}>
            ✓ {successMessage}
          </div>
        )}

        <section className="glass-card">
          <h2>Profile Information</h2>
          
          {!isEditing ? (
            <div>
              <div>
                <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
              </div>
              <div>
                <p><strong>Email:</strong> {user.email}</p>
              </div>
              <div>
                <p><strong>Age:</strong> {user.age}</p>
              </div>
              <div>
                <p><strong>Height:</strong> {user.height}</p>
              </div>
              <div>
                <p><strong>Weight:</strong> {user.weight} lbs</p>
              </div>
              <div>
                <p><strong>Member Since:</strong> {memberSinceDate}</p>
              </div>
              <button onClick={() => setIsEditing(true)} style={{ marginTop: '1rem' }}>
                Edit Profile
              </button>
            </div>
          ) : (
            <div>
              {errors.general && <div className="error">{errors.general}</div>}
              
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
                {errors.firstName && <span className="error">{errors.firstName}</span>}
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
                {errors.lastName && <span className="error">{errors.lastName}</span>}
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
                <label htmlFor="age">Age</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age || ''}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.age && <span className="error">{errors.age}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label htmlFor="feet">Height (Feet)</label>
                  <input
                    type="number"
                    id="feet"
                    name="feet"
                    value={formData.feet || ''}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.feet && <span className="error">{errors.feet}</span>}
                </div>

                <div>
                  <label htmlFor="inches">Height (Inches)</label>
                  <input
                    type="number"
                    id="inches"
                    name="inches"
                    value={formData.inches || ''}
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
                  value={formData.weight || ''}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.weight && <span className="error">{errors.weight}</span>}
              </div>

              <h3 style={{ marginTop: '2rem' }}>Change Password (Optional)</h3>
              
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
                {errors.currentPassword && <span className="error">{errors.currentPassword}</span>}
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
                {errors.newPassword && <span className="error">{errors.newPassword}</span>}
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
                {errors.confirmNewPassword && <span className="error">{errors.confirmNewPassword}</span>}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button 
                  type="button" 
                  onClick={handleUpdateProfile} 
                  className="primary" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)} 
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Stats Section */}
        <section className="grid-3">
          <div className="metric-card">
            <div className="metric-value">{workoutStats.totalWorkouts}</div>
            <div className="metric-label">Total Workouts</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{workoutStats.totalMinutes}</div>
            <div className="metric-label">Total Minutes</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">
              {workoutStats.avgFormScore > 0 ? `${workoutStats.avgFormScore}%` : '—'}
            </div>
            <div className="metric-label">Avg Form Score</div>
          </div>
        </section>

        {/* Activity History Table */}
        <section>
          <h3 style={{ marginBottom: '1.5rem' }}>Workout History</h3>
          {isLoadingHistory ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p>Loading workout history...</p>
            </div>
          ) : activityHistory.length > 0 ? (
            <table className="activity-table">
              <thead>
                <tr>
                  <th>Exercise</th>
                  <th>Date</th>
                  <th>Duration</th>
                  <th>Reps</th>
                  <th>Sets</th>
                  <th>Form Score</th>
                </tr>
              </thead>
              <tbody>
                {activityHistory.map(activity => (
                  <tr key={activity.id}>
                    <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                      {activity.exercise}
                    </td>
                    <td>{new Date(activity.date).toLocaleDateString()}</td>
                    <td>{activity.duration}</td>
                    <td>{activity.reps}</td>
                    <td>{activity.sets}</td>
                    <td>
                      <span className={`badge ${getFormScoreBadge(activity.formScore)}`}>
                        {activity.formScore}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>No workout history yet</h4>
              <p style={{ color: 'var(--text-secondary)' }}>
                Complete your first workout to see your history here!
              </p>
            </div>
          )}
        </section>

        <section className="glass-card">
          <h2>Preferences</h2>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked />
              <span>Email notifications for workout reminders</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked />
              <span>Weekly progress reports</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Share my progress on social media</span>
            </label>
          </div>
        </section>

        <section className="danger-zone">
          <h2>Danger Zone</h2>
          <div>
            <p>Once you delete your account, there is no going back. Please be certain.</p>
            <button 
              onClick={handleDeleteAccount} 
              style={{ 
                marginTop: '1rem', 
                background: 'var(--accent-red)', 
                border: 'none' 
              }}
            >
              Delete Account
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Account;
