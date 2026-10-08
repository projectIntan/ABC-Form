import { ActivityType } from "../types";

export interface ActivityTypeMeta {
  type: ActivityType;
  label: string;
  description: string;
  iconName: string;
}

export const ACTIVITY_TYPES: ActivityTypeMeta[] = [
  {
    type: "INTERNAL",
    label: "Kegiatan Internal",
    description: "Kegiatan internal, rapat, atau jamuan khusus karyawan Radiant Group",
    iconName: "Users",
  },
  {
    type: "EXTERNAL_MEAL",
    label: "Jamuan Makan dengan Pihak Eksternal",
    description: "Makan siang/malam bisnis, jamuan dengan klien, mitra, atau vendor",
    iconName: "Utensils",
  },
  {
    type: "GIFT",
    label: "Hadiah dari/kepada Pihak Eksternal",
    description: "Pemberian atau penerimaan cinderamata, bingkisan, ucapan selamat, atau kado bisnis",
    iconName: "Gift",
  },
  {
    type: "RECREATIONAL",
    label: "Kegiatan Rekreasional dengan Pihak Eksternal",
    description: "Olahraga, golf, outing, atau acara hiburan komunitas bersama mitra eksternal",
    iconName: "Trophy",
  },
  {
    type: "SPONSORSHIP",
    label: "Sponsor/Donasi",
    description: "Dukungan dana, sponsorship acara, atau bantuan sosial/CSR atas nama perusahaan",
    iconName: "HeartHandshake",
  },
  {
    type: "FACILITATION",
    label: "Pembayaran Fasilitasi",
    description: "Biaya fasilitasi atau pengurusan administrasi khusus sesuai ketentuan hukum",
    iconName: "FileCheck",
  },
  {
    type: "ENTERTAINMENT",
    label: "Menerima Hiburan dari Pihak Eksternal",
    description: "Undangan pertunjukan, konser, fasilitas VIP, atau sarana hiburan dari mitra bisnis",
    iconName: "Ticket",
  },
];

export const ENTITIES = [
  "PT Radiant Group",
  "PT Radiant Utama Interinsco Tbk",
  "PT Radiant Tunas Interinsco",
  "PT Supraco Indonesia",
  "PT Supraco Lines",
];

export const SBU_DEPARTMENTS_MAP: Record<string, string[]> = {
  "SBU Energy & Offshore Services": [
    "Operations & Field Management",
    "Supply Chain & Procurement",
    "Health, Safety & Environment (HSE)",
    "Executive Operations & Management",
  ],
  "SBU Corporate & Holding Services": [
    "Corporate Legal & Compliance",
    "Finance, Tax & Control",
    "Human Capital & General Affairs",
    "Information Technology (IT)",
  ],
  "SBU Trading & Agency": [
    "Commercial & Business Development",
    "Trading & Agency Operations",
  ],
  "SBU Inspection & Certification": [
    "Technical Inspection & Engineering",
    "Quality Assurance & Certification",
  ],
};

export const SBU_LIST = Object.keys(SBU_DEPARTMENTS_MAP);

export interface SbuItem {
  code: string;
  name: string;
  description: string;
}

export interface DepartmentItem {
  code: string;
  name: string;
  sbuName: string;
}

export const SBU_MASTER_LIST: SbuItem[] = [
  {
    code: "SBU001",
    name: "SBU Energy & Offshore Services",
    description: "Layanan lepas pantai, eksplorasi migas, dan manajemen operasional lapangan",
  },
  {
    code: "SBU002",
    name: "SBU Corporate & Holding Services",
    description: "Layanan korporat, legal kepatuhan, human capital, finance & control, dan TI",
  },
  {
    code: "SBU003",
    name: "SBU Trading & Agency",
    description: "Operasi perdagangan komersial, keagenan, dan ekspansi bisnis",
  },
  {
    code: "SBU004",
    name: "SBU Inspection & Certification",
    description: "Layanan inspeksi teknik, pengujian mutu, QA/QC, dan sertifikasi",
  },
];

export const DEPARTMENT_MASTER_LIST: DepartmentItem[] = [
  { code: "DEPT-EOS-01", name: "Operations & Field Management", sbuName: "SBU Energy & Offshore Services" },
  { code: "DEPT-EOS-02", name: "Supply Chain & Procurement", sbuName: "SBU Energy & Offshore Services" },
  { code: "DEPT-EOS-03", name: "Health, Safety & Environment (HSE)", sbuName: "SBU Energy & Offshore Services" },
  { code: "DEPT-EOS-04", name: "Executive Operations & Management", sbuName: "SBU Energy & Offshore Services" },
  { code: "DEPT-CHS-01", name: "Corporate Legal & Compliance", sbuName: "SBU Corporate & Holding Services" },
  { code: "DEPT-CHS-02", name: "Finance, Tax & Control", sbuName: "SBU Corporate & Holding Services" },
  { code: "DEPT-CHS-03", name: "Human Capital & General Affairs", sbuName: "SBU Corporate & Holding Services" },
  { code: "DEPT-CHS-04", name: "Information Technology (IT)", sbuName: "SBU Corporate & Holding Services" },
  { code: "DEPT-TRA-01", name: "Commercial & Business Development", sbuName: "SBU Trading & Agency" },
  { code: "DEPT-TRA-02", name: "Trading & Agency Operations", sbuName: "SBU Trading & Agency" },
  { code: "DEPT-INC-01", name: "Technical Inspection & Engineering", sbuName: "SBU Inspection & Certification" },
  { code: "DEPT-INC-02", name: "Quality Assurance & Certification", sbuName: "SBU Inspection & Certification" },
];

export const EXTERNAL_RELATIONSHIPS = [
  "Vendor / Supplier",
  "Klien / Pelanggan",
  "Mitra Bisnis / Joint Venture",
  "Regulator / Instansi Pemerintah",
  "Subkontraktor",
  "Konsultan",
  "Lainnya",
];

export const ACTIVITY_CATEGORIES = [
  "Hospitality & Dining",
  "Courtesy Gift / Parcel",
  "Corporate Social Responsibility",
  "Project Discussion & Business Meeting",
  "Public Relations & Media",
  "Industry Event & Conference",
  "Lainnya",
];
