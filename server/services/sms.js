import axios from 'axios';
import config from '../config/config.js';

class SMSService {
  constructor() {
    this.sslWireless = config.sms.sslWireless;
    this.bulkSmsBd = config.sms.bulkSmsBd;
  }

  // Send SMS using SSL Wireless
  async sendSSLWireless(phone, message) {
    try {
      if (!this.sslWireless.apiKey || !this.sslWireless.apiSecret) {
        console.warn('SSL Wireless API credentials not configured');
        return null;
      }

      // Format phone number (remove leading 0, add 880)
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
      if (!this.bulkSmsBd.apiKey) {
        console.warn('BulkSMSBD API credentials not configured');
        return null;
      }

      const formattedPhone = this.formatPhoneNumber(phone);

      const params = {
        api_key: this.bulkSmsBd.apiKey,
        type: 'text',
        contacts: formattedPhone,
        senderid: this.bulkSmsBd.senderId,
        msg: message,
      };

      const response = await axios.post(
        'https://api.bulksmsbd.com/api/sms/send',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return {
        success: response.data?.status === 'success',
        messageId: response.data?.data?.message_id,
        status: response.data?.status,
      };
    } catch (error) {
      console.error('BulkSMSBD Error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data || error.message,
      };
    }
  }

  // Send SMS with fallback
  async sendSMS(phone, message, provider = 'ssl') {
    if (provider === 'bulk') {
      return await this.sendBulkSMSBD(phone, message);
    }
    return await this.sendSSLWireless(phone, message);
  }

  // Format phone number
  formatPhoneNumber(phone) {
    // Remove spaces, dashes, and parentheses
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    // If starts with 0, replace with 880
    if (cleaned.startsWith('0')) {
      cleaned = '880' + cleaned.substring(1);
    }
    
    // If doesn't start with +, add 880 if needed
    if (!cleaned.startsWith('+') && !cleaned.startsWith('880')) {
      cleaned = '880' + cleaned;
    }
    
    return cleaned;
  }

  // Order confirmation SMS template
  getOrderConfirmationSMS(order) {
    return `Dear ${order.shippingAddress.fullName}, your order #${order.orderNumber} has been placed successfully! Total: ৳${order.totalPrice}. We will deliver to: ${order.shippingAddress.address}, ${order.shippingAddress.city}. Track: ${config.clientUrl}/orders/${order.orderNumber}`;
  }

  // Order status update SMS template
  getOrderStatusSMS(order, status) {
    const statusMessages = {
      'Confirmed': `Your order #${order.orderNumber} has been confirmed!`,
      'Processing': `Your order #${order.orderNumber} is being processed.`,
      'Shipped': `Great news! Your order #${order.orderNumber} has been shipped.`,
      'Out for Delivery': `Your order #${order.orderNumber} is out for delivery today!`,
      'Delivered': `Your order #${order.orderNumber} has been delivered. Thank you for shopping with us!`,
      'Cancelled': `Your order #${order.orderNumber} has been cancelled.`,
    };

    return statusMessages[status] || `Your order #${order.orderNumber} status: ${status}`;
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
