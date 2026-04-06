import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Visitor tracking component - tracks unique visitors by IP
const VisitorTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const trackVisit = async () => {
      try {
        await fetch(`${API_URL}/visitors/track`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: location.pathname,
            referrer: document.referrer || 'Direct',
          }),
        });
      } catch (error) {
        // Silently fail - don't break the app
        console.error('Visitor tracking failed:', error);
      }
    };

    trackVisit();
  }, [location.pathname]);

  return null; // This component doesn't render anything
};

export default VisitorTracker;
