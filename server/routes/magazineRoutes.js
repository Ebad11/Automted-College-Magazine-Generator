const express = require('express');
const Article = require('../models/Article');
const { protect, restrictTo } = require('../middleware/auth');
const logActivity = require('../utils/logActivity');

const router = express.Router();

// GET /api/magazine/preview — get all approved articles ordered for magazine
router.get('/preview', protect, async (req, res) => {
  try {
    const articles = await Article.find({ status: 'approved' })
      .populate('author', 'name department rollNumber')
      .sort({ isFeatured: -1, order: 1, createdAt: 1 });

    res.json({ success: true, articles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/magazine/generate — log magazine generation event
router.post('/generate', protect, restrictTo('lab_assistant'), async (req, res) => {
  try {
    const { templateName, articleCount } = req.body;

    await logActivity({
      user: req.user,
      action: 'MAGAZINE_GENERATED',
      details: `Magazine generated with template "${templateName}", ${articleCount} articles`,
      req,
      severity: 'success',
    });

    res.json({
      success: true,
      message: 'Magazine generation event logged.',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/magazine/publish — log magazine publish
router.post('/publish', protect, restrictTo('lab_assistant'), async (req, res) => {
  try {
    await logActivity({
      user: req.user,
      action: 'MAGAZINE_PUBLISHED',
      details: 'Magazine published for college distribution',
      req,
      severity: 'success',
    });

    res.json({ success: true, message: 'Magazine published successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
