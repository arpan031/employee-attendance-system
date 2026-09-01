import {
  LayoutDashboard,
  Clock3,
  CalendarDays,
  Users,
  ClipboardList,
} from "lucide-react";

import {
  NavLink,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const {
    employee,
  } = useAuth();

  const employeeLinks = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Attendance",
      path: "/attendance",
      icon: Clock3,
    },
    {
      name: "Leave",
      path: "/leave",
      icon: CalendarDays,
    },
  ];

  const hrLinks = [
    {
      name: "Dashboard",
      path: "/hr",
      icon: LayoutDashboard,
    },
    {
      name: "Employees",
      path: "/hr/employees",
      icon: Users,
    },
    {
      name: "Attendance",
      path: "/hr/attendance",
      icon: Clock3,
    },
    {
      name: "Leave Requests",
      path: "/hr/leaves",
      icon: ClipboardList,
    },
  ];

  const links =
    employee?.role === "hr"
      ? hrLinks
      : employeeLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          AE
        </div>

        <span>
          AttendEase
        </span>
      </div>

      <nav>
        {links.map((link) => {
          const Icon =
            link.icon;

          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `nav-item ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >
              <Icon size={20} />

              <span>
                {link.name}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
