import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Alert, Spinner, Card } from 'react-bootstrap';
import { useNavigate, Navigate } from 'react-router-dom';
import { createProperty } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function CreatePropertyPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // To ensure only owners can access, though ProtectedRoute handles this

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'apartment', // Default type
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA', // Default country
    },
    price: '',
    bedrooms: '',
    bathrooms: '',
    area: '', // in sqft
    amenities: [],
    yearBuilt: '',
    status: 'available', // Default status
    // images will be handled separately
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAmenityChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData(prev => ({ ...prev, amenities: [...prev.amenities, value] }));
    } else {
      setFormData(prev => ({ ...prev, amenities: prev.amenities.filter(a => a !== value) }));
    }
  };

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    console.log('Form submitted');
    setError('');
    setSuccess('');
    setLoading(true);

    // Verify user is authenticated and has valid data
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('You must be logged in to create a property. Please log in and try again.');
      setLoading(false);
      return;
    }

    // Verify we have user data
    if (!user || !user._id) {
      setError('Your user profile could not be loaded. Please refresh the page or log in again.');
      setLoading(false);
      return;
    }

    try {
      // Validate required fields
      if (!formData.title || formData.title.length < 3) {
        setError('Title is required and must be at least 3 characters');
        setLoading(false);
        return;
      }
      
      if (!formData.description || formData.description.length < 10) {
        setError('Description is required and must be at least 10 characters');
        setLoading(false);
        return;
      }
      
      if (!formData.price || parseInt(formData.price) <= 0) {
        setError('Price is required and must be greater than 0');
        setLoading(false);
        return;
      }
      
      if (!formData.address.street || !formData.address.city || !formData.address.state || !formData.address.zipCode) {
        setError('Complete address is required');
        setLoading(false);
        return;
      }
      
      // Format data according to backend expectations
      const propertyData = new FormData();
      
      // Add basic fields
      propertyData.append('title', formData.title);
      propertyData.append('description', formData.description);
      propertyData.append('type', formData.type);
      propertyData.append('status', formData.status);
      
      // Add address as a JSON string
      propertyData.append('address', JSON.stringify({
        street: formData.address.street,
        city: formData.address.city,
        state: formData.address.state,
        zipCode: formData.address.zipCode,
        country: formData.address.country || 'USA'
      }));
      
      // Add numeric fields - but NOT price since we'll add it as a JSON object
      propertyData.append('bedrooms', parseInt(formData.bedrooms) || 0);
      propertyData.append('bathrooms', parseFloat(formData.bathrooms) || 0);
      propertyData.append('area', parseInt(formData.area) || 0);
      
      // Add year built if provided
      if (formData.yearBuilt) {
        propertyData.append('yearBuilt', parseInt(formData.yearBuilt));
      }
      
      // Add amenities as an array
      if (formData.amenities && formData.amenities.length > 0) {
        propertyData.append('amenities', JSON.stringify(formData.amenities));
      }
      
      // Add features as a JSON string
      const features = {
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseFloat(formData.bathrooms) || 0,
        area: parseInt(formData.area) || 0,
        parking: formData.amenities.includes('Parking'),
        furnished: formData.amenities.includes('Furnished'),
        petsAllowed: formData.amenities.includes('Pet Friendly')
      };
      propertyData.append('features', JSON.stringify(features));
      
      // Add price as a JSON string
      const price = {
        amount: parseInt(formData.price) || 0,
        currency: 'USD',
        period: 'monthly'
      };
      propertyData.append('price', JSON.stringify(price));
      
      // Add images
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          propertyData.append('images', images[i]);
        }
      }
      
      // Add owner information
      propertyData.append('owner', user._id);
      
      console.log('Submitting property data:', propertyData);
      
      try {
        // Create the property
        const response = await createProperty(propertyData);
        console.log('Property creation response:', response);
        
        if (response && response._id) {
          setSuccess('Property listed successfully! Redirecting...');
          setTimeout(() => navigate(`/properties/${response._id}`), 2000);
        } else {
          throw new Error('Failed to create property. Server returned an invalid response.');
        }
      } catch (submitError) {
        console.error('Error in property submission:', submitError);
        throw submitError; // Re-throw to be caught by the outer catch block
      }
    } catch (err) {
      // Handle authentication errors specially
      if (err.message.includes('Authentication failed') || 
          err.message.includes('verify your identity') || 
          err.message.includes('User not found')) {
        setError('Authentication error: Your session may have expired. Please log out and log in again.');
        // Redirect to login after a delay
        setTimeout(() => {
          logout(); // Call the logout function from AuthContext
          navigate('/login', { state: { message: 'Your session expired. Please log in again.' } });
        }, 3000);
      } else {
        setError(err.message || 'Failed to create property. Please check your input.');
      }
      console.error('Error creating property:', err);
    } finally {
      setLoading(false);
    }
  };

  // Basic check to reinforce ProtectedRoute (cosmetic, actual protection is via API and Route)
  if (user?.role !== 'owner') {
    return <Navigate to="/" replace />;
  }

  return (
    <Container className="mt-4">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <h1 className="mb-4">List a New Property</h1>
      
      <Form onSubmit={handleSubmit} encType="multipart/form-data">
        <Row>
          <Col md={8}>
            <Card className="p-4 shadow-sm">
              <Form.Group className="mb-3" controlId="title">
                <Form.Label>Property Title</Form.Label>
                <Form.Control type="text" name="title" value={formData.title} onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-3" controlId="description">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" rows={5} name="description" value={formData.description} onChange={handleChange} required />
              </Form.Group>

              <h5>Address Details</h5>
              <Row className="mb-3">
                <Col md={9}>
                  <Form.Group controlId="address.street">
                    <Form.Label>Street</Form.Label>
                    <Form.Control type="text" name="address.street" value={formData.address.street} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group controlId="address.city">
                    <Form.Label>City</Form.Label>
                    <Form.Control type="text" name="address.city" value={formData.address.city} onChange={handleChange} required />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group controlId="address.state">
                    <Form.Label>State</Form.Label>
                    <Form.Control type="text" name="address.state" value={formData.address.state} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="address.zipCode">
                    <Form.Label>Zip Code</Form.Label>
                    <Form.Control type="text" name="address.zipCode" value={formData.address.zipCode} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                 <Col md={4}>
                  <Form.Group controlId="address.country">
                    <Form.Label>Country</Form.Label>
                    <Form.Control type="text" name="address.country" value={formData.address.country} onChange={handleChange} required />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3" controlId="images">
                <Form.Label>Property Images (select multiple)</Form.Label>
                <Form.Control type="file" multiple onChange={handleImageChange} accept="image/*" />
              </Form.Group>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="p-4 shadow-sm">
              <Form.Group className="mb-3" controlId="price">
                <Form.Label>Price (USD per month)</Form.Label>
                <Form.Control type="number" name="price" value={formData.price} onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-3" controlId="type">
                <Form.Label>Property Type</Form.Label>
                <Form.Select name="type" value={formData.type} onChange={handleChange}>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="studio">Studio</option>
                  <option value="other">Other</option>
                </Form.Select>
              </Form.Group>

              <Row>
                <Col>
                  <Form.Group className="mb-3" controlId="bedrooms">
                    <Form.Label>Bedrooms</Form.Label>
                    <Form.Control type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} min="0" />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3" controlId="bathrooms">
                    <Form.Label>Bathrooms</Form.Label>
                    <Form.Control type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} min="0" step="0.5"/>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3" controlId="area">
                <Form.Label>Area (sq ft)</Form.Label>
                <Form.Control type="number" name="area" value={formData.area} onChange={handleChange} min="0" />
              </Form.Group>

              <Form.Group className="mb-3" controlId="yearBuilt">
                <Form.Label>Year Built</Form.Label>
                <Form.Control type="number" name="yearBuilt" value={formData.yearBuilt} onChange={handleChange} min="1800" max={new Date().getFullYear()} />
              </Form.Group>
              
              <Form.Group className="mb-3" controlId="status">
                <Form.Label>Status</Form.Label>
                <Form.Select name="status" value={formData.status} onChange={handleChange}>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="rented">Rented</option>
                </Form.Select>
              </Form.Group>

              <h5>Amenities</h5>
              <Form.Group className="mb-3">
                {['Parking', 'Balcony', 'Pet Friendly', 'Swimming Pool', 'Gym', 'In-unit Laundry', 'Furnished'].map(amenity => (
                  <Form.Check 
                    key={amenity}
                    type="checkbox" 
                    id={`amenity-${amenity.toLowerCase().replace(/ /g, '-')}`}
                    label={amenity}
                    value={amenity}
                    checked={formData.amenities.includes(amenity)}
                    onChange={handleAmenityChange}
                  />
                ))}
              </Form.Group>

              <Button variant="primary" type="submit" disabled={loading} className="w-100" onClick={(e) => {
                console.log('List Property button clicked');
                // The form's onSubmit will handle the submission
              }}>
                {loading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Listing...</> : 'List Property'}
              </Button>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}

export default CreatePropertyPage;
