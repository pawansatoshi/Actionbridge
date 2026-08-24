const BASE_URL = process.env.CALLE_BASE_URL || "https://api.heycall-e.com";

export function requireCalleKey() {
  const key = process.env.CALLE_API_KEY;
  if (!key) throw new Error("CALL-E is not configured.");
  return key;
}

export async function calleRequest(path: string, init: RequestInit = {}) {
  const key = requireCalleKey();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${key}`);
  headers.set("Content-Type", "application/json");
  return fetch(`${BASE_URL}${path}`, { ...init, headers, cache: "no-store" });
}

export const terminalStatuses = new Set(["completed", "failed", "cancelled", "canceled", "error"]);
