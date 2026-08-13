import React, { useState, useEffect } from "react";
import { HRISService } from "../services/hris.service";
import { AdminService, MasterActivityType, UserPermissionItem, ComplianceStatementSetting } from "../services/admin.service";
import { Employee } from "../types";
import { useToast } from "../context/ToastContext";
import {
  Users as UsersIcon,
  Search,
  ShieldCheck,
  Building2,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  FileText,
  Save,
  CheckCircle2,
  Network,
  Lock,
  Layers,
  ChevronRight,
  Globe,
  Briefcase
} from "lucide-react";

export const Users: React.FC = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<"HRIS" | "MASTER" | "PERMISSIONS" | "COMPLIANCE">("HRIS");

  // --- HRIS Tab State ---
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [structureData, setStructureData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<any>(null);

  // --- Master Activity Types Tab State ---
  const [activityTypes, setActivityTypes] = useState<MasterActivityType[]>([]);
  const [actModalOpen, setActModalOpen] = useState(false);
  const [editingAct, setEditingAct] = useState<Partial<MasterActivityType>>({});

  // --- Permissions Tab State ---
  const [userPermissions, setUserPermissions] = useState<UserPermissionItem[]>([]);
  const [editingUserPerm, setEditingUserPerm] = useState<UserPermissionItem | null>(null);

  // --- Compliance Statement Tab State ---
  const [complianceSetting, setComplianceSetting] = useState<ComplianceStatementSetting | null>(null);
  const [statementTitle, setStatementTitle] = useState("");
  const [statementIndo, setStatementIndo] = useState("");
  const [statementEng, setStatementEng] = useState("");
  const [isSavingCompliance, setIsSavingCompliance] = useState(false);

  const [loading, setLoading] = useState(true);

  // Load Initial Data
  useEffect(() => {
    async function loadAllData() {
      setLoading(true);
      try {
        const empList = await HRISService.getAllEmployees();
        setEmployees(empList);

        const struct = await HRISService.getHrisStructure();
        setStructureData(struct);

        const acts = await AdminService.getActivityTypes();
        setActivityTypes(acts);

        const uPerms = await AdminService.getUsersWithPermissions();
        setUserPermissions(uPerms);

        const compStmt = await AdminService.getComplianceStatement();
        setComplianceSetting(compStmt);
        if (compStmt) {
          setStatementTitle(compStmt.title);
          setStatementIndo(compStmt.statementIndonesian);
          setStatementEng(compStmt.statementEnglish);
        }
      } catch (err) {
        console.error("Failed to load admin data", err);
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, []);

  // Handler HRIS Sync
  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      const res = await HRISService.triggerHrisSync("Admin System");
      setLastSyncResult(res);
      addToast("success", "API HRIS Sync Berhasil!", res.message);
      
      // Refresh list
      const empList = await HRISService.getAllEmployees();
      setEmployees(empList);
      const struct = await HRISService.getHrisStructure();
      setStructureData(struct);
    } catch (e) {
      addToast("error", "Sync Gagal", "Gagal menghubungkan ke service HRIS API.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Handler Save Activity Type
  const handleSaveActivityType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAct.code?.strip?.() && !editingAct.code) {
      addToast("error", "Validasi Gagal", "Kode Kegiatan tidak boleh kosong.");
      return;
    }
    if (!editingAct.name) {
      addToast("error", "Validasi Gagal", "Nama Jenis Kegiatan tidak boleh kosong.");
      return;
    }
    try {
      await AdminService.saveActivityType(editingAct);
      addToast("success", "Master Jenis Kegiatan Disimpan", "Data jenis kegiatan berhasil diperbarui di database.");
      setActModalOpen(false);
      const acts = await AdminService.getActivityTypes();
      setActivityTypes(acts);
    } catch (err: any) {
      addToast("error", "Gagal Menyimpan", err?.message || "Terjadi kesalahan saat menyimpan master data.");
    }
  };

  // Handler Delete Activity Type
  const handleDeleteActivityType = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus jenis kegiatan ini?")) return;
    try {
      await AdminService.deleteActivityType(id);
      addToast("success", "Dihapus", "Jenis kegiatan berhasil dihapus.");
      const acts = await AdminService.getActivityTypes();
      setActivityTypes(acts);
    } catch {
      addToast("error", "Gagal Hapus", "Terjadi kesalahan.");
    }
  };

  // Handler Save User Permissions
  const handleSaveUserPermissions = async (userItem: UserPermissionItem) => {
    try {
      await AdminService.updateUserPermissions(userItem.id, userItem.role, userItem.permissions, "Admin");
      addToast("success", "Permission Disimpan", `Hak akses user ${userItem.fullName} berhasil diperbarui.`);
      setEditingUserPerm(null);
      const uPerms = await AdminService.getUsersWithPermissions();
      setUserPermissions(uPerms);
    } catch {
      addToast("error", "Gagal Update", "Gagal mengubah permission user.");
    }
  };

  // Handler Save Compliance Statement
  const handleSaveComplianceStatement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCompliance(true);
    try {
      const updated = await AdminService.updateComplianceStatement(statementTitle, statementIndo, statementEng, "Compliance Officer");
      setComplianceSetting(updated.data || updated);
      addToast("success", "Kalimat Deklarasi Disimpan!", "Teks deklarasi kepatuhan pada Step 4 telah berhasil diperbarui di seluruh sistem.");
    } catch {
      addToast("error", "Gagal Menyimpan", "Terjadi kesalahan saat menyimpan deklarasi kepatuhan.");
    } finally {
      setIsSavingCompliance(false);
    }
  };

  const ALL_PERMISSIONS = [
    { code: "CREATE_DECLARATION", label: "Membuat Deklarasi ABC (Create Form)" },
    { code: "APPROVE_DECLARATION", label: "Persetujuan / Approval Deklarasi" },
    { code: "VIEW_ALL_DECLARATIONS", label: "Melihat Seluruh Deklarasi Organization" },
    { code: "MANAGE_USERS", label: "Kelola User & Hak Akses (RBAC)" },
    { code: "MANAGE_MASTER_DATA", label: "Kelola Master Jenis Kegiatan" },
    { code: "MANAGE_COMPLIANCE_TEXT", label: "Ubah Kalimat Deklarasi Kepatuhan" },
    { code: "SYNC_HRIS", label: "Sinkronisasi API HRIS & Struktur Organisasi" },
    { code: "EXPORT_REPORTS", label: "Ekspor Laporan Audit & Analytics" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0f172a] text-white rounded-3xl p-6 border border-slate-800 shadow-md">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 font-bold text-[10px] uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> SYSTEM CONTROL CENTER & CONFIG
          </div>
          <h1 className="text-xl font-extrabold text-white">Administrasi & Modul Kepatuhan</h1>
          <p className="text-xs text-slate-300 mt-1">
            Kelola sinkronisasi HRIS, struktur organisasi, master jenis kegiatan, hak akses permission user, dan kalimat deklarasi kepatuhan.
          </p>
        </div>

        {activeTab === "HRIS" && (
          <button
            onClick={handleTriggerSync}
            disabled={isSyncing}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Sinkronisasi API HRIS..." : "Sinkronkan API HRIS"}
          </button>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("HRIS")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === "HRIS"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Network className="w-4 h-4 text-sky-400" />
          <span>HRIS & Struktur Organisasi</span>
        </button>

        <button
          onClick={() => setActiveTab("MASTER")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === "MASTER"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Master Jenis Kegiatan</span>
        </button>

        <button
          onClick={() => setActiveTab("PERMISSIONS")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === "PERMISSIONS"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Lock className="w-4 h-4 text-amber-400" />
          <span>Akses & Permission User</span>
        </button>

        <button
          onClick={() => setActiveTab("COMPLIANCE")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === "COMPLIANCE"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <FileText className="w-4 h-4 text-purple-400" />
          <span>Kalimat Deklarasi Kepatuhan</span>
        </button>
      </div>

      {/* --- TAB 1: HRIS & STRUKTUR ORGANISASI --- */}
      {activeTab === "HRIS" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Sync Status Banner */}
          {lastSyncResult && (
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-xs flex items-start gap-3 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Status Sinkronisasi Terakhir (API Response):</p>
                <p className="text-sky-800 mt-0.5">{lastSyncResult.message}</p>
                <span className="text-[10px] text-sky-600 font-mono block mt-1">
                  Sync ID: {lastSyncResult.syncId} | Time: {new Date(lastSyncResult.syncedAt).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          )}

          {/* Org Hierarchy Visualizer */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Network className="w-4 h-4 text-sky-600" />
                  Struktur Organisasi Sync HRIS
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hierarki pelaporan bertingkat (SBU &gt; Departemen &gt; Pejabat &gt; Bawahan) yang terhubung otomatis dari API HRIS.
                </p>
              </div>

              <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                Total Karyawan: {employees.length} Orang
              </span>
            </div>

            {structureData?.structure && (
              <div className="space-y-4 pt-2">
                {Object.entries(structureData.structure).map(([sbuName, departments]: [string, any]) => (
                  <div key={sbuName} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                    <div className="bg-slate-100/80 px-4 py-3 font-bold text-xs text-slate-800 flex items-center gap-2 border-b border-slate-200">
                      <Building2 className="w-4 h-4 text-sky-600" />
                      <span>{sbuName}</span>
                    </div>

                    <div className="p-4 space-y-3">
                      {Object.entries(departments).map(([deptName, empList]: [string, any]) => (
                        <div key={deptName} className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-sky-800 flex items-center gap-1.5">
                              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                              Departemen: {deptName}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {empList.length} Anggota
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
                            {empList.map((e: any) => (
                              <div key={e.employeeId} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 text-xs">
                                <p className="font-bold text-slate-900">{e.fullName}</p>
                                <span className="text-[10px] font-mono text-slate-400 block font-semibold">
                                  NIK: {e.employeeNumber}
                                </span>
                                <p className="text-[11px] text-sky-700 font-medium mt-0.5">{e.positionName}</p>
                                <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                                  <ChevronRight className="w-3 h-3 text-slate-400" />
                                  Supervisor: {e.directSupervisor}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Searchable Employees Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <UsersIcon className="w-4 h-4 text-sky-600" />
                  Daftar Master Data Karyawan (HRIS Master List)
                </h3>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari NIK / Nama / Jabatan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700 border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                  <tr>
                    <th className="p-3">NIK / Employee ID</th>
                    <th className="p-3">Nama Lengkap</th>
                    <th className="p-3">Email & Kontak</th>
                    <th className="p-3">Jabatan & Departemen</th>
                    <th className="p-3">Entitas Radiant</th>
                    <th className="p-3">Atasan Langsung</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees
                    .filter(
                      (e) =>
                        !searchQuery ||
                        e.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        e.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        e.positionName.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((emp) => (
                      <tr key={emp.employeeId} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-900">{emp.employeeId}</td>
                        <td className="p-3 font-bold text-slate-900">{emp.fullName}</td>
                        <td className="p-3 text-slate-600">{emp.email}</td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-800 block">{emp.positionName}</span>
                          <span className="text-[10px] text-slate-400 block">{emp.department}</span>
                        </td>
                        <td className="p-3 font-bold text-sky-700">{emp.entityName}</td>
                        <td className="p-3 text-slate-600">{emp.managerName || "Budi Santoso (VP)"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: MASTER JENIS KEGIATAN --- */}
      {activeTab === "MASTER" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  Master jenis kegiatan Anti-Bribery & Anti-Corruption (ABC)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Atur aturan jenis kegiatan, batasan nominal maksimum (threshold), dan syarat wajib pihak eksternal/partisipan.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingAct({
                    code: "",
                    name: "",
                    category: "GENERAL",
                    description: "",
                    requiresExternalParty: true,
                    requiresParticipants: true,
                    maxAmountThreshold: 1000000,
                    isActive: true,
                  });
                  setActModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs shrink-0"
              >
                <Plus className="w-4 h-4" />
                Tambah Jenis Kegiatan Baru
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700 border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                  <tr>
                    <th className="p-3">Kode Kegiatan</th>
                    <th className="p-3">Nama Jenis Kegiatan</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Maksimal Nominal (Rp)</th>
                    <th className="p-3">Aturan Syarat</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activityTypes.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">{act.code}</td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{act.name}</span>
                        <span className="text-[10px] text-slate-500 block">{act.description}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                          {act.category}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-emerald-700 font-mono">
                        {act.maxAmountThreshold ? `Rp ${act.maxAmountThreshold.toLocaleString("id-ID")}` : "Tidak Ada Limit"}
                      </td>
                      <td className="p-3 text-[10px] space-y-0.5">
                        <span className={`block font-semibold ${act.requiresExternalParty ? "text-sky-700" : "text-slate-400"}`}>
                          • Pihak Eksternal: {act.requiresExternalParty ? "WAJIB" : "OPSIONAL"}
                        </span>
                        <span className={`block font-semibold ${act.requiresParticipants ? "text-purple-700" : "text-slate-400"}`}>
                          • Daftar Partisipan: {act.requiresParticipants ? "WAJIB" : "OPSIONAL"}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            act.isActive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {act.isActive ? "AKTIF" : "NONAKTIF"}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingAct(act);
                              setActModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-sky-600 rounded-lg hover:bg-sky-50"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteActivityType(act.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: AKSES & PERMISSION USER --- */}
      {activeTab === "PERMISSIONS" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                Manajemen Hak Akses User & Role (RBAC)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Atur peran (Role) dan izin granular untuk setiap pengguna yang terdaftar di portal Anti-Bribery.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {userPermissions.map((userItem) => (
                <div
                  key={userItem.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-2xs hover:border-slate-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-slate-900">{userItem.fullName}</h3>
                        <span className="text-[11px] font-mono font-semibold text-slate-400">({userItem.username})</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {userItem.positionName} • {userItem.entityName}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                          userItem.role === "ADMIN"
                            ? "bg-purple-100 text-purple-900 border border-purple-200"
                            : userItem.role === "APPROVER"
                            ? "bg-amber-100 text-amber-900 border border-amber-200"
                            : "bg-slate-100 text-slate-800 border border-slate-200"
                        }`}
                      >
                        Role: {userItem.role}
                      </span>

                      <button
                        onClick={() =>
                          setEditingUserPerm(editingUserPerm?.id === userItem.id ? null : { ...userItem })
                        }
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        {editingUserPerm?.id === userItem.id ? "Batal Edit" : "Atur Hak Akses"}
                      </button>
                    </div>
                  </div>

                  {/* Active Permissions List Display */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                      Granular Permission Flag ({userItem.permissions.length} Akses Terdaftar):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {userItem.permissions.map((p) => {
                        const meta = ALL_PERMISSIONS.find((item) => item.code === p);
                        return (
                          <span
                            key={p}
                            className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-800 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3 h-3 text-sky-600" />
                            {meta?.label || p}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Permission Editor Drawer */}
                  {editingUserPerm?.id === userItem.id && (
                    <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-xs font-bold text-slate-900">Ubah Role & Permission User</span>
                        <select
                          value={editingUserPerm.role}
                          onChange={(e) => setEditingUserPerm({ ...editingUserPerm, role: e.target.value })}
                          className="px-3 py-1 rounded-lg border border-slate-300 font-bold text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          <option value="EMPLOYEE">EMPLOYEE (Pelapor)</option>
                          <option value="APPROVER">APPROVER (Atasan / Manager)</option>
                          <option value="COMPLIANCE_OFFICER">COMPLIANCE_OFFICER (Tim Kepatuhan)</option>
                          <option value="ADMIN">ADMIN (Administrator Utama)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {ALL_PERMISSIONS.map((p) => {
                          const isChecked = editingUserPerm.permissions.includes(p.code);
                          return (
                            <label
                              key={p.code}
                              className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-200 hover:border-sky-500 cursor-pointer text-xs"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const newPerms = e.target.checked
                                    ? [...editingUserPerm.permissions, p.code]
                                    : editingUserPerm.permissions.filter((item) => item !== p.code);
                                  setEditingUserPerm({ ...editingUserPerm, permissions: newPerms });
                                }}
                                className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500 cursor-pointer"
                              />
                              <span className="font-medium text-slate-800">{p.label}</span>
                            </label>
                          );
                        })}
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => handleSaveUserPermissions(editingUserPerm)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                        >
                          <Save className="w-4 h-4" />
                          Simpan Perubahan Hak Akses
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: KALIMAT DEKLARASI KEPATUHAN --- */}
      {activeTab === "COMPLIANCE" && (
        <div className="space-y-6 animate-fadeIn">
          <form onSubmit={handleSaveComplianceStatement} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  Pengaturan Kalimat Teks Deklarasi Kepatuhan ABC
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ubah kalimat komitmen transparansi & pernyataan kepatuhan resmi yang muncul pada Step 4 Review Formulir Deklarasi.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSavingCompliance}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm shrink-0 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSavingCompliance ? "Menyimpan..." : "Simpan Perubahan Kalimat"}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Judul Dokumen Deklarasi Kepatuhan
                </label>
                <input
                  type="text"
                  value={statementTitle}
                  onChange={(e) => setStatementTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Pernyataan Kepatuhan (Bahasa Indonesia)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Teks resmi pada Step 4</span>
                </label>
                <textarea
                  rows={4}
                  value={statementIndo}
                  onChange={(e) => setStatementIndo(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 font-medium leading-relaxed text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Compliance Statement (English Version)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Official English translation</span>
                </label>
                <textarea
                  rows={4}
                  value={statementEng}
                  onChange={(e) => setStatementEng(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 font-medium leading-relaxed text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Live Interactive Preview Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  Pratinjau Langsung (Live Form Preview - Step 4):
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-semibold">F-COMP-001-01</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <h4 className="font-extrabold text-slate-900">{statementTitle}</h4>
                <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-100 text-slate-800 leading-relaxed font-medium">
                  {statementIndo}
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-600 italic leading-relaxed">
                  "{statementEng}"
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Modal Edit/Add Master Activity Type */}
      {actModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900">
                {editingAct.id ? "Edit Master Jenis Kegiatan" : "Tambah Jenis Kegiatan Baru"}
              </h3>
              <button
                type="button"
                onClick={() => setActModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveActivityType} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Kode Kegiatan</label>
                <input
                  type="text"
                  placeholder="Contoh: EXTERNAL_MEAL, ENTERTAINMENT, GIFT"
                  value={editingAct.code || ""}
                  onChange={(e) => setEditingAct({ ...editingAct, code: e.target.value.toUpperCase() })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nama Jenis Kegiatan</label>
                <input
                  type="text"
                  placeholder="Contoh: Jamuan Makan Luar Perusahaan"
                  value={editingAct.name || ""}
                  onChange={(e) => setEditingAct({ ...editingAct, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Kategori</label>
                  <select
                    value={editingAct.category || "GENERAL"}
                    onChange={(e) => setEditingAct({ ...editingAct, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="MEAL">MEAL (Jamuan)</option>
                    <option value="ENTERTAINMENT">ENTERTAINMENT (Hiburan)</option>
                    <option value="GIFT">GIFT (Hadiah)</option>
                    <option value="FACILITATION">FACILITATION (Biaya Fasilitasi)</option>
                    <option value="SPONSORSHIP">SPONSORSHIP (Sponsor)</option>
                    <option value="RECREATIONAL">RECREATIONAL (Olahraga)</option>
                    <option value="INTERNAL">INTERNAL (Internal)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Maksimal Nominal (Rp)</label>
                  <input
                    type="number"
                    value={editingAct.maxAmountThreshold || 0}
                    onChange={(e) => setEditingAct({ ...editingAct, maxAmountThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Deskripsi Ringkas</label>
                <textarea
                  rows={2}
                  value={editingAct.description || ""}
                  onChange={(e) => setEditingAct({ ...editingAct, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingAct.requiresExternalParty ?? true}
                    onChange={(e) => setEditingAct({ ...editingAct, requiresExternalParty: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-semibold text-slate-800">Mewajibkan Informasi Pihak Eksternal (Step 2)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingAct.requiresParticipants ?? true}
                    onChange={(e) => setEditingAct({ ...editingAct, requiresParticipants: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-semibold text-slate-800">Mewajibkan Input Jumlah & Daftar Partisipan</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingAct.isActive ?? true}
                    onChange={(e) => setEditingAct({ ...editingAct, isActive: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-semibold text-slate-800">Status Aktif (Tersedia pada Form Deklarasi)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-xs"
                >
                  Simpan Master Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
