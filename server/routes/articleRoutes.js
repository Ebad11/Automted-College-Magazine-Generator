const express = require('express');
const Article = require('../models/Article');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');
const logActivity = require('../utils/logActivity');

const router = express.Router();

// GET /api/articles — list articles (filtered by role)
router.get('/', protect, async (req, res) => {
  try {
    const { status, department, category, page = 1, limit = 10 } = req.query;
    const filter = {};

    // Students only see their own articles
    if (req.user.role === 'student') {
      filter.author = req.user._id;
    } 
    // Faculty only see articles from their own department
    else if (req.user.role === 'faculty') {
      filter.department = req.user.department;
    }

    if (status) filter.status = status;
    if (department && req.user.role === 'lab_assistant') filter.department = department;
    if (category) filter.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Article.countDocuments(filter);
    const articles = await Article.find(filter)
      .populate('author', 'name email department rollNumber')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ success: true, total, page: parseInt(page), articles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/articles — submit a new article (student)
router.post(
  '/',
  protect,
  restrictTo('student'),
  upload.array('images', 5),
  async (req, res) => {
    try {
      const { title, content, department, category, tags } = req.body;
      const images = (req.files || []).map((f) => ({
        filename: f.filename,
        originalName: f.originalname,
        url: `/uploads/${f.filename}`,
      }));

      const article = await Article.create({
        title,
        content,
        department: department || req.user.department,
        category,
        tags: tags ? JSON.parse(tags) : [],
        author: req.user._id,
        images,
      });

      await logActivity({
        user: req.user,
        action: 'ARTICLE_SUBMITTED',
        details: `Article "${title}" submitted`,
        req,
        severity: 'success',
      });

      res.status(201).json({ success: true, article });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

// GET /api/articles/:id — single article
router.get('/:id', protect, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('author', 'name email department rollNumber')
      .populate('reviewedBy', 'name email');
    if (!article) return res.status(404).json({ success: false, message: 'Article not found.' });

    // Students can only view their own
    if (req.user.role === 'student' && article.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, article });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/articles/:id/review — faculty approve/reject
router.patch(
  '/:id/review',
  protect,
  restrictTo('faculty', 'lab_assistant'),
  async (req, res) => {
    try {
      const { status, reviewNote } = req.body;
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });
      }

      const article = await Article.findByIdAndUpdate(
        req.params.id,
        { status, reviewNote: reviewNote || '', reviewedBy: req.user._id },
        { new: true }
      ).populate('author', 'name email');

      if (!article) return res.status(404).json({ success: false, message: 'Article not found.' });

      const action = status === 'approved' ? 'ARTICLE_APPROVED' : 'ARTICLE_REJECTED';
      await logActivity({
        user: req.user,
        action,
        details: `Article "${article.title}" ${status} by ${req.user.name}`,
        req,
        severity: status === 'approved' ? 'success' : 'warning',
      });

      res.json({ success: true, article });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// PATCH /api/articles/:id/feature — lab assistant mark featured
router.patch(
  '/:id/feature',
  protect,
  restrictTo('lab_assistant'),
  async (req, res) => {
    try {
      const { isFeatured, order } = req.body;
      const article = await Article.findByIdAndUpdate(
        req.params.id,
        { isFeatured, order },
        { new: true }
      );
      if (!article) return res.status(404).json({ success: false, message: 'Article not found.' });
      res.json({ success: true, article });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// DELETE /api/articles/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found.' });

    const isOwner = article.author.toString() === req.user._id.toString();
    const isAdmin = ['faculty', 'lab_assistant'].includes(req.user.role);
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await article.deleteOne();
    await logActivity({
      user: req.user,
      action: 'ARTICLE_DELETED',
      details: `Article "${article.title}" deleted`,
      req,
      severity: 'warning',
    });

    res.json({ success: true, message: 'Article deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/articles/stats/summary — dashboard stats
router.get('/stats/summary', protect, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'student') {
      filter = { author: req.user._id };
    } else if (req.user.role === 'faculty') {
      filter = { department: req.user.department };
    }
    const [total, pending, approved, rejected] = await Promise.all([
      Article.countDocuments(filter),
      Article.countDocuments({ ...filter, status: 'pending' }),
      Article.countDocuments({ ...filter, status: 'approved' }),
      Article.countDocuments({ ...filter, status: 'rejected' }),
    ]);

    // Department breakdown (faculty/lab only)
    let deptBreakdown = [];
    if (req.user.role !== 'student') {
      deptBreakdown = await Article.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);
    }

    res.json({ success: true, stats: { total, pending, approved, rejected, deptBreakdown } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
