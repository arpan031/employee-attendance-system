
import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
} from "lucide-react";

import api from "../../services/api";

const AttendanceManagement = () => {
  const [attendance, setAttendance] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [date, setDate] =
    useState("");

  const [status, setStatus] =
    useState("All");

  const [loading, setLoading] =
    useState(true);

  const loadAttendance = async () => {
    setLoading(true);

    try {
      const response =
        await api.get(
          "/hr/attendance"
        );

      setAttendance(
        response.data.attendance
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
    minutes = 0
  ) => {
    const hours = Math.floor(
      minutes / 60
    );

    const mins = minutes % 60;

    return `${hours}h ${mins}m`;
  };

  const filteredAttendance =
    attendance.filter((item) => {
      const employee =
        item.employeeId;

      const searchValue =
        search.toLowerCase();

      const matchesSearch =
        employee?.name
          ?.toLowerCase()
          .includes(searchValue) ||
        employee?.employeeId
          ?.toLowerCase()
          .includes(searchValue) ||
        employee?.department
          ?.toLowerCase()
          .includes(searchValue);

      const matchesDate =
        !date ||
        item.date === date;

      const matchesStatus =
        status === "All" ||
        item.status === status;

      return (
        matchesSearch &&
        matchesDate &&
        matchesStatus
      );
    });

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>
            Attendance Management
          </h1>

          <p>
            Monitor employee attendance
            and working hours.
          </p>
        </div>

        <button
          className="secondary-button refresh-button"
          onClick={loadAttendance}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="panel">
        <div className="filters">
          <div className="search-box">
            <Search size={18} />

            <input
              placeholder="Search employee..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />
          </div>

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(
                e.target.value
              )
            }
          />

          <select
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value
              )
            }
          >
            <option value="All">
              All Status
            </option>

            <option value="Present">
              Present
            </option>

            <option value="Late">
              Late
            </option>

            <option value="Half Day">
              Half Day
            </option>

            <option value="Leave">
              Leave
            </option>
          </select>
        </div>
      </div>

      <div className="panel">
        {loading ? (
          <div className="empty-state">
            Loading attendance...
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Working Hours</th>
                  <th>Overtime</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredAttendance.map(
                  (item) => (
                    <tr
                      key={item._id}
                    >
                      <td>
                        <div className="employee-cell">
                          <div className="table-avatar">
                            {item.employeeId?.name
                              ?.charAt(
                                0
                              )
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {
                                item
                                  .employeeId
                                  ?.name
                              }
                            </strong>

                            <small>
                              {
                                item
                                  .employeeId
                                  ?.employeeId
                              }
                            </small>
                          </div>
                        </div>
                      </td>

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
                        {formatMinutes(
                          item.overtimeMinutes
                        )}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${item.status
                            ?.toLowerCase()
                            .replace(
                              " ",
                              "-"
                            )}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            {!filteredAttendance.length && (
              <div className="empty-state">
                No attendance records
                match your filters.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceManagement;