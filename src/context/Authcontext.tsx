import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  loginUser,
  registerUser,
  getUserProfile,
  editUserProfile,
} from "../api/auth"; // ✅ make sure all 4 API functions exist
import { RegisterPayload, LoginPayload } from "../api/types"; // ✅ adjust path

// ------------------------------------------------------
// ✅ Define AuthContext Type
// ------------------------------------------------------
type AuthContextType = {
  user: any | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginPayload) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
};

// ------------------------------------------------------
// ✅ Create Context
// ------------------------------------------------------
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ------------------------------------------------------
// ✅ Custom Hook
// ------------------------------------------------------
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// ------------------------------------------------------
// ✅ Provider Component
// ------------------------------------------------------
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ------------------------------------------------------
  // ✅ Load token and profile on app start
  // ------------------------------------------------------
  useEffect(() => {
    const loadTokenAndUser = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("authToken");
        if (savedToken) {
          setToken(savedToken);
          const profile = await getUserProfile();
          setUser(profile);
        }
      } catch (err) {
        console.warn("Auth load failed", err);
        await AsyncStorage.removeItem("authToken");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadTokenAndUser();
  }, []);

  // ------------------------------------------------------
  // ✅ Login
  // ------------------------------------------------------
  const login = async (data: LoginPayload) => {
    setLoading(true);
    try {
      const response = await loginUser(data);
      const accessToken = response?.accessToken;
      if (!accessToken) throw new Error("No access token received");

      await AsyncStorage.setItem("authToken", accessToken);
      setToken(accessToken);

      const profile = await getUserProfile();
      setUser(profile);
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------
  // ✅ Register
  // ------------------------------------------------------
  const register = async (data: RegisterPayload) => {
    setLoading(true);
    try {
      await registerUser(data);
      // Optionally auto-login after registration
    } catch (err) {
      console.error("Register failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------
  // ✅ Update Profile (Edit user)
  // ------------------------------------------------------
  const updateProfile = async (data: any) => {
    setLoading(true);
    try {
      const updatedUser = await editUserProfile(data);
      setUser(updatedUser);
      console.log("Profile updated successfully:", updatedUser);
    } catch (err) {
      console.error("Profile update failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------
  // ✅ Logout
  // ------------------------------------------------------
  const logout = async () => {
    setLoading(true);
    try {
      await AsyncStorage.removeItem("authToken");
      setToken(null);
      setUser(null);
    } catch (err) {
      console.warn("Logout failed", err);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------
  // ✅ Context Value
  // ------------------------------------------------------
  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, updateProfile }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
