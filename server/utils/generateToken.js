const jwt = require("jsonwebtoken");

const generateToken = (employee) => {
  return jwt.sign(
    {
      id: employee._id,
      role: employee.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

module.exports = generateToken;
