const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { allowRoles } = require('../middlewares/roleMiddleware');

router.get('/my-properties', verifyToken, allowRoles('owner'), ownerController.getMyProperties);
router.get('/tenants', verifyToken, allowRoles('owner'), ownerController.manageTenants);

module.exports = router;
