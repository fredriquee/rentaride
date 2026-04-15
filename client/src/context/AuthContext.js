import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const currentRole = localStorage.getItem("currentRole");
    if (token) {
      try {
        const userData = JSON.parse(atob(token.split(".")[1]));
        // Merge currentRole from localStorage
        if (currentRole) {
          userData.currentRole = currentRole;
        }
        setUser(userData);
      } catch (err) {
        console.error("Invalid token");
        localStorage.removeItem("token");
        localStorage.removeItem("currentRole");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post("http://localhost:5000/api/auth/login", {
      email,
      password,
    });
    localStorage.setItem("token", data.token);
    localStorage.setItem("currentRole", data.currentRole);
    setUser(data);
    return data;
  };

  const register = async (name, email, password, phone, role) => {
    const { data } = await axios.post("http://localhost:5000/api/auth/register", {
      name,
      email,
      password,
      phone,
      role,
    });
    localStorage.setItem("token", data.token);
    localStorage.setItem("currentRole", data.currentRole);
    setUser(data);
    return data;
  };

  const switchRole = async (newRole) => {
    const { data } = await axios.put("http://localhost:5000/api/auth/switch-role", {
      newRole,
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    // Save the new currentRole to localStorage
    localStorage.setItem("currentRole", data.currentRole);
    // Update user with new currentRole
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentRole");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
