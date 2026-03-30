import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiTruck, FiShield, FiHeadphones, FiRefreshCw } from 'react-icons/fi';
import { fetchFeaturedProducts, fetchNewArrivals } from '../store/slices/productSlice';
import { fetchFeaturedCategories } from '../store/slices/categorySlice';
import ProductCard from '../components/products/ProductCard';
import CategoryCard from '../components/categories/CategoryCard';

const Home = () => {
  const dispatch = useDispatch();
  const { featuredProducts, newArrivals, loading } = useSelector((state) => state.products);
  const { featuredCategories } = useSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
    dispatch(fetchNewArrivals());
    dispatch(fetchFeaturedCategories());
  }, [dispatch]);

  const features = [
    { icon: FiTruck, title: 'Free Shipping', desc: 'On orders over ৳1000' },
    { icon: FiShield, title: 'Secure Payment', desc: '100% secure transactions' },
    { icon: FiRefreshCw, title: 'Easy Returns', desc: '7 days return policy' },
    { icon: FiHeadphones, title: '24/7 Support', desc: 'Dedicated customer support' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container-custom py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display leading-tight">
                Discover the Latest in <span className="text-yellow-300">Electronics</span>
              </h1>
              <p className="text-lg md:text-xl text-primary-100">
                Shop premium gadgets at unbeatable prices. From smartphones to laptops, we have it all.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                  Shop Now <FiArrowRight className="inline ml-2" />
                </Link>
                <Link to="/products?sale=true" className="btn-outline border-white text-white hover:bg-white hover:text-primary-600">
                  View Deals
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&h=400&fit=crop"
                alt="Electronics"
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow">
                <feature.icon className="w-12 h-12 mx-auto mb-4 text-primary-600" />
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Browse our most popular categories</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredCategories.slice(0, 6).map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">Handpicked selections just for you</p>
            </div>
            <Link to="/products?featured=true" className="link-primary hidden sm:flex items-center">
              View All <FiArrowRight className="ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              // Loading skeletons
              [...Array(4)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))
            ) : (
              featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            )}
          </div>
          <div className="text-center mt-8 sm:hidden">
            <Link to="/products?featured=true" className="btn-primary">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="section-title">New Arrivals</h2>
              <p className="section-subtitle">Check out the latest products</p>
            </div>
            <Link to="/products?sort=newest" className="link-primary hidden sm:flex items-center">
              View All <FiArrowRight className="ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))
            ) : (
              newArrivals.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-16">
        <div className="container-custom">
          <div className="bg-gradient-to-r from-accent-600 to-accent-700 rounded-2xl p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
              🎉 Special Offer: 20% Off on First Order!
            </h2>
            <p className="text-lg md:text-xl mb-8 text-accent-100">
              Use code <span className="font-bold bg-white text-accent-600 px-4 py-2 rounded-lg">WELCOME20</span> at checkout
            </p>
            <Link to="/register" className="btn-primary bg-white text-accent-600 hover:bg-gray-100">
              Register Now
            </Link>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-title">Popular Brands</h2>
            <p className="section-subtitle">Shop from top brands</p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {['Apple', 'Samsung', 'Sony', 'LG', 'Xiaomi', 'OnePlus'].map((brand) => (
              <Link
                key={brand}
                to={`/products?brand=${brand}`}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow flex items-center justify-center"
              >
                <span className="font-semibold text-gray-700">{brand}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
