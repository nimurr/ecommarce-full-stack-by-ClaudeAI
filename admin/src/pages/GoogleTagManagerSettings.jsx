import { useEffect, useState } from 'react';
import { FiSave, FiEye, FiEyeOff } from 'react-icons/fi';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const GoogleTagManagerSettings = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    trackingId: '',
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
      const { googleTagManager } = response.data.data;
      if (googleTagManager) {
        setFormData({
          trackingId: googleTagManager.trackingId || '',
          isEnabled: googleTagManager.isEnabled || false,
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
      await axios.put(`${API_URL}/settings/google-tag-manager`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      alert('Google Tag Manager settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Google Tag Manager Settings</h1>

      <div className="card">
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">📊 How to Get Your GTM ID</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Go to <a href="https://tagmanager.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Tag Manager</a></li>
            <li>Click "Create Account"</li>
            <li>Enter account name (e.g., "ElectroMart")</li>
            <li>Set container name to your website name</li>
            <li>Select "Web" as target platform</li>
            <li>Click "Create"</li>
            <li>Copy your GTM ID (looks like: GTM-XXXXXXX)</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Tag Manager ID *
            </label>
            <input
              type="text"
              value={formData.trackingId}
              onChange={(e) => setFormData({ ...formData, trackingId: e.target.value })}
              className="input-field"
              placeholder="GTM-XXXXXXX"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Found in your GTM workspace (top right corner)
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
              <span className="text-sm font-medium">Enable Google Tag Manager</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              When enabled, GTM will load on all pages
            </p>
          </div>

          <div className="flex gap-2 pt-4 border-t">
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
        <h3 className="font-semibold mb-4">🧪 Test Your GTM Setup</h3>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            After saving, install the <a href="https://chrome.google.com/webstore/detail/tag-assistant-by-google/kejbdjndbnbjgmefkgdddjlbokphdefk" target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">Tag Assistant</a> Chrome extension to verify your GTM is working correctly.
          </p>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">What GTM Tracks:</h4>
            <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
              <li><strong>Page Views</strong> - Automatically on every page</li>
              <li><strong>Clicks</strong> - Button clicks, link clicks</li>
              <li><strong>Form Submissions</strong> - Contact forms, checkout</li>
              <li><strong>E-commerce</strong> - Product views, add to cart, purchases</li>
              <li><strong>Custom Events</strong> - Any event you configure in GTM</li>
            </ul>
          </div>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium mb-2 text-yellow-900">⚠️ Important:</h4>
            <p className="text-sm text-yellow-800">
              After enabling GTM, you need to configure tags and triggers in your GTM workspace at <a href="https://tagmanager.google.com" target="_blank" rel="noopener noreferrer" className="underline">tagmanager.google.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleTagManagerSettings;
