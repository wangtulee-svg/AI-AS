// frontend/src/pages/chat/Chat.jsx

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';
import { fileService } from '../../services/fileService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  MessageSquare, 
  Sparkles, 
  Trash2, 
  Plus,
  User,
  Bot,
  Loader2,
  Clock,
  ChevronDown,
  Zap,
  Brain,
  Mic,
  Paperclip,
  Smile,
  CornerDownLeft,
  Settings,
  X,
  Check,
  Volume2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Edit3,
  MoreVertical,
  ChevronRight,
  ArrowRight,
  History,
  Star,
  BookOpen,
  Lightbulb,
  Compass,
  Rocket,
  Globe,
  Shield,
  Coffee,
  Heart,
  Award,
  Crown,
  Sparkle,
  Image,
  File,
  FileText as FileIcon,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState(null);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [userFiles, setUserFiles] = useState([]);
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [showSessionList, setShowSessionList] = useState(false);
  const [modal, setModal] = useState({ 
    isOpen: false, 
    type: null,
    title: '',
    message: '',
    confirmText: '',
    icon: null,
    color: ''
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // ============================================
  // Load Data
  // ============================================
  useEffect(() => {
    loadSessions();
    loadUserFiles();
    // ສ້າງ Session ໃໝ່ ຖ້າຍັງບໍ່ມີ
    if (!currentSessionId) {
      createNewSession();
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ============================================
  // Session Management
  // ============================================
  const loadSessions = async () => {
    try {
      const response = await chatService.getSessions();
      if (response.success) {
        setSessions(response.data);
        // ຖ້າມີ Sessions, ໂຫຼດອັນຫຼ້າສຸດ
        if (response.data.length > 0 && !currentSessionId) {
          const latestSession = response.data[0];
          setCurrentSessionId(latestSession.id);
          await loadSessionHistory(latestSession.id);
        }
      }
    } catch (error) {
      console.error('Load sessions error:', error);
    }
  };

  const createNewSession = async () => {
    try {
      const response = await chatService.createSession();
      if (response.success) {
        const newSessionId = response.data.session_id;
        setCurrentSessionId(newSessionId);
        setSessionId(newSessionId);
        setMessages([]);
        setShowQuickActions(true);
        setUploadedFiles([]);
        setSelectedFileId(null);
        setSelectedFileName(null);
        await loadSessions();
        toast.success('ເລີ່ມການສົນທະນາໃໝ່! 🎉');
      }
    } catch (error) {
      console.error('Failed to create session:', error);
      toast.error('ບໍ່ສາມາດສ້າງການສົນທະນາໃໝ່ໄດ້');
    }
  };

  const loadSessionHistory = async (sessionId) => {
    try {
      const response = await chatService.getHistory(sessionId);
      if (response.success && response.data.length > 0) {
        const formattedMessages = response.data.flatMap(msg => [
          { 
            id: msg.id, 
            role: 'user', 
            content: msg.message, 
            timestamp: msg.created_at,
            isFirst: false,
            files: msg.files || []
          },
          { 
            id: msg.id + '-response', 
            role: 'assistant', 
            content: msg.response, 
            timestamp: msg.created_at,
            isFirst: false,
            files: []
          },
        ]);
        setMessages(formattedMessages);
        setShowQuickActions(false);
      } else {
        setMessages([]);
        setShowQuickActions(true);
      }
    } catch (error) {
      console.error('Load session history error:', error);
      setMessages([]);
      setShowQuickActions(true);
    }
  };

  const loadSession = async (sessionId) => {
    try {
      setCurrentSessionId(sessionId);
      setSessionId(sessionId);
      await loadSessionHistory(sessionId);
      setShowSessionList(false);
      toast.success('ໂຫຼດການສົນທະນາສຳເລັດ');
    } catch (error) {
      console.error('Load session error:', error);
      toast.error('ບໍ່ສາມາດໂຫຼດການສົນທະນາໄດ້');
    }
  };

  const deleteSession = async (sessionId) => {
    if (!confirm('ທ່ານຕ້ອງການລຶບການສົນທະນານີ້ບໍ່?')) return;
    
    try {
      const response = await chatService.deleteSession(sessionId);
      if (response.success) {
        toast.success('ລຶບການສົນທະນາສຳເລັດ');
        await loadSessions();
        if (sessionId === currentSessionId) {
          // ຖ້າລຶບ Session ປັດຈຸບັນ, ສ້າງໃໝ່
          await createNewSession();
        }
      }
    } catch (error) {
      console.error('Delete session error:', error);
      toast.error('ລຶບການສົນທະນາບໍ່ສຳເລັດ');
    }
  };

  // ============================================
  // File Management
  // ============================================
  const loadUserFiles = async () => {
    try {
      const response = await fileService.getFiles();
      if (response.success) {
        setUserFiles(response.data);
      }
    } catch (error) {
      console.error('Load files error:', error);
    }
  };

  const handleFileUpload = async (e, type = 'file') => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const maxSize = 10 * 1024 * 1024;
    const validFiles = files.filter(f => f.size <= maxSize);
    
    if (validFiles.length === 0) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    setIsFileUploading(true);
    try {
      const file = validFiles[0];
      const response = await fileService.uploadFile(file);
      
      if (response.success) {
        setSelectedFileId(response.data.fileId);
        setSelectedFileName(file.name);
        toast.success(`File "${file.name}" uploaded successfully!`);
        await loadUserFiles();
        setShowFileSelector(false);
      } else {
        toast.error(response.message || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsFileUploading(false);
      e.target.value = '';
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // ============================================
  // Message Management
  // ============================================
  const handleSend = async () => {
    if ((!input.trim() && uploadedFiles.length === 0 && !selectedFileId) || loading) return;

    const userMessage = input.trim() || 'What is this document about?';
    setInput('');
    setLoading(true);
    setIsTyping(true);
    setShowQuickActions(false);

    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        role: 'user',
        content: selectedFileId 
          ? `📄 ${selectedFileName}\n\n${userMessage}`
          : userMessage || '📎 ສົ່ງໄຟລ໌',
        timestamp: new Date().toISOString(),
        isFirst: false,
        files: [...uploadedFiles],
        fileId: selectedFileId,
        fileName: selectedFileName,
      },
    ]);

    try {
      const response = await chatService.sendMessage(
        userMessage || 'ຂ້ອຍໄດ້ສົ່ງໄຟລ໌ມາ',
        currentSessionId,
        null,
        selectedFileId
      );
      
      if (response.success) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'assistant',
            content: response.data.response,
            timestamp: new Date().toISOString(),
            isFirst: false,
            files: [],
            fileId: null,
            fileName: null,
          },
        ]);
        
        setSelectedFileId(null);
        setSelectedFileName(null);
        setUploadedFiles([]);
        
        // ອັບເດດລາຍຊື່ Session (ເພື່ອອັບເດດ preview)
        await loadSessions();
      } else {
        const errorMsg = response.message || response.errors?.[0]?.msg || 'Unknown error';
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'assistant',
            content: `Error: ${errorMsg}`,
            timestamp: new Date().toISOString(),
            isError: true,
            isFirst: false,
            files: [],
            fileId: null,
            fileName: null,
          },
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = error.response?.data?.message || 
                       error.response?.data?.errors?.[0]?.msg ||
                       'Failed to get response from server';
      
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: `Error: ${errorMsg}`,
          timestamp: new Date().toISOString(),
          isError: true,
          isFirst: false,
          files: [],
          fileId: null,
          fileName: null,
        },
      ]);
    } finally {
      setLoading(false);
      setIsTyping(false);
      setUploadedFiles([]);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('ສຳເນົາສຳເລັດ!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // ============================================
  // Modal Handlers
  // ============================================
  const handleNewChat = () => {
    if (messages.length === 0) {
      toast.info('ທ່ານຢູ່ໃນການສົນທະນາໃໝ່ແລ້ວ');
      return;
    }
    
    setModal({
      isOpen: true,
      type: 'newChat',
      title: 'ເລີ່ມການສົນທະນາໃໝ່',
      message: 'ທ່ານກຳລັງຈະເລີ່ມການສົນທະນາໃໝ່ ເຊິ່ງຈະລຶບຂໍ້ຄວາມທັງໝົດໃນການສົນທະນາປັດຈຸບັນ',
      confirmText: 'ເລີ່ມໃໝ່',
      icon: Plus,
      color: 'from-blue-500 to-indigo-600'
    });
  };

  const confirmNewChat = async () => {
    await createNewSession();
    setModal({ isOpen: false, type: null, title: '', message: '', confirmText: '', icon: null, color: '' });
  };

  const handleDelete = () => {
    if (messages.length === 0) {
      toast.info('ບໍ່ມີຂໍ້ຄວາມໃຫ້ລຶບ');
      return;
    }
    
    setModal({
      isOpen: true,
      type: 'delete',
      title: 'ລຶບປະຫວັດການສົນທະນາ',
      message: 'ທ່ານກຳລັງຈະລຶບປະຫວັດການສົນທະນາທັງໝົດ ການກະທຳນີ້ບໍ່ສາມາດກັບຄືນໄດ້',
      confirmText: 'ຢືນຢັນການລຶບ',
      icon: Trash2,
      color: 'from-red-500 to-rose-600'
    });
  };

  const confirmDelete = async () => {
    try {
      await chatService.clearHistory(currentSessionId);
      setMessages([]);
      setShowQuickActions(true);
      setUploadedFiles([]);
      setSelectedFileId(null);
      setSelectedFileName(null);
      await createNewSession();
      toast.success('ລຶບປະຫວັດການສົນທະນາສຳເລັດ! 🗑️');
      setModal({ isOpen: false, type: null, title: '', message: '', confirmText: '', icon: null, color: '' });
    } catch (error) {
      console.error('Failed to clear history:', error);
      toast.error('ລຶບປະຫວັດບໍ່ສຳເລັດ');
    }
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: null, title: '', message: '', confirmText: '', icon: null, color: '' });
  };

  // ============================================
  // Helpers
  // ============================================
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const getFileIcon = (file) => {
    const type = file.type;
    if (type.startsWith('image/')) return Image;
    if (type === 'application/pdf') return FileIcon;
    return File;
  };

  const quickQuestions = [
    "What is machine learning?",
    "Explain binary search",
    "How to study effectively?",
    "What is the difference between AI and ML?",
    "Help me with my assignment",
    "Summarize my last lecture"
  ];

  const quickActions = [
    { icon: Lightbulb, label: 'Explain concept', color: 'from-yellow-400 to-orange-500' },
    { icon: Compass, label: 'Study guide', color: 'from-blue-400 to-indigo-500' },
    { icon: BookOpen, label: 'Summarize', color: 'from-emerald-400 to-teal-500' },
    { icon: Rocket, label: 'Quick help', color: 'from-purple-400 to-pink-500' },
  ];

  const handleQuickQuestion = (question) => {
    setInput(question);
    inputRef.current?.focus();
  };

  // ============================================
  // Render
  // ============================================
  return (
    <div className="h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-100 via-blue-50/40 to-indigo-100/40 relative">
      {/* Decorative Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Session List Sidebar */}
      <AnimatePresence>
        {showSessionList && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm"
              onClick={() => setShowSessionList(false)}
            />
            
            <motion.div
              initial={{ x: -380, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -380, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[340px] bg-white/95 backdrop-blur-xl border-r border-gray-200 shadow-2xl z-30 overflow-hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">Chat History</h3>
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-medium">
                        {sessions.length}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowSessionList(false)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={createNewSession}
                    className="w-full mt-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    New Chat
                  </button>
                </div>
                
                {/* Session List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  {sessions.length > 0 ? (
                    sessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => loadSession(session.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl transition-all group ${
                          session.id === currentSessionId
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {session.title || 'New Chat'}
                            </p>
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                              {session.preview || 'No messages'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-gray-400">
                                {formatTime(session.lastMessageTime || session.created_at)}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                • {session.messageCount || 0} messages
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSession(session.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-sm font-medium text-gray-500">No chat history</p>
                      <p className="text-xs text-gray-400 mt-1">Start a new conversation</p>
                    </div>
                  )}
                </div>
                
                {/* Footer */}
                <div className="p-3 border-t border-gray-200 bg-gray-50/50">
                  <p className="text-[10px] text-gray-400 text-center">
                    {sessions.length} conversations total
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {modal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className={`h-2 w-full bg-gradient-to-r ${modal.color}`}></div>
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors z-10"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="p-8 pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <div className={`absolute inset-0 bg-gradient-to-br ${modal.color} rounded-full blur-2xl opacity-20`}></div>
                      <div className={`relative h-20 w-20 rounded-2xl bg-gradient-to-br ${modal.color} flex items-center justify-center shadow-lg shadow-${modal.color.split(' ')[0].replace('from-', '')}/30`}>
                        {modal.icon && <modal.icon className="h-10 w-10 text-white" />}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{modal.title}</h3>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">{modal.message}</p>
                    {modal.type === 'delete' && (
                      <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-100 mb-6 w-full">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        <span>ການກະທຳນີ້ບໍ່ສາມາດກັບຄືນໄດ້ ກະລຸນາຢືນຢັນອີກຄັ້ງ</span>
                      </div>
                    )}
                    {modal.type === 'newChat' && (
                      <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100 mb-6 w-full">
                        <MessageSquare className="h-4 w-4 flex-shrink-0" />
                        <span>ຈະລຶບຂໍ້ຄວາມທັງໝົດ {messages.length} ຂໍ້ຄວາມ</span>
                      </div>
                    )}
                    <div className="flex gap-3 w-full">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={closeModal}
                        className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all"
                      >
                        ຍົກເລີກ
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: `0 20px 25px -5px rgba(0, 0, 0, 0.2)` }}
                        whileTap={{ scale: 0.98 }}
                        onClick={modal.type === 'newChat' ? confirmNewChat : confirmDelete}
                        className={`flex-1 px-4 py-3 bg-gradient-to-r ${modal.color} text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-${modal.color.split(' ')[0].replace('from-', '')}/30`}
                      >
                        {modal.confirmText}
                      </motion.button>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">
                      ກົດ <kbd className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">ESC</kbd> ເພື່ອຍົກເລີກ
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex flex-col h-full max-w-6xl mx-auto p-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-xl shadow-black/5 mb-4"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur-xl opacity-30 animate-pulse"></div>
              <div className="relative p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center gap-2">
                AI Chat Assistant
                <span className="px-2 py-0.5 text-[10px] font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full shadow-lg shadow-emerald-500/30">
                  Live
                </span>
              </h1>
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Powered by AI • {messages.length > 0 ? `${Math.ceil(messages.length / 2)} messages` : 'Ready to help'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSessionList(!showSessionList)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-white/80 hover:bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:border-gray-300 transition-all"
            >
              <History className="h-4 w-4" />
              History
              {sessions.length > 0 && (
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-medium">
                  {sessions.length}
                </span>
              )}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNewChat}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <Trash2 className="h-4 w-4" />
            </motion.button>
          </div>
        </motion.div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto rounded-2xl bg-white/30 backdrop-blur-sm border border-white/50 p-4 space-y-4 custom-scrollbar">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full text-center py-12"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                <div className="relative p-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-2xl shadow-blue-500/30">
                  <MessageSquare className="h-14 w-14 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mt-6">
                Welcome to AI Chat!
              </h3>
              <p className="text-sm text-gray-500 max-w-md mt-2">
                Start a conversation with the AI assistant. Ask any question about your studies, assignments, or any topic!
              </p>
              
              {/* Quick Questions */}
              <div className="mt-6 w-full max-w-2xl">
                <p className="text-xs font-medium text-gray-400 mb-3 flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-yellow-500" />
                  Quick Questions
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {quickQuestions.map((q, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleQuickQuestion(q)}
                      className="text-left px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 transition-all shadow-sm hover:shadow-md group"
                    >
                      <div className="flex items-center justify-between">
                        <span>{q}</span>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 w-full max-w-2xl">
                <p className="text-xs font-medium text-gray-400 mb-3 flex items-center gap-2">
                  <Rocket className="h-3.5 w-3.5 text-purple-500" />
                  Quick Actions
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleQuickQuestion(`Please ${action.label.toLowerCase()} this for me`)}
                      className={`p-3 bg-gradient-to-br ${action.color} rounded-xl text-white shadow-lg shadow-${action.color.split(' ')[0].replace('from-', '')}/30 hover:shadow-xl transition-all text-xs font-medium`}
                    >
                      <action.icon className="h-5 w-5 mx-auto mb-1" />
                      {action.label}
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
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] ${isUser ? 'order-1' : ''}`}>
                      <motion.div 
                        className={`rounded-2xl p-4 shadow-lg ${
                          isUser
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/30'
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
                        
                        {isUser && msg.files && msg.files.length > 0 && (
                          <div className="mt-3 space-y-1.5">
                            {msg.files.map((file, idx) => {
                              const Icon = getFileIcon(file);
                              const isImage = file.type?.startsWith('image/');
                              return (
                                <div key={idx} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-2">
                                  {isImage ? (
                                    <img 
                                      src={URL.createObjectURL(file)} 
                                      alt={file.name}
                                      className="h-10 w-10 object-cover rounded"
                                    />
                                  ) : (
                                    <Icon className="h-5 w-5 text-white/70" />
                                  )}
                                  <span className="text-xs text-white/90 truncate flex-1">
                                    {file.name}
                                  </span>
                                  <span className="text-[10px] text-white/60">
                                    {(file.size / 1024).toFixed(1)} KB
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        {!isUser && !msg.isError && (
                          <div className="flex justify-end mt-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => copyToClipboard(msg.content, index)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
                            >
                              {copiedIndex === index ? (
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </motion.button>
                          </div>
                        )}
                      </motion.div>
                      
                      <div className={`flex items-center gap-2 mt-1.5 text-xs text-gray-400 ${isUser ? 'justify-end' : ''}`}>
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(msg.timestamp)}</span>
                        {isUser && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-emerald-500">
                              <Check className="h-3 w-3" />
                              Sent
                            </span>
                          </>
                        )}
                        {!isUser && !msg.isError && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-blue-500">
                              <Sparkle className="h-3 w-3" />
                              AI
                            </span>
                          </>
                        )}
                      </div>
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
          
          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs font-medium text-gray-500">AI is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* File Selector */}
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => setShowFileSelector(!showFileSelector)}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-all"
          >
            <Paperclip className="h-3 w-3" />
            {selectedFileId ? `📄 ${selectedFileName}` : 'Attach file'}
            {selectedFileId && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFileId(null);
                  setSelectedFileName(null);
                }}
                className="text-red-500 hover:text-red-600 ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </button>
          {isFileUploading && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Uploading...
            </span>
          )}
        </div>

        {/* File Selector Dropdown */}
        <AnimatePresence>
          {showFileSelector && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 p-3 bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileUpload(e, 'file')}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                />
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={(e) => handleFileUpload(e, 'image')}
                  className="hidden"
                  accept="image/*"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs hover:bg-blue-100 transition-all flex items-center gap-1.5"
                >
                  <File className="h-3 w-3" />
                  Upload File
                </button>
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs hover:bg-emerald-100 transition-all flex items-center gap-1.5"
                >
                  <Image className="h-3 w-3" />
                  Upload Image
                </button>
              </div>
              
              {userFiles.length > 0 && (
                <div className="mt-2 border-t border-gray-100 pt-2">
                  <p className="text-xs text-gray-400 mb-1">Your uploaded files:</p>
                  <div className="max-h-32 overflow-y-auto space-y-1 custom-scrollbar">
                    {userFiles.slice(0, 5).map(file => (
                      <button
                        key={file.id}
                        onClick={() => {
                          setSelectedFileId(file.id);
                          setSelectedFileName(file.filename);
                          setShowFileSelector(false);
                          toast.success(`Selected: ${file.filename}`);
                        }}
                        className="w-full text-left text-xs px-2 py-1.5 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-all"
                      >
                        {file.file_type === 'pdf' ? (
                          <FileIcon className="h-3 w-3 text-red-400" />
                        ) : (
                          <Image className="h-3 w-3 text-emerald-400" />
                        )}
                        <span className="truncate flex-1">{file.filename}</span>
                        <span className="text-[10px] text-gray-400">
                          {(file.file_size / 1024).toFixed(0)} KB
                        </span>
                      </button>
                    ))}
                    {userFiles.length > 5 && (
                      <p className="text-[10px] text-gray-400 text-center">+{userFiles.length - 5} more files</p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Uploaded Files Preview */}
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex flex-wrap gap-2 p-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200"
          >
            {uploadedFiles.map((file, index) => {
              const Icon = getFileIcon(file);
              const isImage = file.type?.startsWith('image/');
              return (
                <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
                  {isImage ? (
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt={file.name}
                      className="h-8 w-8 object-cover rounded"
                    />
                  ) : (
                    <Icon className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="text-xs text-gray-700 max-w-[80px] truncate">
                    {file.name}
                  </span>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-0.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Input Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-black/5 p-3"
        >
          <div className="flex items-end gap-2 bg-gray-50/50 rounded-xl border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200 transition-all p-1.5">
            <div className="flex items-center gap-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors relative"
                title="Attach file"
              >
                <Paperclip className="h-5 w-5" />
              </button>
            </div>

            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything about your studies..."
              className="flex-1 p-2 bg-transparent resize-none focus:outline-none min-h-[44px] max-h-32 text-sm text-gray-700 placeholder:text-gray-400"
              rows={1}
              disabled={loading}
            />
            
            <div className="flex items-center gap-1">
              <button
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                title="Use voice"
              >
                <Mic className="h-5 w-5" />
              </button>
              <motion.button
                whileHover={(input.trim() || uploadedFiles.length > 0 || selectedFileId) && !loading ? { scale: 1.05 } : {}}
                whileTap={(input.trim() || uploadedFiles.length > 0 || selectedFileId) && !loading ? { scale: 0.95 } : {}}
                onClick={handleSend}
                disabled={(!input.trim() && uploadedFiles.length === 0 && !selectedFileId) || loading}
                className={`p-2.5 rounded-xl transition-all ${
                  (input.trim() || uploadedFiles.length > 0 || selectedFileId) && !loading
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </motion.button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2.5 px-1">
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <CornerDownLeft className="h-3 w-3" />
                Enter to send
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Shift+Enter for new line</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="font-medium">{loading ? 'Processing...' : 'Ready'}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline text-blue-500 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Secure
              </span>
            </div>
          </div>
        </motion.div>
      </div>

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