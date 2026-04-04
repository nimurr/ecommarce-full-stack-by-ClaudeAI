import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProducts, deleteProduct } from '../store/slices/productSlice';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import imageUrl from '../utils/baseUrl';

const Products = () => {
  const dispatch = useDispatch();
  const { products, loading, total, page, pages } = useSelector((state) => state.products);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    dispatch(fetchProducts({ page: currentPage, limit }));
  }, [dispatch, currentPage, limit]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    dispatch(fetchProducts({ search, page: 1, limit }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pages) {
      setCurrentPage(newPage);
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    setLimit(newLimit);
    setCurrentPage(1);
    dispatch(fetchProducts({ search, page: 1, limit: newLimit }));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await dispatch(deleteProduct(id));
    }
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisible = 5;
    
    if (pages <= maxVisible) {
      for (let i = 1; i <= pages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(pages);
      } else if (page >= pages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = pages - 3; i <= pages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = page - 1; i <= page + 1; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(pages);
      }
    }
    return pageNumbers;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products ({total})</h1>
        <Link to="/products/new" className="btn-primary flex items-center gap-2">
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
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No products found</p>
          </div>
        ) : (
          <>
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
                          <img src={imageUrl + '/public/' + product.mainImage} alt={product.name} className="w-12 h-12 object-cover rounded" />
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
                          <Link to={`/products/${product._id}/edit`} className="p-2 hover:bg-gray-200 rounded">
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

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t bg-gray-50">
              {/* Per-page selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show:</span>
                <select
                  value={limit}
                  onChange={handleLimitChange}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {[5, 10, 20, 50, 100].map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <span className="text-sm text-gray-600">per page</span>
              </div>

              {/* Page info */}
              <div className="text-sm text-gray-600">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} results
              </div>

              {/* Page navigation */}
              {pages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 rounded border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                  </button>

                  {getPageNumbers().map((num, idx) => (
                    num === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 py-1 text-gray-400">…</span>
                    ) : (
                      <button
                        key={num}
                        onClick={() => handlePageChange(num)}
                        className={`px-3 py-1 rounded border text-sm ${
                          page === num
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {num}
                      </button>
                    )
                  ))}

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === pages}
                    className="px-3 py-1 rounded border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
