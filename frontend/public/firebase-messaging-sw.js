// Firebase Cloud Messaging Service Worker

// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/9.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.10.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
firebase.initializeApp({
  apiKey: "AIzaSyCobTSqmhti2UiNU6-qGuMX5ENoblHHsVM",
  authDomain: "rento-906b0.firebaseapp.com",
  databaseURL: "https://rento-906b0-default-rtdb.firebaseio.com",
  projectId: "rento-906b0",
  storageBucket: "rento-906b0.firebasestorage.app",
  messagingSenderId: "98581445454",
  appId: "1:98581445454:web:e46cda10236816b73b3c1f",
  measurementId: "G-Y3BX6F96QR"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

// Log when service worker is installed, activated and receives message
self.addEventListener('install', (event) => {
  console.log('Firebase messaging service worker installed');
  // Activate worker immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Firebase messaging service worker activated');
  // Claim clients immediately
  event.waitUntil(clients.claim());
});

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png',
    data: payload.data
  };
  
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click ', event);
  event.notification.close();
  
  // Handle click based on data
  const data = event.notification.data;
  let url = '/';
  
  if (data) {
    if (data.type === 'chat' && data.conversationId) {
      url = `/messages?conversationId=${data.conversationId}`;
    } else if (data.type === 'maintenance' && data.requestId) {
      url = `/maintenance/${data.requestId}`;
    } else if (data.type === 'payment' && data.paymentId) {
      url = `/payments/${data.paymentId}`;
    } else if (data.type === 'property' && data.propertyId) {
      url = `/properties/${data.propertyId}`;
    } else {
      url = '/dashboard';
    }
  }
  
  // Open or focus on the relevant URL
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window/tab is open with the URL, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
