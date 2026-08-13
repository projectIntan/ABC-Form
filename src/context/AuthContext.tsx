import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Role } from "../types";
import { AuthService } from "../services/auth.service";

interface AuthContextType {
  user: User | null;
  role: Role;
  login: (username: string, password?: string) => Promise<void>;
  switchRole: (roleUsername: "employee" | "approver" | "admin") => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (username: string, password?: string) => {
    setIsLoading(true);
    try {
      const loggedIn = await AuthService.login(username, password);
      setUser(loggedIn);
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (roleUsername: "employee" | "approver" | "admin") => {
    setIsLoading(true);
    try {
      const switched = await AuthService.switchRoleUser(roleUsername);
      setUser(switched);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const role: Role = user?.role || "EMPLOYEE";

  return (
    <AuthContext.Provider value={{ user, role, login, switchRole, logout, isLoading }}>
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
