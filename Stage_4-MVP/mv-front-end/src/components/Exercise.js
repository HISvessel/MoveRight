import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import '../styles/Exercise.css';
import '../styles/App.css';

function Exercise({ exercise, onNavigate, onComplete }) {
  const [phase, setPhase] = useState('instructions');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [reps, setReps] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [formScore, setFormScore] = useState(0);
  const [svmPrediction, setSVMPrediction] = useState(null);
  const [angles, setAngles] = useState(null);
  const [svmConfidence, setSVMConfidence] = useState(0);
  
  // WebSocket and Camera state
  const [cameraStatus, setCameraStatus] = useState('stopped');
  const [streamStatus, setStreamStatus] = useState('stopped');
  const [error, setError] = useState(null);
  
  const socketRef = useRef(null);
  const videoRef = useRef(null);

  // Get user ID from localStorage
  const userId = localStorage.getItem('user_id');
  const token = localStorage.getItem('token');

  // Get exercise-specific class name
  const getExerciseClassName = () => {
    const exerciseName = exercise.name.toLowerCase().replace('-', '');
    return exerciseName;
  };

  // Initialize WebSocket connection
  useEffect(() => {
    socketRef.current = io('http://localhost:5000/camera');

    socketRef.current.on('connect', () => {
      console.log('WebSocket connected');
    });

    socketRef.current.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setStreamStatus('stopped');
    });

    socketRef.current.on('frame', (data) => {
      if (videoRef.current) {
        videoRef.current.src = 'data:image/jpeg;base64,' + data.image;
      }
      if (data.analysis) {
	if (data.analysis.svm) {
	  setSVMPrediction(data.analysis.svm.predition);
	  setSVMConfidence(data.analysis.svm.confidence);
	  
	  if (data.analysis.svm.is_good_form) {
	    setFormScore(Math.min(100, 85 + Math.round(data.analysis.svm.confidence * 5)));
	  } else {
	    setFormScore(Math.min(0, 60 - Math.abs(Math.round(data.analysis.svm.confidence * 5))));
	  }
	}

	if (data.analysis.angle) {
	    setAngles(data.analysis.angles);
	}
      }
    });

    socketRef.current.on('stream_started', (data) => {
      console.log('Streaming started:', data);
      setStreamStatus('streaming');
    });

    socketRef.current.on('stream_stopped', (data) => {
      console.log('Streaming stopped:', data);
      setStreamStatus('stopped');
    });

    socketRef.current.on('error', (data) => {
      console.error('WebSocket error:', data.message);
      setError(data.message);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Recording timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
        if (recordingTime % 3 === 0 && recordingTime > 0) {
          setReps(prev => prev + 1);
        }
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

  const handleStartCamera = async () => {
    try {
      setCameraStatus('starting');
      setError(null);

      const response = await fetch('http://localhost:5000/camera/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          source: 'http://192.168.0.8:4747/video'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setCameraStatus('running');
        console.log('Camera started, FPS:', data.fps);
        
        setTimeout(() => {
          handleStartStream();
        }, 1000);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError('Failed to start camera: ' + err.message);
      setCameraStatus('stopped');
    }
  };

  const handleStopCamera = async () => {
    try {
      if (streamStatus === 'streaming') {
        handleStopStream();
      }

      const response = await fetch('http://localhost:5000/camera/stop', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setCameraStatus('stopped');
        if (videoRef.current) {
          videoRef.current.src = '';
        }
      }
    } catch (err) {
      setError('Failed to stop camera: ' + err.message);
    }
  };

  const handleStartStream = () => {
    console.log('Starting stream.');

    if (socketRef.current && userId) {
      let exerciseType = 'squat'; //default to squat, but why?
      if (exercise.name.toLowerCase().includes('push')) {
	exerciseType = 'pushup';
      } else if (exrcise.name.toLowerCase().includes('squat')) {
	exerciseType = 'squat';
      }
      console.log(`Starting stream with ${exerciseType}`);
      socketRef.current.emit('start_stream', { 
	user_id: userId,
      	exercise: exerciseType
      });
    } else {
      console.error('Cannot start stream - payload data missing.');
    }
  };

  const handleStopStream = () => {
    if (socketRef.current && userId) {
      socketRef.current.emit('stop_stream', { user_id: userId });
    }
  };

  const handleStartRecording = async () => {
    await handleStartCamera();
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

  const handleStopRecording = async () => {
    setIsRecording(false);
    await handleStopCamera();
    
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
      <div className={`page-exercise ${getExerciseClassName()}`}>
        <header>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' }}>
            <h1>{exercise.name}</h1>
            <button onClick={() => onNavigate('dashboard')}>← Back to Dashboard</button>
          </div>
        </header>

        <main className="instructions-container">
          <section className="glass-card">
            <h2>Exercise Overview</h2>
            <p><strong>Duration:</strong> {exercise.duration}</p>
            <p><strong>Muscles Targeted:</strong> {exercise.muscles}</p>
            <p><strong>Difficulty:</strong> <span className={`badge ${exercise.difficulty === 'Beginner' ? 'info' : 'warning'}`}>{exercise.difficulty}</span></p>
            <p>{exercise.description}</p>
          </section>

          <section className="instructions-list">
            <h3>Step-by-Step Instructions</h3>
            <ol>
              <li>Position your body in the starting position with proper alignment</li>
              <li>Engage your core and maintain proper posture throughout the movement</li>
              <li>Execute the movement with controlled, deliberate motions</li>
              <li>Breathe steadily - exhale on exertion, inhale on return</li>
              <li>Return to starting position and repeat for desired reps</li>
            </ol>
          </section>

          <section className="instructions-list">
            <h3>Form Tips</h3>
            <ul>
              <li>Keep your movements smooth and controlled</li>
              <li>Maintain proper breathing throughout</li>
              <li>Focus on quality over quantity</li>
              <li>Stop immediately if you feel sharp pain</li>
              <li>Keep your core engaged for stability</li>
            </ul>
          </section>

          <section className="instructions-list">
            <h3>Common Mistakes to Avoid</h3>
            <ul>
              <li>Rushing through repetitions</li>
              <li>Poor posture and alignment</li>
              <li>Holding your breath</li>
              <li>Using momentum instead of muscle control</li>
            </ul>
          </section>

          <div className="start-button-container">
            <button className="primary" onClick={handleStartRecording} disabled={cameraStatus === 'starting'}>
              {cameraStatus === 'starting' ? 'Starting Camera...' : 'Start Recording'}
            </button>
            
            {error && (
              <div className="camera-error" style={{ marginTop: '1rem' }}>
                {error}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (phase === 'recording' || phase === 'paused') {
    return (
      <div className={`page-exercise ${getExerciseClassName()}`}>
        <header>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' }}>
            <h1>{exercise.name}</h1>
            <div className={`recording-timer ${phase === 'paused' ? 'paused' : ''}`}>
              {formatTime(recordingTime)} {phase === 'paused' && '(PAUSED)'}
            </div>
          </div>
        </header>

        <main>
          <div className="recording-layout">
            {/* Camera Feed */}
            <div className="camera-section">
              <h3>Live Camera Feed</h3>
              <div className="camera-feed-container">
                <img 
                  ref={videoRef}
                  alt="Live camera feed"
                />
                {streamStatus === 'streaming' && (
                  <div className="live-indicator">LIVE</div>
                )}
              </div>
              
              {cameraStatus === 'starting' && (
                <div className="camera-status">Starting camera...</div>
              )}
              
              {error && (
                <div className="camera-error">{error}</div>
              )}
            </div>

            {/* Metrics Sidebar */}
            <div className="metrics-sidebar">
              <div className="metric-box">
                <h4>Reps</h4>
                <div className="value">{reps}</div>
              </div>

              <div className="metric-box">
                <h4>Current Set</h4>
                <div className="value">{currentSet}/3</div>
              </div>

              <div className="metric-box">
                <h4>Form Score</h4>
                <div className="value">{formScore}%</div>
              </div>

              {/* Form Feedback */}
              <div className="form-feedback">
                <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Form Feedback</h4>
                {svmPrediction === 'good' && (
                  <div className="feedback-item excellent">
                    ✓ Excellent form! (Confidence: {svmConfidence.toFixed(2)})
                  </div>
                )}

                {svmPrediction === 'bad' && (
                  <div className="feedback-item warning">
                    ⚠ Adjust your form (Confidence : {Math.abs(svmConfidence).toFixed(2)})
                  </div>
                )}
	    	{angles && (
		<div style={{ margintTop: '1rem', color: 'var(--text-primary)'}}>
		  <p><strong>Joint Angles</strong></p>
		  {angles.elbow && <p>Elbow: {angles.elbow} degrees </p>
		  {angles.body && <p>Body: {angles.body} degrees</p>}
		  {angles.shoulder && <p>Shoulder: {angles.shoulder} degrees</p>
		  {angles.knee && <p>Knee: {angles.knee} degrees</p>}
		  {angles.hip && <p>Hip: {angle.hip} degrees</p>}
		  {angles.body && <p>Body: {angle.body} degrees</p>)}
              </div>
            </div>
          </div>

          {/* Controls */}
          <section className="controls-section">
            <h3>Controls</h3>
            <div className="control-buttons">
              {phase === 'recording' && (
                <button onClick={handlePauseRecording}>Pause</button>
              )}
              {phase === 'paused' && (
                <button className="primary" onClick={handleResumeRecording}>Resume</button>
              )}
              <button onClick={handleStopRecording}>Stop & Review</button>
              <button onClick={() => setCurrentSet(prev => prev + 1)}>Next Set ({currentSet}/3)</button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return null;
}

export default Exercise;
