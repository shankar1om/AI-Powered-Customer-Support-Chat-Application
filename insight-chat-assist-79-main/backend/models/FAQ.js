const mongoose = require('mongoose');

const FAQSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  answer: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
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
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  viewCount: {
    type: Number,
    default: 0
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: String,
    default: 'admin'
  }
}, {
  timestamps: true
});

// Text search index
FAQSchema.index({ 
  question: 'text', 
  answer: 'text', 
  category: 'text',
  tags: 'text'
});

// Other indexes
FAQSchema.index({ category: 1 });
FAQSchema.index({ isActive: 1 });
FAQSchema.index({ priority: -1 });

module.exports = mongoose.model('FAQ', FAQSchema);
