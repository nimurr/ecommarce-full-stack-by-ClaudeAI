import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrder, updateOrderStatus } from '../store/slices/orderSlice';
import { FiArrowLeft, FiTruck, FiCheckCircle } from 'react-icons/fi';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { order, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrder(id));
  }, [dispatch, id]);

  if (loading || !order) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div>;
  }

  const handleStatusChange = (newStatus) => {
    dispatch(updateOrderStatus({ id, data: { orderStatus: newStatus } }));
  };

  return (
    <div>
      <button onClick={() => navigate('/orders')} className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900">
        <FiArrowLeft className="w-5 h-5" />
        Back to Orders
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-xl font-bold">Order #{order.orderNumber}</h1>
                <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <select
                value={order.orderStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="input-field w-auto"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <h2 className="font-semibold mb-3">Order Items</h2>
            <div className="space-y-3">
              {order.orderItems.map((item, index) => (
                <div key={index} className="flex items-center gap-4 py-3 border-b">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">৳{item.subtotal.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {order.courierInfo?.trackingNumber && (
            <div className="card">
              <h2 className="font-semibold mb-4 flex items-center gap-2"><FiTruck className="w-5 h-5" />Courier Information</h2>
              <div className="space-y-2 text-sm">
                <p><strong>Courier:</strong> {order.courierInfo.courierName}</p>
                <p><strong>Tracking:</strong> {order.courierInfo.trackingNumber}</p>
                <p><strong>Status:</strong> {order.courierInfo.status}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="font-semibold mb-4">Shipping Address</h2>
            <div className="text-sm space-y-2">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>৳{order.itemsPrice?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>৳{order.shippingPrice?.toLocaleString() || 0}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>৳{order.taxPrice?.toLocaleString() || 0}</span></div>
              {order.discountPrice > 0 && (
                <div className="flex justify-between text-green-600"><span>Discount</span><span>-৳{order.discountPrice?.toLocaleString()}</span></div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold"><span>Total</span><span className="text-primary-600">৳{order.totalPrice?.toLocaleString()}</span></div>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold mb-4">Payment</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Method:</strong> {order.paymentMethod}</p>
              <p><strong>Status:</strong> {order.paymentStatus}</p>
              {order.paymentInfo?.transactionId && (
                <p><strong>Transaction:</strong> {order.paymentInfo.transactionId}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
