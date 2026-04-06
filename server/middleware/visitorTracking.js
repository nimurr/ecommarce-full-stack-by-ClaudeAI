import Visitor from '../models/Visitor.js';

// Simple user agent parsing
const parseUserAgent = (userAgent) => {
  if (!userAgent) return { browser: 'Unknown', os: 'Unknown', device: 'unknown' };

  const ua = userAgent.toLowerCase();
  
  // Parse browser
  let browser = 'Unknown';
  if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('safari')) browser = 'Safari';
  else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera';
  else if (ua.includes('msie') || ua.includes('trident')) browser = 'IE';

  // Parse OS
  let os = 'Unknown';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac os')) os = 'macOS';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
  else if (ua.includes('linux')) os = 'Linux';

  // Parse device
  let device = 'desktop';
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) device = 'mobile';
  else if (ua.includes('tablet') || ua.includes('ipad')) device = 'tablet';

  return { browser, os, device };
};

// Track unique visitors middleware - Client site only
export const trackVisitor = async (req, res, next) => {
  try {
    // Only track GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // ONLY track client site routes (root path and client pages)
    // Skip everything except the client application
    const path = req.path || req.url;
    
    // Only track if it's the root route or client-side routes
    // Assuming client app is served from root or specific paths
    // Skip admin, API, static files, etc.
    if (path.startsWith('/api/') || 
        path.startsWith('/admin') || 
        path.startsWith('/public/') ||
        path.startsWith('/server') ||
        path.includes('.') ) { // Skip static file requests
      return next();
    }

    // Get IP address (this is the unique identifier)
    const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || '';
    const page = req.path || req.url;
    const referrer = req.headers.referer || req.headers.referrer || 'Direct';

    const { browser, os, device } = parseUserAgent(userAgent);

    // Check if we have a visit from this IP today (unique per day per IP)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingVisitToday = await Visitor.findOne({
      ip,
      createdAt: { $gte: today }
    }).sort({ createdAt: -1 });

    if (!existingVisitToday) {
      // First visit from this IP today - count as unique visitor
      await Visitor.create({
        visitorId: `visitor_${ip.replace(/[^a-zA-Z0-9]/g, '')}_${today.getTime()}`,
        ip,
        userAgent,
        page,
        referrer,
        browser,
        os,
        device,
        isFirstVisit: true,
        lastVisit: new Date(),
      });
    } else {
      // Update existing visit record
      existingVisitToday.lastVisit = new Date();
      existingVisitToday.page = page;
      await existingVisitToday.save();
    }

    next();
  } catch (error) {
    // Don't block the request if tracking fails
    console.error('Visitor tracking error:', error.message);
    next();
  }
};
