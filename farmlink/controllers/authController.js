const User   = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

/**
 * POST /api/auth/register
 * Creates a new user account.
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'An account with that email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    res.status(201).json({ message: 'Account created successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Authenticates a user and returns a signed JWT.
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/pending-farmers  (Admin only)
 * Returns a list of farmer accounts awaiting approval.
 */
exports.getPendingFarmers = async (req, res, next) => {
  try {
    const farmers = await User.find({ role: 'farmer', approved: false }).select('-password');
    res.json(farmers);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/auth/:id/approve  (Admin only)
 * Approves a farmer account.
 */
exports.approveFarmer = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Farmer not found.' });
    }

    res.json({ message: 'Farmer approved successfully.', user });
  } catch (error) {
    next(error);
  }
};
