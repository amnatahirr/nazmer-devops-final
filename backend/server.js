const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")
const fs = require("fs")
require("dotenv").config()

const app = express()

// Enhanced CORS configuration
app.use(
  cors({
    origin: [
      "https://nazmer.vercel.app",
      "https://www.nazmer.com",
      "http://localhost:3000",
      "https://hearty-connection-production.up.railway.app",
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Disposition"],
  }),
)

// Middleware
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Static file serving with proper headers
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res, path, stat) => {
      // Set CORS headers for static files
      res.set("Access-Control-Allow-Origin", "*")
      res.set("Access-Control-Allow-Methods", "GET")
      res.set("Access-Control-Allow-Headers", "Content-Type")

      // Set proper content types for images
      if (path.endsWith(".jpg") || path.endsWith(".jpeg")) {
        res.set("Content-Type", "image/jpeg")
      } else if (path.endsWith(".png")) {
        res.set("Content-Type", "image/png")
      } else if (path.endsWith(".gif")) {
        res.set("Content-Type", "image/gif")
      } else if (path.endsWith(".webp")) {
        res.set("Content-Type", "image/webp")
      }

      // Set cache headers
      res.set("Cache-Control", "public, max-age=31536000")
    },
  }),
)

app.use(cors({ origin: "*" }))

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Routes
app.use("/api/auth", require("./routes/auth"))
app.use("/api/users", require("./routes/user"))
app.use("/api/product", require("./routes/product"))
app.use("/api/orders", require("./routes/order"))
app.use("/api/upload", require("./routes/upload"))
app.use("/api/homepage", require("./routes/homepage"))
app.use("/api/categories", require("./routes/category"))

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err)
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Static files served from: ${path.join(__dirname, "uploads")}`)
})
