// models/Product.js
const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
            maxlength: [100, "Product name cannot exceed 100 characters"],
        },
        price: {
            type: Number,
            required: [true, "Product price is required"],
            min: [0, "Price cannot be negative"],
        },
        originalPrice: {
            type: Number,
            min: [0, "Original price cannot be negative"],
        },
        sku: {
            type: String,
            required: [true, "SKU is required"],
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Product description is required"],
            maxlength: [1000, "Description cannot exceed 1000 characters"],
        },
        images: [
            {
                type: String,
                required: true,
            },
        ],
        sizes: [
            {
                type: String,
                enum: ["XS", "S", "M", "L", "XL", "XXL"],
            },
        ],
        details: {
            material: {
                type: String,
                required: true,
            },
            care: {
                type: String,
                required: true,
            },
            fit: {
                type: String,
                required: true,
            },
            origin: {
                type: String,
                required: true,
            },
        },
        category: {
            type: String,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        stock: {
            type: Number,
            default: 0,
            min: [0, "Stock cannot be negative"],
        },
        isNewArrival: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
)

// Index for better search performance
productSchema.index({ name: "text", description: "text" })
productSchema.index({ category: 1, isActive: 1 })

module.exports = mongoose.model("Product", productSchema)
