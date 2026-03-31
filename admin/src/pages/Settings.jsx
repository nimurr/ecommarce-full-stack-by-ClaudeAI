import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSettings, saveSettings } from '../store/slices/settingsSlice';
import { FiSave, FiMail, FiPhone, FiMapPin, FiClock, FiTruck, FiSettings, FiGlobe } from 'react-icons/fi';

const Settings = () => {
  const dispatch = useDispatch();
  const { settings, loading } = useSelector((state) => state.settings);
  const [activeTab, setActiveTab] = useState('general');
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

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

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

  const tabs = [
    { id: 'general', label: 'General', icon: FiSettings },
    { id: 'contact', label: 'Contact Info', icon: FiMail },
    { id: 'address', label: 'Address', icon: FiMapPin },
    { id: 'social', label: 'Social Media', icon: FiGlobe },
    { id: 'shipping', label: 'Shipping', icon: FiTruck },
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

      <form onSubmit={handleSubmit}>
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
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
                <div className="space-y-4">
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
                </div>
              )}

              {/* Contact Settings */}
              {activeTab === 'contact' && (
                <div className="space-y-4">
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
                </div>
              )}

              {/* Address Settings */}
              {activeTab === 'address' && (
                <div className="space-y-4">
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
                </div>
              )}

              {/* Social Media Settings */}
              {activeTab === 'social' && (
                <div className="space-y-4">
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
                </div>
              )}

              {/* Shipping Settings */}
              {activeTab === 'shipping' && (
                <div className="space-y-4">
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
                </div>
              )}

              {/* Save Button */}
              <div className="mt-6 pt-6 border-t">
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <FiSave className="w-5 h-5" />
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;
