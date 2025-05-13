const User = require('../models/User');
const Property = require('../models/Property');

exports.viewAvailableProperties = async (req, res) => {
  try {
    const properties = await Property.find({ status: 'available' });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ msg: 'Error fetching available properties', error });
  }
};

exports.contactOwner = async (req, res) => {
  const { propertyId, message } = req.body;
  try {
    // This would eventually tie into a chat/messaging feature
    // For now, just acknowledge the request
    res.status(200).json({ msg: `Message sent to owner of property ${propertyId}` });
  } catch (error) {
    res.status(500).json({ msg: 'Failed to send message', error });
  }
};
