import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Table } from 'react-bootstrap';
import { Link, Navigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function ManagePropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  useEffect(() => {
    const fetchOwnerProperties = async () => {
      if (!user || user.role !== 'owner') {
        setError('You are not authorized to view this page.');
        setLoading(false);
        return;
      }
      try {
        // Assuming an endpoint like /api/properties/my-properties or filtering on the frontend (less ideal for many properties)
        // For now, let's fetch all and filter, but a dedicated backend endpoint is better.
        // OR, the backend /api/properties could be modified to return only user's properties if user is owner.
        // Let's assume /api/properties/owner/:ownerId or a query param is available.
        // For this example, we use a fictional endpoint or expect the backend to filter /api/properties based on auth.
        // A more robust solution would be a specific endpoint: `/api/properties/my-listings`
        
        // Let's try to fetch all and filter by owner ID for now, as the backend propertyRoutes.js
        // for GET '/' doesn't show specific filtering for owner properties directly, but returns all.
        // This is not ideal for performance with many properties but works for this example.
        // A better backend endpoint would be `/api/properties/user/:userId` or similar.
        
        // Simulating a specific endpoint by just fetching all and then filtering
        // This would ideally be a GET request to `/api/properties?ownerId=${user._id}`
        // Or better, if `/api/properties` automatically filters by owner if the user is an owner.
        // For now, we will fetch all and filter client-side, which is NOT OPTIMAL for production.
        const response = await api.get('/properties'); // This fetches ALL properties
        const userProperties = response.data.filter(p => p.owner?._id === user?._id || p.owner === user?._id);
        setProperties(userProperties);
      } catch (err) {
        setError('Failed to fetch your properties.');
        console.error('Error fetching owner properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerProperties();
  }, [user]);

  const handleDeleteProperty = async (propertyId) => {
    setDeleteError('');
    setDeleteSuccess('');
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/properties/${propertyId}`);
      setProperties(prev => prev.filter(p => p._id !== propertyId));
      setDeleteSuccess('Property deleted successfully.');
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete property.');
      console.error('Error deleting property:', err);
    }
  };

  if (loading) {
    return <Container className="text-center mt-5"><Spinner animation="border" /><p>Loading your properties...</p></Container>;
  }

  if (error) {
    return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;
  }
  
  // Redirect if not an owner (also handled by ProtectedRoute wrapper in App.jsx)
  if (user?.role !== 'owner') {
    return <Navigate to="/" replace />;
  }

  return (
    <Container className="mt-4">
      <Row className="mb-3 align-items-center">
        <Col>
          <h2>Manage Your Properties</h2>
        </Col>
        <Col className="text-end">
          <Button as={Link} to="/owner/properties/new" variant="success">
            <i className="bi bi-plus-circle-fill me-2"></i>Add New Property
          </Button>
        </Col>
      </Row>

      {deleteError && <Alert variant="danger">{deleteError}</Alert>}
      {deleteSuccess && <Alert variant="success">{deleteSuccess}</Alert>}

      {properties.length === 0 ? (
        <Alert variant="info">You have not listed any properties yet. <Link to="/owner/properties/new">Add your first property!</Link></Alert>
      ) : (
        <Card className="shadow-sm">
          <Card.Header>Your Listings</Card.Header>
          <Card.Body>
            <Table responsive striped bordered hover className="align-middle">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map(property => (
                  <tr key={property._id}>
                    <td>
                      <img 
                        src={property.images && property.images.length > 0 ? property.images[0].url : 'https://via.placeholder.com/80x60.png?text=No+Image'} 
                        alt={property.title} 
                        style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    </td>
                    <td><Link to={`/properties/${property._id}`}>{property.title}</Link></td>
                    <td>{property.type ? property.type.charAt(0).toUpperCase() + property.type.slice(1) : 'N/A'}</td>
                    <td>${property.price ? property.price.toLocaleString() : 'N/A'}</td>
                    <td>
                      <span className={`badge bg-${property.status === 'available' ? 'success' : property.status === 'rented' ? 'warning' : 'secondary'}`}>
                        {property.status ? property.status.charAt(0).toUpperCase() + property.status.slice(1) : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <Button as={Link} to={`/owner/edit-property/${property._id}`} variant="outline-primary" size="sm" className="me-2 mb-1 mb-md-0" title="Edit">
                        <i className="bi bi-pencil-square"></i> Edit
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteProperty(property._id)} title="Delete">
                        <i className="bi bi-trash-fill"></i> Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}

export default ManagePropertiesPage;
