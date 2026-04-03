import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCoupons, createCoupon, updateCoupon, deleteCoupon } from '../store/slices/couponSlice';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

const Coupons = () => {
  const dispatch = useDispatch();
  const { coupons, loading, total } = useSelector((state) => state.coupons);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    code: '', description: '', discountType: 'percentage', discountValue: '',
    minPurchase: '0', maxDiscount: '', startDate: '', endDate: '', active: true,
  });

  useEffect(() => {
    dispatch(fetchCoupons({}));
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      discountValue: Number(formData.discountValue),
      minPurchase: Number(formData.minPurchase),
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
    };
    if (editing) {
      await dispatch(updateCoupon({ id: editing._id, data }));
    } else {
      await dispatch(createCoupon(data));
    }
    setShowModal(false);
    setEditing(null);
    setFormData({ code: '', description: '', discountType: 'percentage', discountValue: '', minPurchase: '0', maxDiscount: '', startDate: '', endDate: '', active: true });
  };

  const handleEdit = (coupon) => {
    setEditing(coupon);
    setFormData({
      code: coupon.code, description: coupon.description || '', discountType: coupon.discountType,
      discountValue: coupon.discountValue, minPurchase: coupon.minPurchase,
      maxDiscount: coupon.maxDiscount || '',
      startDate: new Date(coupon.startDate).toISOString().split('T')[0],
      endDate: new Date(coupon.endDate).toISOString().split('T')[0],
      active: coupon.active,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this coupon?')) {
      await dispatch(deleteCoupon(id));
    }
  };

  const isValid = (coupon) => {
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(coupon.endDate);
    endDate.setHours(23, 59, 59, 999);
    return coupon.active && startDate <= now && endDate >= now;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Coupons ({total})</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-5 h-5" />
          Add Coupon
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium">Code</th>
                <th className="text-left py-3 px-4 font-medium">Discount</th>
                <th className="text-left py-3 px-4 font-medium">Min Purchase</th>
                <th className="text-left py-3 px-4 font-medium">Validity</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{coupon.code}</td>
                  <td className="py-3 px-4">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `৳${coupon.discountValue}`}
                  </td>
                  <td className="py-3 px-4">৳{coupon.minPurchase}</td>
                  <td className="py-3 px-4 text-sm">
                    {new Date(coupon.startDate).toLocaleDateString()} - {new Date(coupon.endDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    {isValid(coupon) ? <span className="badge badge-success">Active</span> : <span className="badge badge-danger">Expired</span>}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(coupon)} className="p-2 hover:bg-gray-200 rounded"><FiEdit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(coupon._id)} className="p-2 hover:bg-red-100 text-red-600 rounded"><FiTrash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="card w-full max-w-lg my-8">
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit' : 'Add'} Coupon</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code *</label>
                <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required className="input-field" placeholder="WELCOME20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type *</label>
                  <select value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value })} className="input-field">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Value *</label>
                  <input type="number" value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })} required className="input-field" />
                </div>
              </div>
              {formData.discountType === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Discount (optional)</label>
                  <input type="number" value={formData.maxDiscount} onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })} placeholder="Maximum discount amount" className="input-field" />
                  <p className="text-xs text-gray-500 mt-1">Cap for percentage discounts</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Purchase</label>
                <input type="number" value={formData.minPurchase} onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                  <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                  <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required className="input-field" />
                </div>
              </div>
              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="w-4 h-4" /><span className="text-sm">Active</span></label>
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

export default Coupons;
