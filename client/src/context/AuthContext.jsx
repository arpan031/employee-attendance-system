import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({
  children,
}) => {
  const [employee, setEmployee] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const storedEmployee =
      localStorage.getItem("employee");

    const token =
      localStorage.getItem("token");

    if (storedEmployee && token) {
      try {
        setEmployee(
          JSON.parse(storedEmployee)
        );
      } catch {
        localStorage.clear();
      }
    }

    setLoading(false);
  }, []);

  const login = async (
    email,
    password
  ) => {
    const response = await api.post(
      "/auth/login",
      {
        email,
        password,
      }
    );

    const {
      token,
      employee,
    } = response.data;

    localStorage.setItem(
      "token",
      token
    );

    localStorage.setItem(
      "employee",
      JSON.stringify(employee)
    );

    setEmployee(employee);

    return employee;
  };

  const register = async (data) => {
    const response = await api.post(
      "/auth/register",
      data
    );

    const {
      token,
      employee,
    } = response.data;

    localStorage.setItem(
      "token",
      token
    );

    localStorage.setItem(
      "employee",
      JSON.stringify(employee)
    );

    setEmployee(employee);

    return employee;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("employee");

    setEmployee(null);

    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        employee,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!employee,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);
