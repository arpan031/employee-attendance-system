const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");

const getToday = () => {
  return new Date()
    .toISOString()
    .split("T")[0];
};

// HR dashboard statistics
const getDashboard = async (req, res) => {
  try {
    const today = getToday();

    const totalEmployees =
      await Employee.countDocuments({
        role: "employee",
        isActive: true,
      });

    const presentToday =
      await Attendance.countDocuments({
        date: today,
        status: "Present",
      });

    const lateToday =
      await Attendance.countDocuments({
        date: today,
        status: "Late",
      });

    const halfDayToday =
      await Attendance.countDocuments({
        date: today,
        status: "Half Day",
      });

    const leaveToday =
      await Attendance.countDocuments({
        date: today,
        status: "Leave",
      });

    const pendingLeaves =
      await Leave.countDocuments({
        status: "Pending",
      });

    const absentToday = Math.max(
      0,
      totalEmployees -
        presentToday -
        lateToday -
        halfDayToday -
        leaveToday
    );

    res.json({
      date: today,

      statistics: {
        totalEmployees,
        presentToday,
        absentToday,
        lateToday,
        halfDayToday,
        leaveToday,
        pendingLeaves,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Unable to load HR dashboard",
    });
  }
};

// Get employees
const getEmployees = async (req, res) => {
  try {
    const employees =
      await Employee.find({
        role: "employee",
      })
        .select("-password")
        .sort({
          createdAt: -1,
        });

    res.json({
      employees,
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Unable to fetch employees",
    });
  }
};

// Get all attendance
const getAllAttendance = async (
  req,
  res
) => {
  try {
    const attendance =
      await Attendance.find()
        .populate(
          "employeeId",
          "name email employeeId department designation"
        )
        .sort({
          date: -1,
          checkIn: -1,
        });

    res.json({
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Unable to fetch attendance",
    });
  }
};

// Activate/deactivate employee
const updateEmployeeStatus = async (
  req,
  res
) => {
  try {
    const employee =
      await Employee.findById(
        req.params.id
      );

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    employee.isActive =
      !employee.isActive;

    await employee.save();

    res.json({
      message: employee.isActive
        ? "Employee activated"
        : "Employee deactivated",
      employee: {
        id: employee._id,
        name: employee.name,
        isActive:
          employee.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Unable to update employee",
    });
  }
};

module.exports = {
  getDashboard,
  getEmployees,
  getAllAttendance,
  updateEmployeeStatus,
};
