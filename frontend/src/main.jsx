import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'  // ຕ້ອງມີເສັ້ນນີ້!

// Register service worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/serviceWorker.js')
    .then(() => console.log('Service Worker registered'))
    .catch(() => console.log('Service Worker registration failed'));
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)