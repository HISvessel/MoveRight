import React, { useState, useEffect } from 'react';

function Exercise({ exercise, onNavigate, onComplete }) {
  const [phase, setPhase] = useState('instructions'); // instructions, recording, paused
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [reps, setReps] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [formScore, setFormScore] = useState(0);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
        // Simulate rep counting
        if (recordingTime % 3 === 0 && recordingTime > 0) {
          setReps(prev => prev + 1);
        }
        // Simulate form score fluctuation
        setFormScore(Math.floor(Math.random() * 20) + 75);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, recordingTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = () => {
    setPhase('recording');
    setIsRecording(true);
  };

  const handlePauseRecording = () => {
    setIsRecording(false);
    setPhase('paused');
  };

  const handleResumeRecording = () => {
    setIsRecording(true);
    setPhase('recording');
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    const results = {
      totalReps: reps,
      totalSets: currentSet,
      duration: recordingTime,
      avgFormScore: formScore,
      date: new Date().toISOString()
    };
    onComplete(results);
  };

  if (phase === 'instructions') {
    return (
      <div>
        <header>
          <button onClick={() => onNavigate('dashboard')}>← Back to Dashboard</button>
        </header>

        <main>
          <h2>{exercise.name}</h2>
          
          <section>
            <h3>Exercise Overview</h3>
            <p><strong>Duration:</strong> {exercise.duration}</p>
            <p><strong>Muscles Targeted:</strong> {exercise.muscles}</p>
            <p><strong>Difficulty:</strong> {exercise.difficulty}</p>
            <p>{exercise.description}</p>
          </section>

          <section>
            <h3>Step-by-Step Instructions</h3>
            <ol>
              <li>Position your body in the starting position with proper alignment</li>
              <li>Engage your core and maintain proper posture throughout the movement</li>
              <li>Execute the movement with controlled, deliberate motions</li>
              <li>Breathe steadily - exhale on exertion, inhale on return</li>
              <li>Return to starting position and repeat for desired reps</li>
            </ol>
          </section>

          <section>
            <h3>Form Tips</h3>
            <ul>
              <li>Keep your movements smooth and controlled</li>
              <li>Maintain proper breathing throughout</li>
              <li>Focus on quality over quantity</li>
              <li>Stop immediately if you feel sharp pain</li>
              <li>Keep your core engaged for stability</li>
            </ul>
          </section>

          <section>
            <h3>Common Mistakes to Avoid</h3>
            <ul>
              <li>Rushing through repetitions</li>
              <li>Poor posture and alignment</li>
              <li>Holding your breath</li>
              <li>Using momentum instead of muscle control</li>
            </ul>
          </section>

          <button onClick={handleStartRecording}>Start Recording</button>
        </main>
      </div>
    );
  }

  if (phase === 'recording' || phase === 'paused') {
    return (
      <div>
        <header>
          <h2>{exercise.name}</h2>
          <div>
            <span>Recording Time: {formatTime(recordingTime)}</span>
            {phase === 'paused' && <span> (PAUSED)</span>}
          </div>
        </header>

        <main>
          <section>
            <div>
              <h3>Live Camera Feed</h3>
              <p>[Camera view would appear here]</p>
              <p>Position yourself in frame and begin your exercise</p>
            </div>
          </section>

          <section>
            <h3>Real-Time Metrics</h3>
            <div>
              <div>
                <h4>Reps</h4>
                <p>{reps}</p>
              </div>
              <div>
                <h4>Current Set</h4>
                <p>{currentSet}/3</p>
              </div>
              <div>
                <h4>Form Score</h4>
                <p>{formScore}%</p>
              </div>
            </div>
          </section>

          <section>
            <h3>Form Feedback</h3>
            <div>
              {formScore >= 80 && <p>✓ Excellent form! Keep it up!</p>}
              {formScore >= 60 && formScore < 80 && <p>⚠ Good, but watch your posture</p>}
              {formScore < 60 && <p>⚠ Adjust your form - keep your back straight</p>}
            </div>
          </section>

          <section>
            <h3>Controls</h3>
            <div>
              {phase === 'recording' && (
                <button onClick={handlePauseRecording}>Pause</button>
              )}
              {phase === 'paused' && (
                <button onClick={handleResumeRecording}>Resume</button>
              )}
              <button onClick={handleStopRecording}>Stop & Review</button>
              <button onClick={() => setCurrentSet(prev => prev + 1)}>Next Set</button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return null;
}

export default Exercise;
