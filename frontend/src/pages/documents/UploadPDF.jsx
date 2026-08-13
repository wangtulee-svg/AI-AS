import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  X, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  File,
  Sparkles,
  Zap,
  Rocket,
  Shield,
  Globe,
  Languages,
  ArrowRight,
  Clock,
  BookOpen,
  Star,
  Award,
  CloudUpload,
  FileUp,
  Check,
  AlertTriangle,
  Info
} from 'lucide-react';
import { pdfService } from '../../services/pdfService';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function UploadPDF() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [language, setLanguage] = useState('both');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setUploadedFile(null);
        setSummary(null);
        setUploadProgress(0);
        toast.success(`ເລືອກໄຟລ໌ ${acceptedFiles[0].name} ສຳເລັດແລ້ວ`);
      }
    },
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      const response = await pdfService.uploadPDF(file);
      clearInterval(interval);
      setUploadProgress(100);
      
      if (response.success) {
        setUploadedFile(response.data);
        toast.success('ອັບໂຫຼດ PDF ສຳເລັດແລ້ວ! 🎉');
        await handleSummarize(response.data.document.id);
      } else {
        toast.error('ອັບໂຫຼດບໍ່ສຳເລັດ: ' + response.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('ອັບໂຫຼດ PDF ບໍ່ສຳເລັດ');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSummarize = async (fileId) => {
    setLoadingSummary(true);
    try {
      const response = await pdfService.summarizePDF(fileId, language);
      if (response.success) {
        setSummary(response.data.summary);
        toast.success('ສັງເຄາະຂໍ້ມູນສຳເລັດແລ້ວ! 🎉');
      } else {
        toast.error('ການສັງເຄາະຂໍ້ມູນບໍ່ສຳເລັດ');
      }
    } catch (error) {
      console.error('Summarize error:', error);
      toast.error('ສັງເຄາະຂໍ້ມູນບໍ່ສຳເລັດ');
    } finally {
      setLoadingSummary(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadedFile(null);
    setSummary(null);
    setUploadProgress(0);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getLanguageLabel = (lang) => {
    const labels = {
      both: '🇱🇦 + 🇬🇧 ທັງສອງພາສາ',
      lao: '🇱🇦 ພາສາລາວ',
      english: '🇬🇧 ພາສາອັງກິດ'
    };
    return labels[lang] || lang;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-indigo-100/40 p-4 md:p-6">
      {/* Decorative Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8"
        >
          <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl shadow-black/5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative p-3.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30">
                    <CloudUpload className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    ອັບໂຫຼດ PDF
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
                    <span>ອັບໂຫຼດ ແລະ ສັງເຄາະເອກະສານ PDF ດ້ວຍ AI</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-blue-600 font-medium flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      ປອດໄພ 100%
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Upload Area */}
        {!uploadedFile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div
              {...getRootProps()}
              className={`relative group border-2 border-dashed rounded-3xl p-12 md:p-20 text-center cursor-pointer transition-all duration-500 ${
                isDragActive || dragActive
                  ? 'border-blue-500 bg-blue-50/80 shadow-2xl shadow-blue-200/50 scale-[1.02]'
                  : 'border-gray-300/50 hover:border-blue-400 hover:bg-white/50 hover:shadow-2xl hover:shadow-blue-100/30'
              } bg-white/30 backdrop-blur-sm`}
            >
              <input {...getInputProps()} />
              
              <div className="relative">
                {/* Animated icon */}
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-2xl animate-pulse"></div>
                  <div className={`relative p-6 rounded-full transition-all duration-500 ${
                    isDragActive || dragActive
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 scale-110'
                      : 'bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:scale-110'
                  }`}>
                    {isDragActive || dragActive ? (
                      <FileUp className="h-16 w-16 text-white animate-bounce" />
                    ) : (
                      <Upload className={`h-16 w-16 transition-colors ${
                        file ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  {file ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-center gap-3 text-green-600">
                        <CheckCircle className="h-6 w-6" />
                        <span className="text-lg font-semibold">{file.name}</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile();
                        }}
                        className="text-red-500 hover:text-red-700 font-medium text-sm flex items-center gap-1 mx-auto"
                      >
                        <X className="h-4 w-4" />
                        ເອົາອອກ
                      </button>
                    </motion.div>
                  ) : (
                    <>
                      <p className="text-xl font-semibold text-gray-800">
                        {isDragActive || dragActive ? 'ປ່ອຍ PDF ທີ່ນີ້' : 'ລາກ ແລະ ປ່ອຍ PDF ຂອງທ່ານ'}
                      </p>
                      <p className="text-sm text-gray-500 mt-2 flex items-center justify-center gap-2">
                        <span>ຫຼື ກົດເພື່ອເລືອກໄຟລ໌</span>
                        <span className="w-px h-4 bg-gray-300"></span>
                        <span className="flex items-center gap-1">
                          <File className="h-3 w-3" />
                          ສູງສຸດ 10MB
                        </span>
                      </p>
                    </>
                  )}
                </div>

                {/* Upload Progress */}
                {uploading && uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-6 max-w-md mx-auto">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>ກຳລັງອັບໂຫຼດ...</span>
                      <span className="font-semibold text-blue-600">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Upload Button */}
        {file && !uploadedFile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 flex justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUpload}
              disabled={uploading}
              className="relative px-10 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-2xl font-semibold shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin inline-block mr-2" />
                  ກຳລັງອັບໂຫຼດ...
                </>
              ) : (
                <>
                  <Rocket className="h-5 w-5 inline-block mr-2" />
                  ອັບໂຫຼດ PDF
                  <ArrowRight className="h-4 w-4 inline-block ml-2" />
                </>
              )}
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </motion.button>
          </motion.div>
        )}

        {/* Uploaded File & Summary Options */}
        {uploadedFile && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="mt-6 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl shadow-black/5 p-6 md:p-8 overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400"></div>
            
            <div className="relative">
              {/* File Info */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{uploadedFile.file.filename}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1 bg-gray-100/70 px-2.5 py-1 rounded-full">
                        <BookOpen className="h-3.5 w-3.5" />
                        {uploadedFile.pages} ໜ້າ
                      </span>
                      <span className="flex items-center gap-1 bg-gray-100/70 px-2.5 py-1 rounded-full">
                        <File className="h-3.5 w-3.5" />
                        {formatFileSize(uploadedFile.file.size)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Language Selector */}
              <div className="mt-6 flex flex-wrap items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">ພາສາທີ່ສັງເຄາະ:</span>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="flex-1 min-w-[200px] px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm"
                >
                  <option value="both">🇱🇦 + 🇬🇧 ທັງສອງພາສາ</option>
                  <option value="lao">🇱🇦 ພາສາລາວ</option>
                  <option value="english">🇬🇧 ພາສາອັງກິດ</option>
                </select>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Info className="h-3 w-3" />
                  <span>ປັດຈຸບັນ: {getLanguageLabel(language)}</span>
                </div>
              </div>

              {/* Generate Summary Button */}
              <div className="mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSummarize(uploadedFile.document.id)}
                  disabled={loadingSummary}
                  className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl font-semibold shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loadingSummary ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      ກຳລັງສັງເຄາະ...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      ສັງເຄາະຂໍ້ມູນ
                      <Zap className="h-4 w-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Summary Display */}
        <AnimatePresence>
          {summary && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="mt-6 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl shadow-black/5 p-6 md:p-8 overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                      <Sparkles className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">ບົດສັງເຄາະ</h2>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Languages className="h-3 w-3" />
                        {getLanguageLabel(language)}
                      </p>
                    </div>
                  </div>
                  {summary.success === false && (
                    <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs font-medium">ມີຂໍ້ຜິດພາດ</span>
                    </div>
                  )}
                </div>

                {summary.success === false ? (
                  <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-200/50">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">ບໍ່ສາມາດສັງເຄາະຂໍ້ມູນ</p>
                        <p className="text-sm text-amber-700 mt-1">{summary.summary}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap bg-gradient-to-br from-blue-50/30 to-indigo-50/30 p-6 rounded-2xl border border-blue-100/30">
                    {summary.summary}
                  </div>
                )}

                {/* Quick actions */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>ສັງເຄາະເມື່ອ: {new Date().toLocaleString('lo-LA')}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                    <Check className="h-3 w-3" />
                    <span>ສຳເລັດດ້ວຍ AI</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips & Features */}
        {!uploadedFile && !file && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {[
              {
                icon: Sparkles,
                title: 'ສັງເຄາະດ້ວຍ AI',
                desc: 'ສັງເຄາະເນື້ອໃນອັດສະລິຍະດ້ວຍ AI',
                color: 'blue'
              },
              {
                icon: Globe,
                title: 'ຫຼາຍພາສາ',
                desc: 'ຮອງຮັບພາສາລາວ ແລະ ອັງກິດ',
                color: 'purple'
              },
              {
                icon: Shield,
                title: 'ປອດໄພ 100%',
                desc: 'ຂໍ້ມູນຂອງທ່ານຖືກປົກປ້ອງ',
                color: 'emerald'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/50 hover:shadow-lg transition-all"
              >
                <div className={`p-2.5 bg-${feature.color}-50 rounded-xl inline-block`}>
                  <feature.icon className={`h-5 w-5 text-${feature.color}-600`} />
                </div>
                <h3 className="font-semibold text-gray-800 mt-2 text-sm">{feature.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}