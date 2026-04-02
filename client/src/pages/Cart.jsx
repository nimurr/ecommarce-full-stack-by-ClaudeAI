import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiTrash2, FiMinus, FiPlus, FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import { removeFromCart, updateQuantity, clearCart } from '../store/slices/cartSlice';
import { selectCartTotal } from '../store/slices/cartSlice';
import imageUrl from '../../../admin/src/utils/baseUrl';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.cart);
  const totals = useSelector(selectCartTotal);

  const handleUpdateQuantity = (product, quantity, selectedColor, selectedSize) => {
    if (quantity < 1) return;
    dispatch(updateQuantity({ product, quantity, selectedColor, selectedSize }));
  };

  const handleRemove = (product, selectedColor, selectedSize) => {
    dispatch(removeFromCart(product));
  };

  if (cartItems.length === 0) {
    return (
      <div className="container-custom py-16">
        <div className="text-center">
          <FiShoppingCart className="w-24 h-24 mx-auto text-gray-300 mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Add some products to get started!</p>
          <Link to="/products" className="btn-primary">
            Start Shopping <FiArrowRight className="inline ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="section-title mb-8">Shopping Cart ({cartItems.length} items)</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={`${item.product}-${item.selectedColor || ''}-${item.selectedSize || ''}`} className="card p-4">
              <div className="flex gap-4">
                <img
                  src={imageUrl + '/public' + item.image || 'https://via.placeholder.com/100x100'}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <Link to={`/products/${item.slug}`} className="font-medium hover:text-primary-600">
                    {item.name}
                  </Link>
                  <p className="text-gray-500 text-sm mt-1">৳{item.price?.toLocaleString()}</p>

                  {/* Show selected color and size */}
                  <div className="flex gap-4 mt-2 text-sm">
                    {item.selectedColor && (
                      <p className="text-gray-600">
                        <span className="font-medium">Color:</span> {item.selectedColor}
                      </p>
                    )}
                    {item.selectedSize && (
                      <p className="text-gray-600">
                        <span className="font-medium">Size:</span> {item.selectedSize}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => handleUpdateQuantity(item.product, item.quantity - 1, item.selectedColor, item.selectedSize)}
                        className="p-2 hover:bg-gray-100"
                        disabled={item.quantity <= 1}
                      >
                        <FiMinus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.product, item.quantity + 1, item.selectedColor, item.selectedSize)}
                        className="p-2 hover:bg-gray-100"
                      >
                        <FiPlus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item.product, item.selectedColor, item.selectedSize)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-lg text-primary-600">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>৳{totals.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{totals.shipping === 0 ? 'Free' : `৳${totals.shipping.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (5%)</span>
                <span>৳{totals.tax.toLocaleString()}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-৳{totals.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary-600">৳{totals.total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full mb-4"
            >
              Proceed to Checkout <FiArrowRight className="inline ml-2" />
            </button>

            <Link to="/products" className="text-center block text-primary-600 hover:text-primary-700 font-medium">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
