
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Upload, FileText, Trash2, Plus, Save, BarChart3, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  createdAt: Date;
}

interface Document {
  id: string;
  name: string;
  content: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel = ({ onBack }: AdminPanelProps) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: 'General' });
  const [editingFaq, setEditingFaq] = useState<string | null>(null);
  const [chatStats, setChatStats] = useState({ totalChats: 0, totalMessages: 0, avgResponseTime: 0 });
  const { toast } = useToast();

  // Load data on component mount
  useEffect(() => {
    loadFaqs();
    loadDocuments();
    loadChatStats();
  }, []);

  const loadFaqs = () => {
    const savedFaqs = localStorage.getItem('faqs');
    if (savedFaqs) {
      const parsedFaqs = JSON.parse(savedFaqs).map((faq: any) => ({
        ...faq,
        createdAt: new Date(faq.createdAt)
      }));
      setFaqs(parsedFaqs);
    } else {
      // Initialize with default FAQs
      const defaultFaqs: FAQ[] = [
        {
          id: '1',
          question: 'How do I reset my password?',
          answer: 'You can reset your password by clicking on the "Forgot Password" link on the login page and following the instructions sent to your email.',
          category: 'Account',
          createdAt: new Date()
        },
        {
          id: '2', 
          question: 'What are your business hours?',
          answer: 'Our customer support is available 24/7. Our sales team is available Monday-Friday, 9 AM - 6 PM EST.',
          category: 'General',
          createdAt: new Date()
        },
        {
          id: '3',
          question: 'How do I contact technical support?',
          answer: 'You can contact technical support through this chat system, email us at support@company.com, or call us at 1-800-SUPPORT.',
          category: 'Support',
          createdAt: new Date()
        }
      ];
      setFaqs(defaultFaqs);
      localStorage.setItem('faqs', JSON.stringify(defaultFaqs));
    }
  };

  const loadDocuments = () => {
    const savedDocs = localStorage.getItem('documents');
    if (savedDocs) {
      const parsedDocs = JSON.parse(savedDocs).map((doc: any) => ({
        ...doc,
        uploadedAt: new Date(doc.uploadedAt)
      }));
      setDocuments(parsedDocs);
    }
  };

  const loadChatStats = () => {
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    const totalMessages = chatHistory.length;
    const totalChats = Math.ceil(totalMessages / 10); // Estimate
    const avgResponseTime = parseFloat(localStorage.getItem('avgResponseTime') || '1.5');
    
    setChatStats({ totalChats, totalMessages, avgResponseTime });
  };

  const handleAddFaq = () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both question and answer fields.",
        variant: "destructive"
      });
      return;
    }

    const faq: FAQ = {
      id: Date.now().toString(),
      question: newFaq.question,
      answer: newFaq.answer,
      category: newFaq.category,
      createdAt: new Date()
    };

    const updatedFaqs = [...faqs, faq];
    setFaqs(updatedFaqs);
    setNewFaq({ question: '', answer: '', category: 'General' });
    
    localStorage.setItem('faqs', JSON.stringify(updatedFaqs));
    
    toast({
      title: "Success",
      description: "FAQ added successfully!"
    });
  };

  const handleDeleteFaq = (id: string) => {
    const updatedFaqs = faqs.filter(faq => faq.id !== id);
    setFaqs(updatedFaqs);
    localStorage.setItem('faqs', JSON.stringify(updatedFaqs));
    
    toast({
      title: "Success",
      description: "FAQ deleted successfully!"
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "Error",
        description: "File size must be less than 10MB.",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const document: Document = {
        id: Date.now().toString(),
        name: file.name,
        content: content,
        type: file.type,
        size: file.size,
        uploadedAt: new Date()
      };

      const updatedDocs = [...documents, document];
      setDocuments(updatedDocs);
      localStorage.setItem('documents', JSON.stringify(updatedDocs));
      
      toast({
        title: "Success",
        description: `Document "${file.name}" uploaded successfully!`
      });
    };
    
    reader.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to read file.",
        variant: "destructive"
      });
    };
    
    reader.readAsText(file);
  };

  const handleDeleteDocument = (id: string) => {
    const updatedDocs = documents.filter(doc => doc.id !== id);
    setDocuments(updatedDocs);
    localStorage.setItem('documents', JSON.stringify(updatedDocs));
    
    toast({
      title: "Success",
      description: "Document deleted successfully!"
    });
  };

  const exportData = () => {
    const data = {
      faqs,
      documents: documents.map(doc => ({ ...doc, content: doc.content.substring(0, 500) })),
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-support-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "Data exported successfully!"
    });
  };

  const categories = ['General', 'Account', 'Technical', 'Billing', 'Support'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <h1 className="text-xl font-semibold">Admin Control Panel</h1>
            </div>
            <Button onClick={exportData} variant="outline" className="flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>Export Data</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="faqs">FAQs ({faqs.length})</TabsTrigger>
            <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Chat Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-indigo-600">{chatStats.totalChats}</div>
                  <p className="text-xs text-gray-500">Active conversations</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{chatStats.totalMessages}</div>
                  <p className="text-xs text-gray-500">User and AI messages</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Avg Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{chatStats.avgResponseTime}s</div>
                  <p className="text-xs text-gray-500">AI response time</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Knowledge Base Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>FAQs by Category:</span>
                  </div>
                  {categories.map(category => {
                    const count = faqs.filter(faq => faq.category === category).length;
                    return (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-sm">{category}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    );
                  })}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span>Total Documents:</span>
                    <span className="font-medium">{documents.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faqs" className="space-y-6">
            {/* Add New FAQ */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Add New FAQ</span>
                </CardTitle>
                <CardDescription>
                  Create frequently asked questions to help the AI provide better responses.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Question</label>
                    <Input
                      placeholder="Enter the question..."
                      value={newFaq.question}
                      onChange={(e) => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <select
                      value={newFaq.category}
                      onChange={(e) => setNewFaq(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Answer</label>
                  <Textarea
                    placeholder="Enter the answer..."
                    value={newFaq.answer}
                    onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                    rows={4}
                  />
                </div>
                <Button onClick={handleAddFaq} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add FAQ
                </Button>
              </CardContent>
            </Card>

            {/* Existing FAQs */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Existing FAQs ({faqs.length})</h3>
              {faqs.map((faq) => (
                <Card key={faq.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-base">{faq.question}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                            {faq.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            {faq.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteFaq(faq.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Upload Knowledge Base Documents</span>
                </CardTitle>
                <CardDescription>
                  Upload company documents, policies, or knowledge base files (Max 10MB per file).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload text files, PDFs, or documentation
                  </p>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept=".txt,.md,.pdf,.doc,.docx,.rtf"
                    className="hidden"
                    id="file-upload"
                  />
                  <Button asChild>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </label>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Uploaded Documents */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Knowledge Base Documents ({documents.length})</h3>
              {documents.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    No documents uploaded yet. Upload company documents to enhance AI responses with specific knowledge.
                  </CardContent>
                </Card>
              ) : (
                documents.map((doc) => (
                  <Card key={doc.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span>{doc.name}</span>
                          </CardTitle>
                          <CardDescription>
                            {(doc.size / 1024).toFixed(1)} KB • {doc.type} • Uploaded {doc.uploadedAt.toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {doc.content.substring(0, 300)}...
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>AI Configuration</span>
                </CardTitle>
                <CardDescription>
                  Configure AI providers and system settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Current Configuration:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>OpenAI GPT-4 integration ready</li>
                    <li>Anthropic Claude-3 support enabled</li>
                    <li>Google Gemini Pro configured</li>
                    <li>DeepSeek API integration available</li>
                  </ul>
                  <p className="mt-4 text-xs text-orange-600">
                    Note: API keys should be configured in production environment variables for security.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
