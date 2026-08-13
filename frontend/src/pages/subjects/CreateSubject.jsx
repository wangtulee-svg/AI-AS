import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { subjectService } from '../../services/subjectService';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import toast from 'react-hot-toast';
import { 
  GraduationCap, 
  ArrowLeft, 
  Save, 
  X, 
  BookOpen,
  Users,
  Calendar,
  Building2,
  Award,
  Clock,
  FileText,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight
} from 'lucide-react';

const subjectSchema = z.object({
  code: z.string().min(2, 'ກະລຸນາໃສ່ລະຫັດວິຊາ'),
  name: z.string().min(2, 'ກະລຸນາໃສ່ຊື່ວິຊາ'),
  description: z.string().optional(),
  credits: z.number().min(1, 'ຕ້ອງມີຢ່າງໜ້ອຍ 1 ໜ່ວຍກິດ').max(6, 'ຕ້ອງມີບໍ່ເກີນ 6 ໜ່ວຍກິດ'),
  faculty: z.string().optional(),
  semester: z.number().min(1, 'ພາກຮຽນຕ້ອງຢູ່ລະຫວ່າງ 1-8').max(8, 'ພາກຮຽນຕ້ອງຢູ່ລະຫວ່າງ 1-8').optional(),
  year: z.number().min(2000, 'ປີຕ້ອງຖືກຕ້ອງ').max(2100, 'ປີຕ້ອງຖືກຕ້ອງ').optional()
});

