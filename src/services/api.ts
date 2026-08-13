/**
 * Central API Client Abstraction Layer
 * Reads environment variables and routes calls to Mock API or FastAPI backend.
 */

export const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== "false";
export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8000/api";

export async function simulatedDelay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
