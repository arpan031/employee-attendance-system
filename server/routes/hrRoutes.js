const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  getDashboard,
  getEmployees,
  getAllAttendance,
  updateEmployeeStatus,
} = require("../controllers/hrController");

const router = express.Router();

router.use(protect);
router.use(authorize("hr"));

router.get(
  "/dashboard",
  getDashboard
);

router.get(
  "/employees",
  getEmployees
);

router.get(
  "/attendance",
  getAllAttendance
);

router.patch(
  "/employees/:id/status",
  updateEmployeeStatus
);

module.exports = router;
