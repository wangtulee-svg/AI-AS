import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Eye,
  Loader2,
  BookOpen,
  Sparkles,
  TrendingUp,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Trophy,
  Zap,
  Brain,
  Target,
  Award,
  ChevronRight,
  Star,
  Users,
  Calendar,
  ArrowRight,
  Filter,
  Grid3x3,
  List,
  Shield,
  Rocket,
  Crown,
  Medal,
  Flame,
  Layers,
  BookMarked,
  Heart,
  Bell,
  Settings,
  Plus
} from 'lucide-react';
import { quizService } from '../../services/quizService';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function QuizList() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    loadQuizzes();
    loadStats();
  }, []);

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const response = await quizService.getQuizzes();
      if (response.success) {
        setQuizzes(response.data);
      }
    } catch (error) {
      console.error('Load quizzes error:', error);
      toast.error('ບໍ່ສາມາດໂຫຼດແບບຝຶກຫັດໄດ້');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await quizService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Load stats error:', error);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString('lo-LA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFilteredQuizzes = () => {
    let filtered = quizzes;
    
    if (searchTerm) {
      filtered = filtered.filter(quiz =>
        quiz.pdf?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.language?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.difficulty?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(quiz => quiz.difficulty === filterDifficulty);
    }
    
    return filtered;
  };

  const filteredQuizzes = getFilteredQuizzes();

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'from-emerald-400 to-emerald-600',
      medium: 'from-amber-400 to-orange-500',
      hard: 'from-red-400 to-red-600',
    };
    return colors[difficulty] || 'from-gray-400 to-gray-500';
  };

  const getDifficultyBadgeColor = (difficulty) => {
    const colors = {
      easy: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      medium: 'text-amber-700 bg-amber-50 border-amber-200',
      hard: 'text-red-700 bg-red-50 border-red-200',
    };
    return colors[difficulty] || 'text-gray-700 bg-gray-50 border-gray-200';
  };

  const getDifficultyIcon = (difficulty) => {
    const icons = {
      easy: <span className="text-sm">🟢</span>,
      medium: <span className="text-sm">🟡</span>,
      hard: <span className="text-sm">🔴</span>,
    };
    return icons[difficulty] || <span className="text-sm">⚪</span>;
  };

  const getDifficultyLabel = (difficulty) => {
    const labels = {
      easy: 'ງ່າຍ',
      medium: 'ປານກາງ',
      hard: 'ຍາກ',
    };
    return labels[difficulty] || difficulty;
  };

  const statCards = [
    {
      label: 'ແບບຝຶກຫັດທັງໝົດ',
      value: quizzes.length,
      icon: BookMarked,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'ເຮັດສຳເລັດ',
      value: stats?.completed || 0,
      icon: CheckCircle,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      label: 'ຄະແນນສະເລ່ຍ',
      value: `${stats?.averageScore || 0}%`,
      icon: Award,
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'ທັງໝົດຄຳຖາມ',
      value: stats?.totalQuestions || 0,
      icon: BarChart3,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-purple-50/40 to-pink-50/40 p-4 md:p-6">
      {/* Decorative Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header - Premium Design */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8"
        >
          <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl shadow-black/5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500"></div>
            
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative p-3.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg shadow-purple-500/30">
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center gap-2">
                    AI Quizzes
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg shadow-purple-500/30">
                      New
                    </span>
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2 flex-wrap">
                    <Brain className="h-4 w-4 text-purple-400" />
                    <span>Test your knowledge with AI-generated quizzes from your documents</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-purple-600 font-medium">{quizzes.length} quizzes</span>
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(147, 51, 234, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/documents')}
                className="relative px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white rounded-2xl font-semibold shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                <div className="relative flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Generate Quiz
                  <Rocket className="h-3.5 w-3.5" />
                </div>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Premium Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
        >
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-4 hover:shadow-2xl hover:border-transparent transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-2.5 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg shadow-purple-200/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Search & Filters - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row gap-3 mb-6"
        >
          <div className="relative flex-1 group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors z-10" />
            <input
              type="text"
              placeholder="ຄົ້ນຫາແບບຝຶກຫັດຕາມຊື່ເອກະສານ ຫຼື ພາສາ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="relative w-full pl-11 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-2xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-300 text-sm placeholder:text-gray-400 z-10"
            />
          </div>
          
          <div className="flex gap-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-200/80 shadow-sm">
            <button
              onClick={() => setFilterDifficulty('all')}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
                filterDifficulty === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              ທັງໝົດ
            </button>
            <button
              onClick={() => setFilterDifficulty('easy')}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
                filterDifficulty === 'easy'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-sm">🟢</span>
              ງ່າຍ
            </button>
            <button
              onClick={() => setFilterDifficulty('medium')}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
                filterDifficulty === 'medium'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-sm">🟡</span>
              ປານກາງ
            </button>
            <button
              onClick={() => setFilterDifficulty('hard')}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
                filterDifficulty === 'hard'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-sm">🔴</span>
              ຍາກ
            </button>
          </div>

          <div className="flex gap-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-200/80 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid3x3 className="h-3.5 w-3.5" />
              ຮູບ
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              ລາຍການ
            </button>
          </div>
        </motion.div>

        {/* Quizzes Grid/List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-4 border-purple-100 border-t-purple-600 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="h-8 w-8 text-purple-600 animate-pulse" />
              </div>
            </div>
            <p className="mt-6 text-sm font-medium text-gray-500 animate-pulse">ກຳລັງໂຫຼດແບບຝຶກຫັດ...</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative text-center py-24 bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl"></div>
            <div className="relative">
              <div className="inline-flex p-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-6">
                <BookOpen className="h-20 w-20 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">ຍັງບໍ່ມີແບບຝຶກຫັດ</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                ອັບໂຫຼດເອກະສານ ແລະ ສ້າງແບບຝຶກຫັດເພື່ອທົດສອບຄວາມຮູ້ຂອງທ່ານ
              </p>
              <Button
                variant="gradient"
                className="mt-6 shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/40 rounded-2xl"
                onClick={() => navigate('/documents')}
              >
                <FileText className="h-4 w-4 mr-2" />
                ໄປທີ່ເອກະສານ
              </Button>
            </div>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filteredQuizzes.map((quiz, index) => {
              const questionCount = Array.isArray(quiz.questions) ? quiz.questions.length : 0;
              const difficulty = quiz.difficulty || 'medium';
              const diffColor = getDifficultyColor(difficulty);
              const diffBadge = getDifficultyBadgeColor(difficulty);
              
              return (
                <motion.div
                  key={quiz.id}
                  variants={itemVariants}
                  onHoverStart={() => setHoveredId(quiz.id)}
                  onHoverEnd={() => setHoveredId(null)}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 hover:border-purple-200 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                    <div className={`h-1.5 w-full bg-gradient-to-r ${diffColor}`}></div>
                    
                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`p-3 bg-gradient-to-br ${diffColor} rounded-2xl shadow-lg shadow-purple-200/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate text-sm">
                              {quiz.pdf?.title || 'Untitled Quiz'}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                              <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                                {quiz.language || 'both'}
                              </span>
                              <span>•</span>
                              <span>{formatDate(quiz.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${diffBadge}`}>
                          {getDifficultyIcon(difficulty)}
                          {getDifficultyLabel(difficulty)}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full text-xs text-blue-700">
                          <BarChart3 className="h-3 w-3" />
                          {questionCount} ຄຳຖາມ
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-full text-xs text-amber-700">
                          <Clock className="h-3 w-3" />
                          {quiz.time_limit || 10} ນາທີ
                        </span>
                        {quiz.takenCount > 0 && (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 rounded-full text-xs text-purple-700">
                            <Users className="h-3 w-3" />
                            {quiz.takenCount} ຄົນເຮັດແລ້ວ
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
                          onClick={() => navigate(`/quiz/${quiz.id}`)}
                        >
                          <Play className="h-4 w-4" />
                          ເລີ່ມທຳແບບຝຶກຫັດ
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => navigate(`/quiz/${quiz.id}/result`)}
                          className="p-2.5 text-gray-400 hover:text-amber-600 rounded-xl hover:bg-amber-50 transition-all"
                          title="ເບິ່ງຜົນການທຳ"
                        >
                          <Trophy className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ແບບຝຶກຫັດ</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ຄວາມຍາກ</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ຄຳຖາມ</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ເວລາ</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ພາສາ</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ສ້າງເມື່ອ</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">ຈັດການ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/50">
  {filteredQuizzes.map((quiz, index) => {  // ← ເພີ່ມ index ຢູ່ນີ້
    const questionCount = Array.isArray(quiz.questions) ? quiz.questions.length : 0;
    const difficulty = quiz.difficulty || 'medium';
    const diffBadge = getDifficultyBadgeColor(difficulty);
    
    return (
      <motion.tr
        key={quiz.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}  // ← index ມີແລ້ວ
        className="hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-pink-50/30 transition-all group"
      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl group-hover:scale-110 transition-transform">
                              <FileText className="h-4 w-4 text-purple-500" />
                            </div>
                            <span className="font-medium text-gray-900 text-sm">
                              {quiz.pdf?.title || 'Untitled Quiz'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${diffBadge}`}>
                            {getDifficultyIcon(difficulty)}
                            {getDifficultyLabel(difficulty)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                            {questionCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs">
                            {quiz.time_limit || 10} min
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            {quiz.language || 'both'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(quiz.created_at)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* ✅ ປຸ່ມ Play ແບບ Glass Morphism */}
<motion.button
  whileHover={{ 
    scale: 1.15,
    boxShadow: "0 20px 30px -5px rgba(147, 51, 234, 0.2)"
  }}
  whileTap={{ scale: 0.9 }}
  onClick={() => navigate(`/quiz/${quiz.id}`)}
  className="relative group w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-purple-600 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 hover:border-transparent transition-all duration-300 flex items-center justify-center shadow-lg"
  title="ເລີ່ມທຳແບບຝຶກຫັດ"
>
  {/* Background blur */}
  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
  
  <Play className="h-4 w-4 relative z-10 group-hover:scale-110 transition-transform duration-300 ml-0.5" />
</motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => navigate(`/quiz/${quiz.id}/result`)}
                              className="p-2 text-gray-400 hover:text-amber-600 rounded-xl hover:bg-amber-50 transition-colors"
                              title="ເບິ່ງຜົນການທຳ"
                            >
                              <Trophy className="h-4 w-4" />
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

        {/* Empty State for Search */}
        {filteredQuizzes.length === 0 && searchTerm && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative text-center py-20 bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl"></div>
            <div className="relative">
              <div className="inline-flex p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
                <Search className="h-16 w-16 text-gray-400" />
              </div>
              <p className="text-gray-500">ບໍ່ພົບແບບຝຶກຫັດທີ່ກົງກັບ</p>
              <p className="text-xl font-bold text-gray-700 mt-1">"{searchTerm}"</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}