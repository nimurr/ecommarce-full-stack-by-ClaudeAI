import { useEffect, useState } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const GoogleTagManager = () => {
  const [gtmId, setGtmId] = useState(null);

  useEffect(() => {
    // Fetch GTM ID from server
    const fetchGTMSettings = async () => {
      try {
        const response = await axios.get(`${API_URL}/settings/public`);
        const { googleTagManager } = response.data.data;
        
        if (googleTagManager?.isEnabled && googleTagManager?.trackingId) {
          setGtmId(googleTagManager.trackingId);
        }
      } catch (error) {
        console.error('Failed to fetch GTM settings:', error);
      }
    };

    fetchGTMSettings();
  }, []);

  if (!gtmId) return null;

  return (
    <Helmet>
      {/* Google Tag Manager - Head */}
      <script>
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${gtmId}');`}
      </script>
      {/* End Google Tag Manager */}
    </Helmet>
  );
};

export default GoogleTagManager;
