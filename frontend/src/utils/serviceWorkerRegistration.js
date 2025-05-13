// Service Worker Registration utility

// Register the service worker for Firebase Cloud Messaging
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Don't unregister existing service workers as that can cause issues
      // Just check if we have a service worker for the correct scope
      const existingRegistration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
      
      if (existingRegistration) {
        console.log('Existing Firebase Messaging service worker found:', existingRegistration.scope);
        return existingRegistration;
      }
      
      // Register the Firebase Messaging service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      });
      
      console.log('Firebase Messaging service worker registered:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Error registering service worker:', error);
      return null;
    }
  } else {
    console.log('Service workers are not supported in this browser');
    return null;
  }
};

// Check if service worker is already registered
export const getServiceWorkerRegistration = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('Found service worker registrations:', registrations.length);
      
      // First try to find the specific Firebase messaging service worker
      const fbRegistration = registrations.find(reg => 
        reg.scope.includes(window.location.origin) && 
        reg.active && 
        reg.active.scriptURL.includes('firebase-messaging-sw.js')
      );
      
      if (fbRegistration) {
        console.log('Found Firebase messaging service worker');
        return fbRegistration;
      }
      
      // If no specific Firebase SW found, return any registration with root scope
      const rootRegistration = registrations.find(reg => 
        reg.scope === `${window.location.origin}/`
      );
      
      if (rootRegistration) {
        console.log('Found root scope service worker');
        return rootRegistration;
      }
      
      return null;
    } catch (error) {
      console.error('Error checking service worker registration:', error);
      return null;
    }
  }
  return null;
};

// Call this function when the app starts
export const initializeServiceWorker = async () => {
  try {
    // Try to get existing registration first
    const registration = await getServiceWorkerRegistration();
    
    if (!registration) {
      console.log('No service worker registered, registering now...');
      // Register the service worker and wait for it to activate
      const newRegistration = await registerServiceWorker();
      
      // Wait for the service worker to be activated if it's waiting or installing
      if (newRegistration && (newRegistration.waiting || newRegistration.installing)) {
        console.log('Waiting for service worker to activate...');
        await new Promise(resolve => {
          // Set up an event listener for state changes
          const serviceWorker = newRegistration.installing || newRegistration.waiting;
          serviceWorker.addEventListener('statechange', event => {
            if (event.target.state === 'activated') {
              console.log('Service worker activated');
              resolve();
            }
          });
          
          // If already activated, resolve immediately
          if (serviceWorker.state === 'activated') {
            console.log('Service worker already activated');
            resolve();
          }
        });
      }
      
      return newRegistration;
    } else {
      console.log('Service worker already registered at scope:', registration.scope);
      return registration;
    }
  } catch (error) {
    console.error('Error initializing service worker:', error);
    return null;
  }
}; 