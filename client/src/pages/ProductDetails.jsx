import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductBySlug, clearProduct } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/slices/authSlice';
import { FiShoppingCart, FiHeart, FiTruck, FiShield, FiRefreshCw, FiStar } from 'react-icons/fi';
import imageUrl from '../../../admin/src/utils/baseUrl';

const ProductDetails = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { product, relatedProducts, loading } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  const wishlist = useSelector((state) => state.wishlist.items);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    dispatch(fetchProductBySlug(slug));
    return () => dispatch(clearProduct());
  }, [dispatch, slug]);

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(addToCart({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.mainImage,
      quantity,
    }));
  };

  const handleWishlistToggle = () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    if (wishlist.includes(product?._id)) {
      dispatch(removeFromWishlist(product._id));
    } else {
      dispatch(addToWishlist(product._id));
    }
  };

  if (loading || !product) {
    return (
      <div className="container-custom py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
      </div>
    );
  }

  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const isInWishlist = wishlist.includes(product._id);

  return (
    <div className="container-custom py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary-600">Products</Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <div className="card mb-4">
            <img
              src={imageUrl + '/public' + product.mainImage || 'https://via.placeholder.com/500x500'}
              alt={product.name}
              className="w-full aspect-square object-cover"
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${selectedImage === index ? 'border-primary-600' : 'border-gray-200'
                    }`}
                >
                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-primary-600 font-medium mb-2">{product.brand}</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-4">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-gray-600">{product.rating} ({product.numReviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-primary-600">৳{product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">৳{product.originalPrice.toLocaleString()}</span>
                  <span className="badge badge-danger">-{discount}%</span>
                </>
              )}
            </div>
          </div>

          {/* Stock */}
          <div className={`mb-6 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? (
              <p>✓ In Stock ({product.stock} available)</p>
            ) : (
              <p>✗ Out of Stock</p>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-6">{product.shortDescription || product.description}</p>

          {/* Quantity & Add to Cart */}
          <div className="flex gap-4 mb-6">
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-3 hover:bg-gray-100"
                disabled={quantity <= 1 || product.stock < quantity + 1}
              >
                -
              </button>
              <span className="w-16 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="px-4 py-3 hover:bg-gray-100"
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <FiShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
            <button
              onClick={handleWishlistToggle}
              className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center ${isInWishlist ? 'border-red-500 text-red-500' : 'border-gray-300 hover:border-red-500 hover:text-red-500'
                }`}
            >
              <FiHeart className="w-6 h-6" />
            </button>
          </div>

          {/* Features */}
          <div className="space-y-3 pt-6 border-t">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <FiTruck className="w-5 h-5 text-primary-600" />
              <span>Free delivery on orders over ৳2000</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <FiShield className="w-5 h-5 text-primary-600" />
              <span>{product.warranty || '1 Year'} Warranty</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <FiRefreshCw className="w-5 h-5 text-primary-600" />
              <span>{product.returnPolicy || '7 days'} return policy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Description */}
      {product.description && (
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Product Description</h2>
          <div className="prose max-w-none text-gray-600">
            {product.description}
          </div>
        </div>
      )}

      {/* Specifications */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Specifications</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="flex border-b pb-2">
                <span className="font-medium w-1/3 text-gray-600">{key}</span>
                <span className="w-2/3">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div>
          <h2 className="section-title mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <Link key={product._id} to={`/products/${product.slug}`} className="product-card group">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium line-clamp-2 mb-2">{product.name}</h3>
                  <p className="text-primary-600 font-bold">৳{product.price.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
