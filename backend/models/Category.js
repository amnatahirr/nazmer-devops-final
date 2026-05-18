const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        value: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    },
)

// Index for better query performance
categorySchema.index({ isActive: 1, order: 1 })

module.exports = mongoose.model("Category", categorySchema)
