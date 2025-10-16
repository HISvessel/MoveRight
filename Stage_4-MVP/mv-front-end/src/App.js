import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import SignUp from './components/SignUp';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Account from './components/Account';
import Exercise from './components/Exercise';
import Results from './components/Results';
import ReviewForm from './components/ReviewForm';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [exerciseResults, setExerciseResults] = useState(null);

  const handleSignUpSuccess = (userData) => {
    setUser({
      ...userData,
      memberSince: userData.created_at || new Date().toISOString()
    });
    setCurrentPage('dashboard');
  };

  const handleLoginSuccess = (userData) => {
    setUser({
      ...userData,
      memberSince: userData.created_at || new Date().toISOString()
    });
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCurrentPage('landing');
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleStartExercise = (exercise) => {
    setCurrentExercise(exercise);
    setCurrentPage('exercise');
  };

  const handleExerciseComplete = (results) => {
    setExerciseResults(results);
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
      
      case 'account':
        return (
          <Account 
            user={user}
            onNavigate={setCurrentPage}
            onUpdateUser={handleUpdateUser}
            onLogout={handleLogout}
          />
        );
      
      case 'exercise':
        return (
          <Exercise 
            exercise={currentExercise}
            onNavigate={setCurrentPage}
            onComplete={handleExerciseComplete}
          />
        );
      
      case 'results':
        return (
          <Results 
            results={exerciseResults}
            exercise={currentExercise}
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
