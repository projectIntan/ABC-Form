import React from "react";
import { CurrencyInput } from "../../common/CurrencyInput";

interface FacilitationFormProps {
  data: {
    date?: string;
    facilitationReason?: string;
    facilitationAmount?: number;
  };
  onChange: (updated: Record<string, any>) => void;
  errors: Record<string, string>;
}

export const FacilitationForm: React.FC<FacilitationFormProps> = ({
  data,
  onChange,
  errors,
}) => {
  return (
    <div className="space-y-4">
      <div className="border-l-4 border-emerald-500 pl-3 py-1 bg-emerald-50/50 rounded-r-lg mb-4">
        <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
          Form Detail: Pembayaran Fasilitasi
        </h4>
        <p className="text-[11px] text-emerald-700">
          Deklarasikan biaya fasilitasi administrasi atau retribusi resmi sesuai dengan perundang-undangan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tanggal Pembayaran */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Tanggal Pembayaran Fasilitasi <span className="text-rose-500">*</span>
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

        {/* Nominal Pembayaran */}
        <CurrencyInput
          label="Nominal Pembayaran Fasilitasi (Rupiah)"
          required
          value={data.facilitationAmount || 0}
          onChange={(val) => onChange({ ...data, facilitationAmount: val })}
          error={errors.facilitationAmount}
          placeholder="500.000"
        />
      </div>

      {/* Alasan Pembayaran */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700">
          Alasan Pembayaran Fasilitasi <span className="text-rose-500">*</span>
        </label>
        <textarea
          rows={4}
          placeholder="Jelaskan dasar regulasi/kebutuhan administrasi resmi untuk pengurusan izin/layanan publik..."
          value={data.facilitationReason || ""}
          onChange={(e) => onChange({ ...data, facilitationReason: e.target.value })}
          className={`w-full p-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
            errors.facilitationReason
              ? "border-rose-400 focus:ring-rose-200"
              : "border-slate-300 focus:ring-slate-200"
          }`}
        />
        {errors.facilitationReason && (
          <p className="text-xs font-medium text-rose-600">{errors.facilitationReason}</p>
        )}
      </div>
    </div>
  );
};
