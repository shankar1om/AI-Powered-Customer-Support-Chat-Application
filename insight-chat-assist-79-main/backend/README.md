
# AI Customer Support Backend

## 🚀 Features

- **Express.js REST API** - Complete backend server
- **MongoDB Integration** - Store chat history, FAQs, and documents
- **Multiple AI Providers** - OpenAI, Claude, Gemini, DeepSeek support
- **File Upload System** - Upload and manage company documents
- **Admin Panel APIs** - Manage FAQs and documents
- **Chat Management** - Store and retrieve chat sessions
- **Real-time AI Responses** - Context-aware responses using knowledge base

## 📦 Installation

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

3. **Start MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Update MONGODB_URI in .env file

4. **Add AI API Keys** (Optional)
   - Add your AI provider API keys to .env file
   - Without API keys, the system will use simulated responses

5. **Start Server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🔧 Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/ai-customer-support

# AI Providers (Optional - will use simulated responses without these)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_API_KEY=your_google_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
```

## 🛠️ API Endpoints

### Chat APIs
- `GET /api/chat/:sessionId` - Get chat history
- `POST /api/chat/:sessionId/message` - Send message
- `GET /api/chat` - Get all chats (admin)
- `DELETE /api/chat/:sessionId` - Delete chat

### Admin APIs
- `GET /api/admin/faqs` - Get FAQs
- `POST /api/admin/faqs` - Create FAQ
- `PUT /api/admin/faqs/:id` - Update FAQ
- `DELETE /api/admin/faqs/:id` - Delete FAQ
- `GET /api/admin/documents` - Get documents
- `POST /api/admin/documents` - Create document
- `PUT /api/admin/documents/:id` - Update document
- `DELETE /api/admin/documents/:id` - Delete document
- `GET /api/admin/stats` - Get dashboard statistics

### AI APIs
- `POST /api/ai/test/:model` - Test AI provider
- `GET /api/ai/health/:model` - Check provider health
- `GET /api/ai/providers` - Get available providers

### Upload APIs
- `POST /api/upload/file` - Upload single file
- `POST /api/upload/files` - Upload multiple files
- `DELETE /api/upload/file/:id` - Delete file

## 📊 Database Models

### Chat Model
- Session management
- Message history
- User metadata
- Activity tracking

### FAQ Model
- Question/Answer pairs
- Categories and tags
- Search indexing
- Usage statistics

### Document Model
- File metadata
- Content storage
- Access tracking
- Search indexing

## 🤖 AI Integration

The backend supports multiple AI providers:
- **OpenAI GPT-4** - Advanced reasoning
- **Anthropic Claude-3** - Thoughtful responses
- **Google Gemini Pro** - Multimodal capabilities
- **DeepSeek** - Cost-effective option

Without API keys, the system provides intelligent simulated responses using the knowledge base.

## 🔒 Security Features

- Helmet.js for security headers
- Rate limiting
- Input validation
- File type restrictions
- CORS configuration
- Environment-based configuration

## 📝 Usage Examples

### Send Chat Message
```javascript
const response = await fetch('/api/chat/session123/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'How can I reset my password?',
    model: 'gpt-4'
  })
});
```

### Create FAQ
```javascript
const response = await fetch('/api/admin/faqs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: 'How do I reset my password?',
    answer: 'Click on "Forgot Password" on the login page...',
    category: 'Account'
  })
});
```

### Upload Document
```javascript
const formData = new FormData();
formData.append('document', file);
formData.append('category', 'Policies');

const response = await fetch('/api/upload/file', {
  method: 'POST',
  body: formData
});
```

## 🚀 Deployment

1. **Production Setup**
   ```bash
   NODE_ENV=production npm start
   ```

2. **Docker Deployment** (Optional)
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

3. **MongoDB Atlas** - Use cloud MongoDB for production
4. **Environment Variables** - Set all required env vars
5. **File Storage** - Configure proper file storage solution
6. **Load Balancing** - Use PM2 or similar for production

## 📈 Monitoring

- Health check endpoint: `GET /api/health`
- Admin statistics: `GET /api/admin/stats`
- Provider health: `GET /api/ai/health/:model`

Ready for production deployment! 🎉
