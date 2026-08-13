import { AuditLog } from "../types";
import { simulatedDelay } from "./api";

const AUDIT_STORAGE_KEY = "radiant_abc_audit_logs";

export class AuditService {
  private static getStoredLogs(): AuditLog[] {
    try {
      const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    // Default mock logs
    const initialLogs: AuditLog[] = [
      {
        id: "AUD-001",
        timestamp: "2026-08-01T10:15:00Z",
        user: "John Doe",
        employeeId: "EMP001",
        module: "Declaration",
        action: "SUBMIT",
        recordId: "ABC-2026-000001",
        description: "Submitted declaration ABC-2026-000001 for External Meal",
      },
      {
        id: "AUD-002",
        timestamp: "2026-08-02T14:20:00Z",
        user: "Ahmad Rizky",
        employeeId: "EMP002",
        module: "Declaration",
        action: "SUBMIT",
        recordId: "ABC-2026-000002",
        description: "Submitted declaration ABC-2026-000002 for Gift",
      },
      {
        id: "AUD-003",
        timestamp: "2026-08-03T08:45:00Z",
        user: "Jane Smith",
        employeeId: "EMP010",
        module: "Approval",
        action: "APPROVE",
        recordId: "ABC-2026-000002",
        description: "Approved declaration ABC-2026-000002",
      },
      {
        id: "AUD-004",
        timestamp: "2026-08-05T09:10:00Z",
        user: "Jane Smith",
        employeeId: "EMP010",
        module: "Approval",
        action: "REJECT",
        recordId: "ABC-2026-000003",
        description: "Rejected declaration ABC-2026-000003 due to missing price proof",
      },
      {
        id: "AUD-005",
        timestamp: "2026-08-08T10:00:00Z",
        user: "John Doe",
        employeeId: "EMP001",
        module: "Declaration",
        action: "SAVE_DRAFT",
        recordId: "ABC-2026-000004",
        description: "Created draft declaration ABC-2026-000004",
      },
    ];
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(initialLogs));
    return initialLogs;
  }

  static async log(logData: Omit<AuditLog, "id" | "timestamp">): Promise<AuditLog> {
    const logs = this.getStoredLogs();
    const newLog: AuditLog = {
      ...logData,
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs));
    return newLog;
  }

  static async getLogs(): Promise<AuditLog[]> {
    await simulatedDelay(150);
    return this.getStoredLogs();
  }
}
