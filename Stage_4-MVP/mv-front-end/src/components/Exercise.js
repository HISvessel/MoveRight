import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import '../styles/Exercise.css';

function Exercise({ exercise, onNavigate, onComplete }) {
  const [phase, setPhase] = useState('instructions');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [reps, setReps] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [formScore, setFormScore] = useState(0);
  
  // WebSocket and Camera states
  const [cameraStatus, setCameraStatus] = useState('stopped'); // stopped, starting, running
  const [streamStatus, setStreamStatus] = useState('stopped'); // stopped, streaming
  const [error, setError] = useState(null);
  
  const socketRef = useRef(null);
  const videoRef = useRef(null);

  // Get user ID from localStorage (set during login)
  const userId = localStorage.getItem('user_id');
  const token = localStorage.getItem('token');

  // Initialize WebSocket connection
  useEffect(() => {
    // Connect to WebSocket when component mounts
    socketRef.current = io('http://localhost:5000/camera');

    socketRef.current.on('connect', () => {
      console.log('WebSocket connected');
    });

    socketRef.current.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setStreamStatus('stopped');
    });

    // Receive frames from server
    socketRef.current.on('frame', (data) => {
      if (videoRef.current) {
        videoRef.current.src = 'data:image/jpeg;base64,' + data.image;
      }
    });

    // Handle stream started event
    socketRef.current.on('stream_started', (data) => {
      console.log('Streaming started:', data);
      setStreamStatus('streaming');
    });

    // Handle stream stopped event
    socketRef.current.on('stream_stopped', (data) => {
      console.log('Streaming stopped:', data);
      setStreamStatus('stopped');
    });

    // Handle errors from server
    socketRef.current.on('error', (data) => {
      console.error('WebSocket error:', data.message);
      setError(data.message);
    });

    // Cleanup on unmount
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
        // Simulate rep counting (will be replaced with MediaPipe)
        if (recordingTime % 3 === 0 && recordingTime > 0) {
          setReps(prev => prev + 1);
        }
        // Simulate form score (will be replaced with ML model)
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

  // Start camera on backend
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
          // source: 'http://192.168.0.4:8080/video' // Kevin IP address
          source: 'http://192.168.0.6:8080/video' // Joe IP
          // Change to source: 0 for laptop webcam
        })
      });

      const data = await response.json();

      if (response.ok) {
        setCameraStatus('running');
        console.log('Camera started, FPS:', data.fps);
        
        // Wait a moment for camera to capture first frames
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

  // Stop camera on backend
  const handleStopCamera = async () => {
    try {
      // Stop streaming first
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

  // Start WebSocket streaming
  const handleStartStream = () => {
    if (socketRef.current && userId) {
      socketRef.current.emit('start_stream', { user_id: userId });
    }
  };

  // Stop WebSocket streaming
  const handleStopStream = () => {
    if (socketRef.current && userId) {
      socketRef.current.emit('stop_stream', { user_id: userId });
    }
  };

  const handleStartRecording = async () => {
    // Start camera first
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
    
    // Stop camera and streaming
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

          <button onClick={handleStartRecording}>
            {cameraStatus === 'starting' ? 'Starting Camera...' : 'Start Recording'}
          </button>
          
          {error && (
            <div style={{ color: 'red', marginTop: '10px' }}>
              Error: {error}
            </div>
          )}
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
              <div style={{
                width: '100%',
                maxWidth: '640px',
                backgroundColor: '#000',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <img 
                  ref={videoRef}
                  alt="Live camera feed"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block'
                  }}
                />
              </div>
              
              {streamStatus === 'streaming' && (
                <p style={{ color: 'green', fontWeight: 'bold' }}>
                  🔴 LIVE
                </p>
              )}
              
              {cameraStatus === 'starting' && (
                <p>Starting camera...</p>
              )}
              
              {error && (
                <p style={{ color: 'red' }}>Error: {error}</p>
              )}
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