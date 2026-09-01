import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();

  const {
    register,
  } = useAuth();

  const [form, setForm] =
    useState({
      name: "",
      email: "",
      password: "",
      employeeId: "",
      department: "",
      designation: "",
    });

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await register(form);

      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data
          ?.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        <div className="brand">
          <div className="brand-icon">
            AE
          </div>

          <h1>Create Account</h1>

          <p>
            Join AttendEase
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
        >
          <div className="form-row">
            <div className="form-group">
              <label>
                Full Name
              </label>

              <input
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={
                  handleChange
                }
                required
              />
            </div>

            <div className="form-group">
              <label>
                Employee ID
              </label>

              <input
                name="employeeId"
                placeholder="EMP001"
                value={
                  form.employeeId
                }
                onChange={
                  handleChange
                }
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              placeholder="john@company.com"
              value={form.email}
              onChange={
                handleChange
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Minimum 6 characters"
              value={
                form.password
              }
              onChange={
                handleChange
              }
              minLength={6}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                Department
              </label>

              <input
                name="department"
                placeholder="Engineering"
                value={
                  form.department
                }
                onChange={
                  handleChange
                }
                required
              />
            </div>

            <div className="form-group">
              <label>
                Designation
              </label>

              <input
                name="designation"
                placeholder="Software Engineer"
                value={
                  form.designation
                }
                onChange={
                  handleChange
                }
                required
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            className="primary-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
