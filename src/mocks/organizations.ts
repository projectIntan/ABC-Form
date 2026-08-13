import { OrganizationNode } from "../types";

export const MOCK_ORGANIZATIONS: OrganizationNode[] = [
  {
    id: "ORG_ROOT",
    name: "Radiant Group Corporate Structure",
    code: "RG-CORP",
    children: [
      {
        id: "ORG_CORP",
        name: "Corporate Office",
        code: "CORP",
        children: [
          { id: "ORG005", name: "Corporate Legal & Compliance", code: "LEGAL" },
          { id: "ORG008", name: "Human Capital & General Affairs", code: "HCGA" },
          { id: "ORG007", name: "Information Technology", code: "IT" },
          { id: "ORG004", name: "Finance & Control", code: "FIN" },
        ],
      },
      {
        id: "ORG_OPS",
        name: "Operations Division",
        code: "OPS-DIV",
        children: [
          { id: "ORG001", name: "Operations & Field Management", code: "OPS" },
          { id: "ORG003", name: "Supply Chain & Procurement", code: "SCM" },
          { id: "ORG006", name: "Health, Safety & Environment", code: "HSE" },
        ],
      },
      {
        id: "ORG_COMM",
        name: "Commercial & Business Development",
        code: "COMM-DIV",
        children: [
          { id: "ORG002", name: "Commercial & Sales", code: "SALES" },
          { id: "ORG009", name: "Marketing & Public Relations", code: "MKT" },
        ],
      },
    ],
  },
];
