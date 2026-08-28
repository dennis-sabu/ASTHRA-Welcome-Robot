"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getStudent, students, type Student } from "@/lib/data";
import { useRobotVoice } from "../components/RobotVoice";

type Phase = "ready" | "scanning" | "detected" | "error";

export default function ScanFlow() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [error, setError] = useState<string | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [manualId, setManualId] = useState("");
  const { dispatch, stop } = useRobotVoice();

  async function startCamera() {
    setError(null);
    setPhase("scanning");
    dispatch({ type: "scan-start" });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 720 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      window.setTimeout(() => detect(), 2800);
    } catch (err) {
      console.error(err);
      setError("Camera access was blocked. Enter your ID below to look up.");
      setPhase("error");
      dispatch({ type: "scan-camera-error" });
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  function detect() {
    stopCamera();
    const pick = students[Math.floor(Math.random() * students.length)];
    setStudent(pick);
    setPhase("detected");
    const firstName = pick.name.split(" ")[0];
    dispatch({ type: "scan-detected", firstName });
  }

  function lookupId(raw: string) {
    const s = getStudent(raw.trim());
    if (!s) {
      setError("We couldn't find that ID. Try ASTH001 to ASTH006.");
      setPhase("error");
      return;
    }
    setStudent(s);
    setPhase("detected");
    const firstName = s.name.split(" ")[0];
    dispatch({ type: "scan-lookup", id: s.id, firstName });
  }

  function reset() {
    stopCamera();
    stop();
    setStudent(null);
    setError(null);
    setManualId("");
    setPhase("ready");
  }

  useEffect(() => {
    return () => {
      stopCamera();
      stop();
    };
  }, [stop]);

  return (
    <main className="min-h-screen w-full overflow-x-hidden text-white" style={{ background: "#000" }}>
      {/* ── Nav bar ── */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between border-b px-6 py-4"
        style={{ background: "#000", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <Link
          href="/"
          data-robot-action="home"
          data-robot-from="scan"
          className="inline-flex items-center gap-2 font-sans text-[14px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          style={{ color: "rgba(255,255,255,0.7)", letterSpacing: "-0.01em" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)")}
        >
          <BackIcon />
          Home
        </Link>

        <span
          className="font-display text-white select-none"
          style={{ fontSize: "clamp(16px, 2vw, 20px)", letterSpacing: "-0.04em" }}
        >
          Asthra 11.0
        </span>

        <Link
          href="/events"
          data-robot-action="event-directory"
          data-robot-from="scan"
          className="inline-flex items-center gap-2 rounded-full font-sans font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          style={{
            background: "var(--pill-dark)",
            color: "var(--sign-in-text)",
            fontSize: "clamp(12px, 1.3vw, 14px)",
            padding: "8px 16px",
            letterSpacing: "-0.01em",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#323234";
            (e.currentTarget as HTMLElement).style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--pill-dark)";
            (e.currentTarget as HTMLElement).style.color = "var(--sign-in-text)";
          }}
        >
          Events
        </Link>
      </header>

      {/* ── Main content ── */}
      <section className="px-6 lg:px-12 py-14">
        <div className="max-w-2xl mx-auto">
          {phase === "detected" && student ? (
            <GreetingCard student={student} onReset={reset} />
          ) : (
            <div
              className="rounded-[24px] overflow-hidden"
              style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {phase === "ready" && <ReadyPanel onStart={startCamera} />}
              {phase === "scanning" && (
                <ScanningPanel videoRef={videoRef} onCancel={reset} />
              )}
              {phase === "error" && (
                <ErrorPanel
                  message={error ?? "Something went wrong."}
                  manualId={manualId}
                  setManualId={setManualId}
                  onSubmit={() => lookupId(manualId)}
                  onRetry={startCamera}
                />
              )}

              {/* Footer hint */}
              <div
                className="border-t px-6 py-3 flex items-center justify-between font-sans text-[12px]"
                style={{ borderColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}
              >
                <span>
                  Demo IDs:{" "}
                  <span className="font-semibold text-white">ASTH001 – ASTH006</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block rounded-full"
                    style={{ width: 6, height: 6, background: "rgba(255,255,255,0.5)" }}
                  />
                  Kiosk ready
                </span>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

/* ────────────────── READY ────────────────── */
function ReadyPanel({ onStart }: { onStart: () => void }) {
  return (
    <div className="px-8 sm:px-12 py-14 sm:py-20 text-center">
      <p
        className="font-sans font-semibold uppercase tracking-[0.14em] mb-5"
        style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}
      >
        Welcome kiosk
      </p>

      <h2
        className="font-display text-white"
        style={{ fontSize: "clamp(42px, 7vw, 72px)", lineHeight: 1.02 }}
      >
        Scan your ID
        <span style={{ color: "#fff" }}>.</span>
      </h2>

      <p
        className="mt-4 font-sans text-[15px] max-w-md mx-auto"
        style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}
      >
        I&apos;ll greet you by name — spoken aloud by the Asthra assistant. Make
        sure the photo and ID number are clearly visible.
      </p>

      <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onStart}
          data-robot-action="scan-start"
          className="inline-flex items-center justify-center gap-2 rounded-full font-sans font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
          style={{
            background: "#fff",
            color: "#000",
            fontSize: "clamp(14px, 1.5vw, 16px)",
            padding: "14px clamp(24px, 3vw, 32px)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.15), 0 0 22px rgba(255,255,255,0.25), 0 0 44px rgba(255,255,255,0.08)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-1px) scale(1.01)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "";
          }}
        >
          <ScanIcon />
          Open camera
        </button>
      </div>

      <div
        className="mt-8 flex items-center justify-center gap-6 font-sans text-[12px]"
        style={{ color: "rgba(255,255,255,0.35)" }}
      >
        <span className="flex items-center gap-1.5">
          <span className="inline-block rounded-full" style={{ width: 6, height: 6, background: "rgba(255,255,255,0.45)" }} />
          Camera stays on device
        </span>
        <span className="hidden sm:flex items-center gap-1.5">
          <span className="inline-block rounded-full" style={{ width: 6, height: 6, background: "rgba(255,255,255,0.45)" }} />
          No recording
        </span>
      </div>
    </div>
  );
}

