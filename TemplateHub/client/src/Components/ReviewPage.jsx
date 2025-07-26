import React, { useState } from "react";
import "./ReviewPage.css";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import API_CONFIG from '../config/api';
const ReviewPage = () => {
  const [activeStars, setActiveStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");


 

// Inside your component
const location = useLocation();
const query = new URLSearchParams(location.search);
const templateId = query.get("templateId");
const navigate=useNavigate()
  const handleStarClick = (starValue) => {
    setActiveStars(starValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = localStorage.getItem("username") || "Anonymous";
  
    const reviewData = {
      username,
      rating: activeStars,       // was "rating"
      title: reviewTitle,        // was "title"
      content: reviewText,       // was "content"
      templateId, // Include this!
    };
  
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/reviews/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });
  
      const result = await res.json();
      console.log("Submitted review:", result);
      navigate("/")
      
    } catch (err) {
      console.error("Failed to submit review", err);
      alert("Error submitting review");
    }
  };
  
  

  return (
    <div className="fr__container">
      <div className="fr__card">
        <div className="fr__header">
          <h3 className="fr__heading">Share Your Experience</h3>
          <p className="fr__subheading">Rate this web design</p>
        </div>

        <form onSubmit={handleSubmit} className="fr__form">
          <div className="fr__stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={`star-${star}`}
                type="button"
                className={`fr__star-btn ${
                  (hoverStars || activeStars) >= star ? "fr__star-active" : ""
                }`}
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => setHoverStars(star)}
                onMouseLeave={() => setHoverStars(0)}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="fr__star-icon"
                >
                  <path
                    d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            ))}
            <div 
              className="fr__stars-highlight" 
              style={{ width: `${(hoverStars || activeStars) * 20}%` }}
            />
          </div>

          <div className="fr__input-group">
            <input
              type="text"
              className="fr__text-input"
              id="fr__title-input"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
            />
            <label htmlFor="fr__title-input" className="fr__input-label">
              Review Title
            </label>
            <div className="fr__input-underline" />
          </div>

          <div className="fr__input-group">
            <textarea
              className="fr__text-area"
              id="fr__review-input"
              rows="5"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <label htmlFor="fr__review-input" className="fr__input-label">
              Your Thoughts
            </label>
            <div className="fr__input-underline" />
          </div>

          <button type="submit" className="fr__submit-btn">
            <span className="fr__submit-text">Submit Review</span>
            <div className="fr__btn-effects">
              <div className="fr__btn-pulse" />
              <div className="fr__btn-arrow">→</div>
            </div>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewPage;