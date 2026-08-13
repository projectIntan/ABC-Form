import { simulatedDelay } from "./api";

export interface MasterActivityType {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  requiresExternalParty: boolean;
  requiresParticipants: boolean;
  maxAmountThreshold: number;
  isActive: boolean;
  createdAt?: string;
}

export interface UserPermissionItem {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  employeeId: string;
  employeeNumber: string;
  positionName: string;
  department: string;
  entityName: string;
  permissions: string[];
}

export interface ComplianceStatementSetting {
  id: string;
  settingKey: string;
  title: string;
  statementIndonesian: string;
  statementEnglish: string;
  updatedAt: string;
  updatedBy: string;
}

export class AdminService {
  // --- 1. Master Activity Types ---
  static async getActivityTypes(): Promise<MasterActivityType[]> {
    try {
      const res = await fetch("/api/master/activity-types");
      if (res.ok) {
        const json = await res.json();
        if (json.status === "success" && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch {
      // Fallback
    }

    await simulatedDelay(100);
    return [
      {
        id: "ACT-001",
        code: "EXTERNAL_MEAL",
        name: "Jamuan Makan / Pertemuan Luar",
        category: "MEAL",
        description: "Jamuan makan bersama pihak luar, mitra bisnis, atau vendor.",
        requiresExternalParty: true,
        requiresParticipants: true,
        maxAmountThreshold: 1000000,
        isActive: true,
      },
      {
        id: "ACT-002",
        code: "ENTERTAINMENT",
        name: "Hiburan & Jamuan Khusus",
        category: "ENTERTAINMENT",
        description: "Fasilitas hiburan, keanggotaan golf, atau acara khusus.",
        requiresExternalParty: true,
        requiresParticipants: true,
        maxAmountThreshold: 2500000,
        isActive: true,
      },
      {
        id: "ACT-003",
        code: "GIFT",
        name: "Cenderamata & Hadiah (Gift)",
        category: "GIFT",
        description: "Pemberian atau penerimaan cenderamata, plakat, souvenir, atau parcel.",
        requiresExternalParty: true,
        requiresParticipants: false,
        maxAmountThreshold: 500000,
        isActive: true,
      },
      {
        id: "ACT-004",
        code: "FACILITATION",
        name: "Biaya Fasilitasi Operasional",
        category: "FACILITATION",
        description: "Pembayaran kelancaran operasional lapangan atau perizinan resmi.",
        requiresExternalParty: true,
        requiresParticipants: false,
        maxAmountThreshold: 1500000,
        isActive: true,
      },
      {
        id: "ACT-005",
        code: "SPONSORSHIP",
        name: "Dukungan Sponsorship & Bisnis",
        category: "SPONSORSHIP",
        description: "Sponsorship acara industri, seminar, atau asosiasi profesional.",
        requiresExternalParty: true,
        requiresParticipants: true,
        maxAmountThreshold: 10000000,
        isActive: true,
      },
      {
        id: "ACT-006",
        code: "RECREATIONAL",
        name: "Kegiatan Olahraga & Rekreasi",
        category: "RECREATIONAL",
        description: "Kegiatan kebugaran bersama, olahraga, atau tim pembina.",
        requiresExternalParty: true,
        requiresParticipants: true,
        maxAmountThreshold: 2000000,
        isActive: true,
      },
      {
        id: "ACT-007",
        code: "INTERNAL_ACTIVITY",
        name: "Kegiatan Internal Perusahaan",
        category: "INTERNAL",
        description: "Acara konsolidasi internal, townhall, atau rapat kerja tim Radiant Group.",
        requiresExternalParty: false,
        requiresParticipants: true,
        maxAmountThreshold: 5000000,
        isActive: true,
      },
    ];
  }

  static async saveActivityType(data: Partial<MasterActivityType>): Promise<any> {
    try {
      const res = await fetch("/api/master/activity-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || `Gagal menyimpan data (HTTP ${res.status})`);
    } catch (err: any) {
      console.error("Error in saveActivityType:", err);
      throw err;
    }
  }

  static async deleteActivityType(id: string): Promise<any> {
    try {
      const res = await fetch(`/api/master/activity-types/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        return await res.json();
      }
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || `Gagal menghapus data (HTTP ${res.status})`);
    } catch (err: any) {
      console.error("Error in deleteActivityType:", err);
      throw err;
    }
  }

  // --- 2. User Permissions Management ---
  static async getUsersWithPermissions(): Promise<UserPermissionItem[]> {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const json = await res.json();
        if (json.status === "success" && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch {
      // Fallback
    }

    await simulatedDelay(100);
    return [
      {
        id: "USR-001",
        username: "employee",
        fullName: "John Doe",
        email: "john.doe@radiant.co.id",
        role: "EMPLOYEE",
        employeeId: "EMP-2026-001",
        employeeNumber: "EMP-2026-001",
        positionName: "Field Operations Engineer",
        department: "Offshore Operations",
        entityName: "PT Radiant Utama Interinsco Tbk",
        permissions: ["CREATE_DECLARATION"],
      },
      {
        id: "USR-002",
        username: "approver",
        fullName: "Sari Intan",
        email: "sari.intan@radiant.co.id",
        role: "APPROVER",
        employeeId: "EMP-2026-002",
        employeeNumber: "EMP-2026-002",
        positionName: "General Manager Operations",
        department: "Executive & Management",
        entityName: "PT Radiant Utama Interinsco Tbk",
        permissions: ["CREATE_DECLARATION", "APPROVE_DECLARATION", "VIEW_ALL_DECLARATIONS", "EXPORT_REPORTS"],
      },
      {
        id: "USR-003",
        username: "admin",
        fullName: "Budi Santoso",
        email: "budi.santoso@radiant.co.id",
        role: "ADMIN",
        employeeId: "EMP-2026-003",
        employeeNumber: "EMP-2026-003",
        positionName: "Compliance & Risk Director",
        department: "Legal & Compliance",
        entityName: "PT Radiant Utama Interinsco Tbk",
        permissions: [
          "CREATE_DECLARATION",
          "APPROVE_DECLARATION",
          "VIEW_ALL_DECLARATIONS",
          "MANAGE_USERS",
          "MANAGE_MASTER_DATA",
          "MANAGE_COMPLIANCE_TEXT",
          "SYNC_HRIS",
          "EXPORT_REPORTS",
        ],
      },
    ];
  }

  static async updateUserPermissions(userId: string, role: string, permissions: string[], updatedBy = "Admin"): Promise<any> {
    try {
      const res = await fetch("/api/admin/users/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role, permissions, updatedBy }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    await simulatedDelay(200);
    return { status: "success", message: "User permissions updated" };
  }

  // --- 3. Compliance Statement Management ---
  static async getComplianceStatement(): Promise<ComplianceStatementSetting> {
    try {
      const res = await fetch("/api/compliance/statement");
      if (res.ok) {
        const json = await res.json();
        if (json.status === "success" && json.data) {
          return json.data;
        }
      }
    } catch {
      // Fallback
    }

    await simulatedDelay(100);
    return {
      id: "SET-COMP-001",
      settingKey: "abc_compliance_declaration_v1",
      title: "Pernyataan Kepatuhan & Kebijakan Anti-Bribery & Anti-Corruption (ABC)",
      statementIndonesian:
        "Dengan ini saya menyatakan bahwa seluruh data dan informasi yang saya sampaikan dalam Formulir Deklarasi Anti-Bribery & Anti-Corruption (ABC) ini adalah BENAR, AKURAT, dan SESUAI dengan fakta yang sebenarnya. Kegiatan ini tidak mengandung unsur suap, gratifikasi ilegal, pemerasan, atau pelanggaran terhadap Kebijakan Anti-Penyuapan Radiant Group dan Peraturan Perundang-undangan yang berlaku.",
      statementEnglish:
        "I hereby declare that all data and information provided in this Anti-Bribery & Anti-Corruption (ABC) Declaration Form is TRUE, ACCURATE, and in accordance with actual facts. This activity contains no bribery, illegal gratification, extortion, or violation of Radiant Group Anti-Bribery Policy and applicable laws.",
      updatedAt: new Date().toISOString(),
      updatedBy: "Compliance Officer",
    };
  }

  static async updateComplianceStatement(
    title: string,
    statementIndonesian: string,
    statementEnglish: string,
    updatedBy = "Compliance Officer"
  ): Promise<any> {
    try {
      const res = await fetch("/api/compliance/statement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          statementIndonesian,
          statementEnglish,
          updatedBy,
        }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    await simulatedDelay(250);
    return {
      status: "success",
      message: "Compliance statement updated",
      data: {
        id: "SET-COMP-001",
        settingKey: "abc_compliance_declaration_v1",
        title,
        statementIndonesian,
        statementEnglish,
        updatedAt: new Date().toISOString(),
        updatedBy,
      },
    };
  }
}
