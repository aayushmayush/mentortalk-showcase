"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ═══════════════════════════════════════════
   TYPES & CONFIG
═══════════════════════════════════════════ */

interface Chapter {
  type: "title" | "single" | "text" | "dual" | "end";
  label?: string;
  title?: string;
  description?: string;
  menteeRange?: [number, number];
  mentorRange?: [number, number];
  playbackRate?: number;
  autoAdvanceMs?: number;
}

const CHAPTERS: Chapter[] = [
  {
    type: "title",
    autoAdvanceMs: 3500,
  },
  {
    type: "single",
    label: "01",
    title: "It starts with a tap.",
    description:
      "A real-time mentorship platform that connects students with expert mentors — through chat, audio, and video.",
    menteeRange: [0, 1.5],
    playbackRate: 1,
  },
  {
    type: "single",
    label: "02",
    title: "Load your wallet.",
    description:
      "Top up in seconds. No subscriptions — pay per minute of mentorship you actually use.",
    menteeRange: [2, 51],
    playbackRate: 2,
  },
  {
    type: "single",
    label: "03",
    title: "Find the right mentor.",
    description:
      "Browse verified mentors. See ratings, experience, per-minute rates. Connect instantly.",
    menteeRange: [52, 58],
    playbackRate: 1,
  },
  {
    type: "text",
    title: "Two sides. One session.",
    description: "Same conversation. Perfectly synchronized.",
  },
  {
    type: "dual",
    label: "04",
    menteeRange: [59, 192],
    mentorRange: [0, 133],
    playbackRate: 1.5,
  },
  {
    type: "end",
  },
];

const stats = [
  { num: "2", label: "Production Apps" },
  { num: "3", label: "Communication Modes" },
  { num: "20+", label: "Cloud Services" },
  { num: "1", label: "Developer" },
];

const features = [
  { icon: "💬", title: "Real-time chat", desc: "Instant messaging with typing indicators, delivery ticks, and read receipts." },
  { icon: "📹", title: "Audio & video calls", desc: "Switch between chat, voice, and video mid-session without disconnecting." },
  { icon: "💳", title: "Per-minute billing", desc: "Automatic billing, wallet management, platform fees, and mentor payouts." },
  { icon: "🔔", title: "Push notifications", desc: "Instant alerts for sessions and messages — even when the app is closed." },
  { icon: "🛡️", title: "Verified mentors", desc: "Multi-step KYC with identity verification and admin approval pipeline." },
  { icon: "☁️", title: "Serverless backend", desc: "20+ cloud functions that scale automatically and cost nearly nothing at rest." },
];

const processSteps = [
  { num: "01", title: "We talk", desc: "A quick call to understand your idea and what done looks like." },
  { num: "02", title: "I plan it", desc: "Clear milestones with timelines. You know what you're getting and when." },
  { num: "03", title: "I build weekly", desc: "Working features every week on your phone — not mockups." },
  { num: "04", title: "We launch", desc: "App Store submission, deployment, and post-launch support." },
];

/* ═══════════════════════════════════════════
   IPHONE
═══════════════════════════════════════════ */

