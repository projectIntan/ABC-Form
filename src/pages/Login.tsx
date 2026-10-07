import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  Building2,
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Server,
  Database,
  ArrowLeft,
} from "lucide-react";

export const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [username, setUsername] = useState("approver");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      showToast("Login berhasil. Selamat datang di Portal Monitoring Kepatuhan.", "success");
      navigate("/dashboard");
    } catch {
      showToast("Login gagal. Periksa username dan password Anda.", "error");
    }
  };

  const handleQuickLogin = async (presetUser: string) => {
    setUsername(presetUser);
    setPassword("password123");
    try {
      await login(presetUser, "password123");
      showToast("Login berhasil sebagai " + presetUser.toUpperCase(), "success");
      navigate("/dashboard");
    } catch {
      showToast("Login gagal.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

      <div className="relative z-10 max-w-md w-full bg-[#1e293b]/90 backdrop-blur-md rounded-2xl border border-slate-700/60 p-8 shadow-xl space-y-6">
        {/* Back to Public Declaration Form Link */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Form Deklarasi Publik</span>
          </Link>
          <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            Akses Internal
          </span>
        </div>

        {/* Corporate Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center text-white font-bold mx-auto shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white uppercase">RADIANT GROUP</h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-400">
            Compliance & Monitoring Portal
          </p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto pt-1">
            Portal khusus Tim Compliance & Approver untuk memantau deklarasi kepatuhan yang diajukan oleh pengguna.
          </p>
        </div>

        {/* Python HRIS & Database Integration Status Badge */}
        <div className="p-2.5 bg-slate-900/90 rounded-xl border border-emerald-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300 font-medium">Service Monitoring:</span>
          </div>
          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-mono text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1">
            <Database className="w-3 h-3 text-emerald-400" />
            MySQL / Active
          </span>
        </div>

        {/* Quick Presenter Accounts for Compliance */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
          <p className="text-[10px] uppercase font-bold text-slate-400 text-center">
            Login Cepat Akun Compliance / Reviewer
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("approver")}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors border border-slate-700 hover:border-sky-500 flex flex-col items-center justify-center cursor-pointer"
            >
              <span className="font-bold text-sky-400">Approver</span>
              <span className="text-[10px] text-slate-400">Sari Intan (Compliance Mgr)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("admin")}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors border border-slate-700 hover:border-sky-500 flex flex-col items-center justify-center cursor-pointer"
            >
              <span className="font-bold text-emerald-400">Admin</span>
              <span className="text-[10px] text-slate-400">Budi Santoso (Director)</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Username / NIK Petugas Compliance</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="approver / 2608002"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 text-sm rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm transition-colors shadow-xs flex items-center justify-center gap-2 group cursor-pointer"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Masuk ke Monitoring Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-[10px] text-slate-400 border-t border-slate-800 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
          <span>Radiant Group Compliance & Legal Enforcement</span>
        </div>
      </div>
    </div>
  );
};
