import { ProjectCode } from "../types";

export class ProjectCodeService {
  static async getProjectCodes(department: string): Promise<ProjectCode[]> {
    const response = await fetch(
      `/api/master/project-codes?department=${encodeURIComponent(department)}`
    );

    const result = await response.json();

    if (!response.ok || result.status !== "success") {
      throw new Error(result.message || "Gagal memuat Project Code.");
    }

    return result.data || [];
  }
}
