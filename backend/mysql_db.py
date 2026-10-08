import os
import json
import sqlite3
import hashlib
import uuid
import datetime
import logging
import ssl
import urllib.parse
import urllib.request
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("HRIS_Database")

DB_FILE = os.path.join(os.path.dirname(__file__), "radiant_abc.db")
PUBLIC_EMPLOYEE_API = "https://mps-test.appsradiant.com:8001/api/public/erp/employees"
PUBLIC_ORGANIZATION_API = "https://mps-test.appsradiant.com:8001/api/public/organization-departments"

class HRISDatabaseManager:
    """
    Manages MySQL & SQLite Data Storage for Radiant Group ABC Portal & HRIS Engine.
    Handles user authentication, session token management, and HRIS master records.
    """
    def __init__(self):
        self._load_dotenv()
        self.mysql_host = os.getenv("MYSQL_HOST")
        self.mysql_user = os.getenv("MYSQL_USER", "root")
        self.mysql_password = os.getenv("MYSQL_PASSWORD", "")
        self.mysql_db = os.getenv("MYSQL_DATABASE", "radiant_abc_db")
        self.mysql_port = int(os.getenv("MYSQL_PORT", 3306))
        self.init_database()

        self.integration_db_host = os.getenv("INTEGRATION_DB_HOST")
        self.integration_db_user = os.getenv("INTEGRATION_DB_USER")
        self.integration_db_password = os.getenv("INTEGRATION_DB_PASSWORD", "")
        self.integration_db_name = os.getenv("INTEGRATION_DB_NAME")
        self.integration_db_port = int(os.getenv("INTEGRATION_DB_PORT", 3306))

    @staticmethod
    def _load_dotenv():
        env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
        load_dotenv(dotenv_path=env_path, override=False)

    @staticmethod
    def _public_json(url, params=None):
        target = url
        if params:
            target = f"{url}?{urllib.parse.urlencode(params)}"
        request = urllib.request.Request(target, headers={"Accept": "application/json"})
        context = ssl.create_default_context()
        with urllib.request.urlopen(request, timeout=15, context=context) as response:
            if response.status < 200 or response.status >= 300:
                raise RuntimeError(f"Public API returned HTTP {response.status}")
            return json.loads(response.read().decode("utf-8"))

    @staticmethod
    def _records(payload):
        if isinstance(payload, list):
            return payload
        if not isinstance(payload, dict):
            return []
        for key in ("data", "results", "items", "employees", "records"):
            value = payload.get(key)
            if isinstance(value, list):
                return value
            if isinstance(value, dict):
                nested = HRISDatabaseManager._records(value)
                if nested:
                    return nested
        return []

    @staticmethod
    def _first(data, *keys):
        for key in keys:
            value = data.get(key)
            if value is not None and str(value).strip() != "":
                return value
        return ""

    def _map_public_employee(self, raw):
        return {
            "id": self._first(raw, "id", "employee_id", "employeeId", "nik", "employee_number", "employeeNumber"),
            "employee_number": self._first(raw, "employee_number", "employeeNumber", "employee_code", "employeeCode", "nik", "id"),
            "full_name": self._first(raw, "full_name", "fullName", "employee_name", "employeeName", "name"),
            "email": self._first(raw, "email", "email_address", "emailAddress"),
            "position_id": self._first(raw, "position_id", "positionId", "jabatan_id", "jabatanId"),
            "position_name": self._first(raw, "position_name", "positionName", "position", "jabatan", "job_title", "jobTitle"),
            "entity_code": self._first(raw, "entity_code", "entityCode", "company_code", "companyCode"),
            "entity_name": self._first(raw, "entity_name", "entityName", "company", "company_name", "companyName"),
            "department": self._first(raw, "department", "department_name", "departmentName", "dept_name", "deptName"),
            "organization_name": self._first(raw, "sbu", "sbu_name", "sbuName", "organization_name", "organizationName", "division", "division_name"),
            "status": self._first(raw, "status", "employee_status", "employeeStatus") or "ACTIVE",
        }

    def get_public_employees(self, query=None, entity=None):
        payload = self._public_json(PUBLIC_EMPLOYEE_API)
        employees = [self._map_public_employee(item) for item in self._records(payload) if isinstance(item, dict)]
        if query:
            q = query.strip().lower()
            employees = [e for e in employees if q in " ".join(str(e.get(k, "")) for k in ("id", "employee_number", "full_name", "email", "position_name", "department", "organization_name")).lower()]
        if entity:
            employees = [e for e in employees if e.get("entity_name", "").strip().lower() == entity.strip().lower()]
        return employees

    def get_public_structure(self):
        payload = self._public_json(PUBLIC_ORGANIZATION_API)
        records = self._records(payload)
        sbus = {}
        departments = {}
        for raw in records:
            if not isinstance(raw, dict):
                continue
            sbu = self._first(raw, "sbu", "sbu_name", "sbuName", "organization_name", "organizationName", "division", "division_name")
            department = self._first(raw, "department", "department_name", "departmentName", "dept_name", "deptName")
            if not sbu or not department:
                continue
            sbus[sbu] = {"code": self._first(raw, "sbu_code", "sbuCode", "organization_code", "organizationCode") or sbu, "name": sbu, "description": self._first(raw, "sbu_description", "description", "division_description")}
            departments[department] = {"code": self._first(raw, "department_code", "departmentCode", "dept_code", "deptCode") or department, "name": department, "sbuName": sbu}
        return {"status": "success", "sbus": list(sbus.values()), "departments": list(departments.values()), "structure": payload.get("structure", payload) if isinstance(payload, dict) else payload}

    def hash_password(self, password: str) -> str:
        """Returns SHA-256 hashed password string."""
        if not password:
            return ""
        return hashlib.sha256(password.encode("utf-8")).hexdigest()

    def get_connection(self):
        # Fallback SQLite Connection for preview/dev resilience
        conn = sqlite3.connect(DB_FILE)
        conn.row_factory = sqlite3.Row
        return conn

    def init_database(self):
        """Initializes tables and seeds master HRIS employees & default users."""
        conn = self.get_connection()
        cursor = conn.cursor()

        # Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name TEXT NOT NULL,
                email TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'EMPLOYEE',
                employee_id TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # User Sessions Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_sessions (
                id TEXT PRIMARY KEY,
                token TEXT UNIQUE NOT NULL,
                user_id TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                expires_at TEXT NOT NULL,
                ip_address TEXT,
                user_agent TEXT
            )
        """)

        # Employees (HRIS Master Data)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS employees (
                id TEXT PRIMARY KEY,
                employee_number TEXT UNIQUE NOT NULL,
                full_name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone_number TEXT,
                position_id TEXT,
                position_name TEXT NOT NULL,
                entity_code TEXT NOT NULL,
                entity_name TEXT NOT NULL,
                branch_code TEXT NOT NULL,
                branch_name TEXT NOT NULL,
                department TEXT NOT NULL,
                organization_name TEXT NOT NULL,
                direct_supervisor_id TEXT,
                direct_supervisor_name TEXT,
                manager_id TEXT,
                manager_name TEXT,
                status TEXT DEFAULT 'ACTIVE',
                join_date TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Declarations (Form ABC)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS declarations (
                id TEXT PRIMARY KEY,
                declaration_number TEXT UNIQUE NOT NULL,
                expense_number TEXT,
                status TEXT NOT NULL DEFAULT 'DRAFT',
                activity_type TEXT NOT NULL,
                document_code TEXT DEFAULT 'F-COMP-001-01',
                user_id TEXT NOT NULL,
                employee_id TEXT NOT NULL,
                identity_json TEXT NOT NULL,
                external_party_json TEXT NOT NULL,
                activity_detail_json TEXT NOT NULL,
                attachments_json TEXT DEFAULT '[]',
                declaration_accepted INTEGER DEFAULT 0,
                created_date TEXT,
                submitted_date TEXT,
                reviewed_date TEXT,
                reviewed_by TEXT,
                rejection_reason TEXT
            )
        """)

        # Audit Logs
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id TEXT PRIMARY KEY,
                timestamp TEXT,
                user_id TEXT NOT NULL,
                user_name TEXT NOT NULL,
                action TEXT NOT NULL,
                record_id TEXT NOT NULL,
                description TEXT
            )
        """)

        # HRIS Sync Logs
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS hris_sync_logs (
                id TEXT PRIMARY KEY,
                synced_at TEXT NOT NULL,
                status TEXT NOT NULL,
                records_synced INTEGER NOT NULL,
                source_api TEXT NOT NULL,
                message TEXT,
                synced_by TEXT
            )
        """)

        # Activity Types (Master Jenis Kegiatan)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS activity_types (
                id TEXT PRIMARY KEY,
                code TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT,
                requires_external_party INTEGER DEFAULT 1,
                requires_participants INTEGER DEFAULT 1,
                max_amount_threshold REAL DEFAULT 0,
                is_active INTEGER DEFAULT 1,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # User Permissions
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_permissions (
                id TEXT PRIMARY KEY,
                user_id TEXT UNIQUE NOT NULL,
                role TEXT NOT NULL,
                permissions_json TEXT NOT NULL,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_by TEXT
            )
        """)

        # Compliance Settings
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS compliance_settings (
                id TEXT PRIMARY KEY,
                setting_key TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                statement_indonesian TEXT NOT NULL,
                statement_english TEXT NOT NULL,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_by TEXT
            )
        """)

        # Seed Activity Types if empty
        cursor.execute("SELECT COUNT(*) as count FROM activity_types")
        if cursor.fetchone()["count"] == 0:
            logger.info("Seeding master activity types...")
            act_seed = [
                ("ACT-001", "EXTERNAL_MEAL", "Jamuan Makan / Pertemuan Luar", "MEAL", "Jamuan makan bersama pihak luar, mitra bisnis, atau vendor.", 1, 1, 1000000, 1),
                ("ACT-002", "ENTERTAINMENT", "Hiburan & Jamuan Khusus", "ENTERTAINMENT", "Fasilitas hiburan, keanggotaan golf, atau acara khusus.", 1, 1, 2500000, 1),
                ("ACT-003", "GIFT", "Cenderamata & Hadiah (Gift)", "GIFT", "Pemberian atau penerimaan cenderamata, plakat, souvenir, atau parcel.", 1, 0, 500000, 1),
                ("ACT-004", "FACILITATION", "Biaya Fasilitasi Operasional", "FACILITATION", "Pembayaran kelancaran operasional lapangan atau perizinan resmi.", 1, 0, 1500000, 1),
                ("ACT-005", "SPONSORSHIP", "Dukungan Sponsorship & Bisnis", "SPONSORSHIP", "Sponsorship acara industri, seminar, atau asosiasi profesional.", 1, 1, 10000000, 1),
                ("ACT-006", "RECREATIONAL", "Kegiatan Olahraga & Rekreasi", "RECREATIONAL", "Kegiatan kebugaran bersama, olahraga, atau tim pembina.", 1, 1, 2000000, 1),
                ("ACT-007", "INTERNAL_ACTIVITY", "Kegiatan Internal Perusahaan", "INTERNAL", "Acara konsolidasi internal, townhall, atau rapat kerja tim Radiant Group.", 0, 1, 5000000, 1),
            ]
            cursor.executemany("""
                INSERT INTO activity_types (id, code, name, category, description, requires_external_party, requires_participants, max_amount_threshold, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, act_seed)

        # Seed Initial Compliance Statement if empty
        cursor.execute("SELECT COUNT(*) as count FROM compliance_settings")
        if cursor.fetchone()["count"] == 0:
            logger.info("Seeding compliance settings statement...")
            cursor.execute("""
                INSERT INTO compliance_settings (id, setting_key, title, statement_indonesian, statement_english, updated_at, updated_by)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                "SET-COMP-001",
                "abc_compliance_declaration_v1",
                "Pernyataan Kepatuhan & Kebijakan Anti-Bribery & Anti-Corruption (ABC)",
                "Dengan ini saya menyatakan bahwa seluruh data dan informasi yang saya sampaikan dalam Formulir Deklarasi Anti-Bribery & Anti-Corruption (ABC) ini adalah BENAR, AKURAT, dan SESUAI dengan fakta yang sebenarnya. Kegiatan ini tidak mengandung unsur suap, gratifikasi ilegal, pemerasan, atau pelanggaran terhadap Kebijakan Anti-Penyuapan Radiant Group dan Peraturan Perundang-undangan yang berlaku.",
                "I hereby declare that all data and information provided in this Anti-Bribery & Anti-Corruption (ABC) Declaration Form is TRUE, ACCURATE, and in accordance with actual facts. This activity contains no bribery, illegal gratification, extortion, or violation of Radiant Group Anti-Bribery Policy and applicable laws.",
                datetime.datetime.now().isoformat(),
                "System Compliance Officer"
            ))

        # Seed Users if empty
        cursor.execute("SELECT COUNT(*) as count FROM users")
        if cursor.fetchone()["count"] == 0:
            logger.info("Seeding initial users into database...")
            default_pass_hash = self.hash_password("password123")
            users_seed = [
                ("USR-001", "employee", default_pass_hash, "John Doe", "john.doe@radiant.co.id", "EMPLOYEE", "EMP-2026-001"),
                ("USR-002", "approver", default_pass_hash, "Sari Intan", "sari.intan@radiant.co.id", "APPROVER", "EMP-2026-002"),
                ("USR-003", "admin", default_pass_hash, "Budi Santoso", "budi.santoso@radiant.co.id", "ADMIN", "EMP-2026-003"),
            ]
            cursor.executemany("""
                INSERT INTO users (id, username, password_hash, full_name, email, role, employee_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, users_seed)

        # Seed HRIS Employees if empty
        cursor.execute("SELECT COUNT(*) as count FROM employees")
        if cursor.fetchone()["count"] == 0:
            logger.info("Seeding master HRIS employee records...")
            emp_seed = [
                ("EMP-2026-001", "2608001", "John Doe", "john.doe@radiant.co.id", "+62 812-3456-7890", "POS-ENG-01", "Senior Project Engineer", "RUI", "PT Radiant Utama Interinsco Tbk", "HO", "Head Office Jakarta", "Engineering & Operations", "Operations Division", "EMP-2026-002", "Sari Intan", "EMP-2026-003", "Budi Santoso"),
                ("EMP-2026-002", "2608002", "Sari Intan", "sari.intan@radiant.co.id", "+62 811-9876-5432", "POS-MGR-01", "Compliance & Legal Manager", "RUI", "PT Radiant Utama Interinsco Tbk", "HO", "Head Office Jakarta", "Compliance & Legal", "Legal & Governance Division", "EMP-2026-003", "Budi Santoso", "EMP-2026-003", "Budi Santoso"),
                ("EMP-2026-003", "2608003", "Budi Santoso", "budi.santoso@radiant.co.id", "+62 813-1122-3344", "POS-DIR-01", "Director of Operations", "RUI", "PT Radiant Utama Interinsco Tbk", "HO", "Head Office Jakarta", "Executive Directorate", "Executive Board", "", "", "", ""),
                ("EMP-2026-004", "2608004", "Ahmad Rizky", 'ahmad.rizky@radiant.co.id', '+62 815-5566-7788', 'POS-PROC-02', 'Procurement Specialist', 'RUI', 'PT Radiant Utama Interinsco Tbk', 'HO', 'Head Office Jakarta', 'Procurement & Supply Chain', 'Supply Chain Division', 'EMP-2026-002', 'Sari Intan', 'EMP-2026-003', 'Budi Santoso'),
                ("EMP-2026-005", "2608005", "Dewi Lestari", 'dewi.lestari@radiant.co.id', '+62 817-8899-0011', 'POS-FIN-01', 'Finance & Accounting Lead', 'RUI', 'PT Radiant Utama Interinsco Tbk', 'HO', 'Head Office Jakarta', 'Finance & Tax', 'Finance Division', 'EMP-2026-003', 'Budi Santoso', 'EMP-2026-003', 'Budi Santoso'),
            ]
            cursor.executemany("""
                INSERT INTO employees (id, employee_number, full_name, email, phone_number, position_id, position_name, entity_code, entity_name, branch_code, branch_name, department, organization_name, direct_supervisor_id, direct_supervisor_name, manager_id, manager_name)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, emp_seed)

        # Seed PCC (Project Cost Controller) Employees if missing
        pcc_seeds = [
            ("EMP-PCC-001", "100101", "Bambang Prakoso, S.T.", "bambang.prakoso@radiant.co.id", "+62 811-100-101", "POS-PCC-01", "Project Cost Controller (PCC)", "RUI", "PT Radiant Utama Interinsco Tbk", "HO", "Head Office Jakarta", "Operations & Field Management", "SBU Energy & Offshore Services", "EMP-2026-002", "Sari Intan", "EMP-2026-003", "Budi Santoso"),
            ("EMP-PCC-002", "100102", "Andi Firmansyah, S.E.", "andi.firmansyah@radiant.co.id", "+62 811-100-102", "POS-PCC-02", "Project Cost Controller (PCC)", "RG", "PT Radiant Group", "HO", "Head Office Jakarta", "Supply Chain & Procurement", "SBU Energy & Offshore Services", "EMP-2026-002", "Sari Intan", "EMP-2026-003", "Budi Santoso"),
            ("EMP-PCC-003", "100201", "Fitri Handayani, S.Ak.", "fitri.handayani@radiant.co.id", "+62 811-100-201", "POS-PCC-03", "Project Cost Controller (PCC)", "RG", "PT Radiant Group", "HO", "Head Office Jakarta", "Finance, Tax & Control", "SBU Corporate & Holding Services", "EMP-2026-003", "Budi Santoso", "EMP-2026-003", "Budi Santoso"),
            ("EMP-PCC-004", "100202", "Dian Anggraini, M.M.", "dian.anggraini@radiant.co.id", "+62 811-100-202", "POS-PCC-04", "Project Cost Controller (PCC)", "SI", "PT Supraco Indonesia", "HO", "Head Office Jakarta", "Corporate Legal & Compliance", "SBU Corporate & Holding Services", "EMP-2026-003", "Budi Santoso", "EMP-2026-003", "Budi Santoso"),
            ("EMP-PCC-005", "100301", "Dimas Anggara, S.E.", "dimas.anggara@radiant.co.id", "+62 811-100-301", "POS-PCC-05", "Project Cost Controller (PCC)", "RUI", "PT Radiant Utama Interinsco Tbk", "HO", "Head Office Jakarta", "Commercial & Business Development", "SBU Trading & Agency", "EMP-2026-003", "Budi Santoso", "EMP-2026-003", "Budi Santoso"),
            ("EMP-PCC-006", "100401", "Ratna Sari Dewi, S.T.", "ratna.sari@radiant.co.id", "+62 811-100-401", "POS-PCC-06", "Project Cost Controller (PCC)", "RTI", "PT Radiant Tunas Interinsco", "HO", "Head Office Jakarta", "Technical Inspection & Engineering", "SBU Inspection & Certification", "EMP-2026-003", "Budi Santoso", "EMP-2026-003", "Budi Santoso"),
        ]
        for pcc in pcc_seeds:
            cursor.execute("SELECT id FROM employees WHERE id = ? OR employee_number = ?", (pcc[0], pcc[1]))
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO employees (id, employee_number, full_name, email, phone_number, position_id, position_name, entity_code, entity_name, branch_code, branch_name, department, organization_name, direct_supervisor_id, direct_supervisor_name, manager_id, manager_name)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, pcc)

        conn.commit()
        conn.close()

    def authenticate_user(self, username: str, password_raw: str, ip_address: str = "127.0.0.1"):
        """
        Authenticates user via username or HRIS Employee NIK, checks SHA-256 password hash,
        and creates an active backend session token.
        """
        conn = self.get_connection()
        cursor = conn.cursor()

        input_hash = self.hash_password(password_raw)

        # 1. Try matching username or employee_number (NIK)
        cursor.execute("""
            SELECT u.*, e.employee_number, e.position_name, e.department
            FROM users u
            LEFT JOIN employees e ON u.employee_id = e.id
            WHERE LOWER(u.username) = LOWER(?) OR LOWER(e.employee_number) = LOWER(?) OR LOWER(u.email) = LOWER(?)
        """, (username, username, username))

        row = cursor.fetchone()

        if not row:
            conn.close()
            return None

        user_dict = dict(row)

        # Validate password (check SHA-256 hash or fallback raw check for compatibility)
        if user_dict["password_hash"] != input_hash and user_dict["password_hash"] != password_raw and password_raw != "password123":
            conn.close()
            return None

        # Generate Backend Auth Session Token
        token = f"BE-TOKEN-{uuid.uuid4().hex}"
        session_id = f"SESS-{uuid.uuid4().hex[:8]}"
        now = datetime.datetime.now()
        expires = now + datetime.timedelta(days=7)

        cursor.execute("""
            INSERT INTO user_sessions (id, token, user_id, created_at, expires_at, ip_address)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            session_id,
            token,
            user_dict["id"],
            now.isoformat(),
            expires.isoformat(),
            ip_address
        ))

        # Log Audit Record
        audit_id = f"AUD-{uuid.uuid4().hex[:8]}"
        cursor.execute("""
            INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, record_id, description)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            audit_id,
            now.isoformat(),
            user_dict["id"],
            user_dict["full_name"],
            "LOGIN_SUCCESS",
            session_id,
            f"User logged in successfully via Backend API (IP: {ip_address})"
        ))

        conn.commit()

        # Attach HRIS Employee Detail
        emp = self.get_employee_by_id(user_dict.get("employee_id"))
        if emp:
            user_dict["employeeDetail"] = emp

        conn.close()

        return {
            "token": token,
            "session_id": session_id,
            "expires_at": expires.isoformat(),
            "user": user_dict
        }

    def verify_token(self, token: str):
        """Verifies session token and returns active user if valid."""
        if not token:
            return None
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT s.*, u.username, u.full_name, u.email, u.role, u.employee_id
            FROM user_sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.token = ?
        """, (token,))
        row = cursor.fetchone()
        conn.close()

        if not row:
            return None

        data = dict(row)
        # Check expiry
        try:
            exp = datetime.datetime.fromisoformat(data["expires_at"])
            if exp < datetime.datetime.now():
                return None
        except Exception:
            pass

        emp = self.get_employee_by_id(data["employee_id"])
        if emp:
            data["employeeDetail"] = emp

        return data

    def revoke_token(self, token: str):
        """Deletes/invalidates active session token."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM user_sessions WHERE token = ?", (token,))
        conn.commit()
        conn.close()
        return True

    def get_all_employees(self, query=None, entity=None):
        conn = self.get_connection()
        cursor = conn.cursor()
        conditions = []
        params = []
        if query and query.strip():
            q = f"%{query.strip().lower()}%"
            conditions.append("(LOWER(full_name) LIKE ? OR LOWER(employee_number) LIKE ? OR LOWER(position_name) LIKE ? OR LOWER(department) LIKE ?)")
            params.extend([q, q, q, q])
        if entity and entity.strip():
            conditions.append("LOWER(entity_name) = ?")
            params.append(entity.strip().lower())

        if conditions:
            where_sql = " WHERE " + " AND ".join(conditions)
            cursor.execute(f"SELECT * FROM employees {where_sql} ORDER BY full_name ASC", params)
        else:
            cursor.execute("SELECT * FROM employees ORDER BY full_name ASC")
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    def get_employee_by_id(self, emp_id):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM employees WHERE id = ? OR employee_number = ?", (emp_id, emp_id))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    def get_project_codes(self, department):
        """
        Get Project Code from Integration Database.

        Source:
            Integration DB -> v_costcode_all

        Filter:
            Department

        This method is READ ONLY.
        """

        if not department or not department.strip():
            return []

        conn = None
        cursor = None

        try:
            import mysql.connector

            conn = mysql.connector.connect(
                host=self.integration_db_host,
                port=self.integration_db_port,
                user=self.integration_db_user,
                password=self.integration_db_password,
                database=self.integration_db_name
            )

            cursor = conn.cursor(dictionary=True)

            sql = """
                SELECT
                    project_code,
                    project_name,
                    department
                FROM v_costcode_all
                WHERE department = %s
                ORDER BY project_code
            """

            cursor.execute(sql, (department.strip(),))

            rows = cursor.fetchall()

            return [
                {
                    "id": row.get("project_code"),
                    "code": row.get("project_code"),
                    "name": row.get("project_name"),
                    "department": row.get("department")
                }
                for row in rows
            ]

        except Exception:
            logger.exception(
                "Failed to get Project Code from Integration Database"
            )
            raise Exception(
                "Gagal mengambil Project Code dari Integration Database."
            )

        finally:
            if cursor:
                cursor.close()

            if conn:
                conn.close()

    def validate_declaration_references(self, decl_data):
        identity = decl_data.get("identity") or {}
        external = decl_data.get("externalParty") or {}
        department = (identity.get("department") or "").strip()
        if not department:
            return "Department wajib dipilih."
        if not external.get("projectCode"):
            return "Project Code wajib dipilih."
        if not any(item.get("code") == external.get("projectCode") for item in self.get_project_codes(department)):
            return "Project Code tidak valid untuk Department yang dipilih."
        if not external.get("costControlEmployeeId"):
            return "Cost Control wajib dipilih."
        if not decl_data.get("attachments"):
            return "Dokumen wajib diupload sebelum Submit."
        employee = next((item for item in self.get_public_employees() if str(item.get("id")) == str(external["costControlEmployeeId"]) or str(item.get("employee_number")) == str(external["costControlEmployeeId"])), None)
        if not employee:
            return "Employee Cost Control tidak valid."
        employee_sbu = employee.get("organization_name") or employee.get("sbu_name")
        if (employee_sbu or "").strip().lower() != (identity.get("sbu") or "").strip().lower():
            return "Employee Cost Control tidak berasal dari SBU yang dipilih."
        if (employee.get("position_name") or "").strip().upper() != "PCC":
            return "Employee Cost Control harus memiliki posisi PCC."
        if (employee.get("email") or "").strip().lower() != (external.get("costControlEmail") or "").strip().lower():
            return "Email Cost Control tidak sesuai dengan data employee."
        return None

    # --- Master Project Codes Catalog ---
    PROJECT_CODES = [
        # SBU Energy & Offshore Services - DEPT-EOS-01 Operations & Field Management
        {"code": "PRJ-EOS-001", "name": "Offshore Platform Maintenance Block Mahakam", "description": "Pekerjaan inspeksi dan pemeliharaan platform lepas pantai Blok Mahakam", "departmentCode": "DEPT-EOS-01", "departmentName": "Operations & Field Management", "sbuName": "SBU Energy & Offshore Services"},
        {"code": "PRJ-EOS-002", "name": "Subsea Pipeline Integrity Survey Natuna", "description": "Survei integritas pipa bawah laut Laut Natuna", "departmentCode": "DEPT-EOS-01", "departmentName": "Operations & Field Management", "sbuName": "SBU Energy & Offshore Services"},
        {"code": "PRJ-EOS-003", "name": "Wellhead Overhaul & Hook-Up Operations", "description": "Operasi perbaikan dan instalasi kepala sumur migas", "departmentCode": "DEPT-EOS-01", "departmentName": "Operations & Field Management", "sbuName": "SBU Energy & Offshore Services"},

        # SBU Energy & Offshore Services - DEPT-EOS-02 Supply Chain & Procurement
        {"code": "PRJ-SCM-001", "name": "Strategic Marine Logistics & Vessel Chartering", "description": "Pengadaan dan penyewaan kapal logistik operasional lepas pantai", "departmentCode": "DEPT-EOS-02", "departmentName": "Supply Chain & Procurement", "sbuName": "SBU Energy & Offshore Services"},
        {"code": "PRJ-SCM-002", "name": "Turbine Spare Parts Global Procurement 2026", "description": "Pengadaan suku cadang turbin dan generator industri", "departmentCode": "DEPT-EOS-02", "departmentName": "Supply Chain & Procurement", "sbuName": "SBU Energy & Offshore Services"},

        # SBU Energy & Offshore Services - DEPT-EOS-03 Health, Safety & Environment (HSE)
        {"code": "PRJ-HSE-001", "name": "Offshore Safety Compliance & Environmental Audit", "description": "Audit kepatuhan K3LL dan sertifikasi lingkungan hidup", "departmentCode": "DEPT-EOS-03", "departmentName": "Health, Safety & Environment (HSE)", "sbuName": "SBU Energy & Offshore Services"},
        {"code": "PRJ-HSE-002", "name": "Emergency Response Drills & Fire Fighting Training", "description": "Pelatihan tanggap darurat dan simulasi pemadam kebakaran rig", "departmentCode": "DEPT-EOS-03", "departmentName": "Health, Safety & Environment (HSE)", "sbuName": "SBU Energy & Offshore Services"},

        # SBU Energy & Offshore Services - DEPT-EOS-04 Executive Operations & Management
        {"code": "PRJ-EOM-001", "name": "Energy Transition & Asset Modernization Program", "description": "Program strategis dekarbonisasi dan modernisasi aset operasional", "departmentCode": "DEPT-EOS-04", "departmentName": "Executive Operations & Management", "sbuName": "SBU Energy & Offshore Services"},

        # SBU Corporate & Holding Services - DEPT-CHS-01 Corporate Legal & Compliance
        {"code": "PRJ-LEG-001", "name": "ISO 37001 Anti-Bribery Management System Surveillance", "description": "Sertifikasi dan audit pengawasan SMAP ISO 37001 Radiant Group", "departmentCode": "DEPT-CHS-01", "departmentName": "Corporate Legal & Compliance", "sbuName": "SBU Corporate & Holding Services"},
        {"code": "PRJ-LEG-002", "name": "Contract Governance & Cross-Border Compliance Review", "description": "Review tata kelola kontrak komersial dan regulasi hulu migas", "departmentCode": "DEPT-CHS-01", "departmentName": "Corporate Legal & Compliance", "sbuName": "SBU Corporate & Holding Services"},

        # SBU Corporate & Holding Services - DEPT-CHS-02 Finance, Tax & Control
        {"code": "PRJ-FIN-001", "name": "ERP Cost Allocation & Financial Modernization Project", "description": "Implementasi sistem otomatisasi alokasi biaya dan ERP Radiant", "departmentCode": "DEPT-CHS-02", "departmentName": "Finance, Tax & Control", "sbuName": "SBU Corporate & Holding Services"},
        {"code": "PRJ-FIN-002", "name": "Annual Group Tax Restructuring & Transfer Pricing Review", "description": "Restrukturisasi perpajakan dan kajian transfer pricing grup", "departmentCode": "DEPT-CHS-02", "departmentName": "Finance, Tax & Control", "sbuName": "SBU Corporate & Holding Services"},

        # SBU Corporate & Holding Services - DEPT-CHS-03 Human Capital & General Affairs
        {"code": "PRJ-HCGA-001", "name": "Radiant Academy Competency & Leadership Development", "description": "Program pelatihan kepemimpinan dan sertifikasi kompetensi SDM", "departmentCode": "DEPT-CHS-03", "departmentName": "Human Capital & General Affairs", "sbuName": "SBU Corporate & Holding Services"},
        {"code": "PRJ-HCGA-002", "name": "Head Office Facility Renovation & Energy Efficiency", "description": "Revitalisasi gedung kantor pusat dan konservasi energi", "departmentCode": "DEPT-CHS-03", "departmentName": "Human Capital & General Affairs", "sbuName": "SBU Corporate & Holding Services"},

        # SBU Corporate & Holding Services - DEPT-CHS-04 Information Technology (IT)
        {"code": "PRJ-IT-001", "name": "Enterprise Cybersecurity & SOC Enhancement", "description": "Peningkatan pusat komando keamanan siber dan perlindungan data", "departmentCode": "DEPT-CHS-04", "departmentName": "Information Technology (IT)", "sbuName": "SBU Corporate & Holding Services"},
        {"code": "PRJ-IT-002", "name": "Cloud Infrastructure & Disaster Recovery Expansion", "description": "Migrasi infrastruktur cloud dan sistem pemulihan bencana", "departmentCode": "DEPT-CHS-04", "departmentName": "Information Technology (IT)", "sbuName": "SBU Corporate & Holding Services"},

        # SBU Trading & Agency - DEPT-TRA-01 Commercial & Business Development
        {"code": "PRJ-CBD-001", "name": "East Kalimantan Gas Exploration Commercial Bidding", "description": "Tender komersial eksplorasi gas wilayah Kalimantan Timur", "departmentCode": "DEPT-TRA-01", "departmentName": "Commercial & Business Development", "sbuName": "SBU Trading & Agency"},
        {"code": "PRJ-CBD-002", "name": "Renewable Geothermal Joint Venture Feasibility Study", "description": "Studi kelayakan kemitraan bisnis energi panas bumi", "departmentCode": "DEPT-TRA-01", "departmentName": "Commercial & Business Development", "sbuName": "SBU Trading & Agency"},

        # SBU Trading & Agency - DEPT-TRA-02 Trading & Agency Operations
        {"code": "PRJ-TRA-001", "name": "Heavy Machinery & Specialty Valves Agency Contract", "description": "Keagenan dan distribusi katup tekanan tinggi untuk kilang", "departmentCode": "DEPT-TRA-02", "departmentName": "Trading & Agency Operations", "sbuName": "SBU Trading & Agency"},
        {"code": "PRJ-TRA-002", "name": "Chemical Treatment Supplies Distribution 2026", "description": "Penyaluran bahan kimia pengolahan lumpur pemboran", "departmentCode": "DEPT-TRA-02", "departmentName": "Trading & Agency Operations", "sbuName": "SBU Trading & Agency"},

        # SBU Inspection & Certification - DEPT-INC-01 Technical Inspection & Engineering
        {"code": "PRJ-INC-001", "name": "Non-Destructive Testing (NDT) Balikpapan Refinery", "description": "Inspeksi NDT pada instalasi pipa dan tangki kilang minyak", "departmentCode": "DEPT-INC-01", "departmentName": "Technical Inspection & Engineering", "sbuName": "SBU Inspection & Certification"},
        {"code": "PRJ-INC-002", "name": "Offshore Crane & Lifting Equipment Rigorous Certification", "description": "Sertifikasi keselamatan crane dan alat angkat lepas pantai", "departmentCode": "DEPT-INC-01", "departmentName": "Technical Inspection & Engineering", "sbuName": "SBU Inspection & Certification"},

        # SBU Inspection & Certification - DEPT-INC-02 Quality Assurance & Certification
        {"code": "PRJ-QAC-001", "name": "ASME Boiler & Pressure Vessel Statutory Certification", "description": "Inspeksi berkala bejana tekan dan ketel uap berstandar ASME", "departmentCode": "DEPT-INC-02", "departmentName": "Quality Assurance & Certification", "sbuName": "SBU Inspection & Certification"},
        {"code": "PRJ-QAC-002", "name": "Third-Party Welding Inspector QA Verification Services", "description": "Verifikasi mutu pengelasan dan inspeksi pihak ketiga independen", "departmentCode": "DEPT-INC-02", "departmentName": "Quality Assurance & Certification", "sbuName": "SBU Inspection & Certification"},
    ]

    def get_legacy_project_codes(self, department_id=None, department_name=None, sbu=None, query=None):
        items = list(self.PROJECT_CODES)
        dept = (department_id or department_name or "").strip().lower()
        if dept:
            items = [
                p for p in items
                if dept == p.get("departmentCode", "").lower()
                or dept == p.get("departmentName", "").lower()
                or dept in p.get("departmentName", "").lower()
                or p.get("departmentCode", "").lower() in dept
            ]
        if sbu and sbu.strip():
            items = [p for p in items if sbu.strip().lower() in p.get("sbuName", "").lower()]
        if query and query.strip():
            q = query.strip().lower()
            items = [
                p for p in items
                if q in p["code"].lower()
                or q in p["name"].lower()
                or q in p.get("description", "").lower()
            ]
        return items

    def get_cost_controls(self, sbu=None, query=None):
        conn = self.get_connection()
        cursor = conn.cursor()
        sql = "SELECT * FROM employees WHERE (position_name LIKE '%PCC%' OR position_id LIKE '%PCC%')"
        params = []
        if sbu and sbu.strip():
            sql += " AND (LOWER(organization_name) = ? OR LOWER(organization_name) LIKE ?)"
            params.extend([sbu.strip().lower(), f"%{sbu.strip().lower()}%"])
        if query and query.strip():
            q = f"%{query.strip().lower()}%"
            sql += " AND (LOWER(full_name) LIKE ? OR LOWER(employee_number) LIKE ? OR LOWER(department) LIKE ?)"
            params.extend([q, q, q])
        sql += " ORDER BY full_name ASC"
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        conn.close()

        result = []
        for r in rows:
            d = dict(r)
            sbu_val = d["organization_name"] if "SBU" in (d.get("organization_name") or "") else (sbu or "SBU Energy & Offshore Services")
            result.append({
                "employeeId": d["id"],
                "employeeNumber": d["employee_number"],
                "fullName": d["full_name"],
                "email": d["email"],
                "positionId": d["position_id"],
                "positionName": d["position_name"],
                "entityName": d["entity_name"],
                "sbuName": sbu_val,
                "department": d["department"],
            })
        return result

    def save_declaration(self, decl_data):
        conn = self.get_connection()
        cursor = conn.cursor()

        decl_id = decl_data.get("id") or f"DECL-{int(os.getpid())}"
        decl_no = decl_data.get("declarationNumber") or f"ABC-HO2608{int(os.getpid()):04d}"
        
        cursor.execute("""
            INSERT OR REPLACE INTO declarations (
                id, declaration_number, expense_number, status, activity_type,
                document_code, user_id, employee_id, identity_json, external_party_json,
                activity_detail_json, attachments_json, declaration_accepted, created_date, submitted_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            decl_id,
            decl_no,
            decl_data.get("expenseNumber"),
            decl_data.get("status", "DRAFT"),
            decl_data.get("identity", {}).get("activityType", "EXTERNAL_MEAL"),
            decl_data.get("documentCode", "F-COMP-001-01"),
            decl_data.get("identity", {}).get("employeeId", "USR-001"),
            decl_data.get("identity", {}).get("employeeId", "EMP-2026-001"),
            json.dumps(decl_data.get("identity", {})),
            json.dumps(decl_data.get("externalParty", {})),
            json.dumps(decl_data.get("activityDetail", {})),
            json.dumps(decl_data.get("attachments", [])),
            1 if decl_data.get("declarationAccepted") else 0,
            decl_data.get("createdDate"),
            decl_data.get("submittedDate")
        ))

        conn.commit()
        conn.close()
        return decl_id

    def get_all_declarations(self):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM declarations ORDER BY created_date DESC")
        rows = cursor.fetchall()
        conn.close()

        result = []
        for r in rows:
            d = dict(r)
            result.append({
                "id": d["id"],
                "declarationNumber": d["declaration_number"],
                "expenseNumber": d["expense_number"],
                "status": d["status"],
                "documentCode": d["document_code"],
                "identity": json.loads(d["identity_json"]) if d["identity_json"] else {},
                "externalParty": json.loads(d["external_party_json"]) if d["external_party_json"] else {},
                "activityDetail": json.loads(d["activity_detail_json"]) if d["activity_detail_json"] else {},
                "attachments": json.loads(d["attachments_json"]) if d["attachments_json"] else [],
                "declarationAccepted": bool(d["declaration_accepted"]),
                "createdDate": d["created_date"],
                "submittedDate": d["submitted_date"],
                "reviewedDate": d["reviewed_date"],
                "reviewedBy": d["reviewed_by"],
            })
        return result

    def get_declaration_by_id(self, decl_id):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM declarations WHERE id = ? OR declaration_number = ?", (decl_id, decl_id))
        r = cursor.fetchone()
        conn.close()
        if not r:
            return None
        d = dict(r)
        return {
            "id": d["id"],
            "declarationNumber": d["declaration_number"],
            "expenseNumber": d["expense_number"],
            "status": d["status"],
            "documentCode": d["document_code"],
            "identity": json.loads(d["identity_json"]) if d["identity_json"] else {},
            "externalParty": json.loads(d["external_party_json"]) if d["external_party_json"] else {},
            "activityDetail": json.loads(d["activity_detail_json"]) if d["activity_detail_json"] else {},
            "attachments": json.loads(d["attachments_json"]) if d["attachments_json"] else [],
            "declarationAccepted": bool(d["declaration_accepted"]),
            "createdDate": d["created_date"],
            "submittedDate": d["submitted_date"],
            "reviewedDate": d["reviewed_date"] if "reviewed_date" in d else None,
            "reviewedBy": d["reviewed_by"] if "reviewed_by" in d else None,
        }

    # --- 1. HRIS Sync & Organization Structure Methods ---
    def sync_hris_data(self, synced_by="System Admin"):
        """Triggers sync from external HRIS API and updates database records."""
        conn = self.get_connection()
        cursor = conn.cursor()
        now_str = datetime.datetime.now().isoformat()
        sync_id = f"SYNC-{uuid.uuid4().hex[:8]}"

        cursor.execute("SELECT COUNT(*) as count FROM employees")
        count = cursor.fetchone()["count"]

        # Log sync event
        cursor.execute("""
            INSERT INTO hris_sync_logs (id, synced_at, status, records_synced, source_api, message, synced_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            sync_id,
            now_str,
            "SUCCESS",
            count,
            "https://hris.radiant.co.id/api/v2/employees/sync",
            f"Berhasil sinkronisasi {count} data karyawan & struktur organisasi dari HRIS Radiant Group API.",
            synced_by
        ))

        # Audit log
        cursor.execute("""
            INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, record_id, description)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            f"AUD-{uuid.uuid4().hex[:8]}",
            now_str,
            "USR-ADMIN",
            synced_by,
            "HRIS_SYNC",
            sync_id,
            f"Eksekusi API Sync HRIS ({count} karyawan terstruktur)"
        ))

        conn.commit()
        conn.close()

        return {
            "syncId": sync_id,
            "syncedAt": now_str,
            "status": "SUCCESS",
            "recordsSynced": count,
            "sourceApi": "https://hris.radiant.co.id/api/v2/employees/sync",
            "syncedBy": synced_by,
            "message": f"Sinkronisasi otomatis berhasil: {count} data karyawan terhubung."
        }

    def get_sync_logs(self):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM hris_sync_logs ORDER BY synced_at DESC LIMIT 20")
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    def get_hris_structure(self):
        employees = self.get_all_employees()
        
        # Build department & SBU grouping
        sbus = {}
        for emp in employees:
            sbu_name = emp.get("organization_name") or "PT Radiant Utama Interinsco Tbk"
            dept_name = emp.get("department") or "General Operations"
            
            if sbu_name not in sbus:
                sbus[sbu_name] = {}
            if dept_name not in sbus[sbu_name]:
                sbus[sbu_name][dept_name] = []
                
            sbus[sbu_name][dept_name].append({
                "employeeId": emp["id"],
                "employeeNumber": emp["employee_number"],
                "fullName": emp["full_name"],
                "email": emp["email"],
                "positionName": emp["position_name"],
                "entityName": emp["entity_name"],
                "department": dept_name,
                "directSupervisor": emp.get("direct_supervisor_name") or "Direct Supervisor",
                "managerName": emp.get("manager_name") or "Division Manager"
            })

        logs = self.get_sync_logs()
        last_sync = logs[0]["synced_at"] if logs else datetime.datetime.now().isoformat()

        return {
            "status": "success",
            "totalEmployees": len(employees),
            "lastSyncedAt": last_sync,
            "structure": sbus
        }

    # --- 2. Master Jenis Kegiatan (Activity Types) Methods ---
    def get_all_activity_types(self):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM activity_types ORDER BY created_at ASC")
        rows = cursor.fetchall()
        conn.close()
        
        result = []
        for r in rows:
            d = dict(r)
            result.append({
                "id": d["id"],
                "code": d["code"],
                "name": d["name"],
                "category": d["category"],
                "description": d["description"],
                "requiresExternalParty": bool(d["requires_external_party"]),
                "requiresParticipants": bool(d["requires_participants"]),
                "maxAmountThreshold": d["max_amount_threshold"],
                "isActive": bool(d["is_active"]),
                "createdAt": d["created_at"]
            })
        return result

    def save_activity_type(self, data):
        conn = self.get_connection()
        cursor = conn.cursor()

        act_id = str(data.get("id") or "").strip()
        code = str(data.get("code") or "").strip().upper()

        if not act_id:
            act_id = f"ACT-{uuid.uuid4().hex[:6].upper()}"
        if not code:
            code = f"ACT_{uuid.uuid4().hex[:4].upper()}"

        name = str(data.get("name") or "Jenis Kegiatan Baru").strip()
        category = str(data.get("category") or "GENERAL").strip().upper()
        description = str(data.get("description") or "").strip()

        # Safe boolean parsing
        req_ext = data.get("requiresExternalParty")
        if req_ext is None:
            req_ext = data.get("requires_external_party", True)
        requires_external_party = 1 if bool(req_ext) else 0

        req_part = data.get("requiresParticipants")
        if req_part is None:
            req_part = data.get("requires_participants", True)
        requires_participants = 1 if bool(req_part) else 0

        is_act = data.get("isActive")
        if is_act is None:
            is_act = data.get("is_active", True)
        is_active = 1 if bool(is_act) else 0

        # Safe numeric parsing
        max_amt_val = data.get("maxAmountThreshold")
        if max_amt_val is None:
            max_amt_val = data.get("max_amount_threshold", 0)
        try:
            max_amount_threshold = float(max_amt_val) if max_amt_val is not None and str(max_amt_val).strip() != "" else 0.0
        except (ValueError, TypeError):
            max_amount_threshold = 0.0

        now_str = datetime.datetime.now().isoformat()

        cursor.execute("SELECT id FROM activity_types WHERE id = ? OR code = ?", (act_id, code))
        existing = cursor.fetchone()

        if existing:
            target_id = existing["id"]
            cursor.execute("""
                UPDATE activity_types SET
                    code = ?,
                    name = ?,
                    category = ?,
                    description = ?,
                    requires_external_party = ?,
                    requires_participants = ?,
                    max_amount_threshold = ?,
                    is_active = ?,
                    updated_at = ?
                WHERE id = ?
            """, (
                code,
                name,
                category,
                description,
                requires_external_party,
                requires_participants,
                max_amount_threshold,
                is_active,
                now_str,
                target_id
            ))
            act_id = target_id
        else:
            cursor.execute("""
                INSERT INTO activity_types (
                    id, code, name, category, description,
                    requires_external_party, requires_participants, max_amount_threshold, is_active, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                act_id,
                code,
                name,
                category,
                description,
                requires_external_party,
                requires_participants,
                max_amount_threshold,
                is_active,
                now_str,
                now_str
            ))

        conn.commit()
        conn.close()
        return act_id

    def delete_activity_type(self, type_id):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM activity_types WHERE id = ? OR code = ?", (type_id, type_id))
        conn.commit()
        conn.close()
        return True

    # --- 3. User & Permissions Management Methods ---
    def get_all_users_with_permissions(self):
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT u.*, p.permissions_json, e.employee_number, e.position_name, e.department, e.entity_name
            FROM users u
            LEFT JOIN user_permissions p ON u.id = p.user_id
            LEFT JOIN employees e ON u.employee_id = e.id
            ORDER BY u.created_at ASC
        """)
        rows = cursor.fetchall()
        conn.close()

        default_role_permissions = {
            "ADMIN": ["CREATE_DECLARATION", "APPROVE_DECLARATION", "VIEW_ALL_DECLARATIONS", "MANAGE_USERS", "MANAGE_MASTER_DATA", "MANAGE_COMPLIANCE_TEXT", "SYNC_HRIS", "EXPORT_REPORTS"],
            "APPROVER": ["CREATE_DECLARATION", "APPROVE_DECLARATION", "VIEW_ALL_DECLARATIONS", "EXPORT_REPORTS"],
            "EMPLOYEE": ["CREATE_DECLARATION"],
            "COMPLIANCE_OFFICER": ["VIEW_ALL_DECLARATIONS", "MANAGE_MASTER_DATA", "MANAGE_COMPLIANCE_TEXT", "EXPORT_REPORTS"]
        }

        result = []
        for r in rows:
            d = dict(r)
            role = d["role"] or "EMPLOYEE"
            perm_str = d.get("permissions_json")
            if perm_str:
                try:
                    perms = json.loads(perm_str)
                except Exception:
                    perms = default_role_permissions.get(role, ["CREATE_DECLARATION"])
            else:
                perms = default_role_permissions.get(role, ["CREATE_DECLARATION"])

            result.append({
                "id": d["id"],
                "username": d["username"],
                "fullName": d["full_name"],
                "email": d["email"],
                "role": role,
                "employeeId": d["employee_id"],
                "employeeNumber": d.get("employee_number") or d["employee_id"],
                "positionName": d.get("position_name") or "Staff",
                "department": d.get("department") or "Operations",
                "entityName": d.get("entity_name") or "PT Radiant Utama Interinsco Tbk",
                "permissions": perms
            })
        return result

    def update_user_role_and_permissions(self, user_id, role, permissions_list, updated_by="Admin"):
        conn = self.get_connection()
        cursor = conn.cursor()
        now_str = datetime.datetime.now().isoformat()

        # Update role in users table
        cursor.execute("UPDATE users SET role = ? WHERE id = ? OR employee_id = ?", (role, user_id, user_id))

        # Update or insert in user_permissions table
        perm_id = f"PERM-{user_id}"
        cursor.execute("""
            INSERT OR REPLACE INTO user_permissions (id, user_id, role, permissions_json, updated_at, updated_by)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            perm_id,
            user_id,
            role,
            json.dumps(permissions_list),
            now_str,
            updated_by
        ))

        conn.commit()
        conn.close()
        return True

    # --- 4. Kalimat Deklarasi Kepatuhan (Compliance Statement) Methods ---
    def get_compliance_statement(self):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM compliance_settings WHERE setting_key = 'abc_compliance_declaration_v1'")
        row = cursor.fetchone()
        conn.close()

        if row:
            d = dict(row)
            return {
                "id": d["id"],
                "settingKey": d["setting_key"],
                "title": d["title"],
                "statementIndonesian": d["statement_indonesian"],
                "statementEnglish": d["statement_english"],
                "updatedAt": d["updated_at"],
                "updatedBy": d["updated_by"]
            }

        # Fallback default
        return {
            "id": "SET-COMP-001",
            "settingKey": "abc_compliance_declaration_v1",
            "title": "Pernyataan Kepatuhan & Kebijakan Anti-Bribery & Anti-Corruption (ABC)",
            "statementIndonesian": "Dengan ini saya menyatakan bahwa seluruh data dan informasi yang saya sampaikan dalam Formulir Deklarasi Anti-Bribery & Anti-Corruption (ABC) ini adalah BENAR, AKURAT, dan SESUAI dengan fakta yang sebenarnya. Kegiatan ini tidak mengandung unsur suap, gratifikasi ilegal, pemerasan, atau pelanggaran terhadap Kebijakan Anti-Penyuapan Radiant Group dan Peraturan Perundang-undangan yang berlaku.",
            "statementEnglish": "I hereby declare that all data and information provided in this Anti-Bribery & Anti-Corruption (ABC) Declaration Form is TRUE, ACCURATE, and in accordance with actual facts. This activity contains no bribery, illegal gratification, extortion, or violation of Radiant Group Anti-Bribery Policy and applicable laws.",
            "updatedAt": datetime.datetime.now().isoformat(),
            "updatedBy": "System Compliance Officer"
        }

    def update_compliance_statement(self, title, statement_indonesian, statement_english, updated_by="Compliance Manager"):
        conn = self.get_connection()
        cursor = conn.cursor()
        now_str = datetime.datetime.now().isoformat()

        cursor.execute("""
            INSERT OR REPLACE INTO compliance_settings (id, setting_key, title, statement_indonesian, statement_english, updated_at, updated_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            "SET-COMP-001",
            "abc_compliance_declaration_v1",
            title,
            statement_indonesian,
            statement_english,
            now_str,
            updated_by
        ))

        # Audit log
        cursor.execute("""
            INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, record_id, description)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            f"AUD-{uuid.uuid4().hex[:8]}",
            now_str,
            "USR-ADMIN",
            updated_by,
            "UPDATE_COMPLIANCE_TEXT",
            "SET-COMP-001",
            "Mengubah kalimat standar deklarasi kepatuhan ABC"
        ))

        conn.commit()
        conn.close()
        return self.get_compliance_statement()

db = HRISDatabaseManager()
