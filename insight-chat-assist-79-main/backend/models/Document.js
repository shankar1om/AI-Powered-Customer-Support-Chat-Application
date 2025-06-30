const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['pdf', 'txt', 'doc', 'docx', 'md'],
    lowercase: true
  },
  size: {
    type: Number,
    required: true,
    min: 0
  },
  filePath: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true,
    maxlength: 100
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  accessCount: {
    type: Number,
    default: 0
  },
  uploadedBy: {
    type: String,
    default: 'admin'
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Text search index for content
DocumentSchema.index({ 
  name: 'text', 
  content: 'text',
  category: 'text',
  tags: 'text'
});

// Other indexes
DocumentSchema.index({ type: 1 });
DocumentSchema.index({ category: 1 });
DocumentSchema.index({ isActive: 1 });
DocumentSchema.index({ uploadedAt: -1 });

module.exports = mongoose.model('Document', DocumentSchema);
