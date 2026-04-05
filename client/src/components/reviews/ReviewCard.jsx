import { useState } from 'react';
import { FiStar, FiThumbsUp, FiThumbsDown, FiMessageSquare } from 'react-icons/fi';
import { StarRating } from './ReviewForm';

const ReviewCard = ({ review, onHelpful, onNotHelpful }) => {
  const [showAdminResponse, setShowAdminResponse] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="border-b border-gray-200 pb-6 last:border-0">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-bold">
              {review.userName?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{review.userName}</h4>
              {review.verifiedPurchase && (
                <span className="badge badge-success text-xs">Verified Purchase</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={review.rating} size="sm" />
              <span className="text-sm text-gray-500">
                {formatDate(review.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <h3 className="font-semibold text-lg mb-2">{review.title}</h3>
      <p className="text-gray-700 mb-4">{review.comment}</p>

      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-4">
          {review.images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Review image ${index + 1}`}
              className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80"
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={() => onHelpful(review._id)}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600"
        >
          <FiThumbsUp className="w-4 h-4" />
          Helpful ({review.helpfulCount || 0})
        </button>
        <button
          onClick={() => onNotHelpful(review._id)}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600"
        >
          <FiThumbsDown className="w-4 h-4" />
          Not Helpful ({review.notHelpfulCount || 0})
        </button>
        {review.adminResponse && (
          <button
            onClick={() => setShowAdminResponse(!showAdminResponse)}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
          >
            <FiMessageSquare className="w-4 h-4" />
            Seller Response
          </button>
        )}
      </div>

      {showAdminResponse && review.adminResponse && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm">Seller Response</span>
            <span className="text-xs text-gray-500">
              {formatDate(review.adminResponseDate)}
            </span>
          </div>
          <p className="text-gray-700">{review.adminResponse}</p>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
