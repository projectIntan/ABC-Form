import React from "react";

export const TableSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-3 p-4 bg-white rounded-2xl border border-slate-200 animate-pulse">
      <div className="h-6 bg-slate-200 rounded-md w-1/4 mb-4"></div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 py-2 border-b border-slate-100">
          <div className="h-4 bg-slate-200 rounded-md w-1/6"></div>
          <div className="h-4 bg-slate-200 rounded-md w-1/4"></div>
          <div className="h-4 bg-slate-200 rounded-md w-1/5"></div>
          <div className="h-4 bg-slate-200 rounded-md w-1/6"></div>
          <div className="h-6 bg-slate-200 rounded-full w-16 ml-auto"></div>
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-200 animate-pulse space-y-4">
      <div className="h-5 bg-slate-200 rounded-md w-1/3"></div>
      <div className="h-4 bg-slate-200 rounded-md w-2/3"></div>
      <div className="h-20 bg-slate-100 rounded-xl w-full"></div>
    </div>
  );
};
