import React from 'react';

function UserReviews() {
  const reviews = [
    {
      id: 1,
      name: 'Sarah Johnson',
      rating: 5,
      comment: 'MoveRight has completely transformed my workout routine. The real-time form feedback is incredible!',
      date: '2025-09-15'
    },
    {
      id: 2,
      name: 'Mike Chen',
      rating: 5,
      comment: 'Finally, an app that actually helps me exercise correctly. My back pain is gone!',
      date: '2025-09-10'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      rating: 4,
      comment: 'Great app for beginners. The step-by-step instructions are really helpful.',
      date: '2025-09-05'
    },
    {
      id: 4,
      name: 'James Wilson',
      rating: 5,
      comment: 'The progress tracking keeps me motivated. Love seeing my improvements over time.',
      date: '2025-08-28'
    }
  ];

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <section>
      <h3>What Our Users Say</h3>
      <div>
        {reviews.map(review => (
          <div key={review.id}>
            <div>
              <h4>{review.name}</h4>
              <div>{renderStars(review.rating)}</div>
              <p>{new Date(review.date).toLocaleDateString()}</p>
            </div>
            <p>{review.comment}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default UserReviews;
