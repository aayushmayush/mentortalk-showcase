"use client";

import { useEffect, useRef, useState } from "react";

/* ─── Chapter definitions ─── */

interface Chapter {
  id: string;
  label: string;
  title: string;
  description: string;
  menteeTime: [number, number]; // [startSec, endSec]
  scrollVh: number;
}

const chapters: Chapter[] = [
  {
    id: "open",
    label: "01",
    title: "It starts with a tap.",
    description:
      "A real-time mentorship platform that connects students with expert mentors — through chat, audio, and video.",
    menteeTime: [0, 1.5],
    scrollVh: 150,
  },
  {
    id: "wallet",
    label: "02",
    title: "Load your wallet.",
    description:
      "Top up your balance in seconds. No subscriptions, no commitments — just pay per minute of mentorship you use.",
    menteeTime: [2, 51],
    scrollVh: 450,
  },
  {
    id: "discover",
    label: "03",
    title: "Find the right mentor.",
    description:
      "Browse verified mentors by category. See their ratings, experience, and per-minute rates. When you find the right one — connect instantly.",
    menteeTime: [52, 58],
    scrollVh: 200,
  },
];

const DUAL_SCROLL_VH = 700;
const MENTEE_SESSION: [number, number] = [59, 192];
const MENTOR_SESSION: [number, number] = [0, 133];

/* ─── Helpers ─── */

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

/* ─── Stats & features data ─── */

const stats = [
  { num: "2", label: "Production Apps" },
  { num: "3", label: "Communication Modes" },
  { num: "20+", label: "Cloud Services" },
  { num: "1", label: "Developer" },
];

const features = [
  {
    icon: "💬",
    title: "Real-time chat",
    desc: "Instant messaging with typing indicators, delivery ticks, and read receipts.",
  },
  {
    icon: "📹",
    title: "Audio & video calls",
    desc: "Switch between chat, voice, and video mid-session without disconnecting.",
  },
  {
    icon: "💳",
    title: "Per-minute billing",
    desc: "Automatic billing, wallet management, platform fees, and mentor payouts.",
  },
  {
    icon: "🔔",
    title: "Push notifications",
    desc: "Instant alerts for sessions, messages, and updates — even when the app is closed.",
  },
  {
    icon: "🛡️",
    title: "Verified mentors",
    desc: "Multi-step KYC onboarding with identity verification and admin review.",
  },
  {
    icon: "☁️",
    title: "Serverless backend",
    desc: "20+ cloud functions that scale automatically and cost nearly nothing at rest.",
  },
];

const process = [
  {
    num: "01",
    title: "We talk",
    desc: "A quick call to understand your idea, who it's for, and what done looks like.",
  },
  {
    num: "02",
    title: "I plan it",
    desc: "Clear milestones with timelines. You know what you're getting and when.",
  },
  {
    num: "03",
    title: "I build weekly",
    desc: "Working features every week you can test on your phone — not mockups.",
  },
  {
    num: "04",
    title: "We launch",
    desc: "App Store submission, deployment, and making sure everything runs smooth.",
  },
];

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */

