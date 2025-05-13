import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/'); // Redirect to home page or dashboard after login
    } catch (err) {
      setError(err.message || 'Failed to login. Please check your credentials.');
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
          <Col xs={12} sm={10} md={8} lg={5}>
            <Card className="shadow border-0">
              <Card.Body className="p-4 p-md-5">
                <h2 className="text-center mb-4 fw-bold text-primary">Welcome Back</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
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
                  <Form.Group id="password" className="mb-4">
                    <Form.Label className="fw-semibold">Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="py-2"
                      placeholder="Enter your password"
                    />
                  </Form.Group>
                  <Button 
                    disabled={loading} 
                    className="w-100 py-2 fw-semibold" 
                    type="submit"
                    size="lg"
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </Form>
                <div className="w-100 text-center mt-4">
                  Need an account? <Link to="/register" className="text-primary fw-semibold">Register</Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default LoginPage;
