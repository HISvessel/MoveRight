import React, { useState, useEffect } from 'react';
import './Styles/App.css';
import LandingPage from './components/LandingPage';
import SignUp from './components/SignUp';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Exercise from './components/Exercise';
import Account from './components/Account';
import Results from './components/Results';
import ReviewForm from './components/ReviewForm';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [workoutResults, setWorkoutResults] = useState(null);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
        setCurrentPage('dashboard');
      } catch (error) {
        console.error('Failed to load user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleSignUpSuccess = (userData) => {
    setUser(userData);
    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
    setCurrentPage('dashboard');
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    setCurrentPage('landing');
  };

  const handleStartExercise = (exercise) => {
    setSelectedExercise(exercise);
    setCurrentPage('exercise');
  };

  const handleExerciseComplete = (results) => {
    setWorkoutResults(results);
    setCurrentPage('results');
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentPage} />;
      case 'signup':
        return <SignUp onNavigate={setCurrentPage} onSignUpSuccess={handleSignUpSuccess} />;
      case 'login':
        return <Login onNavigate={setCurrentPage} onLoginSuccess={handleLoginSuccess} />;
      case 'dashboard':
        return (
          <Dashboard 
            user={user}
            onNavigate={setCurrentPage}
            onStartExercise={handleStartExercise}
            onLogout={handleLogout}
          />
        );
      case 'exercise':
        return (
          <Exercise 
            exercise={selectedExercise}
            onNavigate={setCurrentPage}
            onComplete={handleExerciseComplete}
          />
        );
      case 'account':
        return (
          <Account 
            user={user}
            onNavigate={setCurrentPage}
            onUpdateUser={setUser}
            onLogout={handleLogout}
          />
        );
      case 'results':
        return (
          <Results 
            results={workoutResults}
            exercise={selectedExercise}
            onNavigate={setCurrentPage}
            onStartExercise={handleStartExercise}
          />
        );
      case 'review':
        return (
          <ReviewForm 
            user={user}
            onNavigate={setCurrentPage}
          />
        );
      default:
        return <LandingPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="app">
      {renderPage()}
    </div>
  );
}

export default App;
