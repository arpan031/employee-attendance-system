const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

const leaveRoutes = require("./routes/leaveRoutes");
const hrRoutes = require("./routes/hrRoutes");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message: "Too many requests",
  },
});

app.use("/api", limiter);

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message:
      "Employee Attendance API is running",
  });
});

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/attendance",
  attendanceRoutes
);

app.use(
  "/api/leaves",
  leaveRoutes
);

app.use(
  "/api/hr",
  hrRoutes
);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.use(
  (error, req, res, next) => {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
);

module.exports = app;
