import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Sliders = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    buttonText: 'Shop Now',
    buttonLink: '/products',
    linkType: 'route',
    isActive: true,
    order: 0,
  });

  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      const response = await axios.get(`${API_URL}/sliders`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setSliders(response.data.data);
    } catch (error) {
      console.error('Failed to fetch sliders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`${API_URL}/sliders/${editing._id}`, formData, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        toast.success('Slider updated successfully');
      } else {
        await axios.post(`${API_URL}/sliders`, formData, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        toast.success('Slider created successfully');
      }
      fetchSliders();
      setShowModal(false);
      setEditing(null);
      resetForm();
    } catch (error) {
      console.error('Failed to save slider:', error);
      toast.error(error.response?.data?.message || 'Failed to save slider');
    }
  };

  const handleEdit = (slider) => {
    setEditing(slider);
    setFormData({
      title: slider.title,
      subtitle: slider.subtitle || '',
      description: slider.description || '',
      image: slider.image,
      buttonText: slider.buttonText || 'Shop Now',
      buttonLink: slider.buttonLink || '/products',
      linkType: slider.linkType || 'route',
      isActive: slider.isActive,
      order: slider.order || 0,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this slider?')) {
      try {
        await axios.delete(`${API_URL}/sliders/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        toast.success('Slider deleted successfully');
        fetchSliders();
      } catch (error) {
        console.error('Failed to delete slider:', error);
        toast.error('Failed to delete slider');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await axios.put(`${API_URL}/sliders/${id}/toggle`, {}, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchSliders();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleMoveUp = async (id, currentOrder) => {
    if (currentOrder <= 0) return;
    try {
      await axios.put(`${API_URL}/sliders/${id}/order`, 
        { order: currentOrder - 1 },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      fetchSliders();
    } catch (error) {
      console.error('Failed to move slider:', error);
    }
  };

  const handleMoveDown = async (id, currentOrder) => {
    try {
      await axios.put(`${API_URL}/sliders/${id}/order`, 
        { order: currentOrder + 1 },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      fetchSliders();
    } catch (error) {
      console.error('Failed to move slider:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      image: '',
      buttonText: 'Shop Now',
      buttonLink: '/products',
      linkType: 'route',
      isActive: true,
      order: sliders.length,
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hero Slider Management</h1>
        <button 
          onClick={() => { resetForm(); setEditing(null); setShowModal(true); }} 
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-5 h-5" />
          Add Slider
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      ) : sliders.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No sliders created yet. Click "Add Slider" to create one.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sliders.map((slider, index) => (
            <div key={slider._id} className={`card p-4 ${!slider.isActive ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-4">
                {/* Order Controls */}
                <div className="flex flex-col gap-1">
                  <button 
                    onClick={() => handleMoveUp(slider._id, slider.order)}
                    disabled={slider.order === 0}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                  >
                    <FiArrowUp className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-center font-medium">{slider.order}</span>
                  <button 
                    onClick={() => handleMoveDown(slider._id, slider.order)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <FiArrowDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Image Preview */}
                <img 
                  src={slider.image} 
                  alt={slider.title}
                  className="w-32 h-20 object-cover rounded"
                />

                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-semibold">{slider.title}</h3>
                  {slider.subtitle && <p className="text-sm text-gray-600">{slider.subtitle}</p>}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Button: {slider.buttonText}</span>
                    <span>Link: {slider.buttonLink}</span>
                  </div>
                </div>

                {/* Status Toggle */}
                <button
                  onClick={() => handleToggleStatus(slider._id)}
                  className={`flex items-center gap-2 px-3 py-1 rounded ${
                    slider.isActive ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-50'
                  }`}
                >
                  {slider.isActive ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                  <span className="text-sm">{slider.isActive ? 'Active' : 'Inactive'}</span>
                </button>

                {/* Actions */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(slider)} 
                    className="p-2 hover:bg-gray-200 rounded"
                    title="Edit"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(slider._id)} 
                    className="p-2 hover:bg-red-100 text-red-600 rounded"
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="card w-full max-w-2xl my-8">
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit' : 'Add'} Slider</h2>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  required
                  placeholder="Discover the Latest in Electronics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="input-field"
                  placeholder="Shop premium gadgets at unbeatable prices"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="input-field"
                  placeholder="Additional description text..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL *</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="input-field"
                  required
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">Enter the full URL of the image</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    className="input-field"
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Button Link</label>
                  <input
                    type="text"
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    className="input-field"
                    placeholder="/products or https://example.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Link Type</label>
                  <select
                    value={formData.linkType}
                    onChange={(e) => setFormData({ ...formData, linkType: e.target.value })}
                    className="input-field"
                  >
                    <option value="route">Internal Route</option>
                    <option value="url">External URL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="input-field"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Active</span>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button type="submit" className="btn-primary flex-1">
                  {editing ? 'Update' : 'Create'} Slider
                </button>
                <button 
                  type="button" 
                  onClick={() => { setShowModal(false); setEditing(null); resetForm(); }} 
                  className="btn-secondary flex-1"
                >
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

export default Sliders;
