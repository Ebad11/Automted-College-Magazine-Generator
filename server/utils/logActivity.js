const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ user, action, details = '', req = null, severity = 'info' }) => {
  try {
    const ip = req
      ? req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || ''
      : '';
    if (!user) return;

    await ActivityLog.create({
      user: user._id,
      userName: user.name,
      userRole: user.role,
      action,
      details,
      ipAddress: ip,
      severity,
    });
  } catch (err) {
    console.error('ActivityLog error:', err.message);
  }
};

module.exports = logActivity;
