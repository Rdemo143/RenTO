import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Tabs, Tab, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const PaymentsPage = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Placeholder data for UI demonstration
  useEffect(() => {
    // This would normally be an API call to fetch payments
    setTimeout(() => {
      const demoPayments = [
        { 
          id: '1', 
          type: 'rent', 
          amount: 1200.00,
          status: 'upcoming',
          dueDate: new Date(Date.now() + 604800000).toISOString(), // 7 days from now
          property: 'Sunset Apartments, Unit 301',
          description: 'Monthly rent for June 2025'
        },
        { 
          id: '2', 
          type: 'deposit', 
          amount: 1500.00,
          status: 'paid',
          dueDate: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
          paidDate: new Date(Date.now() - 2592000000).toISOString(),
          property: 'Sunset Apartments, Unit 301',
          description: 'Security deposit'
        },
        { 
          id: '3', 
          type: 'rent', 
          amount: 1200.00,
          status: 'paid',
          dueDate: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
          paidDate: new Date(Date.now() - 2592000000).toISOString(),
          property: 'Sunset Apartments, Unit 301',
          description: 'Monthly rent for May 2025'
        },
        { 
          id: '4', 
          type: 'maintenance', 
          amount: 150.00,
          status: 'overdue',
          dueDate: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
          property: 'Sunset Apartments, Unit 301',
          description: 'Plumbing repair cost share'
        },
      ];
      setPayments(demoPayments);
      setLoading(false);
    }, 1000); // Simulate loading delay
  }, []);

  // Filter payments based on active tab
  const filteredPayments = payments.filter(payment => {
    if (activeTab === 'upcoming') return payment.status === 'upcoming';
    if (activeTab === 'paid') return payment.status === 'paid';
    if (activeTab === 'overdue') return payment.status === 'overdue';
    return true; // 'all' tab
  });

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'paid':
        return <Badge bg="success">Paid</Badge>;
      case 'upcoming':
        return <Badge bg="warning" text="dark">Upcoming</Badge>;
      case 'overdue':
        return <Badge bg="danger">Overdue</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Mock payment submission
  const handlePayment = (paymentId) => {
    alert(`Payment process would be initiated for payment ID: ${paymentId}`);
    // In a real app, this would call an API to process the payment
  };

  return (
    <div className="container-fluid py-4">
      <h2 className="fw-bold text-primary mb-4">Payments</h2>
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="upcoming" title="Upcoming" />
        <Tab eventKey="paid" title="Paid" />
        <Tab eventKey="overdue" title="Overdue" />
        <Tab eventKey="all" title="All Payments" />
      </Tabs>

      {activeTab === 'upcoming' && filteredPayments.length > 0 && (
        <Card className="shadow-sm border-0 mb-4">
          <Card.Header className="bg-light py-3">
            <h5 className="mb-0">Make a Payment</h5>
          </Card.Header>
          <Card.Body className="p-4">
            <Form>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Select Payment</Form.Label>
                    <Form.Select>
                      {filteredPayments.map(payment => (
                        <option key={payment.id} value={payment.id}>
                          {payment.description} - ${payment.amount.toFixed(2)}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Payment Method</Form.Label>
                    <Form.Select>
                      <option>Credit Card</option>
                      <option>Bank Transfer</option>
                      <option>PayPal</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Card Number</Form.Label>
                    <Form.Control type="text" placeholder="XXXX XXXX XXXX XXXX" />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Expiry Date</Form.Label>
                    <Form.Control type="text" placeholder="MM/YY" />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">CVV</Form.Label>
                    <Form.Control type="text" placeholder="XXX" />
                  </Form.Group>
                </Col>
              </Row>
              <Button variant="primary" className="px-4">
                Pay Now
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-light py-3">
          <h5 className="mb-0">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Payments</h5>
        </Card.Header>
        {loading ? (
          <Card.Body className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading payments...</p>
          </Card.Body>
        ) : filteredPayments.length === 0 ? (
          <Card.Body className="text-center py-5">
            <i className="bi bi-credit-card text-muted" style={{fontSize: '4rem'}}></i>
            <h4 className="mt-3">No {activeTab} payments</h4>
            <p className="text-muted">You don't have any {activeTab} payments at the moment.</p>
          </Card.Body>
        ) : (
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Description</th>
                <th>Property</th>
                <th>Amount</th>
                <th>Due Date</th>
                {activeTab === 'paid' && <th>Paid Date</th>}
                <th>Status</th>
                {(activeTab === 'upcoming' || activeTab === 'overdue') && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(payment => (
                <tr key={payment.id}>
                  <td>{payment.description}</td>
                  <td>{payment.property}</td>
                  <td>${payment.amount.toFixed(2)}</td>
                  <td>{formatDate(payment.dueDate)}</td>
                  {activeTab === 'paid' && <td>{formatDate(payment.paidDate)}</td>}
                  <td>{getStatusBadge(payment.status)}</td>
                  {(activeTab === 'upcoming' || activeTab === 'overdue') && (
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => handlePayment(payment.id)}
                      >
                        Pay Now
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default PaymentsPage;
