import axios from 'axios';
import config from '../config/config.js';

class SteadfastService {
  constructor() {
    this.apiKey = config.steadfast.apiKey;
    this.apiSecret = config.steadfast.apiSecret;
    this.baseUrl = config.steadfast.baseUrl;
  }

  // Send order to Steadfast for delivery
  async createDelivery(order) {
    try {
      if (!this.apiKey || !this.apiSecret) {
        console.warn('Steadfast API credentials not configured');
        return null;
      }

      const deliveryData = {
        receiver_name: order.shippingAddress.fullName,
        receiver_phone: order.shippingAddress.phone,
        receiver_address: order.shippingAddress.address,
        receiver_city: order.shippingAddress.city,
        receiver_zipcode: order.shippingAddress.zipCode || '',
        receiver_state: order.shippingAddress.state || '',
        item_description: order.orderItems.map(item => item.name).join(', '),
        item_quantity: order.orderItems.reduce((acc, item) => acc + item.quantity, 0),
        item_weight: order.orderItems.reduce((acc, item) => acc + (item.product?.shipping?.weight || 0.5), 0),
        amount: order.totalPrice,
        invoice_number: order.orderNumber,
        notes: order.notes || '',
      };

      const response = await axios.post(
        `${this.baseUrl}/delivery/create`,
        deliveryData,
        {
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.apiKey,
            'api-secret': this.apiSecret,
          },
        }
      );

      if (response.data && response.data.success) {
        return {
          success: true,
          trackingNumber: response.data.data?.tracking_number,
          consignmentId: response.data.data?.consignment_id,
          status: response.data.data?.status,
          message: 'Delivery created successfully',
        };
      }

      return {
        success: false,
        message: response.data?.message || 'Failed to create delivery',
      };
    } catch (error) {
      console.error('Steadfast API Error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to connect to Steadfast',
      };
    }
  }

  // Track delivery status
  async trackDelivery(trackingNumber) {
    try {
      if (!this.apiKey || !this.apiSecret) {
        return null;
      }

      const response = await axios.get(
        `${this.baseUrl}/delivery/track/${trackingNumber}`,
        {
          headers: {
            'api-key': this.apiKey,
            'api-secret': this.apiSecret,
          },
        }
      );

      if (response.data && response.data.success) {
        return {
          success: true,
          status: response.data.data?.status,
          statusHistory: response.data.data?.status_history || [],
          currentLocation: response.data.data?.current_location,
          expectedDelivery: response.data.data?.expected_delivery_date,
        };
      }

      return {
        success: false,
        message: response.data?.message || 'Failed to track delivery',
      };
    } catch (error) {
      console.error('Steadfast Track Error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to track delivery',
      };
    }
  }

  // Get delivery status by consignment ID
  async getDeliveryStatus(consignmentId) {
    try {
      if (!this.apiKey || !this.apiSecret) {
        return null;
      }

      const response = await axios.get(
        `${this.baseUrl}/delivery/status/${consignmentId}`,
        {
          headers: {
            'api-key': this.apiKey,
            'api-secret': this.apiSecret,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Steadfast Status Error:', error.response?.data || error.message);
      return null;
    }
  }

  // Cancel delivery
  async cancelDelivery(trackingNumber, reason = '') {
    try {
      if (!this.apiKey || !this.apiSecret) {
        return null;
      }

      const response = await axios.post(
        `${this.baseUrl}/delivery/cancel`,
        {
          tracking_number: trackingNumber,
          reason: reason,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.apiKey,
            'api-secret': this.apiSecret,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Steadfast Cancel Error:', error.response?.data || error.message);
      return null;
    }
  }
}

export default new SteadfastService();
