import React, { useState, useEffect } from 'react';
import { workoutAPI } from '../services/api';
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
  const [isFirstTime, setIsFirstTime] = useState(false);

  const exercises = [
    { 
      id: 1, 
      name: 'Push-ups', 
      duration: '3 sets x 12 reps', 
      muscles: 'Chest, Triceps, Shoulders',
      difficulty: 'Beginner',
      description: 'Classic upper body exercise for building chest and arm strength',
      available: true
    },
    { 
      id: 2, 
      name: 'Squats', 
      duration: '3 sets x 15 reps', 
      muscles: 'Quads, Glutes, Core',
      difficulty: 'Beginner',
      description: 'Fundamental lower body exercise for leg strength and stability',
      available: true
    },
    { 
      id: 3, 
      name: 'Plank', 
      duration: '3 sets x 60 sec', 
      muscles: 'Core, Shoulders',
      difficulty: 'Intermediate',
      description: 'Isometric core strengthening exercise for stability and endurance',
      available: false
    },
    { 
      id: 4, 
      name: 'Lunges', 
      duration: '3 sets x 10 reps per leg', 
      muscles: 'Legs, Glutes',
      difficulty: 'Beginner',
      description: 'Unilateral leg exercise for balance, strength, and coordination',
      available: false
    }
  ];

  useEffect(() => {
    const fetchWorkoutData = async () => {
      try {
        // Fetch workout stats
        const stats = await workoutAPI.getStats();
        setWorkoutStats(stats);

        // Check if user is a first-time user (no workouts yet)
        if (stats.totalWorkouts === 0) {
          setIsFirstTime(true);
        }

        // Fetch recent activity
        const recent = await workoutAPI.getRecent(5);
        const formatted = recent.map(w => ({
          id: w.id,
          exercise: w.exercise_type.charAt(0).toUpperCase() + w.exercise_type.slice(1),
          date: w.created_at,
          duration: formatTime(w.session_duration),
          reps: w.total_reps,
          sets: 1,
          formScore: Math.round(w.average_form_score),
          status: 'Completed'
        }));
        setRecentActivity(formatted);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching workout data:', error);
        setIsLoading(false);
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

  const getWelcomeMessage = () => {
    const firstName = user.first_name || user.firstName || user.name;
    
    if (isFirstTime) {
      return {
        title: `Welcome to MoveRight, ${firstName}!`,
        subtitle: "Let's start your fitness journey with your first workout!"
      };
    }
    
    return {
      title: `Welcome back, ${firstName}!`,
      subtitle: "Ready to crush your workout?"
    };
  };

  const welcomeMessage = getWelcomeMessage();

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
          <h2>{welcomeMessage.title}</h2>
          <p>{welcomeMessage.subtitle}</p>
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

        {/* First Time User Banner */}
        {isFirstTime && (
          <section className="glass-card" style={{
            background: 'linear-gradient(135deg, rgba(154, 205, 50, 0.1) 0%, rgba(0, 212, 255, 0.1) 100%)',
            border: '2px solid rgba(154, 205, 50, 0.3)',
            marginBottom: '3rem'
          }}>
            <h3 style={{ marginBottom: '1rem' }}>🎉 Getting Started with MoveRight</h3>
            <p style={{ marginBottom: '1rem' }}>
              Welcome to your AI-powered fitness companion! Here's how to get started:
            </p>
            <ul style={{ marginLeft: '2rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              <li>Choose an exercise below to begin your first workout</li>
              <li>Our AI will analyze your form in real-time and provide feedback</li>
              <li>Track your progress and see improvements over time</li>
              <li>Complete workouts to unlock detailed analytics and insights</li>
            </ul>
            <p style={{ marginTop: '1rem', color: 'var(--accent-green)', fontWeight: '600' }}>
              💡 Tip: Start with Push-ups or Squats if you're new to working out!
            </p>
          </section>
        )}

        {/* Available Workouts */}
        <section>
          <h3 style={{ marginBottom: '1.5rem' }}>
            {isFirstTime ? 'Start Your First Workout' : 'Available Workouts'}
          </h3>
          <div className="grid-4">
            {exercises.map(exercise => (
              <div 
                key={exercise.id} 
                className="glass-card" 
                style={{ 
                  cursor: exercise.available ? 'pointer' : 'not-allowed',
                  opacity: exercise.available ? 1 : 0.6
                }}
              >
                <h4>
                  {exercise.name}
                  {!exercise.available && (
                    <span style={{
                      marginLeft: '0.5rem',
                      fontSize: '0.75rem',
                      color: 'var(--accent-blue)',
                      background: 'rgba(0, 212, 255, 0.15)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '12px',
                      fontWeight: '600'
                    }}>
                      COMING SOON
                    </span>
                  )}
                </h4>
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
                  onClick={() => exercise.available && onStartExercise(exercise)}
                  disabled={!exercise.available}
                  style={{ 
                    width: '100%',
                    opacity: exercise.available ? 1 : 0.5,
                    cursor: exercise.available ? 'pointer' : 'not-allowed'
                  }}
                >
                  {exercise.available 
                    ? (isFirstTime ? '🚀 Start First Workout' : 'Start Exercise')
                    : '🔒 Under Development'
                  }
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
