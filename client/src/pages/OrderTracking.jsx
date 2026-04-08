import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderByNumber } from '../store/slices/orderSlice';
import { FiPackage, FiCheckCircle, FiClock, FiXCircle, FiTruck } from 'react-icons/fi';
import { getImageUrl } from '../utils/baseUrl';

const OrderTracking = () => {
  const { orderNumber } = useParams();
  const dispatch = useDispatch();
  const { order, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrderByNumber(orderNumber));
  }, [dispatch, orderNumber]);

  if (loading) {
    return (
      <div className="container-custom py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <Link to="/products" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  const statusSteps = [
    { status: 'Pending', icon: FiClock, label: 'Order Placed' },
    { status: 'Confirmed', icon: FiCheckCircle, label: 'Confirmed' },
    { status: 'Processing', icon: FiPackage, label: 'Processing' },
    { status: 'Shipped', icon: FiTruck, label: 'Shipped' },
    { status: 'Delivered', icon: FiCheckCircle, label: 'Delivered' },
  ];

  const currentStatusIndex = statusSteps.findIndex(step => step.status === order.orderStatus);

  return (
    <div className="container-custom py-8">
      <h1 className="section-title mb-8">Track Order</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Order #{order.orderNumber}</h2>

            {/* Progress Bar */}
            <div className="relative">
              <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 rounded" />
              <div
                className="absolute top-4 left-0 h-1 bg-primary-600 rounded transition-all duration-500"
                style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
              />
              <div className="relative flex justify-between">
                {statusSteps.map((step, index) => {
                  const isActive = index <= currentStatusIndex;
                  return (
                    <div key={step.status} className="text-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${isActive ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
                        }`}>
                        <step.icon className="w-4 h-4" />
                      </div>
                      <p className={`text-xs font-medium ${isActive ? 'text-primary-600' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 text-center">
              <span className={`badge ${order.orderStatus === 'Delivered' ? 'badge-success' :
                  order.orderStatus === 'Cancelled' ? 'badge-danger' :
                    'badge-primary'
                }`}>
                {order.orderStatus}
              </span>
            </div>
          </div>

          {/* Courier Info */}
          {order.courierInfo?.trackingNumber && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Delivery Information</h2>
              <div className="space-y-3">
                <p><strong>Courier:</strong> {order.courierInfo.courierName}</p>
                <p><strong>Tracking Number:</strong> {order.courierInfo.trackingNumber}</p>
                <p><strong>Status:</strong> {order.courierInfo.status}</p>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
            <div className="text-sm space-y-2">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.orderItems.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <img src={getImageUrl(item.image)} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    <p className="text-sm font-semibold">৳{item.subtotal.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary-600">৳{order.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
