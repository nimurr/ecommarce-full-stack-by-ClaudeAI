import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../store/slices/orderSlice';
import { FiPackage, FiChevronRight, FiClock } from 'react-icons/fi';

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading, total } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders({}));
  }, [dispatch]);

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

  if (loading) {
    return (
      <div className="container-custom py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="section-title mb-8">My Orders ({total})</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <FiPackage className="w-24 h-24 mx-auto text-gray-300 mb-6" />
          <h2 className="text-xl font-semibold mb-4">No orders yet</h2>
          <p className="text-gray-600 mb-8">Start shopping to see your orders here</p>
          <Link to="/products" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="font-semibold">{order.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Placed on</p>
                  <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-wrap gap-4 mb-4">
                  {order.orderItems.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      <div>
                        <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {order.orderItems.length > 3 && (
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-gray-500 text-sm">+{order.orderItems.length - 3}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className={`badge ${getStatusBadge(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <FiClock className="w-4 h-4" />
                      {order.paymentMethod}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg">৳{order.totalPrice.toLocaleString()}</span>
                    <Link
                      to={`/orders/${order._id}`}
                      className="btn-primary text-sm py-2 px-4"
                    >
                      View Details <FiChevronRight className="inline ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
