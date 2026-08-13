-- Radiant Group ABC Declaration Portal Database Schema (MySQL)

CREATE DATABASE IF NOT EXISTS radiant_abc_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE radiant_abc_db;

-- 1. Table: Users (Authentication & Roles)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    role ENUM('EMPLOYEE', 'APPROVER', 'ADMIN') NOT NULL DEFAULT 'EMPLOYEE',
    employee_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Table: User Sessions (Backend Auth Tokens)
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(100) PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Table: Employees (HRIS Core Master Data)
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(50) PRIMARY KEY,
    employee_number VARCHAR(50) NOT NULL UNIQUE, -- NIK
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone_number VARCHAR(50),
    position_id VARCHAR(50),
    position_name VARCHAR(150) NOT NULL,
    entity_code VARCHAR(50) NOT NULL, -- PT Radiant Utama Interinsco Tbk, etc.
    entity_name VARCHAR(200) NOT NULL,
    branch_code VARCHAR(50) NOT NULL, -- HO, Muara Enim, etc.
    branch_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    organization_name VARCHAR(200) NOT NULL,
    direct_supervisor_id VARCHAR(50),
    direct_supervisor_name VARCHAR(150),
    manager_id VARCHAR(50),
    manager_name VARCHAR(150),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    join_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table: Declarations (Form ABC Anti-Bribery & Corruption)
CREATE TABLE IF NOT EXISTS declarations (
    id VARCHAR(50) PRIMARY KEY,
    declaration_number VARCHAR(100) NOT NULL UNIQUE, -- ABC-HO26080001
    expense_number VARCHAR(100), -- EXP-2026-08001 (generated post-approval)
    status ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'DRAFT',
    activity_type ENUM('GIFT', 'SPONSORSHIP', 'RECREATIONAL', 'ENTERTAINMENT', 'EXTERNAL_MEAL', 'FACILITATION', 'INTERNAL') NOT NULL,
    document_code VARCHAR(50) DEFAULT 'F-COMP-001-01',
    user_id VARCHAR(50) NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    identity_json JSON NOT NULL,
    external_party_json JSON NOT NULL,
    activity_detail_json JSON NOT NULL,
    declaration_accepted BOOLEAN DEFAULT FALSE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_date TIMESTAMP NULL,
    reviewed_date TIMESTAMP NULL,
    reviewed_by VARCHAR(150),
    rejection_reason TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Table: Attachments (Supporting Proof Documents)
CREATE TABLE IF NOT EXISTS attachments (
    id VARCHAR(50) PRIMARY KEY,
    declaration_id VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    data_url LONGTEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (declaration_id) REFERENCES declarations(id) ON DELETE CASCADE
);

-- 6. Table: Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(150) NOT NULL,
    action VARCHAR(100) NOT NULL,
    record_id VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(50)
);

-- Insert Default Seed Data for Radiant Group Users & HRIS Employees
-- Default password: password123 (hashed sha256: ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f)
INSERT IGNORE INTO users (id, username, password_hash, full_name, email, role, employee_id) VALUES
('USR-001', 'employee', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'John Doe', 'john.doe@radiant.co.id', 'EMPLOYEE', 'EMP-2026-001'),
('USR-002', 'approver', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Sari Intan', 'sari.intan@radiant.co.id', 'APPROVER', 'EMP-2026-002'),
('USR-003', 'admin', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Budi Santoso', 'budi.santoso@radiant.co.id', 'ADMIN', 'EMP-2026-003');

INSERT IGNORE INTO employees (id, employee_number, full_name, email, phone_number, position_id, position_name, entity_code, entity_name, branch_code, branch_name, department, organization_name, direct_supervisor_id, direct_supervisor_name, manager_id, manager_name) VALUES
('EMP-2026-001', '2608001', 'John Doe', 'john.doe@radiant.co.id', '+62 812-3456-7890', 'POS-ENG-01', 'Senior Project Engineer', 'RUI', 'PT Radiant Utama Interinsco Tbk', 'HO', 'Head Office Jakarta', 'Engineering & Operations', 'Operations Division', 'EMP-2026-002', 'Sari Intan', 'EMP-2026-003', 'Budi Santoso'),
('EMP-2026-002', '2608002', 'Sari Intan', 'sari.intan@radiant.co.id', '+62 811-9876-5432', 'POS-MGR-01', 'Compliance & Legal Manager', 'RUI', 'PT Radiant Utama Interinsco Tbk', 'HO', 'Head Office Jakarta', 'Compliance & Legal', 'Legal & Governance Division', 'EMP-2026-003', 'Budi Santoso', 'EMP-2026-003', 'Budi Santoso'),
('EMP-2026-003', '2608003', 'Budi Santoso', 'budi.santoso@radiant.co.id', '+62 813-1122-3344', 'POS-DIR-01', 'Director of Operations', 'RUI', 'PT Radiant Utama Interinsco Tbk', 'HO', 'Head Office Jakarta', 'Executive Directorate', 'Executive Board', NULL, NULL, NULL, NULL),
('EMP-2026-004', '2608004', 'Ahmad Rizky', 'ahmad.rizky@radiant.co.id', '+62 815-5566-7788', 'POS-PROC-02', 'Procurement Specialist', 'RUI', 'PT Radiant Utama Interinsco Tbk', 'HO', 'Head Office Jakarta', 'Procurement & Supply Chain', 'Supply Chain Division', 'EMP-2026-002', 'Sari Intan', 'EMP-2026-003', 'Budi Santoso'),
('EMP-2026-005', '2608005', 'Dewi Lestari', 'dewi.lestari@radiant.co.id', '+62 817-8899-0011', 'POS-FIN-01', 'Finance & Accounting Lead', 'RUI', 'PT Radiant Utama Interinsco Tbk', 'HO', 'Head Office Jakarta', 'Finance & Tax', 'Finance Division', 'EMP-2026-003', 'Budi Santoso', 'EMP-2026-003', 'Budi Santoso');
