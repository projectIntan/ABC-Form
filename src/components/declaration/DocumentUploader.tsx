import React, { useState, useRef } from "react";
import { Attachment } from "../../types";
import {
  UploadCloud,
  File,
  FileText,
  Image as ImageIcon,
  X,
  Eye,
  Download,
  Paperclip,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface DocumentUploaderProps {
  attachments: Attachment[];
  onChange: (attachments: Attachment[]) => void;
  maxFileSizeMB?: number;
  allowedTypes?: string[];
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  attachments,
  onChange,
  maxFileSizeMB = 10,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const processFiles = (files: FileList | File[]) => {
    setUploadError(null);
    const newAttachments: Attachment[] = [...attachments];
    let hasError = false;

    Array.from(files).forEach((file) => {
      // Check file size
      if (file.size > maxFileSizeMB * 1024 * 1024) {
        setUploadError(`Ukuran file "${file.name}" melebihi batas maksimal ${maxFileSizeMB}MB.`);
        hasError = true;
        return;
      }

      // Read file to Base64 data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const newAttachment: Attachment = {
          id: `ATT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          uploadedAt: new Date().toISOString(),
          dataUrl,
        };

        // Prevent exact duplicate name uploads
        if (!newAttachments.some((a) => a.name === file.name && a.size === file.size)) {
          newAttachments.push(newAttachment);
          onChange([...newAttachments]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleRemove = (id: string) => {
    const updated = attachments.filter((att) => att.id !== id);
    onChange(updated);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return <ImageIcon className="w-5 h-5 text-sky-600 shrink-0" />;
    }
    if (type.includes("pdf")) {
      return <FileText className="w-5 h-5 text-rose-600 shrink-0" />;
    }
    return <File className="w-5 h-5 text-emerald-600 shrink-0" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Paperclip className="w-4 h-4 text-emerald-600" />
            Dokumen Bukti Pendukung
          </label>
          <p className="text-xs text-slate-500 mt-0.5">
            Unggah kuitansi, struk pembayar, undangan, daftar hadir rapat, atau bukti pendukung lainnya.
          </p>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">
          Maks. {maxFileSizeMB}MB / file (PDF, PNG, JPG, DOCX)
        </span>
      </div>

      {/* Drag & Drop Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-emerald-500 bg-emerald-50/60 scale-[1.01]"
            : "border-slate-300 bg-slate-50/50 hover:bg-slate-100/60 hover:border-slate-400"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isDragging ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"
            }`}
          >
            <UploadCloud className="w-6 h-6" />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700">
              <span className="text-emerald-600 hover:underline">Klik untuk pilih dokumen</span> atau seret & lepas file di sini
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Format yang didukung: PDF, PNG, JPG, DOCX, XLSX
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700 font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Uploaded Files List */}
      {attachments.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
            <span>Daftar File Terunggah ({attachments.length}):</span>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {file.dataUrl && (
                    <a
                      href={file.dataUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={file.name}
                      className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Unduh / Lihat File"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemove(file.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Hapus File"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
