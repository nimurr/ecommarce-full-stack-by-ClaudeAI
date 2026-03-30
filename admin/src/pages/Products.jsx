import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProducts, deleteProduct } from '../store/slices/productSlice';
import { FiEdit2, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';

const Products = () => {
  const dispatch = useDispatch();
  const { products, loading, total } = useSelector((state) => state.products);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchProducts({ limit: 50 }));
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await dispatch(deleteProduct(id));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(fetchProducts({ search, limit: 50 }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products ({total})</h1>
        <Link to="/admin/products/new" className="btn-primary flex items-center gap-2">
          <FiPlus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field flex-1"
        />
        <button type="submit" className="btn-primary">
          <FiSearch className="w-5 h-5" />
        </button>
      </form>

      {/* Products Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Product</th>
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-left py-3 px-4 font-medium">Price</th>
                  <th className="text-left py-3 px-4 font-medium">Stock</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img src={product.mainImage} alt={product.name} className="w-12 h-12 object-cover rounded" />
                        <div>
                          <p className="font-medium truncate max-w-xs">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{product.category?.name || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">৳{product.price.toLocaleString()}</p>
                        {product.originalPrice && (
                          <p className="text-sm text-gray-400 line-through">৳{product.originalPrice.toLocaleString()}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${product.stock <= 10 ? 'text-red-600' : product.stock <= 20 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${product.active ? 'badge-success' : 'badge-danger'}`}>
                        {product.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link to={`/admin/products/${product._id}/edit`} className="p-2 hover:bg-gray-200 rounded">
                          <FiEdit2 className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(product._id)} className="p-2 hover:bg-red-100 text-red-600 rounded">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
