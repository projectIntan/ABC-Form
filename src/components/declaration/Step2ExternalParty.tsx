import React from "react";
import { ExternalPartyInfo, ActivityType } from "../../types";
import { EXTERNAL_RELATIONSHIPS } from "../../constants/activityTypes";
import { Info } from "lucide-react";

interface Step2ExternalPartyProps {
  data: ExternalPartyInfo;
  activityType: ActivityType;
  onChange: (updated: ExternalPartyInfo) => void;
  errors: Record<string, string>;
}

export const Step2ExternalParty: React.FC<Step2ExternalPartyProps> = ({
  data,
  activityType,
  onChange,
  errors,
}) => {
  const isInternal = activityType === "INTERNAL";

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Informasi Pihak Eksternal</h3>
          <p className="text-xs text-slate-500">
            Detail organisasi/lembaga mitra eksternal yang terlibat dalam kegiatan deklarasi.
          </p>
        </div>
        <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700">
          Kategori: <span className="text-sky-600 font-bold">{isInternal ? "Internal" : "Eksternal"}</span>
        </div>
      </div>

      {isInternal ? (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-bold">No external party involved</p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              Kegiatan yang Anda pilih adalah <strong>Kegiatan Internal</strong>. Field pihak eksternal bersifat opsional / tidak wajib diisi.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-sky-50/50 border border-sky-100 text-sky-900 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-600 shrink-0" />
          <span>Section ini wajib diisi untuk kegiatan yang melibatkan pihak ketiga/eksternal.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-6">
        {/* Nama Perusahaan */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Nama Perusahaan / Organisasi / Lembaga {!isInternal && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            placeholder="Contoh: PT Pertamina Hulu Energi, Chevron..."
            value={data.companyName || ""}
            onChange={(e) => onChange({ ...data, companyName: e.target.value })}
            disabled={isInternal}
            className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400 ${
              errors.companyName ? "border-red-500" : "border-slate-300"
            }`}
          />
          {errors.companyName && (
            <p className="text-[10px] text-red-500 font-medium">{errors.companyName}</p>
          )}
        </div>

        {/* Hubungan */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Hubungan Pihak Eksternal {!isInternal && <span className="text-red-500">*</span>}
          </label>
          <select
            value={data.relationship || ""}
            onChange={(e) => onChange({ ...data, relationship: e.target.value })}
            disabled={isInternal}
            className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400 ${
              errors.relationship ? "border-red-500" : "border-slate-300"
            }`}
          >
            <option value="">-- Pilih Hubungan --</option>
            {EXTERNAL_RELATIONSHIPS.map((rel) => (
              <option key={rel} value={rel}>
                {rel}
              </option>
            ))}
          </select>
          {errors.relationship && (
            <p className="text-[10px] text-red-500 font-medium">{errors.relationship}</p>
          )}
        </div>

        {/* Project Code */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Project Code <span className="text-slate-400 font-normal lowercase">(opsional)</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: PRJ-2026-089 atau N/A"
            value={data.projectCode || ""}
            onChange={(e) => onChange({ ...data, projectCode: e.target.value })}
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
          />
        </div>
      </div>
    </div>
  );
};
