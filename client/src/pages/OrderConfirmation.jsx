import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderByNumber } from '../store/slices/orderSlice';
import { FiCheckCircle, FiPackage, FiTruck, FiHome } from 'react-icons/fi';

const OrderConfirmation = () => {
  const { orderNumber } = useParams();
  const dispatch = useDispatch();
  const { order, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrderByNumber(orderNumber));
  }, [dispatch, orderNumber]);

  if (loading || !order) {
    return (
      <div className="container-custom py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your order. We'll send you a confirmation SMS shortly.
        </p>

        <div className="card p-6 mb-8 text-left">
          <div className="flex justify-between items-center mb-4 pb-4 border-b">
            <div>
              <p className="text-sm text-gray-600">Order Number</p>
              <p className="font-bold text-lg">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="font-bold text-lg text-primary-600">৳{order.totalPrice.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <FiPackage className="w-5 h-5 text-primary-600" />
              <span className="text-sm">Status: <strong>{order.orderStatus}</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <FiTruck className="w-5 h-5 text-primary-600" />
              <span className="text-sm">Delivery: <strong>{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Paid'}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={`/track-order/${orderNumber}`} className="btn-primary">
            Track Order
          </Link>
          <Link to="/products" className="btn-secondary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
