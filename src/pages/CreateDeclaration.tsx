import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { DeclarationService } from "../services/declaration.service";
import {
  DeclarationIdentity,
  ExternalPartyInfo,
  ActivityType,
  Attachment,
  Declaration,
} from "../types";
import { WizardProgress } from "../components/declaration/WizardProgress";
import { Step1Identity } from "../components/declaration/Step1Identity";
import { Step2ExternalParty } from "../components/declaration/Step2ExternalParty";
import { Step3ActivityDetail } from "../components/declaration/Step3ActivityDetail";
import { Step4Review } from "../components/declaration/Step4Review";
import { ConfirmationModal } from "../components/common/ConfirmationModal";
import { formatDate } from "../utils/formatters";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  CheckCircle2,
  FileText,
  LayoutDashboard,
} from "lucide-react";

export const CreateDeclaration: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("editId");

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<Declaration | null>(null);

  // Form States
  const [identity, setIdentity] = useState<DeclarationIdentity>({
    employeeId: user?.employee.employeeId || "EMP001",
    fullName: user?.employee.fullName || "John Doe",
    email: user?.employee.email || "john.doe@radiant.co.id",
    entity: user?.employee.entityName || "PT Radiant Group",
    position: user?.employee.positionName || "Operations Supervisor",
    sbu: user?.employee.sbuName || "SBU Energy & Offshore Services",
    department: user?.employee.department || "Operations & Field Management",
    organizationHierarchy: user?.employee.organizationName || "Operations & Field Management",
    managerName: user?.employee.managerName || "Jane Smith",
    activityType: "INTERNAL",
  });

  const [externalParty, setExternalParty] = useState<ExternalPartyInfo>({
    companyName: "",
    relationship: "",
    projectCode: "",
    activityCategory: "",
  });

  const [activityDetail, setActivityDetail] = useState<Record<string, any>>({});
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // If editing an existing draft
  useEffect(() => {
    async function loadDraft() {
      if (!editId) return;
      setIsLoading(true);
      try {
        const existing = await DeclarationService.getDeclarationById(editId);
        if (existing) {
          if (existing.status !== "DRAFT") {
            showToast("Hanya deklarasi berstatus DRAFT yang dapat diedit.", "error");
            navigate("/declarations");
            return;
          }
          setIdentity(existing.identity);
          setExternalParty(existing.externalParty);
          setActivityDetail(existing.activityDetail);
          setAttachments(existing.attachments || []);
          setDeclarationAccepted(existing.declarationAccepted);
        }
      } catch {
        showToast("Gagal memuat draft deklarasi.", "error");
      } finally {
        setIsLoading(false);
      }
    }
    loadDraft();
  }, [editId]);

  // Keep identity info synced with user
  useEffect(() => {
    if (user && !editId) {
      setIdentity((prev) => ({
        ...prev,
        employeeId: user.employee.employeeId,
        fullName: user.employee.fullName,
        email: user.employee.email,
        entity: user.employee.entityName,
        position: user.employee.positionName,
        sbu: user.employee.sbuName || prev.sbu,
        department: user.employee.department || prev.department,
        organizationHierarchy: user.employee.organizationName,
        managerName: user.employee.managerName,
      }));
    }
  }, [user, editId]);

  const isInternal = identity.activityType === "INTERNAL";
  const maxStep = isInternal ? 3 : 4;

  // Auto adjust currentStep if switching to internal and step is > 3
  useEffect(() => {
    if (currentStep > maxStep) {
      setCurrentStep(maxStep);
    }
  }, [maxStep, currentStep]);

  // Handle Activity Type change -> Auto Reset Activity Detail
  const handleIdentityChange = (updatedIdentity: DeclarationIdentity) => {
    if (updatedIdentity.activityType !== identity.activityType) {
      setActivityDetail({}); // Reset detail on activity type switch
    }
    setIdentity(updatedIdentity);
    if (errors.activityType) setErrors((prev) => ({ ...prev, activityType: "" }));
  };

  // Step Validation Logic
  const validateStep = (stepNumber: number): { isValid: boolean; errors: Record<string, string> } => {
    const errs: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!identity.fullName) errs.fullName = "Nama lengkap wajib diisi.";
      if (!identity.email || !identity.email.includes("@"))
        errs.email = "Email tidak valid.";
      if (!identity.activityType)
        errs.activityType = "Silakan pilih jenis kegiatan.";
    }

    // Step 2 for Non-Internal: External Party Validation
    if (!isInternal && stepNumber === 2) {
      if (!externalParty.companyName?.trim())
        errs.companyName = "Nama perusahaan/organisasi wajib diisi.";
      if (!externalParty.relationship)
        errs.relationship = "Silakan pilih hubungan pihak eksternal.";
    }

    // Detail Kegiatan Validation (Step 2 if Internal, Step 3 if Non-Internal)
    const isDetailStep = (isInternal && stepNumber === 2) || (!isInternal && stepNumber === 3);
    if (isDetailStep) {
      const actType = identity.activityType;

      if (actType === "INTERNAL") {
        if (!activityDetail.date) errs.date = "Tanggal pelaksanaan wajib diisi.";
        if (!activityDetail.mealType?.trim())
          errs.mealType = "Jenis jamuan/konsumsi wajib diisi.";
        if (!activityDetail.totalAmount || activityDetail.totalAmount <= 0)
          errs.totalAmount = "Total biaya wajib diisi lebih dari 0.";
        if (!activityDetail.description?.trim())
          errs.description = "Deskripsi kegiatan wajib diisi.";
        if (!activityDetail.participantCount || activityDetail.participantCount <= 0)
          errs.participantCount = "Jumlah partisipan wajib lebih dari 0.";
        if (!activityDetail.radiantEmployees || activityDetail.radiantEmployees.length === 0)
          errs.radiantEmployees = "Minimal 1 karyawan Radiant Group wajib ditambahkan.";
      }

      if (actType === "EXTERNAL_MEAL") {
        if (!activityDetail.date) errs.date = "Tanggal pelaksanaan wajib diisi.";
        if (!activityDetail.location?.trim()) errs.location = "Lokasi jamuan wajib diisi.";
        if (!activityDetail.purpose?.trim()) errs.purpose = "Tujuan kegiatan wajib diisi.";
        if (!activityDetail.summaryMeeting?.trim())
          errs.summaryMeeting = "Summary meeting / ringkasan rapat wajib diisi.";
        if (!activityDetail.participantCount || activityDetail.participantCount <= 0)
          errs.participantCount = "Jumlah partisipan wajib lebih dari 0.";
        if (!activityDetail.totalAmount || activityDetail.totalAmount <= 0)
          errs.totalAmount = "Total biaya wajib diisi lebih dari 0.";
        if (!activityDetail.radiantEmployees || activityDetail.radiantEmployees.length === 0)
          errs.radiantEmployees = "Minimal 1 karyawan Radiant Group wajib ditambahkan.";
      }

      if (actType === "GIFT") {
        if (!activityDetail.date) errs.date = "Tanggal hadiah wajib diisi.";
        if (!activityDetail.description?.trim()) errs.description = "Deskripsi hadiah wajib diisi.";
        if (!activityDetail.giftReason?.trim()) errs.giftReason = "Alasan hadiah wajib diisi.";
        if (!activityDetail.quantity || activityDetail.quantity <= 0)
          errs.quantity = "Kuantitas wajib lebih dari 0.";
        if (!activityDetail.estimatedPrice || activityDetail.estimatedPrice <= 0)
          errs.estimatedPrice = "Estimasi harga wajib diisi lebih dari 0.";
      }

      if (actType === "RECREATIONAL") {
        if (!activityDetail.date) errs.date = "Tanggal pelaksanaan wajib diisi.";
        if (!activityDetail.location?.trim()) errs.location = "Lokasi rekreasi wajib diisi.";
        if (!activityDetail.purpose?.trim()) errs.purpose = "Tujuan kegiatan wajib diisi.";
        if (!activityDetail.participantCount || activityDetail.participantCount <= 0)
          errs.participantCount = "Jumlah partisipan wajib lebih dari 0.";
        if (!activityDetail.totalAmount || activityDetail.totalAmount <= 0)
          errs.totalAmount = "Total biaya wajib diisi lebih dari 0.";
        if (!activityDetail.radiantEmployees || activityDetail.radiantEmployees.length === 0)
          errs.radiantEmployees = "Minimal 1 karyawan Radiant Group wajib ditambahkan.";
      }

      if (actType === "SPONSORSHIP") {
        if (!activityDetail.date) errs.date = "Tanggal pemberian wajib diisi.";
        if (!activityDetail.sponsorshipReason?.trim())
          errs.sponsorshipReason = "Alasan pemberian sponsor/donasi wajib diisi.";
        if (!activityDetail.sponsorshipAmount || activityDetail.sponsorshipAmount <= 0)
          errs.sponsorshipAmount = "Nominal sponsor/donasi wajib diisi lebih dari 0.";
      }

      if (actType === "FACILITATION") {
        if (!activityDetail.date) errs.date = "Tanggal pembayaran wajib diisi.";
        if (!activityDetail.facilitationReason?.trim())
          errs.facilitationReason = "Alasan pembayaran fasilitasi wajib diisi.";
        if (!activityDetail.facilitationAmount || activityDetail.facilitationAmount <= 0)
          errs.facilitationAmount = "Nominal pembayaran fasilitasi wajib diisi lebih dari 0.";
      }

      if (actType === "ENTERTAINMENT") {
        if (!activityDetail.entertainmentType?.trim())
          errs.entertainmentType = "Jenis hiburan wajib diisi.";
        if (!activityDetail.date) errs.date = "Tanggal penerimaan hiburan wajib diisi.";
        if (!activityDetail.entertainmentReason?.trim())
          errs.entertainmentReason = "Alasan penerimaan hiburan wajib diisi.";
        if (!activityDetail.entertainmentVenue?.trim())
          errs.entertainmentVenue = "Nama tempat hiburan wajib diisi.";
      }

      // Validasi Kesamaan Jumlah Partisipan dengan Daftar Karyawan
      if (
        activityDetail.participantCount !== undefined &&
        activityDetail.participantCount !== null &&
        activityDetail.radiantEmployees &&
        Array.isArray(activityDetail.radiantEmployees)
      ) {
        const pCount = Number(activityDetail.participantCount) || 0;
        const empCount = activityDetail.radiantEmployees.length;
        if (pCount > 0 && pCount !== empCount) {
          errs.participantCount = `Jumlah partisipan (${pCount}) tidak sama dengan jumlah karyawan di daftar (${empCount}).`;
          errs.radiantEmployees = `Jumlah karyawan yang terdaftar (${empCount}) tidak sama dengan jumlah partisipan (${pCount}).`;
        }
      }
    }

    // Review & Deklarasi Step Validation (Step 3 if Internal, Step 4 if Non-Internal)
    const isReviewStep = (isInternal && stepNumber === 3) || (!isInternal && stepNumber === 4);
    if (isReviewStep) {
      if (!declarationAccepted) {
        errs.declarationAccepted =
          "Anda harus menyetujui pernyataan deklarasi sebelum submit.";
      }
    }

    setErrors(errs);
    return { isValid: Object.keys(errs).length === 0, errors: errs };
  };

  const handleNext = () => {
    const { isValid, errors: validationErrors } = validateStep(currentStep);
    if (isValid) {
      setCurrentStep((prev) => Math.min(maxStep, prev + 1));
    } else {
      if (
        validationErrors.participantCount &&
        validationErrors.participantCount.includes("tidak sama dengan")
      ) {
        showToast(
          "Gagal lanjut: Jumlah partisipan tidak sama dengan daftar nama karyawan.",
          "error"
        );
      } else {
        showToast("Harap lengkapi seluruh field wajib dengan benar.", "error");
      }
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      const draft = await DeclarationService.saveDraft({
        id: editId || undefined,
        identity,
        externalParty,
        activityDetail,
        attachments,
        declarationAccepted: false,
        documentCode: "F-COMP-001-01",
      });
      showToast(`Draft berhasil disimpan: ${draft.declarationNumber}`, "success");
      navigate("/declarations");
    } catch {
      showToast("Gagal menyimpan draft deklarasi.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitFinal = async () => {
    if (!validateStep(maxStep).isValid) return;
    setIsLoading(true);
    try {
      const res = await DeclarationService.submitDeclaration({
        id: editId || undefined,
        identity,
        externalParty,
        activityDetail,
        attachments,
        declarationAccepted: true,
        documentCode: "F-COMP-001-01",
      });
      setIsConfirmModalOpen(false);
      setSubmittedResult(res);
      const isGift = res.identity.activityType === "GIFT";
      showToast(
        isGift
          ? `Deklarasi Hadiah ${res.declarationNumber} berhasil dikirim untuk verifikasi/persetujuan Approver!`
          : `Deklarasi ${res.declarationNumber} berhasil dicatat & disetujui otomatis (Approved)!`,
        "success"
      );
    } catch {
      showToast("Gagal menyubmit deklarasi.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // If Submission Succeeded Screen
  if (submittedResult) {
    const isGift = submittedResult.identity.activityType === "GIFT";
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6 animate-fadeIn">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
              Document Code: F-COMP-001-01
            </span>
            <h1 className="text-2xl font-bold text-slate-900">
              {isGift ? "Deklarasi Hadiah Dikirim" : "Deklarasi Berhasil Dicatat (Approved)"}
            </h1>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {isGift
                ? "Deklarasi Hadiah Anda telah tercatat di portal Kepatuhan Radiant Group dan diteruskan ke fungsi Approver untuk verifikasi/persetujuan."
                : "Deklarasi Anda telah berhasil dicatat dan disetujui otomatis. Jenis kegiatan ini tidak memerlukan persetujuan khusus Approver."}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">
                Declaration Number
              </span>
              <span className="font-bold font-mono text-slate-900 text-sm">
                {submittedResult.declarationNumber}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">
                Submission Date
              </span>
              <span className="font-bold text-slate-800">
                {formatDate(submittedResult.submittedDate || submittedResult.createdDate)}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">
                Status Deklarasi
              </span>
              {submittedResult.status === "SUBMITTED" ? (
                <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                  SUBMITTED (Menunggu Review)
                </span>
              ) : (
                <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                  APPROVED (Otomatis)
                </span>
              )}
            </div>

            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">
                Submitted By
              </span>
              <span className="font-bold text-slate-800">
                {submittedResult.identity.fullName}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to={`/declarations/${submittedResult.id}`}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" /> View Declaration Detail
            </Link>
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Wizard Step Progress */}
      <WizardProgress
        currentStep={currentStep}
        activityType={identity.activityType}
        onStepClick={(step) => setCurrentStep(step)}
      />

      {/* Dynamic Step View Container */}
      {currentStep === 1 && (
        <Step1Identity
          data={identity}
          onChange={handleIdentityChange}
          errors={errors}
        />
      )}

      {!isInternal && currentStep === 2 && (
        <Step2ExternalParty
          data={externalParty}
          activityType={identity.activityType}
          onChange={(updated) => setExternalParty(updated)}
          errors={errors}
        />
      )}

      {((isInternal && currentStep === 2) || (!isInternal && currentStep === 3)) && (
        <Step3ActivityDetail
          activityType={identity.activityType}
          data={activityDetail}
          onChange={(updated) => setActivityDetail(updated)}
          attachments={attachments}
          onAttachmentsChange={(newAtts) => setAttachments(newAtts)}
          errors={errors}
        />
      )}

      {((isInternal && currentStep === 3) || (!isInternal && currentStep === 4)) && (
        <Step4Review
          identity={identity}
          externalParty={externalParty}
          activityType={identity.activityType}
          activityDetail={activityDetail}
          attachments={attachments}
          declarationAccepted={declarationAccepted}
          onAcceptChange={(val) => setDeclarationAccepted(val)}
          onJumpToStep={(s) => setCurrentStep(s)}
          error={errors.declarationAccepted}
        />
      )}

      {/* Footer Navigation Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Save className="w-4 h-4 text-slate-600" /> Save as Draft
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {currentStep < maxStep ? (
            <button
              type="button"
              onClick={handleNext}
              className="w-full sm:w-auto px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (validateStep(maxStep).isValid) {
                  setIsConfirmModalOpen(true);
                }
              }}
              disabled={isLoading || !declarationAccepted}
              className="w-full sm:w-auto px-6 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Send className="w-4 h-4" /> Submit Declaration
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        title="Submit Anti-Bribery Declaration"
        message="Are you sure you want to submit this declaration? After submission, you cannot edit this declaration until it is reviewed or rejected."
        confirmLabel="Ya, Submit Sekarang"
        cancelLabel="Batal"
        isLoading={isLoading}
        onConfirm={handleSubmitFinal}
        onCancel={() => setIsConfirmModalOpen(false)}
      />
    </div>
  );
};
