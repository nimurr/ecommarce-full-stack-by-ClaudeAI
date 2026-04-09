import { useState } from 'react';
import { FiSearch, FiPackage, FiCheckCircle, FiClock, FiTruck, FiXCircle, FiMail, FiPhone } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderByNumber } from '../store/slices/orderSlice';
import { getImageUrl } from '../utils/baseUrl';

const OrderTrackingPage = () => {
  const dispatch = useDispatch();
  const { order, loading } = useSelector((state) => state.orders);
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      setError('Please enter your order number');
      return;
    }

    setError('');
    setSearched(true);
    
    try {
      await dispatch(fetchOrderByNumber(orderNumber.trim()));
    } catch (err) {
      setError('Order not found. Please check your order number.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'Confirmed':
        return 'text-blue-600 bg-blue-100';
      case 'Processing':
        return 'text-purple-600 bg-purple-100';
      case 'Shipped':
        return 'text-indigo-600 bg-indigo-100';
      case 'Out for Delivery':
        return 'text-blue-600 bg-blue-100';
      case 'Delivered':
        return 'text-green-600 bg-green-100';
      case 'Cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTimelineSteps = () => {
    const steps = [
      { status: 'Pending', label: 'Order Placed', icon: FiClock },
      { status: 'Confirmed', label: 'Confirmed', icon: FiCheckCircle },
      { status: 'Processing', label: 'Processing', icon: FiPackage },
      { status: 'Shipped', label: 'Shipped', icon: FiTruck },
      { status: 'Delivered', label: 'Delivered', icon: FiCheckCircle },
    ];

    const currentStatus = order?.orderStatus || 'Pending';
    const statusOrder = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    return steps.map((step, index) => ({
      ...step,
      isCompleted: index <= currentIndex,
      isCurrent: index === currentIndex,
    }));
  };

  const timelineSteps = getTimelineSteps();

  if (loading) {
    return (
      <div className="container-custom py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
        <p className="text-gray-600 mt-4">Tracking your order...</p>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
        <p className="text-gray-600">Enter your order number to track your order status</p>
      </div>

      {/* Search Form */}
      <div className="max-w-2xl mx-auto mb-8">
        <form onSubmit={handleTrack} className="card p-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              placeholder="Enter Order Number (e.g., ORD-ABC123)"
              className="input-field flex-1 uppercase"
            />
            <button type="submit" className="btn-primary flex items-center gap-2">
              <FiSearch className="w-5 h-5" />
              Track Order
            </button>
          </div>
          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}
        </form>
      </div>

      {/* Order Details */}
      {order && !loading && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Order Summary Card */}
          <div className="card p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Order #{order.orderNumber}</h2>
                <p className="text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`badge text-sm px-4 py-2 ${getStatusColor(order.orderStatus || 'Pending')}`}>
                {order.orderStatus || 'Pending'}
              </span>
            </div>

            {/* Timeline */}
            <div className="mb-8">
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200">
                  <div
                    className="h-full bg-primary-600 transition-all duration-500"
                    style={{
                      width: `${(timelineSteps.filter(s => s.isCompleted).length / timelineSteps.length) * 100}%`,
                    }}
                  />
                </div>

                {/* Steps */}
                <div className="relative flex justify-between">
                  {timelineSteps.map((step, index) => {
                    const IconComponent = step.icon;
                    return (
                      <div key={index} className="text-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors ${
                            step.isCompleted
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <p
                          className={`text-xs font-medium ${
                            step.isCompleted ? 'text-primary-600' : 'text-gray-400'
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.orderItems && order.orderItems.length > 0 ? (
                  order.orderItems.map((item, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={item.image || 'https://via.placeholder.com/80'}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        {item.selectedColor && (
                          <p className="text-sm text-gray-500">Color: {item.selectedColor}</p>
                        )}
                        {item.selectedSize && (
                          <p className="text-sm text-gray-500">Size: {item.selectedSize}</p>
                        )}
                        <p className="font-semibold text-primary-600 mt-2">৳{item.subtotal?.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No items in this order</p>
                )}
              </div>
            </div>
          </div>

          {/* Shipping & Payment Info */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Shipping Address */}
            <div className="card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FiPackage className="w-5 h-5" />
                Shipping Address
              </h3>
              {order.shippingAddress && (
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p className="text-gray-600">{order.shippingAddress.phone}</p>
                  <p className="text-gray-600">{order.shippingAddress.address}</p>
                  <p className="text-gray-600">
                    {order.shippingAddress.city}, {order.shippingAddress.zipCode}
                  </p>
                  <p className="text-gray-600">{order.shippingAddress.country}</p>
                </div>
              )}
            </div>

            {/* Payment Info */}
            <div className="card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FiMail className="w-5 h-5" />
                Payment Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">{order.paymentMethod || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className={`badge ${
                    order.paymentStatus === 'Paid' ? 'badge-success' :
                    order.paymentStatus === 'Failed' ? 'badge-danger' :
                    'badge-warning'
                  }`}>
                    {order.paymentStatus || 'Pending'}
                  </span>
                </div>
                {order.courierInfo?.trackingNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tracking Number:</span>
                    <span className="font-medium">{order.courierInfo.trackingNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Total */}
          <div className="card p-6">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>৳{order.itemsPrice?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>৳{order.shippingPrice?.toLocaleString() || 0}</span>
              </div>
              {order.discountPrice > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-৳{order.discountPrice?.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary-600">৳{order.totalPrice?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="card p-6 bg-blue-50 border-blue-200">
            <h3 className="font-semibold mb-4 text-blue-900">Need Help?</h3>
            <div className="flex flex-wrap gap-4">
              <a href="tel:+8801234567890" className="flex items-center gap-2 text-blue-600 hover:underline">
                <FiPhone className="w-5 h-5" />
                <span>+880-123-456-7890</span>
              </a>
              <a href="mailto:support@electromart.com" className="flex items-center gap-2 text-blue-600 hover:underline">
                <FiMail className="w-5 h-5" />
                <span>support@electromart.com</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Initial State */}
      {!order && !loading && searched && (
        <div className="text-center py-12">
          <FiPackage className="w-24 h-24 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Order Found</h3>
          <p className="text-gray-600">Please check your order number and try again</p>
        </div>
      )}

      {/* Welcome State */}
      {!order && !loading && !searched && (
        <div className="text-center py-12">
          <FiSearch className="w-24 h-24 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Track Your Order</h3>
          <p className="text-gray-600">Enter your order number above to track your order</p>
        </div>
      )}
    </div>
  );
};

export default OrderTrackingPage;
