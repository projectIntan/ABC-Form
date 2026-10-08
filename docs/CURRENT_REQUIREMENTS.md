# Current System Requirements

## 1. Project Overview

* **Application Name:** Radiant Group ABC (Anti-Bribery & Corruption) Declaration Portal
* **Purpose:** Sistem kepatuhan dan tata kelola internal perusahaan Radiant Utama Interinsco Tbk (RUI) dan entitas anak untuk deklarasi aktivitas bisnis berisiko gratifikasi/suap (hadiah, jamuan makan luar, hiburan khusus, sponsorship, biaya fasilitasi, kegiatan rekreasi, aktivitas internal), pemantauan batasan nilai (threshold), persetujuan berjenjang (approval/rejection), pembentukan nomor biaya ERP (Expense Number), serta pemantauan deklarasi oleh Tim Compliance dan manajemen data master kepatuhan.
* **Technology Stack:**
  * **Frontend:** React 19 (`react`, `react-dom`), TypeScript (`~5.8.2`), Vite 6, Tailwind CSS v4 (`@tailwindcss/vite`), React Router 7 (`react-router`), Lucide Icons (`lucide-react`), Motion (`motion`).
  * **Middleware / Fullstack Server:** Node.js Express 4 (`server.ts`) dengan `tsx`, melayani Vite dev server atau static bundle, serta bertindak sebagai API Gateway proxy untuk request `/api/*` dengan meneruskan Authorization headers.
  * **Backend Service:** Python 3 HTTP Server (`backend/app.py`) berjalan pada port 5001 (spawned oleh Node.js process).
  * **Database Layer:** SQLite (`backend/radiant_abc.db`) via `sqlite3` dengan driver arsitektur dual-mode (SQLite fallback default + MySQL connector adapter di `backend/mysql_db.py`). Client-side fast local caching via `localStorage` pada layer `DeclarationService`.
* **Architecture:** Full-Stack decoupled dengan Express Gateway (Port 3000) yang mem-proxy `/api/*` ke Python Backend Service (Port 5001), dan database engine relasional SQLite/MySQL persisten.
* **Main Modules:**
  1. Public Declaration Submission (Unauthenticated Form di Root `/`)
  2. Compliance & Internal Authentication (`/login`)
  3. Dashboard Overview & KPI Metrics (Protected)
  4. Monitoring Deklarasi (My Declarations & Monitoring List, Protected)
  5. Detail & Cetak Deklarasi (Declaration Detail, Protected)
  6. Alur Persetujuan (Approval & Rejection Workflow, Protected)
  7. Laporan Kepatuhan & Export Data (Reports, Protected)
  8. Master Data Management & HRIS Sync (Users, Activity Types, Compliance Statement, HRIS Master, Protected)
  9. Jejak Audit (Audit Trail, Protected)

---

## 2. Current Modules

1. **Module: Public Declaration Form (`/` dan `/declarations/create`)**
   * Lokasi: Root URL `/` (Unauthenticated)
   * Fungsi: Formulir publik 4-langkah untuk pengisian deklarasi kepatuhan kegiatan bisnis oleh karyawan atau pelapor tanpa perlu memiliki akun aplikasi atau login. Dilengkapi pemilihan identitas pelapor via HRIS picker, validasi threshold nilai, unggah dokumen, serta persetujuan pakta integritas.
2. **Module: Compliance Authentication (`/login`)**
   * Lokasi: `/login` (Entry Point Tim Compliance & Internal)
   * Fungsi: Otentikasi username/password dengan SHA-256 hash dan token sesi bearer di backend untuk Petugas Kepatuhan, Approver, dan Administrator guna memantau deklarasi yang diajukan oleh publik.
3. **Module: Dashboard Monitoring (`/dashboard`)**
   * Lokasi: Menu Beranda / Dashboard (Protected)
   * Fungsi: Menampilkan metrik ringkasan status deklarasi, chart distribusi aktivitas, riwayat aktivitas terkini, dan shortcut buat deklarasi bagi tim terotentikasi.
4. **Module: Compliance Declarations Monitoring (`/declarations`)**
   * Lokasi: Menu Monitoring Deklarasi (Protected)
   * Fungsi: Melihat seluruh daftar deklarasi yang telah di-submit oleh pengguna publik maupun internal, filter multi-kriteria, hapus draft, dan akses ke form edit draft.
5. **Module: Declaration Detail & Print View (`/declarations/:id`)**
   * Lokasi: Halaman detail per nomor deklarasi (Protected)
   * Fungsi: Menampilkan ringkasan lengkap 4 seksi form, preview dokumen pendukung, status timeline approval, penerbitan Expense Number, serta fitur cetak/unduh formulir resmi F-COMP-001-01.
6. **Module: Approvals (`/approvals`)**
   * Lokasi: Menu Persetujuan (Protected, khusus Approver & Admin)
   * Fungsi: Daftar antrean verifikasi deklarasi berstatus `SUBMITTED`, aksi persetujuan menghasilkan Expense Number ERP, aksi penolakan dengan modal alasan wajib.
7. **Module: Reports & Analytics (`/reports`)**
   * Lokasi: Menu Laporan (Protected)
   * Fungsi: Rekapitulasi kepatuhan biaya berdasarkan entitas, jenis kegiatan, status, serta ekspor file CSV/Excel dan pratinjau tabel.
8. **Module: Master Data & Admin (`/users`)**
   * Lokasi: Menu Manajemen Pengguna & Master (Protected, khusus Admin)
   * Fungsi: 4 Sub-tab: RBAC User Matrix, Master Jenis Kegiatan, Klausul Pernyataan ABC, dan Sinkronisasi Data HRIS.
9. **Module: Audit Trail (`/audit-trail`)**
   * Lokasi: Menu Log Audit (Protected, khusus Admin)
   * Fungsi: Pencatatan rekam jejak aktivitas operasional sistem.

---

## 3. Current Features

