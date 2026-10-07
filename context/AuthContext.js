import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/apiService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [pendingAuth, setPendingAuth] = useState(null);

  // Validar sesión activa al arrancar la aplicación
  useEffect(() => {
    checkActiveSession();
  }, []);

  const checkActiveSession = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('@xios_eventos_session_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error al recuperar sesión activa:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, isAdmin = false) => {
    const response = await ApiService.login(email, password, isAdmin);
    if (response.success && response.requiresVerification) {
      setPendingAuth({
        email: response.email,
        role: response.role,
        verificationCode: response.verificationCode
      });
    } else if (response.success && response.user) {
      setUser(response.user);
    }
    return response;
  };

  const verifyCode = async (email, code) => {
    const response = await ApiService.verifyCode(email, code);
    if (response.success && response.user) {
      setUser(response.user);
      setPendingAuth(null);
    }
    return response;
  };

  const register = async (userData) => {
    const response = await ApiService.register(userData);
    if (response.success) {
      setUser(response.user);
    }
    return response;
  };

  const forgotPassword = async (email, newPassword) => {
    return await ApiService.forgotPassword(email, newPassword);
  };

  const updateProfile = async (profileData) => {
    const response = await ApiService.updateProfile(profileData);
    if (response.success) {
      setUser(response.user);
    }
    return response;
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@xios_eventos_session_user');
      setUser(null);
      setPendingAuth(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoggedIn: !!user,
        isAdmin: user?.role === 'admin',
        pendingAuth,
        setPendingAuth,
        login,
        verifyCode,
        register,
        forgotPassword,
        updateProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
