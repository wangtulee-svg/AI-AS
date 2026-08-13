// frontend/src/pages/DocumentsList.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  Eye,
  Clock,
  File,
  Loader2,
  Calendar,
  ChevronRight,
  Sparkles,
  Zap,
  FolderOpen,
  Download,
  Share2,
  MoreVertical,
  BookOpen,
  CheckCircle,
  AlertCircle,
  XCircle,
  Layers,
  TrendingUp,
  Database,
  Grid3x3,
  List,
  ArrowUpRight,
  FileCheck,
  FileClock,
  Star,
  StarOff,
  Tag,
  Copy,
  ExternalLink,
  Upload,
  Rocket,
  Shield,
  Brain,        // ✅ ເພີ່ມ
  BarChart3     // ✅ ເພີ່ມ
} from 'lucide-react';
import { pdfService } from '../../services/pdfService';
import { quizService } from '../../services/quizService';  // ✅ ເພີ່ມ
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function DocumentsList() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [hoveredDoc, setHoveredDoc] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, title: '' });
  const [generatingQuiz, setGeneratingQuiz] = useState(null); // ✅ ເພື່ອຕິດຕາມການສ້າງ Quiz

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await pdfService.getList();
      if (response.success) {
        setDocuments(response.data);
        const savedFavorites = JSON.parse(localStorage.getItem('favoriteDocs') || '[]');
        setFavorites(savedFavorites);
      }
    } catch (error) {
      console.error('Load documents error:', error);
      toast.error('ບໍ່ສາມາດໂຫຼດເອກະສານໄດ້');
    } finally {
      setLoading(false);
    }
  };

  // ✅ ຟັງຊັນສຳລັບສ້າງ Quiz ຈາກເອກະສານ
  const handleGenerateQuiz = async (docId, docTitle) => {
    setGeneratingQuiz(docId);
    try {
      // ກວດສອບວ່າເອກະສານມີບົດສັງເຄາະຫຼືບໍ່
      const doc = documents.find(d => d.id === docId);
      if (!doc || !doc.summary) {
        toast.warning('ກະລຸນາລໍຖ້າໃຫ້ AI ສັງເຄາະເອກະສານກ່ອນ (ກົດ Summarize)');
        setGeneratingQuiz(null);
        return;
      }

      toast.loading('ກຳລັງສ້າງ Quiz...', { id: 'generating-quiz' });
      
      const response = await quizService.generateQuiz({
        topic: docTitle,
        pdfId: docId,
        difficulty: 'medium',
        numQuestions: 5,
      });
      
      toast.dismiss('generating-quiz');
      
      if (response.success) {
        toast.success(`ສ້າງ Quiz ສຳເລັດ! ມີ ${response.data?.total_questions || 5} ຄຳຖາມ 🎉`);
        // ນຳທາງໄປທີ່ໜ້າ Quiz ທີ່ສ້າງໃໝ່
        if (response.data?.id) {
          navigate(`/quiz/${response.data.id}`);
        } else {
          navigate('/quiz');
        }
      } else {
        toast.error(response.message || 'ສ້າງ Quiz ບໍ່ສຳເລັດ');
      }
    } catch (error) {
      toast.dismiss('generating-quiz');
      console.error('Generate quiz error:', error);
      toast.error('ສ້າງ Quiz ບໍ່ສຳເລັດ ກະລຸນາລອງໃໝ່');
    } finally {
      setGeneratingQuiz(null);
    }
  };

  const toggleFavorite = (docId) => {
    const newFavorites = favorites.includes(docId)
      ? favorites.filter(id => id !== docId)
      : [...favorites, docId];
    setFavorites(newFavorites);
    localStorage.setItem('favoriteDocs', JSON.stringify(newFavorites));
    toast.success(favorites.includes(docId) ? 'ເອົາອອກຈາກລາຍການໂປດແລ້ວ' : 'ເພີ່ມເຂົ້າລາຍການໂປດແລ້ວ');
  };

  const handleDelete = (id, title) => {
    setDeleteModal({ show: true, id, title });
  };

  const confirmDelete = async () => {
    try {
      const response = await pdfService.deletePDF(deleteModal.id);
      if (response.success) {
        toast.success('ລົບເອກະສານສຳເລັດແລ້ວ');
        setDeleteModal({ show: false, id: null, title: '' });
        loadDocuments();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('ລົບເອກະສານບໍ່ສຳເລັດ');
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ show: false, id: null, title: '' });
  };

  const getFilteredDocs = () => {
    let filtered = documents;
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterType === 'favorites') {
      filtered = filtered.filter(doc => favorites.includes(doc.id));
    } else if (filterType === 'recent') {
      filtered = [...filtered].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      ).slice(0, 5);
    }
    return filtered;
  };

  const filteredDocuments = getFilteredDocs();

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
    });
  };

  const getStatusColor = (doc) => {
    if (doc.summary) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (doc.summary === null && doc.created_at) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-gray-400 bg-gray-50 border-gray-200';
  };

  const getStatusText = (doc) => {
    if (doc.summary) return 'ພ້ອມໃຊ້ງານ';
    if (doc.summary === null && doc.created_at) return 'ກຳລັງປຸງແຕ່ງ';
    return 'ຮ່າງ';
  };

  const getStatusIcon = (doc) => {
    if (doc.summary) return <CheckCircle className="h-3.5 w-3.5" />;
    if (doc.summary === null && doc.created_at) return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
    return <FileClock className="h-3.5 w-3.5" />;
  };

  const stats = {
    total: documents.length,
    summarized: documents.filter(d => d.summary).length,
    totalPages: documents.reduce((acc, doc) => acc + (doc.pages || 0), 0),
    totalSize: documents.reduce((acc, doc) => acc + doc.file_size, 0),
    favorites: favorites.length,
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 }
  };

  const getDocColor = (id) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-emerald-500 to-emerald-600',
      'from-rose-500 to-rose-600',
      'from-amber-500 to-amber-600',
      'from-cyan-500 to-cyan-600',
      'from-indigo-500 to-indigo-600',
      'from-pink-500 to-pink-600',
    ];
    return colors[id % colors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-indigo-100/40 p-6">
      {/* Delete Modal - Centered */}
      <AnimatePresence>
        {deleteModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={cancelDelete}
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
                <div className="h-2 w-full bg-gradient-to-r from-red-500 via-rose-500 to-pink-500"></div>
                <button
                  onClick={cancelDelete}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors z-10"
                >
                  <XCircle className="h-5 w-5" />
                </button>

                <div className="p-8 pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-full blur-2xl"></div>
                      <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center shadow-lg shadow-red-200/50">
                        <Trash2 className="h-10 w-10 text-red-600" />
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">ລົບເອກະສານ?</h3>
                    
                    <p className="text-sm text-gray-500 mb-1">
                      ທ່ານກຳລັງຈະລົບເອກະສານ
                    </p>
                    <p className="text-lg font-semibold text-gray-800 mb-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                      "{deleteModal.title}"
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 mb-6">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>ການກະທຳນີ້ບໍ່ສາມາດກັບຄືນໄດ້ ກະລຸນາຢືນຢັນອີກຄັ້ງ</span>
                    </div>

                    <div className="flex gap-3 w-full">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={cancelDelete}
                        className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all"
                      >
                        ຍົກເລີກ
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(239, 68, 68, 0.3)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={confirmDelete}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-red-500/30"
                      >
                        ລົບເລີຍ
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

      <div className="max-w-7xl mx-auto">
        {/* Header with Premium Design */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8"
        >
          <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl shadow-black/5">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-3xl"></div>
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30">
                    <FolderOpen className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                    ຫ້ອງສະໝຸດເອກະສານ
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
                    <span>ຈັດການ ແລະ ຈັດຮຽງເອກະສານ PDF ຂອງທ່ານ</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-blue-600 font-semibold">{stats.total} ເອກະສານ</span>
                    {stats.favorites > 0 && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="text-amber-600 font-semibold flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          {stats.favorites} ລາຍການໂປດ
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-all flex items-center gap-2 shadow-sm"
                >
                  <Download className="h-4 w-4" />
                  ສົ່ງອອກ
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/documents/upload')}
                  className="relative group px-6 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-2xl font-semibold text-sm shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  <div className="relative flex items-center gap-3">
                    <div className="p-1.5 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                      <Rocket className="h-4 w-4" />
                    </div>
                    <span>ອັບໂຫຼດໃໝ່</span>
                    <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Premium Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6"
        >
          {[
            { label: 'ທັງໝົດ', value: stats.total, icon: Layers, color: 'blue', gradient: 'from-blue-500 to-blue-600' },
            { label: 'ສຳເລັດການສັງເຄາະ', value: stats.summarized, icon: FileCheck, color: 'emerald', gradient: 'from-emerald-500 to-emerald-600' },
            { label: 'ທັງໝົດໜ້າ', value: stats.totalPages, icon: FileText, color: 'purple', gradient: 'from-purple-500 to-purple-600' },
            { label: 'ຂະໜາດທັງໝົດ', value: formatFileSize(stats.totalSize), icon: Database, color: 'orange', gradient: 'from-orange-500 to-orange-600' },
            { label: 'ລາຍການໂປດ', value: stats.favorites, icon: Star, color: 'amber', gradient: 'from-amber-500 to-amber-600' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-5 hover:shadow-2xl hover:border-transparent transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg shadow-${stat.color}-200/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Advanced Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row gap-3 mb-6"
        >
          <div className="relative flex-1 group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10" />
            <input
              type="text"
              placeholder="ຄົ້ນຫາເອກະສານ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="relative w-full pl-11 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-2xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-sm placeholder:text-gray-400 z-10"
            />
          </div>
          
          <div className="flex gap-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-200/80 shadow-sm">
            {[
              { id: 'all', label: 'ທັງໝົດ', icon: Layers },
              { id: 'favorites', label: 'ລາຍການໂປດ', icon: Star },
              { id: 'recent', label: 'ຫຼ້າສຸດ', icon: Clock },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterType(filter.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  filterType === filter.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <filter.icon className="h-4 w-4" />
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-200/80 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid3x3 className="h-4 w-4" />
              ຮູບ
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="h-4 w-4" />
              ລາຍການ
            </button>
          </div>
        </motion.div>

        {/* Documents Grid/List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText className="h-8 w-8 text-blue-600 animate-pulse" />
              </div>
            </div>
            <p className="mt-6 text-sm font-medium text-gray-500 animate-pulse">ກຳລັງໂຫຼດເອກະສານ...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative text-center py-32 bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-3xl"></div>
            <div className="relative">
              <div className="inline-flex p-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-6">
                <FileText className="h-20 w-20 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">ຍັງບໍ່ມີເອກະສານ</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                ອັບໂຫຼດ PDF ທຳອິດຂອງທ່ານ ເພື່ອເລີ່ມຕົ້ນການສັງເຄາະດ້ວຍ AI
              </p>
              <Button
                variant="gradient"
                className="mt-6 shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/40"
                onClick={() => navigate('/documents/upload')}
              >
                <Plus className="h-4 w-4 mr-2" />
                ອັບໂຫຼດ PDF
              </Button>
            </div>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredDocuments.map((doc, index) => {
              const isGenerating = generatingQuiz === doc.id;
              const hasSummary = !!doc.summary;
              
              return (
                <motion.div
                  key={doc.id}
                  variants={itemVariants}
                  onHoverStart={() => setHoveredDoc(doc.id)}
                  onHoverEnd={() => setHoveredDoc(null)}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 hover:border-blue-200 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                    <div className={`h-1 w-full bg-gradient-to-r ${getDocColor(index)}`}></div>
                    
                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`p-3 bg-gradient-to-br ${getDocColor(index)} rounded-2xl shadow-lg shadow-blue-200/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate text-sm">
                              {doc.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                              <span>{doc.pages || '?'} ໜ້າ</span>
                              <span>•</span>
                              <span>{formatFileSize(doc.file_size)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <motion.button
                            whileHover={{ scale: 1.15, rotate: 15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleFavorite(doc.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              favorites.includes(doc.id)
                                ? 'text-amber-500 bg-amber-50'
                                : 'text-gray-300 hover:text-amber-500 hover:bg-amber-50'
                            }`}
                          >
                            <Star className={`h-4 w-4 ${favorites.includes(doc.id) ? 'fill-amber-500' : ''}`} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(`/documents/${doc.id}`)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(doc.id, doc.title)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>

                      {/* ✅ ປຸ່ມ Generate Quiz ໃໝ່ */}
                      <div className="mt-3">
                        {hasSummary ? (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleGenerateQuiz(doc.id, doc.title)}
                            disabled={isGenerating}
                            className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                              isGenerating
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50'
                            }`}
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                ກຳລັງສ້າງ Quiz...
                              </>
                            ) : (
                              <>
                                <Brain className="h-4 w-4" />
                                Generate Quiz
                                <BarChart3 className="h-3.5 w-3.5" />
                              </>
                            )}
                          </motion.button>
                        ) : (
                          <div className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-400 border border-gray-200 flex items-center justify-center gap-2 cursor-not-allowed">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            ກຳລັງສັງເຄາະ...
                          </div>
                        )}
                      </div>

                      <div className="mt-2">
                        {doc.summary ? (
                          <div className="relative p-3 bg-gradient-to-br from-blue-50/60 to-indigo-50/60 rounded-xl border border-blue-100/50 group-hover:border-blue-200 transition-colors">
                            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                              {doc.summary.substring(0, 120)}...
                            </p>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ArrowUpRight className="h-3.5 w-3.5 text-blue-400" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50/60 p-3 rounded-xl border border-amber-100/50">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>ກຳລັງສັງເຄາະຂໍ້ມູນ...</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(doc.created_at)}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc)} border transition-all`}>
                          {getStatusIcon(doc)}
                          <span>{getStatusText(doc)}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 overflow-hidden shadow-xl hover:shadow-2xl transition-shadow"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ເອກະສານ</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ໜ້າ</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ຂະໜາດ</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ສະຖານະ</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quiz</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ອັບໂຫຼດ</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">ຈັດການ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/50">
                  {filteredDocuments.map((doc, index) => {
                    const isGenerating = generatingQuiz === doc.id;
                    const hasSummary = !!doc.summary;
                    
                    return (
                      <motion.tr
                        key={doc.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30 transition-all group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 bg-gradient-to-br ${getDocColor(index)} rounded-xl shadow-md group-hover:scale-110 transition-transform`}>
                              <FileText className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <span className="font-medium text-gray-900 text-sm">{doc.title}</span>
                              {favorites.includes(doc.id) && (
                                <Star className="h-3 w-3 fill-amber-500 text-amber-500 inline-block ml-2" />
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{doc.pages || '?'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{formatFileSize(doc.file_size)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(doc)} border`}>
                            {getStatusIcon(doc)}
                            {getStatusText(doc)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {hasSummary ? (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleGenerateQuiz(doc.id, doc.title)}
                              disabled={isGenerating}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                                isGenerating
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm shadow-purple-200 hover:shadow-md'
                              }`}
                            >
                              {isGenerating ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Brain className="h-3 w-3" />
                              )}
                              {isGenerating ? 'Creating...' : 'Generate Quiz'}
                            </motion.button>
                          ) : (
                            <span className="text-xs text-gray-400">ລໍຖ້າສັງເຄາະ</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(doc.created_at)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <motion.button
                              whileHover={{ scale: 1.15, rotate: 15 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => toggleFavorite(doc.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                favorites.includes(doc.id)
                                  ? 'text-amber-500 bg-amber-50'
                                  : 'text-gray-300 hover:text-amber-500 hover:bg-amber-50'
                              }`}
                            >
                              <Star className={`h-4 w-4 ${favorites.includes(doc.id) ? 'fill-amber-500' : ''}`} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => navigate(`/documents/${doc.id}`)}
                              className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(doc.id, doc.title)}
                              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Empty Search State */}
        {filteredDocuments.length === 0 && searchTerm && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative text-center py-24 bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-3xl"></div>
            <div className="relative">
              <div className="inline-flex p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
                <Search className="h-16 w-16 text-gray-400" />
              </div>
              <p className="text-gray-500">ບໍ່ພົບເອກະສານທີ່ກົງກັບ</p>
              <p className="text-xl font-bold text-gray-700 mt-1">"{searchTerm}"</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}