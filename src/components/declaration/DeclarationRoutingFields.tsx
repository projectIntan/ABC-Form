import React, { useEffect, useMemo, useState } from "react";
import { Search, X, BriefcaseBusiness, Users } from "lucide-react";
import { Employee, ExternalPartyInfo, ProjectCode } from "../../types";
import { HRISService } from "../../services/hris.service";
import { ProjectCodeService } from "../../services/project-code.service";

interface Props {
  sbu: string;
  department: string;
  data: ExternalPartyInfo;
  errors: Record<string, string>;
  onChange: (data: ExternalPartyInfo) => void;
}

export const DeclarationRoutingFields: React.FC<Props> = ({ sbu, department, data, errors, onChange }) => {
  const [mode, setMode] = useState<"project" | "cost" | null>(null);
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState<ProjectCode[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode !== "project" || !department.trim()) return;
    setLoading(true);
    ProjectCodeService.getProjectCodes(department).then(setProjects).catch(() => setProjects([])).finally(() => setLoading(false));
  }, [mode, department]);
  useEffect(() => {
    if (mode !== "cost" || !sbu.trim()) return;
    setLoading(true);
    HRISService.getCostControlEmployees(sbu).then(setEmployees).finally(() => setLoading(false));
  }, [mode, sbu]);

  const close = () => { setMode(null); setQuery(""); };
  const filteredProjects = useMemo(() => projects.filter((p) => `${p.code} ${p.name || ""}`.toLowerCase().includes(query.toLowerCase())), [projects, query]);
  const filteredEmployees = useMemo(() => employees.filter((e) => `${e.employeeNumber} ${e.fullName} ${e.email}`.toLowerCase().includes(query.toLowerCase())), [employees, query]);

  return <div className="border-t border-slate-200 pt-6 space-y-4">
    <div><h4 className="text-sm font-bold text-slate-900 flex items-center gap-2"><BriefcaseBusiness className="w-4 h-4 text-sky-600" /> Referensi ERP</h4><p className="text-xs text-slate-500 mt-1">Pilih referensi dari master data sesuai SBU dan Department.</p></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <Field label="Project Code" value={data.projectCode} placeholder={department ? "Pilih Project Code" : "Pilih Department dahulu"} error={errors.projectCode} disabled={!department} onClick={() => setMode("project")} />
      <Field label="Cost Control" value={data.costControlName} placeholder={sbu ? "Pilih Cost Control" : "Pilih SBU dahulu"} error={errors.costControl} disabled={!sbu} onClick={() => setMode("cost")} />
      <div className="space-y-1.5"><label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Email Cost Control <span className="text-red-500">*</span></label><input readOnly disabled value={data.costControlEmail || ""} placeholder="Terisi otomatis dari HRIS" className={`w-full px-3.5 py-2.5 bg-slate-100 border rounded-lg text-sm ${errors.costControlEmail ? "border-red-500" : "border-slate-200"}`} />{errors.costControlEmail && <p className="text-[10px] text-red-500">{errors.costControlEmail}</p>}</div>
    </div>
    {mode === null ? null : <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60" onClick={close}><div className="bg-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between"><h3 className="font-bold text-slate-900 flex items-center gap-2">{mode === "project" ? <BriefcaseBusiness className="w-5 h-5 text-sky-600" /> : <Users className="w-5 h-5 text-sky-600" />}{mode === "project" ? "Pilih Project Code" : "Pilih Cost Control (PCC)"}</h3><button type="button" onClick={close}><X className="w-5 h-5 text-slate-400" /></button></div><div className="relative"><Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" /><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm" /></div><div className="max-h-[55vh] overflow-auto border border-slate-200 rounded-lg">{loading ? <p className="p-8 text-center text-sm text-slate-400">Memuat data...</p> : mode === "project" ? <table className="w-full text-left text-xs"><thead className="bg-slate-50"><tr><th className="p-3">Project Code</th><th className="p-3">Nama</th><th className="p-3">Department</th><th /></tr></thead><tbody>{filteredProjects.map((p) => <tr key={p.id} className="border-t hover:bg-sky-50"><td className="p-3 font-bold">{p.code}</td><td className="p-3">{p.name || "-"}</td><td className="p-3">{p.department}</td><td className="p-3 text-right"><button type="button" className="px-3 py-1.5 rounded bg-sky-600 text-white" onClick={() => { onChange({ ...data, projectCode: p.code, projectCodeId: p.id }); close(); }}>Pilih</button></td></tr>)}</tbody></table> : <table className="w-full text-left text-xs"><thead className="bg-slate-50"><tr><th className="p-3">NIK</th><th className="p-3">Nama</th><th className="p-3">Position</th><th className="p-3">SBU</th><th className="p-3">Email</th><th /></tr></thead><tbody>{filteredEmployees.map((e) => <tr key={e.employeeId} className="border-t hover:bg-sky-50"><td className="p-3 font-mono">{e.employeeNumber}</td><td className="p-3 font-bold">{e.fullName}</td><td className="p-3">{e.positionName}</td><td className="p-3">{e.sbuName}</td><td className="p-3">{e.email}</td><td className="p-3 text-right"><button type="button" className="px-3 py-1.5 rounded bg-sky-600 text-white" onClick={() => { onChange({ ...data, costControlEmployeeId: e.employeeId, costControlName: e.fullName, costControlEmail: e.email }); close(); }}>Pilih</button></td></tr>)}</tbody></table>}{!loading && ((mode === "project" && filteredProjects.length === 0) || (mode === "cost" && filteredEmployees.length === 0)) && <p className="p-8 text-center text-sm text-slate-400">Data tidak ditemukan.</p>}</div></div></div>}
  </div>;
};

const Field: React.FC<{ label: string; value?: string; placeholder: string; error?: string; disabled: boolean; onClick: () => void }> = ({ label, value, placeholder, error, disabled, onClick }) => <div className="space-y-1.5"><label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">{label} <span className="text-red-500">*</span></label><div className="flex gap-2"><input readOnly value={value || ""} placeholder={placeholder} className={`min-w-0 flex-1 px-3.5 py-2.5 bg-slate-50 border rounded-lg text-sm ${error ? "border-red-500" : "border-slate-200"}`} /><button type="button" disabled={disabled} onClick={onClick} className="px-3 rounded-lg border border-sky-200 text-sky-700 bg-sky-50 disabled:opacity-50"><Search className="w-4 h-4" /></button></div>{error && <p className="text-[10px] text-red-500">{error}</p>}{disabled && <p className="text-[10px] text-slate-400">{label === "Project Code" ? "Silakan pilih Department terlebih dahulu." : "Silakan pilih SBU terlebih dahulu."}</p>}</div>;
