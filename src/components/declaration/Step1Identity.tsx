import React, { useState, useEffect } from "react";
import { DeclarationIdentity, ActivityType, Employee } from "../../types";
import {
  ACTIVITY_TYPES,
  ENTITIES,
} from "../../constants/activityTypes";
import {
  User,
  Building2,
  Layers,
  Briefcase,
  Mail,
  IdCard,
  ShieldCheck,
  Search,
  X,
  AlertCircle,
} from "lucide-react";
import { HRISService } from "../../services/hris.service";
import { SbuLovModal } from "./SbuLovModal";
import { DepartmentLovModal } from "./DepartmentLovModal";
import { EmployeeLovModal } from "./EmployeeLovModal";

interface Step1IdentityProps {
  data: DeclarationIdentity;
  onChange: (updated: DeclarationIdentity) => void;
  errors: Record<string, string>;
  isPublic?: boolean;
}

export const Step1Identity: React.FC<Step1IdentityProps> = ({
  data,
  onChange,
  errors,
}) => {
  const [employeeOptions, setEmployeeOptions] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Modal states for LOV tables
  const [isSbuModalOpen, setIsSbuModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);

  // Validation / warning toasts
  const [showSbuRequiredToast, setShowSbuRequiredToast] = useState(false);
  const [showEntityRequiredToast, setShowEntityRequiredToast] = useState(false);

  // Load employees whenever selected Entity changes
  useEffect(() => {
    let isMounted = true;
    if (data.entity && data.entity.trim()) {
      setLoadingEmployees(true);
      HRISService.getEmployeesByEntity(data.entity)
        .then((list) => {
          if (isMounted) {
            setEmployeeOptions(list);
            setLoadingEmployees(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setEmployeeOptions([]);
            setLoadingEmployees(false);
          }
        });
    } else {
      setEmployeeOptions([]);
      setLoadingEmployees(false);
    }
    return () => {
      isMounted = false;
    };
  }, [data.entity]);

  // 1. Entity Change -> Reset Employee, Position, Employee ID / NIK, Email
  const handleEntityChange = (newEntity: string) => {
    onChange({
      ...data,
      entity: newEntity,
      fullName: "",
      position: "",
      employeeId: "",
      email: "",
    });
  };

  // 2. SBU Change -> Reset Department
  const handleSbuChange = (newSbu: string) => {
    onChange({
      ...data,
      sbu: newSbu,
      department: "",
    });
  };

  // 3. Department Change
  const handleDepartmentChange = (newDept: string) => {
    onChange({
      ...data,
      department: newDept,
    });
  };

  // 4. Employee Select from LOV Modal or lookup -> Auto-fill Reference Fields
  const handleEmployeeSelect = (emp: Employee | null) => {
    if (!emp) {
      onChange({
        ...data,
        fullName: "",
        position: "",
        employeeId: "",
        email: "",
      });
      return;
    }

    onChange({
      ...data,
      fullName: emp.fullName,
      position: emp.positionName || "",
      employeeId: emp.employeeNumber || emp.employeeId || "",
      email: emp.email || "",
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 sm:p-8 space-y-6">
      {/* Header Section */}
      <div className="border-b border-slate-100 pb-5">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-sky-600" />
          <span>Informasi Identitas Pelapor</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Data identitas pelapor kegiatan untuk penatausahaan kepatuhan Anti-Bribery & Corruption (ABC).
        </p>
      </div>

      {/* Field Grid - Strict Order:
          1. Entitas Perusahaan (LOV)
          2. SBU (LOV Table Modal)
          3. Departement (LOV Table Modal dependent on SBU)
          4. Nama Karyawan (LOV Table Modal dependent on Entity)
          5. Pangkat / Jabatan (Reference field)
          6. Employee ID / NIK (Reference field)
          7. Email (Reference field)
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Entitas Perusahaan — LOV */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-sky-600" />
            <span>1. Entitas Perusahaan <span className="text-red-500">*</span></span>
          </label>
          <select
            value={data.entity}
            onChange={(e) => handleEntityChange(e.target.value)}
            className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-lg text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${
              errors.entity ? "border-red-500 bg-red-50/30" : "border-slate-200"
            }`}
          >
            <option value="">-- Pilih Entitas Perusahaan --</option>
            {ENTITIES.map((ent) => (
              <option key={ent} value={ent}>
                {ent}
              </option>
            ))}
          </select>
          {errors.entity && (
            <p className="text-[10px] text-red-500 font-medium">{errors.entity}</p>
          )}
        </div>

        {/* 2. SBU — LOV Table Modal */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-600" />
              <span>2. SBU (Strategic Business Unit) <span className="text-red-500">*</span></span>
            </span>
            <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
              LOV Table
            </span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSbuModalOpen(true)}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-lg text-sm font-medium text-left transition-all flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${
                errors.sbu ? "border-red-500 bg-red-50/30" : "border-slate-200 hover:border-sky-400 hover:bg-white"
              }`}
            >
              <span className={data.sbu ? "text-slate-900 font-semibold truncate pr-6" : "text-slate-400"}>
                {data.sbu || "[ Pilih SBU ]"}
              </span>
              <div className="flex items-center gap-1.5 shrink-0 text-slate-400 group-hover:text-sky-600">
                <span className="text-xs font-semibold hidden sm:inline">Cari</span>
                <Search className="w-4 h-4" />
              </div>
            </button>
            {data.sbu && (
              <button
                type="button"
                title="Hapus SBU"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSbuChange("");
                }}
                className="absolute right-10 top-2.5 text-slate-300 hover:text-slate-600 p-0.5 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {errors.sbu && (
            <p className="text-[10px] text-red-500 font-medium">{errors.sbu}</p>
          )}
        </div>

        {/* 3. Departement — LOV Table Modal (Dependent on SBU) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-sky-600" />
              <span>3. Departemen <span className="text-red-500">*</span></span>
            </span>
            <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
              LOV Table
            </span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                if (!data.sbu) {
                  setShowSbuRequiredToast(true);
                  setTimeout(() => setShowSbuRequiredToast(false), 3500);
                  return;
                }
                setIsDeptModalOpen(true);
              }}
              disabled={!data.sbu}
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-medium text-left transition-all flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${
                !data.sbu
                  ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                  : errors.department
                  ? "border-red-500 bg-red-50/30"
                  : "bg-slate-50 border-slate-200 hover:border-sky-400 hover:bg-white"
              }`}
            >
              <span className={data.department ? "text-slate-900 font-semibold truncate pr-6" : "text-slate-400"}>
                {data.department || (!data.sbu ? "-- Pilih SBU Terlebih Dahulu --" : "[ Pilih Departemen ]")}
              </span>
              <div className={`flex items-center gap-1.5 shrink-0 ${!data.sbu ? "text-slate-300" : "text-slate-400 group-hover:text-sky-600"}`}>
                <span className="text-xs font-semibold hidden sm:inline">Cari</span>
                <Search className="w-4 h-4" />
              </div>
            </button>
            {data.department && data.sbu && (
              <button
                type="button"
                title="Hapus Departemen"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDepartmentChange("");
                }}
                className="absolute right-10 top-2.5 text-slate-300 hover:text-slate-600 p-0.5 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {showSbuRequiredToast && !data.sbu && (
            <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1 animate-fadeIn">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> SBU harus dipilih terlebih dahulu sebelum memilih Departemen.
            </p>
          )}
          {errors.department && (
            <p className="text-[10px] text-red-500 font-medium">{errors.department}</p>
          )}
        </div>

        {/* 4. Nama Karyawan — LOV Table Modal (Dependent on Entity) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-sky-600" />
              <span>4. Nama Karyawan <span className="text-red-500">*</span></span>
            </span>
            <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
              LOV Table
            </span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                if (!data.entity) {
                  setShowEntityRequiredToast(true);
                  setTimeout(() => setShowEntityRequiredToast(false), 3500);
                  return;
                }
                setIsEmpModalOpen(true);
              }}
              disabled={!data.entity || loadingEmployees}
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-medium text-left transition-all flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${
                !data.entity
                  ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                  : loadingEmployees
                  ? "bg-slate-50 border-slate-200 text-slate-400 cursor-wait"
                  : errors.fullName
                  ? "border-red-500 bg-red-50/30"
                  : "bg-slate-50 border-slate-200 hover:border-sky-400 hover:bg-white"
              }`}
            >
              <span className={data.fullName ? "text-slate-900 font-semibold truncate pr-6" : "text-slate-400"}>
                {data.fullName
                  ? `${data.fullName}${data.employeeId ? ` (${data.employeeId})` : ""}`
                  : !data.entity
                  ? "-- Pilih Entitas Terlebih Dahulu --"
                  : loadingEmployees
                  ? "Memuat data karyawan..."
                  : "[ Pilih Nama Karyawan ]"}
              </span>
              <div className={`flex items-center gap-1.5 shrink-0 ${!data.entity ? "text-slate-300" : "text-slate-400 group-hover:text-sky-600"}`}>
                <span className="text-xs font-semibold hidden sm:inline">Cari</span>
                <Search className="w-4 h-4" />
              </div>
            </button>
            {data.fullName && (
              <button
                type="button"
                title="Hapus Karyawan"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEmployeeSelect(null);
                }}
                className="absolute right-10 top-2.5 text-slate-300 hover:text-slate-600 p-0.5 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {showEntityRequiredToast && !data.entity && (
            <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1 animate-fadeIn">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Entitas Perusahaan harus dipilih terlebih dahulu sebelum memilih Karyawan.
            </p>
          )}
          {errors.fullName && (
            <p className="text-[10px] text-red-500 font-medium">{errors.fullName}</p>
          )}
        </div>

        {/* 5. Pangkat / Jabatan — Reference Field (Auto-filled from Employee LOV) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <IdCard className="w-3.5 h-3.5 text-slate-500" />
              <span>5. Pangkat / Jabatan</span>
            </label>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              Reference
            </span>
          </div>
          <input
            type="text"
            value={data.position || ""}
            readOnly
            placeholder="Otomatis terisi dari data karyawan"
            className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium cursor-not-allowed select-none focus:outline-none"
          />
        </div>

        {/* 6. Employee ID / NIK — Reference Field (Auto-filled from Employee LOV) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>6. Employee ID / NIK</span>
            </label>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              Reference
            </span>
          </div>
          <input
            type="text"
            value={data.employeeId || ""}
            readOnly
            placeholder="Otomatis terisi dari data karyawan"
            className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-700 font-mono font-medium cursor-not-allowed select-none focus:outline-none"
          />
          {errors.employeeId && (
            <p className="text-[10px] text-red-500 font-medium">{errors.employeeId}</p>
          )}
        </div>

        {/* 7. Email — Reference Field (Auto-filled from Employee LOV) */}
        <div className="space-y-1.5 md:col-span-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>7. Email Resmi</span>
            </label>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              Reference
            </span>
          </div>
          <input
            type="email"
            value={data.email || ""}
            readOnly
            placeholder="Otomatis terisi dari data karyawan"
            className={`w-full px-3.5 py-2.5 bg-slate-100 border rounded-lg text-sm text-slate-700 font-medium cursor-not-allowed select-none focus:outline-none ${
              errors.email ? "border-red-500 bg-red-50/30" : "border-slate-200"
            }`}
          />
          {errors.email && (
            <p className="text-[10px] text-red-500 font-medium">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Jenis Kegiatan Dropdown Selection */}
      <div className="space-y-2 pt-4 border-t border-slate-100">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Jenis Kegiatan <span className="text-red-500">*</span>
        </label>
        <select
          value={data.activityType}
          onChange={(e) =>
            onChange({ ...data, activityType: e.target.value as ActivityType })
          }
          className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm font-medium text-slate-800 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all ${
            errors.activityType ? "border-red-500" : "border-slate-300"
          }`}
        >
          {ACTIVITY_TYPES.map((act) => (
            <option key={act.type} value={act.type}>
              {act.label}
            </option>
          ))}
        </select>
        {errors.activityType && (
          <p className="text-[10px] text-red-500 font-medium">{errors.activityType}</p>
        )}

        {/* Selected Activity Hint Box */}
        {data.activityType && (
          <div className="p-3.5 bg-sky-50/70 border border-sky-100 rounded-lg text-xs text-slate-600 mt-2 flex items-start gap-2">
            <span className="font-bold text-sky-700 shrink-0">Petunjuk Kepatuhan:</span>
            <span>
              {ACTIVITY_TYPES.find((a) => a.type === data.activityType)?.description}
            </span>
          </div>
        )}
      </div>

      {/* LOV Popup Modals with Tables */}
      <SbuLovModal
        isOpen={isSbuModalOpen}
        onClose={() => setIsSbuModalOpen(false)}
        onSelect={(sbuItem) => handleSbuChange(sbuItem.name)}
        selectedSbuName={data.sbu}
      />

      <DepartmentLovModal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        onSelect={(deptItem) => handleDepartmentChange(deptItem.name)}
        selectedSbuName={data.sbu || ""}
        selectedDepartmentName={data.department}
      />

      <EmployeeLovModal
        isOpen={isEmpModalOpen}
        onClose={() => setIsEmpModalOpen(false)}
        onSelect={(emp) => handleEmployeeSelect(emp)}
        selectedEntity={data.entity}
        employees={employeeOptions}
        loading={loadingEmployees}
        selectedFullName={data.fullName}
      />
    </div>
  );
};
