import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spinner, Container, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function ProtectedRoute({ element, allowedRoles }) {
  const { user, loading: loadingAuth } = useAuth();
  const location = useLocation();

  if (loadingAuth) {
    // Display a loading spinner while authentication status is being determined
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (!user) {
    // User not logged in, redirect to login page
    // Pass the current location so that after login, user can be redirected back
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // User is logged in, but does not have the required role
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <h4>Access Denied</h4>
          <p>You do not have permission to view this page.</p>
          <Link to={user.role === 'owner' ? '/owner/dashboard' : user.role === 'tenant' ? '/tenant/dashboard' : '/'} className="btn btn-link">Go to Dashboard</Link>
        </Alert>
      </Container>
    );
  }

  // User is authenticated and has the required role (or no specific roles are required)
  return element;
}

export default ProtectedRoute;
