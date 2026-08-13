import React from "react";
import { CurrencyInput } from "../../common/CurrencyInput";

interface SponsorshipFormProps {
  data: {
    date?: string;
    sponsorshipReason?: string;
    sponsorshipAmount?: number;
  };
  onChange: (updated: Record<string, any>) => void;
  errors: Record<string, string>;
}

export const SponsorshipForm: React.FC<SponsorshipFormProps> = ({
  data,
  onChange,
  errors,
}) => {
  return (
    <div className="space-y-4">
      <div className="border-l-4 border-emerald-500 pl-3 py-1 bg-emerald-50/50 rounded-r-lg mb-4">
        <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
          Form Detail: Sponsor / Donasi
        </h4>
        <p className="text-[11px] text-emerald-700">
          Deklarasikan dukungan sponsor, dana CSR, donasi sosial, atau bantuan ke lembaga eksternal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tanggal Pemberian */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Tanggal Pemberian Sponsor/Donasi <span className="text-rose-500">*</span>
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

        {/* Nominal Sponsor/Donasi */}
        <CurrencyInput
          label="Nominal Sponsor/Donasi (Rupiah)"
          required
          value={data.sponsorshipAmount || 0}
          onChange={(val) => onChange({ ...data, sponsorshipAmount: val })}
          error={errors.sponsorshipAmount}
          placeholder="10.000.000"
        />
      </div>

      {/* Alasan Pemberian */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700">
          Alasan & Tujuan Pemberian Sponsor/Donasi <span className="text-rose-500">*</span>
        </label>
        <textarea
          rows={4}
          placeholder="Jelaskan alasan pemberian, manfaat bagi reputasi/CSR Radiant Group, serta ketersediaan proposal resmi..."
          value={data.sponsorshipReason || ""}
          onChange={(e) => onChange({ ...data, sponsorshipReason: e.target.value })}
          className={`w-full p-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
            errors.sponsorshipReason
              ? "border-rose-400 focus:ring-rose-200"
              : "border-slate-300 focus:ring-slate-200"
          }`}
        />
        {errors.sponsorshipReason && (
          <p className="text-xs font-medium text-rose-600">{errors.sponsorshipReason}</p>
        )}
      </div>
    </div>
  );
};
