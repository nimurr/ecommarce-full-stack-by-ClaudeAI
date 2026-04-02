import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { FiShoppingCart, FiHeart, FiUser, FiSearch, FiMenu, FiX, FiPhone, FiMail } from 'react-icons/fi';
import { selectCartCount } from '../../store/slices/cartSlice';
import { logout } from '../../store/slices/authSlice';
import { clearSearchResults, searchSuggestions } from '../../store/slices/productSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import { useSettings } from '../../context/SettingsContext';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const cartCount = useSelector(selectCartCount);
  const wishlistCount = useSelector((state) => state.wishlist.items.length);
  const { searchResults } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories);
  const { settings } = useSettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    dispatch(fetchCategories({}));
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
    }
  };

  const handleSearchInput = (value) => {
    setSearchQuery(value);
    if (value.length > 2) {
      dispatch(searchSuggestions(value));
    } else {
      dispatch(clearSearchResults());
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const siteName = settings?.siteName || 'ElectroMart';
  const contactPhone = settings?.contactPhone || '+880-123-456-7890';

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-primary-700 text-white py-2 text-sm">
        <div className="container-custom flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span>🎉 Free Shipping on Orders Over ৳1000</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <button className='underline'>Order Tracking</button>
            {contactPhone && (
              <a href={`tel:${contactPhone}`} className="flex items-center gap-1 hover:text-primary-200">
                <FiPhone className="w-4 h-4" />
                <span>{contactPhone}</span>
              </a>
            )}
            {settings?.contactEmail && (
              <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-1 hover:text-primary-200">
                <FiMail className="w-4 h-4" />
                <span>{settings.contactEmail}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container-custom py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">BW</span>
            </div>
            <span className="text-xl font-bold font-display hidden sm:block">
              {siteName}
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="input-field pr-12"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onFocus={() => setShowSearch(true)}
                onBlur={() => setTimeout(() => setShowSearch(false), 200)}
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600">
                <FiSearch className="w-5 h-5" />
              </button>

              {/* Search Suggestions */}
              {showSearch && searchResults.products.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border overflow-hidden z-50">
                  {searchResults.products.slice(0, 5).map((product) => (
                    <Link
                      key={product._id}
                      to={`/products/${product.slug}`}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b last:border-b-0"
                      onClick={() => setShowSearch(false)}
                    >
                      <img src={product.mainImage} alt={product.name} className="w-12 h-12 object-cover rounded" />
                      <div className="flex-1">
                        <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                        <p className="text-primary-600 font-semibold text-sm">৳{product.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <FiSearch className="w-6 h-6" />
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2 hover:bg-gray-100 rounded-lg hidden sm:block">
              <FiHeart className="w-6 h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg">
              <FiShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiUser className="w-6 h-6" />
                <span className="hidden lg:block font-medium">{isAuthenticated ? user.name : 'Account'}</span>
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-20 overflow-hidden">
                    {isAuthenticated ? (
                      <>
                        <Link to="/profile" className="block px-4 py-3 hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>
                          Profile
                        </Link>
                        <Link to="/orders" className="block px-4 py-3 hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>
                          My Orders
                        </Link>
                        <Link to="/wishlist" className="block px-4 py-3 hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>
                          Wishlist
                        </Link>
                        <button onClick={handleLogout} className="w-full text-left px-4 py-3 hover:bg-gray-50 text-red-600">
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" className="block px-4 py-3 hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>
                          Login
                        </Link>
                        <Link to="/register" className="block px-4 py-3 hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>
                          Register
                        </Link>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {showMobileMenu ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {showSearch && (
          <form onSubmit={handleSearch} className="md:hidden mt-4">
            <input
              type="text"
              placeholder="Search products..."
              className="input-field"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
            />
          </form>
        )}
      </div>

      {/* Navigation */}
      <nav className="border-t hidden md:block">
        <div className="container-custom">
          <ul className="flex items-center gap-8 py-3">
            <li><Link to="/" className="font-medium hover:text-primary-600 transition-colors">Home</Link></li>
            <li><Link to="/products" className="font-medium hover:text-primary-600 transition-colors">All Products</Link></li>
            {/* Dynamic Categories from API */}
            {categories.slice(0, 4).map((category) => (
              <li key={category._id}>
                <Link
                  to={`/products?category=${category._id}`}
                  className="font-medium hover:text-primary-600 transition-colors"
                >
                  {category.name}
                </Link>
              </li>
            ))}
            <li><Link to="/order-tracking" className="font-medium hover:text-primary-600 transition-colors">Order Tracking</Link></li>
          </ul>
        </div>
      </nav>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t bg-white">
          <ul className="py-4">
            <li><Link to="/" className="block px-4 py-3 hover:bg-gray-50" onClick={() => setShowMobileMenu(false)}>Home</Link></li>
            <li><Link to="/products" className="block px-4 py-3 hover:bg-gray-50" onClick={() => setShowMobileMenu(false)}>All Products</Link></li>
            <li><Link to="/wishlist" className="block px-4 py-3 hover:bg-gray-50" onClick={() => setShowMobileMenu(false)}>Wishlist</Link></li>
            <li><Link to="/orders" className="block px-4 py-3 hover:bg-gray-50" onClick={() => setShowMobileMenu(false)}>My Orders</Link></li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
