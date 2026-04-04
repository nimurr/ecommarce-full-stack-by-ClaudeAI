import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../store/slices/dashboardSlice';
import { FiDollarSign, FiShoppingCart, FiUsers, FiPackage, FiTrendingUp, FiAlertTriangle, FiCheckCircle, FiClock, FiTruck, FiXCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import imageUrl from '../utils/baseUrl';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state) => state.dashboard);
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    dispatch(fetchDashboardStats(period));
  }, [dispatch, period]);

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
        <button onClick={() => dispatch(fetchDashboardStats(period))} className="btn-primary mt-4">
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
  const periodLabel = stats?.period || '';

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusIcons = {
    pending: FiClock,
    confirmed: FiCheckCircle,
    processing: FiPackage,
    shipped: FiTruck,
    delivered: FiCheckCircle,
    cancelled: FiXCircle,
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <div className="flex items-center gap-3">
          {/* <span className="text-gray-600 text-sm">{periodLabel}</span> */}
          <div className="bg-gray-100 rounded-lg p-1 flex gap-1">
            <button
              onClick={() => setPeriod('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${period === 'month'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 bg-gray-200'
                }`}
            >
              This Month
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${period === 'all'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 bg-gray-200'
                }`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Total Revenue</p>
              <p className="text-3xl font-bold">৳{(overview.totalRevenue || 0).toLocaleString()}</p>
              <p className="text-green-100 text-xs mt-2">
                Pending: ৳{(overview.pendingRevenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <FiDollarSign className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Orders</p>
              <p className="text-3xl font-bold">{overview.ordersCount || 0}</p>
              <p className="text-blue-100 text-xs mt-2">
                Paid: {overview.totalPaidOrders || 0}
              </p>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <FiShoppingCart className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">Total Users</p>
              <p className="text-3xl font-bold">{overview.totalUsers || 0}</p>
              <p className="text-purple-100 text-xs mt-2">
                New This Month: {overview.newUsersThisMonth || 0}
              </p>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <FiUsers className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm mb-1">Total Products</p>
              <p className="text-3xl font-bold">{overview.totalProducts || 0}</p>
              <p className="text-orange-100 text-xs mt-2">
                Low Stock: {overview.lowStockCount || 0}
              </p>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <FiPackage className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Orders by Status */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold mb-4">Orders by Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(ordersByStatus).map(([status, count]) => {
            const IconComponent = statusIcons[status] || FiPackage;
            return (
              <div key={status} className={`p-4 rounded-lg ${statusColors[status]}`}>
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className="w-6 h-6" />
                  <span className="text-2xl font-bold">{count}</span>
                </div>
                <p className="text-sm font-medium capitalize">{status}</p>
              </div>
            );
          })}
        </div>
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
              {topProducts.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </span>
                  <img src={imageUrl + '/public' + product.image || 'https://via.placeholder.com/40'} alt={product.name} className="w-12 h-12 object-cover rounded" />
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
                    <span className={`badge text-xs ${order.orderStatus === 'Delivered' ? 'badge-success' :
                      order.orderStatus === 'Cancelled' ? 'badge-danger' :
                        'badge-primary'
                      }`}>
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

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiAlertTriangle className="w-5 h-5 text-yellow-600" />
            Low Stock Alert
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Product</th>
                  <th className="text-left py-3 px-4 font-medium">Current Stock</th>
                  <th className="text-left py-3 px-4 font-medium">Threshold</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.slice(0, 5).map((product) => (
                  <tr key={product._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img src={product.mainImage} alt={product.name} className="w-10 h-10 object-cover rounded" />
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${product.stock <= 5 ? 'text-red-600' : 'text-yellow-600'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{product.lowStockThreshold}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${product.stock <= 5 ? 'badge-danger' : 'badge-warning'}`}>
                        {product.stock <= 5 ? 'Critical' : 'Low'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link to={`/products/${product._id}/edit`} className="btn-secondary text-sm py-1 px-3">
                        Update
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/products/new" className="btn-primary text-center">Add Product</Link>
        <Link to="/orders" className="btn-secondary text-center">View Orders</Link>
        <Link to="/categories" className="btn-secondary text-center">Categories</Link>
        <Link to="/users" className="btn-secondary text-center">Users</Link>
      </div>
    </div>
  );
};

export default Dashboard;
