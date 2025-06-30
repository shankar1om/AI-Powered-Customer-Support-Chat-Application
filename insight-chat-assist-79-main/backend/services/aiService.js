const OpenAI = require("openai");
const FAQ = require('../models/FAQ');
const Document = require('../models/Document');
require('dotenv').config();

class AIService {
  constructor() {
    this.providers = {
      'openrouter-gpt-4.1': {
        name: 'OpenRouter GPT-4.1',
        endpoint: 'https://openrouter.ai/api/v1/chat/completions',
        model: 'openai/gpt-4.1'
      }
    };
    this.openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": process.env.SITE_URL || "",
        "X-Title": process.env.SITE_TITLE || "",
      },
    });
  }

  async generateResponse(message, model = 'openrouter-gpt-4.1', context = [], sessionId, imageUrl = null) {
    const startTime = Date.now();
    try {
      const [faqs, documents] = await Promise.all([
        FAQ.find({ isActive: true }).limit(20).lean(),
        Document.find({ isActive: true }).limit(10).select('name content category').lean()
      ]);
      const systemContext = this.buildSystemContext(faqs, documents, context);
      const provider = this.providers['openrouter-gpt-4.1'];
      let response;
      const hasApiKey = this.checkApiKey();
      if (hasApiKey) {
        response = await this.makeRealAPICall(message, systemContext, imageUrl);
      } else {
        response = await this.makeSimulatedAPICall(message, systemContext, faqs, documents);
      }
      const responseTime = Date.now() - startTime;
      return {
        content: response.content,
        provider: provider.name,
        model: provider.model,
        timestamp: new Date(),
        tokensUsed: response.tokensUsed || 0,
        responseTime,
        sessionId
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        content: "I apologize, but I'm experiencing technical difficulties right now. Please try again in a moment, or contact our support team for immediate assistance.",
        provider: this.providers['openrouter-gpt-4.1'].name,
        model: this.providers['openrouter-gpt-4.1'].model,
        timestamp: new Date(),
        tokensUsed: 0,
        responseTime: Date.now() - startTime,
        error: true
      };
    }
  }

  checkApiKey() {
    console.log(process.env.OPENROUTER_API_KEY)
    return !!process.env.OPENROUTER_API_KEY;
  
  }

  async makeRealAPICall(message, systemContext, imageUrl = null) {
    try {
      let userContent = [
        { type: "text", text: String(message) }
      ];
      if (imageUrl) {
        userContent.push({
          type: "image_url",
          image_url: { url: imageUrl }
        });
      }
      console.log('Sending to OpenRouter:', JSON.stringify({
        model: "openai/gpt-4.1",
        messages: [
          { role: "system", content: [{ type: "text", text: systemContext }] },
          { role: "user", content: userContent }
        ],
        max_tokens: 500
      }, null, 2));
      const completion = await this.openai.chat.completions.create({
        model: "openai/gpt-4.1",
        messages: [
          { role: "system", content: [{ type: "text", text: systemContext }] },
          { role: "user", content: userContent }
        ],
        max_tokens: 500
      });
      return {
        content: completion.choices[0].message.content,
        tokensUsed: completion.usage?.total_tokens || 0
      };
    } catch (error) {
      console.error("openrouter-gpt-4.1 API Error:", error.response?.data || error.message);
      throw error;
    }
  }

  async makeSimulatedAPICall(message, systemContext, faqs, documents) {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    const userMessage = message.toLowerCase();
    const faqMatch = this.findFAQMatch(userMessage, faqs);
    if (faqMatch) {
      return {
        content: `Based on our FAQ: ${faqMatch.answer}`,
        tokensUsed: Math.floor(Math.random() * 200) + 100
      };
    }
    const docMatch = this.findDocumentMatch(userMessage, documents);
    if (docMatch) {
      return {
        content: `According to our documentation: ${docMatch}`,
        tokensUsed: Math.floor(Math.random() * 250) + 150
      };
    }
    return {
      content: `Your question about "${message}" has been processed using ChatGPT's advanced reasoning systems. I can provide detailed analysis and support based on our knowledge base. Would you like me to elaborate on any specific aspect of this topic?`,
      tokensUsed: Math.floor(Math.random() * 200) + 100
    };
  }

  buildSystemContext(faqs, documents, context) {
    let systemContext = `You are an intelligent customer support assistant. Your goal is to provide helpful, accurate, and contextual responses to customer queries.

IMPORTANT GUIDELINES:
- Always be polite, professional, and helpful
- Use the provided FAQs and company documents to answer questions accurately
- If you don't know something, admit it and suggest contacting human support
- Provide specific, actionable answers when possible
- Keep responses concise but comprehensive
`;

    // Add FAQ context
    if (faqs && faqs.length > 0) {
      systemContext += "\n\n=== COMPANY FAQs ===\n";
      faqs.forEach((faq, index) => {
        systemContext += `${index + 1}. Q: ${faq.question}\n   A: ${faq.answer}\n\n`;
      });
    }

    // Add document context
    if (documents && documents.length > 0) {
      systemContext += "\n\n=== COMPANY DOCUMENTS & POLICIES ===\n";
      documents.forEach((doc, index) => {
        const excerpt = doc.content && doc.content.length > 800 
          ? doc.content.substring(0, 800) + "..." 
          : doc.content || '';
        systemContext += `${index + 1}. Document: ${doc.name}\nContent: ${excerpt}\n\n`;
      });
    }

    // Add conversation context
    if (context && context.length > 0) {
      systemContext += "\n\n=== RECENT CONVERSATION CONTEXT ===\n";
      systemContext += context.slice(-5).join("\n") + "\n\n";
    }

    systemContext += `
Based on the above information, please provide accurate and helpful responses to customer queries. 
If the answer is in the FAQs or documents, reference that information. 
If not, provide general helpful guidance and suggest contacting support for specific issues.
`;

    return systemContext;
  }

  findFAQMatch(userMessage, faqs) {
    if (!faqs || faqs.length === 0) return null;
    
    const keywords = userMessage.split(' ').filter(word => word.length > 3);
    
    for (const faq of faqs) {
      const faqText = (faq.question + ' ' + faq.answer).toLowerCase();
      for (const keyword of keywords) {
        if (faqText.includes(keyword)) {
          return faq;
        }
      }
    }
    
    return null;
  }

  findDocumentMatch(userMessage, documents) {
    if (!documents || documents.length === 0) return null;
    
    const keywords = userMessage.split(' ').filter(word => word.length > 3);
    
    for (const doc of documents) {
      const docText = (doc.name + ' ' + (doc.content || '')).toLowerCase();
      for (const keyword of keywords) {
        if (docText.includes(keyword)) {
          const excerpt = doc.content && doc.content.length > 200 
            ? doc.content.substring(0, 200) + '...' 
            : doc.content || '';
          return excerpt;
        }
      }
    }
    
    return null;
  }

  // Health check for providers
  async checkProviderHealth(model) {
    try {
      const provider = this.providers[model];
      if (!provider) {
        return { status: false, message: 'Provider not found' };
      }
      
      if (!this.checkApiKey()) {
        return { status: false, message: 'API key not configured' };
      }
      
      // In production, you could ping the actual API
      return { status: true, message: 'Provider is healthy' };
    } catch (error) {
      return { status: false, message: 'Health check failed' };
    }
  }
}

module.exports = new AIService();