### REQ-001 — Compliance Authentication & Role Management
* **Requirement ID:** REQ-001
* **Feature Name:** Compliance Authentication & Multi-Role Access
* **Status:** `WORKING`
* **Current Behavior:** Halaman `/login` difungsikan khusus untuk Tim Compliance & Approver/Admin untuk masuk dan mengakses modul monitoring deklarasi. Menggunakan verifikasi password hash SHA-256, penerbitan session token, dan autorisasi berbasis token. Sesi unauthenticated tidak dapat mengakses halaman monitoring internal.
* **User Action:** Membuka `/login`, memasukkan NIK/Username dan Password Petugas Kepatuhan, atau menggunakan preset login quick compliance.
* **System Behavior:** Menyimpan user dan token ke `localStorage` (`radiant_abc_auth_user`, `radiant_abc_auth_token`), memvalidasi session token ke endpoint `/api/auth/me`.
* **Validation:** Username/NIK wajib diisi; verifikasi password terhadap SHA-256 hash.
* **Business Rule:**
  - Public submitter tidak perlu login.
  - Tim Compliance (`APPROVER` / `ADMIN`) harus login melalui `/login` untuk membuka `/dashboard`, `/declarations`, `/approvals`, dll.
* **Workflow:** Buka `/login` -> Masukkan Kredensial -> Token Diterbitkan -> Redirect ke `/dashboard`.
* **API:**
  - `POST /api/login` (atau `POST /api/auth/login`)
  - `GET /api/auth/me`
  - `POST /api/auth/logout`
* **Database:** Tabel `users`, `user_sessions`.
* **Related Files:** `src/context/AuthContext.tsx`, `src/services/auth.service.ts`, `src/pages/Login.tsx`, `backend/app.py`, `backend/mysql_db.py`.

---

### REQ-002 — Public Declaration Submission & Form Wizard
* **Requirement ID:** REQ-002
* **Feature Name:** Public Declaration Submission & 4-Step Form Wizard
* **Status:** `WORKING`
* **Current Behavior:** Root URL `/` langsung merender formulir deklarasi tanpa memerlukan login atau session dengan tampilan bersih. Karyawan/pelapor mengisi formulir melalui 4 tahap wizard. Pada Step 1 (Informasi Identitas Pelapor), pengisian menggunakan struktur LOV berjenjang dengan antarmuka LOV Popup Modal Table:
  1. Entitas Perusahaan (LOV dari master `ENTITIES`)
  2. SBU (LOV Popup Modal berbasis TABLE dengan kolom Kode SBU, Nama SBU, Deskripsi, dan fasilitas Search — bukan dropdown/select biasa)
  3. Departemen (LOV Popup Modal berbasis TABLE dengan kolom Kode Dept, Nama Departemen, SBU Terkait, dan fasilitas Search — bukan dropdown biasa, dependent terhadap SBU yang dipilih)
  4. Nama Karyawan (LOV Popup Modal berbasis TABLE dengan kolom NIK/ID, Nama, Jabatan, Email, dan fasilitas Search — dependent terhadap Entitas Perusahaan yang dipilih)
  5. Pangkat / Jabatan (Reference field, otomatis terisi dari data karyawan terpilih)
  6. Employee ID / NIK (Reference field, otomatis terisi dari data karyawan terpilih)
  7. Email Resmi (Reference field, otomatis terisi dari data karyawan terpilih)
  Button "Pilih Pegawai dari HRIS" dan badge "Status: Terverifikasi HRIS" telah dihilangkan dari Step 1. Data input terdahulu dan cache dibersihkan secara otomatis saat formulir dibuka dan setelah submit sukses selesai.
* **User Action:** Membuka `http://declaration-form/`, mengisi Step 1 sampai Step 4 dengan memilih Entitas, SBU, Departemen, dan Nama Karyawan melalui LOV, menyetujui pakta integritas, dan menekan tombol Kirim Deklarasi.
* **System Behavior:**
  - Menyimpan deklarasi ke backend melalui endpoint publik `POST /api/declarations` dan penyimpanan lokal terverifikasi.
  - Mengalokasikan nomor registrasi format `ABC-[BRANCH][YYMM][RUNNING_NUMBER]`.
  - Jika jenis kegiatan `GIFT`, status diset `SUBMITTED` untuk review Compliance.
  - Jika jenis kegiatan non-hadiah, status diset `APPROVED` (otomatis) dan menghasilkan nomor beban ERP `EXP-YYYYMM-XXXX`.
  - Menampilkan layar konfirmasi sukses yang memuat nomor registrasi resmi serta tombol untuk mengisi deklarasi baru.
  - Setelah declaration berhasil tersimpan, sistem secara otomatis men-generate dokumen resmi formulir deklarasi berformat Microsoft Word (`ABC_Declaration_[RegistrationNumber].docx`) berbasis referensi template `ABC DF.docx` (kode form `F-COMP-001-01`).
  - Dokumen dibuat dengan aturan rendering kondisional ketat: hanya section jenis kegiatan yang dipilih yang dirender ke dokumen; seluruh jenis kegiatan lain tidak dirender (tidak ada section kosong).
  - Section Informasi Pihak Eksternal hanya dirender jika jenis kegiatan membutuhkan pihak eksternal (kegiatan non-internal).
  - Tombol `[ Download Declaration Form (.docx) ]` tersedia langsung pada layar konfirmasi sukses dan dapat diunduh oleh creator/pelapor publik secara mandiri.
  - Jika proses pembuatan dokumen mengalami error, data deklarasi tetap tersimpan aman di database dan sistem menyediakan tombol Coba Lagi tanpa me-rollback data atau meminta pengisian ulang.
  - Saat tombol "+ Isi Deklarasi Baru" ditekan atau form dibuka kembali, sistem mengosongkan seluruh data isian lama secara otomatis.
* **Validation:**
  - Step 1: Entitas Perusahaan wajib dipilih; SBU wajib dipilih; Departemen wajib dipilih; Nama Karyawan wajib dipilih; Email resmi wajib valid; Employee ID / NIK wajib terisi; jenis kegiatan wajib dipilih.
  - Step 2: Nama perusahaan, hubungan relasi, dan kode proyek wajib ada (jika kegiatan non-internal).
  - Step 3: Tanggal kegiatan wajib ada, total estimasi biaya harus > 0. Jika kegiatan melibatkan peserta, minimal 1 karyawan Radiant Group wajib dipilih dan jumlah partisipan harus konsisten.
  - Step 4: Checkbox pernyataan kepatuhan wajib dicentang sebelum submit aktif.
* **Business Rule:**
  - Akses publik tidak memerlukan otentikasi.
  - Peringatan batas nilai kepatuhan (`max_amount_threshold`) muncul jika estimasi biaya melebihi threshold jenis kegiatan.
  - Creator dapat langsung mengunduh file dokumen deklarasi resmi hasil generate (`.docx`).
