"use client";

import { FormEvent, useState } from "react";

type CallResponse = {
  callId?: string;
  status?: string;
  taskCompleted?: boolean;
  completionConfidence?: unknown;
  structuredResult?: unknown;
  evidence?: unknown;
  error?: string;
};

export default function Home() {
  const [goal, setGoal] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("IN");
  const [locale, setLocale] = useState("en-IN");
  const [approved, setApproved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CallResponse | null>(null);

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
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Unexpected error" });
    } finally {
      setLoading(false);
    }
  }

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
          <input id="phone" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+919876543210" inputMode="tel" />
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label htmlFor="region">REGION</label><input id="region" value={region} onChange={(e) => setRegion(e.target.value.toUpperCase())} maxLength={2} /></div>
            <div><label htmlFor="locale">LANGUAGE / LOCALE</label><input id="locale" value={locale} onChange={(e) => setLocale(e.target.value)} /></div>
          </div>
          <div className="notice">ActionBridge will not place a real call until you explicitly authorize this task. CALL-E can make real outbound calls; verify the recipient, goal and intent before continuing.</div>
          <label style={{display:"flex",gap:10,alignItems:"center",cursor:"pointer",fontFamily:"inherit",fontSize:13}}><input type="checkbox" checked={approved} onChange={(e) => setApproved(e.target.checked)} style={{width:17,height:17,accentColor:"#b9f36b"}} /> I authorize this specific phone call.</label>
          <div className="actions"><button className="primary" disabled={!approved || loading}>{loading ? "Starting call…" : "Authorize & call"}</button><button type="button" className="secondary" onClick={() => {setGoal("");setPhone("");setResult(null);setApproved(false)}}>Clear</button></div>
          {result && <div className="result"><div className="kicker">CALL-E RESULT</div>{result.error ? <p className="error">{result.error}</p> : <pre>{JSON.stringify(result, null, 2)}</pre>}</div>}
        </form>

        <aside className="panel">
          <div className="kicker">02 / execution model</div>
          <h2>Evidence before action.</h2>
          <div className="flow">
            <div className="step"><div className="num">1</div><div><strong>Understand</strong><span>Capture the goal, recipient and success criteria.</span></div></div>
            <div className="step"><div className="num">2</div><div><strong>Plan</strong><span>Prepare the phone task and structured result schema.</span></div></div>
            <div className="step"><div className="num">3</div><div><strong>Call</strong><span>CALL-E handles the live conversation and adaptation.</span></div></div>
            <div className="step"><div className="num">4</div><div><strong>Verify</strong><span>Return structured results, evidence and confidence.</span></div></div>
            <div className="step"><div className="num">5</div><div><strong>Decide</strong><span>Keep consequential next actions behind human approval.</span></div></div>
          </div>
          <div className="notice"><strong>Why CALL-E?</strong><br/>The product is not another voice bot. CALL-E is the execution layer that lets ActionBridge cross the boundary from digital intent into a real phone conversation.</div>
        </aside>
      </section>
      <div className="footer">ACTIONBRIDGE / MVP · REAL CALLS REQUIRE EXPLICIT AUTHORIZATION · SECRETS STAY SERVER-SIDE</div>
    </main>
  );
}
