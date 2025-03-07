// src/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; // For testing

// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  compareAtPrice: {
    type: Number,
    min: 0
  },
  imageUrl: {
    type: String,
    required: true
  },
  images: [String],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  sku: {
    type: String,
    required: true,
    unique: true
  },
  inventory: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  specifications: [{
    name: String,
    value: String
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  freeShipping: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  onSale: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on change
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for checking if in stock
productSchema.virtual('inStock').get(function() {
  return this.inventory > 0;
});

// Method to update inventory
productSchema.methods.updateInventory = async function(quantity) {
  if (this.inventory < quantity) {
    throw new Error('Not enough inventory');
  }
  this.inventory -= quantity;
  return this.save();
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: String,
  imageUrl: String,
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  active: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;

// controllers/productController.js
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

// Get all products with filtering, pagination and sorting
exports.getProducts = asyncHandler(async (req, res) => {
  const { 
    category, 
    brand, 
    minPrice, 
    maxPrice, 
    featured, 
    onSale,
    inStock,
    sort,
    limit = 20,
    page = 1
  } = req.query;
  
  // Build filter object
  const filter = {};
  
  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (featured) filter.featured = featured === 'true';
  if (onSale) filter.onSale = onSale === 'true';
  
  // Price range filter
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  
  // In stock filter
  if (inStock === 'true') filter.inventory = { $gt: 0 };
  
  // Define sort options
  let sortOptions = {};
  switch (sort) {
    case 'price-asc':
      sortOptions = { price: 1 };
      break;
    case 'price-desc':
      sortOptions = { price: -1 };
      break;
    case 'newest':
      sortOptions = { createdAt: -1 };
      break;
    case 'rating':
      sortOptions = { rating: -1 };
      break;
    default:
      sortOptions = { createdAt: -1 };
  }
  
  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);
  
  // Execute query
  const products = await Product.find(filter)
    .sort(sortOptions)
    .limit(Number(limit))
    .skip(skip)
    .populate('category', 'name slug');
  
  // Get total count for pagination info
  const totalProducts = await Product.countDocuments(filter);
  
  res.json({
    products,
    page: Number(page),
    pages: Math.ceil(totalProducts / Number(limit)),
    totalProducts
  });
});

// Get product by ID
exports.getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug');
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  res.json(product);
});

// Create new product
exports.createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    compareAtPrice,
    imageUrl,
    images,
    category,
    brand,
    sku,
    inventory,
    specifications,
    freeShipping,
    featured,
    onSale
  } = req.body;
  
  // Check if SKU already exists
  const existingProduct = await Product.findOne({ sku });
  if (existingProduct) {
    res.status(400);
    throw new Error('Product with this SKU already exists');
  }
  
  const product = await Product.create({
    name,
    description,
    price,
    compareAtPrice,
    imageUrl,
    images: images || [],
    category,
    brand,
    sku,
    inventory,
    specifications: specifications || [],
    freeShipping: freeShipping || false,
    featured: featured || false,
    onSale: onSale || false
  });
  
  res.status(201).json(product);
});

// Update product
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  // Update fields
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );
  
  res.json(updatedProduct);
});

// Delete product
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  await product.remove();
  
  res.json({ message: 'Product removed' });
});

// Get featured products
exports.getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 8;
  const products = await Product.find({ featured: true })
    .limit(limit)
    .populate('category', 'name slug');
  
  res.json(products);
});

// Get on sale products
exports.getOnSaleProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 8;
  const products = await Product.find({ 
    onSale: true,
    compareAtPrice: { $gt: 0 }
  })
    .limit(limit)
    .populate('category', 'name slug');
  
  res.json(products);
});

// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(productController.getProducts)
  .post(protect, admin, productController.createProduct);

router.get('/featured', productController.getFeaturedProducts);
router.get('/on-sale', productController.getOnSaleProducts);

router.route('/:id')
  .get(productController.getProductById)
  .put(protect, admin, productController.updateProduct)
  .delete(protect, admin, productController.deleteProduct);

module.exports = router;
