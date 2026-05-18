const mongoose = require("mongoose")

const homepageImageSchema = new mongoose.Schema(
    {
        position: {
            type: String,
            required: true,
            enum: ["left", "right"],
            unique: true,
        },
        imageUrl: {
            type: String,
            required: true,
        },
        altText: {
            type: String,
            required: true,
            default: "Homepage image",
        },
    },
    {
        timestamps: true,
    },
)

module.exports = mongoose.model("HomepageImage", homepageImageSchema)
