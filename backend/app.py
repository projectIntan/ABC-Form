import sys
import json
import logging
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse
from mysql_db import db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Python_HRIS_Backend")

class HRISApiHandler(BaseHTTPRequestHandler):
    def _send_json_response(self, status_code, data):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-auth-token")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def _extract_token(self):
        auth_header = self.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            return auth_header.replace("Bearer ", "").strip()
        return self.headers.get("x-auth-token", "").strip()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-auth-token")
        self.end_headers()

    def do_GET(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        query_params = parse_qs(parsed_url.query)

        # 1. Verify Current Authenticated User Session (GET /api/auth/me)
        if path in ["/api/auth/me", "/api/me"]:
            token = self._extract_token()
            if not token:
                return self._send_json_response(401, {"status": "error", "message": "No authentication token provided"})
            session_data = db.verify_token(token)
            if session_data:
                return self._send_json_response(200, {
                    "status": "success",
                    "authenticated": True,
                    "user": session_data
                })
            return self._send_json_response(401, {"status": "error", "message": "Invalid or expired session token"})

        # 2. Get HRIS Employees List
        if path == "/api/hris/employees":
            search_query = query_params.get("q", [None])[0] or query_params.get("query", [None])[0]
            entity_query = query_params.get("entity", [None])[0]
            employees = db.get_all_employees(query=search_query, entity=entity_query)
            return self._send_json_response(200, {
                "status": "success",
                "count": len(employees),
                "data": employees
            })

        # 3. Get Single Employee Profile by ID/NIK
        if path.startswith("/api/hris/employee/"):
            emp_id = path.replace("/api/hris/employee/", "").strip()
            emp = db.get_employee_by_id(emp_id)
            if emp:
                return self._send_json_response(200, {"status": "success", "data": emp})
            return self._send_json_response(404, {"status": "error", "message": "Employee not found in HRIS"})

        # 4. Get HRIS Organizational Structure
        if path == "/api/hris/structure":
            structure_data = db.get_hris_structure()
            return self._send_json_response(200, structure_data)

        # 5. Get HRIS Sync Logs
        if path == "/api/hris/sync/logs":
            logs = db.get_sync_logs()
            return self._send_json_response(200, {"status": "success", "data": logs})

        # 6. Get Master Activity Types (Jenis Kegiatan)
        if path == "/api/master/activity-types":
            act_types = db.get_all_activity_types()
            return self._send_json_response(200, {"status": "success", "data": act_types})

        # 7. Get Users with Roles & Permissions
        if path == "/api/admin/users":
            users = db.get_all_users_with_permissions()
            return self._send_json_response(200, {"status": "success", "data": users})

        # 8. Get Compliance Statement
        if path in ["/api/compliance/statement", "/api/settings/compliance-statement"]:
            statement = db.get_compliance_statement()
            return self._send_json_response(200, {"status": "success", "data": statement})

        # 9. Get Declarations (Protected: Compliance/Approver/Admin)
        if path == "/api/declarations":
            token = self._extract_token()
            if not token or not db.verify_token(token):
                return self._send_json_response(401, {"status": "error", "message": "Authentication required to view declarations monitoring"})
            declarations = db.get_all_declarations()
            return self._send_json_response(200, {"status": "success", "data": declarations})

        # 10. Get Single Saved Declaration by ID or Number (GET /api/declarations/<id>)
        if path.startswith("/api/declarations/"):
            decl_id = path.replace("/api/declarations/", "").strip()
            decl = db.get_declaration_by_id(decl_id)
            if decl:
                return self._send_json_response(200, {"status": "success", "data": decl})
            return self._send_json_response(404, {"status": "error", "message": "Declaration not found"})

        # Health Check
        if path == "/api/health" or path == "/":
            return self._send_json_response(200, {
                "status": "online",
                "service": "Radiant Group HRIS & ABC Backend (Python)",
                "auth_status": "Enabled (SHA-256 & Session Token)",
                "database": "MySQL / Active"
            })

        self._send_json_response(404, {"status": "error", "message": "Route not found"})

    def do_POST(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path

        content_length = int(self.headers.get("Content-Length", 0))
        body_bytes = self.rfile.read(content_length) if content_length > 0 else b"{}"
        
        try:
            body_data = json.loads(body_bytes.decode("utf-8"))
        except Exception:
            body_data = {}

        # 1. Login Endpoint (POST /api/login or POST /api/auth/login)
        if path in ["/api/login", "/api/auth/login"]:
            username = body_data.get("username", "").strip() or body_data.get("employeeNumber", "").strip()
            password = body_data.get("password", "password123").strip()

            if not username:
                return self._send_json_response(400, {"status": "error", "message": "Username atau NIK Karyawan harus diisi"})

            ip_addr = self.client_address[0] if self.client_address else "127.0.0.1"
            auth_result = db.authenticate_user(username, password, ip_address=ip_addr)

            if auth_result:
                return self._send_json_response(200, {
                    "status": "success",
                    "message": "Login berhasil via Python HRIS Backend",
                    "token": auth_result["token"],
                    "expiresAt": auth_result["expires_at"],
                    "user": auth_result["user"]
                })
            else:
                return self._send_json_response(401, {
                    "status": "error",
                    "message": "Kredensial login tidak valid. Periksa Username/NIK dan Password."
                })

        # 2. Logout Endpoint (POST /api/auth/logout or POST /api/logout)
        if path in ["/api/auth/logout", "/api/logout"]:
            token = self._extract_token() or body_data.get("token")
            if token:
                db.revoke_token(token)
            return self._send_json_response(200, {
                "status": "success",
                "message": "Session token revoked successfully"
            })

        # 3. Save Declaration Endpoint
        if path == "/api/declarations":
            decl_id = db.save_declaration(body_data)
            return self._send_json_response(200, {
                "status": "success",
                "message": "Declaration saved to database",
                "id": decl_id
            })

        # 4. Trigger HRIS Sync (POST /api/hris/sync)
        if path == "/api/hris/sync":
            synced_by = body_data.get("syncedBy", "System Admin")
            res = db.sync_hris_data(synced_by=synced_by)
            return self._send_json_response(200, {"status": "success", "data": res})

        # 5. Create/Update Master Activity Type (POST /api/master/activity-types)
        if path in ["/api/master/activity-types", "/api/master/activity-types/"] or path.startswith("/api/master/activity-types"):
            try:
                act_id = db.save_activity_type(body_data)
                return self._send_json_response(200, {
                    "status": "success",
                    "message": "Activity type saved successfully",
                    "id": act_id
                })
            except Exception as e:
                logger.error(f"Error saving activity type: {e}")
                return self._send_json_response(500, {
                    "status": "error",
                    "message": f"Gagal menyimpan jenis kegiatan: {str(e)}"
                })

        # 6. Update User Permissions (POST /api/admin/users/permissions)
        if path in ["/api/admin/users/permissions", "/api/admin/users/permissions/update"]:
            user_id = body_data.get("userId")
            role = body_data.get("role", "EMPLOYEE")
            perms = body_data.get("permissions", [])
            updated_by = body_data.get("updatedBy", "Admin")
            db.update_user_role_and_permissions(user_id, role, perms, updated_by=updated_by)
            return self._send_json_response(200, {
                "status": "success",
                "message": "User permissions and role updated successfully"
            })

        # 7. Update Compliance Statement (POST /api/compliance/statement)
        if path in ["/api/compliance/statement", "/api/settings/compliance-statement"]:
            title = body_data.get("title", "Pernyataan Kepatuhan ABC")
            statement_id = body_data.get("statementIndonesian", "")
            statement_en = body_data.get("statementEnglish", "")
            updated_by = body_data.get("updatedBy", "Compliance Officer")
            updated = db.update_compliance_statement(title, statement_id, statement_en, updated_by=updated_by)
            return self._send_json_response(200, {
                "status": "success",
                "message": "Compliance statement updated successfully",
                "data": updated
            })

        self._send_json_response(404, {"status": "error", "message": "Route not found"})

    def do_PUT(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path

        content_length = int(self.headers.get("Content-Length", 0))
        body_bytes = self.rfile.read(content_length) if content_length > 0 else b"{}"
        try:
            body_data = json.loads(body_bytes.decode("utf-8"))
        except Exception:
            body_data = {}

        # 1. Update Master Activity Type (PUT /api/master/activity-types or /api/master/activity-types/<id>)
        if path.startswith("/api/master/activity-types"):
            try:
                act_id = db.save_activity_type(body_data)
                return self._send_json_response(200, {
                    "status": "success",
                    "message": "Activity type updated successfully",
                    "id": act_id
                })
            except Exception as e:
                logger.error(f"Error updating activity type: {e}")
                return self._send_json_response(500, {
                    "status": "error",
                    "message": f"Gagal memperbarui jenis kegiatan: {str(e)}"
                })

        # 2. Update User Permissions (PUT /api/admin/users/<id>/permissions)
        if path.startswith("/api/admin/users/") and "/permissions" in path:
            parts = path.split("/")
            user_id = parts[4] if len(parts) >= 5 else body_data.get("userId")
            role = body_data.get("role", "EMPLOYEE")
            perms = body_data.get("permissions", [])
            updated_by = body_data.get("updatedBy", "Admin")
            db.update_user_role_and_permissions(user_id, role, perms, updated_by=updated_by)
            return self._send_json_response(200, {
                "status": "success",
                "message": f"User {user_id} permissions and role updated successfully"
            })

        # 3. Update Compliance Statement (PUT /api/compliance/statement)
        if path in ["/api/compliance/statement", "/api/settings/compliance-statement"]:
            title = body_data.get("title", "Pernyataan Kepatuhan ABC")
            statement_id = body_data.get("statementIndonesian", "")
            statement_en = body_data.get("statementEnglish", "")
            updated_by = body_data.get("updatedBy", "Compliance Officer")
            updated = db.update_compliance_statement(title, statement_id, statement_en, updated_by=updated_by)
            return self._send_json_response(200, {
                "status": "success",
                "message": "Compliance statement updated successfully",
                "data": updated
            })

        self._send_json_response(404, {"status": "error", "message": "Route not found"})

    def do_DELETE(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path

        if path.startswith("/api/master/activity-types/"):
            type_id = path.replace("/api/master/activity-types/", "").strip()
            db.delete_activity_type(type_id)
            return self._send_json_response(200, {
                "status": "success",
                "message": f"Activity type {type_id} deleted successfully"
            })

        self._send_json_response(404, {"status": "error", "message": "Route not found"})

def run_server(port=5001):
    server_address = ("0.0.0.0", port)
    httpd = HTTPServer(server_address, HRISApiHandler)
    logger.info(f"Python HRIS & ABC Backend Server running on http://0.0.0.0:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logger.info("Stopping Python HRIS Backend Server...")
        httpd.server_close()

if __name__ == "__main__":
    port = 5001
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    run_server(port)
