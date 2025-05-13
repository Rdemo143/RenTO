const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth, isOwner } = require('../middleware/auth');
const { propertyValidation, searchValidation } = require('../middleware/validation');
const Property = require('../models/Property');
const { upload } = require('../config/cloudinary');

// Get all properties
router.get('/', async (req, res) => {
  try {
    const properties = await Property.find()
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ message: 'Error fetching properties' });
  }
});

// Get single property
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email phone');
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    res.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ message: 'Error fetching property' });
  }
});

// Create property
router.post('/', auth, isOwner, upload.array('images', 5), async (req, res) => {
  try {
    // Parse JSON strings from FormData
    let propertyData = { ...req.body };
    
    console.log('Received property data:', propertyData);
    
    // Parse nested objects that were stringified
    if (propertyData.address && typeof propertyData.address === 'string') {
      try {
        propertyData.address = JSON.parse(propertyData.address);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid address format' });
      }
    }
    
    if (propertyData.features && typeof propertyData.features === 'string') {
      try {
        propertyData.features = JSON.parse(propertyData.features);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid features format' });
      }
    }
    
    // Handle price field - it might be a string number or a JSON string
    if (propertyData.price) {
      // If we have multiple price fields (from FormData), use the JSON one
      if (Array.isArray(propertyData.price)) {
        console.log('Multiple price values detected:', propertyData.price);
        // Find the one that's a valid JSON object
        for (const priceValue of propertyData.price) {
          try {
            const parsed = JSON.parse(priceValue);
            if (parsed && typeof parsed === 'object' && parsed.amount) {
              propertyData.price = parsed;
              break;
            }
          } catch (e) {
            // Not a JSON string, continue to next value
          }
        }
      } else if (typeof propertyData.price === 'string') {
        try {
          propertyData.price = JSON.parse(propertyData.price);
        } catch (e) {
          // If price is just a number string, convert it to the expected format
          if (!isNaN(propertyData.price)) {
            propertyData.price = {
              amount: Number(propertyData.price),
              currency: 'USD',
              period: 'monthly'
            };
          } else {
            return res.status(400).json({ message: 'Invalid price format' });
          }
        }
      }
    }
    
    if (propertyData.amenities && typeof propertyData.amenities === 'string') {
      try {
        propertyData.amenities = JSON.parse(propertyData.amenities);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid amenities format' });
      }
    }
    
    // Ensure numeric fields are numbers
    if (propertyData.bedrooms) propertyData.bedrooms = Number(propertyData.bedrooms);
    if (propertyData.bathrooms) propertyData.bathrooms = Number(propertyData.bathrooms);
    if (propertyData.area) propertyData.area = Number(propertyData.area);
    
    // Add owner and images
    propertyData.owner = req.user._id;
    propertyData.images = req.files.map(file => ({
      url: file.path,
      public_id: file.filename
    }));

    // Validate required fields
    if (!propertyData.title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!propertyData.description) {
      return res.status(400).json({ message: 'Description is required' });
    }
    if (!propertyData.type) {
      return res.status(400).json({ message: 'Property type is required' });
    }
    if (!propertyData.price || !propertyData.price.amount) {
      return res.status(400).json({ message: 'Price is required' });
    }
    if (!propertyData.address || !propertyData.address.street || !propertyData.address.city) {
      return res.status(400).json({ message: 'Complete address is required' });
    }

    const property = new Property(propertyData);
    await property.save();
    
    res.status(201).json(property);
  } catch (error) {
    console.error('Error creating property:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: Object.values(error.errors).map(e => e.message) });
    }
    res.status(500).json({ message: 'Error creating property' });
  }
});

// Update property
router.put('/:id', auth, isOwner, upload.array('images', 5), propertyValidation, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this property' });
    }

    const updateData = { ...req.body };
    
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => ({
        url: file.path,
        public_id: file.filename
      }));
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('owner', 'name email phone');
    
    res.json(updatedProperty);
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ message: 'Error updating property' });
  }
});

// Delete property
router.delete('/:id', auth, isOwner, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this property' });
    }

    await property.remove();
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ message: 'Error deleting property' });
  }
});

// Search properties
router.get('/search', async (req, res) => {
  try {
    const {
      type,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      location
    } = req.query;

    console.log('Searching properties with params:', req.query);
    
    // Build the query object
    const query = {};

    // Handle property type
    if (type && type !== 'undefined' && type !== 'null') {
      query.type = type;
    }
    
    // Handle price range
    if (minPrice || maxPrice) {
      query['price.amount'] = {};
      if (minPrice && minPrice !== 'undefined' && minPrice !== 'null') {
        query['price.amount'].$gte = Number(minPrice);
      }
      if (maxPrice && maxPrice !== 'undefined' && maxPrice !== 'null') {
        query['price.amount'].$lte = Number(maxPrice);
      }
    }
    
    // Handle bedrooms - we need to search in features.bedrooms
    if (bedrooms && bedrooms !== 'undefined' && bedrooms !== 'null') {
      query['features.bedrooms'] = { $gte: Number(bedrooms) };
    }
    
    // Handle bathrooms - we need to search in features.bathrooms
    if (bathrooms && bathrooms !== 'undefined' && bathrooms !== 'null') {
      query['features.bathrooms'] = { $gte: Number(bathrooms) };
    }
    
    // Handle location search - search across multiple address fields
    if (location && location !== 'undefined' && location !== 'null') {
      query.$or = [
        { 'address.city': { $regex: location, $options: 'i' } },
        { 'address.state': { $regex: location, $options: 'i' } },
        { 'address.street': { $regex: location, $options: 'i' } },
        { 'address.zipCode': { $regex: location, $options: 'i' } },
        { 'address.country': { $regex: location, $options: 'i' } }
      ];
    }
    
    console.log('Final MongoDB query:', JSON.stringify(query));
    
    const properties = await Property.find(query)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${properties.length} matching properties`);
    res.json(properties);
  } catch (error) {
    console.error('Error searching properties:', error);
    res.status(500).json({ message: 'Error searching properties' });
  }
});

module.exports = router;
