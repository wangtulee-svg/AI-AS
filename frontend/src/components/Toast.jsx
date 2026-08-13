// frontend/src/components/Toast.jsx
// ໃຊ້ react-hot-toast ທີ່ມີແລ້ວ ແຕ່ເພີ່ມ Custom Styles

import toast from 'react-hot-toast';

export const showToast = {
  success: (message) => toast.success(message, {
    style: {
      background: '#10B981',
      color: '#fff',
    },
    icon: '✅',
    duration: 4000,
  }),
  error: (message) => toast.error(message, {
    style: {
      background: '#EF4444',
      color: '#fff',
    },
    icon: '❌',
    duration: 5000,
  }),
  info: (message) => toast(message, {
    style: {
      background: '#3B82F6',
      color: '#fff',
    },
    icon: 'ℹ️',
    duration: 3000,
  }),
  warning: (message) => toast(message, {
    style: {
      background: '#F59E0B',
      color: '#fff',
    },
    icon: '⚠️',
    duration: 4000,
  }),
};