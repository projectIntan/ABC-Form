import React from "react";
import { parseRupiahInput } from "../../utils/formatters";

interface CurrencyInputProps {
  label: string;
  value: number;
  onChange: (numericValue: number) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  value,
  onChange,
  error,
  required = false,
  placeholder = "0",
  helperText,
}) => {
  const displayValue = value ? value.toLocaleString("id-ID") : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsed = parseRupiahInput(raw);
    onChange(parsed);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-700 tracking-wide">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative rounded-lg shadow-xs">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-medium text-sm">
          Rp
        </div>
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 transition-all ${
            error
              ? "border-rose-400 focus:ring-rose-200 focus:border-rose-500"
              : "border-slate-300 focus:ring-slate-200 focus:border-slate-800"
          }`}
        />
      </div>
      {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
      {error && <p className="text-xs font-medium text-rose-600 animate-fadeIn">{error}</p>}
    </div>
  );
};
