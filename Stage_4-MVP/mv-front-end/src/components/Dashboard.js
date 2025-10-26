import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import '../styles/App.css';
import dashboardBg from '../assets/homepage.jpeg';

function Dashboard({ user, onNavigate, onStartExercise, onLogout }) {
  const [workoutStats, setWorkoutStats] = useState({
    totalWorkouts: 0,
    weekWorkouts: 0,
    avgFormScore: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const exercises = [
    { 
      id: 1, 
      name: 'Push-ups', 
      duration: '3 sets x 12 reps', 
      muscles: 'Chest, Triceps, Shoulders',
      difficulty: 'Beginner',
      description: 'Classic upper body exercise for building chest and arm strength'
    },
    { 
      id: 2, 
      name: 'Squats', 
      duration: '3 sets x 15 reps', 
      muscles: 'Quads, Glutes, Core',
      difficulty: 'Beginner',
      description: 'Fundamental lower body exercise for leg strength and stability'
    },
    { 
      id: 3, 
      name: 'Plank', 
      duration: '3 sets x 60 sec', 
      muscles: 'Core, Shoulders',
      difficulty: 'Intermediate',
      description: 'Isometric core exercise that builds endurance and stability'
    },
    { 
      id: 4, 
      name: 'Lunges', 
      duration: '3 sets x 10 reps per leg', 
      muscles: 'Legs, Glutes',
      difficulty: 'Beginner',
      description: 'Single-leg exercise for balance and lower body strength'
    }
  ];

  useEffect(() => {
    // Fetch user workout stats and recent activity
    const fetchWorkoutData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // TODO: Replace with actual API calls
        // const statsResponse = await fetch('http://localhost:5000/api/workouts/stats', {
        //   headers: { 'Authorization': `Bearer ${token}` }
        // });
        // const statsData = await statsResponse.json();
        // setWorkoutStats(statsData);

        // const activityResponse = await fetch('http://localhost:5000/api/workouts/recent', {
        //   headers: { 'Authorization': `Bearer ${token}` }
        // });
        // const activityData = await activityResponse.json();
        // setRecentActivity(activityData);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching workout data:', error);
        setIsLoading(false);
      }
    };

    fetchWorkoutData();
  }, []);

  const getFormScoreBadge = (score) => {
    if (score >= 90) return 'success';
    if (score >= 75) return 'info';
    return 'warning';
  };

  return (
    <div 
      className="page-dashboard"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(15, 15, 15, 0.93) 0%, rgba(15, 15, 15, 0.85) 100%), url(${dashboardBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh'
      }}
      >
      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' }}>
          <h1>MoveRight</h1>
          <nav style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => onNavigate('account')}>Account</button>
            <button onClick={() => onNavigate('review')}>Leave Review</button>
            <button onClick={onLogout}>Logout</button>
          </nav>
        </div>
      </header>

      <main>
        <section>
          <h2>Welcome back, {user.first_name || user.firstName || user.name}!</h2>
          <p>Ready to crush your workout?</p>
        </section>

        {/* Stats Grid */}
        <section className="grid-3" style={{ marginBottom: '3rem' }}>
          <div className="metric-card">
            <div className="metric-value">{workoutStats.totalWorkouts}</div>
            <div className="metric-label">Total Workouts</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{workoutStats.weekWorkouts}</div>
            <div className="metric-label">This Week</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">
              {workoutStats.avgFormScore > 0 ? `${workoutStats.avgFormScore}%` : '—'}
            </div>
            <div className="metric-label">Avg Form Score</div>
          </div>
        </section>

        {/* Available Workouts */}
        <section>
          <h3 style={{ marginBottom: '1.5rem' }}>Available Workouts</h3>
          <div className="grid-4">
            {exercises.map(exercise => (
              <div key={exercise.id} className="glass-card" style={{ cursor: 'pointer' }}>
                <h4>{exercise.name}</h4>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <strong>Duration:</strong> {exercise.duration}
                </p>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <strong>Muscles:</strong> {exercise.muscles}
                </p>
                <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                  <span className={`badge ${exercise.difficulty === 'Beginner' ? 'info' : 'warning'}`}>
                    {exercise.difficulty}
                  </span>
                </p>
                <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>{exercise.description}</p>
                <button 
                  className="primary" 
                  onClick={() => onStartExercise(exercise)}
                  style={{ width: '100%' }}
                >
                  Start Exercise
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity Table */}
        <section>
          <h3 style={{ marginBottom: '1.5rem' }}>Recent Activity</h3>
          {isLoading ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p>Loading workout history...</p>
            </div>
          ) : recentActivity.length > 0 ? (
            <table className="activity-table">
              <thead>
                <tr>
                  <th>Exercise</th>
                  <th>Date</th>
                  <th>Duration</th>
                  <th>Reps</th>
                  <th>Sets</th>
                  <th>Form Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map(activity => (
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
                    <td>
                      <span className="badge success">
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>No workout history yet</h4>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Start your first workout to see your progress here!
              </p>
              <button className="primary" onClick={() => onStartExercise(exercises[0])}>
                Start Your First Workout
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
