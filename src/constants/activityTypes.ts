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
