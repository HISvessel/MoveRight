import React, { useState, useEffect } from 'react';
import { reviewAPI } from '../services/api';
import '../styles/UserReviews.css';

function UserReviews() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const data = await reviewAPI.getAll();
        setReviews(data);
      } catch (err) {
        setError('Failed to load reviews');
        console.error('Error fetching reviews:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (isLoading) {
    return (
      <div className="reviews-container">
        <h3>What Our Users Say</h3>
        <div className="reviews-loading">Loading reviews...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reviews-container">
        <h3>What Our Users Say</h3>
        <div className="reviews-error">{error}</div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="reviews-container">
        <h3>What Our Users Say</h3>
        <div className="reviews-empty">No reviews yet. Be the first to share your experience!</div>
      </div>
    );
  }

  return (
    <div className="reviews-container">
      <h3>What Our Users Say</h3>
      <div className="reviews-grid">
        {reviews.map(review => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <div className="review-user-info">
                <h4>{review.user_name || 'Anonymous'}</h4>
                <div className="review-stars">{renderStars(review.rating)}</div>
              </div>
              <div className="review-date">
                {new Date(review.created_at).toLocaleDateString()}
              </div>
            </div>
            <h5 className="review-title">{review.title}</h5>
            <p className="review-comment">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserReviews;