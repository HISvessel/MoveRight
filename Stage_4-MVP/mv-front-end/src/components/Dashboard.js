import React from 'react';
import '../styles/Dashboard.css';

function Dashboard({ user, onNavigate, onStartExercise, onLogout }) {
  const exercises = [
    { 
      id: 1, 
      name: 'Pushups', 
      duration: '3 sets x 12 reps', 
      muscles: 'Chest, Triceps, Shoulders',
      difficulty: 'Medium',
      description: 'A fundamental upper body exercise that builds strength in your chest, shoulders, and triceps.'
    },
    { 
      id: 2, 
      name: 'Squats', 
      duration: '3 sets x 15 reps', 
      muscles: 'Quads, Glutes, Hamstrings',
      difficulty: 'Medium',
      description: 'A powerful lower body exercise targeting your legs and glutes.'
    },
    { 
      id: 3, 
      name: 'Sit-ups', 
      duration: '3 sets x 20 reps', 
      muscles: 'Abs, Core',
      difficulty: 'Easy',
      description: 'A classic core exercise that strengthens your abdominal muscles.'
    }
  ];

  return (
    <div>
      <header>
        <h1>MoveRight Dashboard</h1>
        <nav>
          <button onClick={() => onNavigate('account')}>Account</button>
          <button onClick={() => onNavigate('review')}>Leave Review</button>
          <button onClick={onLogout}>Logout</button>
        </nav>
      </header>

      <main>
        <section>
          <h2>Welcome back, {user.first_name || user.name}!</h2>
          <p>Ready to crush your workout?</p>
        </section>

        <section>
          <h3>Available Workouts</h3>
          <div>
            {exercises.map(exercise => (
              <div key={exercise.id}>
                <h4>{exercise.name}</h4>
                <p><strong>Duration:</strong> {exercise.duration}</p>
                <p><strong>Muscles:</strong> {exercise.muscles}</p>
                <p><strong>Difficulty:</strong> {exercise.difficulty}</p>
                <p>{exercise.description}</p>
                <button onClick={() => onStartExercise(exercise)}>
                  Start Exercise
                </button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3>Your Stats</h3>
          <div>
            <div>
              <h4>Total Workouts</h4>
              <p>24</p>
            </div>
            <div>
              <h4>This Week</h4>
              <p>5</p>
            </div>
            <div>
              <h4>Avg Form Score</h4>
              <p>85%</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
