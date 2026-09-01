const bcrypt = require("bcryptjs");
const Employee = require("../models/Employee");
const generateToken = require("../utils/generateToken");

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      employeeId,
      department,
      designation,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !employeeId ||
      !department ||
      !designation
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingEmployee = await Employee.findOne({
      $or: [
        { email: email.toLowerCase() },
        { employeeId },
      ],
    });

    if (existingEmployee) {
      return res.status(409).json({
        message:
          "Email or employee ID already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    const employee = await Employee.create({
      name,
      email,
      password: hashedPassword,
      employeeId,
      department,
      designation,
    });

    const token = generateToken(employee);

    res.status(201).json({
      message: "Registration successful",

      token,

      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        employeeId: employee.employeeId,
        department: employee.department,
        designation: employee.designation,
        role: employee.role,
        leaveBalance: employee.leaveBalance,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Registration failed",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const employee = await Employee.findOne({
      email: email.toLowerCase(),
    });

    if (!employee || !employee.isActive) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const passwordMatched = await bcrypt.compare(
      password,
      employee.password
    );

    if (!passwordMatched) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = generateToken(employee);

    res.json({
      message: "Login successful",

      token,

      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        employeeId: employee.employeeId,
        department: employee.department,
        designation: employee.designation,
        role: employee.role,
        leaveBalance: employee.leaveBalance,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Login failed",
    });
  }
};

module.exports = {
  register,
  login,
};
