const Leave = require("../models/Leave");
const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");

const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const difference = end - start;

  return Math.floor(
    difference / (1000 * 60 * 60 * 24)
  ) + 1;
};

// Employee applies for leave
const applyLeave = async (req, res) => {
  try {
    const {
      leaveType,
      startDate,
      endDate,
      reason,
    } = req.body;

    if (
      !leaveType ||
      !startDate ||
      !endDate ||
      !reason
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({
        message:
          "End date cannot be before start date",
      });
    }

    const totalDays = calculateDays(
      startDate,
      endDate
    );

    const employee = await Employee.findById(
      req.employee._id
    );

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    if (totalDays > employee.leaveBalance) {
      return res.status(400).json({
        message: "Insufficient leave balance",
      });
    }

    // Prevent overlapping pending/approved leave
    const overlappingLeave = await Leave.findOne({
      employeeId: employee._id,
      status: {
        $in: ["Pending", "Approved"],
      },
      startDate: {
        $lte: end,
      },
      endDate: {
        $gte: start,
      },
    });

    if (overlappingLeave) {
      return res.status(409).json({
        message:
          "You already have leave for part of this period",
      });
    }

    const leave = await Leave.create({
      employeeId: employee._id,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays,
      reason,
    });

    res.status(201).json({
      message: "Leave application submitted",
      leave,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to apply for leave",
    });
  }
};

// Employee views own leaves
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({
      employeeId: req.employee._id,
    }).sort({
      createdAt: -1,
    });

    res.json({
      leaves,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch leaves",
    });
  }
};

// HR views all leaves
const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate(
        "employeeId",
        "name email employeeId department designation"
      )
      .populate(
        "approvedBy",
        "name employeeId"
      )
      .sort({
        createdAt: -1,
      });

    res.json({
      leaves,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to fetch leave requests",
    });
  }
};

// HR approves leave
const approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(
      req.params.id
    );

    if (!leave) {
      return res.status(404).json({
        message: "Leave request not found",
      });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({
        message:
          "Only pending requests can be approved",
      });
    }

    const employee = await Employee.findById(
      leave.employeeId
    );

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    if (employee.leaveBalance < leave.totalDays) {
      return res.status(400).json({
        message:
          "Employee does not have enough leave balance",
      });
    }

    // Deduct leave only when approved
    const updatedEmployee =
  await Employee.findOneAndUpdate(
    {
      _id: leave.employeeId,
      leaveBalance: {
        $gte: leave.totalDays,
      },
    },
    {
      $inc: {
        leaveBalance: -leave.totalDays,
      },
    },
    {
      new: true,
    }
  );

if (!updatedEmployee) {
  return res.status(400).json({
    message:
      "Employee does not have enough leave balance",
  });
}

    leave.status = "Approved";
    leave.approvedBy = req.employee._id;

    await leave.save();

    // Create attendance records for leave dates
    const current = new Date(
      leave.startDate
    );

    const end = new Date(
      leave.endDate
    );

    while (current <= end) {
      const date =
        current.toISOString().split("T")[0];

      await Attendance.findOneAndUpdate(
        {
          employeeId: leave.employeeId,
          date,
        },
        {
          employeeId: leave.employeeId,
          date,
          status: "Leave",
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      current.setDate(
        current.getDate() + 1
      );
    }

    res.json({
      message: "Leave approved successfully",
      leave,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to approve leave",
    });
  }
};

// HR rejects leave
const rejectLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(
      req.params.id
    );

    if (!leave) {
      return res.status(404).json({
        message: "Leave request not found",
      });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({
        message:
          "Only pending requests can be rejected",
      });
    }

    leave.status = "Rejected";
    leave.approvedBy = req.employee._id;

    await leave.save();

    res.json({
      message: "Leave rejected",
      leave,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to reject leave",
    });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  approveLeave,
  rejectLeave,
};
