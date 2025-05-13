import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function EditPropertyPage() {
  const { id: propertyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'apartment',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
    },
    price: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    amenities: [],
    yearBuilt: '',
    status: 'available',
  });
  const [images, setImages] = useState([]); // For new images
  const [existingImages, setExistingImages] = useState([]); // For displaying existing images
  const [loading, setLoading] = useState(true); // Start true to load existing data
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await api.get(`/properties/${propertyId}`);
        const property = response.data;
        // Ensure all fields are present, even if empty, to avoid uncontrolled component errors
        setFormData({
          title: property.title || '',
          description: property.description || '',
          type: property.type || 'apartment',
          address: {
            street: property.address?.street || '',
            city: property.address?.city || '',
            state: property.address?.state || '',
            zipCode: property.address?.zipCode || '',
            country: property.address?.country || 'USA',
          },
          price: property.price || '',
          bedrooms: property.bedrooms || '',
          bathrooms: property.bathrooms || '',
          area: property.area || '',
          amenities: property.amenities || [],
          yearBuilt: property.yearBuilt || '',
          status: property.status || 'available',
        });
        setExistingImages(property.images || []);
      } catch (err) {
        setError('Failed to fetch property data. It might not exist or you may not have permission.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId]);

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
  
  const handleRemoveExistingImage = (publicId) => {
    // This is a placeholder. Actual removal needs backend logic to delete from Cloudinary/storage
    // and then update the property's image array.
    // For now, we just filter it from the display.
    setExistingImages(prev => prev.filter(img => img.public_id !== publicId));
    // TODO: Add a way to mark images for deletion on submit if backend supports partial image updates.
    alert('Image removal from server is not fully implemented in this demo. Image will reappear on refresh unless backend handles removal.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitLoading(true);

    const propertyUpdateData = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'address') {
        Object.keys(formData.address).forEach(addrKey => {
          propertyUpdateData.append(`address[${addrKey}]`, formData.address[addrKey]);
        });
      } else if (key === 'amenities') {
        formData.amenities.forEach((amenity, index) => {
          propertyUpdateData.append(`amenities[${index}]`, amenity);
        });
      } else {
        propertyUpdateData.append(key, formData[key]);
      }
    });

    // For image updates, this setup assumes backend replaces all images if new ones are sent.
    // A more sophisticated backend might allow adding/removing specific images.
    images.forEach(image => {
      propertyUpdateData.append('images', image);
    });
    
    // If no new images are uploaded, we might not want to send an empty 'images' field.
    // This depends on how the backend handles image updates (e.g., if empty 'images' clears existing ones).
    // For this example, if new images are selected, they are sent. Otherwise, existing images remain unless backend deletes them.

    try {
      const response = await api.put(`/properties/${propertyId}`, propertyUpdateData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Property updated successfully! Redirecting...');
      setExistingImages(response.data.images || []); // Update displayed images from response
      setImages([]); // Clear new image input
      setTimeout(() => navigate(`/properties/${propertyId}`), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update property. Please check your input.');
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <Container className="text-center mt-5"><Spinner animation="border" /><p>Loading property data...</p></Container>;
  }

  if (error && !formData.title) { // If error and no form data loaded, likely a major issue like not found
    return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;
  }
  
  // Basic check to reinforce ProtectedRoute
  // Add check if property.owner._id === user._id when property data is loaded.
  // For now, relying on API to reject unauthorized edits.
  if (user?.role !== 'owner') {
    return <Navigate to="/" replace />;
  }

  return (
    <Container className="mt-4 mb-5">
      <h2>Edit Property</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit}>
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
                  <Col md={9}><Form.Group controlId="address.street"><Form.Label>Street</Form.Label><Form.Control type="text" name="address.street" value={formData.address.street} onChange={handleChange} required /></Form.Group></Col>
                  <Col md={3}><Form.Group controlId="address.city"><Form.Label>City</Form.Label><Form.Control type="text" name="address.city" value={formData.address.city} onChange={handleChange} required /></Form.Group></Col>
              </Row>
              <Row className="mb-3">
                  <Col md={4}><Form.Group controlId="address.state"><Form.Label>State</Form.Label><Form.Control type="text" name="address.state" value={formData.address.state} onChange={handleChange} required /></Form.Group></Col>
                  <Col md={4}><Form.Group controlId="address.zipCode"><Form.Label>Zip Code</Form.Label><Form.Control type="text" name="address.zipCode" value={formData.address.zipCode} onChange={handleChange} required /></Form.Group></Col>
                  <Col md={4}><Form.Group controlId="address.country"><Form.Label>Country</Form.Label><Form.Control type="text" name="address.country" value={formData.address.country} onChange={handleChange} required /></Form.Group></Col>
              </Row>
              
              <h5>Existing Images</h5>
              {existingImages.length > 0 ? (
                <Row className="mb-3 g-2">
                  {existingImages.map(img => (
                    <Col xs={6} sm={4} md={3} key={img.public_id} className="position-relative">
                      <img src={img.url} alt="Property image" className="img-thumbnail w-100" style={{height: '100px', objectFit: 'cover'}}/>
                      {/* <Button variant="danger" size="sm" className="position-absolute top-0 end-0 m-1" onClick={() => handleRemoveExistingImage(img.public_id)}>&times;</Button> */}
                    </Col>
                  ))}
                </Row>
              ) : <p>No existing images.</p>}

              <Form.Group className="mb-3" controlId="images">
                <Form.Label>Upload New Images (replaces all existing)</Form.Label>
                <Form.Control type="file" multiple onChange={handleImageChange} accept="image/*" />
                <Form.Text className="text-muted">Uploading new images will replace all current images for this property.</Form.Text>
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
                <Col><Form.Group className="mb-3" controlId="bedrooms"><Form.Label>Bedrooms</Form.Label><Form.Control type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} min="0" /></Form.Group></Col>
                <Col><Form.Group className="mb-3" controlId="bathrooms"><Form.Label>Bathrooms</Form.Label><Form.Control type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} min="0" step="0.5"/></Form.Group></Col>
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
                    id={`amenity-edit-${amenity.toLowerCase().replace(/ /g, '-')}`}
                    label={amenity}
                    value={amenity}
                    checked={formData.amenities.includes(amenity)}
                    onChange={handleAmenityChange}
                  />
                ))}
              </Form.Group>

              <Button variant="primary" type="submit" disabled={submitLoading || loading} className="w-100">
                {submitLoading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Saving...</> : 'Save Changes'}
              </Button>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}

export default EditPropertyPage;
