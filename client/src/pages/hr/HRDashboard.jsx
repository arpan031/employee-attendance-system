import {
  useEffect,
  useState,
} from "react";

import {
  Users,
  UserCheck,
  UserX,
  Clock3,
  CalendarDays,
  ClipboardList,
} from "lucide-react";

import api from "../../services/api";
import StatCard from "../../components/StatCard";

const HRDashboard = () => {
  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadDashboard =
      async () => {
        try {
          const response =
            await api.get(
              "/hr/dashboard"
            );

          setData(
            response.data
          );
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="empty-state">
        Loading dashboard...
      </div>
    );
  }

  const stats =
    data?.statistics || {};

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>
            HR Dashboard
          </h1>

          <p>
            Monitor workforce
            attendance and leave.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Employees"
          value={
            stats.totalEmployees ||
            0
          }
          icon={Users}
          description="Active employees"
        />

        <StatCard
          title="Present Today"
          value={
            stats.presentToday ||
            0
          }
          icon={UserCheck}
          description="On time"
        />

        <StatCard
          title="Absent Today"
          value={
            stats.absentToday ||
            0
          }
          icon={UserX}
          description="Not recorded"
        />

        <StatCard
          title="Late Today"
          value={
            stats.lateToday ||
            0
          }
          icon={Clock3}
          description="Late arrivals"
        />

        <StatCard
          title="On Leave"
          value={
            stats.leaveToday ||
            0
          }
          icon={CalendarDays}
          description="Today"
        />

        <StatCard
          title="Pending Leaves"
          value={
            stats.pendingLeaves ||
            0
          }
          icon={ClipboardList}
          description="Need approval"
        />
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>
              Today's Overview
            </h2>

            <p>
              Attendance summary for{" "}
              {data?.date}
            </p>
          </div>
        </div>

        <div className="overview-grid">
          <div className="overview-item">
            <span>
              Present
            </span>

            <strong>
              {stats.presentToday ||
                0}
            </strong>
          </div>

          <div className="overview-item">
            <span>
              Absent
            </span>

            <strong>
              {stats.absentToday ||
                0}
            </strong>
          </div>

          <div className="overview-item">
            <span>
              Late
            </span>

            <strong>
              {stats.lateToday ||
                0}
            </strong>
          </div>

          <div className="overview-item">
            <span>
              Leave
            </span>

            <strong>
              {stats.leaveToday ||
                0}
            </strong>
          </div>

          <div className="overview-item">
            <span>
              Half Day
            </span>

            <strong>
              {stats.halfDayToday ||
                0}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
