import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../store/slices/orderSlice';
import { FiPackage, FiChevronRight, FiClock, FiStar, FiX } from 'react-icons/fi';
import { getImageUrl } from '../../utils/baseUrl';
import { ReviewForm } from '../components/reviews/ReviewForm';
import { toast } from 'react-toastify';

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading, total } = useSelector((state) => state.orders);
  const [reviewModal, setReviewModal] = useState({
    open: false,
    productId: null,
    productName: '',
    orderItemId: null,
  });

  useEffect(() => {
    dispatch(fetchMyOrders({}));
  }, [dispatch]);

  const handleOpenReview = (orderItem) => {
    setReviewModal({
      open: true,
      productId: orderItem.product,
      productName: orderItem.name,
      orderItemId: orderItem._id,
    });
  };

  const handleCloseReview = () => {
    setReviewModal({ open: false, productId: null, productName: '', orderItemId: null });
  };

  const handleReviewSuccess = () => {
    handleCloseReview();
    toast.success('Thank you for your review!');
    dispatch(fetchMyOrders({}));
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
                      <img src={getImageUrl(item.image)} alt={item.name} className="w-16 h-16 object-cover rounded" />
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
                    {order.orderStatus === 'Delivered' && order.orderItems.length > 0 && (
                      <button
                        onClick={() => handleOpenReview(order.orderItems[0])}
                        className="text-sm text-green-600 flex items-center gap-1 hover:underline"
                      >
                        <FiStar className="w-4 h-4" />
                        Write Review
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg">৳{order.totalPrice.toLocaleString()}</span>
                    <Link
                      to={`/track-order/${order.orderNumber}`}
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

      {/* Review Modal */}
      {reviewModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Write a Review</h2>
                <p className="text-sm text-gray-600">for {reviewModal.productName}</p>
              </div>
              <button
                onClick={handleCloseReview}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <ReviewForm
                productId={reviewModal.productId}
                productName={reviewModal.productName}
                onSuccess={handleReviewSuccess}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
