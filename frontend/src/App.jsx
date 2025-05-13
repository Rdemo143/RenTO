import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import NotFoundPage from './pages/NotFoundPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/Layout';

// Owner Pages
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import CreatePropertyPage from './pages/CreatePropertyPage';
import SimplePropertyForm from './pages/SimplePropertyForm';
import EditPropertyPage from './pages/EditPropertyPage';
import ManagePropertiesPage from './pages/ManagePropertiesPage';

// Tenant Pages
import TenantDashboardPage from './pages/TenantDashboardPage';
import TenantPropertyDetailsPage from './pages/TenantPropertyDetailsPage';
import MaintenanceRequestsPage from './pages/MaintenanceRequestsPage';

// Shared Protected Pages
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import NotificationsPage from './pages/NotificationsPage';
import PaymentsPage from './pages/PaymentsPage';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Layout>
              <div className="container-fluid mt-3 px-md-5">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/properties" element={<PropertiesPage />} />
                  <Route path="/properties/:id" element={<PropertyDetailsPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/faq" element={<FAQPage />} />

                  {/* Shared Protected Routes */}
                  <Route 
                    path="/profile" 
                    element={<ProtectedRoute element={<ProfilePage />} />}
                  />
                  <Route 
                    path="/chat" 
                    element={<ProtectedRoute element={<ChatPage />} />}
                  />
                  <Route 
                    path="/notifications" 
                    element={<ProtectedRoute element={<NotificationsPage />} />}
                  />
                  <Route 
                    path="/payments" 
                    element={<ProtectedRoute element={<PaymentsPage />} />}
                  />

                  {/* Owner Protected Routes */}
                  <Route 
                    path="/owner/dashboard" 
                    element={<ProtectedRoute element={<OwnerDashboardPage />} allowedRoles={['owner']} />} 
                  />
                  <Route 
                    path="/owner/properties/new" 
                    element={<ProtectedRoute element={<CreatePropertyPage />} allowedRoles={['owner']} />} 
                  />
                  <Route 
                    path="/owner/properties/simple-new" 
                    element={<ProtectedRoute element={<SimplePropertyForm />} allowedRoles={['owner']} />} 
                  />
                  <Route 
                    path="/owner/edit-property/:id" 
                    element={<ProtectedRoute element={<EditPropertyPage />} allowedRoles={['owner']} />} 
                  />
                  <Route 
                    path="/owner/properties/manage" 
                    element={<ProtectedRoute element={<ManagePropertiesPage />} allowedRoles={['owner']} />} 
                  />
                  
                  {/* Tenant Protected Routes */}
                  <Route 
                    path="/tenant/dashboard" 
                    element={<ProtectedRoute element={<TenantDashboardPage />} allowedRoles={['tenant']} />} 
                  />
                  <Route 
                    path="/my-property/details" 
                    element={<ProtectedRoute element={<TenantPropertyDetailsPage />} allowedRoles={['tenant']} />} 
                  />
                  <Route 
                    path="/maintenance-requests" 
                    element={<ProtectedRoute element={<MaintenanceRequestsPage />} allowedRoles={['tenant', 'owner']} />} 
                  />
                  <Route 
                    path="/messages" 
                    element={<ProtectedRoute element={<ChatPage />} />} 
                  />

                  {/* Not Found Route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </div>
            </Layout>
          </main>
          <Footer />
        </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
