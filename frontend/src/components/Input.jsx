import { forwardRef } from 'react';
import { motion } from 'framer-motion';

export const Input = forwardRef(({ 
  label, 
  error, 
  icon: Icon,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full ${Icon ? 'pl-10' : 'px-4'} py-2.5 
            bg-white border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200
            ${error ? 'border-red-500 focus:ring-red-500' : 'hover:border-gray-400'}
            ${className}
          `}
          {...props}
        />
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 mt-1"
          >
            {error}
          </motion.p>
        )}
      </div>
    </div>
  );
});