* **Workflow:** Public Form -> Input Declaration -> Review -> Submit -> Save Declaration -> Generate Declaration Document -> Download by Creator -> Compliance Monitoring.
* **API:** `POST /api/declarations` (Public), `GET /api/master/activity-types` (Public), `GET /api/compliance/statement` (Public), `GET /api/hris/employees` (Public).
* **Database:** Tabel `declarations`, `attachments`, `activity_types`.
* **Related Files:** `src/pages/CreateDeclaration.tsx`, `src/components/declaration/*`, `src/services/declaration.service.ts`, `backend/app.py`.

---

### REQ-003 — Edit Draft & Hapus Draft Deklarasi
* **Requirement ID:** REQ-003
* **Feature Name:** Edit & Delete Draft Declarations
* **Status:** `WORKING`
* **Current Behavior:** Deklarasi berstatus `DRAFT` dapat dibuka kembali untuk penyuntingan atau dihapus secara permanen dengan modal dialog konfirmasi.
* **Validation:** Hanya deklarasi berstatus `DRAFT` yang dapat diedit atau dihapus. Deklarasi `SUBMITTED`, `APPROVED`, dan `REJECTED` terkunci.
* **Related Files:** `src/pages/CreateDeclaration.tsx`, `src/pages/MyDeclarations.tsx`, `src/services/declaration.service.ts`.

---

### REQ-004 — Workflow Persetujuan & Penolakan Compliance
* **Requirement ID:** REQ-004
* **Feature Name:** Compliance Approval & Rejection Workflow
* **Status:** `WORKING`
* **Current Behavior:** Petugas Compliance / Approver yang login dapat meninjau deklarasi berstatus `SUBMITTED`. Menyetujui akan mengubah status menjadi `APPROVED` dan menerbitkan Expense Number ERP `EXP-YYYYMM-XXXX`. Menolak akan mewajibkan pengisian alasan penolakan dan mengubah status menjadi `REJECTED`.
* **Validation:** Alasan penolakan tidak boleh kosong.
* **Related Files:** `src/pages/Approval.tsx`, `src/components/common/RejectionModal.tsx`, `src/services/approval.service.ts`.

---

### REQ-005 — Pratinjau Detail & Cetak Deklarasi Resmi
* **Requirement ID:** REQ-005
* **Feature Name:** Declaration Detail, Attachment Preview & Print View
* **Status:** `WORKING`
* **Current Behavior:** Menampilkan detail 4 seksi form, preview dokumen bukti, timeline status, dan cetak dokumen resmi formulir F-COMP-001-01. Terproteksi di bawah autentikasi.
* **Related Files:** `src/pages/DeclarationDetail.tsx`.

---

### REQ-006 — Master Data Jenis Kegiatan (Activity Types)
* **Requirement ID:** REQ-006
* **Feature Name:** Master Data Jenis Kegiatan & Thresholds
* **Status:** `WORKING`
* **Current Behavior:** Admin dapat mengelola jenis kegiatan, nama, kode, kategori, batas threshold rupiah, flag pihak luar, dan flag peserta. Tersedia via API publik untuk pembacaan form, dan terproteksi untuk operasi simpan/hapus.
* **API:** `GET /api/master/activity-types`, `POST /api/master/activity-types`, `DELETE /api/master/activity-types/:id`.
* **Database:** Tabel `activity_types`.
* **Related Files:** `src/pages/Users.tsx`, `src/services/admin.service.ts`, `backend/app.py`.

---

### REQ-007 — Manajemen Hak Akses Pengguna (RBAC Matrix)
* **Requirement ID:** REQ-007
* **Feature Name:** RBAC User Role & Permissions Matrix
* **Status:** `WORKING`
* **Current Behavior:** Admin mengelola penugasan peran (`EMPLOYEE`, `APPROVER`, `ADMIN`) dan izin granular untuk seluruh personil tim internal.
* **API:** `GET /api/admin/users`, `POST /api/admin/users/permissions`.
* **Database:** Tabel `users`, `user_permissions`.
* **Related Files:** `src/pages/Users.tsx`, `src/services/admin.service.ts`, `backend/app.py`.

---

### REQ-008 — Konfigurasi Klausul Pernyataan Kepatuhan ABC
* **Requirement ID:** REQ-008
* **Feature Name:** Compliance Statement Clauses Editor
* **Status:** `WORKING`
* **Current Behavior:** Admin menyunting teks pakta integritas bilingual (ID/EN) yang dimuat secara publik pada Step 4 deklarasi.
* **API:** `GET /api/compliance/statement`, `POST /api/compliance/statement`.
* **Database:** Tabel `compliance_settings`.
* **Related Files:** `src/pages/Users.tsx`, `src/components/declaration/Step4Review.tsx`, `src/services/admin.service.ts`, `backend/app.py`.

---

### REQ-009 — Sinkronisasi Master Pegawai HRIS & Riwayat Sync Logs
* **Requirement ID:** REQ-009
* **Feature Name:** HRIS Employee Master Data & Sync Logs
* **Status:** `WORKING`
* **Current Behavior:** Mengelola data master karyawan grup Radiant Group dan mencatat log sinkronisasi terpusat.
* **API:** `POST /api/hris/sync`, `GET /api/hris/sync/logs`, `GET /api/hris/employees`, `GET /api/hris/structure`.
* **Database:** Tabel `employees`, `hris_sync_logs`.
* **Related Files:** `src/pages/Users.tsx`, `src/services/hris.service.ts`, `backend/app.py`.

---

### REQ-010 — Laporan Kepatuhan & Export CSV / Excel
* **Requirement ID:** REQ-010
* **Feature Name:** Compliance Reports & Data Export
* **Status:** `WORKING`
* **Current Behavior:** Laporan ringkasan pengeluaran kepatuhan dengan filter multi-dimensi dan ekspor CSV/Excel. Terproteksi untuk tim Compliance.
* **Related Files:** `src/pages/Reports.tsx`, `src/services/report.service.ts`.

---

### REQ-011 — Jejak Audit Operasional (Audit Trail)
* **Requirement ID:** REQ-011
* **Feature Name:** System Operational Audit Trail
* **Status:** `WORKING`
* **Current Behavior:** Rekam jejak seluruh mutasi dan aktivitas operasional sistem terproteksi untuk Administrator.
* **Database:** Tabel `audit_logs`.
* **Related Files:** `src/pages/AuditTrail.tsx`, `src/services/audit.service.ts`.

---

## 4. Current User Flow

