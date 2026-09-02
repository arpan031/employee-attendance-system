
import { useEffect, useState } from "react";
import { Search, UserCheck, UserX } from "lucide-react";

import api from "../../services/api";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(null);
  const [error, setError] = useState("");

  const loadEmployees = async () => {
    try {
      const response = await api.get(
        "/hr/employees"
      );

      setEmployees(
        response.data.employees
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load employees"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const toggleStatus = async (id) => {
    setActionLoading(id);
    setError("");

    try {
      await api.patch(
        `/hr/employees/${id}/status`
      );

      await loadEmployees();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update employee"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const filteredEmployees =
    employees.filter((employee) => {
      const value = search.toLowerCase();

      return (
        employee.name
          .toLowerCase()
          .includes(value) ||
        employee.email
          .toLowerCase()
          .includes(value) ||
        employee.employeeId
          .toLowerCase()
          .includes(value) ||
        employee.department
          .toLowerCase()
          .includes(value)
      );
    });

  if (loading) {
    return (
      <div className="empty-state">
        Loading employees...
      </div>
    );
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Employees</h1>
          <p>
            Manage your organization's employees.
          </p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="panel">
        <div className="toolbar">
          <div className="search-box">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <span className="record-count">
            {filteredEmployees.length} employees
          </span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Leave Balance</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.map(
                (employee) => (
                  <tr key={employee._id}>
                    <td>
                      <div className="employee-cell">
                        <div className="table-avatar">
                          {employee.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {employee.name}
                          </strong>

                          <small>
                            {employee.email}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      {employee.employeeId}
                    </td>

                    <td>
                      {employee.department}
                    </td>

                    <td>
                      {employee.designation}
                    </td>

                    <td>
                      {employee.leaveBalance} days
                    </td>

                    <td>
                      <span
                        className={`status-badge ${
                          employee.isActive
                            ? "approved"
                            : "rejected"
                        }`}
                      >
                        {employee.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <button
                        className={
                          employee.isActive
                            ? "table-action danger"
                            : "table-action success"
                        }
                        onClick={() =>
                          toggleStatus(
                            employee._id
                          )
                        }
                        disabled={
                          actionLoading ===
                          employee._id
                        }
                      >
                        {employee.isActive ? (
                          <>
                            <UserX size={16} />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck size={16} />
                            Activate
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          {!filteredEmployees.length && (
            <div className="empty-state">
              No employees found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Employees;