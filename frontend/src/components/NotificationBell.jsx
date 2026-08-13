import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  BellOff,
  X,
  Info,
  AlertCircle,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const TYPE_ICONS = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

const TYPE_COLORS = {
  info: 'text-blue-500 dark:text-blue-400',
  success: 'text-green-500 dark:text-green-400',
  warning: 'text-yellow-500 dark:text-yellow-400',
  error: 'text-red-500 dark:text-red-400',
};

const TYPE_BG = {
  info: 'bg-blue-50 dark:bg-blue-950/50',
  success: 'bg-green-50 dark:bg-green-950/50',
  warning: 'bg-yellow-50 dark:bg-yellow-950/50',
  error: 'bg-red-50 dark:bg-red-950/50',
};

export default function NotificationBell() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadUnread();
    const interval = setInterval(loadUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadUnread = async () => {
    try {
      const response = await notificationService.getUnread();
      if (response.success) {
        setNotifications(response.data);
        setUnreadCount(response.data.length);
      }
    } catch (error) {
      console.error('Load unread notifications error:', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Mark as read error:', error);
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications([]);
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Mark all as read error:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate('/notifications');
  };

  const getIcon = (type) => {
    const Icon = TYPE_ICONS[type] || Info;
    return Icon;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-all tap-target ${
          isDark 
            ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' 
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
        }`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 dark:bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-xl border overflow-hidden z-50 transition-colors duration-300 ${
              isDark 
                ? 'bg-gray-900 border-gray-800 shadow-gray-950' 
                : 'bg-white border-gray-200'
            }`}
          >
            <div className={`flex items-center justify-between p-3 border-b ${
              isDark ? 'border-gray-800' : 'border-gray-100'
            }`}>
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                <span className={`font-semibold text-sm ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-full text-[10px] font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className={`text-xs transition-colors px-2 py-1 rounded ${
                      isDark 
                        ? 'text-gray-400 hover:text-amber-400 hover:bg-gray-800' 
                        : 'text-gray-400 hover:text-amber-600 hover:bg-gray-100'
                    }`}
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-1 rounded-lg transition-colors ${
                    isDark 
                      ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500 dark:border-amber-400" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <BellOff className={`h-8 w-8 mx-auto mb-2 ${
                  isDark ? 'text-gray-600' : 'text-gray-300'
                }`} />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No new notifications</p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>You're all caught up!</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {notifications.slice(0, 10).map((notification) => {
                  const Icon = getIcon(notification.type);
                  const color = TYPE_COLORS[notification.type] || TYPE_COLORS.info;
                  const bg = TYPE_BG[notification.type] || TYPE_BG.info;
                  return (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 p-3 transition-colors border-b last:border-0 ${
                        isDark 
                          ? 'hover:bg-gray-800/50 border-gray-800/50' 
                          : 'hover:bg-gray-50 border-gray-50'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${bg} ${color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </p>
                        <p className={`text-xs truncate ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] ${
                            isDark ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            {formatTime(notification.created_at)}
                          </span>
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-[10px] text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 font-medium"
                          >
                            Mark read
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className={`border-t p-2 ${
              isDark ? 'border-gray-800' : 'border-gray-100'
            }`}>
              <button
                onClick={handleViewAll}
                className={`w-full text-center text-xs font-medium py-1.5 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-950/30' 
                    : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
                }`}
              >
                View all notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}