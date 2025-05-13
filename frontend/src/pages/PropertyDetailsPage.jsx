import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPropertyById, getOrCreateConversation } from '../services/api';
import { Container, Row, Col, Card, Button, Spinner, Alert, Carousel, Modal, Form, Tabs, Tab, Badge, ListGroup } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { FaHome, FaMoneyBillWave, FaFileContract, FaTools, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';
import TenantApplicationsModal from '../components/TenantApplicationsModal';
import PaymentManagementModal from '../components/PaymentManagementModal';
import { motion } from 'framer-motion';

const DEFAULT_IMAGE_URL = 'https://via.placeholder.com/600x400.png?text=No+Image+Available';

function PropertyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  
  // Rental and payment state
  const [showRentModal, setShowRentModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  
  // Owner management modals
  const [showTenantApplicationsModal, setShowTenantApplicationsModal] = useState(false);
  const [showPaymentManagementModal, setShowPaymentManagementModal] = useState(false);
  const [rentFormData, setRentFormData] = useState({
    startDate: '',
    endDate: '',
    tenantName: '',
    tenantEmail: '',
    tenantPhone: '',
    agreeToTerms: false
  });
  const [paymentFormData, setPaymentFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    amount: ''
  });
  const [maintenanceFormData, setMaintenanceFormData] = useState({
    issueType: '',
    description: '',
    urgency: 'medium',
    preferredDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      setLoading(true);
      try {
        const propertyData = await getPropertyById(id);
        console.log('Property data:', propertyData);
        setProperty(propertyData);
      } catch (err) {
        setError('Failed to fetch property details. Property may not exist or an error occurred.');
        console.error('Error fetching property details:', err);
      }
      setLoading(false);
    };
    fetchPropertyDetails();
  }, [id]);
  
  const handleContactOwner = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/properties/${id}`, message: 'Please log in to contact the owner' } });
      return;
    }
    
    if (!property?.owner?._id) {
      setError('Cannot contact owner. Owner information is missing.');
      return;
    }
    
    setContactLoading(true);
    try {
      const conversation = await getOrCreateConversation(property.owner._id, id);
      navigate('/messages', { state: { conversationId: conversation._id } });
    } catch (err) {
      setError('Failed to start conversation with owner. Please try again.');
      console.error('Error starting conversation:', err);
    } finally {
      setContactLoading(false);
    }
  };
  
  // Handle rent application form changes
  const handleRentFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRentFormData({
      ...rentFormData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle payment form changes
  const handlePaymentFormChange = (e) => {
    const { name, value } = e.target;
    setPaymentFormData({
      ...paymentFormData,
      [name]: value
    });
  };
  
  // Handle maintenance form changes
  const handleMaintenanceFormChange = (e) => {
    const { name, value } = e.target;
    setMaintenanceFormData({
      ...maintenanceFormData,
      [name]: value
    });
  };
  
  // Submit rent application
  const handleRentSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/properties/${id}`, message: 'Please log in to rent this property' } });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Here you would call your API to submit the rental application
      // const response = await submitRentalApplication(id, rentFormData);
      
      // For now, we'll simulate a successful submission
      setTimeout(() => {
        setShowRentModal(false);
        setShowAgreementModal(true);
        setIsSubmitting(false);
        setSuccessMessage('Rental application submitted successfully! Please review the lease agreement.');
      }, 1500);
    } catch (err) {
      setError('Failed to submit rental application. Please try again.');
      console.error('Error submitting rental application:', err);
      setIsSubmitting(false);
    }
  };
  
  // Submit payment
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/properties/${id}`, message: 'Please log in to make a payment' } });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Here you would call your API to process the payment
      // const response = await processPayment(id, paymentFormData);
      
      // For now, we'll simulate a successful payment
      setTimeout(() => {
        setShowPaymentModal(false);
        setIsSubmitting(false);
        setSuccessMessage('Payment processed successfully!');
      }, 1500);
    } catch (err) {
      setError('Failed to process payment. Please try again.');
      console.error('Error processing payment:', err);
      setIsSubmitting(false);
    }
  };
  
  // Submit maintenance request
  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/properties/${id}`, message: 'Please log in to submit a maintenance request' } });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Here you would call your API to submit the maintenance request
      // const response = await submitMaintenanceRequest(id, maintenanceFormData);
      
      // For now, we'll simulate a successful submission
      setTimeout(() => {
        setShowMaintenanceModal(false);
        setIsSubmitting(false);
        setSuccessMessage('Maintenance request submitted successfully!');
      }, 1500);
    } catch (err) {
      setError('Failed to submit maintenance request. Please try again.');
      console.error('Error submitting maintenance request:', err);
      setIsSubmitting(false);
    }
  };
  
  // Accept lease agreement
  const handleAcceptAgreement = () => {
    setShowAgreementModal(false);
    setShowPaymentModal(true);
    // Pre-fill the payment amount with the property price
    if (property?.price?.amount) {
      setPaymentFormData({
        ...paymentFormData,
        amount: property.price.amount
      });
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading property details...</p>
      </Container>
    );
  }

  if (error) {
    return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
  }

  if (!property) {
    return <Container className="mt-5"><Alert variant="warning">Property not found.</Alert></Container>;
  }

  const { title, description, address, price, type, images, bedrooms, bathrooms, area, owner, amenities, yearBuilt, status } = property;

  return (
    <Container className="mt-5 mb-5">
      <Card className="shadow-lg">
        <Card.Header as="h2" className="bg-primary text-white">{title || 'Property Details'}</Card.Header>
        <Card.Body>
          <Row>
            <Col md={8} className="mb-3 mb-md-0">
              {images && images.length > 0 ? (
                <Carousel fade>
                  {images.map((image, index) => (
                    <Carousel.Item key={image.public_id || index}>
                      <img
                        className="d-block w-100 rounded"
                        src={image.url}
                        alt={`Slide ${index + 1} for ${title}`}
                        style={{ maxHeight: '500px', objectFit: 'cover' }}
                      />
                    </Carousel.Item>
                  ))}
                </Carousel>
              ) : (
                <img 
                    src={DEFAULT_IMAGE_URL} 
                    alt="Default property representation" 
                    className="img-fluid rounded w-100"
                    style={{ maxHeight: '500px', objectFit: 'cover' }}
                />
              )}
            </Col>
            <Col md={4}>
              <h4>Key Information</h4>
              <p><strong>Price:</strong> <span className="text-success fw-bold fs-5">${property.price && property.price.amount ? property.price.amount.toLocaleString() : 'N/A'} / month</span></p>
              <p><strong>Type:</strong> {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'N/A'}</p>
              <p><strong>Status:</strong> <span className={`badge bg-${status === 'available' ? 'success' : 'warning'}`}>{status ? status.charAt(0).toUpperCase() + status.slice(1) : 'N/A'}</span></p>
              <p><strong>Address:</strong> {address?.street}, {address?.city}, {address?.state} {address?.zipCode}</p>
              <p><strong>Bedrooms:</strong> {property.features?.bedrooms || 'N/A'}</p>
              <p><strong>Bathrooms:</strong> {property.features?.bathrooms || 'N/A'}</p>
              <p><strong>Area:</strong> {property.features?.area ? `${property.features.area} sq ft` : 'N/A'}</p>
              {yearBuilt && <p><strong>Year Built:</strong> {yearBuilt}</p>}
              
              {owner && (
                <div className="mt-3 p-3 bg-light rounded">
                  <h5>Owner Information</h5>
                  <p><strong>Name:</strong> {owner.name}</p>
                  <p><strong>Email:</strong> <a href={`mailto:${owner.email}`}>{owner.email}</a></p>
                  {owner.phone && <p><strong>Phone:</strong> {owner.phone}</p>}
                </div>
              )}
              
              {isAuthenticated && user?._id !== owner?._id && (
                <>
                  <Button 
                    variant="success" 
                    className="w-100 mt-3" 
                    onClick={handleContactOwner}
                    disabled={contactLoading}
                  >
                    {contactLoading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        Connecting...
                      </>
                    ) : <>Contact Owner <i className="ms-1 bi bi-chat-dots"></i></>}
                  </Button>
                  
                  <Button 
                    variant="primary" 
                    className="w-100 mt-2" 
                    onClick={() => setShowRentModal(true)}
                  >
                    <FaHome className="me-2" /> Rent This Property
                  </Button>
                  
                  <Button 
                    variant="info" 
                    className="w-100 mt-2" 
                    onClick={() => setShowMaintenanceModal(true)}
                  >
                    <FaTools className="me-2" /> Request Maintenance
                  </Button>
                  
                  <Button 
                    variant="warning" 
                    className="w-100 mt-2" 
                    onClick={() => setShowPaymentModal(true)}
                  >
                    <FaMoneyBillWave className="me-2" /> Make a Payment
                  </Button>
                </>
              )}
              
              {isAuthenticated && user?._id === owner?._id && (
                 <motion.div className="d-flex flex-column gap-2 mt-3">
                   <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                     <Button 
                       as={Link} 
                       to={`/owner/edit-property/${property._id}`} 
                       variant="info" 
                       className="w-100 d-flex align-items-center justify-content-center"
                     >
                       <i className="bi bi-pencil-square me-2"></i> Edit Property
                     </Button>
                   </motion.div>
                   <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                     <Button 
                       variant="secondary" 
                       className="w-100 d-flex align-items-center justify-content-center"
                       onClick={() => setShowTenantApplicationsModal(true)}
                     >
                       <i className="bi bi-people me-2"></i> View Tenant Applications
                     </Button>
                   </motion.div>
                   <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                     <Button 
                       variant="warning" 
                       className="w-100 d-flex align-items-center justify-content-center"
                       onClick={() => setShowPaymentManagementModal(true)}
                     >
                       <FaMoneyBillWave className="me-2" /> Manage Payments
                     </Button>
                   </motion.div>
                 </motion.div>
               )}
            </Col>
          </Row>
          
          {description && (
            <Row className="mt-4">
              <Col>
                <h4>Description</h4>
                <p style={{whiteSpace: 'pre-line'}}>{description}</p>
              </Col>
            </Row>
          )}

          {amenities && amenities.length > 0 && (
            <Row className="mt-4">
              <Col>
                <h4>Amenities</h4>
                <ul>
                  {amenities.map((amenity, index) => (
                    <li key={index}>{amenity}</li>
                  ))}
                </ul>
              </Col>
            </Row>
          )}
        </Card.Body>
        <Card.Footer>
            <Link to="/properties">Back to Properties</Link>
        </Card.Footer>
      </Card>
      
      {/* Success message alert */}
      {successMessage && (
        <Alert variant="success" className="mt-3" dismissible onClose={() => setSuccessMessage('')}>
          <FaCheckCircle className="me-2" /> {successMessage}
        </Alert>
      )}
      
      {/* Rental Application Modal */}
      <Modal show={showRentModal} onHide={() => setShowRentModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Rent This Property</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleRentSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    name="startDate" 
                    value={rentFormData.startDate} 
                    onChange={handleRentFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    name="endDate" 
                    value={rentFormData.endDate} 
                    onChange={handleRentFormChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control 
                type="text" 
                name="tenantName" 
                value={rentFormData.tenantName} 
                onChange={handleRentFormChange}
                placeholder="Enter your full name"
                required
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control 
                    type="email" 
                    name="tenantEmail" 
                    value={rentFormData.tenantEmail} 
                    onChange={handleRentFormChange}
                    placeholder="Enter your email"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control 
                    type="tel" 
                    name="tenantPhone" 
                    value={rentFormData.tenantPhone} 
                    onChange={handleRentFormChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Alert variant="info">
              <strong>Monthly Rent:</strong> ${property.price?.amount?.toLocaleString() || 'N/A'}
              <br />
              <strong>Security Deposit:</strong> ${(property.price?.amount || 0) * 2}
              <br />
              <strong>Application Fee:</strong> $50 (non-refundable)
            </Alert>
            
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox" 
                name="agreeToTerms" 
                checked={rentFormData.agreeToTerms} 
                onChange={handleRentFormChange}
                label="I agree to the terms and conditions, including background and credit checks."
                required
              />
            </Form.Group>
            
            <div className="d-grid gap-2">
              <Button variant="primary" type="submit" disabled={isSubmitting || !rentFormData.agreeToTerms}>
                {isSubmitting ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Processing...
                  </>
                ) : 'Submit Application'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      
      {/* Lease Agreement Modal */}
      <Modal show={showAgreementModal} onHide={() => setShowAgreementModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title><FaFileContract className="me-2" /> Lease Agreement</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="bg-light p-3 mb-3 border rounded" style={{maxHeight: '300px', overflowY: 'auto'}}>
            <h4>RESIDENTIAL LEASE AGREEMENT</h4>
            <p><strong>THIS AGREEMENT</strong> made this {new Date().toLocaleDateString()} between {property?.owner?.name || 'Property Owner'}, hereinafter called "Landlord," and {rentFormData.tenantName}, hereinafter called "Tenant."</p>
            
            <h5>1. PROPERTY</h5>
            <p>Landlord hereby leases to Tenant the property located at: {property?.address?.street}, {property?.address?.city}, {property?.address?.state} {property?.address?.zipCode}</p>
            
            <h5>2. TERM</h5>
            <p>The term of this lease shall be from {rentFormData.startDate} to {rentFormData.endDate}.</p>
            
            <h5>3. RENT</h5>
            <p>Tenant agrees to pay as rent the sum of ${property?.price?.amount?.toLocaleString() || 'N/A'} per month, payable on the 1st day of each month.</p>
            
            <h5>4. SECURITY DEPOSIT</h5>
            <p>Tenant shall deposit with Landlord the sum of ${(property?.price?.amount || 0) * 2} as a security deposit.</p>
            
            <h5>5. UTILITIES</h5>
            <p>Tenant shall be responsible for payment of all utilities and services, except for the following which shall be paid by Landlord: [Water, Garbage].</p>
            
            <h5>6. MAINTENANCE</h5>
            <p>Tenant shall maintain the premises in a clean and sanitary manner and shall surrender the same at termination in as good condition as received, normal wear and tear excepted.</p>
            
            <h5>7. PETS</h5>
            <p>No pets shall be brought on the premises without prior written consent of the Landlord.</p>
            
            <h5>8. TERMINATION</h5>
            <p>Either party may terminate this agreement at the end of the initial term by giving written notice at least 30 days prior to the end of the term.</p>
          </div>
          
          <Form.Group className="mb-3">
            <Form.Check 
              type="checkbox" 
              id="agree-lease" 
              label="I have read and agree to the terms of the lease agreement."
              required
            />
          </Form.Group>
          
          <div className="d-flex justify-content-between">
            <Button variant="secondary" onClick={() => setShowAgreementModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAcceptAgreement}>
              Accept & Continue to Payment
            </Button>
          </div>
        </Modal.Body>
      </Modal>
      
      {/* Payment Modal */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title><FaMoneyBillWave className="me-2" /> Make a Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePaymentSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Payment Amount ($)</Form.Label>
              <Form.Control 
                type="number" 
                name="amount" 
                value={paymentFormData.amount} 
                onChange={handlePaymentFormChange}
                placeholder="Enter payment amount"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Card Number</Form.Label>
              <Form.Control 
                type="text" 
                name="cardNumber" 
                value={paymentFormData.cardNumber} 
                onChange={handlePaymentFormChange}
                placeholder="XXXX XXXX XXXX XXXX"
                required
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Expiry Date</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="expiryDate" 
                    value={paymentFormData.expiryDate} 
                    onChange={handlePaymentFormChange}
                    placeholder="MM/YY"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>CVV</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="cvv" 
                    value={paymentFormData.cvv} 
                    onChange={handlePaymentFormChange}
                    placeholder="XXX"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Name on Card</Form.Label>
              <Form.Control 
                type="text" 
                name="nameOnCard" 
                value={paymentFormData.nameOnCard} 
                onChange={handlePaymentFormChange}
                placeholder="Enter name as it appears on card"
                required
              />
            </Form.Group>
            
            <div className="d-grid gap-2">
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Processing Payment...
                  </>
                ) : 'Complete Payment'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      
      {/* Maintenance Request Modal */}
      <Modal show={showMaintenanceModal} onHide={() => setShowMaintenanceModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title><FaTools className="me-2" /> Maintenance Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleMaintenanceSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Issue Type</Form.Label>
              <Form.Select 
                name="issueType" 
                value={maintenanceFormData.issueType} 
                onChange={handleMaintenanceFormChange}
                required
              >
                <option value="">Select issue type</option>
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="hvac">HVAC/Heating/Cooling</option>
                <option value="appliance">Appliance</option>
                <option value="structural">Structural</option>
                <option value="pest">Pest Control</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                name="description" 
                value={maintenanceFormData.description} 
                onChange={handleMaintenanceFormChange}
                placeholder="Please describe the issue in detail"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Urgency</Form.Label>
              <Form.Select 
                name="urgency" 
                value={maintenanceFormData.urgency} 
                onChange={handleMaintenanceFormChange}
                required
              >
                <option value="low">Low - Not urgent</option>
                <option value="medium">Medium - Needs attention soon</option>
                <option value="high">High - Urgent issue</option>
                <option value="emergency">Emergency - Immediate attention required</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Preferred Date for Maintenance Visit</Form.Label>
              <Form.Control 
                type="date" 
                name="preferredDate" 
                value={maintenanceFormData.preferredDate} 
                onChange={handleMaintenanceFormChange}
              />
            </Form.Group>
            
            <div className="d-grid gap-2">
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Submitting Request...
                  </>
                ) : 'Submit Maintenance Request'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      
      {/* Tenant Applications Modal */}
      <TenantApplicationsModal 
        show={showTenantApplicationsModal} 
        onHide={() => setShowTenantApplicationsModal(false)} 
        propertyId={id} 
      />
      
      {/* Payment Management Modal */}
      <PaymentManagementModal 
        show={showPaymentManagementModal} 
        onHide={() => setShowPaymentManagementModal(false)} 
        propertyId={id} 
      />
    </Container>
  );
}

export default PropertyDetailsPage;
