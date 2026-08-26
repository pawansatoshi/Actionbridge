import { createHmac, timingSafeEqual } from "crypto";

const secret = () => process.env.ACTIONBRIDGE_APPROVAL_SECRET || process.env.CALLE_API_KEY || "development-only-approval-secret";

export type ApprovalPayload = { goal: string; phone: string; region: string; locale: string; exp: number; nonce: string };

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function issueApprovalToken(payload: ApprovalPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function readApprovalToken(token: unknown): ApprovalPayload | null {
  if (typeof token !== "string") return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expectedSignature = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as ApprovalPayload;
    if (!payload || typeof payload !== "object") return null;
    if (typeof payload.goal !== "string" || typeof payload.phone !== "string" || typeof payload.region !== "string" || typeof payload.locale !== "string") return null;
    if (typeof payload.exp !== "number" || typeof payload.nonce !== "string" || !payload.nonce) return null;
    if (payload.exp <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function verifyApprovalToken(token: unknown, expected: Omit<ApprovalPayload, "exp" | "nonce">) {
  const payload = readApprovalToken(token);
  return Boolean(
    payload &&
    payload.goal === expected.goal &&
    payload.phone === expected.phone &&
    payload.region === expected.region &&
    payload.locale === expected.locale,
  );
}
