import React from "react";
import { DeclarationStatus } from "../../types";

interface BadgeProps {
  status: DeclarationStatus;
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({ status, size = "md" }) => {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs font-semibold";

  switch (status) {
    case "DRAFT":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
          Draft
        </span>
      );
    case "SUBMITTED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          Submitted
        </span>
      );
    case "APPROVED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Approved
        </span>
      );
    case "REJECTED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-800 border border-rose-300 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Rejected
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};
