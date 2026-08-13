import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Trash2,
  Edit,
  Eye,
  TrendingUp,
  BookOpen,
  Sparkles,
  Brain,
  Target,
  BarChart3,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  Award,
  Crown,
  Star,
  Zap,
  Rocket,
  Shield,
  Users,
  Heart,
  Flame,
  Medal,
  BookMarked,
  GraduationCap,
  Layers,
  ArrowRight,
  Filter,
  Grid3x3,
  List,
  X,
  Check,
  Search,
  PenTool,
  Wand2,
  FileText,
  CalendarDays,
  Clock as ClockIcon,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Link,
  Image,
  Video,
  Music,
  Camera,
  Send,
  Paperclip,
  Mic,
  Smile,
  CornerDownLeft,
  Settings,
  MoreVertical,
  Copy,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Edit3,
  History,
  Book,
  Folder,
  FolderOpen,
  FolderTree,
  Hash,
  Tag,
  AtSign,
  Link2,
  ExternalLink
} from 'lucide-react';
import { studyPlannerService } from '../../services/studyPlannerService';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function StudyPlanner() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [isHovered, setIsHovered] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    planId: null,
    planTitle: '',
    planProgress: 0
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [showActiveOnly]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansRes, statsRes] = await Promise.all([
        studyPlannerService.getPlans(showActiveOnly),
        studyPlannerService.getStats(),
      ]);

      if (plansRes.success) setPlans(plansRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch (error) {
      console.error('Load data error:', error);
      toast.error('Failed to load study plans');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id, title, progress) => {
    setDeleteModal({
      isOpen: true,
      planId: id,
      planTitle: title,
      planProgress: progress
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      planId: null,
      planTitle: '',
      planProgress: 0
    });
  };

  const confirmDelete = async () => {
    try {
      const response = await studyPlannerService.deletePlan(deleteModal.planId);
      if (response.success) {
        toast.success('Study plan deleted successfully!');
        closeDeleteModal();
        loadData();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete study plan');
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
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'from-emerald-500 to-emerald-600';
    if (progress >= 50) return 'from-amber-500 to-amber-600';
    if (progress >= 20) return 'from-blue-500 to-blue-600';
    return 'from-gray-400 to-gray-500';
  };

  const getProgressGradient = (progress) => {
    if (progress >= 80) return 'bg-gradient-to-r from-emerald-400 to-emerald-500';
    if (progress >= 50) return 'bg-gradient-to-r from-amber-400 to-amber-500';
    if (progress >= 20) return 'bg-gradient-to-r from-blue-400 to-blue-500';
    return 'bg-gradient-to-r from-gray-300 to-gray-400';
  };

  const getStatusBadge = (plan) => {
    if (!plan.is_active) return { text: 'Inactive', color: 'bg-gray-100 text-gray-600', icon: XCircle };
    if (plan.progress === 100) return { text: 'Completed ✓', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle };
    if (plan.tasks?.some(t => !t.is_completed && new Date(t.task_date) < new Date())) {
      return { text: 'Overdue ⚠️', color: 'bg-red-100 text-red-700', icon: AlertCircle };
    }
    return { text: 'Active', color: 'bg-blue-100 text-blue-700', icon: Target };
  };

  const getPlanColor = (id) => {
    const colors = [
      'from-emerald-500 to-emerald-600',
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-rose-500 to-rose-600',
      'from-amber-500 to-amber-600',
      'from-cyan-500 to-cyan-600',
      'from-indigo-500 to-indigo-600',
      'from-pink-500 to-pink-600',
    ];
    return colors[id % colors.length];
  };

  const filteredPlans = plans.filter(plan =>
    plan.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.subject?.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statCards = [
    {
      label: 'Total Plans',
      value: stats?.totalPlans || 0,
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Active Plans',
      value: stats?.activePlans || 0,
      icon: Target,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      label: 'Tasks Completed',
      value: `${stats?.completedTasks || 0}/${stats?.totalTasks || 0}`,
      icon: CheckCircle,
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Overall Progress',
      value: `${stats?.overallProgress || 0}%`,
      icon: TrendingUp,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50/40 to-teal-50/40 p-4 md:p-6">
      {/* Delete Confirmation Modal - Premium Design */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeDeleteModal}
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
                  onClick={closeDeleteModal}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors z-10"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="p-8 pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-full blur-2xl"></div>
                      <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center shadow-lg shadow-red-200/50">
                        <AlertTriangle className="h-10 w-10 text-red-600" />
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Study Plan?</h3>
                    
                    <p className="text-sm text-gray-500 mb-1">
                      You are about to delete this study plan:
                    </p>
                    
                    <div className="w-full bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                      <p className="text-base font-semibold text-gray-800">
                        "{deleteModal.planTitle}"
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-full text-xs text-blue-700">
                          <Target className="h-3 w-3" />
                          {deleteModal.planProgress}% complete
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-100 mb-6 w-full">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                      <span>This action cannot be undone. Please confirm again.</span>
                    </div>

                    <div className="flex gap-3 w-full">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={closeDeleteModal}
                        className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(239, 68, 68, 0.3)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={confirmDelete}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-red-500/30"
                      >
                        Delete Plan
                      </motion.button>
                    </div>

                    <p className="text-xs text-gray-400 mt-4">
                      Press <kbd className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">ESC</kbd> to cancel
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header - Premium Design */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8"
        >
          <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl shadow-black/5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
            
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative p-3.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/30">
                    <Calendar className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center gap-2">
                    Study Planner
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full shadow-lg shadow-emerald-500/30">
                      {stats?.activePlans || 0} Active
                    </span>
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2 flex-wrap">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    <span>Plan and track your study schedule</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-emerald-600 font-medium">{plans.length} plans</span>
                  </p>
                </div>
              </div>

              {/* Create Study Plan Button - Smaller */}
              <motion.button
                onHoverStart={() => setIsButtonHovered(true)}
                onHoverEnd={() => setIsButtonHovered(false)}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 40px -12px rgba(16, 185, 129, 0.5)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/study-planner/create')}
                className="relative group px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-xl font-semibold shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 overflow-hidden flex items-center gap-2.5 text-sm"
              >
                {/* Animated gradient shimmer */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                
                {/* Pulsing ring effect */}
                <div className="absolute inset-0 rounded-xl ring-2 ring-white/0 group-hover:ring-white/30 transition-all duration-500"></div>
                
                {/* Sparkle particles */}
                <motion.div
                  animate={isButtonHovered ? { 
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                    y: [-5, -10, -5]
                  } : {}}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="absolute top-0 right-2 text-white/30 text-sm"
                >
                  ✦
                </motion.div>
                <motion.div
                  animate={isButtonHovered ? { 
                    opacity: [0, 1, 0],
                    scale: [0, 1.2, 0],
                    y: [5, 10, 5]
                  } : {}}
                  transition={{ duration: 0.6, delay: 0.2, repeat: Infinity }}
                  className="absolute bottom-0 left-2 text-white/20 text-xs"
                >
                  ✧
                </motion.div>

                {/* Main content */}
                <div className="relative flex items-center gap-2.5 z-10">
                  <div className="p-1.5 bg-white/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <Wand2 className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium tracking-wide drop-shadow-lg">
                    Create Study Plan
                  </span>
                  <div className="flex items-center gap-1">
                    <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                    <Rocket className="h-3.5 w-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                  </div>
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
                <div className={`p-2.5 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg shadow-emerald-200/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
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
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors z-10" />
            <input
              type="text"
              placeholder="Search study plans by title or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="relative w-full pl-11 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-2xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-300 text-sm placeholder:text-gray-400 z-10"
            />
          </div>
          
          <div className="flex gap-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-200/80 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid3x3 className="h-3.5 w-3.5" />
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              List
            </button>
          </div>
        </motion.div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
            />
            <span className="text-xs font-medium">Show active plans only</span>
          </label>
          {stats?.overdueTasks > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
              <AlertCircle className="h-3.5 w-3.5" />
              {stats.overdueTasks} overdue tasks
            </span>
          )}
          {stats?.upcomingTasks > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
              <Clock className="h-3.5 w-3.5" />
              {stats.upcomingTasks} upcoming tasks
            </span>
          )}
          {stats?.completedTasks > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <CheckCircle className="h-3.5 w-3.5" />
              {stats.completedTasks} completed
            </span>
          )}
        </div>

        {/* Plans Grid/List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-emerald-600 animate-pulse" />
              </div>
            </div>
            <p className="mt-6 text-sm font-medium text-gray-500 animate-pulse">Loading study plans...</p>
          </div>
        ) : filteredPlans.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative text-center py-24 bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-3xl"></div>
            <div className="relative">
              <div className="inline-flex p-8 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full mb-6">
                <Calendar className="h-20 w-20 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">No study plans yet</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                Create your first study plan to start organizing your studies effectively
              </p>
              
              {/* Create Study Plan Button - Smaller in Empty State */}
              <div className="relative inline-block mt-6">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-xl blur-md opacity-40 group-hover:opacity-100 transition-all duration-700"></div>
                
                <motion.button
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 40px -12px rgba(16, 185, 129, 0.5)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/study-planner/create')}
                  className="relative group px-6 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-xl font-semibold shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 overflow-hidden flex items-center gap-2.5 text-sm"
                >
                  {/* Animated gradient shimmer */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  
                  {/* Pulsing ring effect */}
                  <div className="absolute inset-0 rounded-xl ring-2 ring-white/0 group-hover:ring-white/30 transition-all duration-500"></div>

                  {/* Sparkle particles */}
                  <motion.div
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0, 1.3, 0],
                      y: [-3, -8, -3]
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute top-0 right-2 text-white/25 text-xs"
                  >
                    ✦
                  </motion.div>
                  <motion.div
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0, 1.1, 0],
                      y: [3, 8, 3]
                    }}
                    transition={{ duration: 0.8, delay: 0.3, repeat: Infinity }}
                    className="absolute bottom-0 left-2 text-white/20 text-xs"
                  >
                    ✧
                  </motion.div>

                  {/* Content */}
                  <div className="relative flex items-center gap-2.5 z-10">
                    <div className="p-1.5 bg-white/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <Wand2 className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium tracking-wide drop-shadow-lg">
                      Create Study Plan
                    </span>
                    <div className="flex items-center gap-1">
                      <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                      <Rocket className="h-3.5 w-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                    </div>
                  </div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-5"
          >
            {filteredPlans.map((plan, index) => {
              const status = getStatusBadge(plan);
              const StatusIcon = status.icon;
              const color = getPlanColor(index);
              const progressColor = getProgressColor(plan.progress || 0);
              
              return (
                <motion.div
                  key={plan.id}
                  variants={itemVariants}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 hover:border-emerald-200 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                    <div className={`h-1.5 w-full bg-gradient-to-r ${color}`}></div>
                    
                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`p-3 bg-gradient-to-br ${color} rounded-2xl shadow-lg shadow-emerald-200/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                            <BookOpen className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate text-sm">
                              {plan.title}
                            </h3>
                            {plan.subject && (
                              <p className="text-xs text-gray-500 truncate">
                                {plan.subject.code} - {plan.subject.name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 ml-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(`/study-planner/${plan.id}`)}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-xl hover:bg-emerald-50 transition-colors"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(`/study-planner/edit/${plan.id}`)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openDeleteModal(plan.id, plan.title, plan.progress || 0)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>

                      {plan.description && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2 bg-gradient-to-br from-gray-50 to-gray-100/50 p-2.5 rounded-xl border border-gray-100">
                          {plan.description}
                        </p>
                      )}

                      {/* Progress */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span className="font-medium">Progress</span>
                          <span className="font-bold text-gray-700">{plan.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200/70 rounded-full h-2.5 overflow-hidden shadow-inner">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${plan.progress || 0}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`h-2.5 rounded-full ${getProgressGradient(plan.progress || 0)} transition-all duration-500`}
                          />
                        </div>
                      </div>

                      {/* Tasks Preview */}
                      {plan.tasks && plan.tasks.length > 0 && (
                        <div className="mt-3 space-y-1.5 max-h-[100px] overflow-y-auto custom-scrollbar">
                          {plan.tasks.slice(0, 3).map((task) => (
                            <div key={task.id} className="flex items-center gap-2 text-sm p-1.5 hover:bg-gray-50 rounded-lg transition-all">
                              {task.is_completed ? (
                                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                              ) : new Date(task.task_date) < new Date() ? (
                                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                              ) : (
                                <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              )}
                              <span className={`text-xs ${task.is_completed ? 'line-through text-gray-400' : 'text-gray-700'} flex-1 truncate`}>
                                {task.title}
                              </span>
                              <span className="text-[10px] text-gray-400 flex-shrink-0">
                                {formatDate(task.task_date)}
                              </span>
                            </div>
                          ))}
                          {plan.tasks.length > 3 && (
                            <p className="text-xs text-gray-400 text-center py-1">
                              +{plan.tasks.length - 3} more tasks
                            </p>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100/50">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {status.text}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(plan.start_date)} → {formatDate(plan.end_date)}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
                          {plan.completedTasks || 0}/{plan.totalTasks || 0} tasks
                        </span>
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tasks</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/50">
                  {filteredPlans.map((plan, index) => {
                    const status = getStatusBadge(plan);
                    const StatusIcon = status.icon;
                    const color = getPlanColor(index);
                    
                    return (
                      <motion.tr
                        key={plan.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-gradient-to-r hover:from-emerald-50/30 hover:to-teal-50/30 transition-all group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 bg-gradient-to-br ${color} rounded-xl shadow-md group-hover:scale-110 transition-transform`}>
                              <BookOpen className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-medium text-gray-900 text-sm">{plan.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {plan.subject ? `${plan.subject.code}` : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${getProgressGradient(plan.progress || 0)}`}
                                style={{ width: `${plan.progress || 0}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-700">{plan.progress || 0}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                            {plan.completedTasks || 0}/{plan.totalTasks || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${status.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(plan.start_date)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => navigate(`/study-planner/${plan.id}`)}
                              className="p-2 text-gray-400 hover:text-emerald-600 rounded-xl hover:bg-emerald-50 transition-colors"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => navigate(`/study-planner/edit/${plan.id}`)}
                              className="p-2 text-gray-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openDeleteModal(plan.id, plan.title, plan.progress || 0)}
                              className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                              title="Delete"
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

        {/* Empty State for Search */}
        {filteredPlans.length === 0 && searchTerm && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative text-center py-20 bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-3xl"></div>
            <div className="relative">
              <div className="inline-flex p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
                <Search className="h-16 w-16 text-gray-400" />
              </div>
              <p className="text-gray-500">No study plans found matching</p>
              <p className="text-xl font-bold text-gray-700 mt-1">"{searchTerm}"</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
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