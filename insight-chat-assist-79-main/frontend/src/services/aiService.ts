export interface AIProvider {
  name: string;
  apiKey: string;
  endpoint: string;
  model: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
  timestamp: Date;
  tokensUsed?: number;
  responseTime?: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  createdAt: Date;
}

export interface Document {
  id: string;
  name: string;
  content: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

class AIService {
  private providers: Record<string, AIProvider> = {
    'openrouter-gpt-4.1': {
      name: 'OpenRouter GPT-4.1',
      apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'openai/gpt-4.1'
    }
  };

  async generateResponse(
    message: string,
    context: string[] = [],
    faqs: FAQ[] = [],
    documents: Document[] = [],
    imageUrl?: string
  ): Promise<AIResponse> {
    const startTime = Date.now();
    try {
      let systemContext = this.buildSystemContext(faqs, documents, context);
      // Compose messages: send user message as a string
      const messages: any[] = [
        // Optionally include system prompt if needed:
        // { role: 'system', content: systemContext },
        ...this.buildContextMessages(context),
        { role: 'user', content: message }
      ];
      const response = await this.makeAPICall(messages);
      const responseTime = Date.now() - startTime;
      return {
        content: response.content,
        provider: this.providers['openrouter-gpt-4.1'].name,
        model: this.providers['openrouter-gpt-4.1'].model,
        timestamp: new Date(),
        tokensUsed: response.tokensUsed,
        responseTime
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  private buildSystemContext(faqs: FAQ[], documents: Document[], context: string[]): string {
    let systemContext = `You are an intelligent customer support assistant. Your goal is to provide helpful, accurate, and contextual responses to customer queries.

IMPORTANT GUIDELINES:
- Always be polite, professional, and helpful
- Use the provided FAQs and company documents to answer questions accurately
- If you don't know something, admit it and suggest contacting human support
- Provide specific, actionable answers when possible
- Keep responses concise but comprehensive
`;

    // Add FAQ context
    if (faqs.length > 0) {
      systemContext += "\n\n=== COMPANY FAQs ===\n";
      faqs.forEach((faq, index) => {
        systemContext += `${index + 1}. Q: ${faq.question}\n   A: ${faq.answer}\n\n`;
      });
    }

    // Add document context
    if (documents.length > 0) {
      systemContext += "\n\n=== COMPANY DOCUMENTS & POLICIES ===\n";
      documents.forEach((doc, index) => {
        const excerpt = doc.content.length > 800 
          ? doc.content.substring(0, 800) + "..." 
          : doc.content;
        systemContext += `${index + 1}. Document: ${doc.name}\nContent: ${excerpt}\n\n`;
      });
    }

    // Add conversation context
    if (context.length > 0) {
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

  private buildContextMessages(context: string[]): ChatMessage[] {
    const messages: ChatMessage[] = [];
    const recentContext = context.slice(-6); // Last 6 messages for context
    
    for (let i = 0; i < recentContext.length; i += 2) {
      if (recentContext[i] && recentContext[i + 1]) {
        messages.push({ role: 'user', content: recentContext[i] });
        messages.push({ role: 'assistant', content: recentContext[i + 1] });
      }
    }
    
    return messages;
  }

  private async makeAPICall(messages: any[]): Promise<{content: string, tokensUsed: number}> {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openrouter-gpt-4.1',
        messages,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get AI response from backend');
    }
    const data = await response.json();
    return {
      content: data.data.content,
      tokensUsed: data.data.tokensUsed || 0,
    };
  }

  private generateContextualResponse(userMessage: string, systemContext: string, model: string): string {
    // Check for FAQ matches
    if (systemContext.includes('faqs')) {
      const faqMatch = this.findFAQMatch(userMessage, systemContext);
      if (faqMatch) {
        return `Based on our FAQ: ${faqMatch}`;
      }
    }

    // Check for document matches
    if (systemContext.includes('documents')) {
      const docMatch = this.findDocumentMatch(userMessage, systemContext);
      if (docMatch) {
        return `According to our documentation: ${docMatch}`;
      }
    }

    // Generate model-specific responses
    const responses = {
      'gpt-4': `I understand you're asking about "${userMessage}". Based on our available information and using advanced reasoning capabilities, I can help you with this query. While I have access to our knowledge base, I'd recommend providing more specific details so I can give you the most accurate assistance possible.`,
      
      'claude-3': `Thank you for your question about "${userMessage}". I've analyzed our company information and knowledge base to provide you with the most relevant response. If you need more specific details or have follow-up questions, I'm here to help guide you through the process.`,
      
      'gemini-pro': `I see you're inquiring about "${userMessage}". Using Google's advanced AI capabilities, I can process your request and provide comprehensive assistance. Based on the context available, let me help you find the best solution for your needs.`,
      
      'deepseek': `Your question about "${userMessage}" has been processed through our advanced reasoning systems. I can provide detailed analysis and support based on our knowledge base. Would you like me to elaborate on any specific aspect of this topic?`
    };

    return responses[model as keyof typeof responses] || 
           `I've received your question about "${userMessage}". Let me help you find the right information from our knowledge base.`;
  }

  private findFAQMatch(userMessage: string, systemContext: string): string | null {
    // Simple keyword matching - in production, this would use more sophisticated NLP
    const keywords = userMessage.split(' ').filter(word => word.length > 3);
    
    for (const keyword of keywords) {
      if (systemContext.includes(keyword)) {
        // Extract relevant FAQ answer
        const contextLines = systemContext.split('\n');
        for (let i = 0; i < contextLines.length; i++) {
          if (contextLines[i].toLowerCase().includes(keyword) && contextLines[i].includes('A:')) {
            return contextLines[i].substring(contextLines[i].indexOf('A:') + 2).trim();
          }
        }
      }
    }
    
    return null;
  }

  private findDocumentMatch(userMessage: string, systemContext: string): string | null {
    // Simple document content matching
    const keywords = userMessage.split(' ').filter(word => word.length > 3);
    
    for (const keyword of keywords) {
      if (systemContext.includes(keyword) && systemContext.includes('Content:')) {
        // Extract relevant document excerpt
        const contentIndex = systemContext.toLowerCase().indexOf(`content:`, systemContext.toLowerCase().indexOf(keyword));
        if (contentIndex !== -1) {
          const excerpt = systemContext.substring(contentIndex + 8, contentIndex + 200);
          return excerpt + (excerpt.length === 192 ? '...' : '');
        }
      }
    }
    
    return null;
  }

  // API Key management methods
  updateApiKey(provider: string, apiKey: string): void {
    if (this.providers[provider]) {
      this.providers[provider].apiKey = apiKey;
      console.log(`API key updated for ${provider}`);
    }
  }

  getAvailableProviders(): Array<{key: string, name: string, model: string}> {
    return Object.entries(this.providers).map(([key, provider]) => ({
      key,
      name: provider.name,
      model: provider.model
    }));
  }

  async checkProviderHealth(provider: string): Promise<{status: boolean, message: string}> {
    try {
      const providerConfig = this.providers[provider];
      if (!providerConfig) {
        return { status: false, message: 'Provider not found' };
      }
      
      if (!providerConfig.apiKey) {
        return { status: false, message: 'API key not configured' };
      }
      
      // In production, this would actually ping the API
      return { status: true, message: 'Provider is healthy' };
    } catch (error) {
      return { status: false, message: 'Health check failed' };
    }
  }

  // Method to get usage statistics
  getUsageStats(): {totalRequests: number, averageResponseTime: number} {
    // In production, this would track real usage
    return {
      totalRequests: parseInt(localStorage.getItem('totalRequests') || '0'),
      averageResponseTime: parseFloat(localStorage.getItem('avgResponseTime') || '0')
    };
  }
}

export const aiService = new AIService();
