const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { allowRoles } = require('../middlewares/roleMiddleware');

router.get('/properties', verifyToken, allowRoles('tenant'), tenantController.viewAvailableProperties);
router.post('/contact', verifyToken, allowRoles('tenant'), tenantController.contactOwner);

module.exports = router;