export default function CreateSubject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const isEditing = !!id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      credits: 3,
      semester: 1,
      year: new Date().getFullYear()
    }
  });

  useEffect(() => {
    if (isEditing) {
      loadSubject();
    }
  }, [id]);

  const loadSubject = async () => {
    try {
      const response = await subjectService.getSubjectById(id);
      if (response.success) {
        const data = response.data;
        reset({
          code: data.code,
          name: data.name,
          description: data.description || '',
          credits: data.credits || 3,
          faculty: data.faculty || '',
          semester: data.semester || '',
          year: data.year || ''
        });
      }
    } catch (error) {
      console.error('Load subject error:', error);
      toast.error('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນວິຊາ');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let response;
      if (isEditing) {
        response = await subjectService.updateSubject(id, data);
      } else {
        response = await subjectService.createSubject(data);
      }
      
      if (response.success) {
        toast.success(isEditing ? 'ອັບເດດວິຊາສຳເລັດ! 🎉' : 'ສ້າງວິຊາໃໝ່ສຳເລັດ! 🎉');
        navigate('/subjects');
      } else {
        toast.error(response.message || 'ບໍ່ສາມາດບັນທຶກວິຊາ');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'ບໍ່ສາມາດບັນທຶກວິຊາ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      {/* Back Button with Animation */}
      <button
        onClick={() => navigate('/subjects')}
        className="group flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-all duration-200 mb-6"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
        <span className="text-sm font-medium">ກັບຄືນສູ່ລາຍຊື່ວິຊາ</span>
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header with Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 px-8 py-8">
          <div className="absolute right-0 top-0 opacity-10">
            <GraduationCap className="h-48 w-48 text-white" />
          </div>
          <div className="absolute -bottom-12 -left-12 opacity-10">
            <BookOpen className="h-48 w-48 text-white" />
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
              {isEditing ? (
                <BookOpen className="h-7 w-7 text-white" />
              ) : (
                <Sparkles className="h-7 w-7 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {isEditing ? 'ແກ້ໄຂວິຊາ' : 'ສ້າງວິຊາໃໝ່'}
              </h1>
              <p className="text-emerald-100 text-sm mt-0.5">
                {isEditing ? 'ປັບປຸງຂໍ້ມູນວິຊາທີ່ມີຢູ່' : 'ກຽມພ້ອມສ້າງວິຊາໃໝ່ໃນລະບົບ'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
          {/* Two column layout for main fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                ລະຫັດວິຊາ <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BookOpen className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  {...register('code')}
                  type="text"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder:text-gray-400"
                  placeholder="ເຊັ່ນ: CS101"
                />
              </div>
              {errors.code && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.code.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                ຊື່ວິຊາ <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  {...register('name')}
                  type="text"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder:text-gray-400"
                  placeholder="ເຊັ່ນ: Introduction to Computer Science"
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.name.message}
                </p>
              )}
            </div>
          </div>

          {/* Description - full width */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              ຄຳອະທິບາຍ
            </label>
            <div className="relative group">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <textarea
                {...register('description')}
                rows="4"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder:text-gray-400 resize-none"
                placeholder="ອະທິບາຍກ່ຽວກັບວິຊານີ້ (ເນື້ອຫາ, ຈຸດປະສົງ, ສິ່ງທີ່ຈະໄດ້ຮຽນ...)"
              />
            </div>
          </div>

          {/* Credits & Faculty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                ຈຳນວນໜ່ວຍກິດ
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Award className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  {...register('credits', { valueAsNumber: true })}
                  type="number"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder:text-gray-400"
                  placeholder="3"
                />
              </div>
              {errors.credits && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.credits.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                ຄະນະ
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  {...register('faculty')}
                  type="text"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder:text-gray-400"
                  placeholder="ວິສະວະກຳ"
                />
              </div>
            </div>
          </div>

          {/* Semester & Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                ພາກຮຽນ
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  {...register('semester', { valueAsNumber: true })}
                  type="number"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder:text-gray-400"
                  placeholder="1"
                />
              </div>
              {errors.semester && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.semester.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                ປີ
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  {...register('year', { valueAsNumber: true })}
                  type="number"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder:text-gray-400"
                  placeholder="2024"
                />
              </div>
              {errors.year && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.year.message}
                </p>
              )}
            </div>
          </div>

          {/* Form Actions - Beautiful Buttons */}
          <div className="pt-6 border-t-2 border-gray-100">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Submit Button - ສ້າງວິຊາ */}
              <button
                type="submit"
                disabled={loading}
                className={`
                  relative flex-1 sm:flex-none px-8 py-3.5 rounded-xl font-semibold text-white
                  bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600
                  hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-700
                  shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40
                  transition-all duration-300 transform hover:-translate-y-0.5
                  active:scale-95
                  flex items-center justify-center gap-2.5
                  ${loading ? 'opacity-70 cursor-not-allowed' : ''}
                `}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    <span>ກຳລັງບັນທຶກ...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>{isEditing ? 'ອັບເດດວິຊາ' : 'ສ້າງວິຊາ'}</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Cancel Button - ຍົກເລີກ */}
              <button
                type="button"
                onClick={() => navigate('/subjects')}
                className="
                  flex-1 sm:flex-none px-8 py-3.5 rounded-xl font-medium text-gray-600
                  bg-gray-100 hover:bg-gray-200
                  hover:text-gray-800
                  transition-all duration-300 transform hover:-translate-y-0.5
                  active:scale-95
                  flex items-center justify-center gap-2.5
                  border-2 border-transparent hover:border-gray-300
                "
              >
                <X className="h-5 w-5" />
                <span>ຍົກເລີກ</span>
              </button>
            </div>

            {/* Keyboard shortcuts hint */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <kbd className="px-2 py-0.5 bg-gray-100 rounded-md text-gray-600 font-mono text-[10px]">Ctrl</kbd>
                <span>+</span>
                <kbd className="px-2 py-0.5 bg-gray-100 rounded-md text-gray-600 font-mono text-[10px]">Enter</kbd>
                <span className="ml-1">ເພື່ອບັນທຶກ</span>
              </span>
              <span className="w-px h-4 bg-gray-200" />
              <span className="flex items-center gap-1.5">
                <kbd className="px-2 py-0.5 bg-gray-100 rounded-md text-gray-600 font-mono text-[10px]">Esc</kbd>
                <span>ເພື່ອຍົກເລີກ</span>
              </span>
            </div>
          </div>
        </form>
      </div>

      {/* Success Tips */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-4 border border-emerald-200/50">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/25">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-700">ສ້າງສຳເລັດ</p>
              <p className="text-xs text-emerald-600">ວິຊາຈະປາກົດໃນລາຍຊື່ທັນທີ</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-4 border border-blue-200/50">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500 rounded-xl shadow-lg shadow-blue-500/25">
              <Users className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700">ໃຫ້ນັກສຶກສາລົງທະບຽນ</p>
              <p className="text-xs text-blue-600">ນັກສຶກສາສາມາດເລືອກວິຊານີ້ໄດ້</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-4 border border-purple-200/50">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-500 rounded-xl shadow-lg shadow-purple-500/25">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-purple-700">ອັບໂຫຼດເອກະສານ</p>
              <p className="text-xs text-purple-600">ເພີ່ມເອກະສານທີ່ກ່ຽວຂ້ອງກັບວິຊາ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}