// frontend/src/pages/Dashboard.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  FileText, 
  MessageCircle, 
  TrendingUp,
  Calendar,
  Clock,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Trophy,
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [progress, setProgress] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, activitiesRes, progressRes, classesRes] = await Promise.all([
        studentService.getStats(),
        studentService.getRecentActivities(5),
        studentService.getSubjectProgress(),
        studentService.getUpcomingClasses(3),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (activitiesRes.success) setActivities(activitiesRes.data);
      if (progressRes.success) setProgress(progressRes.data);
      if (classesRes.success) setUpcomingClasses(classesRes.data);
    } catch (error) {
      console.error('Load dashboard error:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      quiz: Trophy,
      chat: MessageCircle,
      document: FileText,
    };
    return icons[type] || Sparkles;
  };

  const getActivityColor = (type) => {
    const colors = {
      quiz: 'bg-purple-500',
      chat: 'bg-blue-500',
      document: 'bg-emerald-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-2xl mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-16 w-16 mx-auto text-red-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700">Failed to load dashboard</h3>
        <p className="text-sm text-gray-500 mt-1">{error}</p>
        <button
          onClick={loadData}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    { 
      title: 'Enrolled Subjects', 
      value: stats?.enrolledSubjects || 0, 
      icon: BookOpen, 
      color: 'from-blue-500 to-blue-600',
      change: '+2 this semester'
    },
    { 
      title: 'Documents', 
      value: stats?.documents || 0, 
      icon: FileText, 
      color: 'from-emerald-500 to-emerald-600',
      change: '+5 this week'
    },
    { 
      title: 'AI Chats', 
      value: stats?.chats || 0, 
      icon: MessageCircle, 
      color: 'from-purple-500 to-purple-600',
      change: '+12 today'
    },
    { 
      title: 'Current GPA', 
      value: stats?.gpa || 0, 
      icon: TrendingUp, 
      color: 'from-orange-500 to-orange-600',
      change: '+0.2 from last semester'
    },
  ];

  const quickActions = [
    {
      title: 'AI Study Assistant',
      description: 'Get instant answers and explanations',
      icon: Sparkles,
      color: 'from-blue-500 to-indigo-600',
      path: '/chat',
    },
    {
      title: 'Upload Document',
      description: 'Get AI-powered summaries',
      icon: FileText,
      color: 'from-purple-500 to-violet-600',
      path: '/documents/upload',
    },
    {
      title: 'View Schedule',
      description: 'Check your class timetable',
      icon: Calendar,
      color: 'from-emerald-500 to-teal-600',
      path: '/timetable',
    },
    {
      title: 'Take Quiz',
      description: 'Test your knowledge with AI quizzes',
      icon: Trophy,
      color: 'from-rose-500 to-pink-600',
      path: '/quiz',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white"
      >
        <div className="absolute right-0 top-0 opacity-10">
          <GraduationCap className="h-32 w-32" />
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Welcome back, {user?.full_name || 'Student'}! 🎓
          </h1>
          <p className="text-blue-100 mt-1 text-sm">
            Here's what's happening with your academics today
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-xs backdrop-blur-sm">
              <Users className="h-3 w-3" />
              {user?.role || 'Student'}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-xs backdrop-blur-sm">
              <Award className="h-3 w-3" />
              {user?.faculty || 'Faculty not set'}
            </span>
            {stats?.totalAttempts > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-xs backdrop-blur-sm">
                <CheckCircle className="h-3 w-3" />
                {stats.totalAttempts} quizzes taken
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-4 border border-white/50 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} shadow-lg`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
            </div>
            <p className="text-xs font-medium text-gray-500 mt-1.5">{stat.title}</p>
            <p className="text-[10px] text-emerald-600 mt-0.5">{stat.change}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions & Upcoming Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                onClick={() => navigate(action.path)}
                className={`group w-full p-3 rounded-xl bg-gradient-to-br ${action.color} text-white cursor-pointer hover:shadow-lg hover:brightness-110 transition-all duration-300 text-left`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <action.icon className="h-5 w-5 opacity-90" />
                    <div>
                      <h3 className="text-sm font-semibold">{action.title}</h3>
                      <p className="text-white/80 text-xs">{action.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3">Upcoming Classes</h2>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 overflow-hidden shadow-sm">
            {upcomingClasses.length > 0 ? (
              upcomingClasses.map((cls, index) => (
                <motion.div
                  key={cls.id || index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className={`flex items-center justify-between p-3 transition-colors ${
                    index !== upcomingClasses.length - 1 ? 'border-b border-gray-100/50' : ''
                  } hover:bg-gray-50/50`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{cls.name}</p>
                      <p className="text-xs text-gray-500">{cls.time} • {cls.room}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    cls.isToday
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {cls.isToday ? 'Today' : cls.day}
                  </span>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No upcoming classes</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subject Progress & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Progress */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3">Subject Progress</h2>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 p-4 shadow-sm">
            {progress.length > 0 ? (
              <div className="space-y-3">
                {progress.map((subject) => (
                  <div key={subject.subjectId}>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium text-gray-700">{subject.code}</span>
                        <span className="text-xs text-gray-400 ml-2">{subject.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-blue-600">{subject.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200/70 rounded-full h-2 mt-1 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${subject.progress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <span>{subject.completedQuizzes} of {subject.totalQuizzes} quizzes</span>
                      <span>•</span>
                      <span>{subject.credits} credits</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <BookOpen className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No subjects enrolled</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3">Recent Activity</h2>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 p-4 shadow-sm max-h-[320px] overflow-y-auto custom-scrollbar">
            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity, index) => {
                  const Icon = getActivityIcon(activity.type);
                  const color = getActivityColor(activity.type);
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50/50 transition-all"
                    >
                      <div className={`p-2 rounded-lg ${color} shadow-lg flex-shrink-0`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700">{activity.message}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {activity.score && (
                            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                              Score: {activity.score}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">{formatTime(activity.time)}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <Sparkles className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}