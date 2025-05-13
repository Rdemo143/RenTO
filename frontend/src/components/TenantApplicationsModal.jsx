import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { getTenantApplications, updateApplicationStatus } from '../services/api';

const TenantApplicationsModal = ({ show, onHide, propertyId }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (show && propertyId) {
      fetchApplications();
    }
  }, [show, propertyId]);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      // This would be a real API call in a production app
      // const response = await getTenantApplications(propertyId);
      // setApplications(response.data);
      
      // For demo purposes, we'll use mock data
      setTimeout(() => {
        setApplications([
          {
            _id: '1',
            tenantName: 'John Doe',
            tenantEmail: 'john.doe@example.com',
            tenantPhone: '(555) 123-4567',
            startDate: '2025-06-01',
            endDate: '2026-05-31',
            status: 'pending',
            submittedAt: '2025-05-10T10:30:00Z',
            creditScore: 720,
            income: 65000
          },
          {
            _id: '2',
            tenantName: 'Jane Smith',
            tenantEmail: 'jane.smith@example.com',
            tenantPhone: '(555) 987-6543',
            startDate: '2025-07-01',
            endDate: '2026-06-30',
            status: 'approved',
            submittedAt: '2025-05-08T14:15:00Z',
            creditScore: 750,
            income: 70000
          },
          {
            _id: '3',
            tenantName: 'Robert Johnson',
            tenantEmail: 'robert.j@example.com',
            tenantPhone: '(555) 456-7890',
            startDate: '2025-06-15',
            endDate: '2026-06-14',
            status: 'rejected',
            submittedAt: '2025-05-05T09:45:00Z',
            creditScore: 620,
            income: 55000
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error fetching tenant applications:', err);
      setError('Failed to load tenant applications. Please try again.');
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId, newStatus) => {
    setProcessingId(applicationId);
    setSuccessMessage('');
    try {
      // This would be a real API call in a production app
      // await updateApplicationStatus(applicationId, newStatus);
      
      // For demo purposes, we'll update the local state
      setTimeout(() => {
        setApplications(applications.map(app => 
          app._id === applicationId ? { ...app, status: newStatus } : app
        ));
        setSuccessMessage(`Application status updated to ${newStatus}.`);
        setProcessingId(null);
      }, 800);
    } catch (err) {
      console.error('Error updating application status:', err);
      setError('Failed to update application status. Please try again.');
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved':
        return <Badge bg="success">Approved</Badge>;
      case 'rejected':
        return <Badge bg="danger">Rejected</Badge>;
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <i className="bi bi-people me-2"></i>
          Tenant Applications
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {successMessage && (
          <Alert variant="success" dismissible onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}
        
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <div className="text-center p-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <Alert variant="info">
            No tenant applications found for this property.
          </Alert>
        ) : (
          <div className="table-responsive">
            <Table striped hover className="align-middle">
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Contact</th>
                  <th>Lease Period</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app._id}>
                    <td>
                      <div className="fw-bold">{app.tenantName}</div>
                      <small className="text-muted">Applied: {formatDate(app.submittedAt)}</small>
                    </td>
                    <td>
                      <div>{app.tenantEmail}</div>
                      <div>{app.tenantPhone}</div>
                    </td>
                    <td>
                      {formatDate(app.startDate)} to {formatDate(app.endDate)}
                    </td>
                    <td>
                      {getStatusBadge(app.status)}
                    </td>
                    <td>
                      {app.status === 'pending' && (
                        <div className="d-flex gap-2">
                          <Button 
                            variant="success" 
                            size="sm"
                            disabled={processingId === app._id}
                            onClick={() => handleUpdateStatus(app._id, 'approved')}
                          >
                            {processingId === app._id ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <><i className="bi bi-check-circle me-1"></i> Approve</>
                            )}
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            disabled={processingId === app._id}
                            onClick={() => handleUpdateStatus(app._id, 'rejected')}
                          >
                            {processingId === app._id ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <><i className="bi bi-x-circle me-1"></i> Reject</>
                            )}
                          </Button>
                        </div>
                      )}
                      {app.status !== 'pending' && (
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => alert(`Viewing details for application ${app._id}`)}
                        >
                          <i className="bi bi-eye me-1"></i> View Details
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={fetchApplications} disabled={loading}>
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TenantApplicationsModal;
