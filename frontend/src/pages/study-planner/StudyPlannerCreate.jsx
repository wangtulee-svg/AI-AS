// frontend/src/pages/study-planner/StudyPlannerCreate.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Plus, 
  Save, 
  X, 
  Sparkles,
  Target,
  Clock,
  BookOpen,
  Users,
  Award,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { studyPlannerService } from '../../services/studyPlannerService';
import { subjectService } from '../../services/subjectService';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function StudyPlannerCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    subject_id: '',
    is_active: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const response = await subjectService.getSubjects();
      if (response.success) {
        setSubjects(response.data);
      }
    } catch (error) {
      console.error('Load subjects error:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoadingSubjects(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (end < start) {
        newErrors.end_date = 'End date must be after start date';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);
    try {
      const response = await studyPlannerService.createPlan(formData);
      if (response.success) {
        toast.success('Study plan created successfully! 🎉');
        navigate('/study-planner');
      } else {
        toast.error(response.message || 'Failed to create study plan');
      }
    } catch (error) {
      console.error('Create plan error:', error);
      toast.error('Failed to create study plan');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // ລ້າງ Error ເມື່ອມີການປ່ຽນແປງ
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50/40 to-teal-50/40 p-4 md:p-6">
      {/* Decorative Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/study-planner')}
          className="group flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Study Plans</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
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
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Create Study Plan
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    <span>Plan your study schedule and track your progress</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl shadow-black/5 p-6 md:p-8 overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Plan Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Final Exam Study Plan"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition bg-white/50 ${
                    errors.title ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.title}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your study plan..."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition bg-white/50 resize-none"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    min={getMinDate()}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition bg-white/50 ${
                      errors.start_date ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.start_date && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.start_date}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  End Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    min={formData.start_date || getMinDate()}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition bg-white/50 ${
                      errors.end_date ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.end_date && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.end_date}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Subject Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Subject (Optional)
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  name="subject_id"
                  value={formData.subject_id}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition bg-white/50 appearance-none"
                >
                  <option value="">No specific subject</option>
                  {loadingSubjects ? (
                    <option value="" disabled>Loading subjects...</option>
                  ) : (
                    subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.code} - {subject.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <label className="text-sm text-gray-700 cursor-pointer">
                <span className="font-medium">Active</span>
                <span className="text-gray-500 ml-1">- The plan will be visible and active</span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200/50">
              <Button
                type="submit"
                loading={loading}
                className="flex-1 shadow-lg shadow-emerald-500/25 rounded-xl"
              >
                <Save className="h-4 w-4 mr-2" />
                Create Plan
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/study-planner')}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/50 hover:shadow-lg transition-all">
            <div className="p-2 bg-emerald-50 rounded-xl inline-block">
              <Target className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mt-2 text-sm">Set Clear Goals</h3>
            <p className="text-xs text-gray-500 mt-1">Define what you want to achieve with this study plan</p>
          </div>
          <div className="p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/50 hover:shadow-lg transition-all">
            <div className="p-2 bg-teal-50 rounded-xl inline-block">
              <Clock className="h-5 w-5 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mt-2 text-sm">Manage Your Time</h3>
            <p className="text-xs text-gray-500 mt-1">Allocate time wisely between subjects and tasks</p>
          </div>
          <div className="p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/50 hover:shadow-lg transition-all">
            <div className="p-2 bg-amber-50 rounded-xl inline-block">
              <Award className="h-5 w-5 text-amber-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mt-2 text-sm">Track Progress</h3>
            <p className="text-xs text-gray-500 mt-1">Monitor your progress and celebrate achievements</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}