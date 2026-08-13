import React, { useState } from "react";
import { AlertCircle, X } from "lucide-react";

interface RejectionModalProps {
  isOpen: boolean;
  declarationNumber: string;
  isLoading?: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export const RejectionModal: React.FC<RejectionModalProps> = ({
  isOpen,
  declarationNumber,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Alasan penolakan (rejection reason) wajib diisi.");
      return;
    }
    setError("");
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-4"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Penolakan Deklarasi</h3>
              <p className="text-xs text-slate-500">{declarationNumber}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Alasan Penolakan <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError("");
            }}
            placeholder="Jelaskan alasan penolakan deklarasi ini agar pemohon dapat memperbaikinya..."
            className={`w-full p-3 text-sm rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
              error
                ? "border-rose-400 focus:ring-rose-200"
                : "border-slate-300 focus:ring-slate-200 focus:border-slate-800"
            }`}
          />
          {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            )}
            Tolak Deklarasi
          </button>
        </div>
      </form>
    </div>
  );
};
