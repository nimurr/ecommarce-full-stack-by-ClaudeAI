import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../store/slices/categorySlice';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

const Categories = () => {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.categories);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', featured: false, active: true });

  useEffect(() => {
    dispatch(fetchCategories({}));
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await dispatch(updateCategory({ id: editing._id, data: formData }));
    } else {
      await dispatch(createCategory(formData));
    }
    setShowModal(false);
    setEditing(null);
    setFormData({ name: '', description: '', featured: false, active: true });
  };

  const handleEdit = (category) => {
    setEditing(category);
    setFormData({ name: category.name, description: category.description || '', featured: category.featured, active: category.active });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this category?')) {
      await dispatch(deleteCategory(id));
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
              <h3 className="font-semibold text-lg">{category.name}</h3>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(category)} className="p-2 hover:bg-gray-100 rounded"><FiEdit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(category._id)} className="p-2 hover:bg-red-100 text-red-600 rounded"><FiTrash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-3">{category.description || 'No description'}</p>
            <div className="flex gap-2">
              {category.featured && <span className="badge badge-primary">Featured</span>}
              {category.active ? <span className="badge badge-success">Active</span> : <span className="badge badge-danger">Inactive</span>}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card w-full max-w-md">
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
