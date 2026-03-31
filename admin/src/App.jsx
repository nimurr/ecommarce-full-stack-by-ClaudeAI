import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Users from './pages/Users';
import Reviews from './pages/Reviews';
import Coupons from './pages/Coupons';
import Settings from './pages/Settings';
import Pages from './pages/Pages';
import Brands from './pages/Brands';
import SubAdmins from './pages/SubAdmins';
import FacebookPixelSettings from './pages/FacebookPixelSettings';
import Login from './pages/Login';

const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  if (!user || (user.role !== 'admin' && user.role !== 'sub-admin')) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id/edit" element={<ProductForm />} />
        <Route path="categories" element={<Categories />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="users" element={<Users />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="settings" element={<Settings />} />
        <Route path="pages" element={<Pages />} />
        <Route path="brands" element={<Brands />} />
        <Route path="sub-admins" element={<SubAdmins />} />
        <Route path="facebook-pixel" element={<FacebookPixelSettings />} />
      </Route>
    </Routes>
  );
}

export default App;
