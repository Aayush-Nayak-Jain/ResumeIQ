"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AuthTokenResponse, LoginCredentials, RegisterCredentials, User } from "../types/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "signin" | "signup";
  authError: string | null;
  openAuthModal: (mode?: "signin" | "signup") => void;
  closeAuthModal: () => void;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");
  const [authError, setAuthError] = useState<string | null>(null);

  const logout = useCallback(() => {
    localStorage.removeItem("resumeiq_access_token");
    localStorage.removeItem("resumeiq_refresh_token");
    setToken(null);
    setUser(null);
  }, []);

  const fetchUserProfile = useCallback(async (authToken: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.ok) {
        const userData: User = await res.json();
        setUser(userData);
      } else {
        logout();
      }
    } catch {
      // Offline fallback
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  // Initialize session on client mount
  useEffect(() => {
    const savedToken = localStorage.getItem("resumeiq_access_token");
    if (savedToken) {
      setToken(savedToken);
      fetchUserProfile(savedToken);
    } else {
      setIsLoading(false);
    }
  }, [fetchUserProfile]);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.detail || "Authentication failed. Please check your credentials.");
        return false;
      }

      const authData: AuthTokenResponse = data;
      localStorage.setItem("resumeiq_access_token", authData.access_token);
      localStorage.setItem("resumeiq_refresh_token", authData.refresh_token);
      setToken(authData.access_token);
      setUser(authData.user);
      setIsAuthModalOpen(false);
      return true;
    } catch {
      setAuthError("Network error. Unable to reach authentication server.");
      return false;
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<boolean> => {
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.detail || "Registration failed. Please verify the input fields.");
        return false;
      }

      const authData: AuthTokenResponse = data;
      localStorage.setItem("resumeiq_access_token", authData.access_token);
      localStorage.setItem("resumeiq_refresh_token", authData.refresh_token);
      setToken(authData.access_token);
      setUser(authData.user);
      setIsAuthModalOpen(false);
      return true;
    } catch {
      setAuthError("Network error. Unable to connect to backend service.");
      return false;
    }
  };

  const openAuthModal = (mode: "signin" | "signup" = "signin") => {
    setAuthModalMode(mode);
    setAuthError(null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthError(null);
  };

  const clearError = () => {
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        authError,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
