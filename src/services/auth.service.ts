import { User } from "../types";
import { MOCK_USERS } from "../mocks/users";
import { simulatedDelay } from "./api";

const STORAGE_KEY = "radiant_abc_auth_user";
const TOKEN_KEY = "radiant_abc_auth_token";

export class AuthService {
  static getAuthToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  static getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    // Default to Employee (John Doe) if not logged in
    return MOCK_USERS[0];
  }

  static async verifySession(): Promise<User | null> {
    const token = this.getAuthToken();
    if (!token) return null;

    try {
      const res = await fetch("/api/auth/me", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status === "success" && json.user) {
          const uData = json.user;
          const emp = MOCK_USERS.find(u => u.username === uData.username)?.employee || MOCK_USERS[0].employee;
          const user: User = {
            id: uData.id || "USR-001",
            username: uData.username,
            role: uData.role,
            employeeId: uData.employee_id || uData.employeeId || "EMP-2026-001",
            employee: emp,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
          return user;
        }
      }
    } catch {
      // ignore
    }
    return null;
  }

  static async login(username: string, password: string = "password123"): Promise<User> {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status === "success" && json.user) {
          if (json.token) {
            localStorage.setItem(TOKEN_KEY, json.token);
          }
          const emp = MOCK_USERS.find(u => u.username === json.user.username)?.employee || MOCK_USERS[0].employee;
          const user: User = {
            id: json.user.id || "USR-001",
            username: json.user.username,
            role: json.user.role,
            employeeId: json.user.employee_id || json.user.employeeId || "EMP-2026-001",
            employee: emp,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
          return user;
        }
      }
    } catch {
      // fallback to mock if API unavailable
    }

    await simulatedDelay(200);
    const found = MOCK_USERS.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );
    const user = found || MOCK_USERS[0];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  static async switchRoleUser(roleUsername: "employee" | "approver" | "admin"): Promise<User> {
    await simulatedDelay(150);
    const found = MOCK_USERS.find((u) => u.username === roleUsername) || MOCK_USERS[0];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    return found;
  }

  static async logout(): Promise<void> {
    const token = this.getAuthToken();
    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } catch {
        // ignore
      }
    }
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }
}

