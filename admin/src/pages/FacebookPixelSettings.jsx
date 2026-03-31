import { useEffect, useState } from 'react';
import { FiEye, FiEyeOff, FiSave } from 'react-icons/fi';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const FacebookPixelSettings = () => {
  const [loading, setLoading] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [formData, setFormData] = useState({
    pixelId: '',
    accessToken: '',
    isEnabled: false,
  });

  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/settings`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const { facebookPixel } = response.data.data;
      if (facebookPixel) {
        setFormData({
          pixelId: facebookPixel.pixelId || '',
          accessToken: facebookPixel.accessToken || '',
          isEnabled: facebookPixel.isEnabled || false,
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`${API_URL}/settings/facebook-pixel`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      alert('Facebook Pixel settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Facebook Pixel Settings</h1>

      <div className="card">
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">📊 How to Get Your Facebook Pixel ID</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Go to <a href="https://www.facebook.com/events_manager" target="_blank" rel="noopener noreferrer" className="underline">Facebook Events Manager</a></li>
            <li>Click on "Add Data Source" → "Web" → "Facebook Pixel"</li>
            <li>Follow the setup wizard to create your pixel</li>
            <li>Copy your Pixel ID (looks like: 123456789012345)</li>
            <li>Generate Access Token from Settings → Generated Tokens</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facebook Pixel ID *
            </label>
            <input
              type="text"
              value={formData.pixelId}
              onChange={(e) => setFormData({ ...formData, pixelId: e.target.value })}
              className="input-field"
              placeholder="123456789012345"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Found in Facebook Events Manager
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Token *
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={formData.accessToken}
                onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                className="input-field pr-10"
                placeholder="Your access token"
                required
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showToken ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Generate from Events Manager → Settings → Generated Tokens
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isEnabled}
                onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Enable Facebook Pixel</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              When enabled, pixel will track page views, add to cart, and purchases
            </p>
          </div>

          <div className="flex gap-2 pt-4 border-t justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              <FiSave className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Testing Section */}
      <div className="card mt-6">
        <h3 className="font-semibold mb-4">🧪 Test Your Pixel</h3>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            After saving, install the <a href="https://www.facebook.com/ads/manager/pixel/facebook_pixel" target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">Facebook Pixel Helper</a> Chrome extension to verify your pixel is working correctly.
          </p>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Events Tracked:</h4>
            <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
              <li><strong>PageView</strong> - Automatically on every page</li>
              <li><strong>ViewContent</strong> - When viewing a product</li>
              <li><strong>AddToCart</strong> - When adding product to cart</li>
              <li><strong>InitiateCheckout</strong> - When starting checkout</li>
              <li><strong>Purchase</strong> - When order is completed (server-side)</li>
              <li><strong>CompleteRegistration</strong> - When user registers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacebookPixelSettings;
