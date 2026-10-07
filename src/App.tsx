import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { Layout } from "./components/layout/Layout";

// Pages
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { MyDeclarations } from "./pages/MyDeclarations";
import { CreateDeclaration } from "./pages/CreateDeclaration";
import { DeclarationDetail } from "./pages/DeclarationDetail";
import { Approval } from "./pages/Approval";
import { Reports } from "./pages/Reports";
import { Users } from "./pages/Users";
import { AuditTrail } from "./pages/AuditTrail";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* 1. Public Declaration Form (Root / & /declarations/create) - Unauthenticated */}
            <Route path="/" element={<CreateDeclaration isPublicRoot={true} />} />
            <Route path="/declarations/create" element={<CreateDeclaration isPublicRoot={false} />} />

            {/* 2. Compliance / Monitoring Login - Authenticated Entry */}
            <Route path="/login" element={<Login />} />

            {/* 3. Protected Compliance & Monitoring Routes */}
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/declarations" element={<MyDeclarations />} />
              <Route path="/declarations/:id" element={<DeclarationDetail />} />
              <Route path="/approvals" element={<Approval />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/users" element={<Users />} />
              <Route path="/audit-trail" element={<AuditTrail />} />
            </Route>

            {/* Fallback to Public Declaration Form */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
