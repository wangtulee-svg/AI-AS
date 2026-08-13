import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  BookOpen, 
  Users, 
  FileText, 
  Clock,
  Calendar,
  Building2,
  Award,
  User,
  Edit,
  Trash2,
  Loader2,
  GraduationCap,
  UserPlus,
  UserMinus,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { subjectService } from '../../services/subjectService';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function SubjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadSubject();
  }, [id]);

  const loadSubject = async () => {
    setLoading(true);
    try {
      const response = await subjectService.getSubjectById(id);
      if (response.success) {
        setSubject(response.data);
      }
    } catch (error) {
      console.error('Load subject error:', error);
      toast.error('Failed to load subject');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const response = await subjectService.enrollSubject(id);
      if (response.success) {
        toast.success('Enrolled successfully! 🎉');
        loadSubject();
      }
    } catch (error) {
      console.error('Enroll error:', error);
      toast.error('Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    if (!confirm('Are you sure you want to unenroll from this subject?')) return;
    
    setEnrolling(true);
    try {
      const response = await subjectService.unenrollSubject(id);
      if (response.success) {
        toast.success('Unenrolled successfully');
        loadSubject();
      }
    } catch (error) {
      console.error('Unenroll error:', error);
      toast.error('Failed to unenroll');
    } finally {
      setEnrolling(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteModal(false);
    try {
      const response = await subjectService.deleteSubject(id);
      if (response.success) {
        toast.success('Subject deleted successfully');
        navigate('/subjects');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete subject');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading subject details...</p>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="text-center py-20">
        <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-700">Subject not found</h3>
        <Button variant="primary" className="mt-4" onClick={() => navigate('/subjects')}>
          Back to Subjects
        </Button>
      </div>
    );
  }

  const isEnrolled = subject.enrollments?.some(e => e.user_id === subject.lecturer_id);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/subjects')}
        className="group flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-all duration-200 mb-6"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
        <span className="text-sm font-medium">ກັບຄືນສູ່ລາຍຊື່ວິຊາ</span>
      </button>

      {/* Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 rounded-3xl shadow-xl shadow-emerald-500/20 mb-6">
        <div className="absolute right-0 top-0 opacity-10">
          <GraduationCap className="h-48 w-48 text-white" />
        </div>
        <div className="absolute -bottom-12 -left-12 opacity-10">
          <BookOpen className="h-48 w-48 text-white" />
        </div>
        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                  {subject.code}
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                  {subject.credits} ໜ່ວຍກິດ
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {subject.name}
              </h1>
              <p className="text-emerald-100 text-sm mt-1">
                {subject.faculty || 'ບໍ່ລະບຸຄະນະ'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="gradient"
                size="sm"
                onClick={() => navigate(`/subjects/edit/${subject.id}`)}
                className="shadow-lg shadow-white/20 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 rounded-2xl"
              >
                <Edit className="h-4 w-4 mr-1.5" />
                ແກ້ໄຂ
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                className="rounded-2xl"
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                ລຶບ
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">ນັກສຶກສາ</p>
            <Users className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{subject._count?.enrollments || 0}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">ເອກະສານ</p>
            <FileText className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{subject._count?.documents || 0}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">Quiz</p>
            <Award className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{subject._count?.quizzes || 0}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">ພາກຮຽນ</p>
            <Calendar className="h-4 w-4 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {subject.semester ? `ທີ ${getSemesterDisplay(subject.semester)}` : '-'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-emerald-500" />
              ຄຳອະທິບາຍ
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {subject.description || 'ບໍ່ມີຄຳອະທິບາຍ'}
            </p>
          </div>

          {/* Lecturer */}
          {subject.lecturer && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-blue-500" />
                ຜູ້ສອນ
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                  {subject.lecturer.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{subject.lecturer.full_name}</p>
                  <p className="text-xs text-gray-500">{subject.lecturer.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Enrolled Students */}
          {subject.enrollments && subject.enrollments.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-purple-500" />
                ນັກສຶກສາທີ່ລົງທະບຽນ ({subject.enrollments.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {subject.enrollments.map((enrollment, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-medium">
                        {enrollment.user.full_name?.charAt(0) || 'U'}
                      </div>
                      <span className="text-sm text-gray-700">{enrollment.user.full_name}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      {enrollment.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Actions & Info */}
        <div className="space-y-6">
          {/* Enroll Button */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">ການດຳເນີນການ</h3>
            <Button
              variant={isEnrolled ? 'danger' : 'gradient'}
              onClick={isEnrolled ? handleUnenroll : handleEnroll}
              loading={enrolling}
              className="w-full rounded-2xl shadow-lg"
            >
              {isEnrolled ? (
                <>
                  <UserMinus className="h-4 w-4 mr-2" />
                  ຖອນທະບຽນ
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  ລົງທະບຽນ
                </>
              )}
            </Button>
          </div>

          {/* Subject Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">ຂໍ້ມູນວິຊາ</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">ລະຫັດວິຊາ</span>
                <span className="font-medium text-gray-900">{subject.code}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">ຄະນະ</span>
                <span className="font-medium text-gray-900">{subject.faculty || '-'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">ພາກຮຽນ</span>
                <span className="font-medium text-gray-900">
                  {subject.semester ? `ທີ ${getSemesterDisplay(subject.semester)}` : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">ປີ</span>
                <span className="font-medium text-gray-900">{subject.year || '-'}</span>
              </div>
              <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-100">
                <span className="text-gray-500">ສ້າງເມື່ອ</span>
                <span className="font-medium text-gray-900">{formatDate(subject.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 p-6"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">ຢືນຢັນການລຶບ</h3>
              <p className="text-sm text-gray-500 mt-1">
                ທ່ານແນ່ໃຈບໍ່ວ່າຢາກລຶບວິຊາ "{subject?.name}"?
                <br />
                ການດຳເນີນການນີ້ບໍ່ສາມາດກັບຄືນໄດ້.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-2xl"
              >
                ຍົກເລີກ
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                className="flex-1 rounded-2xl shadow-lg shadow-red-500/25"
              >
                ຢືນຢັນການລຶບ
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Helper function for semester display
function getSemesterDisplay(semester) {
  if (!semester) return 'ບໍ່ລະບຸ';
  const laoNumbers = ['໐', '໑', '໒', '໓', '໔', '໕', '໖', '໗', '໘', '໙'];
  return semester.toString().split('').map(d => laoNumbers[parseInt(d)]).join('');
}