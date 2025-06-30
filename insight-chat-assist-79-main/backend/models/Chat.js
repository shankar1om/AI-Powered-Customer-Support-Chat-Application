
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  provider: {
    type: String,
    trim: true
  },
  tokensUsed: {
    type: Number,
    default: 0
  }
});

const ChatSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  userId: {
    type: String,
    trim: true
  },
  messages: [MessageSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: Date,
    totalMessages: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
ChatSchema.index({ sessionId: 1 });
ChatSchema.index({ userId: 1 });
ChatSchema.index({ 'messages.timestamp': -1 });

// Virtual for getting latest message
ChatSchema.virtual('latestMessage').get(function() {
  if (this.messages && this.messages.length > 0) {
    return this.messages[this.messages.length - 1];
  }
  return null;
});

module.exports = mongoose.model('Chat', ChatSchema);
