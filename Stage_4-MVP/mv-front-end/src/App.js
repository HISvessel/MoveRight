import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import SignUp from './components/SignUp';
import Login from './components/Login';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);

  const handleSignUpSuccess = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('landing');
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
          <div>
            <h1>Dashboard</h1>
            <p>Welcome, {user?.name || user?.email}!</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
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
