const Product = require('../../models/Product');

// Fields a farmer is allowed to update on their own product
const ALLOWED_UPDATE_FIELDS = ['name', 'category', 'price', 'stockQuantity', 'image', 'isAvailable'];

/**
 * POST /api/products
 * Creates a new product listing for the authenticated farmer.
 */
exports.createProduct = async (req, res, next) => {
  try {
    const { name, category, price, stockQuantity, image } = req.body;

    const product = new Product({
      name,
      category,
      price,
      stockQuantity,
      image,
      farmer: req.user.id,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/available
 * Returns all available products with optional filtering by category and price range.
 */
exports.getAvailableProducts = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice } = req.query;
    const filter = { isAvailable: true };

    if (category) filter.category = category;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/my-products
 * Returns all products belonging to the authenticated farmer.
 */
exports.getMyProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ farmer: req.user.id });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/products/:id
 * Updates a product owned by the authenticated farmer.
 * Only whitelisted fields can be changed to prevent field injection.
 */
exports.updateProduct = async (req, res, next) => {
  try {
    // Build a safe update object from only permitted fields
    const updates = {};
    ALLOWED_UPDATE_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user.id },
      updates,
      { new: true, runValidators: true, context: 'query' }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/products/:id
 * Deletes a product owned by the authenticated farmer.
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      farmer: req.user.id,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
