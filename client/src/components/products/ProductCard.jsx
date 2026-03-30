import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../store/slices/authSlice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const wishlist = useSelector((state) => state.wishlist.items);
  const isInWishlist = wishlist.includes(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    dispatch(addToCart({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.mainImage,
      quantity: 1,
    }));
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
    } else {
      dispatch(addToWishlist(product._id));
    }
  };

  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div className="product-card group">
      {/* Image */}
      <div className="relative overflow-hidden aspect-square">
        <Link to={`/products/${product.slug}`}>
          <img
            src={product.mainImage || 'https://via.placeholder.com/300x300?text=Product'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount > 0 && (
            <span className="badge badge-danger">-{discount}%</span>
          )}
          {product.stock <= 0 && (
            <span className="badge badge-danger">Out of Stock</span>
          )}
          {product.stock > 0 && product.stock <= 10 && (
            <span className="badge badge-warning">Low Stock</span>
          )}
        </div>

        {/* Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleWishlistToggle}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform ${
              isInWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:text-red-500'
            }`}
          >
            <FiHeart className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Add to Cart */}
        {product.stock > 0 && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-0 left-0 right-0 bg-primary-600 text-white py-3 font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary-700"
          >
            <FiShoppingCart className="inline mr-2" />
            Add to Cart
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <Link to={`/products/${product.slug}`}>
          <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 h-12 hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}>
                ★
              </span>
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.numReviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary-600">৳{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">৳{product.originalPrice.toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
