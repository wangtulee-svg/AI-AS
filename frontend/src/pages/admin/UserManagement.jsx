import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Users, 
  Shield, 
  UserCog,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Mail,
  Calendar,
  BookOpen,
  MessageSquare,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  FileText,
  UserPlus,
  Filter,
  MoreVertical,
  Edit,
  UserCheck,
  UserX,
  Clock,
  AlertTriangle,
  X,
  Award,
  Crown,
  Star,
  Zap,
  Sparkles,
  Rocket,
  Target,
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
  Settings,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Scan,
  LogOut,
  UserPlus as UserPlusIcon,
  UserCheck as UserCheckIcon,
  UserX as UserXIcon,
  Users as UsersIcon,
  Mail as MailIcon,
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
  AtSign,
  Hash,
  Tag
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updating, setUpdating] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null, userName: '' });
  const [addUserModal, setAddUserModal] = useState({ isOpen: false });
  const [hoveredId, setHoveredId] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'student',
    student_id: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [page, search, roleFilter, sortBy]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getUsers(page, 10, search);
      if (response.success) {
        let filteredUsers = response.data.users;
        
        if (roleFilter !== 'all') {
          filteredUsers = filteredUsers.filter(u => u.role === roleFilter);
        }
        
        if (sortBy === 'newest') {
          filteredUsers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (sortBy === 'oldest') {
          filteredUsers.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        } else if (sortBy === 'name') {
          filteredUsers.sort((a, b) => a.full_name.localeCompare(b.full_name));
        }
        
        setUsers(filteredUsers);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Load users error:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, role) => {
    setUpdating(userId);
    try {
      const response = await adminService.updateUserRole(userId, role);
      if (response.success) {
        toast.success('User role updated');
        loadUsers();
      }
    } catch (error) {
      console.error('Update role error:', error);
      toast.error('Failed to update role');
    } finally {
      setUpdating(null);
      setSelectedUser(null);
    }
  };

  const openDeleteModal = (userId, userName) => {
    setDeleteModal({ isOpen: true, userId, userName });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, userId: null, userName: '' });
  };

  const confirmDelete = async () => {
    try {
      const response = await adminService.deleteUser(deleteModal.userId);
      if (response.success) {
        toast.success('User deleted successfully');
        closeDeleteModal();
        loadUsers();
      }
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error('Failed to delete user');
    }
  };

  // Handle Add User
  const openAddUserModal = () => {
    setAddUserModal({ isOpen: true });
    setFormData({
      full_name: '',
      email: '',
      password: '',
      role: 'student',
      student_id: '',
    });
  };

  const closeAddUserModal = () => {
    setAddUserModal({ isOpen: false });
    setFormData({
      full_name: '',
      email: '',
      password: '',
      role: 'student',
      student_id: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    if (!formData.full_name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await adminService.createUser(formData);
      if (response.success) {
        toast.success('User created successfully! 🎉');
        closeAddUserModal();
        loadUsers();
      } else {
        toast.error(response.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Create user error:', error);
      toast.error('Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'from-red-500 to-rose-600 shadow-red-200',
      lecturer: 'from-blue-500 to-indigo-600 shadow-blue-200',
      student: 'from-emerald-500 to-teal-600 shadow-emerald-200',
    };
    return colors[role] || 'from-gray-500 to-gray-600';
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: Shield,
      lecturer: UserCog,
      student: Users,
    };
    return icons[role] || Users;
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'text-red-600 bg-red-50 border-red-200',
      lecturer: 'text-blue-600 bg-blue-50 border-blue-200',
      student: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    };
    return colors[role] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    lecturers: users.filter(u => u.role === 'lecturer').length,
    students: users.filter(u => u.role === 'student').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-indigo-50/40 p-4 md:p-6">
      {/* Delete Modal */}
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
                <div className="h-2 w-full bg-gradient-to-r from-red-500 via-rose-500 to-pink-500"></div>
                <button
                  onClick={closeDeleteModal}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors z-10"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="p-8 pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-full blur-2xl"></div>
                      <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center shadow-lg shadow-red-200/50">
                        <AlertTriangle className="h-10 w-10 text-red-600" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete User?</h3>
                    <p className="text-sm text-gray-500 mb-1">You are about to delete user:</p>
                    <p className="text-base font-semibold text-gray-800 mb-4 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                      "{deleteModal.userName}"
                    </p>
                    <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-100 mb-6 w-full">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                      <span>This action cannot be undone. All user data will be removed.</span>
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
                        Delete User
                      </motion.button>
                    </div>
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

      {/* Add User Modal */}
      <AnimatePresence>
        {addUserModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeAddUserModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                <button
                  onClick={closeAddUserModal}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors z-10"
                >
                  <X className="h-5 w-5" />
                </button>
                
                <div className="p-8 pt-6">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-2xl"></div>
                      <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <UserPlus className="h-10 w-10 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Add New User</h3>
                    <p className="text-sm text-gray-500">Create a new user account in the system</p>
                  </div>

                  <form onSubmit={handleAddUserSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          placeholder="e.g. John Doe"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all bg-white/50"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="e.g. user@example.com"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all bg-white/50"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Min 6 characters"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all bg-white/50"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all bg-white/50 appearance-none"
                        >
                          <option value="student">Student</option>
                          <option value="lecturer">Lecturer</option>
                          <option value="admin">Admin</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Student ID (Optional)
                      </label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          name="student_id"
                          value={formData.student_id}
                          onChange={handleInputChange}
                          placeholder="e.g. STU001"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all bg-white/50"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={closeAddUserModal}
                        className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.3)" }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4" />
                            Create User
                          </>
                        )}
                      </motion.button>
                    </div>

                    <p className="text-xs text-gray-400 text-center">
                      Press <kbd className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">ESC</kbd> to cancel
                    </p>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header - Premium Design */}
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
                    <Users className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center gap-2">
                    User Management
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full shadow-lg shadow-blue-500/30">
                      {stats.total} users
                    </span>
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2 flex-wrap">
                    <Shield className="h-4 w-4 text-blue-400" />
                    <span>Manage all users in the system</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-blue-600 font-medium">v2.0</span>
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={openAddUserModal}
                className="relative px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl font-semibold shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                <div className="relative flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add User
                  <Rocket className="h-3.5 w-3.5" />
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
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
        >
          {[
            { label: 'Total', value: stats.total, icon: Users, color: 'from-blue-500 to-blue-600' },
            { label: 'Admins', value: stats.admins, icon: Shield, color: 'from-red-500 to-rose-600' },
            { label: 'Lecturers', value: stats.lecturers, icon: UserCog, color: 'from-blue-500 to-indigo-600' },
            { label: 'Students', value: stats.students, icon: UserCheck, color: 'from-emerald-500 to-teal-600' },
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
                <div className={`p-2.5 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg shadow-blue-200/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Search & Filters - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row gap-3 mb-6"
        >
          <div className="relative flex-1 group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10" />
            <input
              type="text"
              placeholder="Search users by name, email, or student ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="relative w-full pl-11 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-2xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-sm placeholder:text-gray-400 z-10"
            />
          </div>
          
          <div className="flex gap-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-200/80 shadow-sm">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-transparent border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="lecturer">Lecturer</option>
              <option value="student">Student</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-transparent border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name">Name</option>
            </select>
          </div>
        </motion.div>

        {/* Users Grid/Table - Same as before */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Users className="h-8 w-8 text-blue-600 animate-pulse" />
              </div>
            </div>
            <p className="mt-6 text-sm font-medium text-gray-500 animate-pulse">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative text-center py-24 bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-3xl"></div>
            <div className="relative">
              <div className="inline-flex p-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-6">
                <Users className="h-20 w-20 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">No users found</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                Try adjusting your search or filters
              </p>
            </div>
          </motion.div>
        ) : (
          // ... (rest of the users table/cards code remains the same)
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 overflow-hidden shadow-xl hover:shadow-2xl transition-shadow">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Activity</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/50">
                  {users.map((user, index) => {
                    const roleColor = getRoleColor(user.role);
                    const RoleIcon = getRoleIcon(user.role);
                    return (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30 transition-all group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRoleBadge(user.role)} flex items-center justify-center text-white font-semibold text-sm shadow-lg`}>
                              {user.full_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{user.full_name}</p>
                              <p className="text-xs text-gray-500 truncate max-w-[150px]">{user.email}</p>
                              {user.student_id && (
                                <p className="text-xs text-gray-400">ID: {user.student_id}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${roleColor}`}>
                              <RoleIcon className="h-3 w-3" />
                              {user.role}
                            </span>
                            {updating === user.id && (
                              <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-full">
                              <FileText className="h-3 w-3" />
                              {user._count?.documents || 0}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-purple-700 bg-purple-50 px-2.5 py-1.5 rounded-full">
                              <MessageSquare className="h-3 w-3" />
                              {user._count?.chat_messages || 0}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-full">
                              <BarChart3 className="h-3 w-3" />
                              {user._count?.quiz_attempts || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            {formatDate(user.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              disabled={updating === user.id}
                              className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm transition-all"
                            >
                              <option value="student">Student</option>
                              <option value="lecturer">Lecturer</option>
                              <option value="admin">Admin</option>
                            </select>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openDeleteModal(user.id, user.full_name)}
                              className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all"
                              title="Delete user"
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
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-200/80 shadow-sm">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl hover:bg-gray-100 transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </motion.button>
              <span className="px-4 py-1.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-200">
                {page}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl hover:bg-gray-100 transition-all"
              >
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}