// src/context/AuthContext.tsx  
import React, { createContext, useContext, useEffect, useState } from 'react';  
import AsyncStorage from '@react-native-async-storage/async-storage';  
import { loginUser, registerUser, getUserProfile } from '../api/auth';  // adjust path  
import { RegisterPayload, LoginPayload } from '../api/types';  // adjust path  

type AuthContextType = {  
  user: any | null;  
  token: string | null;  
  loading: boolean;  
  login: (data: LoginPayload) => Promise<void>;  
  register: (data: RegisterPayload) => Promise<void>;  
  logout: () => Promise<void>;  
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {  
  const context = useContext(AuthContext);  
  if (!context) throw new Error('useAuth must be used within AuthProvider');  
  return context;  
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {  
  const [user, setUser] = useState<any | null>(null);  
  const [token, setToken] = useState<string | null>(null);  
  const [loading, setLoading] = useState(true);

  useEffect(() => {  
    const loadTokenAndUser = async () => {  
      try {  
        const savedToken = await AsyncStorage.getItem('authToken');  
        if (savedToken) {  
          setToken(savedToken);  
          const profile = await getUserProfile();  
          setUser(profile);  
        }  
      } catch (err) {  
        console.warn('Auth load failed', err);  
        await AsyncStorage.removeItem('authToken');  
        setToken(null);  
        setUser(null);  
      } finally {  
        setLoading(false);  
      }  
    };
    loadTokenAndUser();  
  }, []);

  const login = async (data: LoginPayload) => {  
    setLoading(true);  
    try {  
      const response = await loginUser(data);  
      console.log("response",response)
      const accessToken = response?.accessToken;  
      if (!accessToken) throw new Error('No access token');  
      await AsyncStorage.setItem('authToken', accessToken);  
      setToken(accessToken);

      const profile = await getUserProfile();  
      setUser(profile);  
    } catch (err) {  
      throw err;  
    } finally {  
      setLoading(false);  
    }  
  };

  const register = async (data: RegisterPayload) => {  
    setLoading(true);  
    try {  
      await registerUser(data);  
      // Optionally you may want to automatically login after register  
    } catch (err) {  
      throw err;  
    } finally {  
      setLoading(false);  
    }  
  };

  const logout = async () => {  
    setLoading(true);  
    try {  
      await AsyncStorage.removeItem('authToken');  
      setToken(null);  
      setUser(null);  
    } catch (err) {  
      console.warn('Logout failed', err);  
    } finally {  
      setLoading(false);  
    }  
  };

  return (  
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>  
      {/* Wait until loading finished */}  
      {!loading && children}  
    </AuthContext.Provider>  
  );  
};
