import { createHmac, timingSafeEqual } from "crypto";

const secret = () => process.env.ACTIONBRIDGE_APPROVAL_SECRET || process.env.CALLE_API_KEY || "development-only-approval-secret";

export type ApprovalPayload = { goal: string; phone: string; region: string; locale: string; exp: number; nonce: string };

function sign(value: string) { return createHmac("sha256", secret()).update(value).digest("base64url"); }

export function issueApprovalToken(payload: ApprovalPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifyApprovalToken(token: unknown, expected: Omit<ApprovalPayload, "exp" | "nonce">) {
  if (typeof token !== "string") return false;
  const [body, signature] = token.split(".");
  if (!body || !signature) return false;
  const expectedSignature = sign(body);
  const a = Buffer.from(signature); const b = Buffer.from(expectedSignature);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as ApprovalPayload;
    return payload.exp > Date.now() && payload.goal === expected.goal && payload.phone === expected.phone && payload.region === expected.region && payload.locale === expected.locale;
  } catch { return false; }
}
