import axios from "axios";
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserAuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL;

export const UserAuthProvider = ({ children }) => {
  const navigate = useNavigate();
const refreshUser = async () => {
  const token = sessionStorage.getItem("token");
  if (!token) return;
  try {
    const res = await axios.get(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    sessionStorage.setItem("user", JSON.stringify(res.data.user));
    setUser({ ...res.data.user,claimedCafes: res.data.user.claimedCafes || [], token });
  } catch (err) {
    // Optionally handle error (e.g., logout if unauthorized)
    console.error("Failed to refresh user", err);
  }
};
 

  // Initialize user and token from sessionStorage
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem("user");
    const token = sessionStorage.getItem("token");
    return storedUser && token
      ? { ...JSON.parse(storedUser), token }
      : null;
  });

  // Accept both user object and token
  const loginUser = (userObj, token) => {
    // userObj should include all user fields, including planPurchased
    sessionStorage.setItem("user", JSON.stringify(userObj));
    sessionStorage.setItem("token", token);
    setUser({ ...userObj, token });
    navigate("/cafes");
  };

  // Update user (e.g., after payment, to set planPurchased: true)
  const updateUser = (newUserFields) => {
    const updatedUser = { ...user, ...newUserFields };
    sessionStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logoutUser = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const isAuthenticated = !!user;

  return (
    <UserAuthContext.Provider
      value={{
        user,
        loginUser,
        logoutUser,
        isAuthenticated,
        updateUser, // expose updateUser for planPurchased and other updates
        refreshUser
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};

export const useAuth = () => useContext(UserAuthContext);
