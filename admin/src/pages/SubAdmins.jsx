import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiEye, FiEyeOff } from 'react-icons/fi';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SubAdmins = () => {
  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    permissions: {
      products: { view: false, create: false, edit: false, delete: false },
      orders: { view: false, updateStatus: false },
      categories: { view: false, create: false, edit: false, delete: false },
      users: { view: false },
      reviews: { view: false, approve: false, delete: false },
      coupons: { view: false, create: false, edit: false, delete: false },
      pages: { view: false, edit: false },
    },
  });

  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

  useEffect(() => {
    fetchSubAdmins();
  }, []);

  const fetchSubAdmins = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/sub-admins`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setSubAdmins(response.data.data);
    } catch (error) {
      console.error('Failed to fetch sub-admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`${API_URL}/admin/sub-admins/${editing._id}`, formData, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/admin/sub-admins`, formData, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
      }
      fetchSubAdmins();
      setShowModal(false);
      setEditing(null);
      resetForm();
    } catch (error) {
      console.error('Failed to save sub-admin:', error);
      alert(error.response?.data?.message || 'Failed to save sub-admin');
    }
  };

  const handleEdit = (subAdmin) => {
    setEditing(subAdmin);
    setFormData({
      name: subAdmin.name,
      email: subAdmin.email,
      phone: subAdmin.phone,
      password: '',
      permissions: subAdmin.permissions || {
        products: { view: false, create: false, edit: false, delete: false },
        orders: { view: false, updateStatus: false },
        categories: { view: false, create: false, edit: false, delete: false },
        users: { view: false },
        reviews: { view: false, approve: false, delete: false },
        coupons: { view: false, create: false, edit: false, delete: false },
        pages: { view: false, edit: false },
      },
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this sub-admin?')) {
      try {
        await axios.delete(`${API_URL}/admin/sub-admins/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        fetchSubAdmins();
      } catch (error) {
        console.error('Failed to delete sub-admin:', error);
      }
    }
  };

  const handleTogglePermission = (resource, action) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [resource]: {
          ...prev.permissions[resource],
          [action]: !prev.permissions[resource][action],
        },
      },
    }));
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await axios.put(`${API_URL}/admin/sub-admins/${id}/status`,
        { isActive: !currentStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      fetchSubAdmins();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      permissions: {
        products: { view: false, create: false, edit: false, delete: false },
        orders: { view: false, updateStatus: false },
        categories: { view: false, create: false, edit: false, delete: false },
        users: { view: false },
        reviews: { view: false, approve: false, delete: false },
        coupons: { view: false, create: false, edit: false, delete: false },
        pages: { view: false, edit: false },
      },
    });
  };

  const PermissionToggle = ({ resource, action, label }) => (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={formData.permissions[resource][action]}
        onChange={() => handleTogglePermission(resource, action)}
        className="w-4 h-4"
      />
      <span>{label}</span>
    </label>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sub-Admin Management</h1>
        <button
          onClick={() => { resetForm(); setEditing(null); setShowModal(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-5 h-5" />
          Add Sub-Admin
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium">Name</th>
                <th className="text-left py-3 px-4 font-medium">Email</th>
                <th className="text-left py-3 px-4 font-medium">Phone</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Created</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subAdmins.map((admin) => (
                <tr key={admin._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{admin.name}</td>
                  <td className="py-3 px-4">{admin.email}</td>
                  <td className="py-3 px-4">{admin.phone}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleStatus(admin._id, admin.isActive)}
                      className={`flex items-center gap-2 ${admin.isActive ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      {admin.isActive ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                      <span>{admin.isActive ? 'Active' : 'Inactive'}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(admin)}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="Edit"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(admin._id)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded"
                        title="Delete"
                      >
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
          <div className="card w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit' : 'Add'} Sub-Admin</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password {!editing && '*'}</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input-field pr-10"
                      required={!editing}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <h3 className="font-semibold mb-4">Permissions</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Products */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Products</h4>
                    <div className="space-y-2">
                      <PermissionToggle resource="products" action="view" label="View" />
                      <PermissionToggle resource="products" action="create" label="Create" />
                      <PermissionToggle resource="products" action="edit" label="Edit" />
                      <PermissionToggle resource="products" action="delete" label="Delete" />
                    </div>
                  </div>

                  {/* Orders */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Orders</h4>
                    <div className="space-y-2">
                      <PermissionToggle resource="orders" action="view" label="View" />
                      <PermissionToggle resource="orders" action="updateStatus" label="Update Status" />
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Categories</h4>
                    <div className="space-y-2">
                      <PermissionToggle resource="categories" action="view" label="View" />
                      <PermissionToggle resource="categories" action="create" label="Create" />
                      <PermissionToggle resource="categories" action="edit" label="Edit" />
                      <PermissionToggle resource="categories" action="delete" label="Delete" />
                    </div>
                  </div>

                  {/* Users */}
                  {/* <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Users</h4>
                    <div className="space-y-2">
                      <PermissionToggle resource="users" action="view" label="View" />
                    </div>
                  </div> */}

                  {/* Reviews
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Reviews</h4>
                    <div className="space-y-2">
                      <PermissionToggle resource="reviews" action="view" label="View" />
                      <PermissionToggle resource="reviews" action="approve" label="Approve" />
                      <PermissionToggle resource="reviews" action="delete" label="Delete" />
                    </div>
                  </div> */}

                  {/* Coupons */}
                  {/* <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Coupons</h4>
                    <div className="space-y-2">
                      <PermissionToggle resource="coupons" action="view" label="View" />
                      <PermissionToggle resource="coupons" action="create" label="Create" />
                      <PermissionToggle resource="coupons" action="edit" label="Edit" />
                      <PermissionToggle resource="coupons" action="delete" label="Delete" />
                    </div>
                  </div> */}

                  {/* Pages */}
                  {/* <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Pages</h4>
                    <div className="space-y-2">
                      <PermissionToggle resource="pages" action="view" label="View" />
                      <PermissionToggle resource="pages" action="edit" label="Edit" />
                    </div>
                  </div> */}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button type="submit" className="btn-primary flex-1">
                  {editing ? 'Update' : 'Create'} Sub-Admin
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

export default SubAdmins;
