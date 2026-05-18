const nodemailer = require("nodemailer")

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Email templates
const getAdminOrderNotificationTemplate = (order) => {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <img src="${item.image || "https://via.placeholder.com/50"}" 
             alt="${item.name}" 
             style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">PKR ${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">PKR ${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `,
    )
    .join("")

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order Notification</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #8B7355 0%, #A0916B 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">🛍️ New Order Received!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Order #${order.orderNumber}</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #8B7355; margin: 0 0 15px 0; font-size: 20px;">📋 Order Details</h2>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Status:</strong> <span style="background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${order.status.toUpperCase()}</span></p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #8B7355; margin: 0 0 15px 0; font-size: 20px;">👤 Customer Information</h2>
          <p><strong>Name:</strong> ${order.shippingAddress.fullName}</p>
          <p><strong>Email:</strong> ${order.shippingAddress.email}</p>
          <p><strong>Phone:</strong> ${order.shippingAddress.phone}</p>
          <p><strong>Address:</strong> ${order.shippingAddress.address}, ${order.shippingAddress.city}</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="color: #8B7355; margin: 0 0 15px 0; font-size: 20px;">📦 Order Items</h2>
          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background: #8B7355; color: white;">
                <th style="padding: 12px; text-align: left;">Image</th>
                <th style="padding: 12px; text-align: left;">Product</th>
                <th style="padding: 12px; text-align: center;">Qty</th>
                <th style="padding: 12px; text-align: right;">Price</th>
                <th style="padding: 12px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #2e7d32; margin: 0 0 15px 0; font-size: 20px;">💰 Order Summary</h2>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>Subtotal:</span>
            <span>PKR ${order.totalAmount.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>Shipping:</span>
            <span>PKR ${order.shippingCost || 0}</span>
          </div>
          <hr style="margin: 15px 0; border: none; border-top: 2px solid #2e7d32;">
          <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #2e7d32;">
            <span>Total:</span>
            <span>PKR ${(order.totalAmount + (order.shippingCost || 0)).toFixed(2)}</span>
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/admin/orders" 
             style="background: #8B7355; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            🔗 View in Admin Panel
          </a>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
          <p>This is an automated notification from your Nazmer Brand e-commerce system.</p>
          <p>Please log in to your admin panel to process this order.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

const getCustomerStatusUpdateTemplate = (order, newStatus) => {
  const statusMessages = {
    pending: {
      title: "Order Confirmed! 🎉",
      message: "Thank you for your order! We've received your order and it's being processed.",
      color: "#2196F3",
      icon: "✅",
    },
    processing: {
      title: "Order Being Prepared 📦",
      message: "Great news! Your order is now being prepared by our team.",
      color: "#FF9800",
      icon: "🔄",
    },
    shipped: {
      title: "Order Shipped! 🚚",
      message: "Your order is on its way! You should receive it within 2-3 business days.",
      color: "#4CAF50",
      icon: "🚚",
    },
    delivered: {
      title: "Order Delivered! 🎊",
      message: "Your order has been successfully delivered! We hope you love your purchase.",
      color: "#4CAF50",
      icon: "✅",
    },
    cancelled: {
      title: "Order Cancelled ❌",
      message: "Your order has been cancelled. If you have any questions, please contact our support team.",
      color: "#F44336",
      icon: "❌",
    },
    refunded: {
      title: "Refund Processed 💰",
      message: "Your refund has been processed and should appear in your account within 3-5 business days.",
      color: "#9C27B0",
      icon: "💰",
    },
  }

  const statusInfo = statusMessages[newStatus] || statusMessages.pending

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Status Update</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, ${statusInfo.color} 0%, ${statusInfo.color}dd 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">${statusInfo.icon} ${statusInfo.title}</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Order #${order.orderNumber}</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
          <p style="font-size: 16px; margin: 0; color: #555;">${statusInfo.message}</p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #8B7355; margin: 0 0 15px 0; font-size: 20px;">📋 Order Details</h2>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Status:</strong> <span style="background: ${statusInfo.color}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${newStatus.toUpperCase()}</span></p>
          <p><strong>Total Amount:</strong> PKR ${order.totalAmount.toFixed(2)}</p>
        </div>

        ${newStatus === "shipped"
      ? `
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #2e7d32; margin: 0 0 15px 0; font-size: 20px;">🚚 Shipping Information</h2>
          <p><strong>Estimated Delivery:</strong> 2-3 business days</p>
          <p><strong>Shipping Address:</strong><br>
             ${order.shippingAddress.fullName}<br>
             ${order.shippingAddress.address}<br>
             ${order.shippingAddress.city}</p>
        </div>
        `
      : ""
    }

        ${newStatus === "delivered"
      ? `
        <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
          <h2 style="color: #f57c00; margin: 0 0 15px 0; font-size: 20px;">⭐ How was your experience?</h2>
          <p>We'd love to hear about your experience with Nazmer Brand!</p>
          <p style="margin-top: 15px;">
            <a href="mailto:nazmerbrand@gmail.com?subject=Feedback for Order ${order.orderNumber}" 
               style="background: #f57c00; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Share Feedback
            </a>
          </p>
        </div>
        `
      : ""
    }

        ${newStatus === "cancelled" || newStatus === "refunded"
      ? `
        <div style="background: #ffebee; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #c62828; margin: 0 0 15px 0; font-size: 20px;">📞 Need Help?</h2>
          <p>If you have any questions or concerns, please don't hesitate to contact us:</p>
          <p><strong>Email:</strong> nazmerbrand@gmail.com</p>
          <p><strong>Phone:</strong> +92 XXX XXXXXXX</p>
        </div>
        `
      : ""
    }

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
          <p><strong>Nazmer Brand</strong></p>
          <p>Thank you for choosing us for your fashion needs!</p>
          <p>Follow us on social media for the latest updates and offers.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Send admin notification for new order
const sendAdminOrderNotification = async (order) => {
  try {
    const mailOptions = {
      from: `"Nazmer Brand System" <${process.env.EMAIL_USER}>`,
      to: "nazmerbrand@gmail.com",
      subject: `🛍️ New Order Received - #${order.orderNumber}`,
      html: getAdminOrderNotificationTemplate(order),
    }

    const result = await transporter.sendMail(mailOptions)

    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Error sending admin notification email:", error)
    return { success: false, error: error.message }
  }
}

