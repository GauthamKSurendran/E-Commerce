import React, { useState, useContext } from "react";
import { ReviewContext } from "../context/ReviewProvider";

export default function ProductReviews({ productId, user }) {
  const { addReview, getProductReviews } = useContext(ReviewContext);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text: '' }

  // Fetch the latest reviews for this specific product
  const reviews = getProductReviews(productId);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setFeedback({ type: "error", text: "Please write a comment for your review." });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    // Call the upgraded addReview function from our Context
    const result = await addReview({ productId, rating, comment });

    if (result.success) {
      setFeedback({ type: "success", text: result.message });
      setComment(""); // Clear form on success
      setRating(5);
    } else {
      setFeedback({ type: "error", text: result.message });
    }
    
    setIsSubmitting(false);
  };

  // Helper to render stars based on a number
  const renderStars = (num) => {
    return [...Array(5)].map((_, index) => (
      <i 
        key={index} 
        className={`bi bi-star${index < num ? '-fill' : ''} text-warning me-1`}
        style={{ fontSize: '0.9rem' }}
      ></i>
    ));
  };

  return (
    <div className="mt-5 pt-4 border-top border-dark">
      <h4 className="fw-black text-uppercase ls-1 mb-4">Customer Reviews</h4>

      <div className="row g-5">
        {/* REVIEWS LIST */}
        <div className="col-lg-7">
          {reviews.length === 0 ? (
            <div className="bg-light p-4 text-center border border-light">
              <p className="text-muted small fw-bold text-uppercase mb-0">No reviews yet. Be the first to review this item!</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-4">
              {reviews.map((review, index) => (
                <div key={index} className="pb-3 border-bottom border-light">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold small text-uppercase">{review.userName}</span>
                    <span className="text-muted extra-small">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mb-2">
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-muted small mb-0">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* WRITE A REVIEW FORM */}
        <div className="col-lg-5">
          <div className="bg-light p-4 border border-dark rounded-0 sticky-top" style={{ top: '100px' }}>
            <h5 className="fw-black text-uppercase ls-1 mb-4 border-bottom pb-2">Write a Review</h5>
            
            {!user ? (
              <div className="text-center py-3">
                <p className="extra-small fw-bold text-muted mb-3 text-uppercase">Please log in to share your thoughts.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview}>
                
                {/* INTERACTIVE STAR SELECTOR */}
                <div className="mb-4">
                  <label className="extra-small fw-bold text-muted text-uppercase ls-1 mb-2 d-block">Overall Rating</label>
                  <div className="d-flex gap-2 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i 
                        key={star}
                        className={`bi bi-star${star <= rating ? '-fill' : ''} text-warning fs-4 cursor-pointer transition-all`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setRating(star)}
                        onMouseEnter={(e) => e.target.classList.add('opacity-75')}
                        onMouseLeave={(e) => e.target.classList.remove('opacity-75')}
                      ></i>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="extra-small fw-bold text-muted text-uppercase ls-1 mb-2">Your Review</label>
                  <textarea 
                    className="form-control rounded-0 p-3 border-dark shadow-none" 
                    rows="4"
                    placeholder="What did you like or dislike?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  ></textarea>
                </div>

                {/* FEEDBACK MESSAGES */}
                {feedback && (
                  <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-danger'} rounded-0 extra-small fw-bold p-2 mb-4`}>
                    {feedback.text}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-dark w-100 py-3 fw-black ls-2 rounded-0 shadow-hover border-0"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}