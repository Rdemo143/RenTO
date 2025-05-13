import React, { useState } from 'react';
import { Container, Form, Button, Alert, Spinner, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createProperty } from '../services/api';

function SimplePropertyForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'apartment',
    price: '',
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted');
    
    // Basic validation
    if (!formData.title || !formData.description || !formData.price || 
        !formData.street || !formData.city || !formData.state || !formData.zipCode) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Create FormData object
      const propertyData = new FormData();
      
      // Add basic fields - don't include price as a simple field
      propertyData.append('title', formData.title);
      propertyData.append('description', formData.description);
      propertyData.append('type', formData.type);
      
      // Add address as a JSON string
      const address = {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: 'USA'
      };
      propertyData.append('address', JSON.stringify(address));
      
      // Add default values for required fields
      propertyData.append('bedrooms', '1');
      propertyData.append('bathrooms', '1');
      propertyData.append('area', '500');
      
      // Add features as a JSON string
      const features = {
        bedrooms: 1,
        bathrooms: 1,
        area: 500,
        parking: false,
        furnished: false,
        petsAllowed: false
      };
      propertyData.append('features', JSON.stringify(features));
      
      // Add price object
      const priceObj = {
        amount: parseInt(formData.price),
        currency: 'USD',
        period: 'monthly'
      };
      propertyData.append('price', JSON.stringify(priceObj));
      
      // Add owner ID
      if (user && user._id) {
        propertyData.append('owner', user._id);
      }
      
      console.log('Submitting property data');
      const response = await createProperty(propertyData);
      
      console.log('Property created:', response);
      setSuccess('Property created successfully!');
      setTimeout(() => navigate('/owner/dashboard'), 2000);
      
    } catch (err) {
      console.error('Error creating property:', err);
      setError(err.message || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container className="mt-4">
      <Card className="p-4 shadow">
        <h2 className="mb-4">Create Simple Property Listing</h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Title*</Form.Label>
            <Form.Control 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              required 
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Description*</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              required 
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Property Type*</Form.Label>
            <Form.Select 
              name="type" 
              value={formData.type} 
              onChange={handleChange}
            >
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
              <option value="studio">Studio</option>
            </Form.Select>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Price (USD/month)*</Form.Label>
            <Form.Control 
              type="number" 
              name="price" 
              value={formData.price} 
              onChange={handleChange} 
              required 
            />
          </Form.Group>
          
          <h4 className="mt-4">Address</h4>
          
          <Form.Group className="mb-3">
            <Form.Label>Street*</Form.Label>
            <Form.Control 
              type="text" 
              name="street" 
              value={formData.street} 
              onChange={handleChange} 
              required 
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>City*</Form.Label>
            <Form.Control 
              type="text" 
              name="city" 
              value={formData.city} 
              onChange={handleChange} 
              required 
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>State*</Form.Label>
            <Form.Control 
              type="text" 
              name="state" 
              value={formData.state} 
              onChange={handleChange} 
              required 
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Zip Code*</Form.Label>
            <Form.Control 
              type="text" 
              name="zipCode" 
              value={formData.zipCode} 
              onChange={handleChange} 
              required 
            />
          </Form.Group>
          
          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading} 
            className="w-100 mt-3"
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> 
                Creating Property...
              </>
            ) : 'Create Property'}
          </Button>
        </Form>
      </Card>
    </Container>
  );
}

export default SimplePropertyForm;
