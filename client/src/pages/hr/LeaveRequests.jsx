
import { useEffect, useState } from "react";
import {
  Check,
  X,
  Search,
} from "lucide-react";

import api from "../../services/api";

const LeaveRequests = () => {
  const [leaves, setLeaves] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("All");

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(null);

  const [error, setError] =
    useState("");

  const loadLeaves = async () => {
    try {
      const response =
        await api.get("/leaves");

      setLeaves(
        response.data.leaves
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load leave requests"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const updateLeave = async (
    id,
    action
  ) => {
    setActionLoading(id);
    setError("");

    try {
      await api.patch(
        `/leaves/${id}/${action}`
      );

      await loadLeaves();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update leave"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const filteredLeaves =
    leaves.filter((leave) => {
      const employee =
        leave.employeeId;

      const value =
        search.toLowerCase();

      const matchesSearch =
        employee?.name
          ?.toLowerCase()
          .includes(value) ||
        employee?.employeeId
          ?.toLowerCase()
          .includes(value) ||
        employee?.department
          ?.toLowerCase()
          .includes(value);

      const matchesStatus =
        status === "All" ||
        leave.status === status;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  const statusClass = (value) =>
    value
      .toLowerCase()
      .replace(" ", "-");

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Leave Requests</h1>
          <p>
            Review and manage employee
            leave applications.
          </p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

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

          <select
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value
              )
            }
          >
            <option value="All">
              All Requests
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="Approved">
              Approved
            </option>

            <option value="Rejected">
              Rejected
            </option>
          </select>
        </div>
      </div>

      <div className="panel">
        {loading ? (
          <div className="empty-state">
            Loading leave requests...
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredLeaves.map(
                  (leave) => (
                    <tr key={leave._id}>
                      <td>
                        <div className="employee-cell">
                          <div className="table-avatar">
                            {leave.employeeId?.name
                              ?.charAt(
                                0
                              )
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {
                                leave
                                  .employeeId
                                  ?.name
                              }
                            </strong>

                            <small>
                              {
                                leave
                                  .employeeId
                                  ?.employeeId
                              }
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        {leave.leaveType}
                      </td>

                      <td>
                        {new Date(
                          leave.startDate
                        ).toLocaleDateString(
                          "en-IN"
                        )}
                        {" - "}
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
                        <div className="reason-cell">
                          {leave.reason}
                        </div>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${statusClass(
                            leave.status
                          )}`}
                        >
                          {leave.status}
                        </span>
                      </td>

                      <td>
                        {leave.status ===
                        "Pending" ? (
                          <div className="action-group">
                            <button
                              className="approve-button"
                              disabled={
                                actionLoading ===
                                leave._id
                              }
                              onClick={() =>
                                updateLeave(
                                  leave._id,
                                  "approve"
                                )
                              }
                            >
                              <Check
                                size={16}
                              />
                              Approve
                            </button>

                            <button
                              className="reject-button"
                              disabled={
                                actionLoading ===
                                leave._id
                              }
                              onClick={() =>
                                updateLeave(
                                  leave._id,
                                  "reject"
                                )
                              }
                            >
                              <X
                                size={16}
                              />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="muted">
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            {!filteredLeaves.length && (
              <div className="empty-state">
                No leave requests found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveRequests;