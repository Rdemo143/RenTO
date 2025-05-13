import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api'; // Assuming you have an API service configured

function ProfilePage() {
  const { user, setUser, loadingAuth } = useAuth(); // Assuming setUser updates context and local storage
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    // Add other relevant profile fields here, e.g., phone, preferences
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        // Initialize other fields from user object
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      // Assuming an endpoint like /api/users/profile or /api/auth/me/update
      const response = await api.put('/users/me', { name: formData.name, email: formData.email }); 
      setUser(response.data.user); // Update user in AuthContext
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (!newPassword || newPassword.length < 6) { // Basic validation
        setPasswordError('New password must be at least 6 characters long.');
        return;
    }

    setLoading(true);
    try {
      // Assuming an endpoint like /api/users/change-password or /api/auth/me/change-password
      await api.put('/users/me/change-password', { currentPassword, newPassword });
      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password. Check current password.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loadingAuth && !user) {
    return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
  }

  if (!user) {
    // Should be handled by ProtectedRoute, but as a fallback
    return <Navigate to="/login" replace />;
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col md={{ span: 8, offset: 2 }}>
          <h2>My Profile</h2>
          <Card className="shadow-sm mb-4">
            <Card.Header>Account Information</Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              <Form onSubmit={handleProfileUpdate}>
                <Form.Group className="mb-3" controlId="profileName">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="profileEmail">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                    // Consider making email read-only or having a separate verification process if changed
                  />
                </Form.Group>
                {/* Add other profile fields here */}
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading && <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />} Update Profile
                </Button>
              </Form>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Header>Change Password</Card.Header>
            <Card.Body>
              {passwordError && <Alert variant="danger">{passwordError}</Alert>}
              {passwordSuccess && <Alert variant="success">{passwordSuccess}</Alert>}
              <Form onSubmit={handleChangePassword}>
                <Form.Group className="mb-3" controlId="currentPassword">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    required 
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="newPassword">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    required 
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="confirmNewPassword">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={confirmNewPassword} 
                    onChange={(e) => setConfirmNewPassword(e.target.value)} 
                    required 
                  />
                </Form.Group>
                <Button variant="warning" type="submit" disabled={loading}>
                  {loading && <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />} Change Password
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ProfilePage;
