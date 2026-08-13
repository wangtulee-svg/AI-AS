import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ragService } from '../../services/ragService';
import { pdfService } from '../../services/pdfService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  FileText, 
  Search,
  Sparkles,
  BookOpen,
  X,
  Check,
  ChevronDown,
  Layers,
  Zap,
  Brain,
  Database,
  Globe,
  File,
  Clock,
  ChevronRight,
  Shield,
  Rocket,
  Lightbulb,
  Compass,
  Star,
  MessageSquare,
  Filter,
  Hash,
  Link,
  ExternalLink,
  Copy,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  ArrowRight,
  Grid3x3,
  List,
  Heart,
  Award,
  Crown,
  Sparkle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function RAGChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [showDocSelector, setShowDocSelector] = useState(false);
  const [language, setLanguage] = useState('both');
  const [isThinking, setIsThinking] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [searchMode, setSearchMode] = useState('semantic'); // 'semantic' | 'keyword' | 'hybrid'
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadDocuments = async () => {
    try {
      const response = await pdfService.getList();
      if (response.success) {
        setDocuments(response.data);
        setSelectedDocs(response.data.map(doc => doc.id));
      }
    } catch (error) {
      console.error('Load documents error:', error);
      toast.error('ບໍ່ສາມາດໂຫຼດເອກະສານໄດ້');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);
    setIsThinking(true);

    setMessages(prev => [
      ...prev,
      { 
        id: Date.now(), 
        role: 'user', 
        content: userMessage, 
        timestamp: new Date().toISOString(),
        documents: selectedDocs.length > 0 ? selectedDocs : null
      }
    ]);

    try {
      const response = await ragService.askWithRAG(
        userMessage,
        selectedDocs.length > 0 ? selectedDocs : null,
        language,
        searchMode
      );

      if (response.success) {
        const answer = response.data.answer;
        const context = response.data.context || [];
        const docs = response.data.documents || [];

        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'assistant',
            content: answer.answer || 'No answer',
            timestamp: new Date().toISOString(),
            context: context,
            documents: docs,
            metadata: {
              sources: docs.join(', '),
              relevance: context.length,
              usage: answer.usage || null,
              searchMode: searchMode
            }
          }
        ]);
      } else {
        throw new Error(response.message || 'Failed to get answer');
      }
    } catch (error) {
      console.error('RAG error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: 'ຂໍໂທດ, ການຕອບຄຳຖາມມີບັນຫາ. ກະລຸນາລອງໃໝ່.',
          timestamp: new Date().toISOString(),
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
      setIsThinking(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleDocument = (docId) => {
    setSelectedDocs(prev => {
      if (prev.includes(docId)) {
        return prev.filter(id => id !== docId);
      } else {
        return [...prev, docId];
      }
    });
  };

  const toggleAllDocuments = () => {
    if (selectedDocs.length === documents.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(documents.map(doc => doc.id));
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('ສຳເນົາສຳເລັດ!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
  };

  const getLanguageLabel = (lang) => {
    const labels = {
      'both': '🌍 Both (Lao + English)',
      'lao': '🇱🇦 Lao Only',
      'english': '🇬🇧 English Only'
    };
    return labels[lang] || lang;
  };

  const getSearchModeLabel = (mode) => {
    const labels = {
      'semantic': '🧠 Semantic',
      'keyword': '🔑 Keyword',
      'hybrid': '⚡ Hybrid'
    };
    return labels[mode] || mode;
  };

  const suggestions = [
    { icon: BookOpen, text: "ສະຫຼຸບເນື້ອຫາຫຼັກຂອງເອກະສານ", color: "from-blue-400 to-blue-600" },
    { icon: Star, text: "ຈຸດສຳຄັນທີ່ສຸດແມ່ນຫຍັງ?", color: "from-amber-400 to-amber-600" },
    { icon: Lightbulb, text: "What are the key takeaways?", color: "from-yellow-400 to-yellow-600" },
    { icon: Compass, text: "Explain the main concepts in simple terms", color: "from-emerald-400 to-emerald-600" }
  ];

  const handleSuggestion = (suggestion) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const getDocumentIcon = (doc) => {
    if (doc.title?.toLowerCase().includes('pdf')) return FileText;
    if (doc.title?.toLowerCase().includes('doc')) return FileText;
    return File;
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-100 via-violet-50/40 to-indigo-100/40">
      {/* Decorative Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="flex flex-col h-full max-w-6xl mx-auto p-4">
        {/* Header - Premium Design */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-xl shadow-black/5 mb-4"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-xl blur-xl opacity-30 animate-pulse"></div>
              <div className="relative p-2.5 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl shadow-lg shadow-violet-500/30">
                <Brain className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center gap-2">
                RAG Assistant
                <span className="px-2 py-0.5 text-[10px] font-medium bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-full shadow-lg shadow-violet-500/30">
                  v2.0
                </span>
              </h1>
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Ask questions about your documents with AI-powered search
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Mode Selector */}
            <div className="flex items-center gap-1 bg-gray-100/70 rounded-xl p-0.5">
              {['semantic', 'keyword', 'hybrid'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSearchMode(mode)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    searchMode === mode
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {getSearchModeLabel(mode)}
                </button>
              ))}
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100/70 rounded-xl">
              <Globe className="h-3.5 w-3.5 text-gray-500" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-xs font-medium text-gray-700 focus:outline-none cursor-pointer"
              >
                <option value="both">🌍 Both</option>
                <option value="lao">🇱🇦 Lao</option>
                <option value="english">🇬🇧 English</option>
              </select>
            </div>

            {/* Document Selector Button */}
            <button
              onClick={() => setShowDocSelector(!showDocSelector)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                showDocSelector 
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30' 
                  : 'bg-gray-100/70 text-gray-600 hover:bg-gray-200'
              }`}
              title="Select Documents"
            >
              <Layers className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{selectedDocs.length} docs</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${showDocSelector ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </motion.div>

        {/* Document Selector - Enhanced */}
        <AnimatePresence>
          {showDocSelector && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg mb-4"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Database className="h-4 w-4 text-violet-500" />
                    Select Documents to Search
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {selectedDocs.length} of {documents.length} selected
                    </span>
                    <button
                      onClick={toggleAllDocuments}
                      className="text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors px-2 py-1 hover:bg-violet-50 rounded-lg"
                    >
                      {selectedDocs.length === documents.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {documents.map(doc => {
                    const Icon = getDocumentIcon(doc);
                    return (
                      <button
                        key={doc.id}
                        onClick={() => toggleDocument(doc.id)}
                        className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                          selectedDocs.includes(doc.id)
                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30'
                            : 'bg-gray-100/70 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Icon className={`h-3 w-3 ${selectedDocs.includes(doc.id) ? 'text-white/80' : 'text-gray-400'}`} />
                        <span className="max-w-[150px] truncate">
                          {doc.title || doc.filename || 'Untitled'}
                        </span>
                        {selectedDocs.includes(doc.id) && (
                          <Check className="h-3 w-3 ml-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {documents.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2">
                    No documents found. Please upload some PDFs first.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages Area - Enhanced */}
        <div className="flex-1 overflow-y-auto rounded-2xl bg-white/30 backdrop-blur-sm border border-white/50 p-4 space-y-4 custom-scrollbar">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full text-center py-12"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-indigo-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                <div className="relative p-5 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-3xl shadow-2xl shadow-violet-500/30">
                  <Brain className="h-14 w-14 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mt-6">
                RAG Assistant
              </h3>
              <p className="text-sm text-gray-500 max-w-md mt-2">
                Ask questions about your documents. The AI will search through your PDFs 
                and provide answers based on the content.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <span className="px-3 py-1.5 bg-violet-50 text-violet-600 rounded-full text-xs font-medium flex items-center gap-1">
                  <File className="h-3 w-3" />
                  {documents.length} doc{documents.length > 1 ? 's' : ''}
                </span>
                <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium flex items-center gap-1">
                  <Search className="h-3 w-3" />
                  Smart Search
                </span>
                <span className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  AI Powered
                </span>
                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Secure
                </span>
              </div>

              {/* Suggestions - Enhanced */}
              <div className="mt-6 w-full max-w-xl">
                <p className="text-xs font-medium text-gray-400 mb-3 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                  Suggested Questions
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSuggestion(suggestion.text)}
                      className={`text-left px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-violet-300 hover:bg-violet-50/50 hover:text-violet-700 transition-all shadow-sm hover:shadow-md group flex items-center gap-2`}
                    >
                      <div className={`p-1.5 bg-gradient-to-br ${suggestion.color} rounded-lg`}>
                        <suggestion.icon className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span className="flex-1">{suggestion.text}</span>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence>
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] ${isUser ? 'order-1' : ''}`}>
                      <motion.div 
                        className={`rounded-2xl p-4 shadow-lg ${
                          isUser
                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-violet-500/30'
                            : msg.isError
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-white text-gray-900 border border-gray-100 shadow-xl'
                        }`}
                        whileHover={!isUser && !msg.isError ? { boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05)" } : {}}
                      >
                        <div className="prose prose-sm max-w-none prose-headings:text-inherit prose-strong:text-inherit">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                        
                        {/* Copy button for assistant messages */}
                        {!isUser && !msg.isError && (
                          <div className="flex justify-end mt-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => copyToClipboard(msg.content, index)}
                              className="p-1.5 text-gray-400 hover:text-violet-600 rounded-lg hover:bg-violet-50 transition-all"
                            >
                              {copiedIndex === index ? (
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </motion.button>
                          </div>
                        )}
                        
                        {/* Sources */}
                        {msg.documents && msg.documents.length > 0 && !isUser && (
                          <div className="mt-3 pt-3 border-t border-gray-200/50">
                            <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                              <FileText className="h-3 w-3 text-violet-500" />
                              Sources:
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {msg.documents.map((doc, i) => (
                                <span key={i} className="text-xs px-2.5 py-1 bg-violet-50 rounded-full text-violet-700 flex items-center gap-1 border border-violet-100">
                                  <File className="h-2.5 w-2.5 text-violet-400" />
                                  {doc.length > 20 ? doc.substring(0, 20) + '...' : doc}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Metadata */}
                        {msg.metadata && !isUser && !msg.isError && (
                          <div className="mt-2 text-xs text-gray-400 flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100/50">
                            {msg.metadata.searchMode && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full">
                                <Search className="h-2.5 w-2.5" />
                                {getSearchModeLabel(msg.metadata.searchMode)}
                              </span>
                            )}
                            {msg.context && msg.context.length > 0 && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full">
                                <Database className="h-2.5 w-2.5" />
                                {msg.context.length} chunks
                              </span>
                            )}
                            {msg.metadata.usage && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full">
                                <Zap className="h-2.5 w-2.5" />
                                ~{msg.metadata.usage.total_tokens || 0} tokens
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              {formatTime(msg.timestamp)}
                            </span>
                          </div>
                        )}
                      </motion.div>
                      
                      {!isUser && !msg.isError && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-0.5 text-violet-500">
                            <Sparkle className="h-3 w-3" />
                            AI
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Shield className="h-3 w-3" />
                            RAG
                          </span>
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          
          {/* Thinking Animation - Enhanced */}
          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2.5 h-2.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2.5 h-2.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Searching documents with {getSearchModeLabel(searchMode)}...</span>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-black/5 p-3"
        >
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={selectedDocs.length > 0 
                  ? `Ask a question about ${selectedDocs.length} document${selectedDocs.length > 1 ? 's' : ''}...` 
                  : "No documents selected. Please select documents to search..."}
                className="w-full p-3 pr-12 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all min-h-[52px] max-h-32 text-sm bg-gray-50/50 placeholder:text-gray-400"
                rows={1}
                disabled={loading || selectedDocs.length === 0}
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-1.5 text-xs text-gray-400">
                {selectedDocs.length > 0 && (
                  <span className="flex items-center gap-1 bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full">
                    <FileText className="h-3 w-3" />
                    {selectedDocs.length}
                  </span>
                )}
              </div>
            </div>
            <motion.button
              whileHover={(input.trim() && !loading && selectedDocs.length > 0) ? { scale: 1.05 } : {}}
              whileTap={(input.trim() && !loading && selectedDocs.length > 0) ? { scale: 0.95 } : {}}
              onClick={handleSend}
              disabled={!input.trim() || loading || selectedDocs.length === 0}
              className={`px-5 py-3 rounded-xl transition-all flex items-center gap-2 ${
                input.trim() && !loading && selectedDocs.length > 0
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span className="text-sm font-medium hidden sm:inline">Send</span>
                </>
              )}
            </motion.button>
          </div>
          <div className="flex flex-wrap items-center justify-between mt-2.5 px-1">
            <div className="flex items-center gap-3 text-xs text-gray-400">
              {selectedDocs.length > 0 ? (
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle className="h-3 w-3" />
                  {selectedDocs.length} documents ready
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-600">
                  <AlertCircle className="h-3 w-3" />
                  No documents selected
                </span>
              )}
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Press Enter to send</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">Shift+Enter for new line</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {getLanguageLabel(language).split(' ').slice(0, 2).join(' ')}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline text-violet-500 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Secure
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}