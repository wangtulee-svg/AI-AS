import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  FileText, 
  Clock, 
  MessageCircle, 
  FileQuestion,
  Loader2,
  Copy,
  Check,
  Sparkles,
  Download,
  Share2,
  BookOpen,
  Calendar,
  User,
  Globe,
  Languages,
  Send,
  Bot,
  Zap,
  Shield,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Heart,
  Eye,
  Layers,
  Info,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock as ClockIcon,
  Tag,
  Printer,
  Save,
  MoreVertical
} from 'lucide-react';
import { pdfService } from '../../services/pdfService';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [answering, setAnswering] = useState(false);
  const [language, setLanguage] = useState('both');
  const [showQuestions, setShowQuestions] = useState(true);
  const [copiedText, setCopiedText] = useState(null);
  const answerRef = useRef(null);
  const questionsRef = useRef(null);

  useEffect(() => {
    loadDocument();
  }, [id]);

  useEffect(() => {
    if (answer && answerRef.current) {
      answerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [answer]);

  const loadDocument = async () => {
    setLoading(true);
    try {
      const response = await pdfService.getDetail(id);
      if (response.success) {
        setDocument(response.data);
      }
    } catch (error) {
      console.error('Load document error:', error);
      toast.error('ບໍ່ສາມາດໂຫຼດເອກະສານໄດ້');
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim() || answering) return;

    setAnswering(true);
    setAnswer('');
    try {
      const response = await pdfService.askPDF(id, question, language);
      if (response.success) {
        setAnswer(response.data.answer.answer);
        setDocument(prev => ({
          ...prev,
          questions: [{
            question: question,
            answer: response.data.answer.answer,
            created_at: new Date().toISOString(),
          }, ...(prev.questions || [])],
        }));
        setQuestion('');
        toast.success('ໄດ້ຮັບຄຳຕອບແລ້ວ!');
      }
    } catch (error) {
      console.error('Ask error:', error);
      toast.error('ບໍ່ສາມາດຕອບຄຳຖາມໄດ້');
    } finally {
      setAnswering(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    toast.success('ສຳເນົາແລ້ວ!');
    setTimeout(() => setCopiedText(null), 2000);
  };

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'ຕອນນີ້';
    if (minutes < 60) return `${minutes} ນາທີກ່ອນ`;
    if (hours < 24) return `${hours} ຊົ່ວໂມງກ່ອນ`;
    if (days < 7) return `${days} ມື້ກ່ອນ`;
    return new Date(date).toLocaleDateString('lo-LA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getLanguageLabel = (lang) => {
    const labels = {
      both: 'ທັງສອງພາສາ',
      lao: 'ພາສາລາວ',
      english: 'ພາສາອັງກິດ'
    };
    return labels[lang] || lang;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-indigo-100/40 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="h-20 w-20 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-sm font-medium text-gray-500 animate-pulse">ກຳລັງໂຫຼດເອກະສານ...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-indigo-100/40 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 text-center max-w-md border border-white/50 shadow-2xl"
        >
          <div className="inline-flex p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
            <FileText className="h-16 w-16 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">ບໍ່ພົບເອກະສານ</h3>
          <p className="text-gray-500 mb-6">ເອກະສານທີ່ທ່ານຊອກຫາອາດຈະຖືກລົບ ຫຼື ບໍ່ມີຢູ່</p>
          <Button
            variant="gradient"
            onClick={() => navigate('/documents')}
            className="shadow-xl shadow-blue-500/30"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            ກັບໄປຫາເອກະສານ
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-indigo-100/40 p-4 md:p-6">
      {/* Decorative Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/documents')}
          className="group flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">ກັບໄປຫາເອກະສານ</span>
        </motion.button>

        {/* Document Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl shadow-black/5 p-6 md:p-8 mb-6 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5"></div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          
          <div className="relative flex flex-col md:flex-row md:items-start gap-6">
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-30"></div>
                <div className="relative p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30">
                  <FileText className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {document.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                    <span className="flex items-center gap-1 text-gray-500 bg-gray-100/70 px-3 py-1 rounded-full">
                      <FileText className="h-3.5 w-3.5" />
                      {document.pages || '?'} ໜ້າ
                    </span>
                    <span className="flex items-center gap-1 text-gray-500 bg-gray-100/70 px-3 py-1 rounded-full">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDate(document.created_at)}
                    </span>
                    <span className="flex items-center gap-1 text-gray-500 bg-gray-100/70 px-3 py-1 rounded-full">
                      <Layers className="h-3.5 w-3.5" />
                      {formatFileSize(document.file_size)}
                    </span>
                    {document.summary && (
                      <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50/80 px-3 py-1 rounded-full border border-emerald-200">
                        <CheckCircle className="h-3.5 w-3.5" />
                        ສັງເຄາະແລ້ວ
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.open(`/api/pdf/download/${document.id}`, '_blank')}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    ດາວໂຫຼດ
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-all"
                  >
                    <Share2 className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-all"
                  >
                    <Save className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Summary Section */}
        {document.summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl shadow-black/5 p-6 md:p-8 mb-6 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5"></div>
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">ບົດສັງເຄາະ</h2>
                    <p className="text-xs text-gray-500">ສະຫຼຸບເນື້ອໃນຫຼັກຂອງເອກະສານ</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => copyToClipboard(document.summary, 'summary')}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all"
                >
                  {copiedText === 'summary' ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </motion.button>
              </div>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap bg-gradient-to-br from-blue-50/30 to-indigo-50/30 p-4 rounded-xl border border-blue-100/30">
                {document.summary}
              </div>
            </div>
          </motion.div>
        )}

        {/* Q&A Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl shadow-black/5 p-6 md:p-8 mb-6 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5"></div>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"></div>
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                <MessageCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">ຖາມ-ຕອບ ກັບ AI</h2>
                <p className="text-xs text-gray-500">ຖາມຄຳຖາມກ່ຽວກັບເອກະສານນີ້ ແລະ ຮັບຄຳຕອບທັນທີ</p>
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">ພາສາທີ່ຕອບ:</span>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="flex-1 min-w-[150px] px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm"
              >
                <option value="both">🇱🇦 + 🇬🇧 ທັງສອງພາສາ</option>
                <option value="lao">🇱🇦 ພາສາລາວ</option>
                <option value="english">🇬🇧 ພາສາອັງກິດ</option>
              </select>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Info className="h-3 w-3" />
                <span>ປັດຈຸບັນ: {getLanguageLabel(language)}</span>
              </div>
            </div>

            {/* Question Input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl blur-xl opacity-0 focus-within:opacity-100 transition-opacity"></div>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="ພິມຄຳຖາມຂອງທ່ານທີ່ນີ້..."
                  className="relative w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400 shadow-sm z-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAsk}
                disabled={!question.trim() || answering}
                className="relative px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold text-sm shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {answering ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    ກຳລັງຄິດ...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    ສົ່ງ
                  </>
                )}
              </motion.button>
            </div>

            {/* Answer Display */}
            <AnimatePresence>
              {answering && !answer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50"
                >
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">ກຳລັງວິເຄາະຄຳຖາມ...</p>
                      <p className="text-xs text-blue-600/70">AI ກຳລັງຊອກຫາຄຳຕອບໃຫ້ທ່ານ</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {answer && (
              <motion.div
                ref={answerRef}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="mt-4 p-6 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-2xl border border-blue-200/50 shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-600">AI ຕອບ</span>
                      <span className="text-xs text-gray-400">• {getLanguageLabel(language)}</span>
                    </div>
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                      {answer}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => copyToClipboard(answer, 'answer')}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-600 rounded-xl hover:bg-blue-100/50 transition-all"
                  >
                    {copiedText === 'answer' ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Previous Questions */}
        {document.questions && document.questions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl shadow-black/5 p-6 md:p-8 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5"></div>
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
                    <FileQuestion className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">ຄຳຖາມທີ່ຖາມແລ້ວ</h2>
                    <p className="text-xs text-gray-500">
                      {document.questions.length} ຄຳຖາມທັງໝົດ
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowQuestions(!showQuestions)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all"
                >
                  {showQuestions ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </motion.button>
              </div>

              <AnimatePresence>
                {showQuestions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar"
                  >
                    {document.questions.slice(0, 10).map((q, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group p-4 bg-gradient-to-br from-gray-50/50 to-gray-100/30 rounded-xl border border-gray-200/50 hover:border-blue-200 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-start gap-2">
                              <span className="text-sm font-medium text-blue-600 whitespace-nowrap">ຄຳຖາມ:</span>
                              <p className="text-sm font-medium text-gray-800">{q.question}</p>
                            </div>
                            <div className="flex items-start gap-2 mt-2">
                              <span className="text-sm font-medium text-purple-600 whitespace-nowrap">ຄຳຕອບ:</span>
                              <p className="text-sm text-gray-600 leading-relaxed">{q.answer}</p>
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <ClockIcon className="h-3 w-3" />
                                {formatDate(q.created_at)}
                              </span>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => copyToClipboard(q.answer, `q-${index}`)}
                            className="flex-shrink-0 p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100"
                          >
                            {copiedText === `q-${index}` ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                    {document.questions.length > 10 && (
                      <div className="text-center py-2">
                        <p className="text-xs text-gray-400">
                          ສະແດງ {10} ຈາກ {document.questions.length} ຄຳຖາມຫຼ້າສຸດ
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Quick Actions Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex flex-wrap items-center justify-between gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm"
        >
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              ຂໍ້ມູນປອດໄພ
            </span>
            <span className="w-px h-4 bg-gray-200"></span>
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              ຕອບດ້ວຍ AI
            </span>
            <span className="w-px h-4 bg-gray-200"></span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              ເອກະສານ {document.pages || '?'} ໜ້າ
            </span>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <Printer className="h-3 w-3" />
              ພິມ
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open(`/api/pdf/download/${document.id}`, '_blank')}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <ExternalLink className="h-3 w-3" />
              ເປີດ PDF
            </motion.button>
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