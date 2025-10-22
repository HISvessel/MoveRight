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
  const [svmPrediction, setSvmPrediction] = useState(null);
  const [angles, setAngles] = useState(null);
  const [svmConfidence, setSvmConfidence] = useState(0);
  
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
      // Display video frame
      if (videoRef.current) {
        videoRef.current.src = 'data:image/jpeg;base64,' + data.image;
      }
      
      // Update SVM data if available
      if (data.analysis) {
        if (data.analysis.svm) {
          setSvmPrediction(data.analysis.svm.prediction);
          setSvmConfidence(data.analysis.svm.confidence);
          
          // Update form score based on SVM
          if (data.analysis.svm.is_good_form) {
            setFormScore(Math.min(100, 85 + Math.round(data.analysis.svm.confidence * 5)));
          } else {
            setFormScore(Math.max(0, 60 - Math.abs(Math.round(data.analysis.svm.confidence * 5))));
          }
        }
        
        if (data.analysis.angles) {
          setAngles(data.analysis.angles);
        }
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
          // source: 'http://192.168.0.8:4747/video' // Kevin IP address
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
    console.log('🎬 Attempting to start stream...'); // ADD THIS
    console.log('Socket:', socketRef.current);        // ADD THIS
    console.log('User ID:', userId);                  // ADD THIS
    
    if (socketRef.current && userId) {
      // Detect exercise type for backend
      let exerciseType = 'squat'; // default
      if (exercise.name.toLowerCase().includes('push')) {
        exerciseType = 'pushup';
      } else if (exercise.name.toLowerCase().includes('squat')) {
        exerciseType = 'squat';
      } else if (exercise.name.toLowerCase().includes('sit')) {
        exerciseType = 'squat'; // Treat sit-ups like squats for now (no SVM model yet)
      }
      console.log('🎬 Starting stream with exercise:', exerciseType); // ADD THIS
      
      socketRef.current.emit('start_stream', { 
        user_id: userId,
        exercise: exerciseType
      });
    } else {
      console.error('❌ Cannot start stream - missing socket or userId'); // ADD THIS
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
              {/* SVM Prediction */}
              {svmPrediction === 'good' && (
                <p style={{ color: 'green', fontSize: '1.2em', fontWeight: 'bold' }}>
                  ✅ Good Form! (Confidence: {svmConfidence.toFixed(2)})
                </p>
              )}
              {svmPrediction === 'bad' && (
                <p style={{ color: 'orange', fontSize: '1.2em', fontWeight: 'bold' }}>
                  ⚠️ Improve Form (Confidence: {Math.abs(svmConfidence).toFixed(2)})
                </p>
              )}
              
              {/* Angles Display */}
              {angles && (
                <div style={{ marginTop: '10px', fontSize: '0.9em' }}>
                  <p><strong>Joint Angles:</strong></p>
                  {angles.elbow && <p>Elbow: {angles.elbow}°</p>}
                  {angles.body && <p>Body: {angles.body}°</p>}
                  {angles.shoulder && <p>Shoulder: {angles.shoulder}°</p>}
                  {angles.knee && <p>Knee: {angles.knee}°</p>}
                  {angles.hip && <p>Hip: {angles.hip}°</p>}
                  {angles.back && <p>Back: {angles.back}°</p>}
                </div>
              )}
              
              {/* Fallback if no SVM data yet */}
              {!svmPrediction && (
                <p>Analyzing form...</p>
              )}
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