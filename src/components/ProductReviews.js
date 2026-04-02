import React, { useState, useContext, useRef } from "react";
import { ReviewContext } from "../context/ReviewProvider";

export default function ProductReviews({ 
  productId, 
  user, 
  reviews = [], 
  averageRating = "0.0", 
  totalReviews = 0, 
  distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } 
}) {
  const { addReview, updateReview, deleteReview } = useContext(ReviewContext);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); 
  
  const [editingReviewId, setEditingReviewId] = useState(null);
  const formRef = useRef(null); 

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setFeedback({ type: "error", text: "Please write a comment for your review." });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    let result;
    if (editingReviewId) {
      result = await updateReview({ productId, reviewId: editingReviewId, rating, comment });
    } else {
      result = await addReview({ productId, rating, comment });
    }

    if (result?.success) {
      setFeedback({ type: "success", text: result.message });
      setComment(""); 
      setRating(5);
      setEditingReviewId(null); 
    } else {
      setFeedback({ type: "error", text: result?.message || "An error occurred." });
    }
    
    setIsSubmitting(false);
  };

  const handleEditClick = (review) => {
    setRating(review.rating);
    setComment(review.comment);
    setEditingReviewId(review._id);
    setFeedback(null);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleDeleteClick = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete your review?")) {
      await deleteReview(productId, reviewId);
    }
  };

  const cancelEdit = () => {
    setEditingReviewId(null);
    setRating(5);
    setComment("");
    setFeedback(null);
  };

  const renderStars = (num) => {
    return [...Array(5)].map((_, index) => (
      <i 
        key={index} 
        className={`bi bi-star${index < num ? '-fill' : ''} text-warning me-1`}
        style={{ fontSize: '0.8rem' }}
      ></i>
    ));
  };

  const calculatePercentage = (count) => {
    return totalReviews > 0 ? (count / totalReviews) * 100 : 0;
  };

  return (
    <div className="mt-5 pt-4 border-top border-dark">
      <div className="row g-5">
        
        {/* LEFT SIDE: REVIEWS LIST */}
        <div className="col-lg-7">
          <h5 className="fw-black text-uppercase ls-1 mb-4">Customer Reviews</h5>
          
          {reviews.length === 0 ? (
            <div className="bg-light p-3 text-center border border-light">
              <p className="text-muted small fw-bold text-uppercase mb-0">No reviews yet. Be the first to review this item!</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {reviews.map((review, index) => {
                const isMyReview = user && (user.id === review.user || user.name === review.userName || review.userName === "You");
                
                return (
                  <div key={index} className={`pb-2 border-bottom ${isMyReview ? 'border-dark' : 'border-light'}`}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div className="d-flex align-items-center gap-2">
                          <span className="fw-bold text-uppercase" style={{ fontSize: '0.8rem' }}>{review.userName}</span>
                          <i className="bi bi-patch-check-fill text-success" style={{ fontSize: '0.7rem' }} title="Verified Buyer"></i>
                      </div>
                      <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mb-1">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>{review.comment}</p>
                    
                    {/* EDIT AND DELETE BUTTONS */}
                    {isMyReview && (
                      <div className="d-flex gap-2 mt-2">
                        <button 
                          className="btn btn-outline-dark rounded-0 fw-bold px-2 py-0"
                          style={{ fontSize: '0.65rem' }} 
                          onClick={() => handleEditClick(review)}
                        >
                          EDIT
                        </button>
                        <button 
                          className="btn btn-outline-danger rounded-0 fw-bold px-2 py-0"
                          style={{ fontSize: '0.65rem' }} 
                          onClick={() => handleDeleteClick(review._id)}
                        >
                          DELETE
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT SIDE: RATINGS & FORM */}
        <div className="col-lg-5" ref={formRef}>
          <div className="sticky-top" style={{ top: '100px' }}>
            
            {/* RATING BREAKDOWN */}
            <div className="bg-light p-3 mb-4 border border-dark rounded-0">
              <h6 className="fw-black text-uppercase ls-1 mb-3 border-bottom pb-2" style={{ fontSize: '0.9rem' }}>
                Rating Snapshot
              </h6>
              <div className="row g-2 align-items-center mx-0">
                <div className="col-4 text-center border-end border-dark py-1">
                  <div className="d-flex justify-content-center align-items-center gap-1 mb-1">
                    <h2 className="fw-black mb-0 text-dark">{averageRating}</h2>
                    <i className="bi bi-star-fill text-success fs-5"></i>
                  </div>
                  <p className="extra-small fw-bold text-muted mb-0" style={{ fontSize: '0.65rem' }}>{totalReviews} Buyers</p>
                </div>
                
                <div className="col-8 ps-3 py-1">
                  {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} className="d-flex align-items-center mb-1">
                      <span className="text-muted fw-bold me-1" style={{ width: '12px', fontSize: '0.7rem' }}>{star}</span>
                      <i className="bi bi-star-fill text-muted me-2" style={{ fontSize: '0.5rem' }}></i>
                      <div className="progress rounded-0 flex-grow-1 bg-white border" style={{ height: '5px' }}>
                        <div 
                          className={`progress-bar ${star >= 4 ? 'bg-success' : star === 3 ? 'bg-info' : star === 2 ? 'bg-warning' : 'bg-danger'}`} 
                          role="progressbar" 
                          style={{ width: `${calculatePercentage(distribution[star])}%` }} 
                        ></div>
                      </div>
                      <span className="text-muted ms-2 fw-bold" style={{ width: '20px', textAlign: 'right', fontSize: '0.7rem' }}>
                        {distribution[star] || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* WRITE / EDIT A REVIEW FORM */}
            <div className="bg-light p-3 border border-dark rounded-0">
              <h6 className="fw-black text-uppercase ls-1 mb-3 border-bottom pb-2" style={{ fontSize: '0.9rem' }}>
                {editingReviewId ? 'Edit Your Review' : 'Write a Review'}
              </h6>
              
              {!user ? (
                <div className="text-center py-2">
                  <p className="extra-small fw-bold text-muted mb-2 text-uppercase">Please log in to share your thoughts.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview}>
                  
                  <div className="mb-3">
                    <label className="fw-bold text-muted text-uppercase ls-1 mb-1 d-block" style={{ fontSize: '0.7rem' }}>Overall Rating</label>
                    <div className="d-flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star}
                          type="button" 
                          className="btn btn-link p-0 text-decoration-none shadow-none border-0"
                          onClick={() => setRating(star)}
                        >
                          <i 
                            className={`bi bi-star${star <= rating ? '-fill' : ''} text-warning transition-all`}
                            style={{ fontSize: '1.2rem' }}
                          ></i>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="fw-bold text-muted text-uppercase ls-1 mb-1" style={{ fontSize: '0.7rem' }}>Your Review</label>
                    <textarea 
                      className="form-control rounded-0 p-2 border-dark shadow-none" 
                      rows="2"
                      style={{ fontSize: '0.85rem' }}
                      placeholder="What did you like or dislike?"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                  </div>

                  {feedback && (
                    <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-danger'} rounded-0 fw-bold p-2 mb-3`} style={{ fontSize: '0.75rem' }}>
                      {feedback.text}
                    </div>
                  )}

                  <div className="d-flex gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-dark w-100 py-2 fw-bold ls-1 rounded-0 shadow-hover border-0"
                      style={{ fontSize: '0.8rem' }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'PROCESSING...' : editingReviewId ? 'UPDATE' : 'SUBMIT'}
                    </button>
                    
                    {editingReviewId && (
                      <button 
                        type="button" 
                        className="btn btn-outline-dark py-2 fw-bold ls-1 rounded-0 border-2"
                        style={{ fontSize: '0.8rem' }}
                        onClick={cancelEdit}
                      >
                        CANCEL
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}