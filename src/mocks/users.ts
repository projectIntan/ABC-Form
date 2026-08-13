import { User } from "../types";
import { MOCK_EMPLOYEES } from "./employees";

export const MOCK_USERS: User[] = [
  {
    id: "USR001",
    username: "employee",
    employeeId: "EMP001",
    role: "EMPLOYEE",
    employee: MOCK_EMPLOYEES[0], // John Doe
  },
  {
    id: "USR002",
    username: "approver",
    employeeId: "EMP010",
    role: "APPROVER",
    employee: MOCK_EMPLOYEES[9], // Jane Smith
  },
  {
    id: "USR003",
    username: "admin",
    employeeId: "EMP005",
    role: "ADMIN",
    employee: MOCK_EMPLOYEES[4], // Budi Santoso
  },
];
