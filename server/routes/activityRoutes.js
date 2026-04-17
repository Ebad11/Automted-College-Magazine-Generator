const express = require('express');
const ActivityLog = require('../models/ActivityLog');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// GET /api/activity — get activity logs (lab_assistant/faculty only)
router.get('/', protect, restrictTo('lab_assistant', 'faculty'), async (req, res) => {
  try {
    const { page = 1, limit = 20, action, severity } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (severity) filter.severity = severity;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await ActivityLog.countDocuments(filter);
    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ success: true, total, page: parseInt(page), logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/activity/my — get current user's own logs
router.get('/my', protect, async (req, res) => {
  try {
    const logs = await ActivityLog.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
