import { Employee, OrganizationNode, User } from "../types";
import { MOCK_EMPLOYEES } from "../mocks/employees";
import { MOCK_ORGANIZATIONS } from "../mocks/organizations";
import { MOCK_USERS } from "../mocks/users";
import { simulatedDelay } from "./api";

export class HRISService {
  static async getCurrentEmployee(employeeId: string): Promise<Employee> {
    try {
      const res = await fetch(`/api/hris/employee/${employeeId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.status === "success" && json.data) {
          const d = json.data;
          return {
            employeeId: d.id,
            employeeNumber: d.employee_number || d.employeeNumber,
            fullName: d.full_name || d.fullName,
            email: d.email,
            positionId: d.position_id || d.positionId || "POS-01",
            positionName: d.position_name || d.positionName,
            entityId: d.entity_code || d.entityCode || "RUI",
            entityName: d.entity_name || d.entityName,
            sbuName: d.sbu_name || d.sbuName || "SBU Energy & Offshore Services",
            department: d.department || "Operations",
            organizationId: d.organization_id || "ORG-01",
            organizationName: d.organization_name || d.organizationName,
            managerEmployeeId: d.manager_id || undefined,
            managerName: d.manager_name || undefined,
            isActive: true,
          };
        }
      }
    } catch {
      // Fallback to mock
    }

    await simulatedDelay(100);
    const emp = MOCK_EMPLOYEES.find((e) => e.employeeId === employeeId);
    return emp || MOCK_EMPLOYEES[0];
  }

  static async getAllEmployees(): Promise<Employee[]> {
    try {
      const res = await fetch("/api/hris/employees");
      if (res.ok) {
        const json = await res.json();
        if (json.status === "success" && Array.isArray(json.data)) {
          return json.data.map((d: any) => ({
            employeeId: d.id,
            employeeNumber: d.employee_number || d.employeeNumber,
            fullName: d.full_name || d.fullName,
            email: d.email,
            positionId: d.position_id || d.positionId || "POS-01",
            positionName: d.position_name || d.positionName,
            entityId: d.entity_code || d.entityCode || "RUI",
            entityName: d.entity_name || d.entityName,
            sbuName: d.sbu_name || d.sbuName || "SBU Energy & Offshore Services",
            department: d.department || "Operations",
            organizationId: d.organization_id || "ORG-01",
            organizationName: d.organization_name || d.organizationName,
            managerEmployeeId: d.manager_id || undefined,
            managerName: d.manager_name || undefined,
            isActive: true,
          }));
        }
      }
    } catch {
      // Fallback
    }

    await simulatedDelay(150);
    return MOCK_EMPLOYEES;
  }

  static async getAllUserAccounts(): Promise<User[]> {
    await simulatedDelay(100);
    return MOCK_USERS;
  }

  static async searchEmployees(query: string): Promise<Employee[]> {
    try {
      const res = await fetch(`/api/hris/employees?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.status === "success" && Array.isArray(json.data)) {
          return json.data.map((d: any) => ({
            employeeId: d.id,
            employeeNumber: d.employee_number || d.employeeNumber,
            fullName: d.full_name || d.fullName,
            email: d.email,
            positionId: d.position_id || d.positionId || "POS-01",
            positionName: d.position_name || d.positionName,
            entityId: d.entity_code || d.entityCode || "RUI",
            entityName: d.entity_name || d.entityName,
            sbuName: d.sbu_name || d.sbuName || "SBU Energy & Offshore Services",
            department: d.department || "Operations",
            organizationId: d.organization_id || "ORG-01",
            organizationName: d.organization_name || d.organizationName,
            managerEmployeeId: d.manager_id || undefined,
            managerName: d.manager_name || undefined,
            isActive: true,
          }));
        }
      }
    } catch {
      // Fallback
    }

    await simulatedDelay(100);
    if (!query || query.trim() === "") {
      return MOCK_EMPLOYEES;
    }
    const q = query.toLowerCase();
    return MOCK_EMPLOYEES.filter(
      (emp) =>
        emp.fullName.toLowerCase().includes(q) ||
        emp.employeeNumber.includes(q) ||
        emp.positionName.toLowerCase().includes(q) ||
        emp.sbuName.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q) ||
        emp.entityName.toLowerCase().includes(q)
    );
  }

  static async getOrganizations(): Promise<OrganizationNode[]> {
    await simulatedDelay(100);
    return MOCK_ORGANIZATIONS;
  }

  static async getHrisStructure(): Promise<any> {
    try {
      const res = await fetch("/api/hris/structure");
      if (res.ok) {
        const json = await res.json();
        return json;
      }
    } catch {
      // Fallback
    }
    await simulatedDelay(100);
    return {
      status: "success",
      totalEmployees: MOCK_EMPLOYEES.length,
      lastSyncedAt: new Date().toISOString(),
      structure: {
        "SBU Energy & Offshore Services": {
          "Operations": MOCK_EMPLOYEES.map((e) => ({
            employeeId: e.employeeId,
            employeeNumber: e.employeeNumber,
            fullName: e.fullName,
            email: e.email,
            positionName: e.positionName,
            entityName: e.entityName,
            department: e.department,
            directSupervisor: "Budi Santoso (VP Operations)",
            managerName: "Sari Intan (General Manager)"
          }))
        }
      }
    };
  }

  static async triggerHrisSync(syncedBy = "Admin"): Promise<any> {
    try {
      const res = await fetch("/api/hris/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syncedBy }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Fallback
    }
    await simulatedDelay(300);
    return {
      syncId: `SYNC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      syncedAt: new Date().toISOString(),
      status: "SUCCESS",
      recordsSynced: MOCK_EMPLOYEES.length,
      sourceApi: "https://hris.radiant.co.id/api/v2/employees/sync",
      syncedBy,
      message: `Sinkronisasi simulasi HRIS API berhasil (${MOCK_EMPLOYEES.length} karyawan terkelola).`
    };
  }
}
