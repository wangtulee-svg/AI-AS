// frontend/src/utils/offline.js

export const checkOnlineStatus = () => {
  return navigator.onLine;
};

export const showOfflineWarning = () => {
  if (!navigator.onLine) {
    toast.error('You are offline. Some features may not work.');
  }
};

// ໃຊ້ໃນ App.jsx
useEffect(() => {
  const handleOffline = () => {
    toast.error('You are offline. Please check your internet connection.');
  };
  
  const handleOnline = () => {
    toast.success('Back online!');
  };

  window.addEventListener('offline', handleOffline);
  window.addEventListener('online', handleOnline);

  return () => {
    window.removeEventListener('offline', handleOffline);
    window.removeEventListener('online', handleOnline);
  };
}, []);