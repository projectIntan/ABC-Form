import React, { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router";
import {
  Menu,
  Bell,
  ChevronDown,
  LogOut,
  UserCheck,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

interface TopbarProps {
  onToggleSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const { user, role, switchRole, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Generate breadcrumb path
  const pathParts = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = pathParts.map((part, index) => {
    const url = `/${pathParts.slice(0, index + 1).join("/")}`;
    const name = part.charAt(0).toUpperCase() + part.slice(1);
    return { name, url };
  });

  const handleSwitchRole = async (targetRole: "employee" | "approver" | "admin") => {
    await switchRole(targetRole);
    setShowRoleMenu(false);
    showToast(`Role switched to ${targetRole.toUpperCase()}`, "info");
    navigate("/dashboard");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between shrink-0">
      {/* Left: Mobile Menu Toggle & Breadcrumbs */}
      <div className="flex items-center gap-4 text-sm">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb */}
        <nav className="hidden sm:flex items-center gap-2 text-sm">
          <Link to="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
            Home
          </Link>
          {breadcrumbs.map((bc, idx) => (
            <React.Fragment key={bc.url}>
              <span className="text-slate-300">/</span>
              <Link
                to={bc.url}
                className={`capitalize ${
                  idx === breadcrumbs.length - 1
                    ? "font-medium text-slate-600"
                    : "text-slate-400 hover:text-slate-600 transition-colors"
                }`}
              >
                {bc.name === "Declarations" ? "My Declaration" : bc.name}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right Actions & Controls */}
      <div className="flex items-center gap-4">
        {/* Role Quick Switcher Badge */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-all shadow-2xs"
          >
            <UserCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>Role: <strong className="text-slate-900">{role}</strong></span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 p-2 z-50 animate-fadeIn text-xs">
              <p className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400">
                Switch Presenter Role
              </p>
              <button
                onClick={() => handleSwitchRole("employee")}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-medium flex items-center justify-between ${
                  role === "EMPLOYEE" ? "bg-sky-50 text-sky-900 font-bold" : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <span>Employee</span>
                {role === "EMPLOYEE" && <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>}
              </button>
              <button
                onClick={() => handleSwitchRole("approver")}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-medium flex items-center justify-between ${
                  role === "APPROVER" ? "bg-sky-50 text-sky-900 font-bold" : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <span>Approver</span>
                {role === "APPROVER" && <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>}
              </button>
              <button
                onClick={() => handleSwitchRole("admin")}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-medium flex items-center justify-between ${
                  role === "ADMIN" ? "bg-sky-50 text-sky-900 font-bold" : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <span>Admin</span>
                {role === "ADMIN" && <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>}
              </button>
            </div>
          )}
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-50 animate-fadeIn text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <span className="font-bold text-slate-900">Notifications</span>
                <span className="text-[10px] text-sky-600 font-semibold bg-sky-50 px-2 py-0.5 rounded-full">
                  System Active
                </span>
              </div>
              <div className="space-y-2">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="font-semibold text-slate-800">Compliance Reminder</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Declarations must be submitted prior to cost reimbursement processing.
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="font-semibold text-slate-800">HRIS Data Synchronized</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Radiant Group employee hierarchy updated for Q3 2026.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
              {user?.employee.fullName.charAt(0) || "U"}
            </div>
            <span className="hidden md:inline-block text-xs font-bold text-slate-800 max-w-[120px] truncate">
              {user?.employee.fullName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 p-2 z-50 animate-fadeIn text-xs">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-900">{user?.employee.fullName}</p>
                <p className="text-[11px] text-slate-500">{user?.employee.email}</p>
                <p className="text-[10px] font-semibold text-sky-700 mt-1 bg-sky-50 px-2 py-0.5 rounded-md inline-block">
                  {user?.employee.entityName}
                </p>
              </div>

              <div className="py-1">
                <div className="px-3 py-1.5 text-slate-600 flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                  <span>Role: <strong>{role}</strong></span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
