import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Alert, Spinner, Badge, Tabs, Tab } from 'react-bootstrap';
import { getUserMaintenanceRequests, createMaintenanceRequest, updateMaintenanceStatus } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

function MaintenanceRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [processingRequestId, setProcessingRequestId] = useState(null);
  
  // New request form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [images, setImages] = useState([]);
  const [propertyId, setPropertyId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchMaintenanceRequests();
  }, []);

  const fetchMaintenanceRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getUserMaintenanceRequests();
      setRequests(data);
      console.log('Maintenance requests:', data);
    } catch (err) {
      setError('Failed to fetch maintenance requests. Please try again later.');
      console.error('Error fetching maintenance requests:', err);
    }
    setLoading(false);
  };
  
  const handleUpdateStatus = async (requestId, newStatus) => {
    setProcessingRequestId(requestId);
    setError('');
    try {
      await updateMaintenanceStatus(requestId, { status: newStatus });
      setSuccessMessage(`Request status updated to ${newStatus}`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchMaintenanceRequests(); // Refresh the list
      if (selectedRequest && selectedRequest._id === requestId) {
        setSelectedRequest({...selectedRequest, status: newStatus});
      }
    } catch (err) {
      setError('Failed to update request status. Please try again.');
      console.error('Error updating request status:', err);
    }
    setProcessingRequestId(null);
  };
  
  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };
  
  const getFilteredRequests = () => {
    if (activeTab === 'all') return requests;
    return requests.filter(request => request.status === activeTab);
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    try {
      const requestData = {
        title,
        description,
        priority,
        images,
        propertyId: propertyId || undefined // Only include if not empty
      };

      await createMaintenanceRequest(requestData);
      setShowNewRequestModal(false);
      resetForm();
      fetchMaintenanceRequests(); // Refresh the list
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit maintenance request. Please try again.');
    }

    setSubmitting(false);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setImages([]);
    setPropertyId('');
    setSubmitError('');
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <Badge bg="danger">High</Badge>;
      case 'medium':
        return <Badge bg="warning">Medium</Badge>;
      case 'low':
        return <Badge bg="info">Low</Badge>;
      default:
        return <Badge bg="secondary">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <Badge bg="primary">Open</Badge>;
      case 'in_progress':
        return <Badge bg="warning">In Progress</Badge>;
      case 'completed':
        return <Badge bg="success">Completed</Badge>;
      case 'cancelled':
        return <Badge bg="secondary">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading maintenance requests...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <Row className="mb-4 align-items-center">
          <Col>
            <h1 className="fw-bold">Maintenance Requests</h1>
            <p className="text-muted">
              {user.role === 'tenant' 
                ? 'Submit and track maintenance requests for your rental properties.' 
                : 'Manage and respond to tenant maintenance requests.'}
            </p>
          </Col>
          <Col xs="auto">
            {user.role === 'tenant' && (
              <Button 
                variant="primary" 
                className="d-flex align-items-center"
                onClick={() => setShowNewRequestModal(true)}
              >
                <i className="bi bi-plus-circle me-2"></i>New Request
              </Button>
            )}
          </Col>
        </Row>

        {error && <Alert variant="danger">{error}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}

        {/* Filter tabs */}
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4"
        >
          <Tab eventKey="all" title="All Requests"></Tab>
          <Tab eventKey="open" title="Open"></Tab>
          <Tab eventKey="in_progress" title="In Progress"></Tab>
          <Tab eventKey="completed" title="Completed"></Tab>
        </Tabs>

        {getFilteredRequests().length === 0 ? (
          <Alert variant="info">
            {user.role === 'tenant' 
              ? 'You don\'t have any maintenance requests in this category. Click "New Request" to create one.' 
              : 'There are no maintenance requests in this category.'}
          </Alert>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {getFilteredRequests().map(request => (
              <Col key={request._id}>
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Card className="h-100 shadow-sm border-0">
                    <Card.Body>
                      <div className="d-flex justify-content-between mb-3">
                        <Card.Title className="fw-bold">{request.title}</Card.Title>
                        <div>
                          {getStatusBadge(request.status)}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <span className="me-2">{getPriorityBadge(request.priority)}</span>
                        <small className="text-muted">
                          Created: {new Date(request.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                      
                      <Card.Text className="text-truncate mb-3">{request.description}</Card.Text>
                      
                      {request.property && (
                        <div className="mb-3">
                          <small className="text-muted d-flex align-items-center">
                            <i className="bi bi-house me-1"></i>
                            {request.property.title || 'Property #' + request.property._id}
                          </small>
                        </div>
                      )}
                      
                      <div className="d-flex mt-auto pt-2">
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="w-100"
                          onClick={() => handleViewDetails(request)}
                        >
                          <i className="bi bi-eye me-1"></i> View Details
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        )}
      </motion.div>

      {/* New Maintenance Request Modal */}
      {/* Maintenance Request Details Modal */}
      <Modal 
        show={showDetailsModal} 
        onHide={() => setShowDetailsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Maintenance Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <>
              <h4 className="mb-3">{selectedRequest.title}</h4>
              
              <Row className="mb-4">
                <Col md={6}>
                  <p><strong>Status:</strong> {getStatusBadge(selectedRequest.status)}</p>
                  <p><strong>Priority:</strong> {getPriorityBadge(selectedRequest.priority)}</p>
                  <p><strong>Created:</strong> {new Date(selectedRequest.createdAt).toLocaleString()}</p>
                </Col>
                <Col md={6}>
                  {selectedRequest.property && (
                    <p><strong>Property:</strong> {selectedRequest.property.title || 'Property #' + selectedRequest.property._id}</p>
                  )}
                  {user.role === 'owner' && selectedRequest.tenant && (
                    <p><strong>Tenant:</strong> {selectedRequest.tenant.name}</p>
                  )}
                </Col>
              </Row>
              
              <div className="mb-4">
                <h5>Description</h5>
                <p>{selectedRequest.description}</p>
              </div>
              
              {selectedRequest.images && selectedRequest.images.length > 0 && (
                <div className="mb-4">
                  <h5>Images</h5>
                  <Row>
                    {selectedRequest.images.map((image, index) => (
                      <Col key={index} xs={6} md={4} className="mb-3">
                        <img 
                          src={image.url} 
                          alt={`Maintenance issue ${index + 1}`} 
                          className="img-fluid rounded"
                        />
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
              
              {user.role === 'owner' && selectedRequest.status !== 'completed' && (
                <div className="mt-4">
                  <h5>Update Status</h5>
                  <div className="d-flex gap-2 mt-3">
                    {selectedRequest.status === 'open' && (
                      <Button 
                        variant="primary" 
                        onClick={() => handleUpdateStatus(selectedRequest._id, 'in_progress')}
                        disabled={processingRequestId === selectedRequest._id}
                      >
                        <i className="bi bi-tools me-2"></i>
                        Mark In Progress
                      </Button>
                    )}
                    
                    <Button 
                      variant="success" 
                      onClick={() => handleUpdateStatus(selectedRequest._id, 'completed')}
                      disabled={processingRequestId === selectedRequest._id}
                    >
                      <i className="bi bi-check-circle me-2"></i>
                      Mark Completed
                    </Button>
                    
                    {selectedRequest.status !== 'cancelled' && (
                      <Button 
                        variant="secondary" 
                        onClick={() => handleUpdateStatus(selectedRequest._id, 'cancelled')}
                        disabled={processingRequestId === selectedRequest._id}
                      >
                        <i className="bi bi-x-circle me-2"></i>
                        Cancel Request
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* New Maintenance Request Modal */}
      <Modal show={showNewRequestModal} onHide={() => {
        setShowNewRequestModal(false);
        resetForm();
      }} backdrop="static" size="lg">
        <Modal.Header closeButton>
          <Modal.Title>New Maintenance Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {submitError && <Alert variant="danger">{submitError}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="requestTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Brief description of the issue"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="requestDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Detailed description of the maintenance issue"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="requestPriority">
              <Form.Label>Priority</Form.Label>
              <Form.Select 
                value={priority} 
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low - Not urgent</option>
                <option value="medium">Medium - Needs attention soon</option>
                <option value="high">High - Urgent issue</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="requestImages">
              <Form.Label>Images (Optional)</Form.Label>
              <Form.Control
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
              />
              <Form.Text className="text-muted">
                Upload photos of the issue to help us understand the problem better.
              </Form.Text>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => {
                setShowNewRequestModal(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default MaintenanceRequestsPage;
