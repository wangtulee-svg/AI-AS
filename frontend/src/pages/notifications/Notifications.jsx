import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Check,
  X,
  Trash2,
  Loader2,
  Info,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  MailOpen,
  Mail,
  Clock,
  MoreVertical,
  ChevronDown,
  RefreshCw,
  AlertTriangle as AlertTriangleIcon,
  Filter,
  Calendar,
  User,
  MessageSquare,
  Heart,
  Star,
  Award,
  Crown,
  Sparkles,
  Zap,
  Shield,
  Rocket,
  Target,
  BookOpen,
  Users,
  Settings,
  BellRing,
  BellOff,
  Inbox,
  Archive,
  Eye,
  EyeOff
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';

const TYPE_ICONS = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  achievement: Award,
  update: Sparkles,
  reminder: BellRing,
  message: MessageSquare,
};

const TYPE_COLORS = {
  info: 'from-blue-500 to-blue-600',
  success: 'from-emerald-500 to-emerald-600',
  warning: 'from-amber-500 to-orange-500',
  error: 'from-red-500 to-red-600',
  achievement: 'from-purple-500 to-pink-500',
  update: 'from-cyan-500 to-blue-500',
  reminder: 'from-amber-500 to-amber-600',
  message: 'from-indigo-500 to-purple-500',
};

const TYPE_BG_COLORS = {
  info: 'bg-blue-50 border-blue-200',
  success: 'bg-emerald-50 border-emerald-200',
  warning: 'bg-amber-50 border-amber-200',
  error: 'bg-red-50 border-red-200',
  achievement: 'bg-purple-50 border-purple-200',
  update: 'bg-cyan-50 border-cyan-200',
  reminder: 'bg-amber-50 border-amber-200',
  message: 'bg-indigo-50 border-indigo-200',
};

