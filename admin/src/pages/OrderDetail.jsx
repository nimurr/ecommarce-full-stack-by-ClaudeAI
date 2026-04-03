import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrder, updateOrderStatus } from '../store/slices/orderSlice';
import { FiArrowLeft, FiPackage, FiCheckCircle, FiClock, FiTruck, FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import imageUrl from '../utils/baseUrl';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { order, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrder(id));
  }, [dispatch, id]);

  const handleStatusChange = async (newStatus) => {
    await dispatch(updateOrderStatus({ id, data: { orderStatus: newStatus } }));
  };

  const handleDownloadInvoice = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/orders/${id}/invoice`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate invoice');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${order?.orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  if (loading || !order) {
    return (
      <div className="container-custom py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
      </div>
    );
  }

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
    <div className="container-custom py-8">
      <button onClick={() => navigate('/orders')} className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900">
        <FiArrowLeft className="w-5 h-5" />
        Back to Orders
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">Order #{order.orderNumber}</h1>
                <p className="text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadInvoice}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
                >
                  <FiDownload className="w-4 h-4" />
                  Download Invoice
                </button>
                <select
                  value={order.orderStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={`text-sm font-medium px-4 py-2 rounded-lg ${getStatusBadge(order.orderStatus)}`}
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
            </div>

            <h2 className="font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.orderItems.map((item, index) => (
                <div key={index} className="flex gap-4 p-4 border rounded-lg">
                  <img src={imageUrl + '/public' + item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">৳{item.price?.toLocaleString()} × {item.quantity}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      {item.selectedColor && (
                        <p className="text-gray-600 text-xl">
                          <span className="font-medium">Color:</span> {item.selectedColor}
                        </p>
                      )}
                      {item.selectedSize && (
                        <p className="text-gray-600 text-xl">
                          <span className="font-medium">Size:</span> {item.selectedSize}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="font-semibold">৳{item.subtotal?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Courier Info */}
          {order.courierInfo?.trackingNumber && (
            <div className="card p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <FiTruck className="w-5 h-5" />
                Delivery Information
              </h2>
              <div className="space-y-2 text-sm">
                <p><strong>Courier:</strong> {order.courierInfo.courierName}</p>
                <p><strong>Tracking:</strong> {order.courierInfo.trackingNumber}</p>
                <p><strong>Status:</strong> {order.courierInfo.status}</p>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Shipping Address</h2>
            <div className="text-sm space-y-2">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>৳{order.itemsPrice?.toLocaleString()}</span>
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
              <div className="border-t pt-2 flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-primary-600">৳{order.totalPrice?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold mb-4">Payment</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Method:</strong> {order.paymentMethod}</p>
              <p><strong>Status:</strong> <span className={`badge ${getPaymentBadge(order.paymentStatus)}`}>{order.paymentStatus}</span></p>
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

const getPaymentBadge = (status) => {
  const badges = {
    'Pending': 'badge-warning',
    'Paid': 'badge-success',
    'Failed': 'badge-danger',
    'Refunded': 'badge-danger',
  };
  return badges[status] || 'badge-primary';
};

export default OrderDetail;
