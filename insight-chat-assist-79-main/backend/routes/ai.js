const express = require('express');
const aiService = require('../services/aiService');
const router = express.Router();

// Test AI provider
router.post('/test/:model', async (req, res) => {
  try {
    const { model } = req.params;
    const { message = 'Hello, this is a test message.' } = req.body;

    const response = await aiService.generateResponse(
      message,
      model,
      [],
      `test-${Date.now()}`
    );

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('AI test error:', error);
    res.status(500).json({
      success: false,
      message: 'AI test failed',
      error: error.message
    });
  }
});

// Check provider health
router.get('/health/:model', async (req, res) => {
  try {
    const { model } = req.params;
    const health = await aiService.checkProviderHealth(model);
    
    res.json({
      success: true,
      data: {
        model,
        ...health
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed'
    });
  }
});

// Get available providers
router.get('/providers', (req, res) => {
  try {
    const providers = [
      { key: 'gpt-4', name: 'OpenAI GPT-4', model: 'gpt-4' },
      { key: 'claude-3', name: 'Anthropic Claude-3', model: 'claude-3-sonnet-20240229' },
      { key: 'gemini-pro', name: 'Google Gemini Pro', model: 'gemini-pro' },
      { key: 'deepseek', name: 'DeepSeek', model: 'deepseek-chat' }
    ];

    res.json({
      success: true,
      data: providers
    });
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get providers'
    });
  }
});

// Proxy endpoint for frontend chat requests
router.post('/chat', async (req, res) => {
  console.log('Received /api/ai/chat request:', req.body);
  try {
    const { model, messages } = req.body;
    if (!model || !messages) {
      return res.status(400).json({ success: false, message: 'Model and messages are required.' });
    }
    // Extract the user message and context from the messages array
    const userMessage = messages[messages.length - 1]?.content || '';
    const context = messages.slice(0, -1).map(m => m.content);
    // Call backend AI service
    const response = await aiService.generateResponse(
      userMessage,
      model,
      context,
      `chat-${Date.now()}`
    );
    res.json({ success: true, data: response });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ success: false, message: 'Failed to get AI response', error: error.message });
  }
});

module.exports = router;
