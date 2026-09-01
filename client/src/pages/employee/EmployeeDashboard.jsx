import { useEffect, useState } from "react";

import {
  Clock3,
  CalendarCheck,
  CalendarDays,
  Timer,
} from "lucide-react";

import api from "../../services/api";
import StatCard from "../../components/StatCard";
import { useAuth } from "../../context/AuthContext";

const EmployeeDashboard =
  () => {
    const {
      employee,
    } = useAuth();

    const [attendance, setAttendance] =
      useState(null);

    const [
      attendanceHistory,
      setAttendanceHistory,
    ] = useState([]);

    const [
      loading,
      setLoading,
    ] = useState(true);

    const loadAttendance =
      async () => {
        try {
          const [
            todayResponse,
            historyResponse,
          ] = await Promise.all([
            api.get(
              "/attendance/today"
            ),
            api.get(
              "/attendance/my"
            ),
          ]);

          setAttendance(
            todayResponse.data
              .attendance
          );

          setAttendanceHistory(
            historyResponse.data
              .attendance
          );
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

    useEffect(() => {
      loadAttendance();
    }, []);

    const formatMinutes = (
      minutes
    ) => {
      if (!minutes) {
        return "0h 0m";
      }

      const hours =
        Math.floor(
          minutes / 60
        );

      const mins =
        minutes % 60;

      return `${hours}h ${mins}m`;
    };

    const presentCount =
      attendanceHistory.filter(
        (item) =>
          item.status ===
          "Present"
      ).length;

    const lateCount =
      attendanceHistory.filter(
        (item) =>
          item.status === "Late"
      ).length;

    return (
      <div>
        <div className="page-heading">
          <div>
            <h1>
              Employee Dashboard
            </h1>

            <p>
              Track your attendance
              and working hours.
            </p>
          </div>
        </div>

        <div className="stats-grid">
          <StatCard
            title="Present Days"
            value={presentCount}
            icon={CalendarCheck}
            description="Total recorded"
          />

          <StatCard
            title="Late Days"
            value={lateCount}
            icon={Clock3}
            description="This month"
          />

          <StatCard
            title="Leave Balance"
            value={`${employee?.leaveBalance ?? 0} days`}
            icon={CalendarDays}
            description="Available leave"
          />

          <StatCard
            title="Today's Hours"
            value={formatMinutes(
              attendance?.workingMinutes
            )}
            icon={Timer}
            description={
              attendance
                ?.status ||
              "Not checked in"
            }
          />
        </div>

        <div className="dashboard-grid">
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>
                  Today's Attendance
                </h2>

                <p>
                  {new Date().toLocaleDateString(
                    "en-IN",
                    {
                      dateStyle:
                        "full",
                    }
                  )}
                </p>
              </div>

              <span
                className={`status-badge ${
                  attendance?.status
                    ?.toLowerCase()
                    .replace(
                      " ",
                      "-"
                    ) ||
                  "pending"
                }`}
              >
                {attendance?.status ||
                  "Not Started"}
              </span>
            </div>

            {loading ? (
              <div className="empty-state">
                Loading...
              </div>
            ) : (
              <div className="attendance-summary">
                <div>
                  <span>
                    Check In
                  </span>

                  <strong>
                    {attendance?.checkIn
                      ? new Date(
                          attendance.checkIn
                        ).toLocaleTimeString(
                          [],
                          {
                            hour:
                              "2-digit",
                            minute:
                              "2-digit",
                          }
                        )
                      : "--:--"}
                  </strong>
                </div>

                <div>
                  <span>
                    Check Out
                  </span>

                  <strong>
                    {attendance?.checkOut
                      ? new Date(
                          attendance.checkOut
                        ).toLocaleTimeString(
                          [],
                          {
                            hour:
                              "2-digit",
                            minute:
                              "2-digit",
                          }
                        )
                      : "--:--"}
                  </strong>
                </div>

                <div>
                  <span>
                    Working Hours
                  </span>

                  <strong>
                    {formatMinutes(
                      attendance?.workingMinutes
                    )}
                  </strong>
                </div>
              </div>
            )}
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>
                  Employee Information
                </h2>
              </div>
            </div>

            <div className="info-list">
              <div>
                <span>
                  Employee ID
                </span>
                <strong>
                  {employee?.employeeId}
                </strong>
              </div>

              <div>
                <span>
                  Department
                </span>
                <strong>
                  {employee?.department}
                </strong>
              </div>

              <div>
                <span>
                  Designation
                </span>
                <strong>
                  {employee?.designation}
                </strong>
              </div>

              <div>
                <span>Email</span>
                <strong>
                  {employee?.email}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>
                Recent Attendance
              </h2>

              <p>
                Your latest attendance
                records
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
                  <th>Hours</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {attendanceHistory
                  .slice(0, 7)
                  .map((item) => (
                    <tr
                      key={item._id}
                    >
                      <td>
                        {item.date}
                      </td>

                      <td>
                        {item.checkIn
                          ? new Date(
                              item.checkIn
                            ).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute:
                                  "2-digit",
                              }
                            )
                          : "--"}
                      </td>

                      <td>
                        {item.checkOut
                          ? new Date(
                              item.checkOut
                            ).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute:
                                  "2-digit",
                              }
                            )
                          : "--"}
                      </td>

                      <td>
                        {formatMinutes(
                          item.workingMinutes
                        )}
                      </td>

                      <td>
                        <span className="status-badge">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {!attendanceHistory.length && (
              <div className="empty-state">
                No attendance records
                yet.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

export default EmployeeDashboard;
