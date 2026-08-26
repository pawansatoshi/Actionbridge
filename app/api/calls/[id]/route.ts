import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE_URL = process.env.CALLE_BASE_URL || "https://api.heycall-e.com";

function normalize(data: any) {
  const recipientResults = Array.isArray(data?.recipients)
    ? data.recipients.map((r: any) => r?.structured_result ?? r?.structuredResult).filter(Boolean)
    : [];

  return {
    ...data,
    callId: data?.callId ?? data?.call_id ?? data?.id,
    taskCompleted: data?.taskCompleted ?? data?.task_completed,
    completionConfidence: data?.completionConfidence ?? data?.completion_confidence,
    structuredResult: data?.structuredResult ?? data?.structured_result ?? (recipientResults.length ? { recipients: recipientResults } : undefined),
    evidence: data?.evidence ?? data?.evidence_items,
  };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!process.env.CALLE_API_KEY) {
    return NextResponse.json({ error: "CALL-E is not configured." }, { status: 503 });
  }

  const { id } = await params;
  if (!/^call_[A-Za-z0-9_-]+$/.test(id)) {
    return NextResponse.json({ error: "Invalid CALL-E call id." }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${BASE_URL}/v1/calls/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${process.env.CALLE_API_KEY}` },
      cache: "no-store",
    });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return NextResponse.json({ error: data?.error?.message || data?.message || "Unable to read call status." }, { status: upstream.status });
    }
    return NextResponse.json(normalize(data), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Unable to reach CALL-E." }, { status: 502 });
  }
}
