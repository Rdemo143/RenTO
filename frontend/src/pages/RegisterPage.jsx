import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Form, Button, Container, Row, Col, Card, Alert, FormCheck } from 'react-bootstrap';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('tenant'); // Default role
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await register({ name, email, password, role });
      setMessage('Registration successful! Please login.');
      // navigate('/login'); // Or redirect to login page
      // Or automatically log in the user if your backend returns a token on register
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    }
    setLoading(false);
  };

  const pageStyle = {
    backgroundImage: `linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)`,
    minHeight: '90vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 0'
  };

  return (
    <div style={pageStyle}>
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6}>
            <Card className="shadow border-0">
              <Card.Body className="p-4 p-md-5">
                <h2 className="text-center mb-4 fw-bold text-primary">Create Account</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                {message && <Alert variant="success">{message}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group id="name" className="mb-3">
                    <Form.Label className="fw-semibold">Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="py-2"
                      placeholder="Enter your full name"
                    />
                  </Form.Group>

                  <Form.Group id="email" className="mb-3">
                    <Form.Label className="fw-semibold">Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="py-2"
                      placeholder="Enter your email"
                    />
                  </Form.Group>

                  <Form.Group id="password" className="mb-3">
                    <Form.Label className="fw-semibold">Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="py-2"
                      placeholder="Create a password"
                    />
                  </Form.Group>

                  <Form.Group id="confirmPassword" className="mb-3">
                    <Form.Label className="fw-semibold">Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="py-2"
                      placeholder="Confirm your password"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Register as:</Form.Label>
                    <div className="d-flex gap-4">
                      <FormCheck
                        inline
                        label="Tenant"
                        name="role"
                        type="radio"
                        id="role-tenant"
                        value="tenant"
                        checked={role === 'tenant'}
                        onChange={(e) => setRole(e.target.value)}
                        className="fs-5"
                      />
                      <FormCheck
                        inline
                        label="Owner"
                        name="role"
                        type="radio"
                        id="role-owner"
                        value="owner"
                        checked={role === 'owner'}
                        onChange={(e) => setRole(e.target.value)}
                        className="fs-5"
                      />
                    </div>
                  </Form.Group>

                  <Button 
                    disabled={loading} 
                    className="w-100 py-2 fw-semibold" 
                    type="submit"
                    size="lg"
                  >
                    {loading ? 'Registering...' : 'Register'}
                  </Button>
                </Form>
                <div className="w-100 text-center mt-4">
                  Already have an account? <Link to="/login" className="text-primary fw-semibold">Login</Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default RegisterPage;
