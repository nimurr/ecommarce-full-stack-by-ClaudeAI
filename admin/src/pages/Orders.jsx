import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, updateOrderStatus, updatePaymentStatus } from '../store/slices/orderSlice';
import { FiEye, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/baseUrl';

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading, total, page, pages } = useSelector((state) => state.orders);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const params = { page: currentPage, limit };
    if (statusFilter) params.status = statusFilter;
    if (paymentFilter) params.paymentStatus = paymentFilter;
    if (search) params.search = search;
    dispatch(fetchOrders(params));
  }, [dispatch, currentPage, limit, statusFilter, paymentFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    const params = { page: 1, limit };
    if (statusFilter) params.status = statusFilter;
    if (paymentFilter) params.paymentStatus = paymentFilter;
    if (search) params.search = search;
    dispatch(fetchOrders(params));
  };

  const handleStatusChange = async (id, newStatus) => {
    await dispatch(updateOrderStatus({ id, data: { orderStatus: newStatus } }));
  };

  const handlePaymentStatusChange = async (id, newStatus) => {
    await dispatch(updatePaymentStatus({ id, data: { paymentStatus: newStatus } }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pages) {
      setCurrentPage(newPage);
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    setLimit(newLimit);
    setCurrentPage(1);
    const params = { page: 1, limit: newLimit };
    if (statusFilter) params.status = statusFilter;
    if (paymentFilter) params.paymentStatus = paymentFilter;
    if (search) params.search = search;
    dispatch(fetchOrders(params));
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

  const getPaymentBadge = (status) => {
    const badges = {
      'Pending': 'badge-warning',
      'Paid': 'badge-success',
      'Failed': 'badge-danger',
      'Refunded': 'badge-danger',
    };
    return badges[status] || 'badge-primary';
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisible = 5;
    
    if (pages <= maxVisible) {
      for (let i = 1; i <= pages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(pages);
      } else if (page >= pages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = pages - 3; i <= pages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = page - 1; i <= page + 1; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(pages);
      }
    }
    return pageNumbers;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders ({total})</h1>
      </div>

      {/* Search by Order ID */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Search by Order ID or Order Number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field flex-1"
        />
        <button type="submit" className="btn-primary">
          <FiSearch className="w-5 h-5" />
        </button>
      </form>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Payment</label>
            <select
              value={paymentFilter}
              onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }}
              className="input-field"
            >
              <option value="">All Payment</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      ) : orders.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">
          <p className="text-lg">No orders found</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium">Order</th>
                <th className="text-left py-3 px-4 font-medium">Customer</th>
                <th className="text-left py-3 px-4 font-medium">Items</th>
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
                      <p className="font-medium">{order.user?.name || order.shippingAddress?.fullName || 'Guest'}</p>
                      <p className="text-sm text-gray-500">{order.user?.email || order.shippingAddress?.phone || ''}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      {order.orderItems.slice(0, 2).map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <img src={getImageUrl(item.image)} alt={item.name} className="w-8 h-8 object-cover rounded" />
                          <div>
                            <p className="font-medium truncate max-w-xs">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity}
                              {item.selectedColor && <span className="ml-1">• Color: {item.selectedColor}</span>}
                              {item.selectedSize && <span className="ml-1">• Size: {item.selectedSize}</span>}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.orderItems.length > 2 && (
                        <p className="text-xs text-gray-500">+{order.orderItems.length - 2} more items</p>
                      )}
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
                    <select
                      value={order.paymentStatus}
                      onChange={(e) => handlePaymentStatusChange(order._id, e.target.value)}
                      className={`text-sm font-medium ${getPaymentBadge(order.paymentStatus)}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Failed">Failed</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <Link to={`/orders/${order._id}`} className="btn-secondary text-sm py-1 px-3">
                      <FiEye className="inline w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t bg-gray-50">
            {/* Per-page selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={limit}
                onChange={handleLimitChange}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {[5, 10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>

            {/* Page info */}
            <div className="text-sm text-gray-600">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} results
            </div>

            {/* Page navigation */}
            {pages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>

                {getPageNumbers().map((num, idx) => (
                  num === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 py-1 text-gray-400">…</span>
                  ) : (
                    <button
                      key={num}
                      onClick={() => handlePageChange(num)}
                      className={`px-3 py-1 rounded border text-sm ${
                        page === num
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {num}
                    </button>
                  )
                ))}

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pages}
                  className="px-3 py-1 rounded border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
