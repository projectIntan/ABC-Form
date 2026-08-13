import React from "react";
import { User, Building2, FileText, CheckCircle } from "lucide-react";
import { ActivityType } from "../../types";

interface WizardProgressProps {
  currentStep: number;
  activityType?: ActivityType;
  onStepClick: (step: number) => void;
}

export const WizardProgress: React.FC<WizardProgressProps> = ({
  currentStep,
  activityType = "INTERNAL",
  onStepClick,
}) => {
  const isInternal = activityType === "INTERNAL";

  const steps = isInternal
    ? [
        { number: 1, label: "Identitas", icon: User },
        { number: 2, label: "Detail Kegiatan", icon: FileText },
        { number: 3, label: "Review & Deklarasi", icon: CheckCircle },
      ]
    : [
        { number: 1, label: "Identitas", icon: User },
        { number: 2, label: "Pihak Eksternal", icon: Building2 },
        { number: 3, label: "Detail Kegiatan", icon: FileText },
        { number: 4, label: "Review & Deklarasi", icon: CheckCircle },
      ];

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs mb-8">
      <div className="relative flex items-center justify-between">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-0 -translate-y-1/2"></div>

        {steps.map((step) => {
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;

          return (
            <button
              key={step.number}
              type="button"
              disabled={!isCompleted && !isActive}
              onClick={() => isCompleted && onStepClick(step.number)}
              className="relative z-10 flex flex-col items-center gap-2 group focus:outline-none"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all duration-300 ${
                  isActive
                    ? "bg-sky-500 ring-4 ring-sky-100 border-4 border-white text-white"
                    : isCompleted
                    ? "bg-sky-500 border-4 border-white text-white cursor-pointer hover:bg-sky-600"
                    : "bg-white border-4 border-slate-200 text-slate-400"
                }`}
              >
                {step.number}
              </div>
              <span
                className={`text-xs transition-colors ${
                  isActive
                    ? "font-bold text-sky-600"
                    : isCompleted
                    ? "font-semibold text-slate-900"
                    : "font-medium text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

