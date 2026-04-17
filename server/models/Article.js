const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['article', 'poem', 'achievement', 'announcement', 'event', 'other'],
      default: 'article',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewNote: {
      type: String,
      default: '',
    },
    images: [
      {
        filename: String,
        originalName: String,
        url: String,
      },
    ],
    tags: [{ type: String, trim: true }],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
articleSchema.index({ status: 1, department: 1 });
articleSchema.index({ author: 1 });

module.exports = mongoose.model('Article', articleSchema);
