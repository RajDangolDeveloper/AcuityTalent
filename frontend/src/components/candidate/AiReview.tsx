import React from "react";

interface AiReviewProps {
  candidateId?: string;
  onClose?: () => void;
}

const AiReview: React.FC<AiReviewProps> = ({ candidateId, onClose }) => {
  return (
    <div className="ai-review-container">
      <div className="ai-review-header">
        <h2>AI Review</h2>
        {onClose && (
          <button onClick={onClose} className="close-button">
            ×
          </button>
        )}
      </div>
      <div className="ai-review-content">{/* Add content here */}</div>
    </div>
  );
};

export default AiReview;
