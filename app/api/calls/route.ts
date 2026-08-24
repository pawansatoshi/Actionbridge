import { NextResponse } from "next/server";

const BASE_URL = process.env.CALLE_BASE_URL || "https://api.heycall-e.com";

const resultSchema = {
  type: "object",
  required: ["availability", "earliest_time", "price", "notes"],
  properties: {
    availability: { type: "string", enum: ["available", "unavailable", "unknown"] },
    earliest_time: { type: "string" },
    price: { type: "string" },
    notes: { type: "string" },
  },
};

function validPhone(phone: unknown): phone is string {
  return typeof phone === "string" && /^\+[1-9]\d{7,14}$/.test(phone);
}

export async function POST(request: Request) {
  if (!process.env.CALLE_API_KEY) {
    return NextResponse.json({ error: "CALL-E is not configured. Add CALLE_API_KEY to the server environment." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const goal = typeof body?.goal === "string" ? body.goal.trim() : "";
  const phone = body?.phone;
  const region = typeof body?.region === "string" ? body.region.toUpperCase() : "IN";
  const locale = typeof body?.locale === "string" ? body.locale : "en-IN";
  const approved = body?.approved === true;

  if (!approved) return NextResponse.json({ error: "Explicit call authorization is required." }, { status: 400 });
  if (!goal || goal.length < 12 || goal.length > 3000) return NextResponse.json({ error: "Enter a clear task between 12 and 3000 characters." }, { status: 400 });
  if (!validPhone(phone)) return NextResponse.json({ error: "Use an E.164 phone number, for example +919876543210." }, { status: 400 });
  if (!/^[A-Z]{2}$/.test(region)) return NextResponse.json({ error: "Region must be a two-letter country code." }, { status: 400 });

  const task = `You are ActionBridge, an AI phone-work executor. You must clearly identify yourself as an AI assistant. Call ${phone} and accomplish this user-authorized goal: ${goal}. Do not claim to be human. Do not make purchases, financial commitments, legal commitments, or other consequential commitments beyond the stated goal. Return the requested facts accurately and distinguish unknown information from confirmed information.`;
  const idempotency = `actionbridge_${crypto.randomUUID()}`;

  const upstream = await fetch(`${BASE_URL}/v1/calls`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CALLE_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotency,
    },
    body: JSON.stringify({
      task,
      recipients: [{ phones: [phone], region, locale }],
      result_schema: resultSchema,
      recipient_result_schema: resultSchema,
      metadata: { product: "actionbridge", workflow: "service-coordination" },
    }),
  });

  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    return NextResponse.json({ error: data?.error?.message || data?.message || "CALL-E rejected the call request.", upstreamStatus: upstream.status }, { status: 502 });
  }

  return NextResponse.json({ callId: data.call_id || data.id, status: data.status || "created", ...data }, { status: 201 });
}
