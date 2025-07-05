import axios from "axios";
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserAuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL;

export const UserAuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Helper: get user/token from either storage
  const getStoredUser = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    return storedUser && token
      ? { ...JSON.parse(storedUser), token }
      : null;
  };

  // Initialize user and token from either storage
  const [user, setUser] = useState(getStoredUser);

  // Accept both user object and token, and a rememberMe flag
  const loginUser = (userObj, token, rememberMe = false) => {
    if (rememberMe) {
      localStorage.setItem("user", JSON.stringify(userObj));
      localStorage.setItem("token", token);
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
    } else {
      sessionStorage.setItem("user", JSON.stringify(userObj));
      sessionStorage.setItem("token", token);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
    setUser({ ...userObj, token });
    navigate("/cafes");
  };

  // Update user in whichever storage they're in
  const updateUser = (newUserFields) => {
    const updatedUser = { ...user, ...newUserFields };
    if (localStorage.getItem("token")) {
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } else {
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
    }
    setUser(updatedUser);
  };

  // Logout clears both storages
  const logoutUser = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  // Refresh user from backend, update in correct storage
  const refreshUser = async () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedUser = { ...res.data.user, claimedCafes: res.data.user.claimedCafes || [], token };
      if (localStorage.getItem("token")) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
      }
      setUser(updatedUser);
    } catch (err) {
      // Optionally handle error (e.g., logout if unauthorized)
      console.error("Failed to refresh user", err);
    }
  };

  const isAuthenticated = !!user;

  return (
    <UserAuthContext.Provider
      value={{
        user,
        loginUser,
        logoutUser,
        isAuthenticated,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};

export const useAuth = () => useContext(UserAuthContext);
