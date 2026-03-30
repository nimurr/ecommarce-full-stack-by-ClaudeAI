import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchOrders, updateOrderStatus } from '../store/slices/orderSlice';
import { FiEye } from 'react-icons/fi';

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading, total } = useSelector((state) => state.orders);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    dispatch(fetchOrders({ status: statusFilter, limit: 50 }));
  }, [dispatch, statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    await dispatch(updateOrderStatus({ id, data: { orderStatus: newStatus } }));
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Pending': 'badge-warning',
      'Confirmed': 'badge-primary',
      'Processing': 'badge-primary',
      'Shipped': 'badge-primary',
      'Out for Delivery': 'badge-primary',
      'Delivered': 'badge-success',
      'Cancelled': 'badge-danger',
    };
    return badges[status] || 'badge-primary';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders ({total})</h1>

      {/* Filter */}
      <div className="mb-6">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-auto">
          <option value="">All Orders</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Order</th>
                  <th className="text-left py-3 px-4 font-medium">Customer</th>
                  <th className="text-left py-3 px-4 font-medium">Total</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Payment</th>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{order.orderNumber}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{order.user?.name}</p>
                        <p className="text-sm text-gray-500">{order.user?.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold">৳{order.totalPrice?.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`text-sm font-medium ${getStatusBadge(order.orderStatus)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${order.paymentStatus === 'Paid' ? 'badge-success' : order.paymentStatus === 'Failed' ? 'badge-danger' : 'badge-warning'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Link to={`/admin/orders/${order._id}`} className="btn-secondary text-sm py-1 px-3">
                        <FiEye className="inline w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
