require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const passport = require("./config/passport");
const connectDB = require("./config/database");
const initializeSocket = require("./config/socket");
const logger = require("./utils/logger");
const path = require("path");

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const walletRoutes = require("./routes/wallet");
const gameRoutes = require("./routes/games");
const betRoutes = require("./routes/bets");
const adminRoutes = require("./routes/admin");

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Initialize Socket.io
const io = initializeSocket(server);

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(",")
      : ["http://localhost:5173"],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Passport middleware
app.use(passport.initialize());

// Serve static files from React build
app.use(express.static(path.join(__dirname, "../client/dist")));

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/wallet", walletRoutes);
app.use("/games", gameRoutes);
app.use("/bets", betRoutes);
app.use("/admin", adminRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "AURA 999+ Betting Platform API",
    version: "1.0.0",
    endpoints: {
      auth: "/auth",
      users: "/users",
      wallet: "/wallet",
      games: "/games",
      bets: "/bets",
      admin: "/admin",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method,
  });
  res.status(500).json({ error: "Something went wrong!" });
});

// Serve React app for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

server.listen(port, () => {
  logger.info(`🚀 AURA 999+ Server running on port ${port}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 Client URL: ${process.env.CLIENT_URL}`);
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close((err) => {
    if (err) {
      logger.error("Error during server shutdown:", err);
      process.exit(1);
    }

    logger.info("Server closed successfully.");

    // Close database connection
    mongoose.connection.close(() => {
      logger.info("Database connection closed.");
      process.exit(0);
    });
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

module.exports = { app, io };
