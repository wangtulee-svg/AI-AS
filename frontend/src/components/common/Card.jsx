import { motion } from 'framer-motion';

export const Card = ({ 
  children, 
  className = '',
  hover = false,
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-white rounded-xl shadow-sm border border-gray-100 p-6
        ${hover ? 'transition-all duration-300 hover:shadow-md hover:-translate-y-1' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};