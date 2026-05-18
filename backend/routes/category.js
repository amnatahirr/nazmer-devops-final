const express = require("express")
const router = express.Router()
const Category = require("../models/Category")
const { auth } = require("../middleware/auth")

// Get all active categories (public route)
router.get("/", async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true })
            .sort({ order: 1, name: 1 })
            .select("name value description order")

        res.json(categories)
    } catch (error) {
        console.error("Error fetching categories:", error)
        res.status(500).json({ message: "Server error" })
    }
})

// Get all categories for admin (protected route)
router.get("/admin", auth, async (req, res) => {
    try {
        const categories = await Category.find().sort({ order: 1, name: 1 })

        res.json(categories)
    } catch (error) {
        console.error("Error fetching admin categories:", error)
        res.status(500).json({ message: "Server error" })
    }
})

// Create new category (protected route)
router.post("/", auth, async (req, res) => {
    try {
        const { name, value, description, order } = req.body

        // Check if category already exists
        const existingCategory = await Category.findOne({
            $or: [{ name }, { value }],
        })

        if (existingCategory) {
            return res.status(400).json({
                message: "Category with this name or value already exists",
            })
        }

        const category = new Category({
            name,
            value: value || name.toLowerCase().replace(/\s+/g, "-"),
            description,
            order: order || 0,
        })

        await category.save()
        res.status(201).json(category)
    } catch (error) {
        console.error("Error creating category:", error)
        res.status(500).json({ message: "Server error" })
    }
})

// Update category (protected route)
router.put("/:id", auth, async (req, res) => {
    try {
        const { name, value, description, isActive, order } = req.body

        const category = await Category.findById(req.params.id)
        if (!category) {
            return res.status(404).json({ message: "Category not found" })
        }

        // Check for duplicate name/value (excluding current category)
        if (name || value) {
            const existingCategory = await Category.findOne({
                _id: { $ne: req.params.id },
                $or: [...(name ? [{ name }] : []), ...(value ? [{ value }] : [])],
            })

            if (existingCategory) {
                return res.status(400).json({
                    message: "Category with this name or value already exists",
                })
            }
        }

        // Update fields
        if (name !== undefined) category.name = name
        if (value !== undefined) category.value = value
        if (description !== undefined) category.description = description
        if (isActive !== undefined) category.isActive = isActive
        if (order !== undefined) category.order = order

        await category.save()
        res.json(category)
    } catch (error) {
        console.error("Error updating category:", error)
        res.status(500).json({ message: "Server error" })
    }
})

// Delete category (protected route)
router.delete("/:id", auth, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
        if (!category) {
            return res.status(404).json({ message: "Category not found" })
        }

        await Category.findByIdAndDelete(req.params.id)
        res.json({ message: "Category deleted successfully" })
    } catch (error) {
        console.error("Error deleting category:", error)
        res.status(500).json({ message: "Server error" })
    }
})

module.exports = router
