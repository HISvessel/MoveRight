import React from 'react';

function Dashboard({ user, onNavigate, onStartExercise, onLogout }) {
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