### Flow 1: Public User (Form Submission)
```text
Public User
    ↓
http://declaration-form/ (Root /)
    ↓
Public Declaration Form (Tanpa Login)
    ↓
Step 1: Pilih Identitas Pelapor dari HRIS & Jenis Kegiatan
Step 2: Isi Data Pihak Eksternal & Kode Proyek
Step 3: Isi Detail Biaya, Tanggal & Peserta Internal
Step 4: Unggah Lampiran & Setujui Pakta Kepatuhan ABC
    ↓
Submit Declaration
    ↓
Data Tersimpan di Database
    ↓
Layar Konfirmasi (Nomor Registrasi Deklarasi Terbit)
    ↓
Opsi: Buat Deklarasi Baru
```

### Flow 2: Compliance Team (Monitoring & Approval)
```text
Compliance User / Approver
    ↓
http://declaration-form/login
    ↓
Login Kredensial Compliance (SHA-256 + Session Token)
    ↓
Protected Compliance Monitoring (/dashboard, /declarations)
    ↓
Lihat Rekap & Detail Deklarasi yang Di-submit Public User
    ↓
Verifikasi & Approval (/approvals)
    ↓
Setujui (Generate EXP No) ATAU Tolak (Input Alasan Penolakan)
```

---

## 5. Current Workflow & Status

### Routing Matrix:
* `/` → Public Declaration Form (Unauthenticated)
* `/declarations/create` → Public Declaration Form (Unauthenticated)
* `/login` → Compliance Login (Public entry to authenticate)
* `/dashboard` → Protected (Compliance / Approver / Admin)
* `/declarations` → Protected (Compliance / Approver / Admin)
* `/declarations/:id` → Protected (Compliance / Approver / Admin)
* `/approvals` → Protected (Approver / Admin)
* `/reports` → Protected (Approver / Admin)
* `/users` → Protected (Admin)
* `/audit-trail` → Protected (Admin)

### Status Deklarasi:
* **DRAFT**: Draft tersimpan lokal / draft record.
* **SUBMITTED**: Deklarasi hadiah (`GIFT`) diajukan oleh pengguna publik; menunggu verifikasi tim Compliance.
* **APPROVED**: Deklarasi disetujui (otomatis untuk non-hadiah atau pasca review untuk hadiah); menerbitkan Expense Number ERP `EXP-YYYYMM-XXXX`.
* **REJECTED**: Deklarasi ditolak oleh Compliance Officer dengan alasan penolakan wajib.

---

## 6. Current API

| Method | Endpoint | Access Level | Purpose |
|---|---|---|---|
| `POST` | `/api/declarations` | **PUBLIC** | Mengirim & menyimpan formulir deklarasi dari pengguna publik |
| `GET` | `/api/master/activity-types` | **PUBLIC** | Mengambil master jenis kegiatan & batas threshold biaya |
| `GET` | `/api/compliance/statement` | **PUBLIC** | Mengambil klausul pakta kepatuhan ABC untuk Step 4 form |
| `GET` | `/api/hris/employees` | **PUBLIC** | Pencarian data pegawai HRIS untuk identitas pelapor form |
| `GET` | `/api/hris/employee/:id` | **PUBLIC** | Mengambil profil pegawai HRIS |
| `POST` | `/api/login` | **PUBLIC** | Otentikasi Tim Compliance & Approver |
| `POST` | `/api/auth/logout` | **AUTHENTICATED** | Revoke token sesi Compliance |
| `GET` | `/api/auth/me` | **AUTHENTICATED** | Validasi sesi aktif pengguna internal |
| `GET` | `/api/declarations` | **PROTECTED** | Monitoring daftar seluruh deklarasi (Wajib Token Compliance) |
| `POST` | `/api/master/activity-types` | **PROTECTED** | Tambah/ubah master jenis kegiatan (Admin only) |
| `DELETE`| `/api/master/activity-types/:id`| **PROTECTED** | Hapus master jenis kegiatan (Admin only) |
| `GET` | `/api/admin/users` | **PROTECTED** | Daftar pengguna & izin sistem (Admin only) |
| `POST` | `/api/admin/users/permissions` | **PROTECTED** | Update izin pengguna (Admin only) |
| `POST` | `/api/compliance/statement` | **PROTECTED** | Update teks klausul ABC (Admin only) |
| `POST` | `/api/hris/sync` | **PROTECTED** | Trigger sinkronisasi HRIS (Admin only) |

---

## 7. Current Database Usage

1. **`declarations`**: Menyimpan seluruh formulir deklarasi yang dikirim oleh publik maupun internal. Field `user_id` diisi NIK pelapor atau ID referensi.
2. **`attachments`**: Berkas pendukung deklarasi (Base64 data URL).
3. **`users`** & **`user_sessions`**: Kredensial dan token sesi untuk Tim Compliance.
4. **`employees`**: Master data karyawan HRIS untuk verifikasi nama dan jabatan pelapor.
5. **`activity_types`**: Konfigurasi jenis kegiatan dan threshold anggaran kepatuhan.
6. **`compliance_settings`**: Teks pakta integritas kepatuhan ABC.
7. **`audit_logs`**: Log aktivitas audit operasional.

---

## 8. Current Business Rules

1. **Akses Publik Tanpa Hambatan Akun:** Formulir deklarasi di root `/` terbuka untuk seluruh karyawan/pelapor tanpa perlu otentikasi atau akun pengguna.
2. **Proteksi Ketat Modul Monitoring:** Modul dashboard, daftar deklarasi perusahaan, approval, laporan, dan administrasi wajib login via `/login`.
3. **Penyimpanan Identitas Pelapor:** Meskipun unauthenticated, form tetap mencatat NIK, nama lengkap, entitas, jabatan, dan departemen pelapor yang dipilih dari HRIS atau diisi pada Step 1.
4. **Threshold Warning:** Jika nilai kegiatan melampaui `max_amount_threshold`, formulir memberikan visual alert kepatuhan.
5. **Penerbitan Otomatis Expense ERP:** Persetujuan deklarasi menghasilkan format nomor ERP `EXP-YYYYMM-XXXX`.
6. **Alasan Penolakan Wajib:** Penolakan deklarasi oleh Compliance wajib menyertakan alasan.

---

## 9. Current Validation

* Step 1: NIK, nama lengkap, entitas, dan jenis kegiatan wajib ada.
* Step 2: Nama perusahaan, relasi, kode proyek wajib diisi jika kegiatan eksternal.
* Step 3: Tanggal pelaksanaan wajib, total biaya > 0. Jumlah partisipan harus sama dengan jumlah karyawan yang terdaftar.
* Step 4: Lampiran dokumen maks 5MB. Kotak centang pakta kepatuhan wajib dicentang.

