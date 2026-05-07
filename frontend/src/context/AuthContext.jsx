import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api";
import { socket } from "../socket";

const AuthContext = createContext(null);
const localStorageUserKey = "team-task-manager-user";
const localStorageTokenKey = "team-task-manager-token";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const normalizeUser = (userData) => ({
    ...userData,
    _id: userData._id || userData.id,
    id: userData.id || userData._id,
  });

  const joinUserRoom = (userData) => {
    const id = userData?._id || userData?.id;
    if (!id || userData?.role !== "Member") return;
    const roomId = id.toString();
    if (socket.connected) {
      socket.emit("join_room", roomId);
    }
  };

  const setSession = (userData, tokenValue) => {
    const normalizedUser = normalizeUser(userData);
    setUser(normalizedUser);
    setToken(tokenValue);
    localStorage.setItem(localStorageUserKey, JSON.stringify(normalizedUser));
    localStorage.setItem(localStorageTokenKey, tokenValue);
    api.defaults.headers.common.Authorization = `Bearer ${tokenValue}`;
    joinUserRoom(normalizedUser);
  };

  const clearSession = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(localStorageUserKey);
    localStorage.removeItem(localStorageTokenKey);
    delete api.defaults.headers.common.Authorization;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem(localStorageUserKey);
    const storedToken = localStorage.getItem(localStorageTokenKey);

    if (storedUser && storedToken) {
      try {
        const normalizedUser = normalizeUser(JSON.parse(storedUser));
        setUser(normalizedUser);
        setToken(storedToken);
        api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
        joinUserRoom(normalizedUser);
      } catch (error) {
        console.error("Session parsing failed, clearing corrupted data.");
        clearSession();
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleConnect = () => {
      if (user?.role === "Member") {
        const roomId = (user._id || user.id).toString();
        socket.emit("join_room", roomId);
      }
    };

    socket.on("connect", handleConnect);

    if (socket.connected && user?.role === "Member") {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
    };
  }, [user]);

  const login = async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      setSession(response.data.user, response.data.token);
      toast.success("Logged in successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
      throw error;
    }
  };

  const register = async (details) => {
    try {
      const response = await api.post("/auth/signup", details);
      setSession(response.data.user, response.data.token);
      toast.success("Account created successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Registration failed");
      throw error;
    }
  };

  const logout = () => {
    clearSession();
    navigate("/login");
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
