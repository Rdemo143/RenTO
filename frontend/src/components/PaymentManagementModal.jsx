import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Badge, Spinner, Alert, Form, Row, Col, Card } from 'react-bootstrap';
import { getPropertyPayments, sendPaymentReminder } from '../services/api';

const PaymentManagementModal = ({ show, onHide, propertyId }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [stats, setStats] = useState({
    totalReceived: 0,
    pendingAmount: 0,
    overdueAmount: 0
  });

  useEffect(() => {
    if (show && propertyId) {
      fetchPayments();
    }
  }, [show, propertyId]);

  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      // This would be a real API call in a production app
      // const response = await getPropertyPayments(propertyId);
      // setPayments(response.data);
      
      // For demo purposes, we'll use mock data
      setTimeout(() => {
        const mockPayments = [
          {
            _id: '1',
            tenantName: 'John Doe',
            tenantEmail: 'john.doe@example.com',
            amount: 1500,
            dueDate: '2025-06-01',
            status: 'paid',
            paidDate: '2025-05-29',
            paymentMethod: 'Credit Card',
            transactionId: 'txn_123456'
          },
          {
            _id: '2',
            tenantName: 'Jane Smith',
            tenantEmail: 'jane.smith@example.com',
            amount: 1500,
            dueDate: '2025-07-01',
            status: 'pending',
            paidDate: null,
            paymentMethod: null,
            transactionId: null
          },
          {
            _id: '3',
            tenantName: 'Robert Johnson',
            tenantEmail: 'robert.j@example.com',
            amount: 1500,
            dueDate: '2025-05-01',
            status: 'overdue',
            paidDate: null,
            paymentMethod: null,
            transactionId: null
          }
        ];
        
        setPayments(mockPayments);
        
        // Calculate payment statistics
        const totalReceived = mockPayments
          .filter(p => p.status === 'paid')
          .reduce((sum, p) => sum + p.amount, 0);
          
        const pendingAmount = mockPayments
          .filter(p => p.status === 'pending')
          .reduce((sum, p) => sum + p.amount, 0);
          
        const overdueAmount = mockPayments
          .filter(p => p.status === 'overdue')
          .reduce((sum, p) => sum + p.amount, 0);
          
        setStats({
          totalReceived,
          pendingAmount,
          overdueAmount
        });
        
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error fetching property payments:', err);
      setError('Failed to load payment information. Please try again.');
      setLoading(false);
    }
  };

  const handleSendReminder = async (paymentId, tenantEmail) => {
    setProcessingId(paymentId);
    setSuccessMessage('');
    try {
      // This would be a real API call in a production app
      // await sendPaymentReminder(paymentId);
      
      // For demo purposes, we'll simulate a successful API call
      setTimeout(() => {
        setSuccessMessage(`Payment reminder sent to ${tenantEmail}`);
        setProcessingId(null);
      }, 800);
    } catch (err) {
      console.error('Error sending payment reminder:', err);
      setError('Failed to send payment reminder. Please try again.');
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'paid':
        return <Badge bg="success">Paid</Badge>;
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'overdue':
        return <Badge bg="danger">Overdue</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
  };

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString()}`;
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <i className="bi bi-cash-coin me-2"></i>
          Payment Management
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {successMessage && (
          <Alert variant="success" dismissible onClose={() => setSuccessMessage('')}>
            <i className="bi bi-check-circle-fill me-2"></i>
            {successMessage}
          </Alert>
        )}
        
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <div className="text-center p-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading payment information...</p>
          </div>
        ) : (
          <>
            {/* Payment Summary Cards */}
            <Row className="mb-4">
              <Col md={4}>
                <Card className="dashboard-card bg-success bg-opacity-10 h-100">
                  <Card.Body className="text-center">
                    <i className="bi bi-check-circle card-icon text-success"></i>
                    <h6 className="card-title">Total Received</h6>
                    <div className="card-value text-success">{formatCurrency(stats.totalReceived)}</div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="dashboard-card bg-warning bg-opacity-10 h-100">
                  <Card.Body className="text-center">
                    <i className="bi bi-hourglass-split card-icon text-warning"></i>
                    <h6 className="card-title">Pending</h6>
                    <div className="card-value text-warning">{formatCurrency(stats.pendingAmount)}</div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="dashboard-card bg-danger bg-opacity-10 h-100">
                  <Card.Body className="text-center">
                    <i className="bi bi-exclamation-triangle card-icon text-danger"></i>
                    <h6 className="card-title">Overdue</h6>
                    <div className="card-value text-danger">{formatCurrency(stats.overdueAmount)}</div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            {/* Payment Records Table */}
            <h5 className="mb-3">Payment Records</h5>
            {payments.length === 0 ? (
              <Alert variant="info">
                No payment records found for this property.
              </Alert>
            ) : (
              <div className="table-responsive">
                <Table striped hover className="align-middle">
                  <thead>
                    <tr>
                      <th>Tenant</th>
                      <th>Amount</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Payment Details</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(payment => (
                      <tr key={payment._id}>
                        <td>
                          <div className="fw-bold">{payment.tenantName}</div>
                          <small className="text-muted">{payment.tenantEmail}</small>
                        </td>
                        <td className="fw-bold">{formatCurrency(payment.amount)}</td>
                        <td>{formatDate(payment.dueDate)}</td>
                        <td>{getStatusBadge(payment.status)}</td>
                        <td>
                          {payment.status === 'paid' ? (
                            <>
                              <div><small>Date: {formatDate(payment.paidDate)}</small></div>
                              <div><small>Method: {payment.paymentMethod}</small></div>
                              <div><small className="text-muted">ID: {payment.transactionId}</small></div>
                            </>
                          ) : (
                            <span className="text-muted">Not paid yet</span>
                          )}
                        </td>
                        <td>
                          {(payment.status === 'pending' || payment.status === 'overdue') && (
                            <Button 
                              variant={payment.status === 'overdue' ? "danger" : "warning"} 
                              size="sm"
                              disabled={processingId === payment._id}
                              onClick={() => handleSendReminder(payment._id, payment.tenantEmail)}
                            >
                              {processingId === payment._id ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <><i className="bi bi-envelope me-1"></i> Send Reminder</>
                              )}
                            </Button>
                          )}
                          {payment.status === 'paid' && (
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => alert(`Viewing receipt for payment ${payment._id}`)}
                            >
                              <i className="bi bi-file-earmark-text me-1"></i> View Receipt
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={fetchPayments} disabled={loading}>
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentManagementModal;
