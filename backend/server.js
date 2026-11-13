
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const multer = require("multer");

// Load environment variables before importing application modules.
dotenv.config();

const app = express();

// ======================================
// IMPORT ROUTES
// ======================================

const authRoutes = require("./routes/authRoutes");
const demoRoutes = require("./routes/demoRoutes");
const fileRoutes = require("./routes/fileRoutes");
const clientRoutes = require("./routes/clientRoutes");
const checklistRoutes = require("./routes/checklistRoutes");
const accessRoutes = require("./routes/accessRoutes");
const activityRoutes = require("./routes/activityRoutes");

// ======================================
// VERIFY ROUTE EXPORTS
// ======================================

const routes = [
  ["authRoutes", authRoutes],
  ["demoRoutes", demoRoutes],
  ["fileRoutes", fileRoutes],
  ["clientRoutes", clientRoutes],
  ["checklistRoutes", checklistRoutes],
  ["accessRoutes", accessRoutes],
  ["activityRoutes", activityRoutes]
];

for (const [name, route] of routes) {
  if (typeof route !== "function") {
    throw new Error(
      `${name} must export a valid Express router. Check its route file.`
    );
  }
}

// ======================================
// SECURITY MIDDLEWARE
// ======================================

app.use(helmet());

// ======================================
// CORS CONFIGURATION
// ======================================

// Add production and local frontend URLs.
// FRONTEND_URL can contain multiple comma-separated origins.

const configuredOrigins = (
  process.env.FRONTEND_URL ||
  "https://client-locker-liard.vercel.app"
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const allowedOrigins = new Set(configuredOrigins);

// Allow localhost only when explicitly enabled.
if (process.env.ALLOW_LOCAL_FRONTEND === "true") {
  allowedOrigins.add("http://localhost:5173");
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header, such as server-to-server calls.
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/+$/, "");

      if (allowedOrigins.has(normalizedOrigin)) {
        return callback(null, true);
      }

      console.warn("CORS blocked origin:", origin);

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204
  })
);

console.log("Allowed frontend origins:", [...allowedOrigins]);

// ======================================
// REQUEST PARSING
// ======================================

app.use(express.json({ limit: "1mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb"
  })
);

// ======================================
// HEALTH CHECK
// ======================================

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "ClientLocker backend is running",
    database:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Disconnected"
  });
});

// ======================================
// API WELCOME
// ======================================

app.get("/api", (req, res) => {
  return res.status(200).json({
    success: true,
    project: "ClientLocker",
    message: "Welcome to ClientLocker API",
    description: "Secure Client File Management System",
    version: "1.0.0"
  });
});

// ======================================
// AUTHENTICATION ROUTES
// ======================================

app.use("/api/auth", authRoutes);

// ======================================
// DEMO ACCOUNT ROUTES
// ======================================

app.use("/api/demo", demoRoutes);

// ======================================
// CHECKLIST MANAGEMENT ROUTES
// ======================================

app.use("/api", checklistRoutes);

// ======================================
// FILE MANAGEMENT ROUTES
// ======================================

app.use("/api", fileRoutes);

// ======================================
// CLIENT MANAGEMENT ROUTES
// ======================================

app.use("/api", clientRoutes);

// ======================================
// TASK 7: ACCESS MANAGEMENT
// ======================================

app.use("/api", accessRoutes);

// ======================================
// TASK 7: ACTIVITY LOG
// ======================================

app.use("/api", activityRoutes);

// ======================================
// 404 HANDLER
// ======================================

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "API endpoint not found"
  });
});

// ======================================
// CENTRAL ERROR HANDLER
// ======================================

app.use((error, req, res, next) => {
  console.error("API Error:", error);

  if (res.headersSent) {
    return next(error);
  }

  // CORS errors.
  if (error.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "This frontend origin is not allowed."
    });
  }

  // Multer file upload errors.
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        message: "File size cannot exceed 4 MB."
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Only one file can be uploaded at a time."
      });
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected file field. Use the field name 'file'."
      });
    }

    return res.status(400).json({
      success: false,
      message: "File upload failed. Please check the selected file."
    });
  }

  // Other file validation errors.
  if (error.statusCode && error.statusCode < 500) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message
    });
  }

  if (error.status && error.status < 500) {
    return res.status(error.status).json({
      success: false,
      message: error.message
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

// ======================================
// SERVER STARTUP
// ======================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in environment variables");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing in environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Atlas connected successfully");

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log("====================================");
      console.log("CLIENTLOCKER BACKEND STARTED");
      console.log("====================================");
      console.log(`Port: ${PORT}`);
      console.log(`Backend: https://clientlocker-24ef.onrender.com`);
      console.log(`Health: https://clientlocker-24ef.onrender.com/api/health`);
      console.log(`Frontend: https://client-locker-liard.vercel.app`);
      console.log("====================================");
    });

    server.on("error", (error) => {
      console.error("HTTP server error:", error.message);
    });

  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

// Start server only when this file is executed directly.
if (require.main === module) {
  startServer();
}

module.exports = app;
