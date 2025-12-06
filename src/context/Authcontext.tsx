// context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  loginUser,
  registerUser,
  getUserProfile,
  editUserProfile,
  verifyOtp,
  deleteUserAccount,
} from "../api/auth";
import { RegisterPayload, LoginPayload } from "../api/types";

const TOKEN_KEY = "authToken";
const USER_KEY = "authUser";

// ✅ Type definition
type AuthContextType = {
  user: any | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginPayload) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  verifyOtpLogin:any
  deleteAccount:any
};

// ✅ Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// ✅ Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ------------------------------------------------------
  // 🔹 Load token & user when app starts
  // ------------------------------------------------------
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const savedUser = await AsyncStorage.getItem(USER_KEY);

        if (savedToken) {
          setToken(savedToken);

          // Show cached user instantly if available
          if (savedUser) {
            try {
              const parsed = JSON.parse(savedUser);
              setUser(parsed);
            } catch {
              setUser(null);
            }
          }

          // Try to refresh profile from API (silent)
          try {
            const profile = await getUserProfile(); // assumes interceptor adds token
            setUser(profile);
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(profile));
          } catch (err: any) {
            console.warn(
              "Profile refresh failed, using cached user if any:",
              err?.response?.data || err?.message
            );
            // If no cached user, force logout state
            if (!savedUser) {
              setUser(null);
              setToken(null);
              await AsyncStorage.removeItem(TOKEN_KEY);
            }
          }
        } else {
          setUser(null);
          setToken(null);
        }
      } catch (err: any) {
        console.warn("Auth init failed:", err?.message);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // ------------------------------------------------------
  // 🔹 Login
  // ------------------------------------------------------
  const login = async (data: LoginPayload) => {
    setLoading(true);
    try {
      const response = await loginUser(data);
      const accessToken = response?.accessToken;

      if (!accessToken) throw new Error("No access token received");

      await AsyncStorage.setItem(TOKEN_KEY, accessToken);
      setToken(accessToken);

      const profile = await getUserProfile();
      setUser(profile);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(profile));
    } catch (err) {
      // console.error("Login failed:", err);
      // throw so UI can show error
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------
  // 🔹 Register
  // ------------------------------------------------------
  const register = async (data: RegisterPayload) => {
    setLoading(true);
    try {
      await registerUser(data);
      // Optionally: auto login here if API returns token
    } catch (err) {
      console.error("Register failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------
  // 🔹 Update Profile
  // ------------------------------------------------------
  const updateProfile = async (data: any) => {
    setLoading(true);
    try {
      const updatedUser = await editUserProfile(data);
      setUser(updatedUser);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      console.log("Profile updated successfully");
    } catch (err) {
      console.error("Profile update failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
const verifyOtpLogin = async (data: { email: string; otp: string }) => {
  try {
    const result = await verifyOtp(data);
    console.log("ssss",JSON.stringify(result))
    if (!result?.accessToken) {
      // IMPORTANT: RETURN false instead of throwing
      return false; 
    }

    await AsyncStorage.setItem(TOKEN_KEY, result.accessToken);
    setToken(result.accessToken);

    const profile = await getUserProfile();
    setUser(profile);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(profile));

    return true; // success
  } catch (err) {
    return false; // DO NOT THROW
  }
};


  // ------------------------------------------------------
  // 🔹 Logout
  // ------------------------------------------------------
  const logout = async () => {
    setLoading(true);
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
    } catch (err) {
      console.warn("Logout failed:", err);
    } finally {
      setLoading(false);
    }
  };
// 🔹 Delete Account
const deleteAccount = async () => {
  setLoading(true);
  try {
    await deleteUserAccount();       // Backend API call
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
    setToken(null);
  } catch (err) {
    console.error("Delete account failed:", err);
    throw err;
  } finally {
    setLoading(false);
  }
};

  // ------------------------------------------------------
  // 🔹 Render
  // ------------------------------------------------------
  if (loading) {
    // You can return a proper Splash / Loader here
    return <></>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        verifyOtpLogin,
        updateProfile,
        deleteAccount
        
        
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
