const express           = require('express');
const router            = express.Router();
const productController = require('../controllers/productController');
const { auth, isFarmer } = require('../middlewares/auth');
const { validateProduct } = require('../validations/productValidation');

// Public
router.get('/available', productController.getAvailableProducts);

// Farmer only
router.post('/',    auth, isFarmer, validateProduct, productController.createProduct);
router.get('/my-products', auth, isFarmer, productController.getMyProducts);
router.put('/:id', auth, isFarmer, validateProduct, productController.updateProduct);
router.delete('/:id',  auth, isFarmer, productController.deleteProduct);

module.exports = router;
