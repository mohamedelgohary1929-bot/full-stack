const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

exports.validateProduct = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required.'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required.'),
  body('price')
    .isFloat({ min: 0.01 }).withMessage('Price must be a positive number.'),
  body('stockQuantity')
    .isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer.'),
  handleValidationErrors,
];
