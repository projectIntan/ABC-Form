import React from "react";
import { CurrencyInput } from "../../common/CurrencyInput";

interface GiftFormProps {
  data: {
    date?: string;
    description?: string;
    giftReason?: string;
    quantity?: number;
    estimatedPrice?: number;
  };
  onChange: (updated: Record<string, any>) => void;
  errors: Record<string, string>;
}

export const GiftForm: React.FC<GiftFormProps> = ({ data, onChange, errors }) => {
  return (
    <div className="space-y-4">
      <div className="border-l-4 border-emerald-500 pl-3 py-1 bg-emerald-50/50 rounded-r-lg mb-4">
        <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
          Form Detail: Hadiah dari/kepada Pihak Eksternal
        </h4>
        <p className="text-[11px] text-emerald-700">
          Deklarasikan pemberian atau penerimaan hadiah, cenderamata, parcel, atau bingkisan bisnis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tanggal Menerima/Memberi */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Tanggal Menerima/Memberi Hadiah <span className="text-rose-500">*</span>
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

        {/* Kuantitas */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Kuantitas (Jumlah Unit) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            placeholder="1"
            value={data.quantity || ""}
            onChange={(e) =>
              onChange({ ...data, quantity: parseInt(e.target.value, 10) || 0 })
            }
            className={`w-full p-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
              errors.quantity ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-slate-200"
            }`}
          />
          {errors.quantity && <p className="text-xs font-medium text-rose-600">{errors.quantity}</p>}
        </div>

        {/* Estimasi Harga */}
        <CurrencyInput
          label="Estimasi Harga (Rupiah)"
          required
          value={data.estimatedPrice || 0}
          onChange={(val) => onChange({ ...data, estimatedPrice: val })}
          error={errors.estimatedPrice}
          placeholder="500.000"
        />
      </div>

      {/* Deskripsi */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700">
          Deskripsi Hadiah <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Contoh: Plakat Kemitraan Akrilik, Hampers Hari Raya, Souvenir Jam Tangan..."
          value={data.description || ""}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          className={`w-full p-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
            errors.description ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-slate-200"
          }`}
        />
        {errors.description && <p className="text-xs font-medium text-rose-600">{errors.description}</p>}
      </div>

      {/* Alasan Menerima/Memberi */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700">
          Alasan Menerima/Memberi Hadiah <span className="text-rose-500">*</span>
        </label>
        <textarea
          rows={3}
          placeholder="Jelaskan latar belakang, pertimbangan etika bisnis, dan tidak adanya benturan kepentingan..."
          value={data.giftReason || ""}
          onChange={(e) => onChange({ ...data, giftReason: e.target.value })}
          className={`w-full p-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
            errors.giftReason ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-slate-200"
          }`}
        />
        {errors.giftReason && <p className="text-xs font-medium text-rose-600">{errors.giftReason}</p>}
      </div>
    </div>
  );
};
