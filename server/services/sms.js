import axios from 'axios';
import config from '../config/config.js';
import Settings from '../models/Settings.js';

class SMSService {
  constructor() {
    this.sslWireless = config.sms.sslWireless;
    this.bulkSmsBd = config.sms.bulkSmsBd;
    this.dbSettings = null;
  }

  // Fetch SMS settings from database (Admin controlled)
  async getDBSettings() {
    if (!this.dbSettings) {
      try {
        const settings = await Settings.findOne();
        if (settings?.bulkSMSBD) {
          this.dbSettings = settings.bulkSMSBD;
        }
      } catch (error) {
        console.error('❌ Failed to fetch SMS settings from DB:', error);
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
        console.warn('⚠️ SSL Wireless API credentials not configured');
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
      console.error('❌ SSL Wireless SMS Error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data || error.message,
      };
    }
  }

  // Send SMS using BulkSMSBD (Dynamically reads from DB)
  async sendBulkSMSBD(phone, message) {
    try {
      // Always read from database first (Admin controlled settings)
      this.clearSettingsCache();
      const dbSettings = await this.getDBSettings();

      // If DB has no settings, fallback to .env
      const apiKey = dbSettings?.apiKey || this.bulkSmsBd.apiKey;
      const senderId = dbSettings?.senderId || this.bulkSmsBd.senderId || 'INFO';
      const isEnabled = dbSettings?.isEnabled !== undefined ? dbSettings.isEnabled : true;

      console.log('📱 SMS Debug - DB Settings:', JSON.stringify(dbSettings));
      console.log('📱 SMS Debug - ENV API Key:', this.bulkSmsBd.apiKey ? 'SET' : 'EMPTY');
      console.log('📱 SMS Debug - Using API Key:', apiKey ? apiKey.substring(0, 10) + '...' : 'NONE');
      console.log('📱 SMS Debug - Sender ID:', senderId);
      console.log('📱 SMS Debug - Enabled:', isEnabled);

      if (!apiKey) {
        console.error('❌ BulkSMSBD: No API key found in DB or .env');
        console.log('ℹ️ Please configure SMS in Admin Dashboard → Settings → Bulk SMS');
        return { success: false, message: 'SMS API key not configured' };
      }

      if (!isEnabled) {
        console.log('⚠️ BulkSMSBD: Service is disabled in settings');
        return { success: false, message: 'SMS service is disabled' };
      }

      const formattedPhone = this.formatPhoneNumber(phone);
      console.log('📱 Sending SMS to:', formattedPhone);
      console.log('📱 Message:', message);

      const url = 'https://bulksmsbd.net/api/smsapi';

      // Attempt 1: POST with JSON
      try {
        console.log('📤 Attempt 1: POST with JSON');
        const requestBody = {
          api_key: apiKey,
          senderid: senderId,
          number: formattedPhone,
          message: message,
        };

        const response = await axios.post(url, requestBody, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000,
        });

        console.log('📥 Response:', JSON.stringify(response.data));

        const isSuccess = response.data?.response_code === 'success' ||
                          response.data?.status === 'success' ||
                          String(response.data?.message || '').toLowerCase().includes('success');

        if (isSuccess) {
          console.log('✅ SMS sent successfully via POST');
          return {
            success: true,
            messageId: response.data?.message_id || response.data?.sms_id || Date.now().toString(),
            status: response.data?.response_code || response.data?.status,
          };
        }
      } catch (postError) {
        console.log('⚠️ POST failed, trying GET:', postError.message);
      }

      // Attempt 2: GET with query params
      try {
        console.log('📤 Attempt 2: GET with params');
        const params = new URLSearchParams({
          api_key: apiKey,
          senderid: senderId,
          number: formattedPhone,
          message: message,
        });

        const getResponse = await axios.get(`${url}?${params.toString()}`, {
          timeout: 15000,
        });

        console.log('📥 GET Response:', JSON.stringify(getResponse.data));

        const isSuccess = getResponse.data?.response_code === 'success' ||
                          getResponse.data?.status === 'success';

        if (isSuccess) {
          console.log('✅ SMS sent successfully via GET');
          return {
            success: true,
            messageId: getResponse.data?.message_id || Date.now().toString(),
            status: getResponse.data?.response_code || getResponse.data?.status,
          };
        }
      } catch (getError) {
        console.error('❌ GET failed:', getError.message);
      }

      console.error('❌ All SMS sending attempts failed');
      return { success: false, message: 'Failed to send SMS' };
    } catch (error) {
      console.error('❌ BulkSMSBD Error:', error.message);
      return { success: false, message: error.message };
    }
  }

  // Send SMS with provider selection
  async sendSMS(phone, message, provider = 'bulk') {
    if (provider === 'bulk') {
      return await this.sendBulkSMSBD(phone, message);
    }
    return await this.sendSSLWireless(phone, message);
  }

  // Order confirmation SMS template (max 159 chars)
  getOrderConfirmationSMS(order) {
    const trackLink = `${config.clientUrl}/order-tracking`;
    const msg = `Gadgets Lagbe Order Confirmed!\nOrder: ${order.orderNumber}\nAmount: ৳${order.totalPrice}\nTrack: ${trackLink}/${order.orderNumber}`;
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
