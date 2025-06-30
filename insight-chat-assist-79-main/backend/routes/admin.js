
const express = require('express');
const FAQ = require('../models/FAQ');
const Document = require('../models/Document');
const Chat = require('../models/Chat');
const router = express.Router();

// FAQ Routes
// Get all FAQs
router.get('/faqs', async (req, res) => {
  try {
    const { category, search, active, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    if (category) query.category = category;
    if (active !== undefined) query.isActive = active === 'true';
    if (search) {
      query.$text = { $search: search };
    }

    const faqs = await FAQ.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FAQ.countDocuments(query);

    res.json({
      success: true,
      data: {
        faqs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalFAQs: total
        }
      }
    });
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve FAQs'
    });
  }
});

// Create FAQ
router.post('/faqs', async (req, res) => {
  try {
    const { question, answer, category, tags, priority } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Question and answer are required'
      });
    }

    const faq = new FAQ({
      question: question.trim(),
      answer: answer.trim(),
      category: category?.trim(),
      tags: tags || [],
      priority: priority || 0
    });

    await faq.save();

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: faq
    });
  } catch (error) {
    console.error('Create FAQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create FAQ'
    });
  }
});

// Update FAQ
router.put('/faqs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const faq = await FAQ.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    res.json({
      success: true,
      message: 'FAQ updated successfully',
      data: faq
    });
  } catch (error) {
    console.error('Update FAQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update FAQ'
    });
  }
});

// Delete FAQ
router.delete('/faqs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const faq = await FAQ.findByIdAndDelete(id);
    
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    res.json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete FAQ'
    });
  }
});

// Document Routes
// Get all documents
router.get('/documents', async (req, res) => {
  try {
    const { category, type, search, active, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    if (category) query.category = category;
    if (type) query.type = type;
    if (active !== undefined) query.isActive = active === 'true';
    if (search) {
      query.$text = { $search: search };
    }

    const documents = await Document.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-content'); // Exclude content for list view

    const total = await Document.countDocuments(query);

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalDocuments: total
        }
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve documents'
    });
  }
});

// Get single document with content
router.get('/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await Document.findById(id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Update access count
    document.accessCount += 1;
    document.lastAccessed = new Date();
    await document.save();

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve document'
    });
  }
});

// Create document
router.post('/documents', async (req, res) => {
  try {
    const { name, content, type, category, tags } = req.body;

    if (!name || !content || !type) {
      return res.status(400).json({
        success: false,
        message: 'Name, content, and type are required'
      });
    }

    const document = new Document({
      name: name.trim(),
      originalName: name.trim(),
      content: content.trim(),
      type: type.toLowerCase(),
      size: content.length,
      category: category?.trim(),
      tags: tags || []
    });

    await document.save();

    res.status(201).json({
      success: true,
      message: 'Document created successfully',
      data: document
    });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create document'
    });
  }
});

// Update document
router.put('/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.content) {
      updates.size = updates.content.length;
    }

    const document = await Document.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: document
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document'
    });
  }
});

// Delete document
router.delete('/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await Document.findByIdAndDelete(id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document'
    });
  }
});

// Dashboard Statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalChats,
      activeChats,
      totalFAQs,
      totalDocuments,
      todayChats
    ] = await Promise.all([
      Chat.countDocuments(),
      Chat.countDocuments({ isActive: true }),
      FAQ.countDocuments({ isActive: true }),
      Document.countDocuments({ isActive: true }),
      Chat.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      })
    ]);

    // Get recent activity
    const recentChats = await Chat.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('sessionId metadata.totalMessages updatedAt');

    res.json({
      success: true,
      data: {
        stats: {
          totalChats,
          activeChats,
          totalFAQs,
          totalDocuments,
          todayChats
        },
        recentActivity: recentChats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics'
    });
  }
});

module.exports = router;
