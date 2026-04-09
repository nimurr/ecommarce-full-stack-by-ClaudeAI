import axios from 'axios';
import config from '../config/config.js';
import Settings from '../models/Settings.js';

class SMSService {
  constructor() {
    this.sslWireless = config.sms.sslWireless;
    this.bulkSmsBd = config.sms.bulkSmsBd;
    this.dbSettings = null;
  }

  // Fetch SMS settings from database
  async getDBSettings() {
    if (!this.dbSettings) {
      try {
        const settings = await Settings.findOne();
        if (settings?.bulkSMSBD) {
          this.dbSettings = settings.bulkSMSBD;
        }
      } catch (error) {
        console.error('Failed to fetch SMS settings from DB:', error);
      }
    }
    return this.dbSettings;
  }

  // Clear cached settings (call after admin updates)
  clearSettingsCache() {
    this.dbSettings = null;
  }

  // Format phone number (remove leading 0, add 880)
  formatPhoneNumber(phone) {
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '880' + cleaned.substring(1);
    }
    if (!cleaned.startsWith('+') && !cleaned.startsWith('880')) {
      cleaned = '880' + cleaned;
    }
    return cleaned;
  }

  // Send SMS using SSL Wireless
  async sendSSLWireless(phone, message) {
    try {
      if (!this.sslWireless.apiKey || !this.sslWireless.apiSecret) {
        console.warn('SSL Wireless API credentials not configured');
        return { success: false, message: 'SMS credentials not configured' };
      }

      const formattedPhone = this.formatPhoneNumber(phone);

      const params = {
        api_key: this.sslWireless.apiKey,
        api_secret: this.sslWireless.apiSecret,
        sid: this.sslWireless.sid || 'COMPANY',
        msisdn: formattedPhone,
        sms: message,
        csms_id: Date.now().toString(),
      };

      const response = await axios.post(
        this.sslWireless.baseUrl,
        new URLSearchParams(params),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return {
        success: response.data?.status === '202' || response.data?.status === 'OK',
        messageId: response.data?.message_id,
        status: response.data?.status,
      };
    } catch (error) {
      console.error('SSL Wireless SMS Error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data || error.message,
      };
    }
  }

  // Send SMS using BulkSMSBD
  async sendBulkSMSBD(phone, message) {
    try {
      // Get settings from database first, fallback to .env
      const dbSettings = await this.getDBSettings();

      const apiKey = dbSettings?.apiKey || this.bulkSmsBd.apiKey;
      const senderId = dbSettings?.senderId || this.bulkSmsBd.senderId || 'INFO';
      const isEnabled = dbSettings?.isEnabled !== undefined ? dbSettings.isEnabled : true;

      if (!apiKey) {
        console.warn('BulkSMSBD API credentials not configured');
        return { success: false, message: 'SMS credentials not configured' };
      }

      if (!isEnabled) {
        console.log('BulkSMSBD is disabled in settings');
        return { success: false, message: 'SMS service is disabled' };
      }

      const formattedPhone = this.formatPhoneNumber(phone);

      // BulkSMSBD API endpoint - using GET request with query params (official method)
      const url = `https://bulksmsbd.net/api/smsapi`;
      
      const params = new URLSearchParams({
        api_key: apiKey,
        senderid: senderId,
        number: formattedPhone,
        message: message,
      });

      console.log('📱 Sending BulkSMSBD SMS to:', formattedPhone);
      console.log('📝 Message:', message);
      console.log('🔑 API Key:', apiKey.substring(0, 10) + '...');
      console.log('📤 Sender ID:', senderId);
      console.log('🌐 URL:', `${url}?${params.toString()}`);

      // Try GET request first (official BulkSMSBD method)
      const response = await axios.get(`${url}?${params.toString()}`);

      console.log('✅ BulkSMSBD Response:', response.data);

      // Check response - BulkSMSBD returns: {"response_code":"success","message":"Successfully sent"}
      const isSuccess = response.data?.response_code === 'success' || 
                        response.data?.status === 'success' ||
                        String(response.data?.message || '').toLowerCase().includes('success');

      if (!isSuccess) {
        console.error('❌ BulkSMSBD failed:', response.data);
      }

      return {
        success: isSuccess,
        messageId: response.data?.message_id || response.data?.sms_id || Date.now().toString(),
        status: response.data?.response_code || response.data?.status,
        message: response.data?.message,
      };
    } catch (error) {
      console.error('❌ BulkSMSBD Error:', error.response?.data || error.message);
      
      // Try fallback: POST with form data
      try {
        console.log('🔄 Trying BulkSMSBD fallback (POST)...');
        
        const dbSettings = await this.getDBSettings();
        const apiKey = dbSettings?.apiKey || this.bulkSmsBd.apiKey;
        const senderId = dbSettings?.senderId || this.bulkSmsBd.senderId || 'INFO';
        const formattedPhone = this.formatPhoneNumber(phone);
        
        const url = `https://bulksmsbd.net/api/smsapi`;
        
        const formData = new URLSearchParams({
          api_key: apiKey,
          senderid: senderId,
          number: formattedPhone,
          message: message,
        });

        const response = await axios.post(url, formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        console.log('✅ BulkSMSBD Fallback Response:', response.data);

        const isSuccess = response.data?.response_code === 'success' || 
                          response.data?.status === 'success';

        return {
          success: isSuccess,
          messageId: response.data?.message_id || Date.now().toString(),
          status: response.data?.response_code || response.data?.status,
          message: response.data?.message,
        };
      } catch (fallbackError) {
        console.error('❌ BulkSMSBD Fallback Error:', fallbackError.response?.data || fallbackError.message);
        return {
          success: false,
          message: fallbackError.response?.data?.message || fallbackError.message,
        };
      }
    }
  }

  // Send SMS with fallback
  async sendSMS(phone, message, provider = 'ssl') {
    if (provider === 'bulk') {
      return await this.sendBulkSMSBD(phone, message);
    }
    return await this.sendSSLWireless(phone, message);
  }

  // Order confirmation SMS template (max 159 chars)
  getOrderConfirmationSMS(order) {
    const trackLink = `${config.clientUrl}/order-tracking`;
    const msg = `Gadgets Lagbe Order Confirmed! \nAddress: ${order.shippingAddress.address}
    \nTrack: ${trackLink + '/' + order.orderNumber}`;

    // Truncate to 159 characters if needed
    return msg.length > 159 ? msg.substring(0, 156) + '...' : msg;
  }

  // Order status update SMS template (max 159 chars)
  getOrderStatusSMS(order, status) {
    const trackLink = `${config.clientUrl}/order-tracking`;

    const statusMessages = {
      'Confirmed': `Order #${order.orderNumber} confirmed!\nAmount: ৳${order.totalPrice}\nTrack: ${trackLink}`,
      'Processing': `Order #${order.orderNumber} is being processed.\nTrack: ${trackLink}`,
      'Shipped': `Order #${order.orderNumber} shipped! 🚚\nTrack: ${trackLink}`,
      'Out for Delivery': `Order #${order.orderNumber} out for delivery today! 📦\nTrack: ${trackLink}`,
      'Delivered': `Order #${order.orderNumber} delivered! ✅\nThank you for shopping with us!\nTrack: ${trackLink}`,
      'Cancelled': `Order #${order.orderNumber} cancelled.\nPlease contact support for assistance.\nTrack: ${trackLink}`,
    };

    const msg = statusMessages[status] || `Order #${order.orderNumber}: ${status}\nTrack: ${trackLink}`;

    // Truncate to 159 characters if needed
    return msg.length > 159 ? msg.substring(0, 156) + '...' : msg;
  }

  // OTP SMS template
  getOTPSMS(otp) {
    return `Your verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
  }

  // Password reset SMS template
  getPasswordResetSMS(otp) {
    return `Your password reset code is: ${otp}. Valid for 10 minutes. If you didn't request this, please ignore.`;
  }
}

export default new SMSService();
