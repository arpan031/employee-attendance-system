const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");

const {
  getLocalDateKey,
  getDateRangeForMonth
} = require("../utils/dateUtils");

/* HR Dashboard */

const getDashboard = async (
  req,
  res,
  next
) => {
  try {
    const today =
      getLocalDateKey(new Date());

    const [
      totalEmployees,
      activeEmployees,
      pendingLeaves,
      todayAttendance
    ] = await Promise.all([
      Employee.countDocuments(),

      Employee.countDocuments({
        isActive: true
      }),

      Leave.countDocuments({
        status: "Pending"
      }),

      Attendance.aggregate([
        {
          $match: {
            date: today
          }
        },

        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1
            }
          }
        }
      ])
    ]);

    const attendanceSummary = {
      Present: 0,
      Late: 0,
      "Half Day": 0,
      Leave: 0,
      Absent: 0
    };

    todayAttendance.forEach(
      (item) => {
        attendanceSummary[
          item._id
        ] = item.count;
      }
    );

    return res.status(200).json({
      success: true,
      date: today,

      employees: {
        total: totalEmployees,
        active: activeEmployees
      },

      pendingLeaves,

      attendance:
        attendanceSummary
    });
  } catch (error) {
    next(error);
  }
};

/*  Monthly Analytics */

const getAnalytics = async (
  req,
  res,
  next
) => {
  try {
    const now = new Date();

    const year =
      Number(req.query.year) ||
      Number(
        new Intl.DateTimeFormat(
          "en-US",
          {
            timeZone:
              process.env.APP_TIMEZONE ||
              "Asia/Kolkata",
            year: "numeric"
          }
        ).format(now)
      );

    const month =
      Number(req.query.month) ||
      Number(
        new Intl.DateTimeFormat(
          "en-US",
          {
            timeZone:
              process.env.APP_TIMEZONE ||
              "Asia/Kolkata",
            month: "numeric"
          }
        ).format(now)
      );

    const {
      startDate,
      endDate
    } = getDateRangeForMonth(
      year,
      month
    );

    const analytics =
      await Attendance.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
              $lte: endDate
            }
          }
        },

        {
          $group: {
            _id: {
              date: "$date",
              status: "$status"
            },
            count: {
              $sum: 1
            },
            workingMinutes: {
              $sum: "$workingMinutes"
            },
            overtimeMinutes: {
              $sum: "$overtimeMinutes"
            }
          }
        },

        {
          $sort: {
            "_id.date": 1
          }
        }
      ]);

    const daily = {};

    analytics.forEach((item) => {
      const date =
        item._id.date;

      if (!daily[date]) {
        daily[date] = {
          date,
          Present: 0,
          Late: 0,
          "Half Day": 0,
          Leave: 0,
          Absent: 0,
          workingMinutes: 0,
          overtimeMinutes: 0
        };
      }

      daily[date][
        item._id.status
      ] = item.count;

      daily[date].workingMinutes +=
        item.workingMinutes || 0;

      daily[date].overtimeMinutes +=
        item.overtimeMinutes || 0;
    });

    return res.status(200).json({
      success: true,
      year,
      month,
      analytics: Object.values(
        daily
      )
    });
  } catch (error) {
    next(error);
  }
};

/* HR - Employees */

const getEmployees = async (
  req,
  res,
  next
) => {
  try {
    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 10,
        1
      ),
      100
    );

    const skip =
      (page - 1) * limit;

    const filter = {};

    if (req.query.status === "active") {
      filter.isActive = true;
    }

    if (req.query.status === "inactive") {
      filter.isActive = false;
    }

    if (req.query.search) {
      const search =
        req.query.search.trim();

      if (search) {
        const regex =
          new RegExp(
            search.replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&"
            ),
            "i"
          );

        filter.$or = [
          {
            name: regex
          },
          {
            email: regex
          },
          {
            employeeId: regex
          },
          {
            department: regex
          },
          {
            designation: regex
          }
        ];
      }
    }

    const [
      employees,
      total
    ] = await Promise.all([
      Employee.find(filter)
        .select(
          "-password"
        )
        .sort({
          createdAt: -1
        })
        .skip(skip)
        .limit(limit),

      Employee.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      employees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(
          total / limit
        )
      }
    });
  } catch (error) {
    next(error);
  }
};

/* HR - Attendance */

const getAllAttendance = async (
  req,
  res,
  next
) => {
  try {
    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 10,
        1
      ),
      100
    );

    const skip =
      (page - 1) * limit;

    const filter = {};

    /*
     * Date filter
     */
    if (req.query.date) {
      filter.date =
        req.query.date;
    }

    /*
     * Status filter
     */
    if (req.query.status) {
      filter.status =
        req.query.status;
    }

    /*
     * Employee filter
     */
    if (req.query.employeeId) {
      filter.employeeId =
        req.query.employeeId;
    }

    /*
     * Server-side search
     *
     * This fixes the previous problem
     * where the frontend searched only
     * the current page.
     */
    if (req.query.search) {
      const search =
        req.query.search.trim();

      if (search) {
        const regex =
          new RegExp(
            search.replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&"
            ),
            "i"
          );

        const employees =
          await Employee.find({
            $or: [
              {
                name: regex
              },
              {
                email: regex
              },
              {
                employeeId: regex
              },
              {
                department: regex
              }
            ]
          }).select("_id");

        filter.employeeId = {
          $in: employees.map(
            (employee) =>
              employee._id
          )
        };
      }
    }

    const [
      attendance,
      total
    ] = await Promise.all([
      Attendance.find(filter)
        .populate(
          "employeeId",
          "name employeeId department designation"
        )
        .sort({
          date: -1,
          createdAt: -1
        })
        .skip(skip)
        .limit(limit),

      Attendance.countDocuments(
        filter
      )
    ]);

    return res.status(200).json({
      success: true,
      attendance,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(
          total / limit
        )
      }
    });
  } catch (error) {
    next(error);
  }
};

/* HR - Toggle Employee Status */

const toggleEmployeeStatus = async (
  req,
  res,
  next
) => {
  try {
    const {
      id
    } = req.params;

    if (
      id ===
      req.employee._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot deactivate your own HR account"
      });
    }

    const employee =
      await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message:
          "Employee not found"
      });
    }

    employee.isActive =
      !employee.isActive;

    await employee.save();

    return res.status(200).json({
      success: true,
      message:
        employee.isActive
          ? "Employee activated successfully"
          : "Employee deactivated successfully",

      employee: {
        id: employee._id,
        name: employee.name,
        employeeId:
          employee.employeeId,
        isActive:
          employee.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getAnalytics,
  getEmployees,
  getAllAttendance,
  toggleEmployeeStatus
};