export default function Home() {
  /* ─── Refs ─── */
  const menteeVideo1 = useRef<HTMLVideoElement>(null);
  const menteeVideo2 = useRef<HTMLVideoElement>(null);
  const mentorVideo = useRef<HTMLVideoElement>(null);

  const singleRef = useRef<HTMLDivElement>(null);
  const dualRef = useRef<HTMLDivElement>(null);

  /* ─── State ─── */
  const [activeChapter, setActiveChapter] = useState(0);
  const [showDualLabel, setShowDualLabel] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);

  /* ─── Scroll-driven video control ─── */
  useEffect(() => {
    let rafId: number;

    const totalSingleVh = chapters.reduce((s, c) => s + c.scrollVh, 0);

    const update = () => {
      const scrollY = window.scrollY;
      const wh = window.innerHeight;
      const vhPx = wh / 100;

      // Hero visibility
      setHeroVisible(scrollY < wh * 0.5);

      // ── Single phone section ──
      const sEl = singleRef.current;
      if (sEl) {
        const sTop = sEl.offsetTop;
        let accH = 0;

        for (let i = 0; i < chapters.length; i++) {
          const chH = chapters[i].scrollVh * vhPx;
          const chTop = sTop + accH;

          if (scrollY >= chTop && scrollY < chTop + chH) {
            setActiveChapter(i);
            const progress = clamp(
              (scrollY - chTop) / Math.max(chH - wh, 1),
              0,
              1
            );
            const [s, e] = chapters[i].menteeTime;
            const time = s + progress * (e - s);

            const v = menteeVideo1.current;
            if (v && Math.abs(v.currentTime - time) > 0.06) {
              v.currentTime = time;
            }
            break;
          }
          accH += chH;
        }
      }

      // ── Dual phone section ──
      const dEl = dualRef.current;
      if (dEl) {
        const dTop = dEl.offsetTop;
        const dH = dEl.offsetHeight;

        if (scrollY >= dTop && scrollY < dTop + dH) {
          setShowDualLabel(true);
          const progress = clamp(
            (scrollY - dTop) / Math.max(dH - wh, 1),
            0,
            1
          );

          const mTime =
            MENTEE_SESSION[0] +
            progress * (MENTEE_SESSION[1] - MENTEE_SESSION[0]);
          const tTime =
            MENTOR_SESSION[0] +
            progress * (MENTOR_SESSION[1] - MENTOR_SESSION[0]);

          const v1 = menteeVideo2.current;
          const v2 = mentorVideo.current;

          if (v1 && Math.abs(v1.currentTime - mTime) > 0.06) {
            v1.currentTime = mTime;
          }
          if (v2 && Math.abs(v2.currentTime - tTime) > 0.06) {
            v2.currentTime = tTime;
          }
        } else {
          setShowDualLabel(false);
        }
      }

      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const totalSingleVh = chapters.reduce((s, c) => s + c.scrollVh, 0);

  return (
    <main className="bg-black text-white selection:bg-indigo-500/30">
      {/* ═══ PROGRESS DOTS ═══ */}
      <nav
        className={`fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-2 transition-opacity duration-500 ${
          heroVisible ? "opacity-0" : "opacity-100"
        }`}
      >
        {chapters.map((ch, i) => (
          <div
            key={ch.id}
            className={`progress-dot rounded-full ${
              activeChapter === i && !showDualLabel
                ? "w-1.5 h-5 bg-white"
                : "w-1.5 h-1.5 bg-zinc-700"
            }`}
          />
        ))}
        <div
          className={`progress-dot rounded-full ${
            showDualLabel ? "w-1.5 h-5 bg-white" : "w-1.5 h-1.5 bg-zinc-700"
          }`}
        />
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="h-screen flex flex-col items-center justify-center text-center px-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.04)_0%,transparent_60%)]" />

        <p className="text-[11px] tracking-[0.35em] uppercase text-zinc-500 font-mono animate-fade-in animate-delay-1">
          Case Study
        </p>

        <h1 className="font-serif text-[clamp(3rem,8vw,6.5rem)] leading-[0.95] tracking-tight mt-5 animate-fade-in animate-delay-2">
          MentorTalk
        </h1>

        <p className="text-zinc-400 text-lg md:text-xl mt-6 max-w-lg leading-relaxed animate-fade-in animate-delay-3">
          Real-time mentorship. Two apps. Live chat, audio & video.
          Per-minute&nbsp;billing. Built&nbsp;solo.
        </p>

        <div className="absolute bottom-12 flex flex-col items-center gap-2 animate-fade-in animate-delay-4">
          <span className="text-[11px] tracking-[0.2em] uppercase text-zinc-600">
            Scroll to explore
          </span>
          <span className="text-zinc-600 scroll-hint block">↓</span>
        </div>
      </section>

      {/* ═══ ACT 1: SINGLE PHONE STORY ═══ */}
      <section
        ref={singleRef}
        style={{ height: `${totalSingleVh}vh` }}
        className="relative"
      >
        <div className="sticky top-0 h-screen flex items-center">
          {/* Left: Chapter text */}
          <div className="w-[42%] relative h-full flex items-center">
            {chapters.map((ch, i) => (
              <div
                key={ch.id}
                className={`chapter-text absolute inset-0 flex flex-col justify-center pl-10 md:pl-16 lg:pl-24 pr-8 ${
                  activeChapter === i
                    ? "active"
                    : activeChapter > i
                    ? "above"
                    : "below"
                }`}
              >
                <span className="text-[11px] tracking-[0.3em] text-zinc-600 font-mono">
                  {ch.label}
                </span>
                <h2 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] mt-3 leading-[1.1] tracking-tight">
                  {ch.title}
                </h2>
                <p className="text-zinc-400 text-[15px] md:text-base lg:text-lg mt-5 leading-relaxed max-w-[340px]">
                  {ch.description}
                </p>
              </div>
            ))}
          </div>

          {/* Right: iPhone with mentee video */}
          <div className="w-[58%] flex items-center justify-center">
            <div className="phone-glow">
              <div className="iphone">
                <div className="iphone-screen">
                  <div className="iphone-notch" />
                  <div className="iphone-home" />
                  <video
                    ref={menteeVideo1}
                    src="/mentee.mp4"
                    muted
                    playsInline
                    preload="auto"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TRANSITION ═══ */}
      <section className="h-screen flex flex-col items-center justify-center text-center px-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.03)_0%,transparent_50%)]" />
        <p className="text-[11px] tracking-[0.35em] uppercase text-zinc-600 font-mono mb-4">
          Real-time sync
        </p>
        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight">
          Now watch both sides.
        </h2>
        <p className="text-zinc-500 mt-5 text-lg max-w-md leading-relaxed">
          Same session. Two phones. Every message, every action — perfectly
          synchronized.
        </p>
      </section>

      {/* ═══ ACT 2: DUAL PHONES ═══ */}
      <section
        ref={dualRef}
        style={{ height: `${DUAL_SCROLL_VH}vh` }}
        className="relative"
      >
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center gap-4">
          {/* Sync indicator */}
          <div
            className={`flex items-center gap-3 transition-opacity duration-700 ${
              showDualLabel ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-zinc-700" />
            <span className="text-[10px] tracking-[0.3em] uppercase text-zinc-600 font-mono sync-pulse">
              Live
            </span>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-zinc-700" />
          </div>

          {/* Phones */}
          <div className="flex items-start gap-6 md:gap-10">
            {/* Mentee */}
            <div className="flex flex-col items-center gap-3">
              <div className="iphone iphone-sm">
                <div className="iphone-screen">
                  <div className="iphone-notch" />
                  <div className="iphone-home" />
                  <video
                    ref={menteeVideo2}
                    src="/mentee.mp4"
                    muted
                    playsInline
                    preload="auto"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>
              <span className="text-[10px] tracking-[0.25em] uppercase text-zinc-600 font-mono">
                Mentee
              </span>
            </div>

            {/* Mentor */}
            <div className="flex flex-col items-center gap-3">
              <div className="iphone iphone-sm">
                <div className="iphone-screen">
                  <div className="iphone-notch" />
                  <div className="iphone-home" />
                  <video
                    ref={mentorVideo}
                    src="/mentor.mp4"
                    muted
                    playsInline
                    preload="auto"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>
              <span className="text-[10px] tracking-[0.25em] uppercase text-zinc-600 font-mono">
                Mentor
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SPACER ═══ */}
      <div className="h-32" />

      {/* ═══ STATS ═══ */}
      <section className="border-t border-zinc-900 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-zinc-950 border border-zinc-900 rounded-2xl py-8 text-center"
              >
                <div className="font-serif text-4xl">{s.num}</div>
                <div className="text-[13px] text-zinc-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="border-t border-zinc-900 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl tracking-tight">
              What&apos;s inside
            </h2>
            <p className="text-zinc-500 mt-3 text-[15px]">
              Everything both apps include — built and shipped end-to-end.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="feature-card bg-zinc-950 border border-zinc-900 rounded-2xl p-7"
              >
                <div className="text-2xl mb-4">{f.icon}</div>
                <div className="text-[15px] font-semibold mb-2">{f.title}</div>
                <div className="text-[13px] text-zinc-500 leading-relaxed">
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROCESS ═══ */}
      <section className="border-t border-zinc-900 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl tracking-tight">
              How I work
            </h2>
            <p className="text-zinc-500 mt-3 text-[15px]">
              What it looks like when you hire me for your project.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {process.map((p) => (
              <div
                key={p.num}
                className="bg-zinc-950 border border-zinc-900 rounded-2xl p-7"
              >
                <div className="font-serif text-3xl text-indigo-500/30 mb-3">
                  {p.num}
                </div>
                <div className="text-[15px] font-semibold mb-2">{p.title}</div>
                <div className="text-[13px] text-zinc-500 leading-relaxed">
                  {p.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-zinc-900 py-12 text-center">
        <p className="text-zinc-600 text-sm">
          Built with Flutter + AWS · Designed & developed solo
        </p>
      </footer>
    </main>
  );
}
