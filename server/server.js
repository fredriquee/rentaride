require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");
const { rateLimit } = require("express-rate-limit");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

console.log("🚀 Verifying Payment Gateway Configuration...");
console.log(`✓ KHALTI_SECRET_KEY: ${process.env.KHALTI_SECRET_KEY ? "✅ SET" : "❌ MISSING"}`);
console.log(`✓ KHALTI_PUBLIC_KEY: ${process.env.KHALTI_PUBLIC_KEY ? "✅ SET" : "❌ MISSING"}`);

const app = express();

// Serve uploaded files statically with proper CORS headers BEFORE security middleware
app.use("/uploads", (req, res, next) => {
  // Set permissive CORS headers for image files
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Max-Age", "3600");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Access-Control-Expose-Headers", "*");
  
  // Handle OPTIONS requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
}, express.static("uploads"));

// Security Middleware - skip for /uploads
app.use(helmet({
  skip: (req) => req.path.startsWith("/uploads"),
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS Configuration - More flexible for development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl requests, etc)
    // Allow requests from localhost and production domain
    const allowedOrigins = [
      'localhost',
      '127.0.0.1',
      'mandipdas.com.np',
      'https://mandipdas.com.np'
    ];
    
    if (!origin || allowedOrigins.some(allowed => origin.includes(allowed)) || process.env.CORS_ORIGIN === origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs (increased for development)
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use("/api", limiter);

mongoose.connect(process.env.MONGO_URI, {
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log("MongoDB Connected"))
  .catch(err => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.send("RentaRide API is running");
});

// Routes
const authRoutes = require("./routes/authRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});