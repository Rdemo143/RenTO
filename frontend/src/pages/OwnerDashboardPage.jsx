import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAllProperties, getDashboardStats, getUnreadCount } from '../services/api';

function OwnerDashboardPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !user._id) {
        return; // Don't fetch if user is not available yet
      }
      
      setLoading(true);
      setError('');
      try {
        // Fetch properties owned by the current user
        try {
          const propertiesData = await getAllProperties();
          // Filter properties where owner exists and matches current user
          const userProperties = propertiesData.filter(p => 
            p.owner && p.owner._id && p.owner._id === user._id
          );
          setProperties(userProperties);
          
          // Create stats based on properties data
          setStats({
            totalProperties: userProperties.length,
            rentedProperties: userProperties.filter(p => p.status === 'rented').length,
            availableProperties: userProperties.filter(p => p.status === 'available').length,
            totalRevenue: userProperties
              .filter(p => p.status === 'rented')
              .reduce((sum, p) => sum + (p.price?.amount || 0), 0)
          });
        } catch (propError) {
          console.error('Error fetching properties:', propError);
          // Set default values if properties can't be fetched
          setProperties([]);
          setStats({
            totalProperties: 0,
            rentedProperties: 0,
            availableProperties: 0,
            totalRevenue: 0
          });
        }
        
        // Fetch unread message count - set to 0 by default
        setUnreadMessages(0);
        try {
          // Only try to get unread count if we have a valid token
          if (localStorage.getItem('authToken')) {
            const unreadData = await getUnreadCount();
            if (unreadData && typeof unreadData.count === 'number') {
              setUnreadMessages(unreadData.count);
            }
          }
        } catch (msgError) {
          console.error('Error fetching unread messages:', msgError);
          // Keep the default value of 0
        }
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
        console.error('Error fetching owner dashboard data:', err);
      }
      setLoading(false);
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status" className="mb-3">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <h4>Loading dashboard data...</h4>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      
      <Row className="mb-4 align-items-center">
        <Col>
          <h1>Owner Dashboard</h1>
          <p className="lead">Welcome, {user?.name || 'Owner'}!</p>
        </Col>
        <Col xs="auto" className="d-flex gap-2">
          <Button as={Link} to="/owner/properties/new" variant="success">
            <i className="bi bi-plus-circle me-2"></i>Add New Property
          </Button>
          <Button as={Link} to="/owner/properties/simple-new" variant="outline-success">
            <i className="bi bi-plus-square me-2"></i>Quick Add Property
          </Button>
        </Col>
      </Row>
      
      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="bg-primary text-white h-100">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <h1 className="display-4 fw-bold">{stats?.totalProperties || 0}</h1>
              <p className="mb-0">Total Properties</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="bg-success text-white h-100">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <h1 className="display-4 fw-bold">{stats?.rentedProperties || 0}</h1>
              <p className="mb-0">Rented Properties</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="bg-info text-white h-100">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <h1 className="display-4 fw-bold">{stats?.availableProperties || 0}</h1>
              <p className="mb-0">Available Properties</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="bg-warning text-dark h-100">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <h1 className="display-4 fw-bold">${stats?.totalRevenue || 0}</h1>
              <p className="mb-0">Monthly Revenue</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Main Action Cards */}
      <Row>
        <Col md={4} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <Card.Title>
                <i className="bi bi-houses me-2 text-primary"></i>
                Manage Properties
              </Card.Title>
              <Card.Text>
                You have {properties.length} properties listed. 
                {properties.filter(p => p.status === 'available').length} available and 
                {properties.filter(p => p.status === 'rented').length} rented.
              </Card.Text>
              <div className="mt-auto">
                <Button as={Link} to="/owner/properties/manage" variant="primary" className="w-100">
                  <i className="bi bi-list-ul me-2"></i>My Properties
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <Card.Title className="d-flex justify-content-between align-items-center">
                <span><i className="bi bi-chat-dots me-2 text-info"></i>Messages</span>
                {unreadMessages > 0 && <Badge bg="danger" pill>{unreadMessages}</Badge>}
              </Card.Title>
              <Card.Text>
                Check your messages from tenants and interested parties.
                {unreadMessages > 0 && ` You have ${unreadMessages} unread messages.`}
              </Card.Text>
              <Button as={Link} to="/messages" variant="info" className="mt-auto w-100 text-white">
                <i className="bi bi-envelope me-2"></i>View Messages
              </Button>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <Card.Title>
                <i className="bi bi-person-circle me-2 text-secondary"></i>
                Account Settings
              </Card.Title>
              <Card.Text>
                Update your profile, contact information, and account preferences.
              </Card.Text>
              <Button as={Link} to="/profile" variant="secondary" className="mt-auto w-100">
                <i className="bi bi-gear me-2"></i>Edit Profile
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Additional Cards */}
      <Row className="mt-4">
        <Col md={6} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <Card.Title>
                <i className="bi bi-tools me-2 text-danger"></i>
                Maintenance Requests
              </Card.Title>
              <Card.Text>
                View and manage maintenance requests from your tenants.
              </Card.Text>
              <Button as={Link} to="/maintenance-requests" variant="outline-danger" className="mt-auto w-100">
                <i className="bi bi-wrench me-2"></i>View Requests
              </Button>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <Card.Title>
                <i className="bi bi-cash-coin me-2 text-success"></i>
                Payments
              </Card.Title>
              <Card.Text>
                Track rent payments, view payment history, and manage invoices.
              </Card.Text>
              <Button as={Link} to="/payments" variant="outline-success" className="mt-auto w-100">
                <i className="bi bi-credit-card me-2"></i>Manage Payments
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default OwnerDashboardPage;
