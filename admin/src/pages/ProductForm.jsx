import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createProduct, updateProduct, fetchProducts } from '../store/slices/productSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import { FiSave, FiX } from 'react-icons/fi';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    originalPrice: '',
    category: '',
    brand: '',
    stock: '',
    lowStockThreshold: '10',
    featured: false,
    active: true,
    mainImage: '',
    images: [],
    specifications: {},
    features: [],
    warranty: '1 Year',
    returnPolicy: '7 days return policy',
  });

  useEffect(() => {
    dispatch(fetchCategories({}));
    if (id) {
      dispatch(fetchProducts({}));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (id && products.length > 0) {
      const product = products.find(p => p._id === id);
      if (product) {
        setFormData({
          name: product.name || '',
          description: product.description || '',
          shortDescription: product.shortDescription || '',
          price: product.price || '',
          originalPrice: product.originalPrice || '',
          category: product.category?._id || '',
          brand: product.brand || '',
          stock: product.stock || '',
          lowStockThreshold: product.lowStockThreshold || '10',
          featured: product.featured || false,
          active: product.active !== undefined ? product.active : true,
          mainImage: product.mainImage || '',
          images: product.images || [],
          specifications: product.specifications || {},
          features: product.features || [],
          warranty: product.warranty || '1 Year',
          returnPolicy: product.returnPolicy || '7 days return policy',
        });
      }
    }
  }, [products, id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSpecChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      specifications: { ...prev.specifications, [key]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        stock: Number(formData.stock),
        lowStockThreshold: Number(formData.lowStockThreshold),
      };
      
      if (id) {
        await dispatch(updateProduct({ id, data }));
      } else {
        await dispatch(createProduct(data));
      }
      navigate('/admin/products');
    } catch (error) {
      console.error('Failed to save product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{id ? 'Edit Product' : 'Add Product'}</h1>
        <button onClick={() => navigate('/admin/products')} className="btn-secondary flex items-center gap-2">
          <FiX className="w-5 h-5" />
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
                  <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} rows={2} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} required rows={5} className="input-field" />
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Specifications</h2>
              <div className="space-y-3">
                {Object.entries(formData.specifications).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <input type="text" value={key} onChange={(e) => {
                      const newSpecs = { ...formData.specifications };
                      delete newSpecs[key];
                      newSpecs[e.target.value] = value;
                      setFormData({ ...formData, specifications: newSpecs });
                    }} className="input-field flex-1" placeholder="Key" />
                    <input type="text" value={value} onChange={(e) => handleSpecChange(key, e.target.value)} className="input-field flex-1" placeholder="Value" />
                    <button type="button" onClick={() => {
                      const newSpecs = { ...formData.specifications };
                      delete newSpecs[key];
                      setFormData({ ...formData, specifications: newSpecs });
                    }} className="btn-danger">Remove</button>
                  </div>
                ))}
                <button type="button" onClick={() => setFormData(prev => ({
                  ...prev, specifications: { ...prev.specifications, ['']: '' }
                }))} className="btn-secondary text-sm">Add Specification</button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Pricing</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} required className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Original Price</label>
                  <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} className="input-field" />
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Inventory</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
                  <input type="number" name="stock" value={formData.stock} onChange={handleChange} required className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold</label>
                  <input type="number" name="lowStockThreshold" value={formData.lowStockThreshold} onChange={handleChange} className="input-field" />
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Organization</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange} required className="input-field">
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleChange} required className="input-field" />
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Status</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="w-4 h-4" />
                  <span className="text-sm">Featured Product</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} className="w-4 h-4" />
                  <span className="text-sm">Active</span>
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              <FiSave className="w-5 h-5" />
              {loading ? 'Saving...' : id ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
