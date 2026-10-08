# Declaration Form Enhancement Change Log

## 1. Implementation Information

* Feature: Declaration Form Enhancement
* Repository: `D:\ProjectClosing\declaration-form`
* Database schema changed: NO
* Implementation status: Completed with build warning
* Date: 2026-10-08

## 2. Confirmed Implementation Areas

| Area | Implementation | Status |
|---|---|---|
| Project Code | LOV through `GET /api/master/project-codes?department=...` | COMPLETE |
| Cost Control | Public Employee API data, active employee, exact position `PCC`, selected-SBU filter | COMPLETE |
| SBU/Department | Public Organization API through `/api/hris/structure` | COMPLETE |
| Employee LOV | Existing HRIS service/modal and Public Employee API backend source | COMPLETE |
| Document upload | Existing uploader, restrictions, original filename display, mandatory attachment on submit | COMPLETE |
| Submit validation | Frontend and backend validation | COMPLETE |

## 3. Data Sources and API Reuse

### Employee

Employee data is sourced by the backend from:

`https://mps-test.appsradiant.com:8001/api/public/erp/employees`

The React frontend uses the existing `/api/hris/employees` route and does not call the external API directly. Public API responses are normalized to the existing `Employee` fields.

### SBU and Department

SBU and Department data is sourced by the backend from:

`https://mps-test.appsradiant.com:8001/api/public/organization-departments`

`Step1Identity` consumes the existing `/api/hris/structure` route through `HRISService.getOrganizationOptions()`. No mock fallback is used for Declaration Form SBU/Department options.

### Project Code

Project Code is sourced from the Integration Database view `v_costcode_all`. The Declaration Form accesses it read-only and does not modify the Integration Database schema or data.

Source method: `HRISDatabaseManager.get_project_codes(department)`.

Read-only query:

```sql
SELECT project_code, project_name, department
FROM v_costcode_all
WHERE department = %s
ORDER BY project_code
```

Mapped fields:

* `project_code` → `id` and `code`
* `project_name` → `name`
* `department` → `department`

No Project Code data is read from stored declaration JSON.

### Cost Control

Cost Control reuses the existing Employee API/service path. It requires:

* active employee;
* position exactly `PCC`;
* SBU exactly matching the selected SBU;
* email derived from employee master data.

Cost Control never falls back to mock employees. If the Public Employee API is unavailable, the Cost Control list is empty.

## 4. Change History

### [2026-10-08] Enhancement implementation

* Added Project Code and Cost Control reference fields to the existing declaration state.
* Added table/modal LOV UI with search and dependent Department/SBU behavior.
* Added backend Public Employee and Organization API integration.
* Added Integration DB read-only Project Code lookup through `v_costcode_all`.
* Added frontend and backend validation for routing fields and attachments.
* Reused the existing document uploader and HRIS service architecture.

### [2026-10-08] HRIS regression fix

General-purpose methods preserve their previous mock fallback behavior:

* `HRISService.getAllEmployees()`
* `HRISService.getEmployeesByEntity()`
* `HRISService.searchEmployees()`
* `HRISService.getHrisStructure()`

`HRISService.getCostControlEmployees(sbu)` uses the Public Employee API path with fallback disabled, so mock employees cannot appear as Cost Control choices.

### [2026-10-08] Final pre-commit status fix

`DeclarationService.submitDeclaration()` now keeps the status `SUBMITTED` in both backend and localStorage. `APPROVED` and `REJECTED` remain transitions performed by the existing `ApprovalService`.

Python dependencies are tracked in `requirements.txt`:

* `python-dotenv==1.2.4`
* `mysql-connector-python==26.7.0`

## 5. Cascading and Validation Rules

### Cascading

* Entity → Employee, Position, NIK, and Email reset.
* SBU → Department, Project Code, Cost Control, and Cost Control Email reset.
* Department → Project Code reset.
* Cost Control → Email Cost Control updates from the selected employee.

### Frontend validation

* SBU required.
* Department required.
* Project Code required.
* Cost Control required.
* Cost Control Email required and read-only.
* At least one attachment required before submit.
* Existing activity and declaration acceptance validation preserved.

### Backend validation

* Critical submit validation applies only to `SUBMITTED`.
* Department must be selected before Project Code lookup/validation.
* Project Code must belong to the selected Department.
* Cost Control employee must exist and belong to the selected SBU.
* Position must be exactly `PCC`.
* Email is derived/validated server-side against the employee source.
* At least one attachment is required for `SUBMITTED`.
* `DRAFT` is not forced through submit validation or attachment validation.

## 6. Document and Database Verification

* Existing `DocumentUploader` is reused.
* Existing file size/type restrictions are unchanged.
* Original filenames remain visible through `Attachment.name`.
* Integration DB access is read-only `SELECT` only.
* No `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE`, migration, column, index, or foreign-key change was performed.

**DATABASE SCHEMA CHANGED: NO**

## 7. Testing / Verification Log

* `npm install`: PASS; dependencies installed/audited with no vulnerabilities.
* `npm run lint`: PASS.
* `npm run build`: PASS with Vite bundle-size warning.
* `py -3 -m py_compile backend/app.py backend/mysql_db.py`: PASS.
* `git diff --check`: PASS.
* Automated tests: NOT AVAILABLE; no test script exists in `package.json`.
* Live external API regression: NOT RUN; supplied HTTPS endpoints were unavailable from the execution environment.

## 8. Issues and Limitations

* Production behavior depends on availability of the Public Employee API, Public Organization API, and Integration DB connection.
* The build has a non-failing bundle-size warning for the main JavaScript chunk.
* Live external API functional verification was not possible in this environment.

## 9. Final Changed Files

### Enhancement changes implemented

* `backend/app.py`
* `backend/mysql_db.py`
* `docs/audit/declaration-form-enhancement.md`
* `requirements.txt`
* `src/components/declaration/DeclarationRoutingFields.tsx`
* `src/components/declaration/DepartmentLovModal.tsx`
* `src/components/declaration/SbuLovModal.tsx`
* `src/components/declaration/Step1Identity.tsx`
* `src/components/declaration/Step3ActivityDetail.tsx`
* `src/pages/CreateDeclaration.tsx`
* `src/services/declaration.service.ts`
* `src/services/hris.service.ts`
* `src/services/project-code.service.ts`
* `src/types/index.ts`

### Pre-existing / unrelated working-tree changes

* `.env.example` — existing Integration DB placeholder configuration.
* `assets/.aistudio/.gitignore` — existing environment-file ignore rule.
* `server.ts` — intentional existing port separation: ProjectClosing remains on port 3000 and Declaration Form uses port 3001. ProjectClosing was not modified.

### Deleted

* None.

## 10. Final Status

* Build: PASS with warning
* Type check: PASS
* Python compile: PASS
* Tests: NOT AVAILABLE
* Live API regression: NOT RUN
* Git diff check: PASS
* Database schema changed: NO
* Integration DB write operation: NO
* ProjectClosing modified: NO
* ProjectClosing port 3000 modified: NO
* Declaration Form port: 3001
* Status workflow: `DRAFT` → `SUBMITTED` → `APPROVED` or `REJECTED`
