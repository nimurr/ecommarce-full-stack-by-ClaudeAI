import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReviews, approveReview, deleteReview } from '../store/slices/reviewSlice';
import { FiCheck, FiX, FiTrash2, FiStar } from 'react-icons/fi';

const Reviews = () => {
  const dispatch = useDispatch();
  const { reviews, loading, total } = useSelector((state) => state.reviews);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    dispatch(fetchReviews({ approved: filter || undefined, limit: 50 }));
  }, [dispatch, filter]);

  const handleApprove = async (id) => {
    await dispatch(approveReview(id));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this review?')) {
      await dispatch(deleteReview(id));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reviews ({total})</h1>

      <div className="mb-6 flex gap-2">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field w-auto">
          <option value="">All Reviews</option>
          <option value="true">Approved</option>
          <option value="false">Pending</option>
        </select>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="card">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => <FiStar key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />)}
                  </div>
                  {review.verified && <span className="badge badge-success">Verified Purchase</span>}
                  {review.approved && <span className="badge badge-primary">Approved</span>}
                </div>
                <p className="font-medium">{review.title || 'No Title'}</p>
                <p className="text-sm text-gray-500">by {review.userName} • {new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                {!review.approved && (
                  <button onClick={() => handleApprove(review._id)} className="p-2 hover:bg-green-100 text-green-600 rounded"><FiCheck className="w-5 h-5" /></button>
                )}
                <button onClick={() => handleDelete(review._id)} className="p-2 hover:bg-red-100 text-red-600 rounded"><FiTrash2 className="w-5 h-5" /></button>
              </div>
            </div>
            <p className="text-gray-700">{review.comment}</p>
            <div className="mt-3 text-sm text-gray-500">
              Product: <span className="font-medium">{review.product?.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;
