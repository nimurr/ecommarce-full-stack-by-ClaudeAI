import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../store/slices/dashboardSlice';
import { FiDollarSign, FiShoppingCart, FiUsers, FiPackage, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg">{error}</p>
        <button onClick={() => dispatch(fetchDashboardStats())} className="btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  const overview = stats?.overview || {};
  const ordersByStatus = stats?.ordersByStatus || {};
  const topProducts = stats?.topProducts || [];
  const recentOrders = stats?.recentOrders || [];
  const lowStockProducts = stats?.lowStockProducts || [];

  const statCards = [
    {
      title: 'Total Revenue',
      value: `৳${(overview.totalRevenue || 0).toLocaleString()}`,
      icon: FiDollarSign,
      color: 'green',
      subtitle: `Pending: ৳${(overview.pendingRevenue || 0).toLocaleString()}`
    },
    {
      title: 'Total Orders',
      value: overview.totalOrders || 0,
      icon: FiShoppingCart,
      color: 'blue',
      subtitle: `Paid: ${overview.totalPaidOrders || 0}`
    },
    {
      title: 'Total Users',
      value: overview.totalUsers || 0,
      icon: FiUsers,
      color: 'purple',
      subtitle: `New this month: ${overview.newUsersThisMonth || 0}`
    },
    {
      title: 'Total Products',
      value: overview.activeProducts || 0,
      icon: FiPackage,
      color: 'orange',
      subtitle: `Low stock: ${overview.lowStockCount || 0}`
    },
  ];

  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Pending': 'badge-warning',
      'Confirmed': 'badge-primary',
      'Processing': 'badge-primary',
      'Shipped': 'badge-primary',
      'Delivered': 'badge-success',
      'Cancelled': 'badge-danger',
    };
    return badges[status] || 'badge-primary';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.title} className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[stat.color]}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className=" mb-8">
        {/* Orders by Status */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Orders by Status</h2>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(ordersByStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center p-5 rounded-lg bg-gray-50 border">
                <span className="capitalize">{status}</span>
                <span className={`badge ${getStatusBadge(status)}`}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiAlertTriangle className="w-5 h-5 text-yellow-600" />
              Low Stock Alert
            </h2>
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div key={product._id} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img src={product.mainImage} alt={product.name} className="w-10 h-10 object-cover rounded" />
                    <span className="text-sm font-medium truncate max-w-xs">{product.name}</span>
                  </div>
                  <span className={`text-sm font-bold ${product.stock <= 5 ? 'text-red-600' : 'text-yellow-600'}`}>
                    {product.stock} left
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Top Products */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiTrendingUp className="w-5 h-5 text-green-600" />
            Top Selling Products
          </h2>
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </span>
                  <img src={product.image || 'https://via.placeholder.com/40'} alt={product.name} className="w-12 h-12 object-cover rounded" />
                  <div className="flex-1">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.totalSold} sold</p>
                  </div>
                  <p className="font-semibold text-sm">৳{(product.revenue || 0).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No sales data yet</p>
          )}
        </div>

        {/* Recent Orders */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order._id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{order.user?.name || 'Guest'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">৳{(order.totalPrice || 0).toLocaleString()}</p>
                    <span className={`badge text-xs ${getStatusBadge(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent orders</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/admin/products/new" className="btn-primary text-center">Add Product</Link>
        <Link to="/admin/orders" className="btn-secondary text-center">View Orders</Link>
        <Link to="/admin/categories" className="btn-secondary text-center">Categories</Link>
        <Link to="/admin/users" className="btn-secondary text-center">Users</Link>
      </div>
    </div>
  );
};

export default Dashboard;
