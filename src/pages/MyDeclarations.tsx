import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { DeclarationService } from "../services/declaration.service";
import { Declaration, DeclarationFilter } from "../types";
import { formatRupiah, formatDate } from "../utils/formatters";
import { Badge } from "../components/common/Badge";
import { TableSkeleton } from "../components/common/LoadingSkeleton";
import { EmptyState } from "../components/common/EmptyState";
import { ConfirmationModal } from "../components/common/ConfirmationModal";
import { ACTIVITY_TYPES } from "../constants/activityTypes";
import {
  PlusCircle,
  Eye,
  Edit3,
  Trash2,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";

export const MyDeclarations: React.FC = () => {
  const { user, role } = useAuth();
  const { showToast } = useToast();

  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activityTypeFilter, setActivityTypeFilter] = useState("ALL");
  const [projectCodeQuery, setProjectCodeQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Delete Draft Modal
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, role, statusFilter, activityTypeFilter, projectCodeQuery, searchQuery]);

  const handleDeleteDraft = async () => {
    if (!deleteTargetId || !user) return;
    setIsDeleting(true);
    try {
      await DeclarationService.deleteDraft(
        deleteTargetId,
        user.employee.fullName,
        user.employeeId
      );
      showToast("Draft deklarasi berhasil dihapus", "success");
      setDeleteTargetId(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || "Gagal menghapus draft", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Pagination calculation
  const totalPages = Math.ceil(declarations.length / pageSize) || 1;
  const paginatedList = declarations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] uppercase tracking-wider mb-1">
            <FileText className="w-3.5 h-3.5 text-slate-500" /> My Declarations Archive
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">My Declarations</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar seluruh riwayat deklarasi Anti-Bribery milik {user?.employee.fullName}.
          </p>
        </div>

        <Link
          to="/declarations/create"
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Create Declaration</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Status Filter */}
        <div className="flex flex-col gap-1">
          <label className="font-bold text-slate-700 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Filter Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 font-medium"
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
            className="p-2 rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 font-medium"
          >
            <option value="ALL">Semua Jenis Kegiatan</option>
            {ACTIVITY_TYPES.map((a) => (
              <option key={a.type} value={a.type}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        {/* Project Code */}
        <div className="flex flex-col gap-1">
          <label className="font-bold text-slate-700">Project Code</label>
          <input
            type="text"
            placeholder="Cari Project Code..."
            value={projectCodeQuery}
            onChange={(e) => setProjectCodeQuery(e.target.value)}
            className="p-2 rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>

        {/* Search Input */}
        <div className="flex flex-col gap-1">
          <label className="font-bold text-slate-700">Pencarian Umum</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari No. Deklarasi / Perusahaan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Main Table View */}
      {loading ? (
        <TableSkeleton />
      ) : declarations.length === 0 ? (
        <EmptyState
          title="Tidak ada deklarasi ditemukan"
          description="Belum ada riwayat deklarasi atau hasil filter tidak cocok."
          action={
            <Link
              to="/declarations/create"
              className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800"
            >
              + Create Declaration
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Declaration / Expense No.</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4">Activity Type</th>
                  <th className="py-3.5 px-4">External Party</th>
                  <th className="py-3.5 px-4">Project Code</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedList.map((decl) => {
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
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4">
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
                      <td className="py-3.5 px-4 text-slate-600">
                        {formatDate(decl.createdDate)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {actMeta?.label || decl.identity.activityType}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {decl.externalParty.companyName || "Internal"}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {decl.externalParty.projectCode || "N/A"}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatRupiah(amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge status={decl.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            to={`/declarations/${decl.id}`}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="View Detail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {/* Edit only if Draft */}
                          {decl.status === "DRAFT" && (
                            <Link
                              to={`/declarations/create?editId=${decl.id}`}
                              className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 transition-colors"
                              title="Edit Draft"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          {/* Delete only if Draft */}
                          {decl.status === "DRAFT" && (
                            <button
                              onClick={() => setDeleteTargetId(decl.id)}
                              className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 transition-colors"
                              title="Delete Draft"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>
              Menampilkan {paginatedList.length} dari {declarations.length} data
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-slate-800">
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete Draft */}
      <ConfirmationModal
        isOpen={Boolean(deleteTargetId)}
        title="Hapus Draft Deklarasi"
        message="Apakah Anda yakin ingin menghapus draft deklarasi ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus Draft"
        isDangerous
        isLoading={isDeleting}
        onConfirm={handleDeleteDraft}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
