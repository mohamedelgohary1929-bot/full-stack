const express          = require('express');
const router           = express.Router();
const orderController  = require('../controllers/orderController');
const { auth, isBusiness, isFarmer, isAdmin } = require('../middlewares/auth');
const { validateOrder } = require('../validations/orderValidation');

// Business only
router.post('/',             auth, isBusiness, validateOrder, orderController.createOrder);
router.get('/my-orders',     auth, isBusiness, orderController.getMyOrders);
router.patch('/:id/pay',     auth, isBusiness, orderController.updatePaymentStatus);

// Farmer only
router.get('/farmer-orders', auth, isFarmer, orderController.getFarmerOrders);
router.patch('/:id/status',  auth, isFarmer, orderController.updateOrderStatus);

// Admin only
router.get('/all',           auth, isAdmin, orderController.getAllOrders);

module.exports = router;