---

## 10. Current Roles & Permissions

* **PUBLIC USER:** Mengakses `/`, mengisi form deklarasi 4-langkah, submit deklarasi, menerima nomor registrasi. Tidak memiliki akses ke dashboard/monitoring.
* **APPROVER (Compliance):** Login via `/login`. Mengakses dashboard monitoring, melihat seluruh deklarasi, melakukan verifikasi/approval/rejection, mengunduh laporan.
* **ADMIN:** Login via `/login`. Seluruh hak akses Approver ditambah pengelolaan master data kegiatan, klausul kepatuhan, permissions pengguna, sinkronisasi HRIS, dan audit trail.

---

## 11. Current Integrations

* **Express API Gateway (`server.ts`):** Menjalankan reverse proxy port 3000 -> Python port 5001 dengan header forwarding (`Authorization`, `x-auth-token`).
* **Python Backend Engine (`backend/app.py` & `mysql_db.py`):** Layanan backend lokal pada port 5001 dengan SQLite engine persisten.
* **HRIS Master Database:** Master karyawan grup Radiant Group.

---

## 12. Existing Coding Conventions

* **Decoupled Architecture:** Express Gateway -> Python Backend -> SQLite/MySQL DB.
* **TypeScript Strictness:** Strict types di `src/types/index.ts`.
* **Component Modularity:** Komponen UI dipisah berdasarkan tanggung jawab (Wizard, Steps, Common modals).
* **Styling:** Tailwind CSS v4 dengan slate-900 / sky-500 palette korporat.

---

## 13. Dependency Map

* `src/App.tsx` -> `CreateDeclaration` (Public Root `/`), `Login` (`/login`), `Layout` (Protected routes).
* `CreateDeclaration.tsx` -> `Step1Identity`, `Step2ExternalParty`, `Step3ActivityDetail`, `Step4Review`, `DeclarationService`, `EmployeeSelectModal`.
* `backend/app.py` -> Menerima public POST `/api/declarations`, memproteksi GET `/api/declarations` dengan token verification.
* `server.ts` -> Mem-proxy request API dan meneruskan header otentikasi.

---

## 14. Known Limitations

* **MySQL Network Mode:** Berjalan default pada SQLite lokal `backend/radiant_abc.db` karena ketiadaan host MySQL eksternal pada container.
* **ERP Inward Only:** Nomor beban ERP dihasilkan secara deterministik internal, belum ada webhook langsung ke SAP ERP eksternal.

---

## 15. Not Implemented

* Multi-Factor Authentication (MFA / SMS OTP).
* Email SMTP Notification Dispatcher ke atasan langsung.

---

## 16. Unclear / Needs Verification

* Eskalasi otomatis approval dua tingkat ke level Direktur untuk nominal di atas Rp 10.000.000.

---

## 17. Important Files

* `server.ts`: Gateway server Node.js & Proxy.
* `backend/app.py`: Backend controller REST API Python (Public submission & Protected monitoring).
* `backend/mysql_db.py`: Persistence database SQLite/MySQL.
* `src/App.tsx`: Routing public vs protected layout.
* `src/pages/CreateDeclaration.tsx`: Formulir deklarasi publik mandiri.
* `src/components/declaration/Step1Identity.tsx`: Formulir identitas dengan pemilihan pegawai HRIS.
* `src/pages/Login.tsx`: Portal login Tim Compliance & Internal.
* `src/components/layout/Layout.tsx`: Proteksi rute internal monitoring.
* `src/services/auth.service.ts`: Session management.

---

## 18. Baseline Rules for Future Vibe Coding

1. **Treat this document as the baseline for the current application.**
2. **Preserve existing working functionality.**
3. **Do not change existing behavior unless explicitly requested.**
4. **Reuse existing implementation where possible.**
5. **Follow existing project architecture and coding conventions.**
6. **Do not create duplicate functionality.**
7. **Do not perform unnecessary refactoring.**
8. **Do not modify database schema unless explicitly requested.**
9. **Do not change API contracts unless explicitly requested.**
10. **Update this document whenever a completed development task changes the application's behavior.**

---

# Requirement Change Log

## CHG-001 — Public Declaration Submission & Compliance Login

**Date:** 2026-10-06  
**Change Type:** Requirement Change  
**Status:** Implemented  

### Previous Behavior
* Root URL `/` melakukan redirect ke `/dashboard` yang berada di dalam `Layout` terproteksi.
* Pengguna yang belum login otomatis dialihkan ke `/login`.
* Pengisian Formulir Deklarasi (`/declarations/create`) wajib login akun aplikasi terlebih dahulu.
* Identitas pelapor pada Step 1 terkunci mati (`readOnly`) hanya pada profil akun yang sedang login.

### New Behavior
1. **Public Declaration Form di Root `/`:**
   - Root URL `/` membuka Formulir Deklarasi Kepatuhan ABC secara langsung tanpa perlu login.
   - Siapa pun (karyawan/pelapor) dapat membuka, mengisi 4 tahapan formulir, dan melakukan submit tanpa hambatan otentikasi.
2. **Identitas Pelapor Fleksibel dengan Integrasi HRIS:**
   - Pada Step 1 formulir, disediakan tombol *"Pilih Pegawai dari HRIS"* yang membuka modal pencarian pegawai master HRIS (`EmployeeSelectModal`), sehingga pelapor publik dapat memilih data dirinya secara terverifikasi tanpa perlu memiliki akun login sistem.
3. **Login Khusus Tim Compliance (`/login`):**
   - Halaman `/login` kini difungsikan sebagai pintu masuk khusus **Tim Compliance / Approver / Administrator** untuk memantau deklarasi yang diajukan oleh pengguna publik.
   - Dilengkapi shortcut kembali ke Formulir Deklarasi Publik.
4. **Proteksi Modul Monitoring & Internal:**
   - Rute `/dashboard`, `/declarations`, `/declarations/:id`, `/approvals`, `/reports`, `/users`, dan `/audit-trail` dilindungi secara ketat oleh `Layout` authentication guard. Akses tanpa sesi dialihkan ke `/login`.
5. **Keamanan Backend API:**
   - Endpoint `POST /api/declarations`, `GET /api/master/activity-types`, `GET /api/compliance/statement`, dan `GET /api/hris/employees` dibuka untuk publik.
   - Endpoint monitoring `GET /api/declarations`, `/api/admin/*`, dan operasi mutasi dilindungi dengan validasi token bearer Compliance.
   - Express server (`server.ts`) diperbarui untuk meneruskan header `Authorization` ke backend Python.

