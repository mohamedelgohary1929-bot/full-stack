const express        = require('express');
const router         = express.Router();
const authController = require('../controllers/authController');
const { auth, isAdmin } = require('../middlewares/auth');
const { validateRegister, validateLogin } = require('../validations/authValidation');

// Public
router.post('/register', validateRegister, authController.register);
router.post('/login',    validateLogin,    authController.login);

// Admin only
router.get('/pending-farmers', auth, isAdmin, authController.getPendingFarmers);
router.patch('/:id/approve',   auth, isAdmin, authController.approveFarmer);

module.exports = router;
