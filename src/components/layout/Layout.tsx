import React, { useState } from "react";
import { Outlet, Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-sky-400 font-bold text-sm">
        Memuat Portal Radiant Group...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 antialiased flex">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Topbar */}
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>

        {/* Enterprise Footer */}
        <footer className="border-t border-slate-200 bg-white px-4 lg:px-8 py-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            &copy; {new Date().getFullYear()} <strong>Radiant Group</strong> — Compliance & Legal Division.
          </div>
          <div className="font-mono text-[10px] text-slate-400">
            Form Ref: F-COMP-001-01 | Anti-Bribery & Corruption Policy
          </div>
        </footer>
      </div>
    </div>
  );
};

