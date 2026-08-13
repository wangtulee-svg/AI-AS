// frontend/src/pages/quiz/TakeQuiz.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Loader2, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  BarChart3,
  AlertCircle,
  Sparkles,
  Brain,
  Target,
  Award,
  Zap,
  Shield,
  ChevronDown
} from 'lucide-react';
import { quizService } from '../../services/quizService';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [id]);

  useEffect(() => {
    if (quiz && quiz.time_limit) {
      setTimeLeft(quiz.time_limit * 60);
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quiz]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      const response = await quizService.getQuizById(id);
      if (response.success) {
        setQuiz(response.data);
        const questions = Array.isArray(response.data.questions) ? response.data.questions : [];
        setAnswers(new Array(questions.length).fill(null));
      }
    } catch (error) {
      console.error('Load quiz error:', error);
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (index) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = index;
    setAnswers(newAnswers);
    setIsAnswered(true);
    
    // Auto advance to next question after 500ms
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
        setIsAnswered(false);
      }, 500);
    }
  };

  const handleSubmit = async () => {
    const unanswered = answers.some(a => a === null);
    if (unanswered) {
      setShowConfirmModal(true);
      return;
    }
    await submitQuiz();
  };

  const submitQuiz = async () => {
    setSubmitting(true);
    try {
      const response = await quizService.submitQuiz(id, answers);
      if (response.success) {
        toast.success(`🎉 Quiz submitted! Score: ${response.data.percentage}%`);
        navigate(`/quiz/${id}/result`, { state: { result: response.data } });
      } else {
        toast.error(response.message || 'Failed to submit quiz');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft === null) return 'text-gray-400';
    if (timeLeft < 60) return 'text-red-500';
    if (timeLeft < 300) return 'text-amber-500';
    return 'text-emerald-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 via-purple-50/40 to-pink-50/40">
        <div className="text-center">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-4 border-purple-100 border-t-purple-600 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="h-8 w-8 text-purple-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-sm font-medium text-gray-500 animate-pulse">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-purple-50/40 to-pink-50/40 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 text-center max-w-md border border-white/50 shadow-2xl"
        >
          <div className="inline-flex p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
            <AlertCircle className="h-16 w-16 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Quiz not found</h3>
          <p className="text-gray-500 mb-6">The quiz you're looking for doesn't exist</p>
          <Button
            variant="gradient"
            onClick={() => navigate('/quiz')}
            className="shadow-xl shadow-purple-500/30"
          >
            Back to Quizzes
          </Button>
        </motion.div>
      </div>
    );
  }

  const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
  const currentQ = questions[currentQuestion];
  const totalQuestions = questions.length;
  const answeredCount = answers.filter(a => a !== null).length;

  if (!currentQ || totalQuestions === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-purple-50/40 to-pink-50/40 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 text-center max-w-md border border-white/50 shadow-2xl"
        >
          <div className="inline-flex p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
            <AlertCircle className="h-16 w-16 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No questions available</h3>
          <p className="text-gray-500 mb-6">This quiz has no questions</p>
          <Button
            variant="gradient"
            onClick={() => navigate('/quiz')}
            className="shadow-xl shadow-purple-500/30"
          >
            Back to Quizzes
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-purple-50/40 to-pink-50/40 p-4 md:p-6">
      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowConfirmModal(false)}
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
                <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"></div>
                <div className="p-8 pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-2xl"></div>
                      <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shadow-lg shadow-amber-200/50">
                        <AlertCircle className="h-10 w-10 text-amber-600" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Submit Quiz?</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      You have {totalQuestions - answeredCount} unanswered question{totalQuestions - answeredCount > 1 ? 's' : ''}
                    </p>
                    <div className="flex gap-3 w-full">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowConfirmModal(false)}
                        className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all"
                      >
                        Continue
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(245, 158, 11, 0.3)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={submitQuiz}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/30"
                      >
                        Submit Anyway
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-xl shadow-black/5 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <button
              onClick={() => navigate('/quiz')}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to Quizzes</span>
            </button>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full text-blue-700">
                <BarChart3 className="h-3.5 w-3.5" />
                <span className="font-medium">{answeredCount}/{totalQuestions}</span>
              </span>
              {timeLeft !== null && (
                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium ${getTimeColor()} bg-gray-50`}>
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(timeLeft)}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quiz Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-500" />
            {quiz.title}
          </h1>
          {quiz.description && (
            <p className="text-sm text-gray-500 mt-1">{quiz.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
              <Target className="h-3 w-3" />
              {quiz.difficulty || 'medium'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              <Sparkles className="h-3 w-3" />
              {totalQuestions} questions
            </span>
            {quiz.time_limit && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="h-3 w-3" />
                {quiz.time_limit} min
              </span>
            )}
          </div>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-4 shadow-sm mb-6"
        >
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 font-medium">
              Question <span className="text-gray-900">{currentQuestion + 1}</span> of {totalQuestions}
            </span>
            <span className="text-gray-400">
              {Math.round(((currentQuestion + 1) / totalQuestions) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200/70 rounded-full h-2 overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500"
            />
          </div>
        </motion.div>

        {/* Question Card */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-xl shadow-black/5 mb-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <span className="text-white font-bold text-sm">{currentQuestion + 1}</span>
              </div>
              <div>
                <span className="text-xs font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                  Question {currentQuestion + 1}
                </span>
              </div>
            </div>
            {answers[currentQuestion] !== null && (
              <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-xs font-medium">
                <Check className="h-3.5 w-3.5" />
                Answered
              </div>
            )}
          </div>

          <h2 className="text-lg font-semibold text-gray-900 mb-6 leading-relaxed">
            {currentQ.question || 'No question text'}
          </h2>

          <div className="space-y-3">
            {currentQ.options && Array.isArray(currentQ.options) ? (
              currentQ.options.map((option, idx) => {
                const isSelected = answers[currentQuestion] === idx;
                const letter = String.fromCharCode(65 + idx);
                const colors = [
                  'border-blue-200 hover:border-blue-400 hover:bg-blue-50/50',
                  'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/50',
                  'border-purple-200 hover:border-purple-400 hover:bg-purple-50/50',
                  'border-rose-200 hover:border-rose-400 hover:bg-rose-50/50',
                ];
                
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: isSelected ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 ring-2 ring-purple-200 shadow-md'
                        : `border-gray-200 hover:border-purple-300 hover:bg-gray-50/50 ${colors[idx % colors.length]}`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                      }`}>
                        {letter}
                      </span>
                      <span className={`text-sm ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                        {option}
                      </span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto"
                        >
                          <Check className="h-5 w-5 text-purple-600" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-8">No options available</p>
            )}
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <Button
            variant="secondary"
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="w-full sm:w-auto"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">
              {answeredCount} of {totalQuestions} answered
            </span>
            {currentQuestion === totalQuestions - 1 ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Submit Quiz
                    <Award className="h-4 w-4" />
                  </>
                )}
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentQuestion(prev => Math.min(totalQuestions - 1, prev + 1))}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Question Navigation Dots */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                index === currentQuestion
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30 scale-110'
                  : answers[index] !== null
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}