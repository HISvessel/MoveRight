import React, { useState, useEffect } from 'react';
import './styles/App.css';
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
  const [currentExercise, setCurrentExercise] = useState(null);
  const [exerciseResults, setExerciseResults] = useState(null);

  // Check for existing session on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedPage = localStorage.getItem('currentPage');
    const savedExercise = localStorage.getItem('currentExercise');
    const savedResults = localStorage.getItem('exerciseResults');
    
    if (token && savedUser) {
      // User has a saved session, restore it
      setUser(JSON.parse(savedUser));

      if (savedExercise) {
      setCurrentExercise(JSON.parse(savedExercise));
      }
      
      if (savedResults) {
        setExerciseResults(JSON.parse(savedResults));
      }

        setCurrentPage(savedPage ||'dashboard');
      }
  }, []); // Empty array means this runs once when component mounts

  // Save current page to localStorage whenever it changes
  useEffect(() => {
    // Only save if user is logged in (don't save landing/login/signup pages)
    if (user && currentPage !== 'landing' && currentPage !== 'login' && currentPage !== 'signup') {
      localStorage.setItem('currentPage', currentPage);
    }
  }, [currentPage, user]); // Runs whenever currentPage or user changes

  const handleSignUpSuccess = (userData) => {
    const newUser = {
      ...userData,
      memberSince: userData.created_at || new Date().toISOString()
    };
    setUser(newUser);
    
    // Save user to localStorage
    localStorage.setItem('user', JSON.stringify(newUser));
    
    setCurrentPage('dashboard');
  };

  const handleLoginSuccess = (userData) => {
    const newUser = {
      ...userData,
      memberSince: userData.created_at || new Date().toISOString()
    };
    setUser(newUser);
    
    // Save user to localStorage
    localStorage.setItem('user', JSON.stringify(newUser));

    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    // Clear localStorage on logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_id');
    localStorage.removeItem('currentPage');
    localStorage.removeItem('currentExercise');
    localStorage.removeItem('exerciseResults');
    
    setUser(null);
    setCurrentPage('landing');
  };

  const handleUpdateUser = (updatedUser) => {
  setUser(updatedUser);
  
  // Update user in localStorage when profile changes
  localStorage.setItem('user', JSON.stringify(updatedUser));
};

  const handleStartExercise = (exercise) => {
    setCurrentExercise(exercise);
    localStorage.setItem('currentExercise', JSON.stringify(exercise));
    setCurrentPage('exercise');
  };

  const handleExerciseComplete = (results) => {
    setExerciseResults(results);
    localStorage.setItem('exerciseResults', JSON.stringify(results));
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