### Impacted Areas
* `src/App.tsx`: Routing public root `/` dan isolasi protected routes.
* `src/components/layout/Layout.tsx`: Otentikasi guard untuk monitoring.
* `src/pages/CreateDeclaration.tsx`: Tampilan formulir publik mandiri, navbar publik dengan tombol Login Compliance, dan layar sukses nomor registrasi resmi.
* `src/components/declaration/Step1Identity.tsx`: Dukungan input identitas pelapor publik dan pemilihan pegawai via HRIS picker.
* `src/pages/Login.tsx`: Penyesuaian branding dan peruntukan login bagi Tim Compliance.
* `src/services/auth.service.ts`: Pengembalian `null` saat unauthenticated (mencegah auto-login mock terselubung).
* `backend/app.py`: Pemisahan otorisasi endpoint publik dan proteksi endpoint monitoring.
* `server.ts`: Penerusan header `Authorization` ke backend proxy.
* `docs/CURRENT_REQUIREMENTS.md`: Pembaruan baseline dan pencatatan change log.

### Existing Functionality Preserved
* Seluruh field isian formulir deklarasi 4 langkah.
* Validasi step-by-step dan kalkulasi konsistensi peserta.
* Threshold warning logic berdasarkan master jenis kegiatan.
* Klausul pernyataan kepatuhan ABC bilingual (ID/EN).
* Mekanisme upload berkas pendukung (maks 5MB).
* Format penomoran deklarasi (`ABC-XXXX`) dan nomor beban ERP (`EXP-XXXX`).
* Workflow persetujuan & penolakan dengan alasan wajib.
* Seluruh skema tabel database relasional (`declarations`, `users`, `employees`, dll).

### Security Consideration
* Public user tidak memiliki akses untuk membaca daftar deklarasi pelapor lain (`GET /api/declarations` diblokir HTTP 401 tanpa token Compliance).
* Public user tidak dapat mengakses modul administrasi, HRIS sync, user permissions, atau audit trail.
* Data input tetap divalidasi di layer backend dan database.

### Open Questions
1. **Identity Verification untuk Public Submitter:** Apakah di masa depan diperlukan pengiriman kode OTP / verifikasi via email korporat `@radiant.co.id` saat pelapor publik memilih NIK tertentu?
2. **Pelacakan Status Deklarasi Publik:** Apakah publik memerlukan halaman pencarian publik sederhana (misal: cek status dengan memasukkan Nomor Registrasi Deklarasi `ABC-XXXX`) tanpa perlu login ke sistem monitoring Compliance?
3. **Rate Limiting / Anti-Spam:** Apakah pengiriman deklarasi publik memerlukan perlindungan CAPTCHA atau rate-limiting IP jika portal dibuka ke internet publik luas?

---

## CHG-002 — Clean Public Declaration Form & Auto Clear Previous Data

**Date:** 2026-10-06  
**Change Type:** UI Refinement & Form Lifecycle Optimization  
**Status:** Implemented  

### Previous Behavior
* Pada halaman publik formulir deklarasi (`/`), terdapat card/banner informasi biru/hijau dengan ikon, judul *"Formulir Deklarasi Kepatuhan ABC"*, badge *"FORM TERBUKA (PUBLIC ACCESS)"*, teks pengantar publik, dan tombol *"Bersihkan Form / Cache"*.
* Pengguna publik harus mengklik tombol *"Bersihkan Form / Cache"* secara manual jika ingin membersihkan isian form atau cache lama.
* Data template identitas default sempat terisi dummy ("John Doe" / "EMP001"), sehingga membingungkan pelapor publik baru.

### New Behavior
1. **Pembersihan UI Formulir Deklarasi Publik:**
   - Seluruh card/banner informasi ("Formulir Deklarasi Kepatuhan ABC", badge "FORM TERBUKA (PUBLIC ACCESS)", teks penjelasan, dan tombol "Bersihkan Form / Cache") telah dihapus dari antarmuka public declaration form.
   - Halaman formulir langsung menampilkan Header Korporat resmi (`RADIANT GROUP - Anti-Bribery & Corruption Declaration Portal (F-COMP-001-01)`) dengan tombol `Login Compliance`, disusul langsung oleh stepper wizard dan seksi form tanpa distraksi banner.
2. **Pembersihan Data Otomatis (Auto Clear Previous Data):**
   - Inisialisasi formulir untuk pengguna publik dimulai dari keadaan bersih tanpa nilai residu data (field identitas NIK, nama lengkap, email, jabatan, departemen berstatus string kosong siap diisi secara mandiri atau dipilih melalui modal HRIS).
   - Saat formulir baru dibuka (`editId` tidak ada), seluruh cache inputan browser dan storage dibersihkan secara otomatis di background tanpa memerlukan intervensi tombol manual.
   - Setelah pelapor sukses mengirim deklarasi dan menekan tombol *"+ Isi Deklarasi Baru"*, sistem secara otomatis mereset seluruh 4-step wizard dan mengosongkan seluruh data deklarasi lama ke kondisi bersih mula-mula.
3. **Pengelolaan Khusus Mode Draft:**
   - Indikator draft hanya ditampilkan ketika parameter `editId` aktif (menyunting draft tersimpan), memberikan konteks yang jelas tanpa mengotori halaman publik reguler.

### Impacted Areas
* `src/pages/CreateDeclaration.tsx`: Penghapusan banner informasi, tombol bersihkan cache, modal konfirmasi reset cache manual, serta otomatisasi reset data ke clean state.
* `src/components/declaration/Step1Identity.tsx`: Normalisasi fallback field departemen agar tidak memaksakan teks default saat data kosong.
* `docs/CURRENT_REQUIREMENTS.md`: Pencatatan change log CHG-002 dan pembaruan spesifikasi REQ-002.

### Existing Functionality Preserved
* Akses form deklarasi publik di root `/` tanpa login.
* Tombol "Login Compliance" di header navbar atas.
* Wizard 4 langkah deklarasi kepatuhan.
* Modal pencarian dan pemilihan pegawai HRIS.
* Validasi step, threshold biaya, dan upload berkas pendukung.
* Pembuatan nomor registrasi resmi `ABC-XXXX` dan status approval otomatis atau manual.
* Alur proteksi login modul monitoring internal bagi Tim Compliance.

---

## CHG-003 — Update Reporter Identity Fields & Employee LOV

