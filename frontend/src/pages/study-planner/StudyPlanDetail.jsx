// frontend/src/pages/study-planner/StudyPlanDetail.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Edit,
  Trash2,
  Target,
  BookOpen,
  Users,
  Award,
  AlertCircle,
  Sparkles,
  Eye,
  AlertTriangle,
  X
} from 'lucide-react';
import { studyPlannerService } from '../../services/studyPlannerService';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function StudyPlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, title: '' });
  const [isEditHovered, setIsEditHovered] = useState(false);
  const [isDeleteHovered, setIsDeleteHovered] = useState(false);

  useEffect(() => {
    loadPlan();
  }, [id]);

  const loadPlan = async () => {
    setLoading(true);
    try {
      const response = await studyPlannerService.getPlanById(id);
      if (response.success) {
        setPlan(response.data);
      } else {
        toast.error('Study plan not found');
        navigate('/study-planner');
      }
    } catch (error) {
      console.error('Load plan error:', error);
      toast.error('Failed to load study plan');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId, currentStatus) => {
    setUpdating(true);
    try {
      const response = await studyPlannerService.toggleTask(taskId);
      if (response.success) {
        setPlan(prev => ({
          ...prev,
          tasks: prev.tasks.map(task =>
            task.id === taskId
              ? { ...task, is_completed: !currentStatus }
              : task
          ),
        }));
        toast.success(currentStatus ? 'Task unmarked' : 'Task completed! 🎉');
      }
    } catch (error) {
      console.error('Toggle task error:', error);
      toast.error('Failed to update task');
    } finally {
      setUpdating(false);
    }
  };

  const openDeleteModal = () => {
    setDeleteModal({ isOpen: true, title: plan?.title || 'Study Plan' });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, title: '' });
  };

  const confirmDelete = async () => {
    try {
      const response = await studyPlannerService.deletePlan(id);
      if (response.success) {
        toast.success('Study plan deleted successfully!');
        closeDeleteModal();
        navigate('/study-planner');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete study plan');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'from-emerald-400 to-emerald-500';
    if (progress >= 50) return 'from-amber-400 to-amber-500';
    if (progress >= 20) return 'from-blue-400 to-blue-500';
    return 'from-gray-300 to-gray-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading study plan...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex p-6 bg-gray-100 rounded-full mb-4">
          <AlertCircle className="h-14 w-14 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700">Study Plan not found</h3>
        <p className="text-sm text-gray-500 mt-1">The study plan you're looking for doesn't exist</p>
        <Button
          variant="gradient"
          className="mt-4 shadow-lg shadow-emerald-500/25"
          onClick={() => navigate('/study-planner')}
        >
          Back to Study Plans
        </Button>
      </div>
    );
  }

  const completedTasks = plan.tasks?.filter(t => t.is_completed).length || 0;
  const totalTasks = plan.tasks?.length || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Delete Confirmation Modal */}
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
                {/* Decorative gradient bar */}
                <div className="h-2 w-full bg-gradient-to-r from-red-500 via-rose-500 to-pink-500"></div>
                
                {/* Close button */}
                <button
                  onClick={closeDeleteModal}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors z-10"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="p-8 pt-6">
                  <div className="flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-full blur-2xl"></div>
                      <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center shadow-lg shadow-red-200/50">
                        <AlertTriangle className="h-10 w-10 text-red-600" />
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Delete Study Plan?
                    </h3>
                    
                    <p className="text-sm text-gray-500 mb-1">
                      You are about to delete this study plan:
                    </p>
                    
                    <div className="w-full bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                      <p className="text-base font-semibold text-gray-800">
                        "{deleteModal.title}"
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-full text-xs text-blue-700">
                          <Target className="h-3 w-3" />
                          {progress}% complete
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

      {/* Back Button */}
      <button
        onClick={() => navigate('/study-planner')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Study Plans
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6 mb-6"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
            {plan.description && (
              <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                plan.is_active
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}>
                {plan.is_active ? 'Active' : 'Inactive'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs border border-blue-200">
                <Calendar className="h-3 w-3" />
                {formatDate(plan.start_date)} → {formatDate(plan.end_date)}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs border border-purple-200">
                <Target className="h-3 w-3" />
                {progress}% complete
              </span>
            </div>
          </div>
          
          {/* ✅ Beautiful Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            {/* Edit Button */}
            <motion.button
              onHoverStart={() => setIsEditHovered(true)}
              onHoverEnd={() => setIsEditHovered(false)}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/study-planner/edit/${plan.id}`)}
              className="relative group px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 overflow-hidden flex items-center gap-2"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              
              {/* Animated ring */}
              <div className="absolute inset-0 rounded-xl ring-2 ring-white/0 group-hover:ring-white/30 transition-all duration-500"></div>
              
              <div className="relative flex items-center gap-2">
                <Edit className="h-4 w-4" />
                <span className="text-sm font-medium">Edit</span>
              </div>
            </motion.button>

            {/* Delete Button */}
            <motion.button
              onHoverStart={() => setIsDeleteHovered(true)}
              onHoverEnd={() => setIsDeleteHovered(false)}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(239, 68, 68, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={openDeleteModal}
              className="relative group px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-medium shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 overflow-hidden flex items-center gap-2"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              
              {/* Animated ring */}
              <div className="absolute inset-0 rounded-xl ring-2 ring-white/0 group-hover:ring-white/30 transition-all duration-500"></div>
              
              {/* Animated sparkle particles for delete button */}
              <motion.div
                animate={isDeleteHovered ? { 
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  y: [-5, -10, -5]
                } : {}}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="absolute -top-1 right-1 text-white/30 text-xs"
              >
                ✦
              </motion.div>
              <motion.div
                animate={isDeleteHovered ? { 
                  opacity: [0, 1, 0],
                  scale: [0, 1.2, 0],
                  y: [5, 10, 5]
                } : {}}
                transition={{ duration: 0.6, delay: 0.2, repeat: Infinity }}
                className="absolute -bottom-1 left-1 text-white/20 text-xs"
              >
                ✧
              </motion.div>

              <div className="relative flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                <span className="text-sm font-medium">Delete</span>
              </div>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Tasks', value: totalTasks, color: 'text-gray-900' },
          { label: 'Completed', value: completedTasks, color: 'text-emerald-600' },
          { label: 'Progress', value: `${progress}%`, color: 'text-blue-600' },
          { label: 'Status', value: plan.is_active ? 'Active' : 'Inactive', color: plan.is_active ? 'text-emerald-600' : 'text-gray-400' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <p className="text-xs font-medium text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 p-4 shadow-sm mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span className="font-medium">Overall Progress</span>
          <span className="font-bold text-gray-900">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200/70 rounded-full h-3 overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor(progress)}`}
          />
        </div>
      </div>

      {/* Tasks */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-emerald-500" />
          Tasks ({completedTasks}/{totalTasks})
        </h2>

        {plan.tasks && plan.tasks.length > 0 ? (
          <div className="space-y-2">
            {plan.tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                  task.is_completed
                    ? 'bg-emerald-50/80 border border-emerald-200'
                    : 'bg-gray-50/50 border border-gray-200 hover:bg-gray-100/50'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleTask(task.id, task.is_completed)}
                    disabled={updating}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      task.is_completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-gray-300 hover:border-emerald-400'
                    }`}
                  >
                    {task.is_completed && <CheckCircle className="h-3.5 w-3.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.is_completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{task.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 flex-shrink-0 ml-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatDate(task.task_date)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex p-4 bg-gray-100 rounded-full mb-3">
              <CheckCircle className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No tasks yet</p>
            <p className="text-xs text-gray-400 mt-1">Add tasks to track your progress</p>
          </div>
        )}
      </div>
    </div>
  );
}