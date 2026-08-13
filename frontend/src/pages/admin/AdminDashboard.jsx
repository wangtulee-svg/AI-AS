// frontend/src/pages/AdminDashboard.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  BookOpen,
  FileText,
  MessageSquare,
  BarChart3,
  TrendingUp,
  UserPlus,
  Activity,
  Clock,
  Zap,
  Brain,
  Database,
  Settings,
  Shield,
  Award,
  ChevronRight,
  Sparkles,
  Rocket,
  Crown,
  Medal,
  Star,
  Heart,
  Flame,
  Target,
  Layers,
  Grid3x3,
  List,
  Filter,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Info,
  Bell,
  Mail,
  Phone,
  MapPin,
  Globe,
  Link,
  Image,
  Video,
  Music,
  Camera,
  Send,
  Paperclip,
  Mic,
  Smile,
  CornerDownLeft,
  Settings as SettingsIcon,
  User,
  UserCheck,
  UserX,
  UserPlus as UserPlusIcon,
  LogOut,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Scan,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  BadgeCheck,
  BadgeX,
  BadgeAlert,
  Trophy,
  Gem,
  Diamond,
  Crown as CrownIcon,
  Star as StarIcon,
  Sparkle,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dailyStats, setDailyStats] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const [statsRes, dailyRes] = await Promise.all([
        adminService.getStats(),
        adminService.getDailyStats(days),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (dailyRes.success) setDailyStats(dailyRes.data);
    } catch (error) {
      console.error('Load admin data error:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    toast.success('Dashboard refreshed!');
  };

  // ກວດສອບວ່າຜູ້ໃຊ້ເປັນ Admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-red-50/40 to-rose-50/40 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 text-center max-w-md border border-white/50 shadow-2xl"
        >
          <div className="inline-flex p-6 bg-gradient-to-br from-red-100 to-rose-100 rounded-full mb-6">
            <ShieldAlert className="h-16 w-16 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500 mb-6">You don't have permission to access this page</p>
          <Button
            variant="gradient"
            onClick={() => navigate('/dashboard')}
            className="shadow-xl shadow-red-500/30"
          >
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/40 to-purple-50/40 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-3xl mb-8"></div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-28 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded-2xl"></div>
              <div className="h-64 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users?.total || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      change: `+${stats?.users?.new || 0} new`,
      bg: 'bg-blue-50',
    },
    {
      title: 'Active Users',
      value: stats?.users?.active || 0,
      icon: UserCheck,
      color: 'from-emerald-500 to-emerald-600',
      change: `${Math.round((stats?.users?.active || 0) / (stats?.users?.total || 1) * 100)}% active`,
      bg: 'bg-emerald-50',
    },
    {
      title: 'Subjects',
      value: stats?.subjects?.total || 0,
      icon: BookOpen,
      color: 'from-purple-500 to-pink-600',
      change: `${stats?.subjects?.top?.length || 0} active`,
      bg: 'bg-purple-50',
    },
    {
      title: 'AI Chats',
      value: stats?.ai?.totalChats || 0,
      icon: MessageSquare,
      color: 'from-orange-500 to-red-600',
      change: `${stats?.ai?.avgMessagesPerUser || 0} avg/user`,
      bg: 'bg-orange-50',
    },
  ];

  // ກຽມຂໍ້ມູນສຳລັບ Pie Chart
  const roleData = stats?.users?.roles?.map(role => ({
    name: role.role || 'unknown',
    value: role._count,
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/40 to-purple-50/40 p-4 md:p-6">
      {/* Decorative Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8"
        >
          <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl shadow-black/5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative p-3.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30">
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center gap-2">
                    Admin Dashboard
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full shadow-lg shadow-indigo-500/30">
                      {user?.role}
                    </span>
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2 flex-wrap">
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                    <span>System overview and management</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-indigo-600 font-medium">v2.0</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-gray-200/50">
                  <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
                  <span className="text-xs font-medium text-emerald-600">System running</span>
                  <span className="w-px h-4 bg-gray-200"></span>
                  <Clock className="h-4 w-4" />
                  <span className="text-xs">{new Date().toLocaleTimeString()}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:border-indigo-300 transition-all"
                >
                  <RefreshCw className={`h-4 w-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Time Range Filter */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm font-medium text-gray-500">Time Range:</span>
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-white/80 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {range === '7d' ? '7 ວັນ' : range === '30d' ? '30 ວັນ' : '90 ວັນ'}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              onHoverStart={() => setHoveredCard(stat.title)}
              onHoverEnd={() => setHoveredCard(null)}
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-5 hover:shadow-2xl hover:border-transparent transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-2.5 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg shadow-indigo-200/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {stat.change}
                </span>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Line Chart - User Growth */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg shadow-cyan-200/50">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Activity Trends</h3>
              </div>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                {timeRange === '7d' ? '7 ວັນຜ່ານມາ' : timeRange === '30d' ? '30 ວັນຜ່ານມາ' : '90 ວັນຜ່ານມາ'}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyStats?.dates?.map((date, i) => ({
                date,
                users: dailyStats?.userCounts?.[i] || 0,
                chats: dailyStats?.chatCounts?.[i] || 0,
                logins: dailyStats?.loginCounts?.[i] || 0,
              })) || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} name="ຜູ້ໃຊ້" />
                <Line type="monotone" dataKey="chats" stroke="#8b5cf6" strokeWidth={2} name="ແຊັດ" />
                <Line type="monotone" dataKey="logins" stroke="#a855f7" strokeWidth={2} name="ເຂົ້າລະບົບ" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie Chart - Role Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl shadow-lg shadow-pink-200/50">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">User Roles</h3>
              </div>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                {stats?.users?.total || 0} users
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {roleData.map((item, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          {[
            {
              title: 'User Management',
              icon: Users,
              color: 'from-blue-500 to-blue-600',
              bg: 'bg-blue-50',
              actions: [
                { label: 'View all users', path: '/admin/users' },
                { label: 'Manage roles', path: '/admin/users' },
              ]
            },
            {
              title: 'System Management',
              icon: Database,
              color: 'from-purple-500 to-pink-600',
              bg: 'bg-purple-50',
              actions: [
                { label: 'Manage subjects', path: '/admin/subjects' },
                { label: 'Manage documents', path: '/admin/documents' },
              ]
            },
            {
              title: 'Content Management',
              icon: FileText,
              color: 'from-emerald-500 to-teal-600',
              bg: 'bg-emerald-50',
              actions: [
                { label: 'All documents', path: '/admin/documents' },
                { label: 'Analytics', path: '/admin/analytics' },
              ]
            },
            {
              title: 'AI & Analytics',
              icon: Brain,
              color: 'from-amber-500 to-orange-600',
              bg: 'bg-amber-50',
              actions: [
                { label: 'AI Usage', path: '/admin/ai-usage' },
                { label: 'Reports', path: '/admin/reports' },
              ]
            },
          ].map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-5 shadow-sm hover:shadow-2xl hover:border-transparent transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2.5 bg-gradient-to-br ${section.color} rounded-xl shadow-lg shadow-indigo-200/50`}>
                  <section.icon className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{section.title}</h3>
              </div>
              <div className="space-y-2">
                {section.actions.map((action, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ x: 5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(action.path)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-gray-50/50 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 rounded-xl transition-all text-sm group"
                  >
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                      {action.label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Subjects */}
          {stats?.subjects?.top?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg shadow-amber-200/50">
                    <Award className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Top Subjects</h3>
                </div>
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                  Most enrolled
                </span>
              </div>
              <div className="space-y-2">
                {stats.subjects.top.slice(0, 5).map((subject, index) => (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="flex items-center justify-between px-4 py-2.5 bg-gray-50/50 hover:bg-gradient-to-r hover:from-indigo-50/30 hover:to-purple-50/30 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${index === 0 ? 'from-amber-400 to-amber-500' : index === 1 ? 'from-gray-400 to-gray-500' : index === 2 ? 'from-amber-600 to-orange-600' : 'from-gray-300 to-gray-400'} flex items-center justify-center text-xs text-white font-bold`}>
                        {index === 0 && <Crown className="h-3.5 w-3.5" />}
                        {index === 1 && <Medal className="h-3.5 w-3.5" />}
                        {index === 2 && <Award className="h-3.5 w-3.5" />}
                        {index > 2 && `#${index + 1}`}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 text-sm">{subject.code}</span>
                        <span className="text-xs text-gray-400 ml-2">{subject.name}</span>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                      {subject._count.enrollments} students
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* System Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg shadow-cyan-200/50">
                <Database className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">System Overview</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500">Total Logins</p>
                <p className="text-xl font-bold text-gray-900">{stats?.system?.totalLogins || 0}</p>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500">Total Quizzes</p>
                <p className="text-xl font-bold text-purple-600">{stats?.quizzes?.total || 0}</p>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500">Total Documents</p>
                <p className="text-xl font-bold text-blue-600">{stats?.documents?.total || 0}</p>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500">PDFs</p>
                <p className="text-xl font-bold text-emerald-600">{stats?.documents?.pdfs || 0}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}