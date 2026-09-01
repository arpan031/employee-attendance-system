const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  checkIn,
  checkOut,
  getTodayAttendance,
  getMyAttendance,
} = require("../controllers/attendanceController");

const router = express.Router();

router.use(protect);

router.post("/check-in", checkIn);
router.post("/check-out", checkOut);

router.get(
  "/today",
  getTodayAttendance
);

router.get(
  "/my",
  getMyAttendance
);

module.exports = router;
