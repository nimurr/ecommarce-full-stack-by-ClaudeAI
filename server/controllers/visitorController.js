import asyncHandler from 'express-async-handler';
import Visitor from '../models/Visitor.js';

// @desc    Track a client site visit (called from client app)
// @route   POST /api/visitors/track
// @access  Public
export const trackClientVisit = asyncHandler(async (req, res) => {
  const { page, referrer } = req.body;
  
  const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
  const userAgent = req.headers['user-agent'] || '';

  // Simple user agent parsing
  const parseUserAgent = (ua) => {
    if (!ua) return { browser: 'Unknown', os: 'Unknown', device: 'unknown' };
    
    const userAgent = ua.toLowerCase();
    let browser = 'Unknown';
    if (userAgent.includes('firefox')) browser = 'Firefox';
    else if (userAgent.includes('edg')) browser = 'Edge';
    else if (userAgent.includes('chrome')) browser = 'Chrome';
    else if (userAgent.includes('safari')) browser = 'Safari';
    else if (userAgent.includes('opera') || userAgent.includes('opr')) browser = 'Opera';
    
    let os = 'Unknown';
    if (userAgent.includes('windows')) os = 'Windows';
    else if (userAgent.includes('mac os')) os = 'macOS';
    else if (userAgent.includes('android')) os = 'Android';
    else if (userAgent.includes('ios') || userAgent.includes('iphone')) os = 'iOS';
    else if (userAgent.includes('linux')) os = 'Linux';
    
    let device = 'desktop';
    if (userAgent.includes('mobile') || userAgent.includes('android')) device = 'mobile';
    else if (userAgent.includes('tablet') || userAgent.includes('ipad')) device = 'tablet';
    
    return { browser, os, device };
  };

  const { browser, os, device } = parseUserAgent(userAgent);

  // Check if we have a visit from this IP today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const existingVisitToday = await Visitor.findOne({
    ip,
    createdAt: { $gte: today }
  }).sort({ createdAt: -1 });

  if (!existingVisitToday) {
    // First visit from this IP today - unique visitor
    await Visitor.create({
      visitorId: `visitor_${ip.replace(/[^a-zA-Z0-9]/g, '')}_${today.getTime()}`,
      ip,
      userAgent,
      page: page || '/',
      referrer: referrer || 'Direct',
      browser,
      os,
      device,
      isFirstVisit: true,
      lastVisit: new Date(),
    });
  } else {
    // Update existing visit
    existingVisitToday.lastVisit = new Date();
    existingVisitToday.page = page || existingVisitToday.page;
    await existingVisitToday.save();
  }

  res.status(200).json({
    success: true,
    message: 'Visit tracked',
  });
});

// @desc    Get visitor statistics
// @route   GET /api/visitors/stats
// @access  Private/Admin
export const getVisitorStats = asyncHandler(async (req, res) => {
  const { period } = req.query; // 'day', 'week', 'month', 'all'

  const now = new Date();
  let startDate;

  switch (period) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    default:
      startDate = null;
  }

  const dateFilter = startDate ? { createdAt: { $gte: startDate } } : {};

  // Total unique visitors (by IP)
  const totalUniqueVisitors = await Visitor.aggregate([
    { $match: dateFilter },
    { $group: { _id: '$ip' } },
    { $count: 'total' }
  ]);

  // Total visits (all visits)
  const totalVisits = await Visitor.countDocuments(dateFilter);

  // New vs returning visitors
  const newVisitors = await Visitor.aggregate([
    { $match: { ...dateFilter, isFirstVisit: true } },
    { $group: { _id: '$ip' } },
    { $count: 'total' }
  ]);

  const returningVisitorsCount = totalUniqueVisitors[0]?.total - (newVisitors[0]?.total || 0);

  // Visitors by device
  const visitorsByDevice = await Visitor.aggregate([
    { $match: dateFilter },
    { $group: { _id: '$device', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Visitors by browser
  const visitorsByBrowser = await Visitor.aggregate([
    { $match: dateFilter },
    { $group: { _id: '$browser', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  // Visitors by OS
  const visitorsByOS = await Visitor.aggregate([
    { $match: dateFilter },
    { $group: { _id: '$os', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  // Visitors over time (daily trend)
  const visitorsOverTime = await Visitor.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        visitors: { $addToSet: '$ip' },
        visits: { $sum: 1 }
      }
    },
    {
      $project: {
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day'
          }
        },
        uniqueVisitors: { $size: '$visitors' },
        visits: 1
      }
    },
    { $sort: { date: 1 } }
  ]);

  // Top pages
  const topPages = await Visitor.aggregate([
    { $match: dateFilter },
    { $group: { _id: '$page', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Top referrers
  const topReferrers = await Visitor.aggregate([
    { $match: dateFilter },
    { $group: { _id: '$referrer', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Today's visitors
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayVisitors = await Visitor.aggregate([
    { $match: { createdAt: { $gte: today } } },
    { $group: { _id: '$ip' } },
    { $count: 'total' }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalUniqueVisitors: totalUniqueVisitors[0]?.total || 0,
      totalVisits,
      newVisitors: newVisitors[0]?.total || 0,
      returningVisitors: Math.max(0, returningVisitorsCount),
      todayVisitors: todayVisitors[0]?.total || 0,
      visitorsByDevice,
      visitorsByBrowser,
      visitorsByOS,
      visitorsOverTime,
      topPages,
      topReferrers,
    },
  });
});

// @desc    Get total unique visitor count (public endpoint)
// @route   GET /api/visitors/count
// @access  Public
export const getVisitorCount = asyncHandler(async (req, res) => {
  const totalUniqueVisitors = await Visitor.aggregate([
    { $group: { _id: '$ip' } },
    { $count: 'total' }
  ]);

  const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  const todayVisitors = await Visitor.aggregate([
    { $match: { createdAt: { $gte: today } } },
    { $group: { _id: '$ip' } },
    { $count: 'total' }
  ]);

  const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const monthVisitors = await Visitor.aggregate([
    { $match: { createdAt: { $gte: thisMonth } } },
    { $group: { _id: '$ip' } },
    { $count: 'total' }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalUniqueVisitors: totalUniqueVisitors[0]?.total || 0,
      todayVisitors: todayVisitors[0]?.total || 0,
      monthVisitors: monthVisitors[0]?.total || 0,
    },
  });
});
