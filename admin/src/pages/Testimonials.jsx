import { useEffect, useState } from 'react';
import { adminAPI } from '../utils/api';
import { uploadImage } from '../utils/upload';
import { FiEdit2, FiTrash2, FiPlus, FiStar, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getImageUrl } from '../utils/baseUrl';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerTitle: '',
    rating: '5',
    comment: '',
    image: '',
    active: true,
    featured: false,
    order: '0',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getTestimonials({ limit: 100 });
      setTestimonials(data.data || []);
    } catch (error) {
      toast.error('Failed to fetch testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image must be less than 2MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerName || !formData.comment || !formData.rating) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let imagePath = formData.image;

      // Upload new image if file selected
      if (imageFile) {
        const uploadResult = await uploadImage(imageFile);
        imagePath = uploadResult.data.url;
      }

      const data = {
        customerName: formData.customerName,
        customerTitle: formData.customerTitle,
        rating: Number(formData.rating),
        comment: formData.comment,
        image: imagePath,
        active: formData.active,
        featured: formData.featured,
        order: Number(formData.order),
      };

      if (editing) {
        await adminAPI.updateTestimonial(editing._id, data);
        toast.success('Testimonial updated successfully');
      } else {
        await adminAPI.createTestimonial(data);
        toast.success('Testimonial created successfully');
      }

      setShowModal(false);
      setEditing(null);
      resetForm();
      fetchTestimonials();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save testimonial');
    }
  };

  const handleEdit = (testimonial) => {
    setEditing(testimonial);
    setFormData({
      customerName: testimonial.customerName || '',
      customerTitle: testimonial.customerTitle || '',
      rating: String(testimonial.rating),
      comment: testimonial.comment || '',
      image: testimonial.image || '',
      active: testimonial.active,
      featured: testimonial.featured,
      order: String(testimonial.order || 0),
    });
    setImagePreview(testimonial.image ? getImageUrl(testimonial.image) : '');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await adminAPI.deleteTestimonial(id);
      toast.success('Testimonial deleted');
      fetchTestimonials();
    } catch (error) {
      toast.error('Failed to delete testimonial');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await adminAPI.toggleTestimonialActive(id);
      fetchTestimonials();
    } catch (error) {
      toast.error('Failed to toggle status');
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerTitle: '',
      rating: '5',
      comment: '',
      image: '',
      active: true,
      featured: false,
      order: '0',
    });
    setImageFile(null);
    setImagePreview('');
  };

  const openModal = () => {
    resetForm();
    setEditing(null);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Testimonials</h1>
        <button onClick={openModal} className="btn-primary flex items-center gap-2">
          <FiPlus /> Add Testimonial
        </button>
      </div>

      {testimonials.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">No testimonials yet. Add your first one!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t._id} className={`card p-4 border-2 ${t.active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {t.image ? (
                    <img
                      src={getImageUrl(t.image)}
                      alt={t.customerName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                      {t.customerName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{t.customerName}</p>
                    {t.customerTitle && <p className="text-xs text-gray-500">{t.customerTitle}</p>}
                  </div>
                </div>
                <button onClick={() => handleToggleActive(t._id)} className="text-gray-400 hover:text-primary-600">
                  {t.active ? <FiToggleRight className="w-6 h-6 text-green-500" /> : <FiToggleLeft className="w-6 h-6" />}
                </button>
              </div>

              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className={`w-4 h-4 ${i < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-3">{t.comment}</p>

              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {t.featured && <span className="badge badge-primary text-xs">Featured</span>}
                  {!t.active && <span className="badge bg-gray-200 text-gray-600 text-xs">Inactive</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(t)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                    <FiEdit2 />
                  </button>
                  <button onClick={() => handleDelete(t._id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Title/Designation</label>
                <input type="text" name="customerTitle" value={formData.customerTitle} onChange={handleChange} placeholder="e.g. CEO, Company" className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating *</label>
                <select name="rating" value={formData.rating} onChange={handleChange} required className="input-field">
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment *</label>
                <textarea name="comment" value={formData.comment} onChange={handleChange} required rows="4" maxLength="500" className="input-field" placeholder="Customer review text..." />
                <p className="text-xs text-gray-500 mt-1">{formData.comment.length}/500</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="input-field" />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-full object-cover mt-2" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input type="number" name="order" value={formData.order} onChange={handleChange} min="0" className="input-field" />
                </div>
                <div className="flex items-center gap-4 pt-6">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} className="w-4 h-4" />
                    <span className="text-sm">Active</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="w-4 h-4" />
                    <span className="text-sm">Featured</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editing ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Testimonials;
