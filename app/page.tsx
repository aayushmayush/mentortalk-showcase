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
  { type: "title", autoAdvanceMs: 3800 },
  { type: "single", label: "01", title: "It starts with a tap.", description: "A real-time mentorship platform that connects students with expert mentors — through chat, audio, and video.", menteeRange: [0, 1.5], playbackRate: 1 },
  { type: "single", label: "02", title: "Load your wallet.", description: "Top up in seconds. No subscriptions — pay per minute of mentorship you actually use.", menteeRange: [2, 51], playbackRate: 4 },
  { type: "single", label: "03", title: "Find the right mentor.", description: "Browse verified mentors. See ratings, experience, per-minute rates. Connect instantly.", menteeRange: [52, 58], playbackRate: 1 },
  { type: "text", title: "Two sides. One session.", description: "Same conversation. Perfectly synchronized." },
  { type: "dual", label: "04", menteeRange: [59, 192], mentorRange: [0, 133], playbackRate: 3 },
  { type: "end" },
];

const SINGLE_CHAPTERS = [1, 2, 3];

const stats = [
  { num: "2", label: "Production Apps" },
  { num: "3", label: "Live Comm Modes" },
  { num: "20+", label: "Cloud Services" },
  { num: "2", label: "Developers" },
  { num: "1", label: "Designer" },
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
  { num: "02", title: "We plan it", desc: "Clear milestones with timelines. You know what you're getting and when." },
  { num: "03", title: "We build weekly", desc: "Working features every week on your phone — not mockups." },
  { num: "04", title: "We launch", desc: "App Store submission, deployment, and post-launch support." },
];

/* Base phone dimensions */
const PW = 270, PH = 552;   /* single phone */
const DW = 240, DH = 490;   /* dual phone */

/* ═══════════════════════════════════════════
   usePhoneScale — calculates exact scale
   for any viewport, no CSS media queries
═══════════════════════════════════════════ */

function usePhoneScale() {
  const [scales, setScales] = useState({ ps: 1, ds: 1, mobile: false });

  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mobile = vw <= 768;

      const safeTop = mobile ? 36 : 56;
      const safeBot = mobile ? 56 : 72;

      /* ── Single phone ── */
      let ps: number;
      if (mobile) {
        // Stacked: text above phone — reserve generously for text + gaps + shadow
        const availH = vh - safeTop - safeBot - 180;
        const availW = vw - 48;
        ps = Math.min(availH / PH, availW / PW, 1);
      } else {
        // Side by side: generous vertical margin
        const availH = vh - safeTop - safeBot - 80;
        const availW = vw * 0.5 - 60;
        ps = Math.min(availH / PH, availW / PW, 1);
      }

      /* ── Dual phones ── */
      const dualAvailH = vh - safeTop - safeBot - 100; // badge + labels + shadow margin
      const dualGap = mobile ? 16 : 48;
      const dualAvailW = vw - 56;
      const dsH = dualAvailH / DH;
      const dsW = dualAvailW / (DW * 2 + dualGap);
      const ds = Math.min(dsH, dsW, 1);

      setScales({
        ps: Math.max(0.35, ps),
        ds: Math.max(0.35, ds),
        mobile,
      });
    };

    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  return scales;
}

/* ═══════════════════════════════════════════
   PARTICLES
═══════════════════════════════════════════ */

