import React, { useState } from 'react';
import './ProductFeedback.css';

const ProductFeedback = ({ batchId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert('Please select a star rating.');
    
    setIsSubmitting(true);
    try {
      const resp = await fetch('http://localhost:8080/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId: batchId.toString(), rating, comment })
      });
      if (resp.ok) {
        setSuccess(true);
        if (onReviewSubmitted) onReviewSubmitted();
      } else {
        alert('Failed to submit review.');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="feedback-success">
        <div className="success-icon">✅</div>
        <h3>Thank You!</h3>
        <p>Your feedback helps us maintain transparency.</p>
      </div>
    );
  }

  return (
    <div className="feedback-container glassmorphism">
      <h3 className="feedback-title">Rate this Product</h3>
      <p className="feedback-subtitle">Was the quality up to your expectations?</p>

      <form onSubmit={handleSubmit} className="feedback-form">
        <div className="stars-container">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`feedback-star ${(hoverRating || rating) >= star ? 'active' : ''}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            >
              ★
            </span>
          ))}
        </div>

        <textarea
          className="feedback-textarea"
          placeholder="Leave a comment (optional)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="4"
        ></textarea>

        <button 
          type="submit" 
          className="feedback-submit-btn"
          disabled={isSubmitting || rating === 0}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ProductFeedback;
