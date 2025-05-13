const Property = require('../models/Property');

exports.createProperty = async (req, res) => {
  const { title, description, price, location } = req.body;
  try {
    const newProperty = new Property({
      title,
      description,
      price,
      location,
      owner: req.user.id,
    });
    await newProperty.save();
    res.status(201).json(newProperty);
  } catch (error) {
    res.status(500).json({ msg: 'Error creating property', error });
  }
};

exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate('owner', 'name email');
    res.json(properties);
  } catch (error) {
    res.status(500).json({ msg: 'Error fetching properties', error });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ msg: 'Property not found' });
    res.json(property);
  } catch (error) {
    res.status(500).json({ msg: 'Error retrieving property', error });
  }
};