// Send customer status update notification
const sendCustomerStatusUpdate = async (order, newStatus) => {
  try {
    const mailOptions = {
      from: `"Nazmer Brand" <${process.env.EMAIL_USER}>`,
      to: order.shippingAddress.email,
      subject: `Order Update - #${order.orderNumber} - ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
      html: getCustomerStatusUpdateTemplate(order, newStatus),
    }

    const result = await transporter.sendMail(mailOptions)
   
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Error sending customer status update email:", error)
    return { success: false, error: error.message }
  }
}

// Send welcome email
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const mailOptions = {
      from: `"Nazmer Brand" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Welcome to Nazmer Brand! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8B7355 0%, #A0916B 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to Nazmer Brand! 🎉</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your fashion journey starts here</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #8B7355;">Hello ${userName}!</h2>
            <p>Thank you for joining Nazmer Brand. We're excited to have you as part of our fashion community!</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #8B7355; margin-top: 0;">What's Next?</h3>
              <ul style="color: #555;">
                <li>Explore our latest collection</li>
                <li>Get exclusive member discounts</li>
                <li>Stay updated with new arrivals</li>
                <li>Enjoy fast and secure checkout</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/shop" 
                 style="background: #8B7355; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Start Shopping
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
              <p><strong>Nazmer Brand</strong></p>
              <p>Your trusted fashion destination</p>
            </div>
          </div>
        </div>
      `,
    }

    const result = await transporter.sendMail(mailOptions)

    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Error sending welcome email:", error)
    return { success: false, error: error.message }
  }
}

// Send password reset email
const sendPasswordResetEmail = async (userEmail, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`

    const mailOptions = {
      from: `"Nazmer Brand" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Password Reset Request - Nazmer Brand",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8B7355 0%, #A0916B 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🔐 Password Reset</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Nazmer Brand</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #8B7355;">Reset Your Password</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #8B7355; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;"><strong>Security Note:</strong> This link will expire in 1 hour for your security.</p>
            </div>
            
            <p style="color: #666; font-size: 14px;">If you didn't request this password reset, please ignore this email or contact our support team.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
              <p><strong>Nazmer Brand</strong></p>
              <p>Email: nazmerbrand@gmail.com</p>
            </div>
          </div>
        </div>
      `,
    }

    const result = await transporter.sendMail(mailOptions)
  
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Error sending password reset email:", error)
    return { success: false, error: error.message }
  }
}

module.exports = {
  sendAdminOrderNotification,
  sendCustomerStatusUpdate,
  sendWelcomeEmail,
  sendPasswordResetEmail,
}
