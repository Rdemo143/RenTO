import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Spinner, Form, Button } from 'react-bootstrap';
import { getAllProperties, searchProperties } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { useLocation, useNavigate } from 'react-router-dom';

// Helper to parse query params
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');

  const navigate = useNavigate();
  const queryParams = useQuery();

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError('');
      try {
        // Construct search params object from state or URL params
        const searchParams = {};
        if (queryParams.get('location') || searchTerm) searchParams.location = queryParams.get('location') || searchTerm;
        if (queryParams.get('type') || propertyType) searchParams.type = queryParams.get('type') || propertyType;
        if (queryParams.get('minPrice') || minPrice) searchParams.minPrice = queryParams.get('minPrice') || minPrice;
        if (queryParams.get('maxPrice') || maxPrice) searchParams.maxPrice = queryParams.get('maxPrice') || maxPrice;
        if (queryParams.get('bedrooms') || bedrooms) searchParams.bedrooms = queryParams.get('bedrooms') || bedrooms;
        
        let data;
        // If we have search params, use searchProperties, otherwise get all properties
        if (Object.keys(searchParams).length > 0) {
          data = await searchProperties(searchParams);
        } else {
          data = await getAllProperties();
        }
        
        setProperties(data);
      } catch (err) {
        setError('Failed to fetch properties. Please try again later.');
        console.error('Error fetching properties:', err);
      }
      setLoading(false);
    };

    fetchProperties();
  }, [location.search]); // Re-fetch when query params change

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.append('location', searchTerm);
    if (propertyType) params.append('type', propertyType);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (bedrooms) params.append('bedrooms', bedrooms);
    navigate(`/properties?${params.toString()}`);
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading properties...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Available Properties</h1>
      
      {/* Search and Filter Form */}
      <Form onSubmit={handleSearchSubmit} className="mb-4 p-3 bg-light rounded">
        <Row className="g-3 align-items-end">
          <Col md={4} sm={6}>
            <Form.Group controlId="searchTerm">
              <Form.Label>Location (e.g., City, Zip)</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Search by location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={2} sm={6}>
            <Form.Group controlId="propertyType">
              <Form.Label>Type</Form.Label>
              <Form.Select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                <option value="">Any Type</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2} sm={4}>
            <Form.Group controlId="minPrice">
              <Form.Label>Min Price</Form.Label>
              <Form.Control type="number" placeholder="Min $" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md={2} sm={4}>
            <Form.Group controlId="maxPrice">
              <Form.Label>Max Price</Form.Label>
              <Form.Control type="number" placeholder="Max $" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md={1} sm={4}>
            <Form.Group controlId="bedrooms">
              <Form.Label>Beds</Form.Label>
              <Form.Select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)}>
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={1} sm={12} className="d-grid">
            <Button variant="primary" type="submit">Search</Button>
          </Col>
        </Row>
      </Form>

      {error && <Alert variant="danger">{error}</Alert>}

      {properties.length === 0 && !loading && (
        <Alert variant="info">No properties found matching your criteria. Try adjusting your search.</Alert>
      )}

      <Row xs={1} md={2} lg={3} xl={4} className="g-4">
        {properties.map((property) => (
          <Col key={property._id}>
            <PropertyCard property={property} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default PropertiesPage;
