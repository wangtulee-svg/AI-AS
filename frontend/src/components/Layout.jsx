import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Home,
  BookOpen,
  FileText,
  MessageCircle,
  Calendar,
  LogOut,
  Menu,
  X,
  Sparkles,
  FolderOpen,
  Search,
  BarChart3,
  Shield,
  Users,
  GraduationCap,
  Bell
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Subjects', href: '/subjects', icon: BookOpen },
  { name: 'Documents', href: '/documents', icon: FolderOpen },
  { name: 'Chat', href: '/chat', icon: MessageCircle },
  { name: 'RAG', href: '/rag', icon: Search },
  { name: 'Quiz', href: '/quiz', icon: BarChart3 },
  { name: 'Timetable', href: '/timetable', icon: Calendar },
  { name: 'Study Planner', href: '/study-planner', icon: GraduationCap },
  { name: 'Notifications', href: '/notifications', icon: Bell },
];

const adminNavigation = [
  { name: 'Admin Dashboard', href: '/admin', icon: Shield },
  { name: 'User Management', href: '/admin/users', icon: Users },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  const isActive = (href) => {
    const currentPath = location.pathname;
    if (href === '/dashboard') return currentPath === '/dashboard';
    if (href === '/admin') return currentPath === '/admin';
    return currentPath.startsWith(href) && href !== '/';
  };

  return (
    <div className="min-h-screen bg-primary transition-colors duration-300">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-secondary">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent 
            user={user} 
            navigation={navigation} 
            adminNavigation={isAdmin ? adminNavigation : []}
            handleLogout={handleLogout}
            currentPath={location.pathname}
            isActive={isActive}
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0">
        <SidebarContent 
          user={user} 
          navigation={navigation} 
          adminNavigation={isAdmin ? adminNavigation : []}
          handleLogout={handleLogout}
          currentPath={location.pathname}
          isActive={isActive}
        />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header - ໃຊ້ bg-white ທີ່ບໍ່ໂປ່ງໃສ */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 transition-colors duration-300 safe-top shadow-sm">
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg transition-colors tap-target text-gray-500 hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-sm font-semibold text-gray-900 lg:hidden">AI Assistant</h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <ThemeToggle />
              <NotificationBell />
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg transition-all duration-200 tap-target text-gray-400 hover:text-red-500 hover:bg-red-50"
                title="Logout"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ user, navigation, adminNavigation, handleLogout, currentPath, isActive }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white transition-colors duration-300">
      <div className="flex-1 flex flex-col pt-4 pb-3 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">AI Assistant</h1>
              <p className="text-[10px] text-gray-500">University Edition</p>
            </div>
          </div>
        </div>

        <nav className="mt-2 flex-1 px-3 space-y-0.5">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <a
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className={`mr-3 h-4 w-4 ${
                  active 
                    ? 'text-white' 
                    : 'text-gray-400 group-hover:text-gray-700'
                }`} />
                {item.name}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </a>
            );
          })}
        </nav>

        {adminNavigation.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="px-3 text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">
              Admin
            </p>
            <nav className="px-3 space-y-0.5">
              {adminNavigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/20'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-purple-600'
                    }`}
                  >
                    <item.icon className={`mr-3 h-4 w-4 ${
                      active 
                        ? 'text-white' 
                        : 'text-gray-400 group-hover:text-purple-600'
                    }`} />
                    {item.name}
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </a>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 flex border-t border-gray-200 p-3 bg-gray-50">
        <div className="flex-shrink-0 group block w-full">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-700 truncate">
                {user?.full_name || 'User'}
              </p>
              <p className="text-[10px] text-gray-500 capitalize">
                {user?.role || 'Student'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg transition-all duration-200 text-gray-400 hover:text-red-500 hover:bg-red-50"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}