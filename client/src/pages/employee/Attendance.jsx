import { useEffect, useState } from "react";
import { Clock3, LogIn, LogOut, Timer } from "lucide-react";

import api from "../../services/api";

const Attendance = () => {
  const [attendance, setAttendance] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const loadAttendance = async () => {
    try {
      const [today, records] = await Promise.all([
        api.get("/attendance/today"),
        api.get("/attendance/my"),
      ]);

      setAttendance(today.data.attendance);
      setHistory(records.data.attendance);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load attendance"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const handleCheckIn = async () => {
    setActionLoading(true);
    setError("");

    try {
      await api.post("/attendance/check-in");
      await loadAttendance();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Check-in failed"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setError("");

    try {
      await api.post("/attendance/check-out");
      await loadAttendance();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Check-out failed"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return "--:--";

    return new Date(date).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const formatMinutes = (minutes = 0) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="empty-state">
        Loading attendance...
      </div>
    );
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Attendance</h1>
          <p>
            Manage your daily attendance and
            working hours.
          </p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="attendance-action-card">
        <div>
          <div className="attendance-icon">
            <Clock3 size={28} />
          </div>

          <h2>
            {attendance
              ? "Today's Attendance"
              : "Start Your Workday"}
          </h2>

          <p>
            {new Date().toLocaleDateString(
              "en-IN",
              {
                dateStyle: "full",
              }
            )}
          </p>
        </div>

        <div className="attendance-actions">
          {!attendance?.checkIn && (
            <button
              className="attendance-button check-in"
              onClick={handleCheckIn}
              disabled={actionLoading}
            >
              <LogIn size={20} />
              {actionLoading
                ? "Processing..."
                : "Check In"}
            </button>
          )}

          {attendance?.checkIn &&
            !attendance?.checkOut && (
              <button
                className="attendance-button check-out"
                onClick={handleCheckOut}
                disabled={actionLoading}
              >
                <LogOut size={20} />
                {actionLoading
                  ? "Processing..."
                  : "Check Out"}
              </button>
            )}

          {attendance?.checkOut && (
            <div className="completed-message">
              ✓ Attendance completed
            </div>
          )}
        </div>
      </div>

      <div className="attendance-metrics">
        <div className="metric-card">
          <span>Check In</span>
          <strong>
            {formatTime(attendance?.checkIn)}
          </strong>
        </div>

        <div className="metric-card">
          <span>Check Out</span>
          <strong>
            {formatTime(attendance?.checkOut)}
          </strong>
        </div>

        <div className="metric-card">
          <span>Working Hours</span>
          <strong>
            {formatMinutes(
              attendance?.workingMinutes
            )}
          </strong>
        </div>

        <div className="metric-card">
          <span>Overtime</span>
          <strong>
            {formatMinutes(
              attendance?.overtimeMinutes
            )}
          </strong>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Attendance History</h2>
            <p>
              Your complete attendance records
            </p>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Working Hours</th>
                <th>Overtime</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {history.map((item) => (
                <tr key={item._id}>
                  <td>{item.date}</td>

                  <td>
                    {formatTime(item.checkIn)}
                  </td>

                  <td>
                    {formatTime(item.checkOut)}
                  </td>

                  <td>
                    {formatMinutes(
                      item.workingMinutes
                    )}
                  </td>

                  <td>
                    {formatMinutes(
                      item.overtimeMinutes
                    )}
                  </td>

                  <td>
                    <span
                      className={`status-badge ${item.status
                        ?.toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!history.length && (
            <div className="empty-state">
              No attendance records found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
