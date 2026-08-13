import React, { useState, useEffect } from "react";
import { Search, UserPlus, X, Check } from "lucide-react";
import { Employee, RadiantEmployeeParticipant } from "../../types";
import { HRISService } from "../../services/hris.service";

interface EmployeeSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (emp: RadiantEmployeeParticipant) => void;
  existingParticipantIds: string[];
}

export const EmployeeSelectModal: React.FC<EmployeeSelectModalProps> = ({
  isOpen,
  onClose,
  onAddEmployee,
  existingParticipantIds,
}) => {
  const [query, setQuery] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadEmployees("");
    }
  }, [isOpen]);

  const loadEmployees = async (q: string) => {
    setLoading(true);
    try {
      const res = await HRISService.searchEmployees(q);
      setEmployees(res);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    loadEmployees(val);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-4 max-h-[85vh]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            <h3>Pilih Karyawan Radiant Group (HRIS)</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Cari nama, jabatan, atau nomor induk karyawan..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600"
          />
        </div>

        {/* List of Employees */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[240px]">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading HRIS records...</div>
          ) : employees.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">Tidak ada karyawan ditemukan.</div>
          ) : (
            employees.map((emp) => {
              const isAdded = existingParticipantIds.includes(emp.employeeId);
              return (
                <div
                  key={emp.employeeId}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isAdded ? "bg-slate-50 border-slate-200 opacity-60" : "bg-white border-slate-200 hover:border-emerald-500 hover:shadow-2xs"
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{emp.fullName}</p>
                    <p className="text-[11px] text-slate-500">
                      {emp.positionName} • {emp.entityName}
                    </p>
                  </div>
                  {isAdded ? (
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Added
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onAddEmployee({
                          employeeId: emp.employeeId,
                          fullName: emp.fullName,
                          positionName: emp.positionName,
                          entityName: emp.entityName,
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-2xs"
                    >
                      Pilih
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
