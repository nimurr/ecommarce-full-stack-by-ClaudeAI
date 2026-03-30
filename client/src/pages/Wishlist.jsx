import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { removeFromWishlist } from '../store/slices/authSlice';
import { addToCart } from '../store/slices/cartSlice';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const wishlistIds = useSelector((state) => state.wishlist.items);

  const handleRemove = (productId) => {
    dispatch(removeFromWishlist(productId));
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.mainImage,
      quantity: 1,
    }));
  };

  if (!user) {
    return (
      <div className="container-custom py-16 text-center">
        <FiHeart className="w-24 h-24 mx-auto text-gray-300 mb-6" />
        <h1 className="text-2xl font-bold mb-4">Sign in to view wishlist</h1>
        <Link to="/login" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  if (wishlistIds.length === 0) {
    return (
      <div className="container-custom py-16 text-center">
        <FiHeart className="w-24 h-24 mx-auto text-gray-300 mb-6" />
        <h1 className="text-2xl font-bold mb-4">Your wishlist is empty</h1>
        <p className="text-gray-600 mb-8">Save products you love to your wishlist</p>
        <Link to="/products" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="section-title mb-8">My Wishlist ({wishlistIds.length} items)</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlistIds.map((productId) => (
          <div key={productId} className="product-card group">
            <div className="relative aspect-square">
              <img
                src={product.mainImage || 'https://via.placeholder.com/300x300'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleRemove(productId)}
                className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-500 hover:text-white transition-colors"
              >
                <FiHeart className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <Link to={`/products/${product.slug}`}>
                <h3 className="font-medium line-clamp-2 mb-2">{product.name}</h3>
              </Link>
              <p className="text-primary-600 font-bold mb-3">৳{product.price?.toLocaleString()}</p>
              <button
                onClick={() => handleAddToCart(product)}
                className="btn-primary w-full text-sm py-2"
              >
                <FiShoppingCart className="inline mr-2" />
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