/* ──────────────────── SCANNING ──────────────────── */
function ScanningPanel({
  videoRef,
  onCancel,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onCancel: () => void;
}) {
  return (
    <div>
      <div
        className="relative w-full bg-black"
        style={{ aspectRatio: "16/9" }}
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          style={{ transform: "scaleX(-1)" }}
          playsInline
          muted
        />

        {/* Gradient vignettes */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Corner markers */}
        <Corner className="top-6 left-6" />
        <Corner className="top-6 right-6 rotate-90" />
        <Corner className="bottom-6 right-6 rotate-180" />
        <Corner className="bottom-6 left-6 -rotate-90" />

        {/* Laser scan bar */}
        <div
          className="absolute left-0 right-0 animate-scan"
          style={{
            height: 2,
            background: "rgba(255,255,255,0.85)",
            boxShadow: "0 0 18px 4px rgba(255,255,255,0.35)",
          }}
        />

        {/* Scanning badge */}
        <div
          className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full font-sans font-semibold uppercase"
          style={{
            background: "rgba(255,255,255,0.92)",
            color: "#000",
            fontSize: "12px",
            letterSpacing: "0.1em",
            padding: "6px 14px",
          }}
        >
          <span
            className="inline-block rounded-full animate-pulse"
            style={{ width: 6, height: 6, background: "#000" }}
          />
          Scanning
        </div>

        <div className="absolute bottom-6 inset-x-0 text-center">
          <p className="font-sans font-semibold text-white text-[14px]">Hold your ID steady</p>
        </div>
      </div>

      <div
        className="flex items-center justify-between px-6 py-4 border-t"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <p className="font-sans text-[13px]" style={{ color: "rgba(255,255,255,0.45)" }}>
          Looking for photo and ID…
        </p>
        <button
          onClick={onCancel}
          className="font-sans font-semibold text-[13px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
          style={{ color: "rgba(255,255,255,0.6)", textDecoration: "underline", textUnderlineOffset: 3 }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function Corner({ className = "" }: { className?: string }) {
  const isRight = className.includes("rotate-90") || className.includes("rotate-180");
  const isBottom = className.includes("rotate-180") || className.includes("-rotate-90");
  return (
    <div
      className={`absolute h-9 w-9 ${className}`}
      style={{
        borderTopWidth: isBottom ? 0 : 2,
        borderBottomWidth: isBottom ? 2 : 0,
        borderLeftWidth: isRight ? 0 : 2,
        borderRightWidth: isRight ? 2 : 0,
        borderColor: "rgba(255,255,255,0.6)",
      }}
    />
  );
}

/* ──────────────────── ERROR ──────────────────── */
function ErrorPanel({
  message,
  manualId,
  setManualId,
  onSubmit,
  onRetry,
}: {
  message: string;
  manualId: string;
  setManualId: (v: string) => void;
  onSubmit: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="px-8 sm:px-12 py-12">
      <div className="flex items-start gap-3 mb-8">
        <div
          className="shrink-0 flex items-center justify-center rounded-full"
          style={{ width: 36, height: 36, background: "rgba(255,70,70,0.12)" }}
        >
          <AlertIcon />
        </div>
        <div>
          <h3
            className="font-display text-white"
            style={{ fontSize: "clamp(26px, 3.5vw, 32px)", lineHeight: 1.02 }}
          >
            Couldn&apos;t scan
            <span style={{ color: "#ff4d6a" }}>.</span>
          </h3>
          <p className="mt-1 font-sans text-[14px]" style={{ color: "rgba(255,255,255,0.55)" }}>
            {message}
          </p>
        </div>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
        className="flex flex-col sm:flex-row gap-2"
      >
        <label htmlFor="manual-id" className="sr-only">College ID</label>
        <input
          id="manual-id"
          value={manualId}
          onChange={(e) => setManualId(e.target.value)}
          placeholder="Enter your ID (e.g. ASTH001)"
          className="flex-1 rounded-full font-sans text-[14px] text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white"
          style={{
            padding: "12px 20px",
            background: "#111",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        />
        <button
          type="submit"
          className="rounded-full font-sans font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
          style={{
            padding: "12px 22px",
            background: "#fff",
            color: "#000",
            fontSize: "14px",
          }}
        >
          Look up
        </button>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full font-sans font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
          style={{
            padding: "12px 22px",
            background: "var(--pill-dark)",
            color: "var(--sign-in-text)",
            fontSize: "14px",
          }}
        >
          Try camera
        </button>
      </form>
    </div>
  );
}

/* ──────────────────── GREETING ──────────────────── */
function GreetingCard({
  student,
  onReset,
}: {
  student: Student;
  onReset: () => void;
}) {
  const firstName = student.name.split(" ")[0];

  return (
    <div
      className="rounded-[24px] overflow-hidden animate-fade-up"
      style={{
        background: "#0a0a0a",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div className="px-8 sm:px-12 py-12 sm:py-16 text-center">
        <p
          className="font-sans font-semibold uppercase tracking-[0.14em]"
          style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)" }}
        >
          Identity confirmed
        </p>

        <h2
          className="font-display text-white mt-3"
          style={{
            fontSize: "clamp(64px, 12vw, 108px)",
            lineHeight: 0.92,
          }}
        >
          {firstName}
          <span style={{ color: "#fff" }}>.</span>
        </h2>

        <p
          className="mt-4 font-sans text-[16px]"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          Welcome to{" "}
          <span className="font-semibold text-white">Asthra 11.0</span>.
        </p>

        {/* Fact chips */}
        <div className="mt-10 grid grid-cols-3 gap-3 max-w-md mx-auto text-left">
          <Fact label="ID" value={student.id} />
          <Fact label="Year" value={student.year} />
          <Fact label="Dept" value={student.department} />
        </div>

        {/* Actions */}
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/events"
            data-robot-action="event-directory"
            data-robot-from="scan"
            className="inline-flex items-center justify-center gap-2 rounded-full font-sans font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            style={{
              background: "#fff",
              color: "#000",
              fontSize: "clamp(14px, 1.5vw, 15px)",
              padding: "13px 26px",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = "translateY(-1px)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = "")}
          >
            Explore events
            <ArrowRight />
          </Link>
          <button
            onClick={onReset}
            className="rounded-full font-sans font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
            style={{
              padding: "13px 26px",
              fontSize: "clamp(14px, 1.5vw, 15px)",
              background: "var(--pill-dark)",
              color: "var(--sign-in-text)",
            }}
          >
            Scan another
          </button>
        </div>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[14px] px-4 py-3"
      style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <p
        className="font-sans font-semibold uppercase tracking-[0.1em]"
        style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}
      >
        {label}
      </p>
      <p
        className="mt-1 font-sans font-semibold text-white text-[13px] line-clamp-2"
      >
        {value}
      </p>
    </div>
  );
}

/* ── Icons ── */
function BackIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="#ff4d6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
