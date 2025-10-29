import React, { useState, useEffect } from 'react';
import { workoutAPI } from '../services/api';
import '../styles/Results.css';
import '../styles/App.css';
import resultsBg from '../assets/logo6.jpeg';

function Results({ results, exercise, onNavigate, onStartExercise }) {
  const [previousSessions, setPreviousSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const exercises = [
    { id: 1, name: 'Push-ups', duration: '3 sets x 12 reps', muscles: 'Chest, Triceps, Shoulders', difficulty: 'Beginner' },
    { id: 2, name: 'Squats', duration: '3 sets x 15 reps', muscles: 'Quads, Glutes, Core', difficulty: 'Beginner' },
    { id: 3, name: 'Plank', duration: '3 sets x 60 sec', muscles: 'Core, Shoulders', difficulty: 'Intermediate' },
    { id: 4, name: 'Lunges', duration: '3 sets x 10 reps per leg', muscles: 'Legs, Glutes', difficulty: 'Beginner' }
  ];

  useEffect(() => {
    const fetchPreviousSessions = async () => {
      try {
        // Convert exercise name to backend format
        const exerciseType = exercise.name.toLowerCase().includes('push') ? 'pushup' : 
                            exercise.name.toLowerCase().includes('squat') ? 'squat' : 
                            exercise.name.toLowerCase();
        
        // Fetch workouts for THIS exercise type
        const workouts = await workoutAPI.getAll(exerciseType);
        
        // Get last 3 sessions (excluding current one)
        const formatted = workouts.slice(0, 3).map(w => ({
          date: w.created_at,
          reps: w.total_reps,
          formScore: Math.round(w.average_form_score),
          duration: w.session_duration
        }));
        
        setPreviousSessions(formatted);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching previous sessions:', error);
        setIsLoading(false);
      }
    };
    fetchPreviousSessions();
  }, [exercise.name]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFormGrade = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Great';
    if (score >= 70) return 'Good';
    return 'Fair';
  };

  const getFormScoreBadge = (score) => {
    if (score >= 90) return 'success';
    if (score >= 75) return 'info';
    return 'warning';
  };

  const calculateImprovement = () => {
    if (previousSessions.length === 0) return 'First workout!';
    const lastSession = previousSessions[0];
    const improvement = ((results.avgFormScore - lastSession.formScore) / lastSession.formScore * 100).toFixed(0);
    if (improvement > 0) return `+${improvement}%`;
    if (improvement < 0) return `${improvement}%`;
    return '0%';
  };

  const handleSaveWorkout = async () => {
    try {
      // Convert "Push-ups" → "pushup", "Squats" → "squat"
      const exerciseType = exercise.name.toLowerCase().includes('push') ? 'pushup' : 
                          exercise.name.toLowerCase().includes('squat') ? 'squat' : 
                          exercise.name.toLowerCase();
      
      // Actually call the backend!
      await workoutAPI.save({
        exercise_type: exerciseType,           // "pushup" or "squat"
        total_reps: results.totalReps,         // e.g., 15
        average_form_score: results.avgFormScore,  // e.g., 87.5
        session_duration: results.duration,    // e.g., 120 (seconds)
        rep_details: [{
          set: results.totalSets,
          reps: results.totalReps,
          form_score: results.avgFormScore
        }]
      });
      
      alert('Workout saved successfully!');  // ← NOW it's real!
      onNavigate('dashboard');
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Failed to save workout. Please try again.');
    }
  };

  return (
    <div 
      className="page-results"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(15, 15, 15, 0.93) 0%, rgba(15, 15, 15, 0.85) 100%), url(${resultsBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh'
      }}
      >
      <header>
        <h1>Workout Complete! 🎉</h1>
      </header>

      <main>
        <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2>{exercise.name} - Summary</h2>
          <p>Great job completing your workout!</p>
        </section>

        {/* Performance Metrics */}
        <section className="grid-4">
          <div className="metric-card">
            <div className="metric-value">{results.totalReps}</div>
            <div className="metric-label">Total Reps</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{results.totalSets}</div>
            <div className="metric-label">Sets Completed</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{formatTime(results.duration)}</div>
            <div className="metric-label">Duration</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{results.avgFormScore}%</div>
            <div className="metric-label">Form Score</div>
          </div>
        </section>

        {/* Form Analysis */}
        <section className="glass-card">
          <h3>Form Analysis</h3>
          <p><strong>Overall Grade:</strong> {getFormGrade(results.avgFormScore)}</p>
          <div className="grid-2" style={{ marginTop: '1.5rem' }}>
            <div>
              <h4>Strengths</h4>
              <ul>
                <li>Consistent tempo throughout exercise</li>
                <li>Good posture maintenance</li>
                <li>Proper breathing technique</li>
              </ul>
            </div>
            <div>
              <h4>Areas for Improvement</h4>
              <ul>
                <li>Try to increase your range of motion</li>
                <li>Focus on keeping your core engaged</li>
                <li>Slow down slightly for better control</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Progress Comparison Table */}
        <section>
          <h3 style={{ marginBottom: '1.5rem' }}>Progress Comparison</h3>
          {isLoading ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p>Loading previous sessions...</p>
            </div>
          ) : (
            <table className="activity-table">
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Date</th>
                  <th>Reps</th>
                  <th>Form Score</th>
                  <th>Duration</th>
                  <th>Improvement</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: 'rgba(164, 255, 0, 0.05)' }}>
                  <td style={{ fontWeight: '600', color: 'var(--accent-green)' }}>Today</td>
                  <td>{new Date().toLocaleDateString()}</td>
                  <td>{results.totalReps}</td>
                  <td>
                    <span className={`badge ${getFormScoreBadge(results.avgFormScore)}`}>
                      {results.avgFormScore}%
                    </span>
                  </td>
                  <td>{formatTime(results.duration)}</td>
                  <td style={{ color: 'var(--accent-green)', fontWeight: '600' }}>
                    {calculateImprovement()}
                  </td>
                </tr>
                {previousSessions.length > 0 ? (
                  previousSessions.map((session, index) => (
                    <tr key={index}>
                      <td>Session {previousSessions.length - index}</td>
                      <td>{new Date(session.date).toLocaleDateString()}</td>
                      <td>{session.reps}</td>
                      <td>
                        <span className={`badge ${getFormScoreBadge(session.formScore)}`}>
                          {session.formScore}%
                        </span>
                      </td>
                      <td>{formatTime(session.duration)}</td>
                      <td>—</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                      This is your first {exercise.name} workout! Keep it up!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </section>

        {/* Recommendations */}
        <section className="glass-card">
          <h3>Recommendations</h3>
          <ul>
            <li>Rest for 24-48 hours before repeating this exercise</li>
            <li>Try increasing reps by 2-3 in your next session</li>
            <li>Consider adding weight for progressive overload</li>
          </ul>
        </section>

        {/* Action Buttons */}
        <section style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={handleSaveWorkout} className="primary">Save Workout</button>
          <button onClick={() => onNavigate('dashboard')}>Return to Dashboard</button>
        </section>

        {/* Next Exercises */}
        <section>
          <h3>Continue with another exercise:</h3>
          <div className="grid-3" style={{ marginTop: '1rem' }}>
            {exercises.filter(ex => ex.id !== exercise.id).slice(0, 3).map(ex => (
              <div key={ex.id} className="glass-card" style={{ cursor: 'pointer' }} onClick={() => onStartExercise(ex)}>
                <h4>{ex.name}</h4>
                <p>{ex.duration}</p>
                <button className="primary" style={{ marginTop: '1rem', width: '100%' }}>Start</button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Results;
