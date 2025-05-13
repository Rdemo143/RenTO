import axios from 'axios';

// Use environment variable for API URL if available, otherwise use the render URL
const API_URL = import.meta.env.VITE_API_URL || 'https://rento-fk3u.onrender.com/api'; 

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Auth API Functions ---

// Register a new user
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Login a user
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Get current user profile
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Update user profile
export const updateUserProfile = async (userData) => {
  try {
    const response = await api.put('/auth/me', userData);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Change user password
export const changePassword = async (passwordData) => {
  try {
    const response = await api.put('/auth/me/change-password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Refresh token
export const refreshToken = async () => {
  try {
    const response = await api.post('/auth/refresh-token');
    return response.data;
  } catch (error) {
    console.error('Error refreshing token:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Verify token
export const verifyToken = async () => {
  try {
    const response = await api.get('/auth/verify');
    return response.data;
  } catch (error) {
    console.error('Error verifying token:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// --- Property API Functions ---

// Get all properties
export const getAllProperties = async () => {
  try {
    const response = await api.get('/properties');
    return response.data;
  } catch (error) {
    console.error('Error fetching properties:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Get a single property by ID
export const getPropertyById = async (propertyId) => {
  try {
    const response = await api.get(`/properties/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching property:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Create a new property
export const createProperty = async (propertyData) => {
  try {
    console.log('API createProperty called with:', propertyData);
    
    // Check for authentication token
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required. Please log in to create a property.');
    }
    
    // If propertyData is already FormData, use it directly
    let formDataToSend;
    if (propertyData instanceof FormData) {
      formDataToSend = propertyData;
      console.log('Using provided FormData');
    } else {
      // Create new FormData if object was passed
      formDataToSend = new FormData();
      
      // Add property data to formData
      Object.keys(propertyData).forEach(key => {
        if (key === 'images') {
          // Handle images separately
          if (propertyData.images && propertyData.images.length) {
            propertyData.images.forEach(image => {
              formDataToSend.append('images', image);
            });
          }
        } else if (key === 'features' || key === 'price' || key === 'address' || key === 'amenities') {
          // Handle nested objects
          formDataToSend.append(key, JSON.stringify(propertyData[key]));
        } else {
          formDataToSend.append(key, propertyData[key]);
        }
      });
    }
    
    // Log FormData entries for debugging
    console.log('FormData entries:');
    for (let pair of formDataToSend.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }
    
    // Send the request directly with the token in the Authorization header
    console.log('Sending property creation request');
    const response = await axios.post(`${API_URL}/properties`, formDataToSend, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('Property creation successful:', response.data);
    return response.data;
  } catch (error) {
    // Handle specific error cases
    console.error('Error in createProperty:', error);
    
    if (error.response?.status === 401) {
      console.error('Authentication error creating property:', error.response?.data || error.message);
      localStorage.removeItem('authToken'); // Clear invalid token
      throw new Error('Authentication failed. Please log in again to create a property.');
    } else if (error.response?.status === 403) {
      console.error('Permission error creating property:', error.response?.data || error.message);
      throw new Error('You do not have permission to create properties. Only owners can create properties.');
    } else if (error.response?.status === 400) {
      console.error('Validation error creating property:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Invalid property data. Please check your inputs.');
    } else {
      console.error('Error creating property:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create property. Please try again.');
    }
  }
};

// Update a property
export const updateProperty = async (propertyId, propertyData) => {
  try {
    // Use FormData for handling file uploads
    const formData = new FormData();
    
    // Add property data to formData
    Object.keys(propertyData).forEach(key => {
      if (key === 'images') {
        // Handle images separately
        if (propertyData.images && propertyData.images.length) {
          propertyData.images.forEach(image => {
            if (image instanceof File) {
              formData.append('images', image);
            } else if (typeof image === 'string') {
              // Handle existing image URLs
              formData.append('existingImages', image);
            }
          });
        }
      } else if (key === 'features' || key === 'address' || key === 'price') {
        // Handle nested objects
        formData.append(key, JSON.stringify(propertyData[key]));
      } else {
        formData.append(key, propertyData[key]);
      }
    });
    
    const response = await api.put(`/properties/${propertyId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating property:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Delete a property
export const deleteProperty = async (propertyId) => {
  try {
    const response = await api.delete(`/properties/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting property:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Search properties
export const searchProperties = async (searchParams) => {
  try {
    const queryString = new URLSearchParams(searchParams).toString();
    const response = await api.get(`/properties/search?${queryString}`);
    return response.data;
  } catch (error) {
    console.error('Error searching properties:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// --- Tenant API Functions ---

// Get tenant's currently rented property
export const getTenantProperty = async () => {
  try {
    const response = await api.get('/tenants/property');
    return response.data;
  } catch (error) {
    console.error('Error fetching tenant property:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Get all tenants (for admin/owner)
export const getAllTenants = async () => {
  try {
    const response = await api.get('/tenants');
    return response.data;
  } catch (error) {
    console.error('Error fetching tenants:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Get all tenant applications for a property
export const getTenantApplications = async (propertyId) => {
  try {
    const response = await api.get(`/properties/${propertyId}/applications`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tenant applications:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Update application status (approve/reject)
export const updateApplicationStatus = async (applicationId, status) => {
  try {
    const response = await api.put(`/applications/${applicationId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating application status:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Get tenant by ID
export const getTenantById = async (tenantId) => {
  try {
    const response = await api.get(`/tenants/${tenantId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tenant:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// --- Owner API Functions ---

// Get all owners (for admin)
export const getAllOwners = async () => {
  try {
    const response = await api.get('/owners');
    return response.data;
  } catch (error) {
    console.error('Error fetching owners:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Get owner by ID
export const getOwnerById = async (ownerId) => {
  try {
    const response = await api.get(`/owners/${ownerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching owner:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// --- Payment API Functions ---

// Get all payments for the current user
export const getUserPayments = async () => {
  try {
    const response = await api.get('/payments/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching user payments:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Get all payments for a specific property
export const getPropertyPayments = async (propertyId) => {
  try {
    const response = await api.get(`/payments/property/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching property payments:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Send payment reminder to tenant
export const sendPaymentReminder = async (paymentId) => {
  try {
    const response = await api.post(`/payments/${paymentId}/remind`);
    return response.data;
  } catch (error) {
    console.error('Error sending payment reminder:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Create a new payment
export const createPayment = async (paymentData) => {
  try {
    const response = await api.post('/payments', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error creating payment:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Get payment by ID
export const getPaymentById = async (paymentId) => {
  try {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Update payment status
export const updatePaymentStatus = async (paymentId, statusData) => {
  try {
    const response = await api.put(`/payments/${paymentId}/status`, statusData);
    return response.data;
  } catch (error) {
    console.error('Error updating payment status:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// --- Document API Functions ---

// Get all documents for the current user
export const getUserDocuments = async () => {
  try {
    const response = await api.get('/documents');
    return response.data;
  } catch (error) {
    console.error('Error fetching documents:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Upload a new document
export const uploadDocument = async (documentData) => {
  try {
    const formData = new FormData();
    
    if (documentData.file) {
      formData.append('file', documentData.file);
    }
    
    if (documentData.type) {
      formData.append('type', documentData.type);
    }
    
    if (documentData.propertyId) {
      formData.append('propertyId', documentData.propertyId);
    }
    
    if (documentData.description) {
      formData.append('description', documentData.description);
    }
    
    const response = await api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading document:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Get document by ID
export const getDocumentById = async (documentId) => {
  try {
    const response = await api.get(`/documents/${documentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching document:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Delete document
export const deleteDocument = async (documentId) => {
  try {
    const response = await api.delete(`/documents/${documentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting document:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// --- Maintenance API Functions ---

// Get all maintenance requests for the current user
export const getUserMaintenanceRequests = async () => {
  try {
    const response = await api.get('/maintenance');
    return response.data;
  } catch (error) {
    console.error('Error fetching maintenance requests:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Create a new maintenance request
export const createMaintenanceRequest = async (requestData) => {
  try {
    const formData = new FormData();
    
    Object.keys(requestData).forEach(key => {
      if (key === 'images') {
        if (requestData.images && requestData.images.length) {
          requestData.images.forEach(image => {
            formData.append('images', image);
          });
        }
      } else {
        formData.append(key, requestData[key]);
      }
    });
    
    const response = await api.post('/maintenance', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating maintenance request:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Get maintenance request by ID
export const getMaintenanceRequestById = async (requestId) => {
  try {
    const response = await api.get(`/maintenance/${requestId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching maintenance request:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Update maintenance request status
export const updateMaintenanceStatus = async (requestId, statusData) => {
  try {
    const response = await api.put(`/maintenance/${requestId}/status`, statusData);
    return response.data;
  } catch (error) {
    console.error('Error updating maintenance status:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// --- Stats API Functions ---

// Get dashboard stats for the current user
export const getDashboardStats = async () => {
  try {
    // Check for authentication token
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required. Please log in to view dashboard stats.');
    }
    
    // First try to get from the dedicated endpoint
    try {
      const response = await api.get('/stats/dashboard');
      return response.data;
    } catch (endpointError) {
      console.log('Dashboard stats endpoint not available, using fallback calculation');
      // Fallback: If the endpoint doesn't exist, we'll calculate stats ourselves
    }
    
    // Get the current user first to ensure we have valid authentication
    let user;
    try {
      const userResponse = await api.get('/auth/me');
      user = userResponse.data;
      
      if (!user || !user._id) {
        throw new Error('Could not verify user identity');
      }
    } catch (userError) {
      console.error('Error fetching current user:', userError);
      // Return default empty stats if we can't get the user
      return {
        totalProperties: 0,
        rentedProperties: 0,
        availableProperties: 0,
        totalRevenue: 0
      };
    }
    
    // Fetch all properties
    try {
      const propertiesResponse = await api.get('/properties');
      const properties = propertiesResponse.data;
      
      // Filter properties owned by the current user - with additional safety checks
      const userProperties = properties.filter(p => 
        p.owner && p.owner._id && p.owner._id === user._id
      );
      
      // Calculate stats
      const stats = {
        totalProperties: userProperties.length,
        rentedProperties: userProperties.filter(p => p.status === 'rented').length,
        availableProperties: userProperties.filter(p => p.status === 'available').length,
        totalRevenue: userProperties
          .filter(p => p.status === 'rented')
          .reduce((sum, p) => sum + (parseInt(p.price?.amount) || 0), 0)
      };
      
      return stats;
    } catch (propError) {
      console.error('Error fetching properties for stats:', propError);
      // Return default empty stats if we can't get properties
      return {
        totalProperties: 0,
        rentedProperties: 0,
        availableProperties: 0,
        totalRevenue: 0
      };
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error.response?.data || error.message);
    // Return default stats instead of throwing to prevent dashboard from breaking
    return {
      totalProperties: 0,
      rentedProperties: 0,
      availableProperties: 0,
      totalRevenue: 0,
      error: error.message || 'Failed to load dashboard statistics'
    };
  }
};

// --- Chat API Functions ---

// Get or create a conversation with a recipient, optionally linked to a property
export const getOrCreateConversation = async (recipientId, propertyId = null) => {
  try {
    const response = await api.post('/chat/conversations', { recipientId, propertyId });
    return response.data;
  } catch (error) {
    console.error('Error getting or creating conversation:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Get all conversations for the logged-in user
export const getUserConversations = async () => {
  try {
    const response = await api.get('/chat/conversations');
    return response.data;
  } catch (error) {
    console.error('Error fetching user conversations:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Get all messages for a specific conversation
export const getMessagesForConversation = async (conversationId) => {
  try {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages for conversation:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Send a message within a conversation
export const sendMessage = async (conversationId, content, attachments = []) => {
  try {
    console.log('Sending message to conversation:', conversationId, 'content:', content);
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required. Please log in to send messages.');
    }
    
    const response = await api.post('/chat/send', { 
      conversationId, 
      content, 
      attachments: attachments || [] 
    });
    console.log('Message sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (messageIds) => {
  try {
    const response = await api.put('/chat/read', { messageIds });
    return response.data;
  } catch (error) {
    console.error('Error marking messages as read:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Delete messages (marks as deleted for the current user)
export const deleteMessages = async (messageIds) => {
  try {
    // Note: The backend uses DELETE http method semantic, but the route expects data in the body
    // Axios DELETE method might need configuration to send body, or backend could use PUT/POST
    const response = await api.delete('/chat/delete', { data: { messageIds } });
    return response.data;
  } catch (error) {
    console.error('Error deleting messages:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Get the total unread message count for the user
export const getUnreadCount = async () => {
  try {
    // Check for authentication token
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { count: 0 }; // Return 0 if not authenticated
    }
    
    const response = await api.get('/chat/unread');
    return response.data;
  } catch (error) {
    console.error('Error fetching unread count:', error.response?.data || error.message);
    // Return 0 instead of throwing to prevent dashboard from breaking
    return { count: 0 };
  }
};

// Update user's FCM token
export const updateFCMToken = async (fcmToken) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await api.post('/users/fcm-token', { fcmToken });
    return response.data;
  } catch (error) {
    console.error('Error updating FCM token:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export default api;
