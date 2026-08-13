import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg transition-all duration-200 tap-target hover:bg-gray-100 dark:hover:bg-gray-800"
      whileTap={{ scale: 0.9 }}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-center"
      >
        {isDark ? (
          <Moon className="h-5 w-5 text-yellow-400 transition-colors duration-200" />
        ) : (
          <Sun className="h-5 w-5 text-yellow-500 transition-colors duration-200" />
        )}
      </motion.div>
      
      {/* ເສັ້ນຂອບສີສຳລັບ indicator */}
      <motion.div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
        initial={false}
        animate={{
          backgroundColor: isDark ? '#fbbf24' : '#f59e0b',
          opacity: isDark ? 1 : 0.5,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
}