function IPhone({
  videoRef,
  src,
  small = false,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  src: string;
  small?: boolean;
}) {
  return (
    <div className={`phone-glow ${small ? "iphone iphone-sm" : "iphone"}`}>
      <div className="iphone-screen">
        <div className="iphone-notch" />
        <div className="iphone-home" />
        <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          preload="auto"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN
═══════════════════════════════════════════ */

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);

  const menteeRef = useRef<HTMLVideoElement>(null);
  const menteeRef2 = useRef<HTMLVideoElement>(null);
  const mentorRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    [menteeRef, menteeRef2, mentorRef].forEach((r) => {
      if (r.current) r.current.pause();
    });
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const next = useCallback(() => {
    if (current >= CHAPTERS.length - 1) return;
    cleanup();
    setProgress(0);
    setCurrent((c) => c + 1);
  }, [current, cleanup]);

  /* ─── Chapter logic ─── */
  useEffect(() => {
    const ch = CHAPTERS[current];
    setProgress(0);

    // Title: auto-advance
    if (ch.type === "title" && ch.autoAdvanceMs) {
      const total = ch.autoAdvanceMs;
      const t0 = Date.now();
      const tick = () => {
        const p = Math.min((Date.now() - t0) / total, 1);
        setProgress(p);
        if (p < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      timerRef.current = setTimeout(next, total);
      return cleanup;
    }

    // Text: wait for click
    if (ch.type === "text") return;

    // Single phone
    if (ch.type === "single" && ch.menteeRange) {
      const v = menteeRef.current;
      if (!v) return;
      const [s, e] = ch.menteeRange;
      const rate = ch.playbackRate || 1;
      v.currentTime = s;
      v.playbackRate = rate;
      v.play().catch(() => {});

      const tick = () => {
        const p = Math.min((v.currentTime - s) / (e - s), 1);
        setProgress(p);
        if (v.currentTime >= e - 0.05) { v.pause(); next(); return; }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      timerRef.current = setTimeout(next, ((e - s) / rate) * 1000 + 2000);
      return () => { v.pause(); cleanup(); };
    }

    // Dual phones
    if (ch.type === "dual" && ch.menteeRange && ch.mentorRange) {
      const v1 = menteeRef2.current;
      const v2 = mentorRef.current;
      if (!v1 || !v2) return;
      const [ms, me] = ch.menteeRange;
      const [ts] = ch.mentorRange;
      const rate = ch.playbackRate || 1;

      v1.currentTime = ms;
      v2.currentTime = ts;
      v1.playbackRate = rate;
      v2.playbackRate = rate;
      v1.play().catch(() => {});
      v2.play().catch(() => {});

      const tick = () => {
        const p = Math.min((v1.currentTime - ms) / (me - ms), 1);
        setProgress(p);
        if (v1.currentTime >= me - 0.05) { v1.pause(); v2.pause(); next(); return; }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      timerRef.current = setTimeout(next, ((me - ms) / rate) * 1000 + 2000);
      return () => { v1.pause(); v2.pause(); cleanup(); };
    }
  }, [current, next, cleanup]);

  /* ─── Keyboard ─── */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowRight" || e.code === "Enter") {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [next]);

  const ch = CHAPTERS[current];
  const isEnd = ch.type === "end";

  /* ═══ JSX ═══ */
  return (
    <main style={{ background: "#050505", color: "#f0f0f2", width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>

      {/* Top dots */}
      {!isEnd && (
        <div className="ch-dots">
          {CHAPTERS.slice(0, -1).map((_, i) => (
            <div key={i} className={`ch-dot ${i < current ? "ch-dot-done" : ""}`}>
              {i === current && <div className="ch-dot-fill" style={{ width: `${progress * 100}%` }} />}
            </div>
          ))}
        </div>
      )}

      {/* Skip */}
      {!isEnd && current > 0 && (
        <button className="skip-btn" onClick={next}>Skip →</button>
      )}

      {/* ══════ CH 0: TITLE ══════ */}
      <div className={`chapter ${current === 0 ? "active" : ""}`}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(139,92,246,0.04) 0%, transparent 55%)", pointerEvents: "none" }} />
        {current === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <p className="anim-fiu d1" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: "0.35em", textTransform: "uppercase", color: "#555" }}>
              Case Study
            </p>
            <h1 className="anim-fiu d2" style={{ fontFamily: '"Instrument Serif", serif', fontSize: "clamp(4rem, 10vw, 8rem)", fontWeight: 400, lineHeight: 0.95, letterSpacing: -2, marginTop: 20 }}>
              MentorTalk
            </h1>
            <p className="anim-fiu d3" style={{ color: "#777", fontSize: 18, marginTop: 24, maxWidth: 460, lineHeight: 1.7 }}>
              Real-time mentorship. Two apps. Live chat, audio &amp; video. Per-minute billing. Built&nbsp;solo.
            </p>
          </div>
        )}
      </div>

      {/* ══════ CH 1–3: SINGLE PHONE ══════ */}
      {[1, 2, 3].map((idx) => (
        <div className={`chapter ${current === idx ? "active" : ""}`} key={idx}>
          {current === idx && (
            <div className="ch-label">
              <span className="anim-fi d1">{CHAPTERS[idx].label}</span>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", width: "100%", height: "100%", padding: "0 24px" }}>
            {/* Left text */}
            <div style={{ width: "42%", display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: "clamp(40px, 5vw, 96px)", paddingRight: 32 }}>
              {current === idx && (
                <>
                  <h2 className="anim-fiu d2" style={{ fontFamily: '"Instrument Serif", serif', fontSize: "clamp(28px, 3.5vw, 46px)", fontWeight: 400, lineHeight: 1.1, letterSpacing: -0.5 }}>
                    {CHAPTERS[idx].title}
                  </h2>
                  <p className="anim-fiu d3" style={{ color: "#777", fontSize: 15, lineHeight: 1.75, marginTop: 20, maxWidth: 340 }}>
                    {CHAPTERS[idx].description}
                  </p>
                </>
              )}
            </div>
            {/* Right phone */}
            <div style={{ width: "58%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {current === idx && (
                <div className="anim-si d1">
                  <IPhone videoRef={menteeRef} src="/mentee.mp4" />
                </div>
              )}
            </div>
          </div>

          {current === idx && (
            <div className="ch-progress">
              <div className="ch-progress-fill" style={{ width: `${progress * 100}%` }} />
            </div>
          )}
        </div>
      ))}

      {/* ══════ CH 4: TRANSITION TEXT ══════ */}
      <div
        className={`chapter ${current === 4 ? "active" : ""}`}
        onClick={current === 4 ? next : undefined}
        style={{ cursor: current === 4 ? "pointer" : "default" }}
      >
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(139,92,246,0.035) 0%, transparent 50%)", pointerEvents: "none" }} />
        {current === 4 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <p className="anim-fiu d1" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(167, 139, 250, 0.5)", marginBottom: 16 }}>
              Real-time sync
            </p>
            <h2 className="anim-fiu d2" style={{ fontFamily: '"Instrument Serif", serif', fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 400, letterSpacing: -1 }}>
              Two sides. One session.
            </h2>
            <p className="anim-fiu d3" style={{ color: "#555", marginTop: 20, fontSize: 17, maxWidth: 400, lineHeight: 1.7 }}>
              Same conversation. Perfectly synchronized.
            </p>
            <p className="anim-fiu d4 breathe" style={{ color: "rgba(167, 139, 250, 0.7)", marginTop: 48, fontSize: 14, fontWeight: 500 }}>
              ↓ Click anywhere to continue
            </p>
          </div>
        )}
      </div>

      {/* ══════ CH 5: DUAL PHONES ══════ */}
      <div className={`chapter ${current === 5 ? "active" : ""}`}>
        {current === 5 && (
          <div className="ch-label">
            <span className="anim-fi d1">{CHAPTERS[5].label}</span>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, height: "100%" }}>
          {current === 5 && (
            <>
              {/* Live indicator */}
              <div className="anim-fi d1" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ height: 1, width: 32, background: "linear-gradient(to right, transparent, rgba(255,255,255,0.1))" }} />
                <span className="sync-dot" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#555" }}>
                  Live
                </span>
                <div style={{ height: 1, width: 32, background: "linear-gradient(to left, transparent, rgba(255,255,255,0.1))" }} />
              </div>

              {/* Two phones */}
              <div className="anim-si d2" style={{ display: "flex", alignItems: "flex-start", gap: "clamp(24px, 4vw, 48px)" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                  <IPhone videoRef={menteeRef2} src="/mentee.mp4" small />
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "#444" }}>
                    Mentee
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                  <IPhone videoRef={mentorRef} src="/mentor.mp4" small />
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "#444" }}>
                    Mentor
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {current === 5 && (
          <div className="ch-progress">
            <div className="ch-progress-fill" style={{ width: `${progress * 100}%` }} />
          </div>
        )}
      </div>

      {/* ══════ CH 6: END ══════ */}
      <div className={`chapter ${current === 6 ? "active" : ""}`}>
        <div className="end-scroll" style={{ width: "100%", height: "100%", padding: "0 24px" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            {current === 6 && (
              <>
                {/* Hero */}
                <div className="anim-fiu d1" style={{ textAlign: "center", padding: "80px 0 60px" }}>
                  <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 400, letterSpacing: -1 }}>
                    That&apos;s MentorTalk.
                  </h2>
                  <p style={{ color: "#666", fontSize: 17, marginTop: 14, maxWidth: 440, lineHeight: 1.7, margin: "14px auto 0" }}>
                    Two complete apps, a real-time backend, and a billing engine — designed and built solo.
                  </p>
                </div>

                {/* Stats */}
                <div className="anim-fiu d2" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 64 }}>
                  {stats.map((s) => (
                    <div key={s.label} style={{ background: "#0a0a0c", border: "1px solid #141418", borderRadius: 16, padding: "32px 16px", textAlign: "center" }}>
                      <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 40 }}>{s.num}</div>
                      <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Features heading */}
                <div className="anim-fiu d3" style={{ textAlign: "center", marginBottom: 40 }}>
                  <h3 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 32, fontWeight: 400 }}>
                    What&apos;s inside
                  </h3>
                  <p style={{ color: "#555", marginTop: 10, fontSize: 15 }}>
                    Everything both apps include.
                  </p>
                </div>

                {/* Feature cards */}
                <div className="anim-fiu d4" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 64 }}>
                  {features.map((f) => (
                    <div key={f.title} className="feat-card" style={{ background: "#0a0a0c", border: "1px solid #141418", borderRadius: 16, padding: 28 }}>
                      <div style={{ fontSize: 24, marginBottom: 14 }}>{f.icon}</div>
                      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{f.title}</div>
                      <div style={{ fontSize: 13, color: "#666", lineHeight: 1.65 }}>{f.desc}</div>
                    </div>
                  ))}
                </div>

                {/* Process heading */}
                <div className="anim-fiu d5" style={{ textAlign: "center", marginBottom: 40 }}>
                  <h3 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 32, fontWeight: 400 }}>
                    How I work
                  </h3>
                  <p style={{ color: "#555", marginTop: 10, fontSize: 15 }}>
                    What it looks like when you hire me.
                  </p>
                </div>

                {/* Process cards */}
                <div className="anim-fiu d5" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 64 }}>
                  {processSteps.map((p) => (
                    <div key={p.num} style={{ background: "#0a0a0c", border: "1px solid #141418", borderRadius: 16, padding: 28 }}>
                      <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 32, color: "rgba(139, 92, 246, 0.3)", marginBottom: 12 }}>{p.num}</div>
                      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{p.title}</div>
                      <div style={{ fontSize: 13, color: "#666", lineHeight: 1.65 }}>{p.desc}</div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ borderTop: "1px solid #141418", padding: "40px 0 60px", textAlign: "center" }}>
                  <p style={{ color: "#333", fontSize: 13 }}>
                    Built with Flutter + AWS · Designed &amp; developed solo
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}