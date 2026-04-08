import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../store/slices/categorySlice';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import ImageUpload from '../components/ImageUpload';
import { getImageUrl } from '../utils/baseUrl';

const Categories = () => {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.categories);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', image: '', featured: false, active: true });

  useEffect(() => {
    dispatch(fetchCategories({}));
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create FormData for multipart/form-data upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('featured', formData.featured);
      submitData.append('active', formData.active);

      // Append image file if exists
      if (formData.imageFile) {
        submitData.append('image', formData.imageFile);
      }

      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

      if (editing) {
        const response = await fetch(`/api/categories/${editing._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: submitData,
        });
        const result = await response.json();
        if (result.success) {
          dispatch(updateCategory({ id: editing._id, data: result.data }));
        } else {
          alert(result.message || 'Failed to update category');
        }
      } else {
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: submitData,
        });
        const result = await response.json();
        if (result.success) {
          dispatch(createCategory(result.data));
        } else {
          alert(result.message || 'Failed to create category');
        }
      }

      setShowModal(false);
      setEditing(null);
      setFormData({ name: '', description: '', image: '', imageFile: null, featured: false, active: true });
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setEditing(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
      imageFile: null,
      featured: category.featured,
      active: category.active
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const category = categories.find(c => c._id === id);
    if (window.confirm(`Delete category "${category?.name}"?\n\nNote: This will also delete all products in this category.`)) {
      try {
        await dispatch(deleteCategory(id));
      } catch (error) {
        // Error will show from the backend message
      }
    }
  };

  const handleImageChange = (imagePreview) => {
    if (imagePreview && imagePreview.isNew && imagePreview.file) {
      // Store the file for upload with form submit
      setFormData(prev => ({
        ...prev,
        image: imagePreview.url, // Preview URL
        imageFile: imagePreview.file, // Actual file for upload
      }));
    } else if (imagePreview && !imagePreview.isNew) {
      setFormData(prev => ({
        ...prev,
        image: imagePreview.url,
        imageFile: null,
      }));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category._id} className="card">
            <div className="flex justify-between items-start mb-3">
              {category.image ? (
                <img src={getImageUrl(category.image)} alt={category.name} className="w-20 h-20 object-cover rounded-lg mb-3" />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-400">{category.name.charAt(0)}</span>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => handleEdit(category)} className="p-2 hover:bg-gray-100 rounded"><FiEdit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(category._id)} className="p-2 hover:bg-red-100 text-red-600 rounded"><FiTrash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
            <p className="text-gray-600 text-sm mb-3">{category.description || 'No description'}</p>
            <div className="flex gap-2">
              {category.featured && <span className="badge badge-primary">Featured</span>}
              {category.active ? <span className="badge badge-success">Active</span> : <span className="badge badge-danger">Inactive</span>}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 py-20 pt-40 flex items-center justify-center z-50 overflow-y-auto">
          <div className="card w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit' : 'Add'} Category</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="input-field" />
              </div>
              <div>
                <ImageUpload
                  images={formData.image ? [{ url: formData.image }] : []}
                  onChange={handleImageChange}
                  multiple={false}
                  label="Category Image (uploaded with category)"
                />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="w-4 h-4" /><span className="text-sm">Featured</span></label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="w-4 h-4" /><span className="text-sm">Active</span></label>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn-primary flex-1">{editing ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
