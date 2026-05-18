const express = require("express")
const HomepageImage = require("../models/HomepageImage")
const { adminAuth } = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/homepage/images
// @desc    Get homepage images (Public)
// @access  Public
router.get("/images", async (req, res) => {
    try {
        const images = await HomepageImage.find({}).sort({ position: 1 })
        res.json(images)
    } catch (error) {
        console.error("Get homepage images error:", error)
        res.status(500).json({ message: "Server error" })
    }
})

// @route   PUT /api/homepage/images
// @desc    Update homepage images with URLs (Admin only)
// @access  Private/Admin
router.put("/images", adminAuth, async (req, res) => {
    try {
        const { leftImage, rightImage } = req.body

        if (!leftImage && !rightImage) {
            return res.status(400).json({ message: "At least one image is required" })
        }

        // Update left image if provided
        if (leftImage) {
            await HomepageImage.findOneAndUpdate(
                { position: "left" },
                {
                    imageUrl: leftImage.imageUrl,
                    altText: leftImage.altText || "Woman in sustainable fashion",
                },
                { upsert: true, new: true },
            )
        }

        // Update right image if provided
        if (rightImage) {
            await HomepageImage.findOneAndUpdate(
                { position: "right" },
                {
                    imageUrl: rightImage.imageUrl,
                    altText: rightImage.altText || "Man in sustainable clothing",
                },
                { upsert: true, new: true },
            )
        }

        res.json({ message: "Homepage images updated successfully" })
    } catch (error) {
        console.error("Update homepage images error:", error)
        res.status(500).json({ message: "Server error" })
    }
})

module.exports = router
