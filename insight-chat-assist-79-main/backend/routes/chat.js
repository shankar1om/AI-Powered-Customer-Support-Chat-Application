
const express = require('express');
const Chat = require('../models/Chat');
const aiService = require('../services/aiService');
const router = express.Router();

// Get chat history for a session
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const chat = await Chat.findOne({ sessionId }).sort({ createdAt: -1 });
    
    if (!chat) {
      return res.json({
        success: true,
        data: {
          sessionId,
          messages: [],
          isActive: true
        }
      });
    }

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat history'
    });
  }
});

// Send message and get AI response
router.post('/:sessionId/message', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message, model = 'gpt-4', userId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Find or create chat session
    let chat = await Chat.findOne({ sessionId });
    if (!chat) {
      chat = new Chat({
        sessionId,
        userId,
        messages: [],
        metadata: {
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip,
          startTime: new Date()
        }
      });
    }

    // Add user message
    const userMessage = {
      content: message.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    
    chat.messages.push(userMessage);

    // Get AI response
    const aiResponse = await aiService.generateResponse(
      message,
      model,
      chat.messages.slice(-10).map(msg => msg.content), // Last 10 messages for context
      sessionId
    );

    // Add AI message
    const aiMessage = {
      content: aiResponse.content,
      sender: 'ai',
      timestamp: new Date(),
      provider: aiResponse.provider,
      tokensUsed: aiResponse.tokensUsed
    };

    chat.messages.push(aiMessage);
    chat.metadata.totalMessages = chat.messages.length;
    
    // Save chat
    await chat.save();

    res.json({
      success: true,
      data: {
        userMessage,
        aiMessage,
        sessionId: chat.sessionId,
        totalMessages: chat.metadata.totalMessages
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message'
    });
  }
});

// Get all chat sessions (for admin)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, active } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const chats = await Chat.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('sessionId userId metadata createdAt updatedAt');

    const total = await Chat.countDocuments(query);

    res.json({
      success: true,
      data: {
        chats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalChats: total,
          hasNext: skip + chats.length < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chats'
    });
  }
});

// Delete chat session
router.delete('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const result = await Chat.findOneAndUpdate(
      { sessionId },
      { 
        isActive: false,
        'metadata.endTime': new Date()
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    res.json({
      success: true,
      message: 'Chat session deactivated successfully',
      data: result
    });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate chat session'
    });
  }
});

module.exports = router;
