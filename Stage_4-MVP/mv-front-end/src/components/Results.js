import React from 'react';
import '../styles/Results.css';

function Results({ results, exercise, onNavigate, onStartExercise }) {
  const exercises = [
    { id: 1, name: 'Push-ups', duration: '3 sets x 12 reps', muscles: 'Chest, Triceps, Shoulders' },
    { id: 2, name: 'Squats', duration: '3 sets x 15 reps', muscles: 'Quads, Glutes, Core' },
    { id: 3, name: 'Plank', duration: '3 sets x 60 sec', muscles: 'Core, Shoulders' },
    { id: 4, name: 'Lunges', duration: '3 sets x 10 reps per leg', muscles: 'Legs, Glutes' }
  ];

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFormGrade = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Great';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  const handleSaveWorkout = () => {
    // TODO: API call to save workout
    // const response = await fetch('YOUR_BACKEND_API/workouts', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     exerciseId: exercise.id,
    //     ...results
    //   })
    // });
    alert('Workout saved successfully!');
    onNavigate('dashboard');
  };

  return (
    <div>
      <header>
        <h1>Workout Complete!</h1>
      </header>

      <main>
        <section>
          <h2>{exercise.name} - Summary</h2>
          <p>Great job completing your workout!</p>
        </section>

        <section>
          <h3>Performance Metrics</h3>
          <div>
            <div>
              <h4>Total Reps</h4>
              <p>{results.totalReps}</p>
            </div>
            <div>
              <h4>Sets Completed</h4>
              <p>{results.totalSets}</p>
            </div>
            <div>
              <h4>Duration</h4>
              <p>{formatTime(results.duration)}</p>
            </div>
            <div>
              <h4>Avg Form Score</h4>
              <p>{results.avgFormScore}%</p>
            </div>
          </div>
        </section>

        <section>
          <h3>Form Analysis</h3>
          <div>
            <div>
              <p><strong>Overall Grade:</strong> {getFormGrade(results.avgFormScore)}</p>
            </div>
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

        <section>
          <h3>Progress Comparison</h3>
          <p>You improved by 8% compared to your last session!</p>
          <div>
            <p><strong>Previous Session:</strong></p>
            <ul>
              <li>Reps: {results.totalReps - 3}</li>
              <li>Form Score: {results.avgFormScore - 8}%</li>
              <li>Duration: {formatTime(results.duration + 15)}</li>
            </ul>
          </div>
        </section>

        <section>
          <h3>Recommendations</h3>
          <p>Based on your performance, we recommend:</p>
          <ul>
            <li>Rest for 24-48 hours before repeating this exercise</li>
            <li>Try increasing reps by 2-3 in your next session</li>
            <li>Consider adding weight for progressive overload</li>
          </ul>
        </section>

        <section>
          <h3>What's Next?</h3>
          <div>
            <button onClick={handleSaveWorkout}>Save Workout</button>
            <button onClick={() => onNavigate('dashboard')}>Return to Dashboard</button>
          </div>
          
          <h4>Continue with another exercise:</h4>
          <div>
            {exercises.filter(ex => ex.id !== exercise.id).map(ex => (
              <div key={ex.id}>
                <h5>{ex.name}</h5>
                <p>{ex.duration}</p>
                <button onClick={() => onStartExercise(ex)}>Start</button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Results;
