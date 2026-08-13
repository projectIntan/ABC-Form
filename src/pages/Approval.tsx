import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ApprovalService } from "../services/approval.service";
import { DeclarationService } from "../services/declaration.service";
import { Declaration } from "../types";
import { formatRupiah, formatDate } from "../utils/formatters";
import { Badge } from "../components/common/Badge";
import { TableSkeleton } from "../components/common/LoadingSkeleton";
import { EmptyState } from "../components/common/EmptyState";
import { RejectionModal } from "../components/common/RejectionModal";
import { ACTIVITY_TYPES } from "../constants/activityTypes";
import {
  CheckSquare,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  Search,
} from "lucide-react";

export const Approval: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [pendingList, setPendingList] = useState<Declaration[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Reject Modal state
  const [rejectTarget, setRejectTarget] = useState<Declaration | null>(null);

  const loadPending = async () => {
    setLoading(true);
    try {
      const res = await ApprovalService.getPendingApprovals();
      setPendingList(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (id: string, number: string) => {
    if (!user) return;
    setActionLoading(true);
    try {
      await ApprovalService.approveDeclaration(
        id,
        user.employee.fullName,
        user.employeeId
      );
      showToast(`Deklarasi ${number} berhasil disetujui (Approved).`, "success");
      loadPending();
    } catch (err: any) {
      showToast(err.message || "Gagal menyetujui deklarasi", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectTarget || !user) return;
    setActionLoading(true);
    try {
      await ApprovalService.rejectDeclaration(
        rejectTarget.id,
        reason,
        user.employee.fullName,
        user.employeeId
      );
      showToast(`Deklarasi ${rejectTarget.declarationNumber} ditolak.`, "info");
      setRejectTarget(null);
      loadPending();
    } catch (err: any) {
      showToast(err.message || "Gagal menolak deklarasi", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = pendingList.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.declarationNumber.toLowerCase().includes(q) ||
      d.identity.fullName.toLowerCase().includes(q) ||
      d.externalParty.companyName.toLowerCase().includes(q) ||
      d.externalParty.projectCode.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#0f172a] rounded-xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 font-bold text-xs uppercase tracking-wider mb-2">
            Approver Review Portal
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Pending Approval Queue (Gift Declarations)</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Sesuai kebijakan Kepatuhan Radiant Group, verifikasi & persetujuan khusus <strong>HANYA berlaku untuk deklarasi Pemberian & Penerimaan Hadiah (GIFT)</strong>. Jenis kegiatan lainnya bersifat pencatatan mandiri.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Pending Gifts</span>
            <span className="text-xl font-bold text-amber-400">{pendingList.length}</span>
          </div>
        </div>
      </div>

      {/* Policy Info Notice */}
      <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs flex items-start gap-3">
        <CheckSquare className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Ketentuan Alur Persetujuan Deklarasi Anti-Bribery & Corruption:</p>
          <p className="text-slate-600 mt-0.5 leading-relaxed">
            1. Persetujuan/verifikasi khusus oleh Approver <strong>hanya diwajibkan untuk deklarasi Pemberian & Penerimaan Hadiah (GIFT)</strong>.<br />
            2. Deklarasi kegiatan lain (Makan Bersama, Sponsorship, Fasilitasi, Entertainment, Rekreasi, Internal) otomatis disetujui (Recorded) tanpa memerlukan verifikasi Approver.
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Clock className="w-4 h-4 text-amber-500" />
            <h3>Daftar Deklarasi Menunggu Persetujuan ({filtered.length})</h3>
          </div>

          {/* Search bar */}
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari karyawan / No. Deklarasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Tidak ada deklarasi pending"
            description="Seluruh pengajuan deklarasi Anti-Bribery telah diproses."
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Declaration / Expense No.</th>
                  <th className="py-3.5 px-4">Pemohon (Employee)</th>
                  <th className="py-3.5 px-4">Entitas</th>
                  <th className="py-3.5 px-4">Activity Type</th>
                  <th className="py-3.5 px-4">External Party</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Submission Date</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.map((decl) => {
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
                    <tr key={decl.id} className="hover:bg-slate-50/80 transition-colors">
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
                            <span>Belum Ada (Pending Approval)</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{decl.identity.fullName}</p>
                        <p className="text-[10px] text-slate-500">{decl.identity.position}</p>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-800">
                        {decl.identity.entity}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {actMeta?.label}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {decl.externalParty.companyName || "Internal"}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatRupiah(amount)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {formatDate(decl.submittedDate || decl.createdDate)}
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

                          <button
                            onClick={() => setRejectTarget(decl)}
                            disabled={actionLoading}
                            className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleApprove(decl.id, decl.declarationNumber)}
                            disabled={actionLoading}
                            className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Reason Modal */}
      {rejectTarget && (
        <RejectionModal
          isOpen={Boolean(rejectTarget)}
          declarationNumber={rejectTarget.declarationNumber}
          isLoading={actionLoading}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectTarget(null)}
        />
      )}
    </div>
  );
};
