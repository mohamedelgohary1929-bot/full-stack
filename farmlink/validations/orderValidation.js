const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

exports.validateOrder = [
  body('farmer')
    .notEmpty().withMessage('Farmer ID is required.'),
  body('products')
    .isArray({ min: 1 }).withMessage('Order must contain at least one product.'),
  body('products.*.product')
    .notEmpty().withMessage('Each item must have a valid Product ID.'),
  body('products.*.quantity')
    .isInt({ min: 1 }).withMessage('Each item quantity must be at least 1.'),
  body('paymentMethod')
    .isIn(['online', 'cash']).withMessage('Payment method must be "online" or "cash".'),
  handleValidationErrors,
];
