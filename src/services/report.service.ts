import { Declaration, DeclarationFilter, ReportSummary } from "../types";
import { DeclarationService } from "./declaration.service";
import { formatRupiah, formatDate } from "../utils/formatters";
import { simulatedDelay } from "./api";

export interface ChartDataPoint {
  label: string;
  count: number;
  amount?: number;
}

export class ReportService {
  static async getReportSummary(filter?: DeclarationFilter): Promise<{
    summary: ReportSummary;
    declarations: Declaration[];
    activityBreakdown: ChartDataPoint[];
    statusBreakdown: ChartDataPoint[];
    monthlyTrend: ChartDataPoint[];
  }> {
    await simulatedDelay(250);
    const declarations = await DeclarationService.getDeclarations(filter);

    let totalAmount = 0;
    let draftCount = 0;
    let submittedCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;

    const activityMap: Record<string, { count: number; amount: number }> = {};
    const statusMap: Record<string, { count: number; amount: number }> = {};
    const monthMap: Record<string, { count: number; amount: number }> = {};

    declarations.forEach((decl) => {
      let amount = 0;
      const d = decl.activityDetail;
      if (d.totalAmount) amount = d.totalAmount;
      else if (d.estimatedPrice) amount = d.estimatedPrice;
      else if (d.sponsorshipAmount) amount = d.sponsorshipAmount;
      else if (d.facilitationAmount) amount = d.facilitationAmount;

      totalAmount += amount;

      if (decl.status === "DRAFT") draftCount++;
      else if (decl.status === "SUBMITTED") submittedCount++;
      else if (decl.status === "APPROVED") approvedCount++;
      else if (decl.status === "REJECTED") rejectedCount++;

      // Activity Breakdown
      const actLabel = decl.identity.activityType;
      if (!activityMap[actLabel]) {
        activityMap[actLabel] = { count: 0, amount: 0 };
      }
      activityMap[actLabel].count++;
      activityMap[actLabel].amount += amount;

      // Status Breakdown
      const stLabel = decl.status;
      if (!statusMap[stLabel]) {
        statusMap[stLabel] = { count: 0, amount: 0 };
      }
      statusMap[stLabel].count++;
      statusMap[stLabel].amount += amount;

      // Monthly Trend
      const created = new Date(decl.createdDate);
      const monthKey = `${created.getFullYear()}-${String(
        created.getMonth() + 1
      ).padStart(2, "0")}`;
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { count: 0, amount: 0 };
      }
      monthMap[monthKey].count++;
      monthMap[monthKey].amount += amount;
    });

    const summary: ReportSummary = {
      totalDeclaration: declarations.length,
      totalDraft: draftCount,
      totalSubmitted: submittedCount,
      totalApproved: approvedCount,
      totalRejected: rejectedCount,
      totalAmount,
    };

    const activityBreakdown: ChartDataPoint[] = Object.keys(activityMap).map(
      (key) => ({
        label: key,
        count: activityMap[key].count,
        amount: activityMap[key].amount,
      })
    );

    const statusBreakdown: ChartDataPoint[] = Object.keys(statusMap).map(
      (key) => ({
        label: key,
        count: statusMap[key].count,
        amount: statusMap[key].amount,
      })
    );

    const monthlyTrend: ChartDataPoint[] = Object.keys(monthMap)
      .sort()
      .map((key) => ({
        label: key,
        count: monthMap[key].count,
        amount: monthMap[key].amount,
      }));

    return {
      summary,
      declarations,
      activityBreakdown,
      statusBreakdown,
      monthlyTrend,
    };
  }

  static exportToCSV(declarations: Declaration[]): void {
    const headers = [
      "Declaration Number",
      "Expense Number (ERP)",
      "Created Date",
      "Status",
      "Employee ID",
      "Full Name",
      "Entity",
      "SBU",
      "Department",
      "Activity Type",
      "External Company",
      "Project Code",
      "Total Amount",
    ];

    const rows = declarations.map((d) => {
      let amount = 0;
      const det = d.activityDetail;
      if (det.totalAmount) amount = det.totalAmount;
      else if (det.estimatedPrice) amount = det.estimatedPrice;
      else if (det.sponsorshipAmount) amount = det.sponsorshipAmount;
      else if (det.facilitationAmount) amount = det.facilitationAmount;

      return [
        d.declarationNumber,
        `"${d.status === "APPROVED" ? d.expenseNumber || "Siap Dibuat" : "Belum Ada"}"`,
        formatDate(d.createdDate),
        d.status,
        d.identity.employeeId,
        `"${d.identity.fullName}"`,
        `"${d.identity.entity}"`,
        `"${d.identity.sbu || d.identity.organizationHierarchy || ""}"`,
        `"${d.identity.department || ""}"`,
        `"${d.identity.activityType}"`,
        `"${d.externalParty.companyName || "N/A"}"`,
        `"${d.externalParty.projectCode || "N/A"}"`,
        amount,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Radiant_ABC_Declarations_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
