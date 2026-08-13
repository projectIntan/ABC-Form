import React, { useState, useEffect } from "react";
import { AuditService } from "../services/audit.service";
import { AuditLog } from "../types";
import { formatDate } from "../utils/formatters";
import { ShieldAlert, Search, RefreshCw } from "lucide-react";

export const AuditTrail: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await AuditService.getLogs();
      setLogs(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.performedBy.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      (log.declarationNumber && log.declarationNumber.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] uppercase tracking-wider mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-500" /> Compliance Audit Trail
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">System Audit Logs</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log aktivitas sekuritas & rekaman transaksi sistem Anti-Bribery & Corruption Radiant Group.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Logs
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-slate-900 uppercase">
            Total {filtered.length} Audit Records Logged
          </span>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari aksi / user / no. deklarasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Performed By</th>
                <th className="py-3 px-4">Aksi</th>
                <th className="py-3 px-4">Declaration Ref</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{log.performedBy}</td>
                  <td className="py-3 px-4 font-bold text-emerald-800 uppercase text-[10px]">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    {log.declarationNumber || "-"}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
