import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  MessageCircle,
  Search,
  BarChart3,
  Bell,
  Calendar,
  GraduationCap
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';

const bottomNavItems = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Subjects', href: '/subjects', icon: BookOpen },
  { name: 'Chat', href: '/chat', icon: MessageCircle },
  { name: 'RAG', href: '/rag', icon: Search },
  { name: 'Quiz', href: '/quiz', icon: BarChart3 },
];

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (href) => {
    if (href === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(href) && href !== '/';
  };

  if (['/login', '/register'].includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-custom safe-bottom z-40 shadow-lg bg-secondary transition-colors duration-300">
      <div className="flex items-center justify-around px-1 py-1">
        {bottomNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.href)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all tap-target min-w-[48px] ${
                active
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <item.icon className={`h-5 w-5 ${active ? 'fill-blue-50 dark:fill-blue-950/30' : ''}`} />
              <span className={`text-[10px] font-medium ${
                active 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-muted'
              }`}>
                {item.name}
              </span>
              {active && (
                <div className="w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
        
        <button
          onClick={() => navigate('/timetable')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all tap-target min-w-[48px] ${
            location.pathname === '/timetable'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-secondary hover:text-primary'
          }`}
        >
          <Calendar className="h-5 w-5" />
          <span className="text-[10px] font-medium">Schedule</span>
        </button>

        <button
          onClick={() => navigate('/notifications')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all tap-target min-w-[48px] ${
            location.pathname === '/notifications'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-secondary hover:text-primary'
          }`}
        >
          <Bell className="h-5 w-5" />
          <span className="text-[10px] font-medium">Alerts</span>
        </button>

        <div className="px-1">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}