const TYPE_TEXT_COLORS = {
  info: 'text-blue-600',
  success: 'text-emerald-600',
  warning: 'text-amber-600',
  error: 'text-red-600',
  achievement: 'text-purple-600',
  update: 'text-cyan-600',
  reminder: 'text-amber-600',
  message: 'text-indigo-600',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [filter, setFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [deleteAllModal, setDeleteAllModal] = useState({ isOpen: false, count: 0 });

  useEffect(() => {
    loadNotifications();
  }, [offset, filter]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getNotifications(20, offset);
      if (response.success) {
        if (offset === 0) {
          setNotifications(response.data.notifications);
        } else {
          setNotifications(prev => [...prev, ...response.data.notifications]);
        }
        setUnreadCount(response.data.unread);
        setTotal(response.data.total);
        setHasMore(response.data.hasMore);
      }
    } catch (error) {
      console.error('Load notifications error:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const response = await notificationService.markAsRead(id);
      if (response.success) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        toast.success('Marked as read');
      }
    } catch (error) {
      console.error('Mark as read error:', error);
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, is_read: true }))
        );
        setUnreadCount(0);
        toast.success(`Marked ${response.data.count} notifications as read`);
      }
    } catch (error) {
      console.error('Mark all as read error:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const openDeleteModal = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, id: null });
  };

  const confirmDelete = async () => {
    try {
      const response = await notificationService.deleteNotification(deleteModal.id);
      if (response.success) {
        setNotifications(prev => prev.filter(n => n.id !== deleteModal.id));
        setTotal(prev => prev - 1);
        toast.success('Notification deleted');
        closeDeleteModal();
      }
    } catch (error) {
      console.error('Delete notification error:', error);
      toast.error('Failed to delete notification');
    }
  };

  const openDeleteAllModal = () => {
    setDeleteAllModal({ isOpen: true, count: notifications.length });
  };

  const closeDeleteAllModal = () => {
    setDeleteAllModal({ isOpen: false, count: 0 });
  };

  const confirmDeleteAll = async () => {
    try {
      const response = await notificationService.deleteAll();
      if (response.success) {
        setNotifications([]);
        setTotal(0);
        setUnreadCount(0);
        toast.success('All notifications deleted');
        closeDeleteAllModal();
      }
    } catch (error) {
      console.error('Delete all error:', error);
      toast.error('Failed to delete notifications');
    }
  };

  const handleLoadMore = () => {
    setOffset(prev => prev + 20);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  const getTypeIcon = (type) => {
    const Icon = TYPE_ICONS[type] || Info;
    return Icon;
  };

  const filters = [
    { id: 'all', label: 'All', count: total },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'read', label: 'Read', count: total - unreadCount },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-amber-50/40 to-orange-50/40 p-4 md:p-6">
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
                        <AlertTriangleIcon className="h-10 w-10 text-red-600" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Notification?</h3>
                    <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
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
                        Delete
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

      {/* Delete All Modal */}
      <AnimatePresence>
        {deleteAllModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeDeleteAllModal}
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
                  onClick={closeDeleteAllModal}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors z-10"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="p-8 pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-full blur-2xl"></div>
                      <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center shadow-lg shadow-red-200/50">
                        <Trash2 className="h-10 w-10 text-red-600" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete All Notifications?</h3>
                    <p className="text-sm text-gray-500 mb-2">You are about to delete all {deleteAllModal.count} notifications.</p>
                    <p className="text-xs text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 mb-6 w-full">
                      This action cannot be undone.
                    </p>
                    <div className="flex gap-3 w-full">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={closeDeleteAllModal}
                        className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(239, 68, 68, 0.3)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={confirmDeleteAll}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-red-500/30"
                      >
                        Delete All
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

      {/* Decorative Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header - Premium Design */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8"
        >
          <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl shadow-black/5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500"></div>
            
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative p-3.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg shadow-amber-500/30">
                    <Bell className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center gap-2">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="px-2.5 py-0.5 text-[10px] font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-lg shadow-amber-500/30 animate-pulse">
                        {unreadCount} new
                      </span>
                    )}
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2 flex-wrap">
                    <BellRing className="h-4 w-4 text-amber-400" />
                    <span>Stay updated with your activities</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-amber-600 font-medium">{total} total</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {unreadCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-xl text-sm font-medium text-gray-600 hover:text-amber-600 hover:border-amber-300 hover:shadow-md transition-all"
                  >
                    <MailOpen className="h-4 w-4" />
                    Mark all read
                  </motion.button>
                )}
                {notifications.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={openDeleteAllModal}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-xl text-sm font-medium text-gray-600 hover:text-red-600 hover:border-red-300 hover:shadow-md transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear all
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filter - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-2 mb-6 bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl border border-white/50 shadow-sm"
        >
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                filter === f.id
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-200'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {f.label}
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                filter === f.id
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {f.count}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Notifications List */}
        {loading && offset === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-4 border-amber-100 border-t-amber-600 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Bell className="h-8 w-8 text-amber-600 animate-pulse" />
              </div>
            </div>
            <p className="mt-6 text-sm font-medium text-gray-500 animate-pulse">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative text-center py-24 bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-3xl"></div>
            <div className="relative">
              <div className="inline-flex p-8 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full mb-6">
                <BellOff className="h-20 w-20 text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">No notifications</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                {filter === 'all'
                  ? "You don't have any notifications yet"
                  : filter === 'unread'
                  ? "You don't have any unread notifications"
                  : "You don't have any read notifications"}
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification, index) => {
              const Icon = getTypeIcon(notification.type);
              const color = TYPE_COLORS[notification.type] || TYPE_COLORS.info;
              const bgColor = TYPE_BG_COLORS[notification.type] || TYPE_BG_COLORS.info;
              const textColor = TYPE_TEXT_COLORS[notification.type] || TYPE_TEXT_COLORS.info;

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`group relative rounded-2xl border p-5 transition-all duration-300 ${
                    notification.is_read
                      ? 'bg-white/80 backdrop-blur-sm border-white/50 hover:shadow-lg'
                      : `${bgColor} shadow-sm hover:shadow-md`
                  }`}
                >
                  {/* Unread indicator */}
                  {!notification.is_read && (
                    <div className="absolute top-3 right-3 w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color} shadow-lg shadow-${color.split(' ')[1]}/20 flex-shrink-0`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold text-sm ${!notification.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                            {notification.title}
                          </h4>
                          <p className={`text-sm mt-1.5 ${!notification.is_read ? 'text-gray-700' : 'text-gray-500'} leading-relaxed`}>
                            {notification.message}
                          </p>
                          {notification.link && (
                            <a
                              href={notification.link}
                              className={`text-xs font-medium mt-2 inline-block transition-all ${
                                !notification.is_read ? 'text-amber-600 hover:text-amber-700' : 'text-gray-400 hover:text-gray-600'
                              }`}
                            >
                              View details →
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className={`text-xs ${!notification.is_read ? 'text-gray-500' : 'text-gray-400'} whitespace-nowrap flex items-center gap-1`}>
                            <Clock className="h-3 w-3" />
                            {formatTime(notification.created_at)}
                          </span>
                          <button
                            onClick={() => openDeleteModal(notification.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                            title="Delete"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {!notification.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="mt-2.5 text-xs font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1.5 transition-all hover:bg-amber-50 px-2 py-1 rounded-lg"
                        >
                          <Check className="h-3 w-3" />
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Load More */}
            {hasMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center pt-4"
              >
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-xl text-sm font-medium text-amber-600 hover:text-amber-700 hover:border-amber-300 hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Load more notifications
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}