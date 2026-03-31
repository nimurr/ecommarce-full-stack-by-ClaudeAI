import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const FacebookPixel = () => {
  const [pixelId, setPixelId] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Fetch settings from server
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API_URL}/settings/public`);
        const { facebookPixel } = response.data.data;
        
        if (facebookPixel?.isEnabled && facebookPixel?.pixelId) {
          setPixelId(facebookPixel.pixelId);
          setIsEnabled(true);
          
          // Initialize Facebook Pixel
          initFacebookPixel(facebookPixel.pixelId);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    fetchSettings();
  }, []);

  // Initialize Facebook Pixel
  const initFacebookPixel = (pixelId) => {
    // Load Facebook Pixel Script
    !function(f,b,e,v,n,t,s) {
      if(f.fbq)return;
      n=f.fbq=function(){
        n.callMethod ? n.callMethod.apply(n,arguments) : n.queue.push(arguments)
      };
      if(!f._fbq)f._fbq=n;
      n.push=n;
      n.loaded=!0;
      n.version='2.0';
      n.queue=[];
      t=b.createElement(e);
      t.async=!0;
      t.src=v;
      s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)
    }(window, document,'script', 'https://connect.facebook.net/en_US/fbevents.js');

    // Initialize with pixel ID
    fbq('init', pixelId);
    fbq('track', 'PageView');
  };

  return null; // This is a utility component, doesn't render anything
};

// Helper function to track events (can be used anywhere in the app)
export const trackFacebookEvent = (eventName, eventData = {}) => {
  if (window.fbq && typeof window.fbq === 'function') {
    window.fbq('track', eventName, eventData);
  }
};

// Pre-defined event tracking functions
export const trackViewContent = (product) => {
  trackFacebookEvent('ViewContent', {
    content_ids: [product._id],
    content_name: product.name,
    content_type: 'product',
    value: product.price,
    currency: 'BDT',
  });
};

export const trackAddToCart = (product, quantity = 1) => {
  trackFacebookEvent('AddToCart', {
    content_ids: [product._id],
    content_name: product.name,
    content_type: 'product',
    value: product.price * quantity,
    currency: 'BDT',
    quantity: quantity,
  });
};

export const trackInitiateCheckout = (cartItems, total) => {
  trackFacebookEvent('InitiateCheckout', {
    content_ids: cartItems.map(item => item.product),
    content_type: 'product',
    value: total,
    currency: 'BDT',
    num_items: cartItems.length,
  });
};

export const trackPurchase = (order) => {
  trackFacebookEvent('Purchase', {
    content_ids: order.orderItems.map(item => item.product),
    content_type: 'product',
    value: order.totalPrice,
    currency: 'BDT',
    num_items: order.orderItems.length,
    transaction_id: order.orderNumber,
  });
};

export const trackLead = () => {
  trackFacebookEvent('Lead');
};

export const trackCompleteRegistration = () => {
  trackFacebookEvent('CompleteRegistration');
};

export default FacebookPixel;
