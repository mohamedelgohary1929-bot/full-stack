const mongoose = require('mongoose');

/**
 * Global Express error-handling middleware.
 * Handles Mongoose errors, known HTTP errors, and unexpected server errors.
 */
const errorHandler = (err, req, res, next) => {
  // Always log the full error server-side for debugging
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err);
  }

  // Mongoose – invalid ObjectId (e.g. /api/products/not-an-id)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid value for field: ${err.path}` });
  }

  // Mongoose – schema validation failed
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Validation error', errors: messages });
  }

  // Mongoose – duplicate key (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ message: `${field} already exists.` });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token has expired.' });
  }

  // Known operational errors (created with err.status or err.statusCode)
  const status = err.status || err.statusCode;
  if (status && status >= 400 && status < 500) {
    return res.status(status).json({ message: err.message });
  }

  // Unhandled / unexpected errors – never leak internals to the client
  res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
};

module.exports = errorHandler;
