import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const bodyId = typeof (payload as any).id === "string" ? (payload as any).id : null;
  const headerId = request.headers.get("CALL-E-Event-Id");
  if (!bodyId || !headerId || bodyId !== headerId) {
    return NextResponse.json({ error: "Webhook event id does not match the CALL-E-Event-Id header." }, { status: 401 });
  }

  console.log(
    "ActionBridge CALL-E webhook",
    JSON.stringify({
      event_id: bodyId,
      call_id: (payload as any).call_id || null,
      status: (payload as any).status,
      event: (payload as any).event || (payload as any).type,
    }),
  );

  return NextResponse.json({ received: true, eventId: bodyId });
}
