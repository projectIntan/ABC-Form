import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { DeclarationService } from "../services/declaration.service";
import { ApprovalService } from "../services/approval.service";
import { Declaration } from "../types";
import { formatRupiah, formatDate } from "../utils/formatters";
import { Badge } from "../components/common/Badge";
import { Timeline } from "../components/common/Timeline";
import { CardSkeleton } from "../components/common/LoadingSkeleton";
import { RejectionModal } from "../components/common/RejectionModal";
import { ACTIVITY_TYPES } from "../constants/activityTypes";
import {
  ArrowLeft,
  Edit3,
  CheckCircle,
  XCircle,
  UserCheck,
  Building2,
  FileText,
  ShieldCheck,
  Paperclip,
  Download,
  File as FileIcon,
} from "lucide-react";

export const DeclarationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, role } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [decl, setDecl] = useState<Declaration | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const loadDeclaration = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await DeclarationService.getDeclarationById(id);
      setDecl(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeclaration();
  }, [id]);

  const handleApprove = async () => {
    if (!decl || !user) return;
    setIsActionLoading(true);
    try {
      await ApprovalService.approveDeclaration(
        decl.id,
        user.employee.fullName,
        user.employeeId
      );
      showToast(`Deklarasi ${decl.declarationNumber} berhasil disetujui (Approved).`, "success");
      loadDeclaration();
    } catch (err: any) {
      showToast(err.message || "Gagal menyetujui deklarasi", "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!decl || !user) return;
    setIsActionLoading(true);
    try {
      await ApprovalService.rejectDeclaration(
        decl.id,
        reason,
        user.employee.fullName,
        user.employeeId
      );
      setIsRejectModalOpen(false);
      showToast(`Deklarasi ${decl.declarationNumber} ditolak.`, "info");
      loadDeclaration();
    } catch (err: any) {
      showToast(err.message || "Gagal menolak deklarasi", "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!decl) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-600 font-bold text-sm">Deklarasi tidak ditemukan.</p>
        <Link
          to="/declarations"
          className="mt-4 inline-block px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          Kembali ke My Declarations
        </Link>
      </div>
    );
  }

  const actMeta = ACTIVITY_TYPES.find((a) => a.type === decl.identity.activityType);
  const canApproveReject =
    (role === "APPROVER" || role === "ADMIN") && decl.status === "SUBMITTED";

  const totalAmount =
    decl.activityDetail.totalAmount ||
    decl.activityDetail.estimatedPrice ||
    decl.activityDetail.sponsorshipAmount ||
    decl.activityDetail.facilitationAmount ||
    0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-lg font-extrabold text-slate-900">
                {decl.declarationNumber}
              </span>
              <Badge status={decl.status} />
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold flex items-center gap-1.5">
                <span>No. Expense ERP:</span>
                <span className="text-emerald-900">
                  {decl.status === "APPROVED"
                    ? decl.expenseNumber || "Siap Dibuat di ERP"
                    : "Belum Ada (Perlu Approval ABC)"}
                </span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Ref Code: {decl.documentCode} • Submitted on {formatDate(decl.submittedDate || decl.createdDate)}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {decl.status === "DRAFT" && (
            <Link
              to={`/declarations/create?editId=${decl.id}`}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-sm transition-colors"
            >
              <Edit3 className="w-4 h-4" /> Edit Draft
            </Link>
          )}

          {canApproveReject && (
            <>
              <button
                onClick={() => setIsRejectModalOpen(true)}
                disabled={isActionLoading}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
              <button
                onClick={handleApprove}
                disabled={isActionLoading}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors"
              >
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
            </>
          )}
        </div>
      </div>

      {/* Approval Policy Notice Banner */}
      {decl.identity.activityType === "GIFT" ? (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Verifikasi & Persetujuan Khusus Hadiah (GIFT):</p>
            <p className="text-amber-800 mt-0.5 leading-relaxed">
              Deklarasi Pemberian & Penerimaan Hadiah ini memerlukan verifikasi serta persetujuan dari Approver / Tim Kepatuhan.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Ketentuan Persetujuan ({actMeta?.label}):</p>
            <p className="text-slate-600 mt-0.5 leading-relaxed">
              Jenis kegiatan ini bersifat pencatatan mandiri dan <strong>tidak memerlukan persetujuan/verifikasi khusus Approver</strong>. Status otomatis disetujui (Approved) setelah disubmit.
            </p>
          </div>
        </div>
      )}

      {/* Activity Status Timeline */}
      <Timeline
        status={decl.status}
        createdDate={decl.createdDate}
        submittedDate={decl.submittedDate}
        reviewedDate={decl.reviewedDate}
        reviewedBy={decl.reviewedBy}
        rejectionReason={decl.rejectionReason}
      />

      {/* Section 1: Identity Info */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-600" />
          Informasi Pelapor (HRIS Verified)
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Nama Lengkap</span>
            <span className="font-bold text-slate-900">{decl.identity.fullName}</span>
          </div>

          <div>
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Employee ID</span>
            <span className="font-bold text-slate-900">{decl.identity.employeeId}</span>
          </div>

          <div>
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Email Resmi</span>
            <span className="font-bold text-slate-900">{decl.identity.email}</span>
          </div>

          <div>
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Entitas</span>
            <span className="font-bold text-emerald-800">{decl.identity.entity}</span>
          </div>

          <div>
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Jabatan / Pangkat</span>
            <span className="font-bold text-slate-900">{decl.identity.position}</span>
          </div>

          <div>
            <span className="text-slate-400 font-bold block text-[10px] uppercase">SBU (Strategic Business Unit)</span>
            <span className="font-bold text-slate-900">{decl.identity.sbu || decl.identity.organizationHierarchy || "-"}</span>
          </div>

          <div>
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Departemen</span>
            <span className="font-bold text-slate-900">{decl.identity.department || "-"}</span>
          </div>

          <div>
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Manager</span>
            <span className="font-bold text-slate-900">{decl.identity.managerName || "Direct Approver"}</span>
          </div>

          <div>
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Jenis Kegiatan</span>
            <span className="font-bold text-emerald-700">{actMeta?.label}</span>
          </div>
        </div>
      </div>

      {/* Section 2: External Party Info */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-600" />
          Informasi Pihak Eksternal
        </h3>

        {decl.identity.activityType === "INTERNAL" ? (
          <p className="text-xs text-slate-500 italic">No external party involved (Kegiatan Internal)</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Perusahaan / Lembaga</span>
              <span className="font-bold text-slate-900">{decl.externalParty.companyName || "-"}</span>
            </div>

            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Hubungan</span>
              <span className="font-bold text-slate-900">{decl.externalParty.relationship || "-"}</span>
            </div>

            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Project Code</span>
              <span className="font-bold font-mono text-slate-900">{decl.externalParty.projectCode || "N/A"}</span>
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Activity Detail */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-600" />
          Detail Activity ({actMeta?.label})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Nomor Expense ERP</span>
            <span
              className={`font-bold font-mono px-2.5 py-1 rounded-md text-xs inline-block mt-0.5 ${
                decl.status === "APPROVED" && decl.expenseNumber
                  ? "text-emerald-800 bg-emerald-50 border border-emerald-200"
                  : decl.status === "APPROVED"
                  ? "text-sky-800 bg-sky-50 border border-sky-200"
                  : "text-slate-500 bg-slate-100 border border-slate-200"
              }`}
            >
              {decl.status === "APPROVED"
                ? decl.expenseNumber || "Siap Dibuat di ERP"
                : "Belum Ada (Menunggu Approval ABC)"}
            </span>
          </div>

          {decl.activityDetail.date && (
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Tanggal Pelaksanaan</span>
              <span className="font-bold text-slate-900">{formatDate(decl.activityDetail.date)}</span>
            </div>
          )}

          {decl.activityDetail.location && (
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Lokasi</span>
              <span className="font-bold text-slate-900">{decl.activityDetail.location}</span>
            </div>
          )}

          {decl.activityDetail.mealType && (
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Jenis Jamuan</span>
              <span className="font-bold text-slate-900">{decl.activityDetail.mealType}</span>
            </div>
          )}

          {decl.activityDetail.quantity && (
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Kuantitas</span>
              <span className="font-bold text-slate-900">{decl.activityDetail.quantity} Unit</span>
            </div>
          )}

          {decl.activityDetail.participantCount && (
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Jumlah Partisipan</span>
              <span className="font-bold text-slate-900">{decl.activityDetail.participantCount} Orang</span>
            </div>
          )}

          {totalAmount > 0 && (
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Total Amount</span>
              <span className="font-bold text-emerald-700 text-sm">{formatRupiah(totalAmount)}</span>
            </div>
          )}
        </div>

        {/* Narrative descriptions */}
        {decl.activityDetail.description && (
          <div className="text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Deskripsi Kegiatan</span>
            <p className="text-slate-800 font-medium leading-relaxed mt-0.5">{decl.activityDetail.description}</p>
          </div>
        )}

        {decl.activityDetail.purpose && (
          <div className="text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Tujuan Kegiatan</span>
            <p className="text-slate-800 font-medium leading-relaxed mt-0.5">{decl.activityDetail.purpose}</p>
          </div>
        )}

        {decl.activityDetail.summaryMeeting && (
          <div className="text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Summary Meeting / Ringkasan Rapat</span>
            <p className="text-slate-800 font-medium leading-relaxed mt-0.5 bg-slate-50 p-3 rounded-lg border border-slate-200">{decl.activityDetail.summaryMeeting}</p>
          </div>
        )}

        {decl.activityDetail.giftReason && (
          <div className="text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Alasan Hadiah</span>
            <p className="text-slate-800 font-medium leading-relaxed mt-0.5">{decl.activityDetail.giftReason}</p>
          </div>
        )}

        {decl.activityDetail.sponsorshipReason && (
          <div className="text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Alasan Sponsorship</span>
            <p className="text-slate-800 font-medium leading-relaxed mt-0.5">{decl.activityDetail.sponsorshipReason}</p>
          </div>
        )}

        {decl.activityDetail.facilitationReason && (
          <div className="text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Alasan Pembayaran Fasilitasi</span>
            <p className="text-slate-800 font-medium leading-relaxed mt-0.5">{decl.activityDetail.facilitationReason}</p>
          </div>
        )}

        {decl.activityDetail.entertainmentReason && (
          <div className="text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Alasan Hiburan</span>
            <p className="text-slate-800 font-medium leading-relaxed mt-0.5">{decl.activityDetail.entertainmentReason}</p>
          </div>
        )}

        {/* Radiant Employee Participants */}
        {decl.activityDetail.radiantEmployees && decl.activityDetail.radiantEmployees.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <span className="text-slate-400 font-bold block text-[10px] uppercase mb-1">
              Daftar Karyawan Radiant Group yang Hadir
            </span>
            <div className="flex flex-wrap gap-2">
              {decl.activityDetail.radiantEmployees.map((e) => (
                <span
                  key={e.employeeId}
                  className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
                >
                  {e.fullName} — {e.positionName} ({e.entityName})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Uploaded Supporting Attachments */}
        {decl.attachments && decl.attachments.length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <span className="text-slate-400 font-bold block text-[10px] uppercase mb-2 flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
              Dokumen Bukti Pendukung ({decl.attachments.length} File)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {decl.attachments.map((att) => (
                <div
                  key={att.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
                      <FileIcon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate" title={att.name}>
                        {att.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {(att.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  {att.dataUrl && (
                    <a
                      href={att.dataUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={att.name}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shrink-0 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Unduh
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Compliance Confirmation Footer Box */}
      <div className="p-6 bg-slate-900 rounded-xl text-white space-y-3 border border-slate-800">
        <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" /> Document Verified & Legal Declaration Accepted
        </div>
        <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
          <p className="font-bold text-white">Dengan ini saya menyatakan bahwa:</p>
          <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-300">
            <li>Seluruh informasi yang dideklarasikan adalah jujur, transparan dan sesuai dengan kondisi yang sebenarnya serta dapat dipertanggungjawabkan.</li>
            <li>Bersedia untuk memberikan seluruh bukti yang sah dan dapat dipertanggungjawabkan atas kegiatan yang dideklarasikan.</li>
            <li>Apabila ada kelebihan biaya karena tidak sesuai dengan batasan yang ditetapkan (baik itu jamuan, hadiah, dan manfaat lainnya), maka saya bersedia dan sanggup untuk menanggung secara pribadi atas kelebihan biaya yang dimaksud.</li>
            <li>Apabila di kemudian hari saya terbukti melanggar atau menyimpang dari seluruh ketentuan yang berlaku di organisasi, maka saya bersedia untuk menerima tindakan disiplin dan/atau sanksi yang berlaku.</li>
          </ul>
        </div>
        <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800">
          Reference Code: {decl.documentCode} | Status: {decl.status}
        </div>
      </div>

      {/* Rejection Modal */}
      <RejectionModal
        isOpen={isRejectModalOpen}
        declarationNumber={decl.declarationNumber}
        isLoading={isActionLoading}
        onConfirm={handleRejectConfirm}
        onCancel={() => setIsRejectModalOpen(false)}
      />
    </div>
  );
};
