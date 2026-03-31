import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiEdit2, FiTrash2, FiPlus, FiEye } from 'react-icons/fi';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Pages = () => {
  const dispatch = useDispatch();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    type: 'custom',
    metaTitle: '',
    metaDescription: '',
    isActive: true,
    displayOrder: 0,
    contactInfo: {
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Bangladesh',
      },
    },
    faqs: [],
  });

  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await axios.get(`${API_URL}/pages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setPages(response.data.data);
    } catch (error) {
      console.error('Failed to fetch pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`${API_URL}/pages/${editing._id}`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } else {
        await axios.post(`${API_URL}/pages`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
      fetchPages();
      setShowModal(false);
      setEditing(null);
      resetForm();
    } catch (error) {
      console.error('Failed to save page:', error);
      alert(error.response?.data?.message || 'Failed to save page');
    }
  };

  const handleEdit = (page) => {
    setEditing(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      excerpt: page.excerpt || '',
      type: page.type,
      metaTitle: page.metaTitle || '',
      metaDescription: page.metaDescription || '',
      isActive: page.isActive,
      displayOrder: page.displayOrder || 0,
      contactInfo: page.contactInfo || {
        email: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'Bangladesh',
        },
      },
      faqs: page.faqs || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this page?')) {
      try {
        await axios.delete(`${API_URL}/pages/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        fetchPages();
      } catch (error) {
        console.error('Failed to delete page:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      type: 'custom',
      metaTitle: '',
      metaDescription: '',
      isActive: true,
      displayOrder: 0,
      contactInfo: {
        email: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'Bangladesh',
        },
      },
      faqs: [],
    });
  };

  const handleAddFAQ = () => {
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '', order: prev.faqs.length }],
    }));
  };

  const handleUpdateFAQ = (index, field, value) => {
    const updatedFAQs = [...formData.faqs];
    updatedFAQs[index] = { ...updatedFAQs[index], [field]: value };
    setFormData(prev => ({ ...prev, faqs: updatedFAQs }));
  };

  const handleRemoveFAQ = (index) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  const pageTypes = [
    { value: 'about', label: 'About Us' },
    { value: 'contact', label: 'Contact Us' },
    { value: 'faq', label: 'FAQ' },
    { value: 'shipping', label: 'Shipping Info' },
    { value: 'returns', label: 'Returns & Refunds' },
    { value: 'warranty', label: 'Warranty' },
    { value: 'privacy', label: 'Privacy Policy' },
    { value: 'terms', label: 'Terms of Service' },
    { value: 'custom', label: 'Custom Page' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pages Management</h1>
        <button onClick={() => { resetForm(); setEditing(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-5 h-5" />
          Add Page
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
                <th className="text-left py-3 px-4 font-medium">Title</th>
                <th className="text-left py-3 px-4 font-medium">Type</th>
                <th className="text-left py-3 px-4 font-medium">Slug</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{page.title}</td>
                  <td className="py-3 px-4">
                    <span className="badge badge-primary capitalize">{page.type}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{page.slug}</td>
                  <td className="py-3 px-4">
                    <span className={`badge ${page.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {page.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      {/* <a href={`/page/${page.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-gray-200 rounded" title="View">
                        <FiEye className="w-4 h-4" />
                      </a> */}
                      <button onClick={() => handleEdit(page)} className="p-2 hover:bg-gray-200 rounded" title="Edit">
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(page._id)} className="p-2 hover:bg-red-100 text-red-600 rounded" title="Delete">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="card w-full max-w-4xl my-8">
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit' : 'Add'} Page</h2>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Page Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="input-field"
                    placeholder="auto-generated-from-title"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Page Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-field"
                >
                  {pageTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                  className="input-field"
                  placeholder="Short description (optional)"
                />
              </div>

              {(formData.type === 'contact' || formData.type === 'about') && (
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold">Contact Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.contactInfo?.email || ''}
                        onChange={(e) => setFormData({ ...formData, contactInfo: { ...formData.contactInfo, email: e.target.value } })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.contactInfo?.phone || ''}
                        onChange={(e) => setFormData({ ...formData, contactInfo: { ...formData.contactInfo, phone: e.target.value } })}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.type === 'faq' && (
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">FAQs</h3>
                    <button type="button" onClick={handleAddFAQ} className="btn-secondary text-sm">
                      Add FAQ
                    </button>
                  </div>
                  {formData.faqs.map((faq, index) => (
                    <div key={index} className="border rounded p-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">FAQ #{index + 1}</span>
                        <button type="button" onClick={() => handleRemoveFAQ(index)} className="text-red-600 hover:text-red-800">
                          Remove
                        </button>
                      </div>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => handleUpdateFAQ(index, 'question', e.target.value)}
                        placeholder="Question"
                        className="input-field"
                      />
                      <textarea
                        value={faq.answer}
                        onChange={(e) => handleUpdateFAQ(index, 'answer', e.target.value)}
                        placeholder="Answer"
                        rows={3}
                        className="input-field"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    className="input-field"
                    placeholder="SEO meta title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  rows={3}
                  className="input-field"
                  placeholder="SEO meta description"
                />
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
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button type="submit" className="btn-primary flex-1">
                  {editing ? 'Update' : 'Create'} Page
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

export default Pages;
