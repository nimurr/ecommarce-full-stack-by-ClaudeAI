import { useEffect, useState } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiStar } from 'react-icons/fi';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    country: '',
    isActive: true,
    isFeatured: false,
    displayOrder: 0,
  });

  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await axios.get(`${API_URL}/brands?limit=100`);
      setBrands(response.data.data);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`${API_URL}/brands/${editing._id}`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } else {
        await axios.post(`${API_URL}/brands`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
      fetchBrands();
      setShowModal(false);
      setEditing(null);
      resetForm();
    } catch (error) {
      console.error('Failed to save brand:', error);
      alert(error.response?.data?.message || 'Failed to save brand');
    }
  };

  const handleEdit = (brand) => {
    setEditing(brand);
    setFormData({
      name: brand.name,
      description: brand.description || '',
      website: brand.website || '',
      country: brand.country || '',
      isActive: brand.isActive,
      isFeatured: brand.isFeatured,
      displayOrder: brand.displayOrder || 0,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this brand?')) {
      try {
        await axios.delete(`${API_URL}/brands/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        fetchBrands();
      } catch (error) {
        console.error('Failed to delete brand:', error);
        alert(error.response?.data?.message || 'Failed to delete brand');
      }
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await axios.put(`${API_URL}/brands/${id}/featured`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      fetchBrands();
    } catch (error) {
      console.error('Failed to toggle featured:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      website: '',
      country: '',
      isActive: true,
      isFeatured: false,
      displayOrder: 0,
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Brands Management</h1>
        <button onClick={() => { resetForm(); setEditing(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-5 h-5" />
          Add Brand
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium">Brand</th>
                <th className="text-left py-3 px-4 font-medium">Country</th>
                <th className="text-left py-3 px-4 font-medium">Featured</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Order</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => (
                <tr key={brand._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{brand.name}</p>
                      {brand.website && (
                        <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline">
                          {brand.website}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{brand.country || '-'}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleFeatured(brand._id)}
                      className={`p-2 rounded ${brand.isFeatured ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-300 hover:text-gray-400'}`}
                      title={brand.isFeatured ? 'Remove from featured' : 'Add to featured'}
                    >
                      <FiStar className={`w-5 h-5 ${brand.isFeatured ? 'fill-current' : ''}`} />
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${brand.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {brand.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{brand.displayOrder}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(brand)} className="p-2 hover:bg-gray-200 rounded" title="Edit">
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(brand._id)} className="p-2 hover:bg-red-100 text-red-600 rounded" title="Delete">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit' : 'Add'} Brand</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                  placeholder="e.g., Apple, Samsung, Sony"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="input-field"
                  placeholder="Brief description about the brand"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="input-field"
                    placeholder="https://www.apple.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="input-field"
                    placeholder="e.g., USA, Japan, South Korea"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                    className="input-field"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Active</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Featured (Show on Homepage)</span>
                </label>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button type="submit" className="btn-primary flex-1">
                  {editing ? 'Update' : 'Create'} Brand
                </button>
                <button type="button" onClick={() => { setShowModal(false); setEditing(null); resetForm(); }} className="btn-secondary flex-1">
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

export default Brands;
