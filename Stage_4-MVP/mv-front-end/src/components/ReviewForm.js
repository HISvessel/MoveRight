import React, { useState } from 'react';
import { reviewAPI } from '../services/api';
import '../styles/ReviewForm.css';

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
    
    // TODO: Replace with actual API call to backend
    try {
      // Call Flask backend to create review
      await reviewAPI.create({
        title: formData.title,
        comment: formData.comment,
        rating: formData.rating
      });
      
      // Note: user_id is automatically added by Flask from JWT token
      setSubmitted(true);
      
    } catch (error) {
      setErrors({ general: error.message || 'Failed to submit review. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div>
        <header>
          <h1>Thank You!</h1>
        </header>

        <main>
          <section>
            <h2>Your review has been submitted successfully</h2>
            <p>We appreciate your feedback and will use it to improve MoveRight for everyone.</p>
            <button onClick={() => onNavigate('dashboard')}>Return to Dashboard</button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div>
      <header>
        <h1>Leave a Review</h1>
        <nav>
          <button onClick={() => onNavigate('dashboard')}>← Back to Dashboard</button>
        </nav>
      </header>

      <main>
        <section>
          <h2>Share Your Experience</h2>
          <p>Help other users by sharing your thoughts about MoveRight</p>
        </section>

        <form onSubmit={handleSubmit}>
          {errors.general && <div>{errors.general}</div>}
          
          <div>
            <label>Rating</label>
            <div>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
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
            {errors.title && <span>{errors.title}</span>}
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
            {errors.comment && <span>{errors.comment}</span>}
          </div>

          <div>
            <p>Posting as: {user.first_name} {user.last_name}</p>
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default ReviewForm;
