import React, { useState, useMemo } from "react";
import { Search, X, Check, User, AlertCircle } from "lucide-react";
import { Employee } from "../../types";

interface EmployeeLovModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (emp: Employee) => void;
  selectedEntity: string;
  employees: Employee[];
  loading: boolean;
  selectedFullName?: string;
}

export const EmployeeLovModal: React.FC<EmployeeLovModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedEntity,
  employees,
  loading,
  selectedFullName,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return employees;
    const term = searchTerm.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.fullName.toLowerCase().includes(term) ||
        (emp.employeeNumber || emp.employeeId || "").toLowerCase().includes(term) ||
        (emp.positionName || "").toLowerCase().includes(term) ||
        (emp.email || "").toLowerCase().includes(term)
    );
  }, [employees, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 flex flex-col gap-4 max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                PILIH NAMA KARYAWAN
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500">Filter Entitas:</span>
                <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                  {selectedEntity || "Belum dipilih"}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!selectedEntity ? (
          <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
            <h4 className="text-sm font-bold text-amber-900">
              Entitas Perusahaan Belum Dipilih
            </h4>
            <p className="text-xs text-amber-700 max-w-md mx-auto">
              Silakan pilih <strong>Entitas Perusahaan</strong> terlebih dahulu sebelum memilih nama karyawan. Daftar karyawan disaring berdasarkan entitas kerja.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition-colors"
            >
              Kembali & Pilih Entitas
            </button>
          </div>
        ) : (
          <>
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari berdasarkan NIK, nama lengkap, atau jabatan..."
                className="w-full pl-9 pr-9 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium"
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Table Container */}
            <div className="flex-1 overflow-x-auto overflow-y-auto border border-slate-200 rounded-xl min-h-[220px] max-h-[360px]">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200 sticky top-0 z-10 shadow-2xs">
                  <tr>
                    <th className="px-3.5 py-2.5 w-28">NIK / ID</th>
                    <th className="px-3.5 py-2.5">Nama Karyawan</th>
                    <th className="px-3.5 py-2.5">Pangkat / Jabatan</th>
                    <th className="px-3.5 py-2.5 hidden sm:table-cell">Email</th>
                    <th className="px-3.5 py-2.5 w-20 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-400">
                        Memuat data karyawan dari HRIS...
                      </td>
                    </tr>
                  ) : filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-400">
                        Tidak ada data karyawan yang ditemukan untuk entitas "{selectedEntity}".
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((emp) => {
                      const isSelected = selectedFullName === emp.fullName;
                      return (
                        <tr
                          key={emp.employeeId}
                          onClick={() => {
                            onSelect(emp);
                            onClose();
                          }}
                          className={`cursor-pointer transition-colors group ${
                            isSelected
                              ? "bg-sky-50/80 hover:bg-sky-100/70"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <td className="px-3.5 py-3 font-mono font-bold text-xs text-sky-700 whitespace-nowrap">
                            {emp.employeeNumber || emp.employeeId}
                          </td>
                          <td className="px-3.5 py-3">
                            <div className="font-semibold text-slate-900 group-hover:text-sky-900">
                              {emp.fullName}
                            </div>
                            <div className="text-[11px] text-slate-500 sm:hidden">
                              {emp.email}
                            </div>
                          </td>
                          <td className="px-3.5 py-3 text-xs text-slate-600 font-medium">
                            {emp.positionName || "-"}
                          </td>
                          <td className="px-3.5 py-3 text-xs text-slate-500 hidden sm:table-cell">
                            {emp.email || "-"}
                          </td>
                          <td className="px-3.5 py-3 text-center">
                            {isSelected ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-100 px-2.5 py-1 rounded-md">
                                <Check className="w-3.5 h-3.5" /> Terpilih
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelect(emp);
                                  onClose();
                                }}
                                className="px-3 py-1 rounded-md bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-colors shadow-2xs"
                              >
                                Pilih
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Menampilkan {filteredList.length} Karyawan</span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
