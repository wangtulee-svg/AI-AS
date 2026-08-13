// frontend/src/pages/study-planner/StudyPlanEdit.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Save, X, Loader2, AlertCircle, BookOpen } from 'lucide-react';
import { studyPlannerService } from '../../services/studyPlannerService';
import { subjectService } from '../../services/subjectService';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function StudyPlanEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [subjects, setSubjects] = useState([]);
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
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [planRes, subjectsRes] = await Promise.all([
        studyPlannerService.getPlanById(id),
        subjectService.getSubjects(),
      ]);

      if (planRes.success) {
        const plan = planRes.data;
        setFormData({
          title: plan.title || '',
          description: plan.description || '',
          start_date: plan.start_date?.split('T')[0] || '',
          end_date: plan.end_date?.split('T')[0] || '',
          subject_id: plan.subject_id || '',
          is_active: plan.is_active ?? true,
        });
      } else {
        toast.error('Study plan not found');
        navigate('/study-planner');
      }

      if (subjectsRes.success) {
        setSubjects(subjectsRes.data);
      }
    } catch (error) {
      console.error('Load data error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.end_date) newErrors.end_date = 'End date is required';
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (end < start) newErrors.end_date = 'End date must be after start date';
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

    setSubmitting(true);
    try {
      const response = await studyPlannerService.updatePlan(id, formData);
      if (response.success) {
        toast.success('Study plan updated successfully! 🎉');
        navigate('/study-planner');
      } else {
        toast.error(response.message || 'Failed to update study plan');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update study plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
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

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
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
        className="relative mb-6"
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/20">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            Edit Study Plan
          </h1>
          <p className="text-sm text-gray-500 mt-1 ml-14">Update your study plan details and schedule</p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm p-6 md:p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
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
            </div>
            {errors.title && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your study plan..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition bg-white/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition bg-white/50 ${
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                min={formData.start_date || getMinDate()}
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition bg-white/50 ${
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Subject (Optional)
            </label>
            <select
              name="subject_id"
              value={formData.subject_id}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition bg-white/50 appearance-none"
            >
              <option value="">No specific subject</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.code} - {subject.name}
                </option>
              ))}
            </select>
          </div>

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

          <div className="flex gap-3 pt-4 border-t border-gray-200/50">
            <Button
              type="submit"
              loading={submitting}
              className="flex-1 shadow-lg shadow-emerald-500/25 rounded-xl"
            >
              <Save className="h-4 w-4 mr-2" />
              Update Plan
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
    </div>
  );
}