import React, { useState } from "react";
import { DeclarationIdentity, ActivityType, RadiantEmployeeParticipant } from "../../types";
import { ACTIVITY_TYPES } from "../../constants/activityTypes";
import { Search, User } from "lucide-react";
import { EmployeeSelectModal } from "./EmployeeSelectModal";

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
  isPublic = false,
}) => {
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

  const handleSelectEmployee = (emp: RadiantEmployeeParticipant) => {
    const emailPrefix = emp.fullName.toLowerCase().replace(/\s+/g, ".");
    onChange({
      ...data,
      employeeId: emp.employeeId,
      fullName: emp.fullName,
      position: emp.positionName,
      entity: emp.entityName,
      email: `${emailPrefix}@radiant.co.id`,
    });
    setIsEmployeeModalOpen(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-sky-600" />
            <span>Informasi Identitas Pelapor</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Data identitas pelapor kegiatan untuk penatausahaan kepatuhan Anti-Bribery & Corruption (ABC).
          </p>
        </div>

        {/* HRIS Employee Picker Button for Public Submitter */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEmployeeModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs border border-sky-200 transition-colors shadow-2xs cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Pilih Pegawai dari HRIS</span>
          </button>
          <div className="hidden sm:inline-flex px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600">
            Status: <span className="text-sky-600 font-bold ml-1">Terverifikasi HRIS</span>
          </div>
        </div>
      </div>

      {/* HRIS Employee Selection Modal */}
      <EmployeeSelectModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onAddEmployee={handleSelectEmployee}
        existingParticipantIds={[]}
      />

      {/* HRIS Metadata Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.fullName}
            onChange={(e) => onChange({ ...data, fullName: e.target.value })}
            placeholder="Masukkan nama lengkap pelapor"
            className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${
              errors.fullName ? "border-red-500 bg-red-50/30" : "border-slate-200"
            }`}
          />
          {errors.fullName && (
            <p className="text-[10px] text-red-500 font-medium">{errors.fullName}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Employee ID / NIK <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.employeeId}
            onChange={(e) => onChange({ ...data, employeeId: e.target.value })}
            placeholder="e.g. EMP001 / 2608001"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Email Resmi <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
            placeholder="nama@radiant.co.id"
            className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${
              errors.email ? "border-red-500 bg-red-50/30" : "border-slate-200"
            }`}
          />
          {errors.email && (
            <p className="text-[10px] text-red-500 font-medium">{errors.email}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Entitas Perusahaan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.entity}
            onChange={(e) => onChange({ ...data, entity: e.target.value })}
            placeholder="PT Radiant Utama Interinsco Tbk"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-sky-700 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Pangkat / Jabatan
          </label>
          <input
            type="text"
            value={data.position}
            onChange={(e) => onChange({ ...data, position: e.target.value })}
            placeholder="e.g. Operations Supervisor"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Departemen / SBU
          </label>
          <input
            type="text"
            value={data.department || data.sbu || "Operations & Field Management"}
            onChange={(e) => onChange({ ...data, department: e.target.value })}
            placeholder="Operations & Field Management"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
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
    </div>
  );
};
