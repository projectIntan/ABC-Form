import React, { useState } from "react";
import { CurrencyInput } from "../../common/CurrencyInput";
import { RadiantEmployeeParticipant } from "../../../types";
import { UserPlus, Trash2, Users } from "lucide-react";
import { EmployeeSelectModal } from "../EmployeeSelectModal";

interface ExternalMealFormProps {
  data: {
    date?: string;
    location?: string;
    purpose?: string;
    participantCount?: number;
    radiantEmployees?: RadiantEmployeeParticipant[];
    totalAmount?: number;
  };
  onChange: (updated: Record<string, any>) => void;
  errors: Record<string, string>;
}

export const ExternalMealForm: React.FC<ExternalMealFormProps> = ({
  data,
  onChange,
  errors,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasClickedAdd, setHasClickedAdd] = useState(false);
  const radiantList = data.radiantEmployees || [];
  const participantCount = data.participantCount || 0;

  const showValidation =
    hasClickedAdd ||
    radiantList.length > 0 ||
    Boolean(errors.participantCount) ||
    Boolean(errors.radiantEmployees);

  const isMismatch = showValidation && participantCount > 0 && radiantList.length !== participantCount;

  const handleAddEmployee = (emp: RadiantEmployeeParticipant) => {
    setHasClickedAdd(true);
    const updated = [...radiantList, emp];
    onChange({ ...data, radiantEmployees: updated });
  };

  const handleRemoveEmployee = (empId: string) => {
    const updated = radiantList.filter((e) => e.employeeId !== empId);
    onChange({ ...data, radiantEmployees: updated });
  };

  return (
    <div className="space-y-4">
      <div className="border-l-4 border-emerald-500 pl-3 py-1 bg-emerald-50/50 rounded-r-lg mb-4">
        <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
          Form Detail: Jamuan Makan dengan Pihak Eksternal
        </h4>
        <p className="text-[11px] text-emerald-700">
          Isi detail jamuan makan siang/malam bisnis, daftar peserta internal, dan total anggaran.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tanggal Pelaksanaan */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Tanggal Pelaksanaan <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            value={data.date || ""}
            onChange={(e) => onChange({ ...data, date: e.target.value })}
            className={`w-full p-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
              errors.date ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-slate-200"
            }`}
          />
          {errors.date && <p className="text-xs font-medium text-rose-600">{errors.date}</p>}
        </div>

        {/* Lokasi */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Lokasi Jamuan <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Nama Restoran, Hotel, atau Alamat Lengkap..."
            value={data.location || ""}
            onChange={(e) => onChange({ ...data, location: e.target.value })}
            className={`w-full p-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
              errors.location ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-slate-200"
            }`}
          />
          {errors.location && <p className="text-xs font-medium text-rose-600">{errors.location}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Jumlah Partisipan */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">
              Jumlah Partisipan yang Hadir (Total) <span className="text-rose-500">*</span>
            </label>
            {participantCount > 0 && showValidation && (
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  !isMismatch ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                }`}
              >
                {!isMismatch
                  ? `✓ Sesuai (${radiantList.length}/${participantCount})`
                  : `⚠️ Belum Sesuai (${radiantList.length}/${participantCount})`}
              </span>
            )}
          </div>
          <input
            type="number"
            min={1}
            placeholder="Contoh: 5"
            value={data.participantCount || ""}
            onChange={(e) =>
              onChange({ ...data, participantCount: parseInt(e.target.value, 10) || 0 })
            }
            className={`w-full p-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
              errors.participantCount ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-slate-200"
            }`}
          />
          {errors.participantCount && (
            <p className="text-xs font-medium text-rose-600">{errors.participantCount}</p>
          )}
        </div>

        {/* Total Keseluruhan Biaya */}
        <CurrencyInput
          label="Total Keseluruhan Biaya (Rupiah)"
          required
          value={data.totalAmount || 0}
          onChange={(val) => onChange({ ...data, totalAmount: val })}
          error={errors.totalAmount}
          placeholder="2.500.000"
        />
      </div>

      {/* Tujuan Kegiatan */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700">
          Tujuan Kegiatan / Agenda <span className="text-rose-500">*</span>
        </label>
        <textarea
          rows={3}
          placeholder="Jelaskan hubungan bisnis, topik bahasan, dan urgensi jamuan makan ini..."
          value={data.purpose || ""}
          onChange={(e) => onChange({ ...data, purpose: e.target.value })}
          className={`w-full p-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
            errors.purpose ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-slate-200"
          }`}
        />
        {errors.purpose && <p className="text-xs font-medium text-rose-600">{errors.purpose}</p>}
      </div>

      {/* Summary Meeting */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700">
          Summary Meeting / Ringkasan Rapat <span className="text-rose-500">*</span>
        </label>
        <textarea
          rows={3}
          placeholder="Tuliskan ringkasan hasil pembahasan, keputusan, atau tindak lanjut dari rapat jamuan ini..."
          value={data.summaryMeeting || ""}
          onChange={(e) => onChange({ ...data, summaryMeeting: e.target.value })}
          className={`w-full p-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
            errors.summaryMeeting ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-slate-200"
          }`}
        />
        {errors.summaryMeeting && (
          <p className="text-xs font-medium text-rose-600">{errors.summaryMeeting}</p>
        )}
      </div>

      {/* Dynamic List: Daftar Nama Karyawan Radiant Group yang Hadir */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              Daftar Nama Karyawan Radiant Group yang Hadir ({radiantList.length} Karyawan)
            </h5>
            <p className="text-[11px] text-slate-500">
              Tambahkan anggota tim dari HRIS yang ikut menghadiri kegiatan.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setHasClickedAdd(true);
              setIsModalOpen(true);
            }}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            + Tambah Karyawan
          </button>
        </div>

        {isMismatch && (
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 font-medium">
            <span className="shrink-0 font-bold">⚠️ Perhatian:</span>
            <span>
              Jumlah partisipan ({participantCount}) tidak sama dengan jumlah karyawan di daftar ({radiantList.length}). Silakan sesuaikan jumlah partisipan atau daftar karyawan agar bernilai sama.
            </span>
          </div>
        )}

        {errors.radiantEmployees && (
          <p className="text-xs font-medium text-rose-600">{errors.radiantEmployees}</p>
        )}

        {radiantList.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400 bg-white rounded-lg border border-dashed border-slate-200">
            Belum ada karyawan Radiant Group ditambahkan. Klik tombol di atas untuk menambah.
          </div>
        ) : (
          <div className="space-y-2">
            {radiantList.map((emp) => (
              <div
                key={emp.employeeId}
                className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900">{emp.fullName}</span>
                  <span className="text-slate-500 ml-2">({emp.positionName} - {emp.entityName})</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveEmployee(emp.employeeId)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                  title="Remove employee"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <EmployeeSelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddEmployee={handleAddEmployee}
        existingParticipantIds={radiantList.map((e) => e.employeeId)}
      />
    </div>
  );
};
