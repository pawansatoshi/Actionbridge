import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { calleRequest } from "@/lib/calle";
import { verifyApprovalToken, readApprovalToken } from "@/lib/approval";
import { isSupportedRegionLocale } from "@/lib/calle-support";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resultSchema = {
  type: "object",
  required: ["summary", "facts", "confidence", "next_step"],
  properties: {
    summary: { type: "string", description: "Short factual summary of what the recipient established." },
    facts: { type: "array", items: { type: "string" }, description: "Only facts supported by the call evidence." },
    confidence: { type: "string", enum: ["high", "medium", "low", "unknown"], description: "Confidence in the extracted facts; use unknown when the call is inconclusive." },
    next_step: { type: "string", description: "Safe next step for a human to review; never treat this as authorization to spend or commit." },
  },
  additionalProperties: false,
};

const recipientResultSchema = {
  type: "object",
  required: ["outcome", "facts", "confidence"],
  properties: {
    outcome: { type: "string", description: "What happened for this recipient; do not infer agreement from silence." },
    facts: { type: "array", items: { type: "string" }, description: "Facts directly supported by the recipient call." },
    confidence: { type: "string", enum: ["high", "medium", "low", "unknown"] },
    availability: { type: "string" },
    price: { type: "string" },
    earliest_time: { type: "string" },
    notes: { type: "string" },
  },
  additionalProperties: false,
};

const validPhone = (v: unknown): v is string => typeof v === "string" && /^\+[1-9]\d{7,14}$/.test(v);
const hits = new Map<string, { count: number; reset: number }>();

function rateLimit(request: Request) {
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const now = Date.now();
  const old = hits.get(key);
  if (!old || old.reset < now) {
    hits.set(key, { count: 1, reset: now + 60_000 });
    return true;
  }
  if (old.count >= 5) return false;
  old.count++;
  return true;
}

function isDisallowedGoal(goal: string) {
  const normalized = goal.toLowerCase();
  const patterns = [
    /\b(emergency|911|112|ambulance|fire department|police emergency)\b/,
    /\b(medical diagnosis|diagnose|medical treatment|prescription|dosage)\b/,
    /\b(legal advice|lawsuit|criminal case|court strategy)\b/,
    /\b(financial advice|investment advice|loan approval|credit decision|bank transfer|wire transfer)\b/,
    /\b(insurance decision|insurance advice|claim adjudication)\b/,
    /\b(hiring decision|employment decision|housing decision|credit decision|government benefit)\b/,
  ];
  return patterns.some((pattern) => pattern.test(normalized));
}

const liveEnabled = process.env.CALLE_LIVE_ENABLED === "true" && process.env.ACTIONBRIDGE_ALLOW_PROD_LIVE === "true";

export async function POST(request: Request) {
  if (!liveEnabled) {
    return NextResponse.json(
      { error: "Public demo mode is enabled. Live calling is disabled unless both CALLE_LIVE_ENABLED=true and ACTIONBRIDGE_ALLOW_PROD_LIVE=true are deliberately configured." },
      { status: 503 },
    );
  }
  if (!rateLimit(request)) {
    return NextResponse.json({ error: "Too many call requests. Please wait a minute before trying again." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const goal = typeof body?.goal === "string" ? body.goal.trim() : "";
  const phone = body?.phone;
  const region = typeof body?.region === "string" ? body.region.toUpperCase() : "IN";
  const locale = typeof body?.locale === "string" ? body.locale : "en-IN";

  if (body?.approved !== true) {
    return NextResponse.json({ error: "Explicit UI confirmation is required before execution." }, { status: 403 });
  }
  if (!goal || goal.length < 12 || goal.length > 3000) {
    return NextResponse.json({ error: "Enter a clear task between 12 and 3000 characters." }, { status: 400 });
  }
  if (isDisallowedGoal(goal)) {
    return NextResponse.json({ error: "This task falls outside ActionBridge's supported phone-workflow scope. Emergency/safety-critical and high-risk medical, legal, financial, insurance, employment, housing, credit, education, and government-benefit actions are not supported." }, { status: 400 });
  }
  if (!validPhone(phone)) {
    return NextResponse.json({ error: "Use an E.164 phone number in international format, for example +<country-code><number>." }, { status: 400 });
  }
  if (!/^[A-Z]{2}$/.test(region)) {
    return NextResponse.json({ error: "Region must be a two-letter country code." }, { status: 400 });
  }
  if (!isSupportedRegionLocale(region, locale)) {
    return NextResponse.json({ error: "That country/language combination is not currently listed as supported by CALL-E." }, { status: 400 });
  }

  const approvalPayload = readApprovalToken(body?.approvalToken);
  if (!approvalPayload || !verifyApprovalToken(body?.approvalToken, { goal, phone, region, locale })) {
    return NextResponse.json({ error: "This call has not been prepared and explicitly confirmed. Prepare the call plan again before executing it." }, { status: 403 });
  }

  const workflowId = approvalPayload.nonce || `ab_${randomUUID()}`;
  const task = `You are ActionBridge, an AI phone-work executor. Clearly identify yourself as an AI assistant. If recording, transcription, or other processing requires notice or consent in the recipient's jurisdiction, provide the required notice and do not proceed without the required legal basis. Call the recipient and accomplish only this user-authorized goal: ${goal}. Do not claim to be human. Do not make purchases, financial commitments, legal commitments, or unrelated consequential commitments. Do not disclose private information beyond what is necessary. Verify important facts, distinguish confirmed information from assumptions, and return concise structured evidence. If the recipient cannot complete the task, explain why and return a safe next step. Never treat silence, voicemail, refusal, or an unclear answer as consent or confirmation.`;

  try {
    const r = await calleRequest("/v1/calls", {
      method: "POST",
      headers: { "Idempotency-Key": workflowId },
      body: JSON.stringify({
        task,
        recipients: [{ phones: [phone], region, locale }],
        result_schema: resultSchema,
        recipient_result_schema: recipientResultSchema,
        metadata: { product: "actionbridge", workflow: "goal-to-phone-action", workflow_id: workflowId, version: "1.4", approval: "signed-plan-confirmed" },
        ...(process.env.ACTIONBRIDGE_WEBHOOK_URL ? { webhook_url: process.env.ACTIONBRIDGE_WEBHOOK_URL } : {}),
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return NextResponse.json(
        { error: data?.error?.message || data?.message || "CALL-E rejected the call request.", upstreamStatus: r.status },
        { status: r.status >= 400 && r.status < 500 ? r.status : 502 },
      );
    }
    return NextResponse.json({ callId: data.call_id || data.id, status: data.status || "created", workflowId, ...data }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unable to reach CALL-E." }, { status: 502 });
  }
}
