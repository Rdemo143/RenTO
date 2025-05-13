const Property = require('../models/Property');
const User = require('../models/User');

exports.getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user.id });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ msg: 'Error fetching your properties', error });
  }
};

exports.manageTenants = async (req, res) => {
  // Example: return a list of tenants linked to the owner
  try {
    const tenants = await User.find({ role: 'tenant' }); // You can filter based on relation later
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ msg: 'Error retrieving tenants', error });
  }
};
