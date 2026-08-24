"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type CallResponse = {
  callId?: string;
  status?: string;
  taskCompleted?: boolean;
  completionConfidence?: unknown;
  structuredResult?: unknown;
  evidence?: unknown;
  error?: string;
};

const terminalStatuses = new Set(["completed", "failed", "cancelled", "canceled", "error"]);

export default function Home() {
  const [goal, setGoal] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("IN");
  const [locale, setLocale] = useState("en-IN");
  const [approved, setApproved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CallResponse | null>(null);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (pollTimer.current) clearTimeout(pollTimer.current);
  }, []);

  async function readStatus(callId: string, attempt = 0) {
    try {
      const response = await fetch(`/api/calls/${encodeURIComponent(callId)}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to read call status.");
      setResult((current) => ({ ...current, ...data, callId }));
      const status = typeof data.status === "string" ? data.status.toLowerCase() : "";
      if (!terminalStatuses.has(status) && !data.taskCompleted && attempt < 30) {
        pollTimer.current = setTimeout(() => readStatus(callId, attempt + 1), 2000);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setResult((current) => ({
        ...current,
        callId,
        error: error instanceof Error ? error.message : "Unable to read call status.",
      }));
      setLoading(false);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setResult(null);
    setLoading(true);
    try {
      const response = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, phone, region, locale, approved }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The call could not be started.");
      setResult(data);
      if (data.callId) await readStatus(data.callId);
      else setLoading(false);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Unexpected error" });
      setLoading(false);
    }
  }

  function clearForm() {
    if (pollTimer.current) clearTimeout(pollTimer.current);
    setGoal("");
    setPhone("");
    setResult(null);
    setApproved(false);
    setLoading(false);
  }

  const status = result?.status || (loading ? "starting" : "idle");
  const completed = result?.taskCompleted === true || status.toLowerCase() === "completed";

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand"><span className="mark" /><span>ActionBridge</span></div>
        <div className="status">CALL-E / LIVE ACTION LAYER</div>
      </header>

      <section className="hero">
        <div className="eyebrow">phone work, orchestrated</div>
        <h1>Turn intention into real-world action.</h1>
        <p className="lead">ActionBridge turns a real-world goal into a controlled phone workflow. It plans the outreach, executes the call through CALL-E, captures structured evidence, and keeps consequential actions behind explicit human approval.</p>
      </section>

      <section className="grid">
        <form className="panel" onSubmit={submit}>
          <div className="kicker">01 / define the task</div>
          <h2>What needs to get done?</h2>
          <label htmlFor="goal">GOAL</label>
          <textarea id="goal" required value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Example: Call this electrician and confirm whether they can visit tomorrow morning, their earliest arrival time, and the total price." />
          <label htmlFor="phone">RECIPIENT PHONE / E.164</label>
          <input id="phone" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+919876543210" inputMode="tel" autoComplete="tel" />
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label htmlFor="region">REGION</label><input id="region" value={region} onChange={(e) => setRegion(e.target.value.toUpperCase())} maxLength={2} /></div>
            <div><label htmlFor="locale">LANGUAGE / LOCALE</label><input id="locale" value={locale} onChange={(e) => setLocale(e.target.value)} /></div>
          </div>
          <div className="notice">Real calls are consequential. ActionBridge requires explicit authorization, keeps the CALL-E credential server-side, and instructs the agent to identify itself as AI.</div>
          <label style={{display:"flex",gap:10,alignItems:"center",cursor:"pointer",fontFamily:"inherit",fontSize:13}}><input type="checkbox" checked={approved} onChange={(e) => setApproved(e.target.checked)} style={{width:17,height:17,accentColor:"#b9f36b"}} /> I authorize this specific phone call.</label>
          <div className="actions"><button className="primary" disabled={!approved || loading}>{loading ? "Running phone task…" : "Authorize & call"}</button><button type="button" className="secondary" onClick={clearForm}>Clear</button></div>
          {result && <div className="result"><div className="kicker">LIVE CALL STATUS · {status}</div>{result.error ? <p className="error">{result.error}</p> : <><div className="result-grid"><span>call id</span><strong>{result.callId || "—"}</strong><span>completion</span><strong>{completed ? "verified" : "in progress"}</strong><span>confidence</span><strong>{String(result.completionConfidence ?? "pending")}</strong></div><pre>{JSON.stringify({ structuredResult: result.structuredResult, evidence: result.evidence }, null, 2)}</pre></>}</div>}
        </form>

        <aside className="panel">
          <div className="kicker">02 / execution model</div>
          <h2>Evidence before action.</h2>
          <div className="flow">
            <div className="step"><div className="num">1</div><div><strong>Understand</strong><span>Capture the goal, recipient and success criteria.</span></div></div>
            <div className="step"><div className="num">2</div><div><strong>Plan</strong><span>Prepare the phone task and structured result contract.</span></div></div>
            <div className="step"><div className="num">3</div><div><strong>Call</strong><span>CALL-E performs the live conversation and adapts in real time.</span></div></div>
            <div className="step"><div className="num">4</div><div><strong>Verify</strong><span>Poll the call until completion and surface evidence and confidence.</span></div></div>
            <div className="step"><div className="num">5</div><div><strong>Decide</strong><span>Keep consequential next actions behind explicit human approval.</span></div></div>
          </div>
          <div className="notice"><strong>Built for real work.</strong><br/>The product is not a voice-bot wrapper. ActionBridge turns an ambiguous real-world intention into a bounded phone task, then returns a machine-readable result that a person can verify and act on.</div>
        </aside>
      </section>
      <div className="footer">ACTIONBRIDGE / PRODUCTION-READY MVP · EXPLICIT AUTHORIZATION · SERVER-SIDE SECRETS · LIVE STATUS VERIFICATION</div>
    </main>
  );
}
