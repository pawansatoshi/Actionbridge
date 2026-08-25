import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { issueApprovalToken } from "@/lib/approval";
import { isSupportedRegionLocale } from "@/lib/calle-support";

export const runtime = "nodejs";

const validPhone = (v: unknown): v is string => typeof v === "string" && /^\+[1-9]\d{7,14}$/.test(v);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const goal = typeof body?.goal === "string" ? body.goal.trim() : "";
  const phone = body?.phone;
  const region = typeof body?.region === "string" ? body.region.toUpperCase() : "IN";
  const locale = typeof body?.locale === "string" ? body.locale : "en-IN";

  if (!goal || goal.length < 12 || goal.length > 3000) {
    return NextResponse.json({ error: "Enter a clear task between 12 and 3000 characters." }, { status: 400 });
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

  const workflowId = `ab_${randomUUID()}`;
  const expiresAt = Date.now() + 5 * 60_000;
  const approvalToken = issueApprovalToken({ goal, phone, region, locale, exp: expiresAt, nonce: workflowId });

  return NextResponse.json({
    workflowId,
    approvalToken,
    expiresAt,
    plan: {
      objective: goal,
      recipient: phone,
      region,
      locale,
      aiDisclosure: "The caller will identify itself as an AI assistant. Where required, the caller must also provide legally required recording/transcription notices and obtain the required consent or legal basis.",
      boundaries: [
        "Only the stated goal is authorized.",
        "No emergency, safety-critical, or high-risk medical, legal, financial, insurance, employment, housing, credit, education, or government-benefit decision or advice tasks.",
        "No unrelated purchases, financial commitments, legal commitments, or other consequential actions.",
        "Important facts must be verified and uncertainty reported.",
        "The user is responsible for recipient authorization, required notices, consent/legal basis, and applicable opt-out or do-not-contact requirements.",
      ],
      successCriteria: "Return a concise structured result with facts, confidence, evidence and a safe next step.",
    },
  });
}
