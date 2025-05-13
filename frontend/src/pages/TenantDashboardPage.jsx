import React from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function TenantDashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'tenant') {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          Access Denied. This page is for tenants only.
          Go back to <Link to="/">Homepage</Link>.
        </Alert>
      </Container>
    );
  }

  // Placeholder content for Tenant Dashboard
  return (
    <Container className="mt-4">
      <Row className="mb-3">
        <Col>
          <h2>Tenant Dashboard</h2>
          <p>Welcome, {user.name}!</p>
        </Col>
      </Row>
      <Row>
        <Col md={6} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title><i className="bi bi-building me-2"></i>My Rented Property</Card.Title>
              <Card.Text>
                View details of your current rented property, lease agreement, and payment history.
                {/* TODO: Link to actual property details if rented */}
              </Card.Text>
              <Link to="/my-property/details" className="btn btn-primary">View Property Details</Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title><i className="bi bi-chat-dots me-2"></i>Messages</Card.Title>
              <Card.Text>
                Communicate with your property owner or manager.
                {/* TODO: Link to messages page */}
              </Card.Text>
              <Link to="/messages" className="btn btn-primary">View Messages</Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col md={6} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title><i className="bi bi-tools me-2"></i>Maintenance Requests</Card.Title>
              <Card.Text>
                Submit and track maintenance requests for your property.
                {/* TODO: Link to maintenance page */}
              </Card.Text>
              <Link to="/maintenance-requests" className="btn btn-info">Manage Requests</Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title><i className="bi bi-person-circle me-2"></i>My Profile</Card.Title>
              <Card.Text>
                View and update your personal information and preferences.
              </Card.Text>
              <Link to="/profile" className="btn btn-secondary">Edit Profile</Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* Add more sections as needed, e.g., payments, documents, etc. */}
    </Container>
  );
}

export default TenantDashboardPage;
