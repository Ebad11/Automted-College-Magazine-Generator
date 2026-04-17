const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'USER_REGISTERED',
        'USER_LOGIN',
        'USER_LOGOUT',
        'ARTICLE_SUBMITTED',
        'ARTICLE_APPROVED',
        'ARTICLE_REJECTED',
        'ARTICLE_DELETED',
        'MAGAZINE_GENERATED',
        'MAGAZINE_PUBLISHED',
        'FILE_UPLOADED',
        'PROFILE_UPDATED',
      ],
    },
    details: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '',
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'success', 'error'],
      default: 'info',
    },
  },
  { timestamps: true }
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ user: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
