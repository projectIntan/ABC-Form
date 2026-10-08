import {
  Declaration,
  DeclarationFilter,
  DeclarationStatus,
} from "../types";
import { INITIAL_DECLARATIONS } from "../mocks/declarations";
import { generateDeclarationNumber, getBranchCodeFromEntity } from "../utils/formatters";
import { simulatedDelay } from "./api";
import { AuditService } from "./audit.service";

const DECLARATION_STORAGE_KEY = "radiant_abc_declarations_data";

export class DeclarationService {
  private static getStoredDeclarations(): Declaration[] {
    try {
      const stored = localStorage.getItem(DECLARATION_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    localStorage.setItem(
      DECLARATION_STORAGE_KEY,
      JSON.stringify(INITIAL_DECLARATIONS)
    );
    return INITIAL_DECLARATIONS;
  }

  private static saveStoredDeclarations(declarations: Declaration[]): void {
    localStorage.setItem(
      DECLARATION_STORAGE_KEY,
      JSON.stringify(declarations)
    );
  }

  static async getDeclarations(
    filter?: DeclarationFilter,
    userEmployeeId?: string,
    role?: string
  ): Promise<Declaration[]> {
    await simulatedDelay(200);
    let list = this.getStoredDeclarations();

    // Role filtering: EMPLOYEE sees only their own declarations
    if (role === "EMPLOYEE" && userEmployeeId) {
      list = list.filter((d) => d.identity.employeeId === userEmployeeId);
    }

    if (!filter) return list;

    if (filter.status && filter.status !== "ALL") {
      list = list.filter((d) => d.status === filter.status);
    }

    if (filter.activityType && filter.activityType !== "ALL") {
      list = list.filter((d) => d.identity.activityType === filter.activityType);
    }

    if (filter.projectCode && filter.projectCode.trim() !== "") {
      const pc = filter.projectCode.toLowerCase();
      list = list.filter((d) =>
        d.externalParty.projectCode.toLowerCase().includes(pc)
      );
    }

    if (filter.entity && filter.entity !== "ALL") {
      list = list.filter((d) => d.identity.entity === filter.entity);
    }

    if (filter.searchQuery && filter.searchQuery.trim() !== "") {
      const q = filter.searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.declarationNumber.toLowerCase().includes(q) ||
          (d.expenseNumber && d.expenseNumber.toLowerCase().includes(q)) ||
          d.identity.fullName.toLowerCase().includes(q) ||
          d.externalParty.companyName.toLowerCase().includes(q) ||
          d.externalParty.projectCode.toLowerCase().includes(q)
      );
    }

    if (filter.dateFrom) {
      list = list.filter((d) => d.createdDate >= filter.dateFrom!);
    }

    if (filter.dateTo) {
      list = list.filter((d) => d.createdDate <= filter.dateTo!);
    }

    return list.sort(
      (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    );
  }

  static async getDeclarationById(id: string): Promise<Declaration | null> {
    await simulatedDelay(150);
    const list = this.getStoredDeclarations();
    const local = list.find((d) => d.id === id || d.declarationNumber === id);
    if (local) return local;

    try {
      const res = await fetch(`/api/declarations/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {
      // ignore
    }
    return null;
  }

  static async saveDraft(
    data: Omit<Declaration, "id" | "declarationNumber" | "status" | "createdDate"> & {
      id?: string;
    }
  ): Promise<Declaration> {
    await simulatedDelay(300);
    const list = this.getStoredDeclarations();

    if (data.id) {
      // Update existing draft
      const idx = list.findIndex((d) => d.id === data.id);
      if (idx !== -1) {
        const updated: Declaration = {
          ...list[idx],
          ...data,
          status: "DRAFT",
          id: data.id,
        };
        list[idx] = updated;
        this.saveStoredDeclarations(list);

        await AuditService.log({
          employeeId: data.identity.employeeId,
          user: data.identity.fullName,
          module: "Declaration",
          action: "UPDATE_DRAFT",
          recordId: updated.declarationNumber,
          description: `Saved draft declaration ${updated.declarationNumber}`,
        });

        return updated;
      }
    }

    // Create new draft
    const sequence = list.length + 1;
    const branchCode = getBranchCodeFromEntity(data.identity.entity);
    const declNo = generateDeclarationNumber(sequence, branchCode);

    const newDecl: Declaration = {
      ...data,
      id: `DECL-${Date.now()}`,
      declarationNumber: declNo,
      expenseNumber: undefined,
      status: "DRAFT",
      createdDate: new Date().toISOString(),
      documentCode: "F-COMP-001-01",
    };

    list.unshift(newDecl);
    this.saveStoredDeclarations(list);

    await AuditService.log({
      employeeId: data.identity.employeeId,
      user: data.identity.fullName,
      module: "Declaration",
      action: "SAVE_DRAFT",
      recordId: newDecl.declarationNumber,
      description: `Created draft declaration ${newDecl.declarationNumber}`,
    });

    return newDecl;
  }

  static async submitDeclaration(
    data: Omit<Declaration, "id" | "declarationNumber" | "status" | "createdDate"> & {
      id?: string;
    }
  ): Promise<Declaration> {
    await simulatedDelay(350);
    const backendResponse = await fetch("/api/declarations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, status: "SUBMITTED" }),
    });
    if (!backendResponse.ok) {
      const result = await backendResponse.json().catch(() => ({}));
      throw new Error(result.message || "Validasi backend gagal.");
    }
    const list = this.getStoredDeclarations();
    const now = new Date().toISOString();

    const status: DeclarationStatus = "SUBMITTED";

    if (data.id) {
      const idx = list.findIndex((d) => d.id === data.id);
      if (idx !== -1) {
        const sequence = idx + 1;
        const updated: Declaration = {
          ...list[idx],
          ...data,
          status,
          expenseNumber: list[idx].expenseNumber,
          submittedDate: now,
          reviewedDate: undefined,
          reviewedBy: undefined,
          declarationAccepted: true,
        };
        list[idx] = updated;
        this.saveStoredDeclarations(list);

        await AuditService.log({
          employeeId: data.identity.employeeId,
          user: data.identity.fullName,
          module: "Declaration",
          action: "SUBMIT",
          recordId: updated.declarationNumber,
          description: `Submitted declaration ${updated.declarationNumber} (Requires Approval)`,
        });

        return updated;
      }
    }

    // New submission
    const sequence = list.length + 1;
    const branchCode = getBranchCodeFromEntity(data.identity.entity);
    const declNo = generateDeclarationNumber(sequence, branchCode);
    const newDecl: Declaration = {
      ...data,
      id: `DECL-${Date.now()}`,
      declarationNumber: declNo,
      expenseNumber: undefined,
      status,
      createdDate: now,
      submittedDate: now,
      reviewedDate: undefined,
      reviewedBy: undefined,
      documentCode: "F-COMP-001-01",
      declarationAccepted: true,
    };

    list.unshift(newDecl);
    this.saveStoredDeclarations(list);

    // Sync to backend DB for persistence
    try {
      fetch("/api/declarations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDecl),
      }).catch(() => {});
    } catch {
      // offline fallback
    }

    await AuditService.log({
      employeeId: data.identity.employeeId,
      user: data.identity.fullName,
      module: "Declaration",
      action: "SUBMIT",
      recordId: newDecl.declarationNumber,
      description: `Submitted declaration ${newDecl.declarationNumber} (Requires Approval)`,
    });

    return newDecl;
  }

  static async deleteDraft(id: string, userFullName: string, employeeId: string): Promise<boolean> {
    await simulatedDelay(200);
    let list = this.getStoredDeclarations();
    const target = list.find((d) => d.id === id);
    if (!target || target.status !== "DRAFT") {
      throw new Error("Only draft declarations can be deleted.");
    }

    list = list.filter((d) => d.id !== id);
    this.saveStoredDeclarations(list);

    await AuditService.log({
      employeeId,
      user: userFullName,
      module: "Declaration",
      action: "DELETE_DRAFT",
      recordId: target.declarationNumber,
      description: `Deleted draft declaration ${target.declarationNumber}`,
    });

    return true;
  }
}
