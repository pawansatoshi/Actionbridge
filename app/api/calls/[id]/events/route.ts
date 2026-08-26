import { NextResponse } from "next/server";
import { calleRequest } from "@/lib/calle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^call_[A-Za-z0-9_-]+$/.test(id)) {
    return NextResponse.json({ error: "Invalid CALL-E call id." }, { status: 400 });
  }

  try {
    const r = await calleRequest(`/v1/calls/${encodeURIComponent(id)}/events?limit=100`);
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return NextResponse.json({ error: data?.error?.message || data?.message || "Unable to read call events." }, { status: r.status });
    }

    const events = Array.isArray(data?.data)
      ? data.data.map((event: any) => ({ ...event, timestamp: event?.timestamp ?? event?.created_at }))
      : [];

    return NextResponse.json(
      { events, nextCursor: data?.next_cursor ?? null },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "Unable to reach CALL-E." }, { status: 502 });
  }
}
