import React from 'react';
import UserReviews from './UserReviews';
import './Styles/LandingPage.css';

function LandingPage({ onNavigate }) {
  return (
    <div>
      <header>
        <h1>MoveRight</h1>
        <nav>
          <button onClick={() => onNavigate('login')}>Log In</button>
        </nav>
      </header>

      <main>
        <section>
          <h2>Perfect Your Form. Maximize Your Results.</h2>
          <p>AI-powered workout tracking that analyzes your form in real-time and helps you exercise safely and effectively.</p>
          <button onClick={() => onNavigate('signup')}>Get Started</button>
        </section>

        <section>
          <h3>Features</h3>
          <div>
            <div>
              <h4>Live Analysis</h4>
              <p>Real-time form correction as you exercise</p>
            </div>
            <div>
              <h4>Track Progress</h4>
              <p>Monitor improvements over time</p>
            </div>
            <div>
              <h4>Guided Workouts</h4>
              <p>Step-by-step instructions for every exercise</p>
            </div>
          </div>
        </section>

        <UserReviews />
      </main>

      <footer>
        <p>&copy; 2025 MoveRight. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
