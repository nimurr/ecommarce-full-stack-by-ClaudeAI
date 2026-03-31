import crypto from 'crypto';
import Settings from '../models/Settings.js';

class FacebookPixelService {
  constructor() {
    this.pixelId = null;
    this.accessToken = null;
    this.isEnabled = false;
  }

  // Initialize with settings from database
  async initialize() {
    try {
      const settings = await Settings.findOne();
      if (settings && settings.facebookPixel) {
        this.pixelId = settings.facebookPixel.pixelId;
        this.accessToken = settings.facebookPixel.accessToken;
        this.isEnabled = settings.facebookPixel.isEnabled;
      }
    } catch (error) {
      console.error('Facebook Pixel Initialize Error:', error);
    }
  }

  // Hash user data for privacy
  hashData(data) {
    if (!data) return undefined;
    return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
  }

  // Track server-side event
  async trackEvent(eventName, eventData = {}) {
    if (!this.isEnabled || !this.pixelId || !this.accessToken) {
      return { success: false, message: 'Facebook Pixel not configured' };
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.pixelId}/events?access_token=${this.accessToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: [
              {
                event_name: eventName,
                event_time: Math.floor(Date.now() / 1000),
                action_source: 'website',
                user_data: {
                  em: eventData.email ? [this.hashData(eventData.email)] : undefined,
                  ph: eventData.phone ? [this.hashData(eventData.phone)] : undefined,
                  fn: eventData.firstName ? [this.hashData(eventData.firstName)] : undefined,
                  ln: eventData.lastName ? [this.hashData(eventData.lastName)] : undefined,
                },
                custom_data: {
                  currency: 'BDT',
                  value: eventData.value || 0,
                  contents: eventData.contents || [],
                  content_type: eventData.contentType || 'product',
                  num_items: eventData.numItems || 1,
                },
              },
            ],
          }),
        }
      );

      const result = await response.json();
      
      if (result.success) {
        return { success: true, data: result };
      } else {
        console.error('Facebook Pixel Error:', result);
        return { success: false, error: result };
      }
    } catch (error) {
      console.error('Facebook Pixel Track Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Track specific events
  async trackPageView(userData = {}) {
    return await this.trackEvent('PageView', userData);
  }

  async trackViewContent(product, userData = {}) {
    return await this.trackEvent('ViewContent', {
      value: product.price,
      contents: [
        {
          id: product._id,
          title: product.name,
          price: product.price,
        },
      ],
      contentType: 'product',
      numItems: 1,
      ...userData,
    });
  }

  async trackAddToCart(product, quantity = 1, userData = {}) {
    return await this.trackEvent('AddToCart', {
      value: product.price * quantity,
      contents: [
        {
          id: product._id,
          title: product.name,
          price: product.price,
          quantity: quantity,
        },
      ],
      contentType: 'product',
      numItems: quantity,
      ...userData,
    });
  }

  async trackInitiateCheckout(orderItems, total, userData = {}) {
    return await this.trackEvent('InitiateCheckout', {
      value: total,
      contents: orderItems.map(item => ({
        id: item.product,
        title: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      contentType: 'product',
      numItems: orderItems.length,
      ...userData,
    });
  }

  async trackPurchase(order, userData = {}) {
    return await this.trackEvent('Purchase', {
      value: order.totalPrice,
      contents: order.orderItems.map(item => ({
        id: item.product,
        title: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      contentType: 'product',
      numItems: order.orderItems.length,
      ...userData,
    });
  }

  async trackLead(userData = {}) {
    return await this.trackEvent('Lead', userData);
  }

  async trackCompleteRegistration(userData = {}) {
    return await this.trackEvent('CompleteRegistration', userData);
  }
}

export default new FacebookPixelService();
