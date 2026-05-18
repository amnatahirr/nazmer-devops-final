const express = require("express")
const router = express.Router()
const Order = require("../models/Order")
const User = require("../models/User")
const Product = require("../models/Product")
const { auth } = require("../middleware/auth")
const nodemailer = require("nodemailer")
const PDFDocument = require("pdfkit")
const { sendAdminOrderNotification, sendCustomerStatusUpdate } = require("../utils/email")

// Create new order - FIXED: Make auth optional for guest checkout
router.post("/", async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, totalAmount, subtotal, shippingCost, grandTotal } = req.body


    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" })
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required" })
    }

    // Validate shipping address fields
    const requiredAddressFields = ["firstName", "lastName", "email", "phone", "address", "city"]
    for (const field of requiredAddressFields) {
      if (!shippingAddress[field]) {
        return res.status(400).json({ message: `Shipping address ${field} is required` })
      }
    }

    if (!paymentMethod) {
      return res.status(400).json({ message: "Payment method is required" })
    }

    if (!totalAmount && totalAmount !== 0) {
      return res.status(400).json({ message: "Total amount is required" })
    }

    // Validate and get product details for each item
    const orderItems = []
    let calculatedTotal = 0

    for (const item of items) {
      if (!item.productId) {
        return res.status(400).json({ message: "Product ID is required for each item" })
      }

      const product = await Product.findById(item.productId)
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` })
      }

      if (!item.quantity || item.quantity < 1) {
        return res.status(400).json({ message: "Valid quantity is required for each item" })
      }

      const orderItem = {
        productId: product._id,
        name: item.name || product.name,
        price: item.price || product.price,
        originalPrice: item.originalPrice || product.originalPrice,
        quantity: item.quantity,
        size: item.size || "Default",
        image: item.image || (product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg"),
        sku: item.sku || product.sku,
      }

      orderItems.push(orderItem)
      calculatedTotal += (item.price || product.price) * item.quantity
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Create the order - FIXED: Handle both authenticated and guest users
    const orderData = {
      orderNumber,
      items: orderItems,
      shippingAddress: {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        fullName: shippingAddress.fullName || `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        city: shippingAddress.city,
        postal: shippingAddress.postal || "",
      },
      paymentMethod,
      billingAddressSameAsShipping: req.body.billingAddressSameAsShipping !== false,
      subtotal: subtotal || calculatedTotal,
      shippingCost: shippingCost || 0,
      grandTotal: grandTotal || calculatedTotal + (shippingCost || 0),
      totalAmount: totalAmount || calculatedTotal,
      status: "pending",
      paymentStatus: "pending",
    }

    // Add userId only if user is authenticated
    if (req.user && req.user.id) {
      orderData.userId = req.user.id
    }

    const order = new Order(orderData)
    await order.save()

   

    // Send admin notification email (don't wait for it to complete)
    sendAdminOrderNotification(order).catch((error) => {
      console.error("Failed to send admin notification:", error)
    })

    res.status(201).json({
      message: "Order created successfully",
      orderId: order._id,
      orderNumber: order.orderNumber,
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        items: order.items,
        totalAmount: order.totalAmount,
        grandTotal: order.grandTotal,
        status: order.status,
        createdAt: order.createdAt,
      },
    })
  } catch (error) {
    console.error("Error creating order:", error)
    res.status(500).json({
      message: "Error creating order",
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
})

// Get user's orders
router.get("/my-orders", auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    console.error("Error fetching user orders:", error)
    res.status(500).json({ message: "Error fetching orders" })
  }
})

// Get all orders (admin only)
router.get("/", auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id)
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." })
    }

    const orders = await Order.find().populate("userId", "firstName lastName email").sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    console.error("Error fetching all orders:", error)
    res.status(500).json({ message: "Error fetching orders" })
  }
})

// Get single order details
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const order = await Order.findById(id).populate("userId", "firstName lastName email")

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Check if user owns this order or is admin (if authenticated)
    if (req.user) {
      const user = await User.findById(req.user.id)
      const isAdmin = user && user.role === "admin"
      const isOwner = order.userId && order.userId.toString() === req.user.id

      if (!isAdmin && !isOwner) {
        return res.status(403).json({ message: "Access denied" })
      }
    }
    // If no user is authenticated, allow access (for guest orders)

    res.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    res.status(500).json({ message: "Error fetching order" })
  }
})

// Update order status (admin only)
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status, paymentStatus } = req.body
    const orderId = req.params.id

    // Check if user is admin
    const user = await User.findById(req.user.id)
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." })
    }

    const updateData = {}
    if (status) updateData.status = status
    if (paymentStatus) updateData.paymentStatus = paymentStatus
    updateData.updatedAt = new Date()

    const order = await Order.findByIdAndUpdate(orderId, updateData, { new: true }).populate(
      "userId",
      "firstName lastName email",
    )

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

  
    res.json({ message: "Order status updated successfully", order })

    // Send customer notification email if status changed
    if (status) {
      sendCustomerStatusUpdate(order, status).catch((error) => {
        console.error("Failed to send customer notification:", error)
      })
    }
  } catch (error) {
    console.error("Error updating order:", error)
    res.status(500).json({ message: "Error updating order", error: error.message })
  }
})

