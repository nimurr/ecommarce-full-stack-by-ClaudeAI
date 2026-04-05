import { useState } from 'react';
import { FiStar, FiUpload, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

const StarRating = ({ rating, onRatingChange, size = 'md' }) => {
  const [hover, setHover] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-colors"
        >
          <FiStar
            className={`${sizeClasses[size]} ${
              star <= (hover || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const ReviewForm = ({ productId, productName, onSuccess, existingReview }) => {
  const [formData, setFormData] = useState({
    rating: existingReview?.rating || 0,
    title: existingReview?.title || '',
    comment: existingReview?.comment || '',
    images: existingReview?.images || [],
  });
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState(existingReview?.images || []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a review title');
      return;
    }

    if (!formData.comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    setLoading(true);

    try {
      const reviewAPI = (await import('../../utils/api')).reviewAPI;
      
      let reviewData = {
        product: productId,
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment,
      };

      if (existingReview) {
        await reviewAPI.updateReview(existingReview._id, reviewData);
        toast.success('Review updated successfully!');
      } else {
        await reviewAPI.createReview(reviewData);
        toast.success('Review submitted successfully! Thank you for your feedback.');
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imagePreviews.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setImageFiles([...imageFiles, ...files]);
    
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating *
        </label>
        <StarRating
          rating={formData.rating}
          onRatingChange={(rating) => setFormData({ ...formData, rating })}
          size="lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Review Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="input-field"
          placeholder="Summarize your experience"
          maxLength={100}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Review Comment *
        </label>
        <textarea
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          className="input-field"
          rows={5}
          placeholder="Share your experience with this product..."
          maxLength={1000}
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.comment.length}/1000 characters
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Images (Optional, max 5)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mb-3">
              {imagePreviews.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-20 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="text-center">
            <FiUpload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <label className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg cursor-pointer hover:bg-primary-700">
              Upload Images
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
      </button>
    </form>
  );
};

export { StarRating, ReviewForm };
