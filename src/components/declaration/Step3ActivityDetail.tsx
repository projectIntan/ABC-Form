import React from "react";
import { ActivityType, Attachment, DeclarationIdentity, ExternalPartyInfo } from "../../types";
import { InternalActivityForm } from "./forms/InternalActivityForm";
import { ExternalMealForm } from "./forms/ExternalMealForm";
import { GiftForm } from "./forms/GiftForm";
import { RecreationalForm } from "./forms/RecreationalForm";
import { SponsorshipForm } from "./forms/SponsorshipForm";
import { FacilitationForm } from "./forms/FacilitationForm";
import { EntertainmentForm } from "./forms/EntertainmentForm";
import { DocumentUploader } from "./DocumentUploader";
import { Database } from "lucide-react";
import { DeclarationRoutingFields } from "./DeclarationRoutingFields";

interface Step3ActivityDetailProps {
  activityType: ActivityType;
  data: Record<string, any>;
  onChange: (updated: Record<string, any>) => void;
  attachments?: Attachment[];
  onAttachmentsChange?: (attachments: Attachment[]) => void;
  errors: Record<string, string>;
  identity: DeclarationIdentity;
  externalParty: ExternalPartyInfo;
  onExternalPartyChange: (data: ExternalPartyInfo) => void;
}

export const Step3ActivityDetail: React.FC<Step3ActivityDetailProps> = ({
  activityType,
  data,
  onChange,
  attachments = [],
  onAttachmentsChange,
  errors,
  identity,
  externalParty,
  onExternalPartyChange,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Activity Detail</h3>
          <p className="text-xs text-slate-500">
            Lengkapi rincian kegiatan deklarasi dan unggah dokumen bukti pendukung di bawah ini.
          </p>
        </div>
        <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700">
          Type: <span className="text-sky-600 font-bold">{activityType}</span>
        </div>
      </div>

      <DeclarationRoutingFields sbu={identity.sbu} department={identity.department} data={externalParty} errors={errors} onChange={onExternalPartyChange} />

      {/* ERP Flow Banner */}
      <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-4 flex items-start gap-3">
        <Database className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div className="text-xs text-sky-900 space-y-1">
          <p className="font-bold">Informasi Integrasi ERP Expense:</p>
          <p className="text-sky-800 leading-relaxed">
            Form ABC dibuat terlebih dahulu. Setelah deklarasi ini <strong>disetujui (APPROVED)</strong>, nomor deklarasi ABC ini akan digunakan sebagai referensi untuk menerbitkan nomor expense di ERP.
          </p>
        </div>
      </div>

      {activityType === "INTERNAL" && (
        <InternalActivityForm data={data} onChange={onChange} errors={errors} />
      )}

      {activityType === "EXTERNAL_MEAL" && (
        <ExternalMealForm data={data} onChange={onChange} errors={errors} />
      )}

      {activityType === "GIFT" && (
        <GiftForm data={data} onChange={onChange} errors={errors} />
      )}

      {activityType === "RECREATIONAL" && (
        <RecreationalForm data={data} onChange={onChange} errors={errors} />
      )}

      {activityType === "SPONSORSHIP" && (
        <SponsorshipForm data={data} onChange={onChange} errors={errors} />
      )}

      {activityType === "FACILITATION" && (
        <FacilitationForm data={data} onChange={onChange} errors={errors} />
      )}

      {activityType === "ENTERTAINMENT" && (
        <EntertainmentForm data={data} onChange={onChange} errors={errors} />
      )}

      {/* Supporting Documents Section */}
      <div className="pt-6 border-t border-slate-200">
        <DocumentUploader
          attachments={attachments}
          onChange={(newAtts) => onAttachmentsChange?.(newAtts)}
        />
        {errors.attachments && <p className="text-[10px] text-red-500 font-medium mt-2">{errors.attachments}</p>}
      </div>
    </div>
  );
};
