import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit,
  Loader2,
  BookOpen,
  MapPin,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Users,
  Building2,
  Sparkles,
  X,
  Check,
  LayoutGrid,
  List,
  Filter,
  Star,
  Award,
  Crown,
  BookMarked,
  GraduationCap,
  School,
  Heart,
  Zap,
  Shield,
  Rocket,
  Target,
  TrendingUp,
  BarChart3,
  Bell,
  Settings,
  MoreVertical,
  Clock as ClockIcon,
  AlertTriangle
} from 'lucide-react';
import { timetableService } from '../../services/timetableService';
import { subjectService } from '../../services/subjectService';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DAYS_LABELS = {
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
  SAT: 'Saturday',
  SUN: 'Sunday',
};

const DAYS_SHORT = {
  MON: 'Mon',
  TUE: 'Tue',
  WED: 'Wed',
  THU: 'Thu',
  FRI: 'Fri',
  SAT: 'Sat',
  SUN: 'Sun',
};

const COLORS = [
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
  'from-emerald-500 to-emerald-600',
  'from-orange-500 to-orange-600',
  'from-pink-500 to-pink-600',
  'from-indigo-500 to-indigo-600',
  'from-teal-500 to-teal-600',
  'from-red-500 to-red-600',
  'from-amber-500 to-amber-600',
  'from-cyan-500 to-cyan-600',
];

const LIGHT_COLORS = [
  'bg-blue-50 border-blue-200 text-blue-700 hover:shadow-blue-100',
  'bg-purple-50 border-purple-200 text-purple-700 hover:shadow-purple-100',
  'bg-emerald-50 border-emerald-200 text-emerald-700 hover:shadow-emerald-100',
  'bg-orange-50 border-orange-200 text-orange-700 hover:shadow-orange-100',
  'bg-pink-50 border-pink-200 text-pink-700 hover:shadow-pink-100',
  'bg-indigo-50 border-indigo-200 text-indigo-700 hover:shadow-indigo-100',
  'bg-teal-50 border-teal-200 text-teal-700 hover:shadow-teal-100',
  'bg-red-50 border-red-200 text-red-700 hover:shadow-red-100',
  'bg-amber-50 border-amber-200 text-amber-700 hover:shadow-amber-100',
  'bg-cyan-50 border-cyan-200 text-cyan-700 hover:shadow-cyan-100',
];

