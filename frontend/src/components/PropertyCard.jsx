import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// A default image URL if property images are missing
const DEFAULT_IMAGE_URL = 'https://via.placeholder.com/300x200.png?text=No+Image+Available';

// Format price function to handle different price structures
const formatPrice = (price) => {
  // If price is not available
  if (!price) return 'N/A';
  
  // If price is an object with amount property (matches our backend model)
  if (typeof price === 'object' && price.amount) {
    const amount = price.amount.toLocaleString();
    const currency = price.currency || 'USD';
    const period = price.period || 'monthly';
    
    const currencySymbol = currency === 'USD' ? '$' : 
                          currency === 'EUR' ? '€' : 
                          currency === 'GBP' ? '£' : 
                          `${currency} `;
    
    return `${currencySymbol}${amount} / ${period === 'monthly' ? 'month' : 'year'}`;
  }
  
  // If price is a number (fallback)
  if (typeof price === 'number') {
    return `$${price.toLocaleString()} / month`;
  }
  
  // If price is somehow a string or other type
  return `${price} / month`;
};

function PropertyCard({ property }) {
  if (!property) {
    return null; // Or some placeholder for loading/error
  }

  const { _id, title, address, price, type, features } = property;
  
  // Extract property details, safely handling nested objects
  const { bedrooms, bathrooms, area } = features || {};
  
  // Use the first image or a default if no images are available
  const images = property.images || [];
  const imageUrl = images.length > 0 ? images[0].url : DEFAULT_IMAGE_URL;

  return (
    <Card className="h-100 shadow-sm property-card">
      <Card.Img 
        variant="top" 
        src={imageUrl} 
        alt={title || 'Property image'} 
        style={{ height: '200px', objectFit: 'cover' }} 
      />
      <Card.Body className="d-flex flex-column">
        <Card.Title as="h5" className="text-truncate">{title || 'N/A'}</Card.Title>
        <Card.Text as="div">
          <p className="text-muted text-truncate mb-1" style={{fontSize: '0.9rem'}}>
            {address?.street ? `${address.street}, ${address.city || ''}` : 'Address not available'}
          </p>
          <p className="fw-bold mb-1">{formatPrice(price)}</p>
          <small className="text-muted">
            {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'N/A'} &bull; 
            {bedrooms || '0'} Beds &bull; 
            {bathrooms || '0'} Baths &bull;
            {area ? `${area} sqft` : 'N/A'}
          </small>
        </Card.Text>
        <div className="mt-auto pt-2">
            <Button as={Link} to={`/properties/${_id}`} variant="primary" className="w-100">View Details</Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default PropertyCard;
