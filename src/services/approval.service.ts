import { Declaration } from "../types";
import { DeclarationService } from "./declaration.service";
import { simulatedDelay } from "./api";
import { AuditService } from "./audit.service";

export class ApprovalService {
  static async getPendingApprovals(): Promise<Declaration[]> {
    const list = await DeclarationService.getDeclarations({ status: "SUBMITTED" });
    return list.filter((d) => d.identity.activityType === "GIFT");
  }

  static async approveDeclaration(
    id: string,
    approverName: string,
    approverEmployeeId: string
  ): Promise<Declaration> {
    await simulatedDelay(300);
    const decl = await DeclarationService.getDeclarationById(id);
    if (!decl) {
      throw new Error("Declaration not found");
    }
    if (decl.status !== "SUBMITTED") {
      throw new Error("Only submitted declarations can be approved");
    }

    decl.status = "APPROVED";
    decl.reviewedDate = new Date().toISOString();
    decl.reviewedBy = approverName;

    // Generate Expense Number from ERP if not already present
    if (!decl.expenseNumber) {
      const dateCode = new Date().toISOString().slice(0, 7).replace("-", "");
      const randNum = Math.floor(1000 + Math.random() * 9000);
      decl.expenseNumber = `EXP-${dateCode}-${randNum}`;
    }

    // Save back to storage
    const all = await DeclarationService.getDeclarations();
    const idx = all.findIndex((d) => d.id === id);
    if (idx !== -1) {
      all[idx] = decl;
      localStorage.setItem("radiant_abc_declarations_data", JSON.stringify(all));
    }

    await AuditService.log({
      employeeId: approverEmployeeId,
      user: approverName,
      module: "Approval",
      action: "APPROVE",
      recordId: decl.declarationNumber,
      description: `Approved declaration ${decl.declarationNumber}`,
    });

    return decl;
  }

  static async rejectDeclaration(
    id: string,
    reason: string,
    approverName: string,
    approverEmployeeId: string
  ): Promise<Declaration> {
    await simulatedDelay(300);
    if (!reason || reason.trim() === "") {
      throw new Error("Rejection reason is required");
    }

    const decl = await DeclarationService.getDeclarationById(id);
    if (!decl) {
      throw new Error("Declaration not found");
    }
    if (decl.status !== "SUBMITTED") {
      throw new Error("Only submitted declarations can be rejected");
    }

    decl.status = "REJECTED";
    decl.reviewedDate = new Date().toISOString();
    decl.reviewedBy = approverName;
    decl.rejectionReason = reason;

    // Save back to storage
    const all = await DeclarationService.getDeclarations();
    const idx = all.findIndex((d) => d.id === id);
    if (idx !== -1) {
      all[idx] = decl;
      localStorage.setItem("radiant_abc_declarations_data", JSON.stringify(all));
    }

    await AuditService.log({
      employeeId: approverEmployeeId,
      user: approverName,
      module: "Approval",
      action: "REJECT",
      recordId: decl.declarationNumber,
      description: `Rejected declaration ${decl.declarationNumber}. Reason: ${reason}`,
    });

    return decl;
  }
}
