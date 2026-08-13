import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  BookOpen,
  Loader2,
  GraduationCap,
  Users,
  FileText,
  Clock,
  Calendar,
  Building2,
  Award,
  ChevronRight,
  Sparkles,
  FolderOpen,
  BarChart3,
  TrendingUp,
  Star,
  BookMarked,
  X,
  AlertTriangle,
  Globe,
  Zap,
  Shield,
  Layers,
  Grid3x3,
  List,
  ArrowUpRight,
  CheckCircle,
  Clock as ClockIcon,
  Book,
  UserCheck,
  FileCheck,
  FolderTree,
  School,
  Hash
} from 'lucide-react';
import { subjectService } from '../../services/subjectService';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function SubjectsList() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, subjectId: null, subjectName: '' });
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const response = await subjectService.getSubjects();
      if (response.success) {
        setSubjects(response.data);
      }
    } catch (error) {
      console.error('Load subjects error:', error);
      toast.error('ບໍ່ສາມາດໂຫຼດວິຊາໄດ້');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const { subjectId } = deleteModal;
    try {
      const response = await subjectService.deleteSubject(subjectId);
      if (response.success) {
        toast.success('ລຶບວິຊາສຳເລັດ');
        setDeleteModal({ isOpen: false, subjectId: null, subjectName: '' });
        loadSubjects();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('ລຶບວິຊາບໍ່ສຳເລັດ');
    }
  };

  const openDeleteModal = (id, name) => {
    setDeleteModal({ isOpen: true, subjectId: id, subjectName: name });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, subjectId: null, subjectName: '' });
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subject.faculty && subject.faculty.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCreditsDisplay = (credits) => {
    return credits + ' ' + (credits > 1 ? 'ໜ່ວຍກິດ' : 'ໜ່ວຍກິດ');
  };

  const getSemesterDisplay = (semester) => {
    if (!semester) return 'ບໍ່ລະບຸ';
    const laoNumbers = ['໐', '໑', '໒', '໓', '໔', '໕', '໖', '໗', '໘', '໙'];
    return semester.toString().split('').map(d => laoNumbers[parseInt(d)]).join('');
  };

  const getSubjectColor = (id) => {
    const colors = [
      'from-emerald-500 to-teal-600',
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-pink-600',
      'from-rose-500 to-red-600',
      'from-amber-500 to-orange-600',
      'from-cyan-500 to-blue-600',
      'from-green-500 to-emerald-600',
      'from-indigo-500 to-purple-600',
    ];
    return colors[id % colors.length];
  };

  const getSubjectIcon = (id) => {
    const icons = [
      GraduationCap, BookOpen, Users, Award, 
      Book, FileText, FolderTree, School
    ];
    return icons[id % icons.length];
  };

  const stats = {
    total: subjects.length,
    faculties: [...new Set(subjects.map(s => s.faculty).filter(Boolean))].length,
    totalCredits: subjects.reduce((acc, s) => acc + (s.credits || 0), 0),
    totalStudents: subjects.reduce((acc, s) => acc + (s._count?.enrollments || 0), 0),
    totalDocuments: subjects.reduce((acc, s) => acc + (s._count?.documents || 0), 0),
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50/30 to-teal-50/30 p-4 md:p-6">
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
                    <BookMarked className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    ວິຊາຮຽນ
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>ຈັດການວິຊາຮຽນທັງໝົດ</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {subjects.length} ວິຊາ
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-blue-600 font-medium flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {stats.faculties} ຄະນະ
                    </span>
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/subjects/create')}
                className="relative px-6 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-2xl font-semibold shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                <div className="relative flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  ເພີ່ມວິຊາໃໝ່
                  <Sparkles className="h-3.5 w-3.5" />
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
          className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6"
        >
          {[
            { label: 'ວິຊາທັງໝົດ', value: stats.total, icon: BookMarked, color: 'emerald', gradient: 'from-emerald-500 to-teal-600' },
            { label: 'ຄະນະ', value: stats.faculties, icon: Building2, color: 'blue', gradient: 'from-blue-500 to-indigo-600' },
            { label: 'ໜ່ວຍກິດ', value: stats.totalCredits, icon: Award, color: 'purple', gradient: 'from-purple-500 to-pink-600' },
            { label: 'ນັກສຶກສາ', value: stats.totalStudents, icon: Users, color: 'orange', gradient: 'from-orange-500 to-amber-600' },
            { label: 'ເອກະສານ', value: stats.totalDocuments, icon: FileText, color: 'cyan', gradient: 'from-cyan-500 to-blue-600' },
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
                  <p className="text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-2.5 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg shadow-${stat.color}-200/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Search & View Mode - Enhanced */}
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
              placeholder="ຄົ້ນຫາວິຊາຕາມຊື່, ລະຫັດ ຫຼື ຄະນະ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="relative w-full pl-11 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-2xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-300 text-sm placeholder:text-gray-400 z-10"
            />
          </div>
          
          <div className="flex gap-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-200/80 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid3x3 className="h-4 w-4" />
              ຮູບກະດານ
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="h-4 w-4" />
              ລາຍການ
            </button>
          </div>
        </motion.div>

        {/* Subjects Grid/List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-emerald-600 animate-pulse" />
              </div>
            </div>
            <p className="mt-6 text-sm font-medium text-gray-500 animate-pulse">ກຳລັງໂຫຼດວິຊາ...</p>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative text-center py-24 bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-3xl"></div>
            <div className="relative">
              <div className="inline-flex p-8 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full mb-6">
                <BookOpen className="h-20 w-20 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">ຍັງບໍ່ມີວິຊາ</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                ເພີ່ມວິຊາທຳອິດຂອງທ່ານ ເພື່ອເລີ່ມຕົ້ນການຈັດການ
              </p>
              <Button
                variant="gradient"
                className="mt-6 shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/40 rounded-2xl"
                onClick={() => navigate('/subjects/create')}
              >
                <Plus className="h-4 w-4 mr-2" />
                ເພີ່ມວິຊາ
              </Button>
            </div>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {filteredSubjects.map((subject, index) => {
              const Icon = getSubjectIcon(index);
              const color = getSubjectColor(index);
              return (
                <motion.div
                  key={subject.id}
                  variants={itemVariants}
                  onHoverStart={() => setHoveredId(subject.id)}
                  onHoverEnd={() => setHoveredId(null)}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 hover:border-emerald-200 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                    <div className={`h-1.5 w-full bg-gradient-to-r ${color}`}></div>
                    
                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`p-3 bg-gradient-to-br ${color} rounded-2xl shadow-lg shadow-emerald-200/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                {subject.code}
                              </span>
                            </div>
                            <h3 className="font-semibold text-gray-900 truncate text-sm mt-0.5">
                              {subject.name}
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 ml-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(`/subjects/${subject.id}`)}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-xl hover:bg-emerald-50 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(`/subjects/edit/${subject.id}`)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openDeleteModal(subject.id, subject.name)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>

                      {subject.description && (
                        <p className="mt-3 text-sm text-gray-600 line-clamp-2 bg-gradient-to-br from-gray-50 to-gray-100/50 p-3 rounded-xl border border-gray-100">
                          {subject.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full text-xs text-blue-700">
                          <Award className="h-3 w-3" />
                          {getCreditsDisplay(subject.credits || 3)}
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 rounded-full text-xs text-purple-700">
                          <Users className="h-3 w-3" />
                          {subject._count?.enrollments || 0} ຄົນ
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-full text-xs text-emerald-700">
                          <FileText className="h-3 w-3" />
                          {subject._count?.documents || 0} ເອກະສານ
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {subject.faculty || 'ບໍ່ລະບຸ'}
                        </span>
                        {subject.semester && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            ພາກຮຽນທີ {getSemesterDisplay(subject.semester)}
                          </span>
                        )}
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ວິຊາ</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ຄະນະ</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ໜ່ວຍກິດ</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ນັກສຶກສາ</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ເອກະສານ</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ພາກຮຽນ</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">ຈັດການ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/50">
                  {filteredSubjects.map((subject, index) => {
                    const Icon = getSubjectIcon(index);
                    const color = getSubjectColor(index);
                    return (
                      <motion.tr
                        key={subject.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-gradient-to-r hover:from-emerald-50/30 hover:to-teal-50/30 transition-all group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 bg-gradient-to-br ${color} rounded-xl shadow-md group-hover:scale-110 transition-transform`}>
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                  {subject.code}
                                </span>
                              </div>
                              <span className="font-medium text-gray-900 text-sm block">{subject.name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{subject.faculty || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                            {subject.credits || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">
                            {subject._count?.enrollments || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs">
                            {subject._count?.documents || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {subject.semester ? `ພາກຮຽນທີ ${getSemesterDisplay(subject.semester)}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => navigate(`/subjects/${subject.id}`)}
                              className="p-2 text-gray-400 hover:text-emerald-600 rounded-xl hover:bg-emerald-50 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => navigate(`/subjects/edit/${subject.id}`)}
                              className="p-2 text-gray-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openDeleteModal(subject.id, subject.name)}
                              className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
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
        {filteredSubjects.length === 0 && searchTerm && !loading && (
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
              <p className="text-gray-500">ບໍ່ພົບວິຊາທີ່ກົງກັບ</p>
              <p className="text-xl font-bold text-gray-700 mt-1">"{searchTerm}"</p>
            </div>
          </motion.div>
        )}

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
                        ຢືນຢັນການລຶບ
                      </h3>
                      
                      <p className="text-sm text-gray-500 mb-1">
                        ທ່ານກຳລັງຈະລຶບວິຊາ
                      </p>
                      <p className="text-lg font-semibold text-gray-800 mb-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                        "{deleteModal.subjectName}"
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 mb-6">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        <span>ການດຳເນີນການນີ້ບໍ່ສາມາດກັບຄືນໄດ້</span>
                      </div>

                      <div className="flex gap-3 w-full">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={closeDeleteModal}
                          className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all"
                        >
                          ຍົກເລີກ
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(239, 68, 68, 0.3)" }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleDelete}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-red-500/30"
                        >
                          ຢືນຢັນການລຶບ
                        </motion.button>
                      </div>

                      {/* Keyboard shortcut hint */}
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
      </div>
    </div>
  );
}