import React from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No declarations found",
  description = "There are no declaration records matching your search or filter criteria.",
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 gap-3 my-4">
      <div className="p-3 bg-slate-100 rounded-2xl text-slate-400">
        <FolderOpen className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm leading-relaxed">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};
