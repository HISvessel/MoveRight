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
      <section>
        <h3>What Our Users Say</h3>
        <p>Loading reviews...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h3>What Our Users Say</h3>
        <p>{error}</p>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section>
        <h3>What Our Users Say</h3>
        <p>No reviews yet. Be the first to share your experience!</p>
      </section>
    );
  }

  return (
    <section>
      <h3>What Our Users Say</h3>
      <div>
        {reviews.map(review => (
          <div key={review.id}>
            <div>
              <h4>{review.user_name || 'Anonymous'}</h4>
              <div>{renderStars(review.rating)}</div>
              <p>{new Date(review.created_at).toLocaleDateString()}</p>
            </div>
            <h5>{review.title}</h5>
            <p>{review.comment}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default UserReviews;