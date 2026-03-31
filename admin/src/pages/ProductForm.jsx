import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createProduct, updateProduct, fetchProducts } from '../store/slices/productSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import { FiSave, FiX } from 'react-icons/fi';
import ImageUpload from '../components/ImageUpload';

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
    // Product Variants
    availableColors: [],
    availableSizes: [],
    colorOptions: [],
    sizeChart: {},
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

  // Just store the image previews - will upload with product submit
  const handleImageChange = (imagePreviews) => {
    const newImages = imagePreviews.filter(p => p.isNew && p.file);
    const existingImages = imagePreviews.filter(p => !p.isNew);
    
    // Store both file objects (for upload) and url objects (for display)
    const allImages = [
      ...existingImages.map(p => ({ url: p.url })),
      ...newImages.map(p => ({ 
        url: p.url, // Preview URL
        file: p.file, // Actual file for upload
        isNew: true 
      }))
    ];
    
    setFormData(prev => ({
      ...prev,
      images: allImages,
      mainImage: prev.mainImage || (newImages[0]?.url),
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
      // Create FormData for multipart/form-data upload
      const submitData = new FormData();
      
      // Append all text fields
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('shortDescription', formData.shortDescription);
      submitData.append('price', formData.price);
      if (formData.originalPrice) submitData.append('originalPrice', formData.originalPrice);
      submitData.append('category', formData.category);
      submitData.append('brand', formData.brand);
      submitData.append('stock', formData.stock);
      submitData.append('lowStockThreshold', formData.lowStockThreshold);
      submitData.append('featured', formData.featured);
      submitData.append('active', formData.active);
      submitData.append('warranty', formData.warranty);
      submitData.append('returnPolicy', formData.returnPolicy);
      
      // Append specifications
      Object.entries(formData.specifications).forEach(([key, value]) => {
        submitData.append(`specifications[${key}]`, value);
      });
      
      // Append features
      formData.features.forEach((feature, index) => {
        submitData.append(`features[${index}]`, feature);
      });
      
      // Append image files for upload
      formData.images.forEach((img, index) => {
        if (img.file) {
          // New image - append file
          submitData.append('images', img.file);
        } else if (img.url) {
          // Existing image - append URL
          submitData.append(`existingImages[${index}]`, img.url);
        }
      });

      console.log('📤 Submitting product with', formData.images.filter(i => i.file).length, 'images');

      if (id) {
        // Update product - need to use custom API call for FormData
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        const response = await fetch(`/api/products/${id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: submitData,
        });
        const result = await response.json();
        if (result.success) {
          navigate('/products');
        } else {
          alert(result.message || 'Failed to update product');
        }
      } else {
        // Create product - need to use custom API call for FormData
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: submitData,
        });
        const result = await response.json();
        if (result.success) {
          navigate('/products');
        } else {
          alert(result.message || 'Failed to create product');
        }
      }
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{id ? 'Edit Product' : 'Add Product'}</h1>
        <button onClick={() => navigate('/products')} className="btn-secondary flex items-center gap-2">
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
              <h2 className="text-lg font-semibold mb-4">Product Images</h2>
              <p className="text-xs text-gray-500 mb-2">Images will be uploaded when you save the product</p>
              <ImageUpload
                images={formData.images}
                onChange={handleImageChange}
                multiple={true}
                label="Upload Product Images"
              />
            </div>

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
              <h2 className="text-lg font-semibold mb-4">Product Variants</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Colors</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.availableColors.map((color, index) => (
                      <span key={index} className="badge badge-primary flex items-center gap-1">
                        {color}
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            availableColors: prev.availableColors.filter((_, i) => i !== index)
                          }))}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add color (e.g., Red, Blue, Black)"
                      className="input-field flex-1 py-2 text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const value = e.target.value.trim();
                          if (value && !formData.availableColors.includes(value)) {
                            setFormData(prev => ({
                              ...prev,
                              availableColors: [...prev.availableColors, value]
                            }));
                            e.target.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = e.target.previousSibling;
                        const value = input.value.trim();
                        if (value && !formData.availableColors.includes(value)) {
                          setFormData(prev => ({
                            ...prev,
                            availableColors: [...prev.availableColors, value]
                          }));
                          input.value = '';
                        }
                      }}
                      className="btn-secondary text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Sizes</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.availableSizes.map((size, index) => (
                      <span key={index} className="badge badge-primary flex items-center gap-1">
                        {size}
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            availableSizes: prev.availableSizes.filter((_, i) => i !== index)
                          }))}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add size (e.g., S, M, L, XL)"
                      className="input-field flex-1 py-2 text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const value = e.target.value.trim();
                          if (value && !formData.availableSizes.includes(value)) {
                            setFormData(prev => ({
                              ...prev,
                              availableSizes: [...prev.availableSizes, value]
                            }));
                            e.target.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = e.target.previousSibling;
                        const value = input.value.trim();
                        if (value && !formData.availableSizes.includes(value)) {
                          setFormData(prev => ({
                            ...prev,
                            availableSizes: [...prev.availableSizes, value]
                          }));
                          input.value = '';
                        }
                      }}
                      className="btn-secondary text-sm"
                    >
                      Add
                    </button>
                  </div>
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
