import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSettings, saveSettings } from '../store/slices/settingsSlice';
import { FiSave, FiMail, FiPhone, FiMapPin, FiClock, FiTruck, FiSettings, FiGlobe, FiActivity, FiLock, FiEye, FiEyeOff, FiImage, FiPlus, FiEdit2, FiTrash2, FiArrowUp, FiArrowDown, FiToggleLeft, FiToggleRight, FiUpload } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/baseUrl';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Settings = () => {
  const dispatch = useDispatch();
  const { settings, loading } = useSelector((state) => state.settings);
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('general');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [formData, setFormData] = useState({
    siteName: '',
    siteTagline: '',
    siteDescription: '',
    contactEmail: '',
    contactPhone: '',
    contactPhoneSecondary: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Bangladesh',
    },
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: '',
    },
    shipping: {
      freeShippingThreshold: 1000,
      shippingFee: 60,
      estimatedDeliveryDays: '3-7 business days',
    },
    returnPolicy: '7 days return policy',
    currency: 'BDT',
    currencySymbol: '৳',
  });

  // Slider management state
  const [sliders, setSliders] = useState([]);
  const [sliderLoading, setSliderLoading] = useState(true);
  const [showSliderModal, setShowSliderModal] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [sliderFormData, setSliderFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    buttonText: 'Shop Now',
    buttonLink: '/products',
    linkType: 'route',
    isActive: true,
    order: 0,
    bgColorStart: '#037dbc',
    bgColorEnd: '#075c89',
  });
  const [sliderImageFile, setSliderImageFile] = useState(null);
  const [sliderImagePreview, setSliderImagePreview] = useState(null);
  const [uploadingSliderImage, setUploadingSliderImage] = useState(false);

  useEffect(() => {
    dispatch(fetchSettings());
    fetchSliders();
  }, [dispatch]);

  // Slider management functions
  const fetchSliders = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/sliders`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setSliders(response.data.data);
    } catch (error) {
      console.error('Failed to fetch sliders:', error);
    } finally {
      setSliderLoading(false);
    }
  };

  const handleSliderImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSliderImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSliderImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadSliderImage = async () => {
    if (!sliderImageFile) return null;
    
    setUploadingSliderImage(true);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', sliderImageFile);
      
      const response = await axios.post(`${API_URL}/upload/single`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data.url;
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setUploadingSliderImage(false);
    }
  };

  const handleSliderSubmit = async (e) => {
    e.preventDefault();
    
    let imageUrl = sliderFormData.image;
    
    // Upload image if a new one is selected
    if (sliderImageFile) {
      const uploadedUrl = await uploadSliderImage();
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        return; // Stop if upload failed
      }
    }
    
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const sliderData = { ...sliderFormData, image: imageUrl };
      
      if (editingSlider) {
        await axios.put(`${API_URL}/sliders/${editingSlider._id}`, sliderData, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        toast.success('Slider updated successfully');
      } else {
        await axios.post(`${API_URL}/sliders`, sliderData, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        toast.success('Slider created successfully');
      }
      fetchSliders();
      setShowSliderModal(false);
      setEditingSlider(null);
      resetSliderForm();
    } catch (error) {
      console.error('Failed to save slider:', error);
      toast.error(error.response?.data?.message || 'Failed to save slider');
    }
  };

  const handleEditSlider = (slider) => {
    setEditingSlider(slider);
    setSliderFormData({
      title: slider.title,
      subtitle: slider.subtitle || '',
      description: slider.description || '',
      image: slider.image,
      buttonText: slider.buttonText || 'Shop Now',
      buttonLink: slider.buttonLink || '/products',
      linkType: slider.linkType || 'route',
      isActive: slider.isActive,
      order: slider.order || 0,
      bgColorStart: slider.bgColorStart || '#037dbc',
      bgColorEnd: slider.bgColorEnd || '#075c89',
    });
    setSliderImagePreview(slider.image);
    setSliderImageFile(null);
    setShowSliderModal(true);
  };

  const handleDeleteSlider = async (id) => {
    if (window.confirm('Delete this slider?')) {
      try {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        await axios.delete(`${API_URL}/sliders/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        toast.success('Slider deleted successfully');
        fetchSliders();
      } catch (error) {
        console.error('Failed to delete slider:', error);
        toast.error('Failed to delete slider');
      }
    }
  };

  const handleToggleSliderStatus = async (id) => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      await axios.put(`${API_URL}/sliders/${id}/toggle`, {}, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchSliders();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleMoveSliderUp = async (id, currentOrder) => {
    if (currentOrder <= 0) return;
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      await axios.put(`${API_URL}/sliders/${id}/order`, 
        { order: currentOrder - 1 },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      fetchSliders();
    } catch (error) {
      console.error('Failed to move slider:', error);
    }
  };

  const handleMoveSliderDown = async (id, currentOrder) => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      await axios.put(`${API_URL}/sliders/${id}/order`, 
        { order: currentOrder + 1 },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      fetchSliders();
    } catch (error) {
      console.error('Failed to move slider:', error);
    }
  };

  const resetSliderForm = () => {
    setSliderFormData({
      title: '',
      subtitle: '',
      description: '',
      image: '',
      buttonText: 'Shop Now',
      buttonLink: '/products',
      linkType: 'route',
      isActive: true,
      order: sliders.length,
      bgColorStart: '#037dbc',
      bgColorEnd: '#075c89',
    });
    setSliderImageFile(null);
    setSliderImagePreview(null);
  };

  useEffect(() => {
    if (settings) {
      setFormData({
        siteName: settings.siteName || '',
        siteTagline: settings.siteTagline || '',
        siteDescription: settings.siteDescription || '',
        contactEmail: settings.contactEmail || '',
        contactPhone: settings.contactPhone || '',
        contactPhoneSecondary: settings.contactPhoneSecondary || '',
        address: settings.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'Bangladesh',
        },
        socialMedia: settings.socialMedia || {
          facebook: '',
          twitter: '',
          instagram: '',
          linkedin: '',
          youtube: '',
        },
        shipping: settings.shipping || {
          freeShippingThreshold: 1000,
          shippingFee: 60,
          estimatedDeliveryDays: '3-7 business days',
        },
        returnPolicy: settings.returnPolicy || '7 days return policy',
        currency: settings.currency || 'BDT',
        currencySymbol: settings.currencySymbol || '৳',
      });
    }
  }, [settings]);

  const handleChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(saveSettings(formData));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);

    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      await axios.put(`${API_URL}/auth/updatepassword`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      toast.success('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Failed to update password:', error);
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: FiSettings },
    { id: 'contact', label: 'Contact Info', icon: FiMail },
    { id: 'address', label: 'Address', icon: FiMapPin },
    { id: 'social', label: 'Social Media', icon: FiGlobe },
    { id: 'shipping', label: 'Shipping', icon: FiTruck },
    { id: 'sliders', label: 'Hero Sliders', icon: FiImage },
    { id: 'password', label: 'Change Password', icon: FiLock },
  ];

  if (loading && !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Website Settings</h1>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Tabs Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
           
          </div>
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-3">
          <div className="card p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">General Information</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                  <input
                    type="text"
                    value={formData.siteName}
                    onChange={(e) => handleChange(null, 'siteName', e.target.value)}
                    className="input-field"
                    placeholder="ElectroMart"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Tagline</label>
                  <input
                    type="text"
                    value={formData.siteTagline}
                    onChange={(e) => handleChange(null, 'siteTagline', e.target.value)}
                    className="input-field"
                    placeholder="Your One-Stop Electronics Store"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                  <textarea
                    value={formData.siteDescription}
                    onChange={(e) => handleChange(null, 'siteDescription', e.target.value)}
                    rows={4}
                    className="input-field"
                    placeholder="Describe your website..."
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <input
                      type="text"
                      value={formData.currency}
                      onChange={(e) => handleChange(null, 'currency', e.target.value)}
                      className="input-field"
                      placeholder="BDT"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency Symbol</label>
                    <input
                      type="text"
                      value={formData.currencySymbol}
                      onChange={(e) => handleChange(null, 'currencySymbol', e.target.value)}
                      className="input-field"
                      placeholder="৳"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Return Policy</label>
                  <textarea
                    value={formData.returnPolicy}
                    onChange={(e) => handleChange(null, 'returnPolicy', e.target.value)}
                    rows={3}
                    className="input-field"
                  />
                </div>
                <div className="mt-6 pt-6 border-t">
                  <button type="submit" className="btn-primary flex items-center gap-2">
                    <FiSave className="w-5 h-5" />
                    Save Settings
                  </button>
                </div>
              </form>
            )}

            {/* Contact Settings */}
            {activeTab === 'contact' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleChange(null, 'contactEmail', e.target.value)}
                    className="input-field"
                    placeholder="info@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Phone</label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => handleChange(null, 'contactPhone', e.target.value)}
                    className="input-field"
                    placeholder="+880-123-456-7890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Phone</label>
                  <input
                    type="tel"
                    value={formData.contactPhoneSecondary}
                    onChange={(e) => handleChange(null, 'contactPhoneSecondary', e.target.value)}
                    className="input-field"
                    placeholder="+880-123-456-7890"
                  />
                </div>
                <div className="mt-6 pt-6 border-t">
                  <button type="submit" className="btn-primary flex items-center gap-2">
                    <FiSave className="w-5 h-5" />
                    Save Settings
                  </button>
                </div>
              </form>
            )}

            {/* Address Settings */}
            {activeTab === 'address' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">Business Address</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => handleChange('address', 'street', e.target.value)}
                    className="input-field"
                    placeholder="House 123, Road 45"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => handleChange('address', 'city', e.target.value)}
                      className="input-field"
                      placeholder="Dhaka"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State/Division</label>
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) => handleChange('address', 'state', e.target.value)}
                      className="input-field"
                      placeholder="Dhaka"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={formData.address.zipCode}
                      onChange={(e) => handleChange('address', 'zipCode', e.target.value)}
                      className="input-field"
                      placeholder="1200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      value={formData.address.country}
                      onChange={(e) => handleChange('address', 'country', e.target.value)}
                      className="input-field"
                      placeholder="Bangladesh"
                    />
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t">
                  <button type="submit" className="btn-primary flex items-center gap-2">
                    <FiSave className="w-5 h-5" />
                    Save Settings
                  </button>
                </div>
              </form>
            )}

            {/* Social Media Settings */}
            {activeTab === 'social' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">Social Media Links</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facebook URL</label>
                  <input
                    type="url"
                    value={formData.socialMedia.facebook}
                    onChange={(e) => handleChange('socialMedia', 'facebook', e.target.value)}
                    className="input-field"
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Twitter URL</label>
                  <input
                    type="url"
                    value={formData.socialMedia.twitter}
                    onChange={(e) => handleChange('socialMedia', 'twitter', e.target.value)}
                    className="input-field"
                    placeholder="https://twitter.com/yourprofile"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label>
                  <input
                    type="url"
                    value={formData.socialMedia.instagram}
                    onChange={(e) => handleChange('socialMedia', 'instagram', e.target.value)}
                    className="input-field"
                    placeholder="https://instagram.com/yourprofile"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
                  <input
                    type="url"
                    value={formData.socialMedia.linkedin}
                    onChange={(e) => handleChange('socialMedia', 'linkedin', e.target.value)}
                    className="input-field"
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL</label>
                  <input
                    type="url"
                    value={formData.socialMedia.youtube}
                    onChange={(e) => handleChange('socialMedia', 'youtube', e.target.value)}
                    className="input-field"
                    placeholder="https://youtube.com/yourchannel"
                  />
                </div>
                <div className="mt-6 pt-6 border-t">
                  <button type="submit" className="btn-primary flex items-center gap-2">
                    <FiSave className="w-5 h-5" />
                    Save Settings
                  </button>
                </div>
              </form>
            )}

            {/* Shipping Settings */}
            {activeTab === 'shipping' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Free Shipping Threshold (৳)</label>
                  <input
                    type="number"
                    value={formData.shipping.freeShippingThreshold}
                    onChange={(e) => handleChange('shipping', 'freeShippingThreshold', Number(e.target.value))}
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">Orders above this amount get free shipping</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dhaka Shipping Fee (৳)</label>
                    <input
                      type="number"
                      value={formData.shipping.dhakaShippingFee}
                      onChange={(e) => handleChange('shipping', 'dhakaShippingFee', Number(e.target.value))}
                      className="input-field"
                    />
                    <p className="text-xs text-gray-500 mt-1">Shipping fee for Dhaka city</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Others Shipping Fee (৳)</label>
                    <input
                      type="number"
                      value={formData.shipping.othersShippingFee}
                      onChange={(e) => handleChange('shipping', 'othersShippingFee', Number(e.target.value))}
                      className="input-field"
                    />
                    <p className="text-xs text-gray-500 mt-1">Shipping fee for other cities</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Delivery Time</label>
                  <input
                    type="text"
                    value={formData.shipping.estimatedDeliveryDays}
                    onChange={(e) => handleChange('shipping', 'estimatedDeliveryDays', e.target.value)}
                    className="input-field"
                    placeholder="3-7 business days"
                  />
                </div>
                <div className="mt-6 pt-6 border-t">
                  <button type="submit" className="btn-primary flex items-center gap-2">
                    <FiSave className="w-5 h-5" />
                    Save Settings
                  </button>
                </div>
              </form>
            )}

            {/* Hero Sliders Settings */}
            {activeTab === 'sliders' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Hero Slider Management</h2>
                  <button 
                    onClick={() => { resetSliderForm(); setEditingSlider(null); setShowSliderModal(true); }} 
                    className="btn-primary flex items-center gap-2"
                  >
                    <FiPlus className="w-5 h-5" />
                    Add Slider
                  </button>
                </div>

                {sliderLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                  </div>
                ) : sliders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FiImage className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No sliders created yet. Click "Add Slider" to create one.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sliders.map((slider, index) => (
                      <div key={slider._id} className={`card p-4 ${!slider.isActive ? 'opacity-50' : ''}`}>
                        <div className="flex items-center gap-4">
                          {/* Order Controls */}
                          <div className="flex flex-col gap-1">
                            <button 
                              onClick={() => handleMoveSliderUp(slider._id, slider.order)}
                              disabled={slider.order === 0}
                              className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                            >
                              <FiArrowUp className="w-4 h-4" />
                            </button>
                            <span className="text-xs text-center font-medium">{slider.order}</span>
                            <button 
                              onClick={() => handleMoveSliderDown(slider._id, slider.order)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <FiArrowDown className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Image Preview */}
                          <div
                            className="w-32 h-20 rounded bg-cover bg-center"
                            style={{ backgroundImage: `url(${getImageUrl(slider.image)})` }}
                          />

                          {/* Content */}
                          <div className="flex-1">
                            <h3 className="font-semibold">{slider.title}</h3>
                            {slider.subtitle && <p className="text-sm text-gray-600">{slider.subtitle}</p>}
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>Button: {slider.buttonText}</span>
                              <span>Link: {slider.buttonLink}</span>
                            </div>
                          </div>

                          {/* Status Toggle */}
                          <button
                            onClick={() => handleToggleSliderStatus(slider._id)}
                            className={`flex items-center gap-2 px-3 py-1 rounded ${
                              slider.isActive ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-50'
                            }`}
                          >
                            {slider.isActive ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                            <span className="text-sm">{slider.isActive ? 'Active' : 'Inactive'}</span>
                          </button>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEditSlider(slider)} 
                              className="p-2 hover:bg-gray-200 rounded"
                              title="Edit"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteSlider(slider._id)} 
                              className="p-2 hover:bg-red-100 text-red-600 rounded"
                              title="Delete"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Change Password */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">Change Password</h2>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This will change the password for your account ({user?.name}). 
                    Make sure to remember your new password.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="input-field pr-10"
                      placeholder="Enter your current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showCurrentPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="input-field pr-10"
                      placeholder="Enter new password (min 6 characters)"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showNewPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="input-field pr-10"
                      placeholder="Confirm your new password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t">
                  <button 
                    type="submit" 
                    disabled={passwordLoading}
                    className="btn-primary flex items-center gap-2"
                  >
                    <FiLock className="w-5 h-5" />
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Slider Modal */}
      {showSliderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="card w-full max-w-2xl my-8">
            <h2 className="text-xl font-bold mb-4">{editingSlider ? 'Edit' : 'Add'} Slider</h2>
            <form onSubmit={handleSliderSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={sliderFormData.title}
                  onChange={(e) => setSliderFormData({ ...sliderFormData, title: e.target.value })}
                  className="input-field"
                  required
                  placeholder="Discover the Latest in Electronics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                <input
                  type="text"
                  value={sliderFormData.subtitle}
                  onChange={(e) => setSliderFormData({ ...sliderFormData, subtitle: e.target.value })}
                  className="input-field"
                  placeholder="Shop premium gadgets at unbeatable prices"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={sliderFormData.description}
                  onChange={(e) => setSliderFormData({ ...sliderFormData, description: e.target.value })}
                  rows={3}
                  className="input-field"
                  placeholder="Additional description text..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slider Image *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {sliderImagePreview ? (
                    <div className="space-y-4">
                      <img 
                        src={sliderImagePreview} 
                        alt="Slider preview" 
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSliderImageFile(null);
                          setSliderImagePreview(null);
                          setSliderFormData({ ...sliderFormData, image: '' });
                        }}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove image
                      </button>
                    </div>
                  ) : (
                    <div>
                      <FiUpload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSliderImageChange}
                        className="hidden"
                        id="slider-image-upload"
                      />
                      <label
                        htmlFor="slider-image-upload"
                        className="inline-block mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg cursor-pointer hover:bg-primary-700"
                      >
                        Upload Image
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                  <input
                    type="text"
                    value={sliderFormData.buttonText}
                    onChange={(e) => setSliderFormData({ ...sliderFormData, buttonText: e.target.value })}
                    className="input-field"
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Button Link</label>
                  <input
                    type="text"
                    value={sliderFormData.buttonLink}
                    onChange={(e) => setSliderFormData({ ...sliderFormData, buttonLink: e.target.value })}
                    className="input-field"
                    placeholder="/products or https://example.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Link Type</label>
                  <select
                    value={sliderFormData.linkType}
                    onChange={(e) => setSliderFormData({ ...sliderFormData, linkType: e.target.value })}
                    className="input-field"
                  >
                    <option value="route">Internal Route</option>
                    <option value="url">External URL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                  <input
                    type="number"
                    value={sliderFormData.order}
                    onChange={(e) => setSliderFormData({ ...sliderFormData, order: Number(e.target.value) })}
                    className="input-field"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background Gradient Start</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={sliderFormData.bgColorStart}
                      onChange={(e) => setSliderFormData({ ...sliderFormData, bgColorStart: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={sliderFormData.bgColorStart}
                      onChange={(e) => setSliderFormData({ ...sliderFormData, bgColorStart: e.target.value })}
                      className="input-field flex-1"
                      placeholder="#037dbc"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background Gradient End</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={sliderFormData.bgColorEnd}
                      onChange={(e) => setSliderFormData({ ...sliderFormData, bgColorEnd: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={sliderFormData.bgColorEnd}
                      onChange={(e) => setSliderFormData({ ...sliderFormData, bgColorEnd: e.target.value })}
                      className="input-field flex-1"
                      placeholder="#075c89"
                    />
                  </div>
                </div>
              </div>

              {/* Gradient Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gradient Preview</label>
                <div 
                  className="h-16 rounded-lg"
                  style={{
                    background: `linear-gradient(to right, ${sliderFormData.bgColorStart}, ${sliderFormData.bgColorEnd})`
                  }}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sliderFormData.isActive}
                  onChange={(e) => setSliderFormData({ ...sliderFormData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Active</span>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button 
                  type="submit" 
                  disabled={uploadingSliderImage}
                  className="btn-primary flex-1"
                >
                  {uploadingSliderImage ? 'Uploading...' : editingSlider ? 'Update' : 'Create'} Slider
                </button>
                <button 
                  type="button" 
                  onClick={() => { setShowSliderModal(false); setEditingSlider(null); resetSliderForm(); }} 
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
