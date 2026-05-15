"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { UserProfile, TokenResponse, LoginRequest, RegisterRequest } from "@/lib/types";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateUser: (updated: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const data = await api.fetch<UserProfile>("/profile");
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const res = await api.fetch<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password } as LoginRequest),
    });
    localStorage.setItem("accessToken", res.accessToken);
    localStorage.setItem("refreshToken", res.refreshToken);
    await fetchUser();
  };

  const register = async (data: RegisterRequest) => {
    const res = await api.fetch<TokenResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    localStorage.setItem("accessToken", res.accessToken);
    localStorage.setItem("refreshToken", res.refreshToken);
    await fetchUser();
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const updateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : prev));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};