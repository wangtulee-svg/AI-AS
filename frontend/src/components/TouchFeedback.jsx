import { motion } from 'framer-motion';

export function TouchFeedback({ children, onClick, className = '', ...props }) {
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
      className={`cursor-pointer ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
}