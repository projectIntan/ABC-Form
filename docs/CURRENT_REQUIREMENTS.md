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
* **Current Behavior:** Root URL `/` langsung merender formulir deklarasi tanpa memerlukan login atau session. Karyawan/pelapor dapat mengisi deklarasi melalui 4 tahap wizard, memilih data identitas HRIS via modal pencarian pegawai, melampirkan berkas bukti (maks 5MB), dan mengirim formulir. Tombol "+ Buat Deklarasi Baru" dan reset form membersihkan cache inputan.
* **User Action:** Membuka `http://declaration-form/`, mengisi Step 1 sampai Step 4, menyetujui pakta integritas, dan menekan tombol Kirim Deklarasi.
* **System Behavior:**
  - Menyimpan deklarasi ke backend melalui endpoint publik `POST /api/declarations`.
  - Mengalokasikan nomor registrasi format `ABC-[BRANCH][YYMM][RUNNING_NUMBER]`.
  - Jika jenis kegiatan `GIFT`, status diset `SUBMITTED` untuk review Compliance.
  - Jika jenis kegiatan non-hadiah, status diset `APPROVED` (otomatis) dan menghasilkan nomor beban ERP `EXP-YYYYMM-XXXX`.
  - Menampilkan layar konfirmasi sukses yang memuat nomor registrasi resmi serta tombol untuk mengisi deklarasi baru.
* **Validation:**
  - Step 1: NIK, nama lengkap, entitas wajib ada; jenis kegiatan wajib dipilih.
  - Step 2: Nama perusahaan, hubungan relasi, dan kode proyek wajib ada (jika kegiatan non-internal).
  - Step 3: Tanggal kegiatan wajib ada, total estimasi biaya harus > 0. Jika kegiatan melibatkan peserta, minimal 1 karyawan Radiant Group wajib dipilih dan jumlah partisipan harus konsisten.
  - Step 4: Checkbox pernyataan kepatuhan wajib dicentang sebelum submit aktif.
* **Business Rule:**
  - Akses publik tidak memerlukan otentikasi.
  - Peringatan batas nilai kepatuhan (`max_amount_threshold`) muncul jika estimasi biaya melebihi threshold jenis kegiatan.
* **Workflow:** Buka `/` -> Isi Step 1-4 -> Konfirmasi -> Data Tersimpan -> Layar Nomor Registrasi Terbit.
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
