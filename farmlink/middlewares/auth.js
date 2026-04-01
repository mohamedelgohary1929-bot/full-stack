const jwt  = require('jsonwebtoken');
const User = require('../../models/User');

/**
 * Verifies the JWT token and attaches the decoded payload to req.user.
 */
exports.auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

/**
 * Restricts access to users with the 'business' role.
 */
exports.isBusiness = (req, res, next) => {
  if (!req.user || req.user.role !== 'business') {
    return res.status(403).json({ message: 'Access denied. Business account required.' });
  }
  next();
};

/**
 * Restricts access to users with the 'farmer' role.
 * Also verifies that the farmer has been approved by an admin.
 */
exports.isFarmer = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'farmer') {
      return res.status(403).json({ message: 'Access denied. Farmer account required.' });
    }

    const user = await User.findById(req.user.id).select('approved');
    if (!user || !user.approved) {
      return res.status(403).json({ message: 'Access denied. Your farmer account is pending approval.' });
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Restricts access to users with the 'admin' role.
 */
exports.isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin account required.' });
  }
  next();
};