**Date:** 2026-10-07

**Change Type:** Requirement Change

**Status:** Implemented

### Previous Behavior

Bagian Informasi Identitas Pelapor menggunakan field dengan urutan existing sebelumnya dan menyediakan:

- Tombol "Pilih Pegawai dari HRIS"
- Status "Terverifikasi HRIS"
- Field employee yang belum menggunakan struktur dependency baru.

### New Behavior

Urutan field Informasi Identitas Pelapor diubah menjadi:

1. Entitas Perusahaan — LOV
2. SBU — LOV
3. Departement — LOV berdasarkan SBU
4. Nama Karyawan — LOV berdasarkan Entitas
5. Pangkat / Jabatan — reference dari employee
6. Employee ID / NIK — reference dari employee
7. Email — reference dari employee

Selain itu:

- Button "Pilih Pegawai dari HRIS" dihapus.
- Status "Terverifikasi HRIS" dihapus.
- Employee dipilih langsung melalui LOV Nama Karyawan.
- Pemilihan employee berdasarkan Entitas Perusahaan.
- Department berdasarkan SBU.
- Pangkat/Jabatan, Employee ID/NIK, dan Email otomatis mengikuti employee yang dipilih.
- Field reference tidak diinput manual.

### Dependency

```text
Entity → Employee

SBU → Department

Employee → Pangkat/Jabatan
Employee → Employee ID/NIK
Employee → Email
```

### Reset Rules

Jika Entity berubah:

* reset Employee;
* reset Pangkat/Jabatan;
* reset Employee ID/NIK;
* reset Email.

Jika SBU berubah:

* reset Department.

Jika Employee berubah:

* refresh Pangkat/Jabatan;
* refresh Employee ID/NIK;
* refresh Email.

### Removed UI

* "Pilih Pegawai dari HRIS"
* "Status: Terverifikasi HRIS"

### Impacted Areas

* Declaration Form
* Reporter Identity Section (`src/components/declaration/Step1Identity.tsx`)
* LOV components (`ENTITIES`, `SBU_LIST`, `SBU_DEPARTMENTS_MAP`)
* Employee data source & HRIS API (`src/services/hris.service.ts`, `backend/app.py`, `backend/mysql_db.py`)
* Entity/SBU/Department dependency
* Form validation (`src/pages/CreateDeclaration.tsx`)

### Existing Functionality Preserved

* Existing employee master/HRIS source
* Declaration submission
* Declaration validation
* Declaration database storage
* Compliance monitoring
* Authentication for Compliance
* Existing declaration workflow
* Existing business rules not directly affected

### Database

No database schema change. Added employees in SQLite seed to cover all 5 entities.

### API

- Reused `GET /api/hris/employees` with support for optional `?entity=` filtering parameter.
- Added `HRISService.getEmployeesByEntity(entityName)` with automated fallback to mock if API unavailable.

### Open Questions

None. Master entities, SBUs, departments, and employee data are fully aligned between frontend constants and backend HRIS API.

---

## CHG-004 — SBU & Department LOV Popup Table Modal Correction

**Date:** 2026-10-07  
**Change Type:** UI/UX & Component Architecture Correction  
**Status:** Implemented  

### Previous Behavior
* Field SBU dan Departemen pada bagian *Informasi Identitas Pelapor* diimplementasikan menggunakan elemen `<select>` dropdown biasa.
* Pengguna memilih SBU dan Departemen melalui native browser select option list tanpa penyajian tabel terstruktur maupun fitur pencarian.

### New Behavior
1. **SBU — LOV Popup Modal berbasis TABLE:**
   - Field SBU tidak lagi menggunakan HTML `<select>` atau dropdown biasa.
   - SBU ditampilkan dalam kontrol LOV lookup. Mengklik field/tombol `[ Pilih SBU ] 🔍` membuka modal popup dialog yang menampilkan data dalam format **TABLE**.
   - Kolom tabel SBU: `Kode SBU` (contoh: `SBU001`, `SBU002`), `Nama SBU`, `Deskripsi / Lingkup`, dan `Aksi (Pilih)`.
   - Dilengkapi input search untuk menyaring Kode atau Nama SBU secara instan.
   - Pengguna memilih baris tabel -> SBU terpilih -> popup menutup otomatis -> nilai SBU terisi pada formulir.
   - Jika SBU diubah: Departemen yang sebelumnya dipilih otomatis di-reset menjadi kosong.
2. **Departemen — LOV Popup Modal berbasis TABLE (Dependent terhadap SBU):**
   - Field Departemen tidak lagi menggunakan dropdown biasa, melainkan LOV lookup dengan modal popup **TABLE**.
   - Data Departemen dalam tabel disaring secara ketat berdasarkan SBU yang dipilih (`SBU_MASTER_LIST` / `DEPARTMENT_MASTER_LIST`).
   - Jika SBU belum dipilih: kontrol Departemen dinonaktifkan (*disabled*) dan jika diklik memunculkan notifikasi/pesan peringatan bahwa SBU wajib dipilih terlebih dahulu.
   - Kolom tabel Departemen: `Kode Dept` (contoh: `DEPT-EOS-01`), `Nama Departemen`, `SBU Terkait`, dan `Aksi (Pilih)`.
   - Dilengkapi input search untuk menyaring Kode atau Nama Departemen.
   - Mengklik baris tabel -> Departemen terisi -> popup menutup otomatis.
   - Jika SBU diubah atau dihapus, field Departemen otomatis di-reset ke kosong.
3. **Nama Karyawan — LOV Popup Modal berbasis TABLE (Dependent terhadap Entitas):**
   - Menggunakan modal tabel karyawan terverifikasi HRIS (`EmployeeLovModal`) dengan kolom `NIK / ID`, `Nama Karyawan`, `Pangkat / Jabatan`, `Email`, dan tombol `Pilih`.
   - Disaring berdasarkan Entitas Perusahaan yang aktif.
   - Memilih karyawan otomatis mengisi seluruh *Reference Fields* (Pangkat/Jabatan, Employee ID/NIK, Email).

### Dependency & Reset Flow
```text
Entitas Perusahaan (LOV)
  ↓
Nama Karyawan (LOV Modal Table) → Auto-fill: Pangkat, NIK, Email
  (Jika Entitas berubah: reset Karyawan, Pangkat, NIK, Email)

SBU (LOV Modal Table)
  ↓
Departemen (LOV Modal Table)
  (Jika SBU berubah: reset Departemen)
```

