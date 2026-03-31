import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiHome, FiPackage, FiList, FiShoppingCart, FiUsers, FiStar, FiTag, FiSettings, FiFileText, FiUserPlus, FiActivity, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { adminLogout } from '../store/slices/authSlice';
import { useState } from 'react';

const Layout = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    { name: 'Dashboard', href: '', icon: FiHome },
    { name: 'Products', href: 'products', icon: FiPackage },
    { name: 'Categories', href: 'categories', icon: FiList },
    { name: 'Orders', href: 'orders', icon: FiShoppingCart },
    { name: 'Users', href: 'users', icon: FiUsers },
    { name: 'Reviews', href: 'reviews', icon: FiStar },
    { name: 'Coupons', href: 'coupons', icon: FiTag },
    { name: 'Brands', href: 'brands', icon: FiTag },
    { name: 'Pages', href: 'pages', icon: FiFileText },
    { name: 'Sub-Admins', href: 'sub-admins', icon: FiUserPlus },
    { name: 'Settings', href: 'settings', icon: FiSettings },
    { name: 'Facebook Pixel', href: 'facebook-pixel', icon: FiActivity },
  ];

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
          <span className="text-2xl font-bold text-center block">Busy World <sup className='text-xs'>Admin</sup></span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <FiX className="w-6 h-6" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === `/${item.href}` || (item.href === '' && location.pathname === '/');
            return (
              <Link
                key={item.name}
                to={`/${item.href}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-gray-700 rounded-lg w-full transition-colors">
            <FiLogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all ${sidebarOpen ? 'lg:ml-64' : ''}`}>
        {/* Top Bar */}
        <header className="bg-gray-900 text-white shadow-sm h-16 flex items-center justify-between px-6 sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
            <FiMenu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right">
              <p className="font-medium text-sm">{user?.name}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              {/* <span className="text-primary-600 font-bold">{user?.name?.charAt(0)}</span> */}
              <img className='w-full h-full object-cover overflow-hidden rounded-full border' src="https://johannesippen.com/img/blog/humans-not-users/header.jpg" alt="" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
