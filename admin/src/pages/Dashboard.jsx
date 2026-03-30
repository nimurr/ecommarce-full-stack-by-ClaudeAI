import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../store/slices/dashboardSlice';
import { FiDollarSign, FiShoppingCart, FiUsers, FiPackage, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((state) => state.dashboard);

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

  const statCards = [
    { title: 'Total Revenue', value: `৳${stats?.revenue?.total?.toLocaleString() || 0}`, icon: FiDollarSign, color: 'green' },
    { title: 'Total Orders', value: stats?.orders?.total || 0, icon: FiShoppingCart, color: 'blue' },
    { title: 'Total Users', value: stats?.users?.total || 0, icon: FiUsers, color: 'purple' },
    { title: 'Pending Orders', value: stats?.orders?.pending || 0, icon: FiPackage, color: 'yellow' },
  ];

  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.title} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[stat.color]}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Top Products */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Top Selling Products</h2>
          {stats?.topProducts?.length > 0 ? (
            <div className="space-y-4">
              {stats.topProducts.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </span>
                  <img src={product.image || 'https://via.placeholder.com/40'} alt={product.name} className="w-12 h-12 object-cover rounded" />
                  <div className="flex-1">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.totalSold} sold</p>
                  </div>
                  <p className="font-semibold">৳{product.revenue?.toLocaleString()}</p>
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
          {stats?.recentOrders?.length > 0 ? (
            <div className="space-y-4">
              {stats.recentOrders.slice(0, 5).map((order) => (
                <div key={order._id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{order.user?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">৳{order.totalPrice?.toLocaleString()}</p>
                    <span className={`badge ${
                      order.orderStatus === 'Delivered' ? 'badge-success' :
                      order.orderStatus === 'Cancelled' ? 'badge-danger' :
                      'badge-warning'
                    }`}>{order.orderStatus}</span>
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
      {stats?.lowStockProducts?.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiPackage className="w-5 h-5 text-yellow-600" />
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
                </tr>
              </thead>
              <tbody>
                {stats.lowStockProducts.slice(0, 5).map((product) => (
                  <tr key={product._id} className="border-b">
                    <td className="py-3 px-4">{product.name}</td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${product.stock <= 5 ? 'text-red-600' : 'text-yellow-600'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4">{product.lowStockThreshold}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${product.stock <= 5 ? 'badge-danger' : 'badge-warning'}`}>
                        {product.stock <= 5 ? 'Critical' : 'Low'}
                      </span>
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
        <Link to="/admin/products/new" className="btn-primary text-center">Add Product</Link>
        <Link to="/admin/orders" className="btn-secondary text-center">View Orders</Link>
        <Link to="/admin/coupons" className="btn-secondary text-center">Manage Coupons</Link>
        <Link to="/admin/reviews" className="btn-secondary text-center">Moderate Reviews</Link>
      </div>
    </div>
  );
};

export default Dashboard;
