import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { DeclarationService } from "../services/declaration.service";
import { Declaration, DeclarationFilter } from "../types";
import { formatRupiah, formatDate } from "../utils/formatters";
import { Badge } from "../components/common/Badge";
import { TableSkeleton } from "../components/common/LoadingSkeleton";
import { EmptyState } from "../components/common/EmptyState";
import { ACTIVITY_TYPES } from "../constants/activityTypes";
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  FileEdit,
  Eye,
  Filter,
  Search,
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const { user, role } = useAuth();
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activityTypeFilter, setActivityTypeFilter] = useState("ALL");
  const [projectCodeQuery, setProjectCodeQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const filter: DeclarationFilter = {
        status: statusFilter,
        activityType: activityTypeFilter,
        projectCode: projectCodeQuery,
        searchQuery: searchQuery,
      };
      const res = await DeclarationService.getDeclarations(
        filter,
        user?.employeeId,
        role
      );
      setDeclarations(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, role, statusFilter, activityTypeFilter, projectCodeQuery, searchQuery]);

  // Calculate summary counts from unfiltered base list
  const [allList, setAllList] = useState<Declaration[]>([]);
  useEffect(() => {
    async function loadAll() {
      if (user) {
        const res = await DeclarationService.getDeclarations(
          undefined,
          user.employeeId,
          role
        );
        setAllList(res);
      }
    }
    loadAll();
  }, [user, role]);

  const totalCount = allList.length;
  const draftCount = allList.filter((d) => d.status === "DRAFT").length;
  const submittedCount = allList.filter((d) => d.status === "SUBMITTED").length;
  const approvedCount = allList.filter((d) => d.status === "APPROVED").length;
  const rejectedCount = allList.filter((d) => d.status === "REJECTED").length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-[#0f172a] rounded-xl p-6 lg:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 font-bold text-xs uppercase tracking-wider">
            Radiant Group Compliance Portal
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            Selamat Datang, {user?.employee.fullName}
          </h1>
          <p className="text-xs lg:text-sm text-slate-300 max-w-xl leading-relaxed">
            {user?.employee.positionName} • {user?.employee.entityName}
          </p>
        </div>

        <Link
          to="/declarations/create"
          className="px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm shadow-xs transition-colors flex items-center justify-center gap-2 shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          <span>+ Buat Deklarasi Baru</span>
        </Link>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Declaration */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Draft */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Draft</span>
            <p className="text-2xl font-bold text-slate-700 mt-1">{draftCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
            <FileEdit className="w-5 h-5" />
          </div>
        </div>

        {/* Submitted */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">Submitted</span>
            <p className="text-2xl font-bold text-amber-700 mt-1">{submittedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Approved */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Approved</span>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{approvedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between col-span-2 lg:col-span-1">
          <div>
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block">Rejected</span>
            <p className="text-2xl font-bold text-rose-700 mt-1">{rejectedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Section: Recent Declaration Table */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Declarations</h2>
            <p className="text-xs text-slate-500">
              Daftar transaksi deklarasi anti-penyuapan terbaru dalam sistem.
            </p>
          </div>

          <Link
            to="/declarations"
            className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 hover:underline"
          >
            Lihat Semua My Declarations &rarr;
          </Link>
        </div>

        {/* Filters Toolbar */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Status Filter */}
          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" /> Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium text-slate-800"
            >
              <option value="ALL">Semua Status</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Activity Type Filter */}
          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700">Jenis Kegiatan</label>
            <select
              value={activityTypeFilter}
              onChange={(e) => setActivityTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium text-slate-800"
            >
              <option value="ALL">Semua Jenis Kegiatan</option>
              {ACTIVITY_TYPES.map((a) => (
                <option key={a.type} value={a.type}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          {/* Project Code Search */}
          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700">Project Code</label>
            <input
              type="text"
              placeholder="Filter Project Code..."
              value={projectCodeQuery}
              onChange={(e) => setProjectCodeQuery(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800"
            />
          </div>

          {/* Search Bar */}
          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700">Pencarian Umum</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari No. Deklarasi / Pihak Eksternal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Table View */}
        {loading ? (
          <TableSkeleton />
        ) : declarations.length === 0 ? (
          <EmptyState
            title="Tidak ada deklarasi ditemukan"
            description="Coba ubah kriteria filter di atas atau buat deklarasi baru."
            action={
              <Link
                to="/declarations/create"
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-lg transition-colors"
              >
                + Create Declaration
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Declaration Number</th>
                  <th className="py-3.5 px-6">Submission Date</th>
                  <th className="py-3.5 px-6">Activity Type</th>
                  <th className="py-3.5 px-6">External Party</th>
                  <th className="py-3.5 px-6">Project Code</th>
                  <th className="py-3.5 px-6 text-right">Total Amount</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                  <th className="py-3.5 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {declarations.slice(0, 8).map((decl) => {
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
                    <tr
                      key={decl.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-4 px-6 font-bold font-mono text-slate-900">
                        {decl.declarationNumber}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {decl.submittedDate ? formatDate(decl.submittedDate) : formatDate(decl.createdDate)}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-800">
                        {actMeta?.label || decl.identity.activityType}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-800">
                        {decl.externalParty.companyName || "Internal"}
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-600">
                        {decl.externalParty.projectCode || "N/A"}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-slate-900">
                        {formatRupiah(amount)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Badge status={decl.status} size="sm" />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Link
                          to={`/declarations/${decl.id}`}
                          className="text-sky-600 hover:text-sky-800 font-semibold text-xs transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </Link>
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
