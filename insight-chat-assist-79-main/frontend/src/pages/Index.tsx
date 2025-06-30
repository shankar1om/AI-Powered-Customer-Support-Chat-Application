
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Settings, FileText, Users, Bot, Zap } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import AdminPanel from "@/components/AdminPanel";

const Index = () => {
  const [activeView, setActiveView] = useState<'home' | 'chat' | 'admin'>('home');

  if (activeView === 'chat') {
    return <ChatInterface onBack={() => setActiveView('home')} />;
  }

  if (activeView === 'admin') {
    return <AdminPanel onBack={() => setActiveView('home')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                AI Support Hub
              </h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setActiveView('chat')}
                className="flex items-center space-x-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Chat</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveView('admin')}
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Admin</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Intelligent Customer Support
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience next-generation customer support powered by advanced AI. Get instant, accurate answers 
            based on your company's knowledge base and FAQs.
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              size="lg"
              onClick={() => setActiveView('chat')}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-3 text-lg transition-all duration-300 transform hover:scale-105"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Start Chatting
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setActiveView('admin')}
              className="px-8 py-3 text-lg border-2 border-indigo-200 hover:border-indigo-300 transition-all duration-300"
            >
              <Settings className="mr-2 h-5 w-5" />
              Admin Panel
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Multi-AI Support</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Integration with OpenAI, Claude, Gemini, and DeepSeek for the best AI responses
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Smart Knowledge Base</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Upload FAQs and documents to create context-aware, accurate responses
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Real-time Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Fast, responsive chat interface with message history and typing indicators
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">&lt;1s</div>
              <div className="text-gray-600">Response Time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Availability</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">Smart</div>
              <div className="text-gray-600">AI Responses</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
