import React, { useState, useEffect } from "react";
import { ReportService, ChartDataPoint } from "../services/report.service";
import { Declaration, DeclarationFilter, ReportSummary } from "../types";
import { formatRupiah, formatDate } from "../utils/formatters";
import { ENTITIES, ACTIVITY_TYPES } from "../constants/activityTypes";
import { Badge } from "../components/common/Badge";
import { TableSkeleton } from "../components/common/LoadingSkeleton";
import { EmptyState } from "../components/common/EmptyState";
import {
  BarChart3,
  Download,
  Filter,
  PieChart,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";

export const Reports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ReportSummary>({
    totalDeclaration: 0,
    totalDraft: 0,
    totalSubmitted: 0,
    totalApproved: 0,
    totalRejected: 0,
    totalAmount: 0,
  });
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [activityBreakdown, setActivityBreakdown] = useState<ChartDataPoint[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<ChartDataPoint[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<ChartDataPoint[]>([]);

  // Filter states
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [activityTypeFilter, setActivityTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [projectCode, setProjectCode] = useState("");

  const loadReport = async () => {
    setLoading(true);
    try {
      const filter: DeclarationFilter = {
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        entity: entityFilter,
        activityType: activityTypeFilter,
        status: statusFilter,
        projectCode: projectCode || undefined,
      };

      const res = await ReportService.getReportSummary(filter);
      setSummary(res.summary);
      setDeclarations(res.declarations);
      setActivityBreakdown(res.activityBreakdown);
      setStatusBreakdown(res.statusBreakdown);
      setMonthlyTrend(res.monthlyTrend);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [dateFrom, dateTo, entityFilter, activityTypeFilter, statusFilter, projectCode]);

  const handleExportCSV = () => {
    ReportService.exportToCSV(declarations);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] uppercase tracking-wider mb-1">
            <BarChart3 className="w-3.5 h-3.5 text-slate-500" /> Executive Compliance Analytics
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Anti-Bribery & Corruption Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Laporan analitis transaksi deklarasi, alokasi biaya, dan kepatuhan per entitas Radiant Group.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={declarations.length === 0}
          className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <Download className="w-4 h-4" /> Export CSV Report
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
        {/* Date From & To */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="font-bold text-slate-700 block mb-1">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-300 bg-slate-50"
            />
          </div>
          <div className="flex-1">
            <label className="font-bold text-slate-700 block mb-1">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-300 bg-slate-50"
            />
          </div>
        </div>

        {/* Entity Filter */}
        <div>
          <label className="font-bold text-slate-700 block mb-1">Entitas Radiant</label>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="w-full p-2 rounded-xl border border-slate-300 bg-slate-50 font-medium"
          >
            <option value="ALL">Semua Entitas</option>
            {ENTITIES.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>

        {/* Activity Type Filter */}
        <div>
          <label className="font-bold text-slate-700 block mb-1">Jenis Kegiatan</label>
          <select
            value={activityTypeFilter}
            onChange={(e) => setActivityTypeFilter(e.target.value)}
            className="w-full p-2 rounded-xl border border-slate-300 bg-slate-50 font-medium"
          >
            <option value="ALL">Semua Jenis Kegiatan</option>
            {ACTIVITY_TYPES.map((a) => (
              <option key={a.type} value={a.type}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="font-bold text-slate-700 block mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 rounded-xl border border-slate-300 bg-slate-50 font-medium"
          >
            <option value="ALL">Semua Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Project Code */}
        <div>
          <label className="font-bold text-slate-700 block mb-1">Project Code</label>
          <input
            type="text"
            placeholder="Cari Project Code..."
            value={projectCode}
            onChange={(e) => setProjectCode(e.target.value)}
            className="w-full p-2 rounded-xl border border-slate-300 bg-slate-50"
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Declaration</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900">{summary.totalDeclaration}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{summary.totalApproved}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Rejected</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-700">{summary.totalRejected}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Amount (Rp)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-emerald-800">{formatRupiah(summary.totalAmount)}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Chart 1: Declaration by Activity Type */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wide border-b border-slate-100 pb-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            Declaration by Activity Type
          </div>

          <div className="space-y-3">
            {activityBreakdown.map((item) => {
              const actMeta = ACTIVITY_TYPES.find((a) => a.type === item.label);
              const percent = Math.min(
                100,
                Math.round((item.count / (summary.totalDeclaration || 1)) * 100)
              );

              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 truncate max-w-[180px]">
                      {actMeta?.label || item.label}
                    </span>
                    <span className="font-semibold text-slate-600">
                      {item.count} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Declaration by Status */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wide border-b border-slate-100 pb-2">
            <PieChart className="w-4 h-4 text-emerald-600" />
            Declaration by Status
          </div>

          <div className="space-y-3">
            {statusBreakdown.map((item) => {
              const percent = Math.min(
                100,
                Math.round((item.count / (summary.totalDeclaration || 1)) * 100)
              );

              let barColor = "bg-slate-500";
              if (item.label === "SUBMITTED") barColor = "bg-amber-500";
              if (item.label === "APPROVED") barColor = "bg-emerald-500";
              if (item.label === "REJECTED") barColor = "bg-rose-500";

              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{item.label}</span>
                    <span className="font-semibold text-slate-600">
                      {item.count} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`${barColor} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 3: Total Amount by Month */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4 col-span-1 md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wide border-b border-slate-100 pb-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Total Amount by Month
          </div>

          <div className="space-y-3">
            {monthlyTrend.map((item) => (
              <div key={item.label} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900 font-mono">{item.label}</p>
                  <p className="text-[10px] text-slate-500">{item.count} Transactions</p>
                </div>
                <span className="font-bold text-emerald-800">{formatRupiah(item.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Results Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Laporan Hasil Filter ({declarations.length} Record)
        </h3>

        {loading ? (
          <TableSkeleton />
        ) : declarations.length === 0 ? (
          <EmptyState
            title="Tidak ada data laporan"
            description="Ubah filter kriteria di atas untuk menampilkan hasil laporan."
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Declaration / Expense No.</th>
                  <th className="py-3.5 px-4">Pemohon</th>
                  <th className="py-3.5 px-4">Entitas</th>
                  <th className="py-3.5 px-4">Activity Type</th>
                  <th className="py-3.5 px-4">External Party</th>
                  <th className="py-3.5 px-4">Project Code</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {declarations.map((decl) => {
                  const actMeta = ACTIVITY_TYPES.find(
                    (a) => a.type === decl.identity.activityType
                  );
                  const amount =
                    decl.activityDetail.totalAmount ||
                    decl.activityDetail.estimatedPrice ||
                    decl.activityDetail.sponsorshipAmount ||
                    decl.activityDetail.facilitationAmount ||
                    0;

                  return (
                    <tr key={decl.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold font-mono text-slate-900">
                          {decl.declarationNumber}
                        </div>
                        {decl.status === "APPROVED" ? (
                          <div className="text-[10px] font-mono text-emerald-700 font-bold flex items-center gap-1">
                            <span>ERP:</span>
                            <span>{decl.expenseNumber || "Siap Dibuat"}</span>
                          </div>
                        ) : (
                          <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                            <span>ERP:</span>
                            <span>Belum Ada</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {decl.identity.fullName}
                      </td>
                      <td className="py-3 px-4 text-emerald-800 font-medium">
                        {decl.identity.entity}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {actMeta?.label}
                      </td>
                      <td className="py-3 px-4">{decl.externalParty.companyName || "Internal"}</td>
                      <td className="py-3 px-4 font-mono">{decl.externalParty.projectCode || "N/A"}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatRupiah(amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge status={decl.status} size="sm" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
