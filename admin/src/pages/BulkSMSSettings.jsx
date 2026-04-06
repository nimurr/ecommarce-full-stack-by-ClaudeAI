import { useEffect, useState } from 'react';
import { FiSave, FiEye, FiEyeOff } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BulkSMSSettings = () => {
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [formData, setFormData] = useState({
    apiKey: '',
    senderId: '',
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
      const { bulkSMSBD } = response.data.data;
      if (bulkSMSBD) {
        setFormData({
          apiKey: bulkSMSBD.apiKey || '',
          senderId: bulkSMSBD.senderId || '',
          isEnabled: bulkSMSBD.isEnabled || false,
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
      await axios.put(`${API_URL}/settings/bulk-sms`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      toast.success('BulkSMSBD settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">BulkSMSBD SMS Settings</h1>

      <div className="card">
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">📱 How to Get Your BulkSMSBD API Key</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Go to <a href="https://bulksmsbd.net/" target="_blank" rel="noopener noreferrer" className="underline">BulkSMSBD</a></li>
            <li>Sign up or login to your account</li>
            <li>Go to Developer/API section</li>
            <li>Copy your API Key</li>
            <li>Set your Sender ID (approved by BulkSMSBD)</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key *
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                className="input-field pr-10"
                placeholder="Enter your BulkSMSBD API key"
                required
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showApiKey ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Found in your BulkSMSBD dashboard under Developer/API
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sender ID *
            </label>
            <input
              type="text"
              value={formData.senderId}
              onChange={(e) => setFormData({ ...formData, senderId: e.target.value })}
              className="input-field"
              placeholder="8809648907593 or your approved sender ID"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Your approved sender ID from BulkSMSBD
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
              <span className="text-sm font-medium">Enable BulkSMSBD SMS Service</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              When enabled, SMS will be sent for order confirmations and status updates
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
        <h3 className="font-semibold mb-4">🧪 SMS Service Information</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">When SMS are sent:</h4>
            <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
              <li><strong>Order Placed</strong> - Order confirmation with details</li>
              <li><strong>Order Confirmed</strong> - Status update notification</li>
              <li><strong>Order Shipped</strong> - Shipping notification</li>
              <li><strong>Order Delivered</strong> - Delivery confirmation</li>
              <li><strong>Order Cancelled</strong> - Cancellation notification</li>
            </ul>
          </div>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium mb-2 text-yellow-900">⚠️ Important:</h4>
            <p className="text-sm text-yellow-800">
              Make sure your BulkSMSBD account has sufficient balance. SMS will only be sent if the service is enabled and API key is valid.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkSMSSettings;
