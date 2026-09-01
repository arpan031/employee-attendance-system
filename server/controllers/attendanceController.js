const Attendance = require("../models/Attendance");

const {
  calculateWorkingMinutes,
  calculateStatus,
  calculateOvertime,
} = require("../services/attendanceService");

const getToday = () => {
  const now = new Date();

  return now.toISOString().split("T")[0];
};

const checkIn = async (req, res) => {
  try {
    const employeeId = req.employee._id;
    const date = getToday();

    let attendance = await Attendance.findOne({
      employeeId,
      date,
    });

    if (attendance?.checkIn) {
      return res.status(400).json({
        message: "Already checked in today",
      });
    }

    const now = new Date();

    if (!attendance) {
      attendance = await Attendance.create({
        employeeId,
        date,
        checkIn: now,
        status: calculateStatus(now),
      });
    } else {
      attendance.checkIn = now;
      attendance.status =
        calculateStatus(now);

      await attendance.save();
    }

    res.json({
      message: "Check-in successful",
      attendance,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Check-in failed",
    });
  }
};

const checkOut = async (req, res) => {
  try {
    const employeeId = req.employee._id;
    const date = getToday();

    const attendance = await Attendance.findOne({
      employeeId,
      date,
    });

    if (!attendance) {
      return res.status(400).json({
        message:
          "You must check in before checking out",
      });
    }

    if (!attendance.checkIn) {
      return res.status(400).json({
        message:
          "You must check in before checking out",
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        message: "Already checked out today",
      });
    }

    const now = new Date();

    const workingMinutes =
      calculateWorkingMinutes(
        attendance.checkIn,
        now
      );

    attendance.checkOut = now;
    attendance.workingMinutes =
      workingMinutes;

    attendance.overtimeMinutes =
      calculateOvertime(workingMinutes);

    if (workingMinutes < 240) {
      attendance.status = "Half Day";
    }

    await attendance.save();

    res.json({
      message: "Check-out successful",
      attendance,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Check-out failed",
    });
  }
};

const getTodayAttendance = async (
  req,
  res
) => {
  try {
    const date = getToday();

    const attendance =
      await Attendance.findOne({
        employeeId: req.employee._id,
        date,
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

const getMyAttendance = async (
  req,
  res
) => {
  try {
    const attendance =
      await Attendance.find({
        employeeId: req.employee._id,
      }).sort({
        date: -1,
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

module.exports = {
  checkIn,
  checkOut,
  getTodayAttendance,
  getMyAttendance,
};
