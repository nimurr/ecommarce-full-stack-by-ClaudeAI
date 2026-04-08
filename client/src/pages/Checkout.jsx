import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiCreditCard, FiDollarSign, FiCheck, FiX, FiLoader } from 'react-icons/fi';
import { createOrder } from '../store/slices/orderSlice';
import { useSettings } from '../context/SettingsContext';
import { validateCoupon } from '../api/couponAPI';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../utils/baseUrl';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { cartItems, shippingAddress, paymentMethod } = useSelector((state) => state.cart);
  const { settings } = useSettings();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    address: shippingAddress?.address || '',
    city: shippingAddress?.city || '',
    state: shippingAddress?.state || '',
    landmark: shippingAddress?.landmark || '',
  });

  const [payment, setPayment] = useState(paymentMethod || 'COD');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Calculate subtotal
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Calculate shipping based on settings and city
  const calculateShipping = () => {
    const city = formData.city.toLowerCase();
    const freeShippingThreshold = settings?.shipping?.freeShippingThreshold || 1000;
    const dhakaFee = settings?.shipping?.dhakaShippingFee || 60;
    const othersFee = settings?.shipping?.othersShippingFee || 120;

    if (subtotal > freeShippingThreshold) return 0;
    if (city.includes('dhaka')) return dhakaFee;
    return othersFee;
  };

  const shippingPrice = calculateShipping();
  const totalPrice = subtotal + shippingPrice - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    try {
      const result = await validateCoupon(couponCode.trim(), user?._id, subtotal);

      if (result.success && result.data) {
        const coupon = result.data;
        setAppliedCoupon(coupon);

        // Calculate discount
        let discount = 0;
        if (coupon.discountType === 'percentage') {
          discount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else if (coupon.discountType === 'fixed') {
          discount = coupon.discountValue;
        } else if (coupon.discountType === 'free_shipping') {
          discount = shippingPrice;
        }

        setDiscountAmount(discount);
        toast.success(`Coupon applied! You saved ৳${discount.toLocaleString()}`);
      } else {
        toast.error(result.message || 'Invalid coupon code');
        setAppliedCoupon(null);
        setDiscountAmount(0);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to validate coupon');
      setAppliedCoupon(null);
      setDiscountAmount(0);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setDiscountAmount(0);
    toast.info('Coupon removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        orderItems: cartItems.map(item => ({
          product: item.product,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          subtotal: item.price * item.quantity,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
        })),
        shippingAddress: formData,
        paymentMethod: payment,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      };

      const result = await dispatch(createOrder(orderData));

      if (createOrder.fulfilled.match(result)) {
        navigate(`/order-confirmation/${result.payload.orderNumber}`);
      } else {
        toast.error(result.payload?.message || 'Failed to create order. Please try again.');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container-custom py-8">
      <h1 className="section-title mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{11}"
                    className="input-field"
                    placeholder="01XXXXXXXXX"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="House, Road, Area"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="input-field"
                    >
                      <option value="">Select City</option>
                      <option value="Dhaka">Dhaka</option>
                      <option value="Chittagong">Chittagong</option>
                      <option value="Sylhet">Sylhet</option>
                      <option value="Rajshahi">Rajshahi</option>
                      <option value="Khulna">Khulna</option>
                      <option value="Barisal">Barisal</option>
                      <option value="Rangpur">Rangpur</option>
                      <option value="Mymensingh">Mymensingh</option>
                      <option value="Comilla">Comilla</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State/Division</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Landmark (Optional)</label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Nearby location"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={payment === 'COD'}
                    onChange={(e) => setPayment(e.target.value)}
                    className="w-4 h-4"
                  />
                  <FiDollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-gray-500">Pay when you receive your product</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <img src={getImageUrl(item.image)} alt={item.name} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      {item.selectedColor && (
                        <p className="text-xs text-gray-500">Color: {item.selectedColor}</p>
                      )}
                      {item.selectedSize && (
                        <p className="text-xs text-gray-500">Size: {item.selectedSize}</p>
                      )}
                      <p className="text-sm font-semibold">৳{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="border-t pt-4 mb-4">
                {appliedCoupon ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FiCheck className="text-green-600" />
                        <span className="text-sm font-medium text-green-800">{appliedCoupon.code}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiX />
                      </button>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      {appliedCoupon.discountType === 'percentage'
                        ? `${appliedCoupon.discountValue}% off`
                        : appliedCoupon.discountType === 'fixed'
                        ? `৳${appliedCoupon.discountValue} off`
                        : 'Free shipping'}
                    </p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="input-field py-2 text-sm flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="btn-secondary text-sm px-4 flex items-center gap-1"
                    >
                      {couponLoading ? <FiLoader className="animate-spin" /> : 'Apply'}
                    </button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>
                    {shippingPrice === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      `৳${shippingPrice.toLocaleString()}`
                    )}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount</span>
                    <span>-৳{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                {shippingPrice > 0 && !appliedCoupon && (
                  <p className="text-xs text-gray-500">
                    {formData.city.toLowerCase().includes('dhaka')
                      ? 'Dhaka shipping rate applied'
                      : 'Other cities shipping rate applied'}
                  </p>
                )}
                <div className="border-t pt-2 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary-600">৳{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Processing...' : `Place Order (৳${totalPrice.toLocaleString()})`}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
