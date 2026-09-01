const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  approveLeave,
  rejectLeave,
} = require("../controllers/leaveController");

const router = express.Router();

router.use(protect);

// Employee
router.post("/", applyLeave);

router.get(
  "/my",
  getMyLeaves
);

// HR
router.get(
  "/",
  authorize("hr"),
  getAllLeaves
);

router.patch(
  "/:id/approve",
  authorize("hr"),
  approveLeave
);

router.patch(
  "/:id/reject",
  authorize("hr"),
  rejectLeave
);

module.exports = router;
