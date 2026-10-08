import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, useLocation, Link } from "react-router";
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
  PlusCircle,
  Building2,
  ShieldCheck,
  Lock,
  LogOut,
  UserCheck,
  Download,
  Loader2,
} from "lucide-react";
import { DeclarationDocumentService } from "../services/document.service";

interface CreateDeclarationProps {
  isPublicRoot?: boolean;
}

export const CreateDeclaration: React.FC<CreateDeclarationProps> = ({ isPublicRoot = false }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("editId");

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<Declaration | null>(null);

  // Document Generation States (Post-submission)
  const [isDocGenerating, setIsDocGenerating] = useState(false);
  const [isDocReady, setIsDocReady] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);

  const getFreshIdentity = useCallback((): DeclarationIdentity => {
    if (user?.employee) {
      return {
        employeeId: user.employee.employeeId || "",
        fullName: user.employee.fullName || "",
        email: user.employee.email || "",
        entity: user.employee.entityName || "PT Radiant Utama Interinsco Tbk",
        position: user.employee.positionName || "",
        sbu: user.employee.sbuName || "",
        department: user.employee.department || "",
        organizationHierarchy: user.employee.organizationName || "",
        managerName: user.employee.managerName || "",
        activityType: "INTERNAL",
      };
    }
    // Clean initial empty template for Public Submitter (auto-cleared)
    return {
      employeeId: "",
      fullName: "",
      email: "",
      entity: "",
      position: "",
      sbu: "",
      department: "",
      organizationHierarchy: "",
      managerName: "",
      activityType: "INTERNAL",
    };
  }, [user]);

  // Form States
  const [identity, setIdentity] = useState<DeclarationIdentity>(getFreshIdentity());
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

  // Reset all declaration state and clear caches
  const resetToCleanState = useCallback((notify = false) => {
    setCurrentStep(1);
    setIsLoading(false);
    setIsConfirmModalOpen(false);
    setSubmittedResult(null);
    setIsDocGenerating(false);
    setIsDocReady(false);
    setDocError(null);
    setErrors({});
    setDeclarationAccepted(false);
    setAttachments([]);
    setActivityDetail({});
    setExternalParty({
      companyName: "",
      relationship: "",
      projectCode: "",
      activityCategory: "",
    });
    setIdentity(getFreshIdentity());

    // Wipe any potential cache in localStorage and sessionStorage
    try {
      localStorage.removeItem("radiant_abc_form_cache");
      localStorage.removeItem("radiant_abc_draft_cache");
      sessionStorage.removeItem("radiant_abc_form_cache");
      sessionStorage.removeItem("radiant_abc_draft_cache");
    } catch {
      // ignore
    }

    if (notify) {
      showToast("Cache formulir dibersihkan. Memulai deklarasi baru yang bersih.", "info");
    }
  }, [getFreshIdentity, showToast]);

  // Handle editId changes, navigation, or fresh declaration clicks
  useEffect(() => {
    if (!editId) {
      // Whenever editId is null or cleared, reset cache and previous form state completely
      resetToCleanState(false);
    } else {
      // If editing an existing draft
      async function loadDraft(id: string) {
        setIsLoading(true);
        try {
          const existing = await DeclarationService.getDeclarationById(id);
          if (existing) {
            if (existing.status !== "DRAFT") {
              showToast("Hanya deklarasi berstatus DRAFT yang dapat diedit.", "error");
              navigate("/");
              return;
            }
            setIdentity(existing.identity);
            setExternalParty(existing.externalParty || {
              companyName: "",
              relationship: "",
              projectCode: "",
              activityCategory: "",
            });
            setActivityDetail(existing.activityDetail || {});
            setAttachments(existing.attachments || []);
            setDeclarationAccepted(existing.declarationAccepted || false);
            setCurrentStep(1);
            setSubmittedResult(null);
            setErrors({});
          } else {
            showToast("Draft deklarasi tidak ditemukan.", "error");
            resetToCleanState(false);
          }
        } catch {
          showToast("Gagal memuat draft deklarasi.", "error");
        } finally {
          setIsLoading(false);
        }
      }
      loadDraft(editId);
    }
  }, [editId, location.key, location.state, resetToCleanState, navigate, showToast]);

  // Listen for global reset event from sidebar or dashboard
  useEffect(() => {
    const handleGlobalReset = () => {
      if (editId) {
        navigate(isPublicRoot ? "/" : "/declarations/create", { replace: true });
      }
      resetToCleanState(true);
    };

    window.addEventListener("reset-declaration-form", handleGlobalReset);
    return () => window.removeEventListener("reset-declaration-form", handleGlobalReset);
  }, [editId, navigate, resetToCleanState, isPublicRoot]);

  // Keep identity info synced with logged in user if available and not editing
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
    if (updatedIdentity.sbu !== identity.sbu) {
      setExternalParty((prev) => ({ ...prev, projectCode: "", projectCodeId: "", costControlEmployeeId: "", costControlName: "", costControlEmail: "" }));
    } else if (updatedIdentity.department !== identity.department) {
      setExternalParty((prev) => ({ ...prev, projectCode: "", projectCodeId: "" }));
    }
    setIdentity(updatedIdentity);
    if (errors.activityType) setErrors((prev) => ({ ...prev, activityType: "" }));
  };

  // Step Validation Logic
  const validateStep = (stepNumber: number): { isValid: boolean; errors: Record<string, string> } => {
    const errs: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!identity.entity || !identity.entity.trim())
        errs.entity = "Entitas Perusahaan wajib dipilih.";
      if (!identity.sbu || !identity.sbu.trim())
        errs.sbu = "SBU wajib dipilih.";
      if (!identity.department || !identity.department.trim())
        errs.department = "Departemen wajib dipilih.";
      if (!identity.fullName || !identity.fullName.trim())
        errs.fullName = "Nama Karyawan wajib dipilih.";
      if (!identity.email || !identity.email.includes("@"))
        errs.email = "Email resmi karyawan wajib terisi dan valid.";
      if (!identity.employeeId || !identity.employeeId.trim())
        errs.employeeId = "Employee ID / NIK belum terisi.";
      if (!identity.activityType)
        errs.activityType = "Silakan pilih jenis kegiatan.";
    }

    const routingStep = (isInternal && (stepNumber === 2 || stepNumber === 3)) || (!isInternal && (stepNumber === 3 || stepNumber === 4));
    if (routingStep) {
      if (!externalParty.projectCode?.trim()) errs.projectCode = "Project Code wajib dipilih.";
      if (!externalParty.costControlEmployeeId) errs.costControl = "Cost Control wajib dipilih.";
      if (!externalParty.costControlEmail) errs.costControlEmail = "Email Cost Control wajib tersedia.";
      if (!attachments.length) errs.attachments = "Dokumen wajib diupload sebelum Submit.";
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
      if (user) {
        navigate("/declarations");
      } else {
        showToast("Draft tersimpan di sesi browser lokal.", "info");
      }
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

      // Retrieve saved declaration from stored declarations (Data Integrity)
      const savedDecl = (await DeclarationService.getDeclarationById(res.id)) || res;
      setSubmittedResult(savedDecl);

      // Automatic document generation flow
      setIsDocGenerating(true);
      setDocError(null);
      try {
        await DeclarationDocumentService.generateDocumentBlob(savedDecl);
        setIsDocReady(true);
      } catch (docErr: any) {
        console.error("[Document Generation Error]", docErr);
        setDocError("Dokumen belum berhasil dibuat otomatis. Anda dapat mencoba lagi.");
        setIsDocReady(false);
      } finally {
        setIsDocGenerating(false);
      }

      const isGift = res.identity.activityType === "GIFT";
      showToast(
        isGift
          ? `Deklarasi Hadiah ${res.declarationNumber} berhasil dikirim untuk verifikasi/persetujuan Compliance!`
          : `Deklarasi ${res.declarationNumber} berhasil dicatat & disetujui otomatis (Approved)!`,
        "success"
      );
    } catch {
      showToast("Gagal mengirim deklarasi.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadDoc = async () => {
    if (!submittedResult) return;
    try {
      await DeclarationDocumentService.downloadDocument(submittedResult);
      showToast("Dokumen Declaration Form berhasil diunduh (.docx)", "success");
    } catch (err) {
      console.error("[Download Error]", err);
      showToast("Gagal mengunduh dokumen deklarasi.", "error");
    }
  };

  const handleRetryDocGen = async () => {
    if (!submittedResult) return;
    setIsDocGenerating(true);
    setDocError(null);
    try {
      await DeclarationDocumentService.generateDocumentBlob(submittedResult);
      setIsDocReady(true);
      showToast("Dokumen Declaration Form siap diunduh!", "success");
    } catch (err) {
      console.error("[Retry Doc Gen Error]", err);
      setDocError("Gagal membuat dokumen deklarasi. Silakan periksa kembali atau coba lagi.");
      setIsDocReady(false);
    } finally {
      setIsDocGenerating(false);
    }
  };

  // If Submission Succeeded Screen
  if (submittedResult) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 p-4 sm:p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full mx-auto space-y-6 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-lg text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                Document Code: F-COMP-001-01
              </span>
              <h1 className="text-2xl font-bold text-slate-900">
                Deklarasi Berhasil Dikirim
              </h1>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Deklarasi Anda telah berhasil disimpan dan diteruskan ke Tim Compliance / Reviewer untuk diverifikasi.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">
                  Nomor Registrasi Deklarasi
                </span>
                <span className="font-bold font-mono text-sky-700 text-sm">
                  {submittedResult.declarationNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">
                  Waktu Pengiriman
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
                    SUBMITTED (Menunggu Verifikasi)
                  </span>
                ) : null}
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">
                  Nama Pelapor
                </span>
                <span className="font-bold text-slate-800">
                  {submittedResult.identity.fullName} ({submittedResult.identity.employeeId})
                </span>
              </div>
            </div>

            {/* Download Declaration Form Document Section */}
            <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/80 border border-sky-200/80 text-left space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Dokumen Formulir Deklarasi ABC
                    </h4>
                    <p className="text-xs text-slate-500 font-mono">
                      {DeclarationDocumentService.getFileName(submittedResult)}
                    </p>
                  </div>
                </div>

                {isDocGenerating ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-sky-200 text-xs font-semibold text-sky-700 shadow-2xs">
                    <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                    <span>Menyiapkan Dokumen...</span>
                  </div>
                ) : isDocReady ? (
                  <button
                    type="button"
                    onClick={handleDownloadDoc}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download Declaration Form (.docx)
                  </button>
                ) : docError ? (
                  <button
                    type="button"
                    onClick={handleRetryDocGen}
                    className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Coba Lagi Buat Dokumen
                  </button>
                ) : null}
              </div>

              {docError && (
                <div className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
                  <p className="font-semibold">Pemberitahuan:</p>
                  <p>{docError} (Data deklarasi Anda telah aman tersimpan pada sistem).</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  resetToCleanState(true);
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> + Isi Deklarasi Baru
              </button>

              {user ? (
                <>
                  <Link
                    to={`/declarations/${submittedResult.id}`}
                    className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" /> Lihat Detail Deklarasi
                  </Link>
                  <Link
                    to="/dashboard"
                    className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Ke Dashboard
                  </Link>
                </>
              ) : (
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4 text-sky-400" /> Login Monitoring Tim Compliance
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Declaration Form View
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans antialiased">
      {/* Public Header Navbar (Tampil untuk unauthenticated & public flow) */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-sky-500 rounded-xl flex items-center justify-center font-bold text-white shadow-2xs shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                RADIANT GROUP
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Anti-Bribery & Corruption Declaration Portal (F-COMP-001-01)
            </p>
          </div>
        </div>

        {/* Right Corner: Compliance Login / User Indicator */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Monitoring Dashboard</span>
              </Link>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0f172a] hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-2xs border border-slate-700"
            >
              <Lock className="w-3.5 h-3.5 text-sky-400" />
              <span>Login Compliance</span>
            </Link>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-4 sm:p-8 max-w-5xl w-full mx-auto space-y-6">
        {/* Draft Mode Notification (Hanya tampil saat mengedit draft tersimpan) */}
        {editId && (
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">Edit Draft Deklarasi</h2>
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px] uppercase">
                    Draft Mode
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Menyunting draft tersimpan: {editId}. Perubahan dapat disimpan kembali sebagai draft atau disubmit.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                navigate(isPublicRoot ? "/" : "/declarations/create");
                resetToCleanState(false);
              }}
              className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Deklarasi Baru
            </button>
          </div>
        )}

        {/* Wizard Progress Stepper */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-2xs">
          <WizardProgress
            currentStep={currentStep}
            activityType={identity.activityType}
          />
        </div>

        {/* Dynamic Wizard Steps */}
        <div className="animate-fadeIn">
          {currentStep === 1 && (
            <Step1Identity
              data={identity}
              onChange={handleIdentityChange}
              errors={errors}
              isPublic={!user}
            />
          )}

          {!isInternal && currentStep === 2 && (
            <Step2ExternalParty
              data={externalParty}
              onChange={(updated) => {
                setExternalParty(updated);
                setErrors((prev) => ({
                  ...prev,
                  companyName: "",
                  relationship: "",
                }));
              }}
              errors={errors}
            />
          )}

          {((isInternal && currentStep === 2) || (!isInternal && currentStep === 3)) && (
            <Step3ActivityDetail
              activityType={identity.activityType}
              data={activityDetail}
              identity={identity}
              externalParty={externalParty}
              onExternalPartyChange={(updated) => {
                setExternalParty(updated);
                setErrors((prev) => ({ ...prev, projectCode: "", costControl: "", costControlEmail: "" }));
              }}
              onChange={(updated) => {
                setActivityDetail(updated);
                setErrors({});
              }}
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
              onAttachmentsChange={setAttachments}
              declarationAccepted={declarationAccepted}
              onAcceptChange={(accepted) => {
                setDeclarationAccepted(accepted);
                if (errors.declarationAccepted) {
                  setErrors((prev) => ({ ...prev, declarationAccepted: "" }));
                }
              }}
              onDeclarationAcceptedChange={(accepted) => {
                setDeclarationAccepted(accepted);
                if (errors.declarationAccepted) {
                  setErrors((prev) => ({ ...prev, declarationAccepted: "" }));
                }
              }}
              onJumpToStep={(stepNumber) => {
                setCurrentStep(stepNumber);
              }}
              error={errors.declarationAccepted}
              errors={errors}
            />
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isLoading}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Kembali
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" /> Simpan Draft
            </button>

            {currentStep < maxStep ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <span>Lanjut</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const { isValid } = validateStep(maxStep);
                  if (isValid) {
                    setIsConfirmModalOpen(true);
                  } else {
                    showToast("Harap setujui pernyataan kepatuhan sebelum mengirim.", "error");
                  }
                }}
                disabled={isLoading || !declarationAccepted}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Deklarasi</span>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Confirmation Modal Submit Final */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        title="Konfirmasi Pengiriman Deklarasi ABC"
        message={`Apakah Anda yakin seluruh data deklarasi kegiatan ${identity.activityType} yang Anda sampaikan sudah benar, akurat, dan sesuai ketentuan integritas Radiant Group?`}
        confirmLabel="Ya, Kirim Deklarasi"
        cancelLabel="Periksa Kembali"
        onConfirm={handleSubmitFinal}
        onCancel={() => setIsConfirmModalOpen(false)}
        isLoading={isLoading}
      />

      {/* Enterprise Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 sm:px-8 py-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 mt-8">
        <div>
          &copy; {new Date().getFullYear()} <strong>PT Radiant Utama Interinsco Tbk</strong> — Compliance & Legal Enforcement.
        </div>
        <div className="font-mono text-[10px] text-slate-400">
          Form Ref: F-COMP-001-01 | Anti-Bribery & Corruption Policy
        </div>
      </footer>
    </div>
  );
};
