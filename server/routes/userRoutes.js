const express = require('express');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/auth');
const logActivity = require('../utils/logActivity');

const router = express.Router();

// GET /api/users — list all users (lab_assistant only)
router.get('/', protect, restrictTo('lab_assistant'), async (req, res) => {
  try {
    const { role, department } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;

    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/users/profile — update own profile
router.patch('/profile', protect, async (req, res) => {
  try {
    const allowed = ['name', 'department', 'rollNumber', 'avatar'];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    await logActivity({ user: req.user, action: 'PROFILE_UPDATED', details: 'Profile updated', req, severity: 'info' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/users/:id/status — activate/deactivate user (lab_assistant)
router.patch('/:id/status', protect, restrictTo('lab_assistant'), async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
