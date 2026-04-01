const Order   = require('../../models/Order');
const Product = require('../../models/Product');

const COMMISSION_RATE = 0.10;

/**
 * POST /api/orders
 * Creates a new order, validates stock availability, and deducts inventory.
 */
exports.createOrder = async (req, res, next) => {
  try {
    const { farmer, products, paymentMethod } = req.body;

    let totalAmount = 0;

    // Validate all products and stock levels before any writes
    const resolvedProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product || !product.isAvailable || product.stockQuantity < item.quantity) {
        return res.status(400).json({
          message: `Product "${item.product}" is unavailable or has insufficient stock.`,
        });
      }
      totalAmount += product.price * item.quantity;
      resolvedProducts.push({ product: item.product, quantity: item.quantity, price: product.price });
    }

    const commission   = totalAmount * COMMISSION_RATE;
    const farmerAmount = totalAmount - commission;

    const order = new Order({
      business: req.user.id,
      farmer,
      products: resolvedProducts,
      totalAmount,
      paymentMethod,
      commission,
      farmerAmount,
      paymentStatus: 'pending',
    });

    await order.save();

    // Deduct stock for each ordered item
    for (const item of resolvedProducts) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: -item.quantity },
      });
    }

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/orders/:id/pay
 * Marks an online order as paid by the business that placed it.
 */
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    if (order.business.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You do not own this order.' });
    }
    if (order.paymentMethod === 'cash') {
      return res.status(400).json({ message: 'Cash orders do not require online payment confirmation.' });
    }

    order.paymentStatus = 'paid';
    await order.save();

    res.json({ message: 'Payment confirmed successfully.', order });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/my-orders
 * Returns all orders placed by the authenticated business.
 */
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ business: req.user.id })
      .populate('farmer', 'name email')
      .populate('products.product', 'name price');

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/farmer-orders
 * Returns all orders assigned to the authenticated farmer.
 */
exports.getFarmerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ farmer: req.user.id })
      .populate('business', 'name email')
      .populate('products.product', 'name price');

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/orders/:id/status
 * Updates the status of an order by the farmer who owns it.
 */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user.id },
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/all  (Admin only)
 * Returns all orders in the system.
 */
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('business', 'name email')
      .populate('farmer',   'name email')
      .populate('products.product', 'name price');

    res.json(orders);
  } catch (error) {
    next(error);
  }
};
