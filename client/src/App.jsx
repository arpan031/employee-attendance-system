import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import {
  AuthProvider,
} from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";

import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";

import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import HRDashboard from "./pages/hr/HRDashboard";

import Attendance from "./pages/employee/Attendance";
import Leave from "./pages/employee/Leave";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route element={<ProtectedRoute />}>
            <Route
              element={
                <DashboardLayout />
              }
            />
              <Route
                path="/dashboard"
                element={
                  <EmployeeDashboard />
                }
              />
              <Route
                path="/attendance"
                element={<Attendance />
                }
              />
            <Route
              path="/leave"
              element={<Leave />
              }
            />
              <Route
                path="/hr"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "hr",
                    ]}
                  />
                }
              >
                <Route
                  index
                  element={
                    <HRDashboard />
                  }
                />
              </Route>
            </Route>
          </Route>

          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
