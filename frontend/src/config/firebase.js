// Firebase configuration for the frontend
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCobTSqmhti2UiNU6-qGuMX5ENoblHHsVM",
  authDomain: "rento-906b0.firebaseapp.com",
  databaseURL: "https://rento-906b0-default-rtdb.firebaseio.com",
  projectId: "rento-906b0",
  storageBucket: "rento-906b0.firebasestorage.app",
  messagingSenderId: "98581445454",
  appId: "1:98581445454:web:e46cda10236816b73b3c1f",
  measurementId: "G-Y3BX6F96QR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize messaging conditionally
let messaging = null;

// Check if messaging is supported in this browser
const initializeMessaging = async () => {
  try {
    if (await isSupported()) {
      messaging = getMessaging(app);
      console.log('Firebase messaging is supported and initialized');
      return true;
    } else {
      console.log('Firebase messaging is not supported in this browser');
      return false;
    }
  } catch (error) {
    console.error('Error checking messaging support:', error);
    return false;
  }
};

// Request permission and get token
export const requestNotificationPermission = async () => {
  try {
    // Check if the browser supports service workers and messaging
    if (!('serviceWorker' in navigator)) {
      console.log('Service workers are not supported in this browser');
      return null;
    }
    
    // Initialize messaging if not already done
    const isMessagingSupported = await initializeMessaging();
    if (!isMessagingSupported || !messaging) {
      console.log('Firebase messaging is not available');
      return null;
    }
    
    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      return getTokenAndSave();
    } else {
      console.log('Unable to get permission to notify.');
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

// Get token and save it
export const getTokenAndSave = async () => {
  if (!messaging) {
    console.log('Messaging not initialized');
    return null;
  }
  
  try {
    // Make sure service worker is registered
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      console.log('No service worker registration found');
      return null;
    }
    
    // Your VAPID key from Firebase Console
    // Get this from Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
    const vapidKey = 'BGgSKhcBmZnbG9QaRNJ7nKdRr6avL1mIlH0l8wD_HNLVRqmb2_Y1SFCIZBpQqG3UhUx8Q4P8GoCU5NyZv3Dsr5M';
    
    // Get FCM token
    const currentToken = await getToken(messaging, {
      vapidKey: vapidKey,
      serviceWorkerRegistration: registration
    });

    if (currentToken) {
      console.log('FCM Token:', currentToken);
      
      // Save the token to your backend
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await fetch('https://rento-fk3u.onrender.com/api/users/fcm-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ fcmToken: currentToken })
          });
          
          if (!response.ok) {
            console.log('Failed to save FCM token to backend:', await response.text());
          } else {
            console.log('FCM token saved to backend successfully');
          }
        }
      } catch (backendError) {
        console.error('Error saving FCM token to backend:', backendError);
      }
      
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

// Handle foreground messages
export const onMessageListener = () => {
  if (!messaging) return Promise.resolve(null);
  
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
      resolve(payload);
    });
  });
};

export default app;
