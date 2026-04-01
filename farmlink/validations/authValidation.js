const { body, validationResult } = require('express-validator');

// Reusable middleware that checks for validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * Validates registration input.
 * NOTE: 'admin' is intentionally excluded — admin accounts must be
 * created directly in the database by a system administrator.
 */
exports.validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.'),
  body('email')
    .normalizeEmail()
    .isEmail().withMessage('A valid email address is required.'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/\d/).withMessage('Password must contain at least one number.'),
  body('role')
    .isIn(['farmer', 'business']).withMessage('Role must be either "farmer" or "business".'),
  handleValidationErrors,
];

/**
 * Validates login input.
 */
exports.validateLogin = [
  body('email')
    .normalizeEmail()
    .isEmail().withMessage('A valid email address is required.'),
  body('password')
    .notEmpty().withMessage('Password is required.'),
  handleValidationErrors,
];
