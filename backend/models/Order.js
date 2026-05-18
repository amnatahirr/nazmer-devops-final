const mongoose = require("mongoose")

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: Number,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: {
    type: String,
  },
  size: {
    type: String,
  },
  sku: {
    type: String,
  },
})

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // Made optional to support guest checkout
      required: false,
    },
    items: [orderItemSchema],
    shippingAddress: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postal: { type: String, default: "" },
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "card"], // Cash on Delivery, Card
      required: true,
    },
    billingAddressSameAsShipping: {
      type: Boolean,
      default: true,
    },

    subtotal: {
      type: Number,
      required: true,
    },
    shippingCost: {
      type: Number,
      required: true,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  },
)

module.exports = mongoose.model("Order", orderSchema)
