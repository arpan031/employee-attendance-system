require("dotenv").config();

const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const Employee = require("../models/Employee");

const seedAdmin = async () => {
  try {
    await connectDB();

    const existingHR =
      await Employee.findOne({
        email: "hr@company.com",
      });

    if (existingHR) {
      console.log(
        "HR account already exists"
      );

      process.exit(0);
    }

    const password =
      await bcrypt.hash(
        "Admin@123",
        12
      );

    await Employee.create({
      name: "HR Admin",
      email: "hr@company.com",
      password,
      employeeId: "HR001",
      department: "Human Resources",
      designation: "HR Manager",
      role: "hr",
      leaveBalance: 30,
    });

    console.log(
      "HR account created successfully"
    );

    console.log(
      "Email: hr@company.com"
    );

    console.log(
      "Password: Admin@123"
    );

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();
