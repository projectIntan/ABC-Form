import React from "react";
import { DeclarationStatus } from "../../types";
import { formatDateTime } from "../../utils/formatters";
import { CheckCircle2, Clock, XCircle, FileEdit } from "lucide-react";

interface TimelineProps {
  status: DeclarationStatus;
  createdDate: string;
  submittedDate?: string;
  reviewedDate?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  status,
  createdDate,
  submittedDate,
  reviewedDate,
  reviewedBy,
  rejectionReason,
}) => {
  const steps = [
    {
      title: "Created (Draft)",
      date: createdDate,
      isCompleted: true,
      icon: FileEdit,
      color: "bg-slate-700 text-white",
    },
    {
      title: "Submitted",
      date: submittedDate,
      isCompleted: status !== "DRAFT",
      icon: Clock,
      color: status !== "DRAFT" ? "bg-amber-600 text-white" : "bg-slate-200 text-slate-400",
    },
    {
      title: status === "REJECTED" ? "Rejected" : "Approved / Reviewed",
      date: reviewedDate,
      subText: reviewedBy ? `By: ${reviewedBy}` : undefined,
      isCompleted: status === "APPROVED" || status === "REJECTED",
      icon: status === "REJECTED" ? XCircle : CheckCircle2,
      color:
        status === "APPROVED"
          ? "bg-emerald-600 text-white"
          : status === "REJECTED"
          ? "bg-rose-600 text-white"
          : "bg-slate-200 text-slate-400",
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col gap-4">
      <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
        Activity Timeline
      </h3>

      <div className="relative flex flex-col md:flex-row items-start justify-between gap-6 md:gap-0">
        {/* Horizontal Line for Desktop */}
        <div className="hidden md:block absolute top-5 left-10 right-10 h-0.5 bg-slate-200 -z-0"></div>

        {steps.map((step, idx) => {
          const IconComponent = step.icon;
          return (
            <div key={idx} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-2 flex-1 md:text-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xs transition-transform hover:scale-105 shrink-0 ${step.color}`}
              >
                <IconComponent className="w-5 h-5" />
              </div>

              <div className="flex flex-col md:items-center">
                <span className="text-xs font-bold text-slate-900">{step.title}</span>
                <span className="text-xs text-slate-500">
                  {step.date ? formatDateTime(step.date) : "Pending"}
                </span>
                {step.subText && (
                  <span className="text-xs font-medium text-slate-600 mt-0.5">{step.subText}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {status === "REJECTED" && rejectionReason && (
        <div className="mt-2 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs leading-relaxed">
          <p className="font-bold mb-1 flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-rose-600" />
            Alasan Penolakan dari Approver:
          </p>
          <p className="pl-5 text-slate-700">{rejectionReason}</p>
        </div>
      )}
    </div>
  );
};
