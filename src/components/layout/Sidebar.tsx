import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  CheckSquare,
  BarChart3,
  Users,
  ShieldCheck,
  X,
  Building2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { DeclarationService } from "../../services/declaration.service";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, role } = useAuth();
  const location = useLocation();

  const [draftCount, setDraftCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    async function loadCounts() {
      try {
        if (user) {
          const drafts = await DeclarationService.getDeclarations(
            { status: "DRAFT" },
            user.employeeId,
            role
          );
          setDraftCount(drafts.length);
        }
        if (role === "APPROVER" || role === "ADMIN") {
          const pending = await DeclarationService.getDeclarations({
            status: "SUBMITTED",
          });
          setPendingCount(pending.length);
        }
      } catch {
        // ignore
      }
    }
    loadCounts();
  }, [location.pathname, user, role]);

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      roles: ["EMPLOYEE", "APPROVER", "ADMIN"],
    },
    {
      label: "My Declaration",
      path: "/declarations",
      icon: FileText,
      badge: draftCount > 0 ? `${draftCount} Draft` : undefined,
      badgeColor: "bg-amber-100 text-amber-800",
      roles: ["EMPLOYEE", "APPROVER", "ADMIN"],
    },
    {
      label: "+ Buat Deklarasi Baru",
      path: "/declarations/create",
      icon: PlusCircle,
      isPrimary: true,
      roles: ["EMPLOYEE", "APPROVER", "ADMIN"],
    },
    {
      label: "Approval",
      path: "/approvals",
      icon: CheckSquare,
      badge: pendingCount > 0 ? String(pendingCount) : undefined,
      badgeColor: "bg-rose-500 text-white font-bold",
      roles: ["APPROVER", "ADMIN"],
    },
    {
      label: "Reports",
      path: "/reports",
      icon: BarChart3,
      roles: ["APPROVER", "ADMIN"],
    },
    {
      label: "HRIS & Modul Kepatuhan",
      path: "/users",
      icon: Users,
      roles: ["ADMIN"],
    },
    {
      label: "Audit Trail",
      path: "/audit-trail",
      icon: ShieldCheck,
      roles: ["ADMIN"],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        ></div>
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0f172a] text-slate-300 border-r border-slate-800 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center font-bold text-white shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight uppercase leading-tight">
                RADIANT GROUP
              </h1>
              <p className="text-[10px] uppercase font-semibold text-sky-400 tracking-wider">
                ABC Declaration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems
            .filter((item) => item.roles.includes(role))
            .map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === "/declarations"
                  ? location.pathname === "/declarations"
                  : location.pathname.startsWith(item.path);

              if (item.isPrimary) {
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    state={{ fresh: Date.now() }}
                    onClick={() => {
                      onClose();
                      window.dispatchEvent(new CustomEvent("reset-declaration-form"));
                    }}
                    className="mt-2 mb-3 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-sky-500 text-white font-medium hover:bg-sky-600 transition-colors text-sm shadow-xs"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-sky-500/10 text-sky-400 font-medium"
                      : "text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-sky-400" : "text-slate-400"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] ${
                        item.badgeColor || "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
        </nav>

        {/* User Card Footer */}
        <div className="p-4 border-t border-slate-800/50">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.employee.fullName.charAt(0) || "U"}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.employee.fullName}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user?.employee.positionName}
              </p>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 font-mono text-center">
            Doc Ref: F-COMP-001-01
          </div>
        </div>
      </aside>
    </>
  );
};
