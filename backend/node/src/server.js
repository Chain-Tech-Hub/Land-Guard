require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
console.log("Starting LandGuard backend...");
console.log(`Node environment: ${process.env.NODE_ENV || "development"}`);
console.log("Firebase project:", process.env.FIREBASE_PROJECT_ID || "not set");

const { initFirebase } = require("./services/firebase");
console.log("Firebase initialized", initFirebase);

console.log("Setting up Express server...");
const userRoutes = require("./routes/users");

console.log("Importing routes...");
const landRoutes = require("./routes/lands");
const syncRoutes = require("./routes/sync");

const app = express();
console.log("Express server created");
// Security and middleware
console.log("Setting up middleware...");
console.log("Helmet, CORS, JSON parser, Morgan, Rate Limiter");
app.use(helmet());
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

const limiter = rateLimit({ windowMs: 60 * 1000, max: 100 });
app.use(limiter);

// Health
app.get("/health", (req, res) => res.json({ status: "ok", ts: Date.now() }));

// Initialize services
initFirebase();

// Routes
app.use("/api/users", userRoutes);
app.use("/api/lands", landRoutes);
app.use("/api/sync", syncRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 369;
app.listen(PORT, () => {
  console.log(`LandGuard backend listening on port ${PORT}`);
});