### Impacted Areas
* `src/constants/activityTypes.ts`: Penambahan master data terstruktur `SBU_MASTER_LIST` (dengan `code`, `name`, `description`) dan `DEPARTMENT_MASTER_LIST` (dengan `code`, `name`, `sbuName`).
* `src/components/declaration/SbuLovModal.tsx`: Komponen popup modal tabel untuk pemilihan SBU.
* `src/components/declaration/DepartmentLovModal.tsx`: Komponen popup modal tabel untuk pemilihan Departemen dengan validasi ketergantungan SBU.
* `src/components/declaration/EmployeeLovModal.tsx`: Komponen popup modal tabel untuk pemilihan Karyawan dengan filter Entitas.
* `src/components/declaration/Step1Identity.tsx`: Integrasi antarmuka input LOV lookup dan penanganan pembukaan modal tabel.
* `docs/CURRENT_REQUIREMENTS.md`: Pembaruan spesifikasi REQ-002 dan pencatatan riwayat perubahan CHG-004.

### Existing Functionality Preserved
* Seluruh 4 tahapan wizard formulir deklarasi publik.
* Alur validasi form, auto-reset cache/storage saat load dan pasca submit.
* Auto-fill reference fields (Pangkat/Jabatan, Employee ID/NIK, Email Resmi).
* Alur persetujuan Compliance, penyimpanan database, dan nomor registrasi resmi.

---

## CHG-005 — Generate & Download Declaration Form After Submission

**Date:** 2026-10-07  
**Change Type:** Feature Enhancement & Document Generation  
**Status:** Implemented  

### Previous Behavior
* Setelah pengguna melakukan submit deklarasi, sistem hanya menyimpan data deklarasi dan menampilkan nomor registrasi serta konfirmasi status.
* Belum tersedia fitur otomatis untuk men-generate dokumen resmi formulir deklarasi yang dapat langsung diunduh oleh creator/pelapor pasca submit.
* Template statis `ABC DF.docx` menampilkan seluruh jenis kegiatan dalam satu file tanpa pemisahan dinamis.

### New Behavior
1. **Pembuatan Dokumen Otomatis Pasca Submit:**
   - Setelah declaration berhasil tersimpan (melalui API/database), sistem secara otomatis memicu proses pembuatan file dokumen resmi berformat Microsoft Word (`.docx`).
   - Dokumen dibuat berdasarkan data deklarasi yang berhasil tersimpan di sistem, bukan semata-mata dari state browser sementara.
2. **Aturan Rendering Kondisional Kegiatan (Conditional Activity Rendering):**
   - Dokumen HANYA menampilkan section jenis kegiatan yang dipilih oleh pelapor (berdasarkan kode/ID `activityType` yang tersimpan).
   - Seluruh jenis kegiatan lainnya yang tidak dipilih TIDAK BOLEH muncul dalam dokumen sama sekali (tidak ada section kosong atau placeholder).
3. **Penyajian Kondisional Informasi Pihak Eksternal:**
   - Bagian *Informasi Pihak Eksternal* hanya dirender jika jenis kegiatan melibatkan pihak eksternal (yaitu kegiatan non-`INTERNAL`).
   - Jika jenis kegiatan adalah `INTERNAL`, section *Informasi Pihak Eksternal* tidak ditampilkan sama sekali.
4. **Pemetaan Data Lengkap & Pembaruan Identitas:**
   - Dokumen memuat data identitas terbaru: Entitas Perusahaan, SBU, Departemen, Nama Karyawan, Pangkat / Jabatan, Employee ID / NIK, Email Resmi, dan Jenis Kegiatan.
   - Detail kegiatan memetakan seluruh field spesifik jenis kegiatan (tanggal, lokasi, tujuan, jumlah partisipan, daftar nama karyawan Radiant Group, rincian biaya / estimasi).
   - Deklarasi integritas kepatuhan & transparansi (bilingual ID/EN) dan tanda tangan digital tercetak di bagian akhir.
5. **Akses Download untuk Creator (Tanpa Login):**
   - Tombol `[ Download Declaration Form (.docx) ]` ditampilkan di layar sukses segera setelah dokumen siap.
   - Format penamaan file konsisten: `ABC_Declaration_[RegistrationNumber].docx` (contoh: `ABC_Declaration_ABC-RUI2610-0001.docx`).
   - Pelapor publik dapat mengunduh dokumen secara langsung menggunakan identifier dari hasil submit tanpa memerlukan akun login.
6. **Ketahanan Terhadap Error (Resilience & Error Handling):**
   - Jika terjadi kendala pada saat generasi dokumen, deklarasi tetap aman tersimpan di database (tidak terjadi rollback).
   - Pengguna menerima pemberitahuan yang jelas dan disediakan tombol *Coba Lagi Buat Dokumen* tanpa perlu melakukan submit ulang deklarasi.

### Activity Rendering Rule
```text
Selected Activity Type (Code/ID)
        ↓
Render corresponding activity section ONLY
(Section kegiatan lain tidak di-render sama sekali)
```

### Impacted Areas
* `src/services/document.service.ts`: Service generator dokumen DOCX berbasis library `docx` dengan layout standar template `ABC DF.docx` (kode form F-COMP-001-01).
* `src/pages/CreateDeclaration.tsx`: Integrasi alur generasi dokumen pasca-submit, penanganan error tanpa rollback, dan penyediaan tombol download di layar sukses.
* `src/pages/DeclarationDetail.tsx`: Penambahan tombol unduh dokumen resmi bagi Compliance Officer.
* `backend/app.py` & `backend/mysql_db.py`: Endpoint `GET /api/declarations/:id` dan metode pencarian single declaration by id.
* `src/services/declaration.service.ts`: Sinkronisasi otomatis ke backend API pasca penyimpanan lokal.
* `docs/CURRENT_REQUIREMENTS.md`: Pembaruan REQ-002 dan pencatatan riwayat perubahan CHG-005.

### Existing Functionality Preserved
* Seluruh 4 langkah form wizard dan validasi input.
* Mekanisme approval otomatis untuk non-gift dan review Compliance untuk gift.
* Keamanan modul monitoring yang tetap terproteksi otentikasi login Compliance.
* Skema database dan integritas data deklarasi.

### Open Questions
1. **Format Dokumen Final (DOCX vs PDF):** Saat ini dokumen di-generate dalam format `.docx` sesuai template `ABC DF.docx`. Apakah di masa mendatang diperlukan opsi konversi otomatis ke PDF bertanda tangan digital tersertifikasi?


