import React from 'react';
import UserReviews from './UserReviews';
import '../styles/LandingPage.css';
import '../styles/App.css';

function LandingPage({ onNavigate }) {
  return (
    <div className="page-landing">
      <header className="landing-header">
        <div className="landing-header-content">
          <h1>MoveRight</h1>
          <nav>
            <button onClick={() => onNavigate('login')}>Log In</button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <h2>Perfect Your Form. Maximize Your Results.</h2>
          <p>
            AI-powered workout tracking that analyzes your form in real-time and 
            helps you exercise safely and effectively.
          </p>
          <button className="primary" onClick={() => onNavigate('signup')}>
            Get Started
          </button>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <h3>Features</h3>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                📹
              </div>
              <h4>Live Analysis</h4>
              <p>
                Real-time form correction as you exercise with instant feedback 
                on your technique and posture.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                📊
              </div>
              <h4>Track Progress</h4>
              <p>
                Monitor improvements over time with detailed metrics, performance 
                graphs, and workout history.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                🎯
              </div>
              <h4>Guided Workouts</h4>
              <p>
                Step-by-step instructions for every exercise with expert tips 
                and common mistakes to avoid.
              </p>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="reviews-section">
          <UserReviews />
        </section>
      </main>

      <footer className="landing-footer">
        <p>&copy; 2025 MoveRight. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
