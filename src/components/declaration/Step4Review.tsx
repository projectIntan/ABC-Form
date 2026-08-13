import React, { useEffect, useState } from "react";
import {
  DeclarationIdentity,
  ExternalPartyInfo,
  ActivityType,
  Attachment,
} from "../../types";
import { formatRupiah, formatDate } from "../../utils/formatters";
import { ACTIVITY_TYPES } from "../../constants/activityTypes";
import { AdminService, ComplianceStatementSetting } from "../../services/admin.service";
import { ShieldCheck, Edit3, UserCheck, Building2, FileText, CheckSquare, Paperclip, Download, File, Globe } from "lucide-react";

interface Step4ReviewProps {
  identity: DeclarationIdentity;
  externalParty: ExternalPartyInfo;
  activityType: ActivityType;
  activityDetail: Record<string, any>;
  attachments?: Attachment[];
  declarationAccepted: boolean;
  onAcceptChange: (accepted: boolean) => void;
  onJumpToStep: (stepNumber: number) => void;
  error?: string;
}

export const Step4Review: React.FC<Step4ReviewProps> = ({
  identity,
  externalParty,
  activityType,
  activityDetail,
  attachments = [],
  declarationAccepted,
  onAcceptChange,
  onJumpToStep,
  error,
}) => {
  const actMeta = ACTIVITY_TYPES.find((a) => a.type === activityType);
  const [statement, setStatement] = useState<ComplianceStatementSetting | null>(null);

  useEffect(() => {
    AdminService.getComplianceStatement().then((data) => {
      if (data) setStatement(data);
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0f172a] rounded-xl p-6 text-white shadow-sm flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 font-mono text-[10px] uppercase font-bold tracking-wider mb-2">
            DOCUMENT CODE: F-COMP-001-01
          </div>
          <h2 className="text-lg font-bold">Review & Deklarasi Kepatuhan</h2>
          <p className="text-xs text-slate-300 mt-1">
            Periksa seluruh data sebelum melakukan submit final ke sistem Anti-Bribery Radiant Group.
          </p>
        </div>
        <ShieldCheck className="w-12 h-12 text-sky-400 opacity-80 hidden sm:block" />
      </div>

      {/* Summary Card 1: Informasi Pelapor */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-sky-600" />
            Informasi Pelapor
          </h3>
          <button
            type="button"
            onClick={() => onJumpToStep(1)}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] block uppercase font-bold">Nama Lengkap</span>
            <span className="font-bold text-slate-900">{identity.fullName}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block uppercase font-bold">Employee ID</span>
            <span className="font-bold text-slate-900">{identity.employeeId}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block uppercase font-bold">Email</span>
            <span className="font-bold text-slate-900">{identity.email}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block uppercase font-bold">Entitas</span>
            <span className="font-bold text-sky-700">{identity.entity}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block uppercase font-bold">Jabatan / Pangkat</span>
            <span className="font-bold text-slate-900">{identity.position}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block uppercase font-bold">SBU</span>
            <span className="font-bold text-slate-900">{identity.sbu || identity.organizationHierarchy || "-"}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block uppercase font-bold">Departemen</span>
            <span className="font-bold text-slate-900">{identity.department || "-"}</span>
          </div>
        </div>
      </div>

      {/* Summary Card 2: Informasi Pihak Eksternal (Hanya jika bukan Kegiatan Internal) */}
      {activityType !== "INTERNAL" && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-600" />
              Informasi Pihak Eksternal
            </h3>
            <button
              type="button"
              onClick={() => onJumpToStep(2)}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Perusahaan / Lembaga</span>
              <span className="font-bold text-slate-900">{externalParty.companyName || "-"}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Hubungan</span>
              <span className="font-bold text-slate-900">{externalParty.relationship || "-"}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Project Code</span>
              <span className="font-bold text-slate-900">{externalParty.projectCode || "N/A"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Summary Card 3: Detail Kegiatan */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-600" />
            Detail Kegiatan ({actMeta?.label})
          </h3>
          <button
            type="button"
            onClick={() => onJumpToStep(activityType === "INTERNAL" ? 2 : 3)}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] block uppercase font-bold">Status Expense ERP</span>
            <span className="font-semibold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded text-[11px] inline-block mt-0.5">
              Diterbitkan setelah Form ABC Disetujui (APPROVED)
            </span>
          </div>

          {activityDetail.date && (
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Tanggal Kegiatan</span>
              <span className="font-bold text-slate-900">{formatDate(activityDetail.date)}</span>
            </div>
          )}

          {activityDetail.location && (
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Lokasi</span>
              <span className="font-bold text-slate-900">{activityDetail.location}</span>
            </div>
          )}

          {activityDetail.mealType && (
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Jenis Jamuan</span>
              <span className="font-bold text-slate-900">{activityDetail.mealType}</span>
            </div>
          )}

          {activityDetail.quantity && (
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Kuantitas</span>
              <span className="font-bold text-slate-900">{activityDetail.quantity} Unit</span>
            </div>
          )}

          {activityDetail.participantCount && (
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Partisipan</span>
              <span className="font-bold text-slate-900">{activityDetail.participantCount} Orang</span>
            </div>
          )}

          {(activityDetail.totalAmount !== undefined ||
            activityDetail.estimatedPrice !== undefined ||
            activityDetail.sponsorshipAmount !== undefined ||
            activityDetail.facilitationAmount !== undefined) && (
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Total Nominal (Rp)</span>
              <span className="font-bold text-sky-600 text-sm">
                {formatRupiah(
                  activityDetail.totalAmount ||
                    activityDetail.estimatedPrice ||
                    activityDetail.sponsorshipAmount ||
                    activityDetail.facilitationAmount
                )}
              </span>
            </div>
          )}
        </div>

        {/* Detailed Descriptions/Reasons */}
        {activityDetail.description && (
          <div className="text-xs pt-2">
            <span className="text-slate-400 text-[10px] block uppercase font-bold">Deskripsi</span>
            <p className="text-slate-800 font-medium leading-relaxed mt-0.5">{activityDetail.description}</p>
          </div>
        )}

        {activityDetail.purpose && (
          <div className="text-xs pt-2">
            <span className="text-slate-400 text-[10px] block uppercase font-bold">Tujuan / Agenda</span>
            <p className="text-slate-800 font-medium leading-relaxed mt-0.5">{activityDetail.purpose}</p>
          </div>
        )}

        {activityDetail.summaryMeeting && (
          <div className="text-xs pt-2">
            <span className="text-slate-400 text-[10px] block uppercase font-bold">Summary Meeting / Ringkasan Rapat</span>
            <p className="text-slate-800 font-medium leading-relaxed mt-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">{activityDetail.summaryMeeting}</p>
          </div>
        )}

        {activityDetail.giftReason && (
          <div className="text-xs pt-2">
            <span className="text-slate-400 text-[10px] block uppercase font-bold">Alasan Hadiah</span>
            <p className="text-slate-800 font-medium leading-relaxed mt-0.5">{activityDetail.giftReason}</p>
          </div>
        )}

        {activityDetail.sponsorshipReason && (
          <div className="text-xs pt-2">
            <span className="text-slate-400 text-[10px] block uppercase font-bold">Alasan Sponsor</span>
            <p className="text-slate-800 font-medium leading-relaxed mt-0.5">{activityDetail.sponsorshipReason}</p>
          </div>
        )}

        {activityDetail.facilitationReason && (
          <div className="text-xs pt-2">
            <span className="text-slate-400 text-[10px] block uppercase font-bold">Alasan Fasilitasi</span>
            <p className="text-slate-800 font-medium leading-relaxed mt-0.5">{activityDetail.facilitationReason}</p>
          </div>
        )}

        {/* Radiant Employee Participants List */}
        {activityDetail.radiantEmployees && activityDetail.radiantEmployees.length > 0 && (
          <div className="pt-2">
            <span className="text-slate-400 text-[10px] block uppercase font-bold mb-1">
              Tim Radiant Group yang Hadir ({activityDetail.radiantEmployees.length} Orang)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activityDetail.radiantEmployees.map((e: any) => (
                <span
                  key={e.employeeId}
                  className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-800 rounded-lg text-[11px] font-semibold"
                >
                  {e.fullName} ({e.positionName})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Uploaded Attachments List in Review */}
        {attachments.length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <span className="text-slate-400 text-[10px] block uppercase font-bold mb-1 flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
              Dokumen Bukti Pendukung ({attachments.length} File)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <File className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-slate-800 truncate" title={att.name}>
                      {att.name}
                    </span>
                  </div>
                  {att.dataUrl && (
                    <a
                      href={att.dataUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={att.name}
                      className="text-emerald-700 hover:text-emerald-800 font-bold text-[11px] flex items-center gap-1 shrink-0 bg-emerald-100/60 hover:bg-emerald-100 px-2 py-0.5 rounded transition-colors"
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

      {/* Approval Workflow Explanation Callout */}
      {activityType === "GIFT" ? (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Informasi Alur Persetujuan (Pemberian/Penerimaan Hadiah):</p>
            <p className="text-amber-800 mt-0.5 leading-relaxed">
              Deklarasi jenis <strong>Pemberian & Penerimaan Hadiah (GIFT)</strong> ini memerlukan verifikasi dan persetujuan khusus dari Approver / Tim Kepatuhan sebelum status menjadi Approved.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Informasi Alur Persetujuan (Pencatatan Mandiri):</p>
            <p className="text-emerald-800 mt-0.5 leading-relaxed">
              Jenis kegiatan <strong>{actMeta?.label}</strong> tidak memerlukan persetujuan/verifikasi khusus dari Approver. Setelah disubmit, deklarasi akan <strong>langsung disetujui otomatis (Status: Approved/Recorded)</strong> di portal Kepatuhan.
            </p>
          </div>
        </div>
      )}

      {/* Compliance & Transparency Declaration Statement Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-sky-600" />
            {statement?.title || "Deklarasi Kepatuhan dan Transparansi"}
          </h3>
          <span className="text-xs font-mono font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
            Document Code: F-COMP-001-01
          </span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3 text-xs text-slate-700">
          <div>
            <p className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              Pernyataan Resmi Kepatuhan (Bahasa Indonesia):
            </p>
            <p className="text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 font-medium">
              {statement?.statementIndonesian ||
                "Dengan ini saya menyatakan bahwa seluruh data dan informasi yang saya sampaikan dalam Formulir Deklarasi Anti-Bribery & Anti-Corruption (ABC) ini adalah BENAR, AKURAT, dan SESUAI dengan fakta yang sebenarnya."}
            </p>
          </div>

          {statement?.statementEnglish && (
            <div>
              <p className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-sky-600" />
                Official Compliance Statement (English):
              </p>
              <p className="text-slate-600 italic leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                "{statement.statementEnglish}"
              </p>
            </div>
          )}
        </div>

        {/* Compliance Checkbox */}
        <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-300 hover:border-sky-500 cursor-pointer transition-all">
          <input
            type="checkbox"
            checked={declarationAccepted}
            onChange={(e) => onAcceptChange(e.target.checked)}
            className="mt-0.5 w-4 h-4 text-sky-600 rounded focus:ring-sky-500 cursor-pointer"
          />
          <span className="text-xs font-bold text-slate-900 leading-snug">
            Saya menyetujui dan mengonfirmasi bahwa seluruh informasi dalam deklarasi ini BENAR, TRANSPARAN, AKURAT, dan DAPAAT DIPERTANGGUNGJAWABKAN (I confirm and accept this declaration).
          </span>
        </label>

        {error && <p className="text-xs font-bold text-red-500">{error}</p>}
      </div>
    </div>
  );
};
