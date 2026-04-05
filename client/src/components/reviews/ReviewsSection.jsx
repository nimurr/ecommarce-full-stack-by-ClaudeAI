import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiStar, FiFilter, FiChevronDown } from 'react-icons/fi';
import { fetchProductReviews, markHelpful, markNotHelpful, createReview } from '../../store/slices/reviewSlice';
import { ReviewForm } from './ReviewForm';
import ReviewCard from './ReviewCard';
import { toast } from 'react-toastify';

const ReviewsSection = ({ productId, productRating, productNumReviews, userHasPurchased }) => {
  const dispatch = useDispatch();
  const { reviews, loading, ratingDistribution } = useSelector((state) => state.reviews);
  const { user } = useSelector((state) => state.auth);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [filterRating, setFilterRating] = useState(0);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    dispatch(fetchProductReviews({ productId, params: { filter: filterRating } }));
  }, [dispatch, productId, filterRating]);

  const handleHelpful = async (reviewId) => {
    await dispatch(markHelpful(reviewId));
  };

  const handleNotHelpful = async (reviewId) => {
    try {
      const reviewAPI = (await import('../../utils/api')).reviewAPI;
      await reviewAPI.markNotHelpful(reviewId);
      dispatch(fetchProductReviews({ productId }));
    } catch (error) {
      console.error('Failed to mark not helpful:', error);
    }
  };

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    dispatch(fetchProductReviews({ productId }));
  };

  const totalRatings = ratingDistribution
    ? Object.values(ratingDistribution).reduce((a, b) => a + b, 0)
    : 0;

  const sortedReviews = reviews ? [...reviews].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'lowest') return a.rating - b.rating;
    if (sortBy === 'helpful') return (b.helpfulCount || 0) - (a.helpfulCount || 0);
    return 0;
  }) : [];

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

      {/* Rating Summary */}
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <div className="text-5xl font-bold text-primary-600 mb-2">
            {productRating ? productRating.toFixed(1) : '0.0'}
          </div>
          <div className="flex justify-center mb-2">
            <FiStar className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            <FiStar className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            <FiStar className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            <FiStar className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            <FiStar className="w-6 h-6 fill-yellow-400 text-yellow-400" />
          </div>
          <p className="text-gray-600">{productNumReviews || 0} reviews</p>
        </div>

        <div className="md:col-span-2">
          {ratingDistribution && (
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingDistribution[star] || 0;
                const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
                return (
                  <button
                    key={star}
                    onClick={() => setFilterRating(filterRating === star ? 0 : star)}
                    className={`w-full flex items-center gap-3 p-2 rounded hover:bg-gray-100 ${
                      filterRating === star ? 'bg-gray-100' : ''
                    }`}
                  >
                    <span className="text-sm font-medium w-12 text-right">{star} star</span>
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12">{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Write Review Button */}
      {user && userHasPurchased && !showReviewForm && (
        <button
          onClick={() => setShowReviewForm(true)}
          className="btn-primary mb-6"
        >
          Write a Review
        </button>
      )}

      {user && !userHasPurchased && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            You can only review products you have purchased and received.
          </p>
        </div>
      )}

      {!user && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Please <a href="/login" className="text-primary-600 underline">login</a> to write a review.
          </p>
        </div>
      )}

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="mb-8 p-6 bg-white border-2 border-primary-200 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Write a Review</h3>
            <button
              onClick={() => setShowReviewForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <ReviewForm
            productId={productId}
            onSuccess={handleReviewSuccess}
          />
        </div>
      )}

      {/* Filter and Sort */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-400" />
          <span className="text-sm font-medium">Filter:</span>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(Number(e.target.value))}
            className="input-field py-1"
          >
            <option value={0}>All Ratings</option>
            <option value={5}>5 Stars</option>
            <option value={4}>4 Stars</option>
            <option value={3}>3 Stars</option>
            <option value={2}>2 Stars</option>
            <option value={1}>1 Star</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <FiChevronDown className="text-gray-400" />
          <span className="text-sm font-medium">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field py-1"
          >
            <option value="newest">Newest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
        </div>
      ) : sortedReviews.length > 0 ? (
        <div className="space-y-6">
          {sortedReviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onHelpful={handleHelpful}
              onNotHelpful={handleNotHelpful}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <FiStar className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No reviews yet</p>
          <p className="text-sm">Be the first to review this product!</p>
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