function Particles() {
  const [items, setItems] = useState<Array<{
    id: number; left: string; delay: string; duration: string; size: number; opacity: number;
  }>>([]);

  useEffect(() => {
    setItems(Array.from({ length: 16 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 8}s`,
      duration: `${8 + Math.random() * 12}s`,
      size: 1.5 + Math.random() * 2,
      opacity: 0.15 + Math.random() * 0.25,
    })));
  }, []);

  if (!items.length) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
      {items.map((p) => (
        <div key={p.id} className="particle" style={{ left: p.left, bottom: "-10px", width: p.size, height: p.size, opacity: p.opacity, animationDelay: p.delay, animationDuration: p.duration }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN
═══════════════════════════════════════════ */

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const { ps, ds, mobile } = usePhoneScale();

  const menteeRef = useRef<HTMLVideoElement>(null);
  const menteeRef2 = useRef<HTMLVideoElement>(null);
  const mentorRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  const isSingle = SINGLE_CHAPTERS.includes(current);
  const isDual = current === 5;
  const isEnd = current === 6;

  const cleanup = useCallback(() => {
    [menteeRef, menteeRef2, mentorRef].forEach((r) => { if (r.current) r.current.pause(); });
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const next = useCallback(() => {
    if (current >= CHAPTERS.length - 1) return;
    cleanup(); setProgress(0); setCurrent((c) => c + 1);
  }, [current, cleanup]);

  const restart = useCallback(() => {
    cleanup(); setProgress(0); setCurrent(0);
  }, [cleanup]);

  /* ─── Chapter playback ─── */
  useEffect(() => {
    const ch = CHAPTERS[current];
    setProgress(0);

    if (ch.type === "title" && ch.autoAdvanceMs) {
      const total = ch.autoAdvanceMs, t0 = Date.now();
      const tick = () => { const p = Math.min((Date.now() - t0) / total, 1); setProgress(p); if (p < 1) rafRef.current = requestAnimationFrame(tick); };
      rafRef.current = requestAnimationFrame(tick);
      timerRef.current = setTimeout(next, total);
      return cleanup;
    }
    if (ch.type === "text" || ch.type === "end") return;

    if (ch.type === "single" && ch.menteeRange) {
      const v = menteeRef.current; if (!v) return;
      const [s, e] = ch.menteeRange, rate = ch.playbackRate || 1;
      v.currentTime = s; v.playbackRate = rate; v.play().catch(() => {});
      const tick = () => { setProgress(Math.min((v.currentTime - s) / (e - s), 1)); if (v.currentTime >= e - 0.05) { v.pause(); next(); return; } rafRef.current = requestAnimationFrame(tick); };
      rafRef.current = requestAnimationFrame(tick);
      timerRef.current = setTimeout(next, ((e - s) / rate) * 1000 + 2000);
      return () => { v.pause(); cleanup(); };
    }

    if (ch.type === "dual" && ch.menteeRange && ch.mentorRange) {
      const v1 = menteeRef2.current, v2 = mentorRef.current; if (!v1 || !v2) return;
      const [ms, me] = ch.menteeRange, [ts] = ch.mentorRange, rate = ch.playbackRate || 1;
      v1.currentTime = ms; v2.currentTime = ts; v1.playbackRate = rate; v2.playbackRate = rate;
      v1.play().catch(() => {}); v2.play().catch(() => {});
      const tick = () => { setProgress(Math.min((v1.currentTime - ms) / (me - ms), 1)); if (v1.currentTime >= me - 0.05) { v1.pause(); v2.pause(); next(); return; } rafRef.current = requestAnimationFrame(tick); };
      rafRef.current = requestAnimationFrame(tick);
      timerRef.current = setTimeout(next, ((me - ms) / rate) * 1000 + 2000);
      return () => { v1.pause(); v2.pause(); cleanup(); };
    }
  }, [current, next, cleanup]);

  /* ─── Keyboard ─── */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.code === "Space" || e.code === "ArrowRight" || e.code === "Enter") { e.preventDefault(); next(); } };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [next]);

  /* ─── Style shorthands ─── */
  const M = '"JetBrains Mono", monospace';
  const S = '"Instrument Serif", serif';
  const sub = "rgba(255,255,255,0.45)";
  const acc = "rgba(167,139,250,";

  /* Computed sizer boxes — layout reserves exactly the scaled dimensions */
  const singleSizer = { width: PW * ps, height: PH * ps, flexShrink: 0 };
  const dualSizer = { width: DW * ds, height: DH * ds, flexShrink: 0 };

  return (
    <main className="grain" style={{ background: "#050508", color: "#f0f0f2", width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
      <Particles />

      {/* Dots */}
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
        <button className="skip-btn" onClick={next}>
          Skip <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      )}

      {/* ════════════ CH 0: TITLE ════════════ */}
      <div className={`chapter ${current === 0 ? "active" : ""}`}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: "60vw", height: "60vh", background: "radial-gradient(ellipse, rgba(139,92,246,0.06), transparent 65%)", filter: "blur(40px)" }} />
        </div>
        {current === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 24px", zIndex: 2, position: "relative" }}>
            <p className="anim-fiu d1" style={{ fontFamily: M, fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", color: `${acc}0.55)` }}>Case Study</p>
            <h1 className="anim-fiu d2" style={{ fontFamily: S, fontSize: "clamp(2.8rem, 10vw, 8rem)", fontWeight: 400, lineHeight: 0.92, letterSpacing: -3, marginTop: 20 }}>MentorTalk</h1>
            <p className="anim-fiu d3" style={{ color: sub, fontSize: "clamp(13px, 2vw, 18px)", marginTop: 20, maxWidth: 480, lineHeight: 1.8 }}>
              Real-time mentorship. Two apps. Live chat, audio &amp; video. Per-minute billing. Built by a team of&nbsp;three.
            </p>
          </div>
        )}
      </div>

      {/* ════════════ CH 1–3: SINGLE PHONE ════════════ */}
      <div style={{
        position: "absolute", inset: 0,
        opacity: isSingle ? 1 : 0,
        pointerEvents: isSingle ? "auto" : "none",
        transition: "opacity 1s cubic-bezier(0.16,1,0.3,1)",
      }}>
        {isSingle && (
          <div className="ch-label">
            <span key={current} className="anim-fi d1">{CHAPTERS[current].label}</span>
          </div>
        )}

        {/* Layout container with safe zones */}
        <div style={{
          display: "flex",
          flexDirection: mobile ? "column" : "row",
          alignItems: "center",
          justifyContent: "center",
          width: "100%", height: "100%",
          padding: mobile ? "48px 16px 56px" : "56px 24px 72px",
          gap: mobile ? 10 : 0,
        }}>
          {/* Text */}
          <div style={{
            flex: mobile ? "0 0 auto" : "1 1 300px",
            maxWidth: mobile ? "100%" : 420,
            position: "relative",
            minHeight: mobile ? 90 : 160,
            height: mobile ? "auto" : "50%",
            display: "flex",
            alignItems: "center",
            textAlign: mobile ? "center" : "left",
            padding: mobile ? "0 8px" : `0 clamp(20px, 4vw, 64px)`,
          }}>
            {SINGLE_CHAPTERS.map((idx) => (
              <div key={idx} style={{
                position: mobile && current !== idx ? "absolute" : (current === idx ? "relative" : "absolute"),
                inset: current !== idx ? 0 : undefined,
                display: "flex", flexDirection: "column", justifyContent: "center",
                opacity: current === idx ? 1 : 0,
                transform: current === idx ? "translateY(0)" : current > idx ? "translateY(-16px)" : "translateY(16px)",
                filter: current === idx ? "blur(0px)" : "blur(4px)",
                transition: "all 0.7s cubic-bezier(0.16,1,0.3,1)",
                pointerEvents: current === idx ? "auto" : "none",
              }}>
                <h2 style={{ fontFamily: S, fontSize: "clamp(22px, 3.5vw, 46px)", fontWeight: 400, lineHeight: 1.1, letterSpacing: -0.5 }}>
                  {CHAPTERS[idx].title}
                </h2>
                <p style={{ color: sub, fontSize: "clamp(12px, 1.5vw, 15px)", lineHeight: 1.75, marginTop: 12, maxWidth: mobile ? 360 : 340, ...(mobile ? { margin: "12px auto 0" } : {}) }}>
                  {CHAPTERS[idx].description}
                </p>
              </div>
            ))}
          </div>

          {/* Phone sizer — exact scaled dimensions, phone centered inside */}
          <div style={{ ...singleSizer, display: "flex", alignItems: "center", justifyContent: "center", overflow: "visible" }}>
            <div className="phone-glow iphone" style={{ transform: `scale(${ps})`, transformOrigin: "center center" }}>
              <div className="iphone-screen">
                <div className="iphone-home" />
                <video ref={menteeRef} src="/mentee.mp4" muted playsInline preload="auto"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            </div>
          </div>
        </div>

        {isSingle && (
          <div className="ch-progress"><div className="ch-progress-fill" style={{ width: `${progress * 100}%` }} /></div>
        )}
      </div>

      {/* ════════════ CH 4: TRANSITION ════════════ */}
      <div className={`chapter ${current === 4 ? "active" : ""}`}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: "50vw", height: "50vh", background: "radial-gradient(ellipse, rgba(139,92,246,0.05), transparent 60%)", filter: "blur(50px)" }} />
        </div>
        {current === 4 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 24px", zIndex: 2, position: "relative" }}>
            <p className="anim-fiu d1" style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", color: `${acc}0.55)`, marginBottom: 16 }}>Real-time sync</p>
            <h2 className="anim-fiu d2" style={{ fontFamily: S, fontSize: "clamp(26px, 5vw, 64px)", fontWeight: 400, letterSpacing: -1 }}>Two sides. One session.</h2>
            <p className="anim-fiu d3" style={{ color: "rgba(255,255,255,0.4)", marginTop: 14, fontSize: "clamp(13px, 1.8vw, 17px)", maxWidth: 420, lineHeight: 1.7 }}>Same conversation. Perfectly synchronized.</p>
            <div className="anim-fiu d4" style={{ marginTop: "clamp(24px, 4vh, 48px)" }}>
              <button className="continue-btn" onClick={next}>
                Watch it live
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ════════════ CH 5: DUAL PHONES ════════════ */}
      <div style={{
        position: "absolute", inset: 0,
        opacity: isDual ? 1 : 0,
        pointerEvents: isDual ? "auto" : "none",
        transition: "opacity 1s cubic-bezier(0.16,1,0.3,1)",
      }}>
        {isDual && (
          <div className="ch-label"><span className="anim-fi d1">{CHAPTERS[5].label}</span></div>
        )}

        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          width: "100%", height: "100%",
          padding: mobile ? "48px 12px 56px" : "56px 20px 72px",
          gap: 10,
        }}>
          {/* Live badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: isDual ? 1 : 0, transition: "opacity 0.6s 0.15s" }}>
            <div style={{ height: 1, width: 28, background: "linear-gradient(to right, transparent, rgba(139,92,246,0.2))" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div className="sync-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: `${acc}0.7)` }} />
              <span style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: `${acc}0.6)` }}>Live Session</span>
            </div>
            <div style={{ height: 1, width: 28, background: "linear-gradient(to left, transparent, rgba(139,92,246,0.2))" }} />
          </div>

          {/* Two phone sizers side by side */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: mobile ? 12 : 32 }}>
            {/* Mentee */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ ...dualSizer, display: "flex", alignItems: "center", justifyContent: "center", overflow: "visible" }}>
                <div className="phone-glow iphone iphone-sm" style={{ transform: `scale(${ds})`, transformOrigin: "center center" }}>
                  <div className="iphone-screen">
                    <video ref={menteeRef2} src="/mentee.mp4" muted playsInline preload="auto"
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                </div>
              </div>
              <span style={{ fontFamily: M, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: `${acc}0.4)` }}>Mentee</span>
            </div>
            {/* Mentor */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ ...dualSizer, display: "flex", alignItems: "center", justifyContent: "center", overflow: "visible" }}>
                <div className="phone-glow iphone iphone-sm" style={{ transform: `scale(${ds})`, transformOrigin: "center center" }}>
                  <div className="iphone-screen">
                    <video ref={mentorRef} src="/mentor.mp4" muted playsInline preload="auto"
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                </div>
              </div>
              <span style={{ fontFamily: M, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: `${acc}0.4)` }}>Mentor</span>
            </div>
          </div>
        </div>

        {isDual && (
          <div className="ch-progress"><div className="ch-progress-fill" style={{ width: `${progress * 100}%` }} /></div>
        )}
      </div>

      {/* ════════════ CH 6: END ════════════ */}
      <div className={`chapter ${isEnd ? "active" : ""}`}>
        <div className="end-scroll" style={{ width: "100%", height: "100%", padding: "0 20px" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            {isEnd && (
              <>
                {/* Restart */}
                <div className="anim-fiu d1" style={{ display: "flex", justifyContent: "center", paddingTop: "clamp(24px, 4vh, 48px)" }}>
                  <button className="continue-btn" onClick={restart} style={{ animation: "none" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                    Watch again
                  </button>
                </div>

                {/* Hero */}
                <div className="anim-fiu d2" style={{ textAlign: "center", padding: "clamp(20px, 3vh, 48px) 0 clamp(20px, 3vh, 60px)" }}>
                  <h2 style={{ fontFamily: S, fontSize: "clamp(24px, 4vw, 52px)", fontWeight: 400, letterSpacing: -1 }}>That&apos;s MentorTalk.</h2>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "clamp(13px, 1.6vw, 17px)", marginTop: 14, maxWidth: 460, lineHeight: 1.7, margin: "14px auto 0" }}>
                    Two complete apps, a real-time backend, and a billing engine — designed and developed by a team of three.
                  </p>
                </div>

                <div className="anim-fiu d2 stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: "clamp(20px, 3vh, 64px)" }}>
                  {stats.map((s) => (
                    <div key={s.label} style={{ background: "#09090d", border: "1px solid #141419", borderRadius: 14, padding: "clamp(14px, 2vh, 32px) 8px", textAlign: "center" }}>
                      <div style={{ fontFamily: S, fontSize: "clamp(22px, 3vw, 42px)", background: "linear-gradient(135deg, #e0d4fc, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.num}</div>
                      <div style={{ fontSize: "clamp(9px, 1.2vw, 13px)", color: "rgba(255,255,255,0.35)", marginTop: 3 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="anim-fiu d3" style={{ textAlign: "center", marginBottom: "clamp(16px, 2vh, 40px)" }}>
                  <h3 style={{ fontFamily: S, fontSize: "clamp(20px, 3vw, 32px)", fontWeight: 400 }}>What&apos;s inside</h3>
                  <p style={{ color: "rgba(255,255,255,0.3)", marginTop: 8, fontSize: "clamp(11px, 1.4vw, 15px)" }}>Everything both apps include — built end-to-end.</p>
                </div>

                <div className="anim-fiu d4 feat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: "clamp(20px, 3vh, 64px)" }}>
                  {features.map((f) => (
                    <div key={f.title} className="feat-card" style={{ background: "#09090d", border: "1px solid #141419", borderRadius: 14, padding: "clamp(14px, 2vh, 28px)" }}>
                      <div style={{ fontSize: 20, marginBottom: 8 }}>{f.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3, color: "rgba(255,255,255,0.85)" }}>{f.title}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>{f.desc}</div>
                    </div>
                  ))}
                </div>

                <div className="anim-fiu d5" style={{ textAlign: "center", marginBottom: "clamp(16px, 2vh, 40px)" }}>
                  <h3 style={{ fontFamily: S, fontSize: "clamp(20px, 3vw, 32px)", fontWeight: 400 }}>How we work</h3>
                  <p style={{ color: "rgba(255,255,255,0.3)", marginTop: 8, fontSize: "clamp(11px, 1.4vw, 15px)" }}>What it looks like when you hire us.</p>
                </div>

                <div className="anim-fiu d5 proc-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: "clamp(20px, 3vh, 64px)" }}>
                  {processSteps.map((p) => (
                    <div key={p.num} style={{ background: "#09090d", border: "1px solid #141419", borderRadius: 14, padding: "clamp(14px, 2vh, 28px)" }}>
                      <div style={{ fontFamily: S, fontSize: 26, background: "linear-gradient(135deg, rgba(167,139,250,0.4), rgba(139,92,246,0.2))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 6 }}>{p.num}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3, color: "rgba(255,255,255,0.85)" }}>{p.title}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>{p.desc}</div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: "1px solid #141419", padding: "clamp(16px, 3vh, 40px) 0 clamp(24px, 4vh, 60px)", textAlign: "center" }}>
                  <p style={{ color: "rgba(255,255,255,0.18)", fontSize: 13 }}>Built with Flutter + AWS · 2 developers &amp; 1 designer</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}