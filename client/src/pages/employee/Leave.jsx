import { useEffect, useState } from "react";
import {
  CalendarDays,
  Plus,
  X,
} from "lucide-react";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const Leave = () => {
  const { employee } = useAuth();

  const [leaves, setLeaves] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    leaveType: "Casual Leave",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadLeaves = async () => {
    try {
      const response = await api.get(
        "/leaves/my"
      );

      setLeaves(response.data.leaves);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load leaves"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await api.post("/leaves", form);

      setSuccess(
        "Leave application submitted successfully."
      );

      setForm({
        leaveType: "Casual Leave",
        startDate: "",
        endDate: "",
        reason: "",
      });

      setShowForm(false);

      await loadLeaves();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to submit leave"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusClass = (status) => {
    return status
      .toLowerCase()
      .replace(" ", "-");
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Leave Management</h1>
          <p>
            Apply for leave and track your requests.
          </p>
        </div>

        <button
          className="primary-small-button"
          onClick={() => {
            setShowForm(true);
            setError("");
            setSuccess("");
          }}
        >
          <Plus size={18} />
          Apply Leave
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      <div className="leave-balance-card">
        <div className="leave-balance-icon">
          <CalendarDays size={26} />
        </div>

        <div>
          <span>Available Leave Balance</span>
          <strong>
            {employee?.leaveBalance ?? 0} days
          </strong>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>Apply for Leave</h2>
                <p>
                  Submit a new leave request
                </p>
              </div>

              <button
                className="close-button"
                onClick={() =>
                  setShowForm(false)
                }
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Leave Type</label>

                <select
                  name="leaveType"
                  value={form.leaveType}
                  onChange={handleChange}
                >
                  <option>
                    Casual Leave
                  </option>
                  <option>
                    Sick Leave
                  </option>
                  <option>
                    Annual Leave
                  </option>
                  <option>
                    Emergency Leave
                  </option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    End Date
                  </label>

                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Reason</label>

                <textarea
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  placeholder="Enter reason for leave..."
                  rows="4"
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setShowForm(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-small-button"
                  disabled={submitting}
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>My Leave Requests</h2>
            <p>
              Track the status of your applications.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading leaves...
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id}>
                    <td>{leave.leaveType}</td>
                    <td>
                      {new Date(
                        leave.startDate
                      ).toLocaleDateString(
                        "en-IN"
                      )}
                    </td>
                    <td>
                      {new Date(
                        leave.endDate
                      ).toLocaleDateString(
                        "en-IN"
                      )}
                    </td>
                    <td>
                      {leave.totalDays}
                    </td>
                    <td>
                      {leave.reason}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          leave.status
                        )}`}
                      >
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!leaves.length && (
              <div className="empty-state">
                You haven't submitted any leave
                requests.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leave;
