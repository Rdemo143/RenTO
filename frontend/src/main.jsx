import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap-icons/font/bootstrap-icons.css'; 
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext';
import { initializeServiceWorker } from './utils/serviceWorkerRegistration';

// Wrapper component to handle service worker initialization
const AppWithServiceWorker = () => {
  const [swInitialized, setSwInitialized] = useState(false);

  useEffect(() => {
    // Initialize the service worker
    initializeServiceWorker()
      .then(registration => {
        const status = registration ? 'success' : 'failed';
        console.log(`Service worker initialized: ${status}`);
        // Even if registration fails, we should still show the app
        setSwInitialized(true);
      })
      .catch(error => {
        console.error('Error during service worker initialization:', error);
        // Don't block app rendering on service worker error
        setSwInitialized(true);
      });
  }, []);

  // Show the app regardless of service worker status after a timeout
  // This prevents indefinitely waiting for service worker in case of issues
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!swInitialized) {
        console.warn('Service worker initialization timed out, showing app anyway');
        setSwInitialized(true);
      }
    }, 2000); // 2 second timeout

    return () => clearTimeout(timeout);
  }, [swInitialized]);

  // Render app once initialized or on timeout
  return swInitialized ? (
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  ) : (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <p>Initializing application...</p>
    </div>
  );
};

createRoot(document.getElementById('root')).render(<AppWithServiceWorker />);
