// routes/products.js
const express = require("express")
const { body, validationResult } = require("express-validator")
const Product = require("../models/Product")
const Category = require("../models/Category")
const { auth, adminAuth } = require("../middleware/auth") // Import adminAuth

const router = express.Router()

// Helper function to validate category exists
const validateCategoryExists = async (categoryValue) => {
  const category = await Category.findOne({ value: categoryValue, isActive: true })
  return !!category
}

// @route   GET /api/products
// @desc    Get all active products (Public)
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query

    const query = { isActive: true } // Only fetch active products for public view

    if (category) {
      query.category = category
    }

    if (search) {
      query.$text = { $search: search }
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Product.countDocuments(query)

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Get products error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/products/new-arrivals
// @desc    Get new arrival products (Public)
// @access  Public
router.get("/new-arrivals", async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      isNewArrival: true,
    }).sort({ createdAt: -1 })

    res.json(products)
  } catch (error) {
    console.error("Get new arrivals error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/products/admin-all
// @desc    Get all products (active and inactive) for admin view
// @access  Private/Admin
router.get("/admin-all", adminAuth, async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 })
    res.json(products)
  } catch (error) {
    console.error("Get all products for admin error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   PUT /api/products/new-arrivals/bulk
// @desc    Bulk update new arrivals status (Admin only)
// @access  Private/Admin
router.put("/new-arrivals/bulk", adminAuth, async (req, res) => {
  try {
    const { productIds } = req.body

    if (!Array.isArray(productIds)) {
      return res.status(400).json({ message: "Product IDs must be an array" })
    }

    // First, set all products as not new arrivals
    await Product.updateMany({}, { isNewArrival: false })

    // Then set selected products as new arrivals
    if (productIds.length > 0) {
      await Product.updateMany({ _id: { $in: productIds } }, { isNewArrival: true })
    }

    res.json({ message: "New arrivals updated successfully" })
  } catch (error) {
    console.error("Bulk update new arrivals error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    // For public view, ensure product is active
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json(product)
  } catch (error) {
    console.error("Get product error:", error)
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Product not found" })
    }
    res.status(500).json({ message: "Server error" })
  }
})

// Custom validator for category
const categoryValidator = body("category").custom(async (value) => {
  const categoryExists = await validateCategoryExists(value)
  if (!categoryExists) {
    throw new Error("Invalid category. Category does not exist or is inactive.")
  }
  return true
})

// @route   POST /api/products
// @desc    Create product (Admin only)
// @access  Private/Admin
router.post(
  "/",
  adminAuth,
  [
    // Added adminAuth middleware
    body("name")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Product name must be between 2 and 100 characters"),
    body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    body("originalPrice").optional().isFloat({ min: 0 }).withMessage("Original price must be a positive number"),
    body("sku").trim().isLength({ min: 1 }).withMessage("SKU is required"),
    body("description")
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Description must be between 10 and 1000 characters"),
    body("images").isArray({ min: 1 }).withMessage("At least one image is required"),
    categoryValidator, // Use custom category validator
    body("details.material").trim().isLength({ min: 1 }).withMessage("Material is required"),
    body("details.care").trim().isLength({ min: 1 }).withMessage("Care instructions are required"),
    body("details.fit").trim().isLength({ min: 1 }).withMessage("Fit information is required"),
    body("details.origin").trim().isLength({ min: 1 }).withMessage("Origin is required"),
    body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { name, price, originalPrice, sku, description, images, sizes, details, category, stock } = req.body

      // Check if SKU already exists
      const existingProduct = await Product.findOne({ sku })
      if (existingProduct) {
        return res.status(400).json({
          message: "Product with this SKU already exists",
        })
      }

      const product = new Product({
        name,
        price,
        originalPrice,
        sku,
        description,
        images,
        sizes: sizes || [],
        details,
        category,
        stock: stock || 0,
      })

      await product.save()

      res.status(201).json({
        message: "Product created successfully",
        product,
      })
    } catch (error) {
      console.error("Create product error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// @route   PUT /api/products/:id
// @desc    Update product (Admin only)
// @access  Private/Admin
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    // Validate category if it's being updated
    if (req.body.category) {
      const categoryExists = await validateCategoryExists(req.body.category)
      if (!categoryExists) {
        return res.status(400).json({
          message: "Invalid category. Category does not exist or is inactive.",
        })
      }
    }

    // Check if SKU is being changed and if it already exists
    if (req.body.sku && req.body.sku !== product.sku) {
      const existingProduct = await Product.findOne({
        sku: req.body.sku,
        _id: { $ne: req.params.id },
      })
      if (existingProduct) {
        return res.status(400).json({
          message: "Product with this SKU already exists",
        })
      }
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name: req.body.name,
          description: req.body.description,
          price: req.body.price,
          originalPrice: req.body.originalPrice,
          category: req.body.category,
          sku: req.body.sku,
          stock: req.body.stock,
          isActive: req.body.isActive,
          images: req.body.images,
          sizes: req.body.sizes,
          details: req.body.details,
          isNewArrival: req.body.isNewArrival,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    )

    res.json({
      message: "Product updated successfully",
      product: updatedProduct,
    })
  } catch (error) {
    console.error("Update product error:", error)
    res.status(500).json({
      message: "Server error",
      error: error.message,
    })
  }
})

// @route   DELETE /api/products/:id
// @desc    Delete product (Admin only)
// @access  Private/Admin
router.delete("/:id", adminAuth, async (req, res) => {
  // Added adminAuth middleware
  try {
    // Find and delete the product
    const product = await Product.findByIdAndDelete(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json({ message: "Product permanently deleted successfully" })
  } catch (error) {
    console.error("Delete product error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
