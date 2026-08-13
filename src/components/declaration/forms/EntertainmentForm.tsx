import React from "react";

interface EntertainmentFormProps {
  data: {
    entertainmentType?: string;
    date?: string;
    entertainmentReason?: string;
    entertainmentVenue?: string;
  };
  onChange: (updated: Record<string, any>) => void;
  errors: Record<string, string>;
}

export const EntertainmentForm: React.FC<EntertainmentFormProps> = ({
  data,
  onChange,
  errors,
}) => {
  return (
    <div className="space-y-4">
      <div className="border-l-4 border-emerald-500 pl-3 py-1 bg-emerald-50/50 rounded-r-lg mb-4">
        <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
          Form Detail: Menerima Hiburan dari Pihak Eksternal
        </h4>
        <p className="text-[11px] text-emerald-700">
          Deklarasikan fasilitas hiburan, konser, undangan VIP, atau sarana rekreasi yang diterima dari pihak ketiga.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Jenis Hiburan yang Diterima */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Jenis Hiburan yang Diterima <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: Tiket Konser VIP, Undangan Gala Dinner & Show..."
            value={data.entertainmentType || ""}
            onChange={(e) => onChange({ ...data, entertainmentType: e.target.value })}
            className={`w-full p-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
              errors.entertainmentType
                ? "border-rose-400 focus:ring-rose-200"
                : "border-slate-300 focus:ring-slate-200"
            }`}
          />
          {errors.entertainmentType && (
            <p className="text-xs font-medium text-rose-600">{errors.entertainmentType}</p>
          )}
        </div>

        {/* Tanggal Pelaksanaan Penerimaan Hiburan */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Tanggal Pelaksanaan Penerimaan Hiburan <span className="text-rose-500">*</span>
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
      </div>

      {/* Nama Tempat Hiburan dari Pihak Eksternal */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700">
          Nama Tempat Hiburan dari Pihak Eksternal <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Contoh: Ballroom Hotel Indonesia Kempinski, Stadion Gelora Bung Karno..."
          value={data.entertainmentVenue || ""}
          onChange={(e) => onChange({ ...data, entertainmentVenue: e.target.value })}
          className={`w-full p-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
            errors.entertainmentVenue
              ? "border-rose-400 focus:ring-rose-200"
              : "border-slate-300 focus:ring-slate-200"
          }`}
        />
        {errors.entertainmentVenue && (
          <p className="text-xs font-medium text-rose-600">{errors.entertainmentVenue}</p>
        )}
      </div>

      {/* Alasan Penerimaan Hiburan */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700">
          Alasan Penerimaan Hiburan <span className="text-rose-500">*</span>
        </label>
        <textarea
          rows={3}
          placeholder="Jelaskan hubungan bisnis, alasan profesional penerimaan, serta konfirmasi independensi tugas..."
          value={data.entertainmentReason || ""}
          onChange={(e) => onChange({ ...data, entertainmentReason: e.target.value })}
          className={`w-full p-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
            errors.entertainmentReason
              ? "border-rose-400 focus:ring-rose-200"
              : "border-slate-300 focus:ring-slate-200"
          }`}
        />
        {errors.entertainmentReason && (
          <p className="text-xs font-medium text-rose-600">{errors.entertainmentReason}</p>
        )}
      </div>
    </div>
  );
};