export default function Timetable() {
  const [schedules, setSchedules] = useState({});
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [semester, setSemester] = useState('2024-S1');
  const [viewMode, setViewMode] = useState('grid');
  const [filterDay, setFilterDay] = useState('ALL');
  const [hoveredId, setHoveredId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    scheduleId: null,
    scheduleName: '',
    scheduleTime: '',
    scheduleRoom: ''
  });
  const [formData, setFormData] = useState({
    subject_id: '',
    day_of_week: 'MON',
    start_time: '',
    end_time: '',
    room: '',
  });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadData();
  }, [semester]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [groupedRes, subjectsRes, statsRes] = await Promise.all([
        timetableService.getGroupedSchedules(semester),
        subjectService.getSubjects(),
        timetableService.getStats(),
      ]);

      if (groupedRes.success) setSchedules(groupedRes.data);
      if (subjectsRes.success) setSubjects(subjectsRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch (error) {
      console.error('Load data error:', error);
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        start_time: new Date(`2024-01-01T${formData.start_time}`).toISOString(),
        end_time: new Date(`2024-01-01T${formData.end_time}`).toISOString(),
        semester,
      };

      let response;
      if (editingId) {
        response = await timetableService.updateSchedule(editingId, data);
      } else {
        response = await timetableService.createSchedule(data);
      }

      if (response.success) {
        toast.success(editingId ? '✅ Schedule updated!' : '✅ Class added!');
        setShowForm(false);
        setEditingId(null);
        setFormData({ subject_id: '', day_of_week: 'MON', start_time: '', end_time: '', room: '' });
        loadData();
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to save schedule');
    }
  };

  const openDeleteModal = (id, subjectName, startTime, endTime, room) => {
    setDeleteModal({
      isOpen: true,
      scheduleId: id,
      scheduleName: subjectName,
      scheduleTime: `${formatTime(startTime)} - ${formatTime(endTime)}`,
      scheduleRoom: room || 'No room assigned'
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      scheduleId: null,
      scheduleName: '',
      scheduleTime: '',
      scheduleRoom: ''
    });
  };

  const confirmDelete = async () => {
    try {
      const response = await timetableService.deleteSchedule(deleteModal.scheduleId);
      if (response.success) {
        toast.success('🗑️ Class deleted successfully!');
        closeDeleteModal();
        loadData();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete class');
    }
  };

  const handleEdit = (id) => {
    for (const day of DAYS) {
      const schedule = schedules[day]?.find(s => s.id === id);
      if (schedule) {
        setFormData({
          subject_id: schedule.subject_id,
          day_of_week: schedule.day_of_week,
          start_time: new Date(schedule.start_time).toTimeString().slice(0, 5),
          end_time: new Date(schedule.end_time).toTimeString().slice(0, 5),
          room: schedule.room || '',
        });
        setEditingId(id);
        setShowForm(true);
        break;
      }
    }
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? `${subject.code} - ${subject.name}` : 'Unknown';
  };

  const getSubjectCode = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.code : 'N/A';
  };

  const getSubjectColor = (index) => {
    return COLORS[index % COLORS.length];
  };

  const getLightColor = (index) => {
    return LIGHT_COLORS[index % LIGHT_COLORS.length];
  };

  const formatTime = (time) => {
    return new Date(time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDayCount = () => {
    return DAYS.filter(day => (schedules[day] || []).length > 0).length;
  };

  const getTotalClasses = () => {
    return Object.values(schedules).reduce((acc, day) => acc + day.length, 0);
  };

  const getUniqueSubjects = () => {
    const subjectIds = new Set();
    Object.values(schedules).forEach(day => {
      day.forEach(s => subjectIds.add(s.subject_id));
    });
    return subjectIds.size;
  };

  const getUniqueRooms = () => {
    const rooms = new Set();
    Object.values(schedules).forEach(day => {
      day.forEach(s => {
        if (s.room) rooms.add(s.room);
      });
    });
    return rooms.size;
  };

  const filteredSchedules = (day) => {
    if (filterDay === 'ALL') return schedules[day] || [];
    return (schedules[day] || []).filter(s => s.day_of_week === filterDay);
  };

  const allSchedules = Object.values(schedules).flat();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-cyan-50/40 to-blue-50/40 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="h-20 w-20 rounded-full border-4 border-cyan-100 border-t-cyan-600 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Calendar className="h-8 w-8 text-cyan-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-sm font-medium text-gray-500 animate-pulse">Loading your timetable...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-cyan-50/40 to-blue-50/40 p-4 md:p-6">
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
                      Delete Class?
                    </h3>
                    
                    <p className="text-sm text-gray-500 mb-1">
                      You are about to delete this class:
                    </p>
                    
                    <div className="w-full bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                      <p className="text-base font-semibold text-gray-800">
                        {deleteModal.scheduleName}
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full text-blue-700">
                          <Clock className="h-3.5 w-3.5" />
                          {deleteModal.scheduleTime}
                        </span>
                        <span className="flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-full text-orange-700">
                          <MapPin className="h-3.5 w-3.5" />
                          {deleteModal.scheduleRoom}
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
                        Delete Class
                      </motion.button>
                    </div>

                    {/* Keyboard shortcut hint */}
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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header - Premium Design */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8"
        >
          <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl shadow-black/5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"></div>
            
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative p-3.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/30">
                    <Calendar className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center gap-2">
                    Timetable
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full shadow-lg shadow-cyan-500/30">
                      {semester}
                    </span>
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2 flex-wrap">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    <span>Your weekly class schedule</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-cyan-600 font-medium">{getTotalClasses()} classes</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-2xl text-sm focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all shadow-sm"
                >
                  <option value="2024-S1">📚 Semester 1, 2024</option>
                  <option value="2024-S2">📚 Semester 2, 2024</option>
                  <option value="2025-S1">📚 Semester 1, 2025</option>
                </select>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(6, 182, 212, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowForm(!showForm);
                    setEditingId(null);
                    if (!showForm) {
                      setFormData({ subject_id: '', day_of_week: 'MON', start_time: '', end_time: '', room: '' });
                    }
                  }}
                  className="relative px-6 py-2.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white rounded-2xl font-semibold shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  <div className="relative flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Class
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
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
        >
          {[
            { label: 'Total Classes', value: getTotalClasses(), icon: Calendar, color: 'from-cyan-500 to-cyan-600' },
            { label: 'Days', value: getDayCount(), icon: LayoutGrid, color: 'from-blue-500 to-blue-600' },
            { label: 'Subjects', value: getUniqueSubjects(), icon: BookOpen, color: 'from-purple-500 to-purple-600' },
            { label: 'Rooms', value: getUniqueRooms(), icon: Building2, color: 'from-orange-500 to-orange-600' },
          ].map((stat, index) => (
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
                <div className={`p-2.5 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg shadow-cyan-200/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Form - Enhanced */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 p-6 mb-6 shadow-xl shadow-black/5 overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"></div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <div className={`p-1.5 rounded-xl ${editingId ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'}`}>
                    {editingId ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </div>
                  {editingId ? 'Edit Class' : 'Add New Class'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject *</label>
                  <select
                    value={formData.subject_id}
                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 bg-white/50 transition-all"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.code} - {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Day *</label>
                  <select
                    value={formData.day_of_week}
                    onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 bg-white/50 transition-all"
                    required
                  >
                    {DAYS.map(day => (
                      <option key={day} value={day}>{DAYS_LABELS[day]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time *</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 bg-white/50 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">End Time *</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 bg-white/50 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Room</label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="e.g. Room 201"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 bg-white/50 transition-all"
                  />
                </div>

                <div className="lg:col-span-5 flex gap-2 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all"
                  >
                    {editingId ? 'Update Class' : 'Add Class'}
                  </motion.button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Controls - Enhanced */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-200/80 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all duration-300 ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-200'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all duration-300 ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-200'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-200/80 shadow-sm">
            <Filter className="h-4 w-4 text-gray-400 ml-1.5" />
            <select
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
              className="px-3 py-1.5 bg-transparent border-none rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
            >
              <option value="ALL">All Days</option>
              {DAYS.map(day => (
                <option key={day} value={day}>{DAYS_LABELS[day]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Timetable Grid/List */}
        {getTotalClasses() === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative text-center py-24 bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-3xl"></div>
            <div className="relative">
              <div className="inline-flex p-8 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full mb-6">
                <Calendar className="h-20 w-20 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">No classes scheduled</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                Add your first class to build your timetable and stay organized!
              </p>
              <Button
                variant="gradient"
                className="mt-6 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/40 rounded-2xl"
                onClick={() => {
                  setShowForm(true);
                  setEditingId(null);
                  setFormData({ subject_id: '', day_of_week: 'MON', start_time: '', end_time: '', room: '' });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Class
              </Button>
            </div>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 overflow-x-auto shadow-xl hover:shadow-2xl transition-shadow">
            <div className="grid grid-cols-7 min-w-[800px]">
              {/* Header */}
              {DAYS.map(day => (
                <div
                  key={day}
                  className={`p-4 text-center font-semibold text-gray-700 border-b border-gray-200/50 ${
                    filterDay === 'ALL' || filterDay === day 
                      ? 'bg-gradient-to-r from-cyan-50/50 to-blue-50/50' 
                      : 'bg-gray-50/30'
                  }`}
                >
                  <div className="text-sm font-bold">{DAYS_SHORT[day]}</div>
                  <div className="text-[10px] font-normal text-gray-400">
                    {(schedules[day] || []).length} classes
                  </div>
                </div>
              ))}

              {/* Body */}
              {DAYS.map(day => {
                const daySchedules = filterDay === 'ALL' || filterDay === day ? (schedules[day] || []) : [];
                return (
                  <div
                    key={day}
                    className={`p-3 min-h-[160px] border-r border-b border-gray-100/50 last:border-r-0 transition-all ${
                      filterDay === 'ALL' || filterDay === day ? 'bg-white/50' : 'bg-gray-50/20'
                    }`}
                  >
                    {daySchedules.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-300 text-xs">
                        <span className="bg-gray-50/50 px-3 py-1.5 rounded-full">Empty</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {daySchedules.map((schedule, index) => {
                          const color = getSubjectColor(index);
                          const lightColor = getLightColor(index);
                          return (
                            <motion.div
                              key={schedule.id}
                              variants={itemVariants}
                              initial="hidden"
                              animate="visible"
                              whileHover={{ scale: 1.03, y: -2 }}
                              className={`p-3 rounded-xl ${lightColor} border shadow-sm group relative transition-all duration-200`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold truncate text-gray-800">
                                    {getSubjectCode(schedule.subject_id)}
                                  </p>
                                  <p className="text-[11px] font-medium text-gray-700 truncate">
                                    {getSubjectName(schedule.subject_id).split(' - ')[1] || getSubjectName(schedule.subject_id)}
                                  </p>
                                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-1">
                                    <ClockIcon className="h-2.5 w-2.5" />
                                    {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                                  </div>
                                  {schedule.room && (
                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                                      <MapPin className="h-2.5 w-2.5" />
                                      {schedule.room}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleEdit(schedule.id)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
                                    title="Edit"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => openDeleteModal(
                                      schedule.id,
                                      getSubjectName(schedule.subject_id),
                                      schedule.start_time,
                                      schedule.end_time,
                                      schedule.room
                                    )}
                                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // List View - Enhanced
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 overflow-hidden shadow-xl hover:shadow-2xl transition-shadow">
            <div className="divide-y divide-gray-100/50">
              {allSchedules
                .filter(s => filterDay === 'ALL' || s.day_of_week === filterDay)
                .sort((a, b) => {
                  const dayOrder = DAYS.indexOf(a.day_of_week) - DAYS.indexOf(b.day_of_week);
                  if (dayOrder !== 0) return dayOrder;
                  return new Date(a.start_time) - new Date(b.start_time);
                })
                .map((schedule, index) => {
                  const lightColor = getLightColor(index);
                  return (
                    <motion.div
                      key={schedule.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex flex-wrap items-center justify-between p-4 hover:bg-gradient-to-r hover:from-cyan-50/30 hover:to-blue-50/30 transition-all gap-3 group"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-[200px]">
                        <div className={`w-1 h-12 rounded-full bg-gradient-to-b ${getSubjectColor(index)}`} />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {getSubjectName(schedule.subject_id)}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-cyan-50 rounded-full text-cyan-700">
                              <Calendar className="h-3 w-3" />
                              {DAYS_LABELS[schedule.day_of_week]}
                            </span>
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 rounded-full text-blue-700">
                              <Clock className="h-3 w-3" />
                              {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                            </span>
                            {schedule.room && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-50 rounded-full text-orange-700">
                                <MapPin className="h-3 w-3" />
                                {schedule.room}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(schedule.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(
                            schedule.id,
                            getSubjectName(schedule.subject_id),
                            schedule.start_time,
                            schedule.end_time,
                            schedule.room
                          )}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}