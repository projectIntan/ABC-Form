import React from "react";
import { DeclarationIdentity, ActivityType } from "../../types";
import { ACTIVITY_TYPES } from "../../constants/activityTypes";
import { UserCheck } from "lucide-react";

interface Step1IdentityProps {
  data: DeclarationIdentity;
  onChange: (updated: DeclarationIdentity) => void;
  errors: Record<string, string>;
}

export const Step1Identity: React.FC<Step1IdentityProps> = ({
  data,
  onChange,
  errors,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Informasi Pelapor</h3>
          <p className="text-xs text-slate-500">
            Profil pelapor terisi otomatis secara terverifikasi dari data HRIS Radiant Group.
          </p>
        </div>
        <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700">
          Status: <span className="text-sky-600 font-bold">Terverifikasi HRIS</span>
        </div>
      </div>

      {/* HRIS Readonly Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Nama Lengkap</label>
          <input
            type="text"
            value={data.fullName}
            readOnly
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none cursor-default font-medium"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Employee ID</label>
          <input
            type="text"
            value={data.employeeId}
            readOnly
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-mono focus:outline-none cursor-default font-medium"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Email Resmi</label>
          <input
            type="text"
            value={data.email}
            readOnly
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none cursor-default font-medium"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Entitas Perusahaan</label>
          <input
            type="text"
            value={data.entity}
            readOnly
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-sky-700 font-bold focus:outline-none cursor-default"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Pangkat / Jabatan</label>
          <input
            type="text"
            value={data.position}
            readOnly
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none cursor-default font-medium"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">SBU (Strategic Business Unit)</label>
          <input
            type="text"
            value={data.sbu || data.organizationHierarchy || "-"}
            readOnly
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none cursor-default font-medium"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Departemen</label>
          <input
            type="text"
            value={data.department || "-"}
            readOnly
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none cursor-default font-medium"
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
          <div className="p-4 bg-sky-50/50 border border-sky-100 rounded-lg text-xs text-slate-600 mt-3 flex items-start gap-2">
            <span className="font-bold text-sky-700 shrink-0">Petunjuk:</span>
            <span>
              {ACTIVITY_TYPES.find((a) => a.type === data.activityType)?.description}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
