import React, { useState } from 'react';
import { reviewAPI } from '../services/api';
import '../styles/ReviewForm.css';
import '../styles/App.css';

function ReviewForm({ user, onNavigate }) {
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Review title is required';
    }

    if (!formData.comment.trim()) {
      newErrors.comment = 'Review comment is required';
    } else if (formData.comment.trim().length < 10) {
      newErrors.comment = 'Review must be at least 10 characters';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      await reviewAPI.create({
        title: formData.title,
        comment: formData.comment,
        rating: formData.rating
      });
      
      setSubmitted(true);
      
    } catch (error) {
      setErrors({ general: error.message || 'Failed to submit review. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="page-review">
        <header>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' }}>
            <h1>Thank You!</h1>
          </div>
        </header>

        <main className="review-container">
          <div className="success-container glass-card">
            <h2>Your review has been submitted successfully</h2>
            <p>We appreciate your feedback and will use it to improve MoveRight for everyone.</p>
            <button className="primary" onClick={() => onNavigate('dashboard')}>Return to Dashboard</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-review">
      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' }}>
          <h1>Leave a Review</h1>
          <button onClick={() => onNavigate('dashboard')}>← Back to Dashboard</button>
        </div>
      </header>

      <main className="review-container">
        <section className="glass-card">
          <h2>Share Your Experience</h2>
          <p>Help other users by sharing your thoughts about MoveRight</p>
        </section>

        <div className="review-card">
          <form onSubmit={handleSubmit}>
            {errors.general && <div className="general-error">{errors.general}</div>}
            
            <div>
              <label>Rating</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    className={`star-button ${star <= formData.rating ? 'filled' : ''}`}
                    onClick={() => handleRatingChange(star)}
                    disabled={isLoading}
                  >
                    {star <= formData.rating ? '★' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="title">Review Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Summarize your experience"
                disabled={isLoading}
              />
              {errors.title && <span className="error">{errors.title}</span>}
            </div>

            <div>
              <label htmlFor="comment">Your Review</label>
              <textarea
                id="comment"
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                placeholder="Tell us about your experience with MoveRight..."
                rows="6"
                disabled={isLoading}
              />
              {errors.comment && <span className="error">{errors.comment}</span>}
            </div>

            <div className="posting-as">
              <p>Posting as: {user.first_name} {user.last_name}</p>
            </div>

            <button type="submit" className="primary" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ReviewForm;