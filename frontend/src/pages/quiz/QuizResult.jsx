import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Trophy,
  BarChart3,
  TrendingUp,
  Share2,
  Download,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { quizService } from '../../services/quizService';

export default function QuizResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    if (location.state?.result) {
      setResult(location.state.result);
      setLoading(false);
    } else {
      // ຖ້າບໍ່ມີຜົນ, ໃຫ້ກັບໄປ
      navigate('/quiz');
    }
  }, [location]);

  const toggleExpand = (index) => {
    setExpanded(prev => ({ ...prev, [index]: !prev[index] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-700">No result found</h3>
        <Button variant="primary" className="mt-4" onClick={() => navigate('/quiz')}>
          Back to Quizzes
        </Button>
      </div>
    );
  }

  const { score, correctCount, totalQuestions, results, passed, percentage } = result;

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <button
        onClick={() => navigate('/quiz')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Quizzes
      </button>

      {/* Result Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-8 text-center mb-6 ${
          passed
            ? 'bg-gradient-to-r from-green-500 to-emerald-600'
            : 'bg-gradient-to-r from-red-500 to-orange-600'
        } text-white shadow-xl`}
      >
        <div className="inline-flex p-4 bg-white/20 rounded-full mb-4">
          {passed ? (
            <Trophy className="h-12 w-12" />
          ) : (
            <TrendingUp className="h-12 w-12" />
          )}
        </div>
        <h2 className="text-3xl font-bold">
          {passed ? '🎉 Congratulations!' : 'Keep Learning!'}
        </h2>
        <p className="text-white/80 mt-1">
          {passed ? 'You passed the quiz!' : 'Review your answers and try again.'}
        </p>
        <div className="mt-4 inline-flex items-center gap-6 bg-white/10 rounded-xl px-6 py-3">
          <div>
            <p className="text-sm text-white/70">Score</p>
            <p className="text-2xl font-bold">{score}%</p>
          </div>
          <div>
            <p className="text-sm text-white/70">Correct</p>
            <p className="text-2xl font-bold">{correctCount}/{totalQuestions}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-sm text-gray-500">Correct</p>
          <p className="text-2xl font-bold text-green-600">{correctCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-sm text-gray-500">Incorrect</p>
          <p className="text-2xl font-bold text-red-600">{totalQuestions - correctCount}</p>
        </div>
      </div>

      {/* Detailed Answers */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-gray-400" />
          Detailed Answers
        </h3>
        <div className="space-y-4">
          {results && Array.isArray(results) && results.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {item.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Q{index + 1}: {item.question}
                  </p>
                  <div className="mt-1 space-y-0.5 text-sm">
                    <p>
                      <span className="text-gray-500">Your answer: </span>
                      <span className={item.isCorrect ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {item.userAnswer !== undefined && item.userAnswer !== null 
                          ? (item.options && item.options[item.userAnswer] 
                              ? item.options[item.userAnswer] 
                              : 'Not answered')
                          : 'Not answered'}
                      </span>
                    </p>
                    {!item.isCorrect && (
                      <p>
                        <span className="text-gray-500">Correct answer: </span>
                        <span className="text-green-600 font-medium">
                          {item.correct !== undefined && item.correct !== null && item.options && item.options[item.correct]
                            ? item.options[item.correct]
                            : 'N/A'}
                        </span>
                      </p>
                    )}
                    {item.explanation && (
                      <button
                        onClick={() => toggleExpand(index)}
                        className="text-xs text-purple-600 hover:text-purple-700 font-medium mt-1"
                      >
                        {expanded[index] ? 'Hide explanation' : 'Show explanation'}
                      </button>
                    )}
                    {item.explanation && expanded[index] && (
                      <p className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                        {item.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mt-6">
        <Button
          variant="primary"
          onClick={() => navigate(`/quiz/${id}`)}
          className="shadow-lg shadow-purple-500/25"
        >
          Retry Quiz
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/quiz')}
        >
          All Quizzes
        </Button>
      </div>
    </div>
  );
}