// Send order confirmation email
router.post("/:id/send-email", auth, async (req, res) => {
  try {
    const orderId = req.params.id

    // Check if user is admin
    const user = await User.findById(req.user.id)
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." })
    }

    const order = await Order.findById(orderId).populate("userId", "firstName lastName email")

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    const customerEmail = order.userId ? order.userId.email : order.shippingAddress.email
    const customerName = order.userId
      ? `${order.userId.firstName} ${order.userId.lastName}`
      : `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    // Email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Order Confirmation</h2>
        <p>Dear ${customerName},</p>
        <p>Thank you for your order! Here are the details:</p>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Details</h3>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
        </div>
        
        <h3>Items Ordered</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f0f0f0;">
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Item</th>
              <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Qty</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item) => `
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">PKR ${item.price.toFixed(2)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Summary</h3>
          <p><strong>Subtotal:</strong> PKR ${order.subtotal.toFixed(2)}</p>
          <p><strong>Shipping:</strong> PKR ${order.shippingCost.toFixed(2)}</p>
          <p style="font-size: 18px; color: #333;"><strong>Total:</strong> PKR ${order.grandTotal.toFixed(2)}</p>
        </div>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Shipping Address</h3>
          <p>
            ${order.shippingAddress.fullName}<br>
            ${order.shippingAddress.address}<br>
            ${order.shippingAddress.city} ${order.shippingAddress.postal}<br>
            Phone: ${order.shippingAddress.phone}
          </p>
        </div>
        
        <p>Thank you for shopping with us!</p>
        <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
      </div>
    `

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: customerEmail,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: emailContent,
    })

    res.json({ message: "Order confirmation email sent successfully" })
  } catch (error) {
    console.error("Error sending email:", error)
    res.status(500).json({ message: "Failed to send email", error: error.message })
  }
})

// Download invoice - CLEAN, MINIMAL, BRAND-NAME ONLY
router.get("/:id/invoice", auth, async (req, res) => {
  try {
    const orderId = req.params.id;

    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const order = await Order.findById(orderId).populate("userId", "firstName lastName email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice-${order.orderNumber}.pdf`);
    doc.pipe(res);

    // ---------- HEADER ----------
    doc.fontSize(20).text("N A Z M E R ", { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(10).text("Official Invoice", { align: "center" });
    doc.moveDown(1);

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    // ---------- INVOICE DETAILS ----------
    doc.moveDown(1);
    doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.text(`Status: ${order.status.toUpperCase()}`);
    doc.text(`Payment Status: ${order.paymentStatus.toUpperCase()}`);

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    // ---------- BILL TO ----------
    const customerName = order.userId
      ? `${order.userId.firstName} ${order.userId.lastName}`
      : `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`;
    doc.moveDown(1);
    doc.fontSize(14).text("Bill To:");
    doc.fontSize(10).text(customerName);
    doc.text(order.shippingAddress.address);
    doc.text(`${order.shippingAddress.city} ${order.shippingAddress.postal}`);
    doc.text(`Phone: ${order.shippingAddress.phone}`);
    doc.text(`Email: ${order.shippingAddress.email}`);

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    // ---------- ORDER ITEMS ----------
    doc.moveDown(1);
    doc.fontSize(12).text("Order Items:");

    const tableTop = doc.y + 5;
    const itemCol = 50;
    const qtyCol = 300;
    const priceCol = 360;
    const totalCol = 460;

    doc.fontSize(10).text("Item", itemCol, tableTop);
    doc.text("Qty", qtyCol, tableTop);
    doc.text("Unit Price", priceCol, tableTop);
    doc.text("Total", totalCol, tableTop);

    doc.moveTo(50, tableTop + 12).lineTo(550, tableTop + 12).stroke();

    let y = tableTop + 20;
    order.items.forEach(item => {
      const totalPrice = item.price * item.quantity;
      doc.text(item.name, itemCol, y, { width: 240 });
      doc.text(item.quantity.toString(), qtyCol, y);
      doc.text(`PKR ${item.price.toFixed(2)}`, priceCol, y, { width: 80, align: "right" });
      doc.text(`PKR ${totalPrice.toFixed(2)}`, totalCol, y, { width: 80, align: "right" });
      y += 20;
    });

    doc.moveDown(1);
    doc.moveTo(50, y).lineTo(550, y).stroke();

    // ---------- SUMMARY ----------
    y += 10;
    doc.fontSize(12).text("Order Summary:", itemCol, y);
    y += 20;
    doc.fontSize(10).text("Subtotal:", priceCol, y, { width: 80, align: "right" });
    doc.text(`PKR ${order.subtotal.toFixed(2)}`, totalCol, y, { width: 80, align: "right" });
    y += 15;
    doc.text("Shipping:", priceCol, y, { width: 80, align: "right" });
    doc.text(`PKR ${order.shippingCost.toFixed(2)}`, totalCol, y, { width: 80, align: "right" });
    y += 15;
    doc.text("Grand Total:", priceCol, y, { width: 80, align: "right" });
    doc.text(`PKR ${order.grandTotal.toFixed(2)}`, totalCol, y, { width: 80, align: "right" });

    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    // ---------- FOOTER ----------
    doc.moveDown(1);
    doc.fontSize(10).text("Thank you for your purchase!", { align: "center" });
    doc.text("For any queries, contact nazmerbrand@gmail.com", { align: "center" });
    doc.text(`Generated on ${new Date().toLocaleString()}`, { align: "center" });

    doc.end();
  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).json({ message: "Failed to generate invoice", error: error.message });
  }
});

// Delete order
router.delete("/:id", auth, async (req, res) => {
  try {
    const orderId = req.params.id

    // Check if user is admin
    const user = await User.findById(req.user.id)
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." })
    }

    const order = await Order.findByIdAndDelete(orderId)

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

  
    res.json({ message: "Order deleted successfully" })
  } catch (error) {
    console.error("Error deleting order:", error)
    res.status(500).json({ message: "Failed to delete order", error: error.message })
  }
})

module.exports = router
