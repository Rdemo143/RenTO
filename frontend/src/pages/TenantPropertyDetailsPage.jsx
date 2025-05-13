import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert, Spinner, Tab, Tabs, ListGroup, Form } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { getTenantProperty, getCurrentUser, createMaintenanceRequest, getUserDocuments, getUserPayments } from '../services/api';
import { format } from 'date-fns';

function TenantPropertyDetailsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [maintenanceIssue, setMaintenanceIssue] = useState('');
  const [maintenanceDescription, setMaintenanceDescription] = useState('');
  const [maintenancePriority, setMaintenancePriority] = useState('medium');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    fetchTenantData();
  }, []);

  const fetchTenantData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch the tenant's property, documents and payments in parallel
      const [propertyData, userData, documentsData, paymentsData] = await Promise.all([
        getTenantProperty().catch(err => {
          console.error('Error fetching property:', err);
          return null;
        }),
        getCurrentUser().catch(err => {
          console.error('Error fetching user data:', err);
          return { currentProperty: null };
        }),
        getUserDocuments().catch(err => {
          console.error('Error fetching documents:', err);
          return [];
        }),
        getUserPayments().catch(err => {
          console.error('Error fetching payments:', err);
          return [];
        })
      ]);
      
      // Use the property data from the API if available, fallback to user data if needed
      let tenantProperty = propertyData;
      
      if (!tenantProperty && userData?.currentProperty) {
        tenantProperty = userData.currentProperty;
      }
      
      if (tenantProperty) {
        setProperty(tenantProperty);
        setDocuments(documentsData || []);
        setPayments(paymentsData || []);
      } else {
        // If there's no property found, log the issue but don't show error to user
        console.log('No property found for tenant. Will display empty state.');
      }
    } catch (err) {
      setError('Failed to fetch property details. Please try again later.');
      console.error('Error fetching tenant data:', err);
    }
    setLoading(false);
  };

  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError('');
    setSubmitSuccess('');
    
    if (!maintenanceIssue || !maintenanceDescription) {
      setSubmitError('Please fill in all required fields');
      setSubmitLoading(false);
      return;
    }
    
    try {
      const requestData = {
        propertyId: property._id,
        issue: maintenanceIssue,
        description: maintenanceDescription,
        priority: maintenancePriority
      };
      
      await createMaintenanceRequest(requestData);
      setSubmitSuccess('Maintenance request submitted successfully!');
      setMaintenanceIssue('');
      setMaintenanceDescription('');
      setMaintenancePriority('medium');
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit maintenance request. Please try again.');
      console.error('Error submitting maintenance request:', err);
    }
    setSubmitLoading(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (err) {
      console.error('Error formatting date:', err);
      return dateString;
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading property details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
        <Button as={Link} to="/tenant/dashboard" variant="primary">
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  if (!property) {
    return (
      <Container className="mt-4">
        <Alert variant="info">
          You don't have any rented property yet. Browse available properties to find your next home.
        </Alert>
        <Button as={Link} to="/properties" variant="primary" className="me-2">
          Browse Properties
        </Button>
        <Button as={Link} to="/tenant/dashboard" variant="outline-secondary">
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      <Row className="mb-4">
        <Col>
          <h1>{property.title}</h1>
          <p className="text-muted">
            {property.address?.street}, {property.address?.city}, {property.address?.state} {property.address?.zipCode}
          </p>
        </Col>
        <Col xs="auto">
          <Button as={Link} to="/tenant/dashboard" variant="outline-secondary">
            Back to Dashboard
          </Button>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={8}>
          {property.images && property.images.length > 0 ? (
            <>
              <div className="property-main-image mb-3">
                <img 
                  src={property.images.find(img => img.isMain)?.url || property.images[0].url} 
                  alt={property.title} 
                  className="img-fluid rounded shadow"
                  style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                />
              </div>
              <Row className="mb-3">
                {property.images.slice(0, 4).map((image, index) => (
                  <Col xs={3} key={index}>
                    <img 
                      src={image.url} 
                      alt={`${property.title} ${index + 1}`} 
                      className="img-fluid rounded shadow-sm"
                      style={{ width: '100%', height: '100px', objectFit: 'cover', cursor: 'pointer' }}
                    />
                  </Col>
                ))}
              </Row>
            </>
          ) : (
            <div className="property-main-image mb-3 bg-light rounded text-center p-5">
              <i className="bi bi-building fs-1 text-muted"></i>
              <p className="text-muted">No property images available</p>
            </div>
          )}
        </Col>
        <Col md={4}>
          <Card className="shadow-sm mb-3">
            <Card.Body>
              <Card.Title className="d-flex align-items-center">
                <i className="bi bi-file-text me-2 text-primary"></i>
                Lease Information
              </Card.Title>
              <div className="mb-2">
                <strong>Start Date:</strong> {formatDate(property.lease?.startDate)}
              </div>
              <div className="mb-2">
                <strong>End Date:</strong> {formatDate(property.lease?.endDate)}
              </div>
              <div className="mb-2">
                <strong>Monthly Rent:</strong> ${property.price?.amount?.toLocaleString() || 'N/A'} {property.price?.currency || 'USD'}
              </div>
              <div className="mb-3">
                <strong>Terms:</strong> {property.lease?.terms || 'Standard lease terms apply'}
              </div>
              <Button as={Link} to="/payments" variant="primary" className="w-100">
                <i className="bi bi-credit-card me-2"></i>Make a Payment
              </Button>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="d-flex align-items-center">
                <i className="bi bi-person-circle me-2 text-primary"></i>
                Owner/Manager Contact
              </Card.Title>
              {property.owner ? (
                <>
                  <div className="mb-2">
                    <strong>Name:</strong> {property.owner.name || 'Not specified'}
                  </div>
                  <div className="mb-2">
                    <strong>Email:</strong> {property.owner.email || 'Not specified'}
                  </div>
                  <div className="mb-3">
                    <strong>Phone:</strong> {property.owner.phone || 'Not specified'}
                  </div>
                  <Button 
                    as={Link} 
                    to={`/messages?recipientId=${property.owner._id}&propertyId=${property._id}`} 
                    variant="outline-primary" 
                    className="w-100"
                  >
                    <i className="bi bi-chat-dots me-2"></i>Send Message
                  </Button>
                </>
              ) : (
                <Alert variant="warning">Owner information not available</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="details" className="mb-4">
        <Tab eventKey="details" title={<span><i className="bi bi-info-circle me-2"></i>Property Details</span>}>
          <Card className="shadow-sm">
            <Card.Body>
              <h4>Description</h4>
              <p>{property.description || 'No description available'}</p>
              
              <h4>Features</h4>
              <Row className="mb-3">
                <Col md={3}>
                  <div className="mb-2">
                    <strong>Type:</strong> {property.type ? property.type.charAt(0).toUpperCase() + property.type.slice(1) : 'N/A'}
                  </div>
                </Col>
                <Col md={3}>
                  <div className="mb-2">
                    <strong>Bedrooms:</strong> {property.features?.bedrooms || 'N/A'}
                  </div>
                </Col>
                <Col md={3}>
                  <div className="mb-2">
                    <strong>Bathrooms:</strong> {property.features?.bathrooms || 'N/A'}
                  </div>
                </Col>
                <Col md={3}>
                  <div className="mb-2">
                    <strong>Area:</strong> {property.features?.area ? `${property.features.area} sq ft` : 'N/A'}
                  </div>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={4}>
                  <div className="mb-2">
                    <strong>Parking:</strong> {property.features?.parking ? 'Yes' : 'No'}
                  </div>
                </Col>
                <Col md={4}>
                  <div className="mb-2">
                    <strong>Furnished:</strong> {property.features?.furnished ? 'Yes' : 'No'}
                  </div>
                </Col>
                <Col md={4}>
                  <div className="mb-2">
                    <strong>Pets Allowed:</strong> {property.features?.petsAllowed ? 'Yes' : 'No'}
                  </div>
                </Col>
              </Row>
              
              <h4>Amenities</h4>
              {property.amenities && property.amenities.length > 0 ? (
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {property.amenities.map((amenity, index) => (
                    <Badge bg="secondary" key={index}>{amenity}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No amenities listed</p>
              )}
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="maintenance" title={<span><i className="bi bi-tools me-2"></i>Maintenance</span>}>
          <Card className="shadow-sm">
            <Card.Body>
              <h4>Submit a Maintenance Request</h4>
              {submitSuccess && <Alert variant="success">{submitSuccess}</Alert>}
              {submitError && <Alert variant="danger">{submitError}</Alert>}
              
              <Form onSubmit={handleMaintenanceSubmit}>
                <Form.Group className="mb-3" controlId="maintenanceIssue">
                  <Form.Label>Issue *</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="e.g., Leaking faucet, Broken heater" 
                    value={maintenanceIssue}
                    onChange={(e) => setMaintenanceIssue(e.target.value)}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="maintenanceDescription">
                  <Form.Label>Description *</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3} 
                    placeholder="Please provide details about the issue"
                    value={maintenanceDescription}
                    onChange={(e) => setMaintenanceDescription(e.target.value)}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="maintenancePriority">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select 
                    value={maintenancePriority}
                    onChange={(e) => setMaintenancePriority(e.target.value)}
                  >
                    <option value="low">Low - Not urgent</option>
                    <option value="medium">Medium - Needs attention soon</option>
                    <option value="high">High - Requires immediate attention</option>
                    <option value="emergency">Emergency - Safety risk</option>
                  </Form.Select>
                </Form.Group>
                
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={submitLoading || !maintenanceIssue || !maintenanceDescription}
                >
                  {submitLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2"></i>
                      Submit Request
                    </>
                  )}
                </Button>
              </Form>
              
              <hr className="my-4" />
              
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Recent Requests</h4>
                <Button 
                  as={Link} 
                  to="/maintenance-requests" 
                  variant="outline-primary" 
                  size="sm"
                >
                  View All Requests
                </Button>
              </div>
              
              <ListGroup>
                {/* This would display actual maintenance requests if we had them from the API */}
                <ListGroup.Item className="text-muted">
                  <i className="bi bi-info-circle me-2"></i>
                  Your maintenance requests will appear here
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="documents" title={<span><i className="bi bi-file-earmark me-2"></i>Documents</span>}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Lease Documents</h4>
                <Button variant="outline-primary" size="sm" as={Link} to="/documents">
                  <i className="bi bi-file-earmark-plus me-2"></i>
                  Upload New Document
                </Button>
              </div>
              
              {documents && documents.length > 0 ? (
                <ListGroup>
                  {documents.map((doc, index) => (
                    <ListGroup.Item 
                      key={index} 
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <i className="bi bi-file-earmark-text me-2"></i>
                        {doc.name || 'Document'} 
                        {doc.type && <Badge bg="secondary" className="ms-2">{doc.type}</Badge>}
                      </div>
                      <div>
                        {doc.uploadedAt && (
                          <small className="text-muted me-3">
                            Uploaded: {formatDate(doc.uploadedAt)}
                          </small>
                        )}
                        <Button 
                          href={doc.url} 
                          target="_blank" 
                          variant="outline-secondary" 
                          size="sm"
                        >
                          <i className="bi bi-download me-1"></i>
                          Download
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <Alert variant="info">
                  <i className="bi bi-info-circle me-2"></i>
                  No documents have been uploaded yet
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="payments" title={<span><i className="bi bi-cash-coin me-2"></i>Payments</span>}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Payment History</h4>
                <Button variant="success" as={Link} to="/payments">
                  <i className="bi bi-credit-card me-2"></i>
                  Make a Payment
                </Button>
              </div>
              
              {payments && payments.length > 0 ? (
                <ListGroup>
                  {payments.map((payment, index) => (
                    <ListGroup.Item 
                      key={index} 
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>${payment.amount?.toLocaleString()}</strong> - {payment.description || 'Rent Payment'}
                        <Badge 
                          bg={payment.status === 'paid' ? 'success' : 
                             payment.status === 'pending' ? 'warning' : 'danger'} 
                          className="ms-2"
                        >
                          {payment.status}
                        </Badge>
                      </div>
                      <div>
                        <small className="text-muted me-3">
                          {formatDate(payment.date)}
                        </small>
                        <Button 
                          as={Link} 
                          to={`/payments/${payment._id}`}
                          variant="outline-secondary" 
                          size="sm"
                        >
                          <i className="bi bi-receipt me-1"></i>
                          Receipt
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <Alert variant="info">
                  <i className="bi bi-info-circle me-2"></i>
                  No payment history found
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
}

export default TenantPropertyDetailsPage;
