"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { submitFeedback, getOrCreateSessionId, FeedbackRatings } from "@/lib/feedbackActions";

// ── Types ──────────────────────────────────────────────────────────────────

interface Question {
  id: number;
  label: string;
  category: string;
  ratingKey: keyof FeedbackRatings;
}

// ── Data ───────────────────────────────────────────────────────────────────

const QUESTIONS: Question[] = [
  {
    id: 1,
    category: "Overall Design",
    label: "How would you rate the overall look and design of the ASTHRA Welcome Robot?",
    ratingKey: "q1_overall_design",
  },
  {
    id: 2,
    category: "UI & Visual Interface",
    label: "How would you rate the robot's UI design and visual interface?",
    ratingKey: "q2_ui_visual",
  },
  {
    id: 3,
    category: "ID Scanning",
    label: "How would you rate the ID card scanning and name recognition?",
    ratingKey: "q3_id_scanning",
  },
  {
    id: 4,
    category: "Event Registration",
    label: "How would you rate the QR-based event registration feature?",
    ratingKey: "q4_event_registration",
  },
  {
    id: 5,
    category: "Overall Experience",
    label: "Overall, how would you rate the ASTHRA Welcome Robot?",
    ratingKey: "q5_overall_experience",
  },
];

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Needs Improvement",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

type SubmitState = "idle" | "submitting" | "success" | "error";

// ── Star Rating Component ──────────────────────────────────────────────────

function StarRating({
  questionId,
  rating,
  hovered,
  onRate,
  onHover,
  onLeave,
  disabled,
}: {
  questionId: number;
  rating: number;
  hovered: number;
  onRate: (n: number) => void;
  onHover: (n: number) => void;
  onLeave: () => void;
  disabled?: boolean;
}) {
  const active = hovered > 0 ? hovered : rating;

  return (
    <div
      className="flex items-center gap-1"
      onMouseLeave={onLeave}
      role="group"
      aria-label="Star rating"
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= active;
        return (
          <button
            key={n}
            id={`star-q${questionId}-${n}`}
            type="button"
            disabled={disabled}
            aria-label={`Rate ${n} star${n !== 1 ? "s" : ""}`}
            onClick={() => onRate(n)}
            onMouseEnter={(e) => {
              if (disabled) return;
              onHover(n);
              (e.currentTarget as HTMLElement).style.transform = "scale(1.18)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "";
            }}
            onMouseDown={(e) => {
              if (disabled) return;
              (e.currentTarget as HTMLElement).style.transform = "scale(0.88)";
            }}
            onMouseUp={(e) => {
              if (disabled) return;
              (e.currentTarget as HTMLElement).style.transform = "scale(1.12)";
            }}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: disabled ? "default" : "pointer",
              lineHeight: 1,
              transition: "transform 0.18s cubic-bezier(0.22,1,0.36,1)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 44,
              minHeight: 44,
              opacity: disabled ? 0.6 : 1,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="30"
              height="30"
              aria-hidden="true"
              style={{
                transition: "fill 0.2s ease, stroke 0.2s ease, filter 0.2s ease",
                fill: filled ? "#f5b800" : "none",
                stroke: filled ? "#f5b800" : "rgba(255,255,255,0.28)",
                strokeWidth: 1.6,
                filter: filled
                  ? "drop-shadow(0 0 7px rgba(245,184,0,0.6))"
                  : "none",
              }}
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

// ── Single Feedback Card ───────────────────────────────────────────────────

function FeedbackCard({
  question,
  index,
  rating,
  onRate,
  disabled,
}: {
  question: Question;
  index: number;
  rating: number;
  onRate: (questionId: number, n: number) => void;
  disabled?: boolean;
}) {
  const [hovered, setHovered] = useState(0);

  const displayRating = hovered > 0 ? hovered : rating;
  const ratingText =
    displayRating > 0 ? RATING_LABELS[displayRating] : "Tap a star to rate";
  const hasRated = rating > 0;

  return (
    <div
      className="rounded-[24px] overflow-hidden anim"
      style={{
        background: "rgba(15, 15, 15, 0.2)",
        backdropFilter: "blur(20px)",
        border: hasRated
          ? "1px solid rgba(245,184,0,0.18)"
          : "1px solid rgba(255,255,255,0.1)",
        boxShadow: hasRated
          ? "0 0 0 1px rgba(245,184,0,0.06), 0 8px 40px rgba(0,0,0,0.45), 0 0 30px rgba(245,184,0,0.04)"
          : "0 8px 40px rgba(0,0,0,0.4)",
        transition: "border 0.35s ease, box-shadow 0.35s ease",
        ["--d" as string]: `${0.08 + index * 0.09}s`,
      }}
    >
      {/* Card header */}
      <div
        className="px-6 py-3 flex items-center justify-between border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <span
          className="font-sans font-semibold uppercase tracking-[0.13em]"
          style={{ fontSize: "11px", color: "rgba(255,255,255,0.65)" }}
        >
          {question.category}
        </span>
        <span
          className="inline-flex items-center gap-1.5 font-sans"
          style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)" }}
        >
          <span
            className="inline-block rounded-full"
            style={{
              width: 5,
              height: 5,
              background: hasRated
                ? "rgba(245,184,0,0.9)"
                : "rgba(255,255,255,0.45)",
              transition: "background 0.3s ease",
            }}
          />
          Q{question.id} of 5
        </span>
      </div>

      {/* Card body */}
      <div className="px-6 sm:px-8 py-7">
        {/* Question */}
        <p
          className="font-sans font-medium leading-snug mb-6"
          style={{
            fontSize: "clamp(15px, 1.8vw, 17px)",
            color: "rgba(255,255,255,1)",
            lineHeight: 1.55,
          }}
        >
          {question.label}
        </p>

        {/* Stars */}
        <StarRating
          questionId={question.id}
          rating={rating}
          hovered={hovered}
          onRate={(n) => {
            onRate(question.id, n);
            setHovered(0);
          }}
          onHover={setHovered}
          onLeave={() => setHovered(0)}
          disabled={disabled}
        />

        {/* Dynamic rating label */}
        <p
          className="mt-3 font-sans"
          style={{
            fontSize: "13px",
            minHeight: "1.4rem",
            transition: "color 0.25s ease",
            color:
              displayRating > 0
                ? displayRating >= 4
                  ? "rgba(245,184,0,0.9)"
                  : displayRating === 3
                  ? "rgba(255,255,255,0.85)"
                  : "rgba(255,100,100,0.95)"
                : "rgba(255,255,255,0.45)",
          }}
        >
          {ratingText}
        </p>
      </div>

      {/* Card footer — dot progress indicator */}
      <div
        className="px-6 py-3 border-t flex items-center gap-2"
        style={{
          borderColor: "rgba(255,255,255,0.06)",
          background: hasRated ? "rgba(245,184,0,0.02)" : "transparent",
          transition: "background 0.35s ease",
        }}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              transition: "background 0.22s ease",
              background:
                n <= rating
                  ? "rgba(245,184,0,0.75)"
                  : "rgba(255,255,255,0.1)",
            }}
          />
        ))}
        <span
          className="ml-1 font-sans"
          style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}
        >
          {rating > 0 ? `${rating}/5 rated` : "Not yet rated"}
        </span>
      </div>
    </div>
  );
}

// ── Thank-You Screen ───────────────────────────────────────────────────────

const RESET_AFTER = 12; // seconds before auto-reset to fresh form

function ThankYouScreen({ onReset }: { onReset: () => void }) {
  const [seconds, setSeconds] = useState(RESET_AFTER);
  const onResetRef = useRef(onReset);
  onResetRef.current = onReset;

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (seconds === 0) {
      onResetRef.current();
    }
  }, [seconds]);


  // SVG countdown ring maths
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = seconds / RESET_AFTER; // 1.0 → 0.0
  const dashOffset = circumference * (1 - progress);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6"
      style={{ animation: "fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both" }}
    >
      {/* Animated checkmark badge */}
      <div
        className="mb-8 flex items-center justify-center rounded-full"
        style={{
          width: 96,
          height: 96,
          background: "rgba(245,184,0,0.07)",
          border: "1.5px solid rgba(245,184,0,0.22)",
          boxShadow: "0 0 60px rgba(245,184,0,0.12)",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="40"
          height="40"
          fill="none"
          stroke="rgba(245,184,0,0.9)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      {/* Eyebrow */}
      <p
        className="font-sans font-semibold uppercase tracking-[0.18em] mb-5"
        style={{ fontSize: "11px", color: "rgba(245,184,0,1)" }}
      >
        Feedback Saved
      </p>

      {/* Main headline */}
      <h2
        className="font-display text-white mb-5"
        style={{ fontSize: "clamp(32px, 6.5vw, 56px)", lineHeight: 1.06 }}
      >
        Thank You for
        <br />
        Attending{" "}
        <span style={{ color: "rgba(245,184,0,0.9)" }}>Asthra</span>
        <span style={{ color: "rgba(245,184,0,0.9)" }}>.</span>
      </h2>

      {/* Main message */}
      <p
        className="font-sans max-w-sm mx-auto mb-3"
        style={{
          fontSize: "clamp(15px, 1.8vw, 17px)",
          color: "rgba(255,255,255,0.85)",
          lineHeight: 1.7,
        }}
      >
        Your feedback has been recorded and will help us build something even
        bigger and better for next year.
      </p>

      {/* Department sign-off */}
      <p
        className="font-sans max-w-xs mx-auto mb-10"
        style={{
          fontSize: "14px",
          color: "rgba(255,255,255,0.6)",
          lineHeight: 1.65,
        }}
      >
        Hope to see you again at{" "}
        <span style={{ color: "rgba(245,184,0,1)", fontWeight: 600 }}>
          Asthra 12.0
        </span>{" "}
        — with love from the Department of{" "}
        <span style={{ color: "rgba(255,255,255,0.82)", fontWeight: 500 }}>
          Electronics &amp; Computer Engineering (ER), SJCET Palai
        </span>
        .
      </p>

      {/* Countdown ring */}
      <div className="flex flex-col items-center gap-3">
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          aria-label={`Next person in ${seconds} seconds`}
        >
          {/* Track ring */}
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="3"
          />
          {/* Animated progress arc */}
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke="rgba(245,184,0,0.65)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 36 36)"
            style={{ transition: "stroke-dashoffset 0.9s linear" }}
          />
          {/* Countdown number */}
          <text
            x="36"
            y="41"
            textAnchor="middle"
            fontSize="18"
            fontWeight="600"
            fill="rgba(255,255,255,0.95)"
            fontFamily="Inter, system-ui, sans-serif"
          >
            {seconds}
          </text>
        </svg>

        <p
          className="font-sans"
          style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}
        >
          Ready for the next person in {seconds}s
        </p>
      </div>
    </div>
  );
}

// ── Main Feedback Flow ─────────────────────────────────────────────────────

export default function FeedbackFlow() {
  // Lifted ratings state — keyed by question ID
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleRate = useCallback((questionId: number, n: number) => {
    setRatings((prev) => ({ ...prev, [questionId]: n }));
  }, []);

  const allRated = QUESTIONS.every((q) => (ratings[q.id] ?? 0) > 0);
  const isSubmitting = submitState === "submitting";

  const handleSubmit = async () => {
    if (!allRated || isSubmitting) return;

    setSubmitState("submitting");
    setErrorMsg("");

    const sessionId = getOrCreateSessionId();

    const feedbackRatings = {
      q1_overall_design: ratings[1],
      q2_ui_visual: ratings[2],
      q3_id_scanning: ratings[3],
      q4_event_registration: ratings[4],
      q5_overall_experience: ratings[5],
    };

    const result = await submitFeedback(feedbackRatings, sessionId);

    if (result.success) {
      setSubmitState("success");
    } else {
      setSubmitState("error");
      setErrorMsg(result.error ?? "Something went wrong. Please try again.");
    }
  };

  const handleReset = useCallback(() => {
    setRatings({});
    setSubmitState("idle");
    setErrorMsg("");
    // Clear session so the next person gets their own unique submission
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("asthra_feedback_session");
    }
  }, []);

  if (submitState === "success") {
    return (
      <main className="relative min-h-screen w-full overflow-x-hidden text-white">
        <Header />
        <ThankYouScreen onReset={handleReset} />
      </main>
    );
  }


  const ratedCount = QUESTIONS.filter((q) => (ratings[q.id] ?? 0) > 0).length;

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden text-white">
      {/* ── Sticky header ── */}
      <Header />

      {/* ── Page intro ── */}
      <section className="px-4 sm:px-6 lg:px-12 pt-12 pb-6">
        <div className="max-w-2xl mx-auto text-center">
          <p
            className="font-sans font-semibold uppercase tracking-[0.14em] mb-4 anim"
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.75)",
              ["--d" as string]: "0s",
            }}
          >
            Share your thoughts
          </p>
          <h1
            className="font-display text-white anim"
            style={{
              fontSize: "clamp(38px, 7vw, 64px)",
              lineHeight: 1.02,
              ["--d" as string]: "0.05s",
            }}
          >
            Rate Your
            <br />
            Experience
            <span style={{ color: "rgba(245,184,0,0.9)" }}>.</span>
          </h1>
          <p
            className="mt-4 font-sans text-[15px] max-w-md mx-auto anim"
            style={{
              color: "rgba(255,255,255,0.78)",
              lineHeight: 1.6,
              ["--d" as string]: "0.12s",
            }}
          >
            Your feedback helps us improve the ASTHRA Welcome Robot for future
            events. Tap the stars below to rate each feature.
          </p>
        </div>
      </section>

      {/* ── Feedback cards ── */}
      <section className="px-4 sm:px-6 lg:px-12 py-6 pb-16">
        <div className="max-w-2xl mx-auto flex flex-col gap-5">
          {QUESTIONS.map((q, i) => (
            <FeedbackCard
              key={q.id}
              question={q}
              index={i}
              rating={ratings[q.id] ?? 0}
              onRate={handleRate}
              disabled={isSubmitting}
            />
          ))}

          {/* ── Submit button ── */}
          <div
            className="mt-2 flex flex-col items-center gap-3 anim"
            style={{ ["--d" as string]: `${0.08 + QUESTIONS.length * 0.09 + 0.05}s` }}
          >
            {/* Progress hint */}
            {!allRated && (
              <p
                className="font-sans text-[13px]"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                {ratedCount} of {QUESTIONS.length} questions rated
              </p>
            )}

            <button
              id="submit-feedback-btn"
              type="button"
              onClick={handleSubmit}
              disabled={!allRated || isSubmitting}
              style={{
                width: "100%",
                maxWidth: 420,
                padding: "14px 32px",
                borderRadius: 16,
                border: allRated
                  ? "1px solid rgba(245,184,0,0.35)"
                  : "1px solid rgba(255,255,255,0.1)",
                background: allRated
                  ? "rgba(245,184,0,0.12)"
                  : "rgba(255,255,255,0.04)",
                color: allRated
                  ? "rgba(245,184,0,0.95)"
                  : "rgba(255,255,255,0.25)",
                fontSize: "15px",
                fontWeight: 600,
                letterSpacing: "-0.01em",
                cursor: allRated && !isSubmitting ? "pointer" : "not-allowed",
                transition:
                  "background 0.3s ease, border 0.3s ease, color 0.3s ease, transform 0.18s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
              onMouseEnter={(e) => {
                if (!allRated || isSubmitting) return;
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(245,184,0,0.2)";
                (e.currentTarget as HTMLElement).style.transform = "scale(1.015)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = allRated
                  ? "rgba(245,184,0,0.12)"
                  : "rgba(255,255,255,0.04)";
                (e.currentTarget as HTMLElement).style.transform = "";
              }}
            >
              {isSubmitting ? (
                <>
                  <SpinnerIcon />
                  Saving…
                </>
              ) : (
                <>
                  <SendIcon />
                  Submit Feedback
                </>
              )}
            </button>

            {/* Error message */}
            {submitState === "error" && (
              <p
                className="font-sans text-[13px] text-center"
                style={{ color: "rgba(255,100,100,0.85)", maxWidth: 360 }}
              >
                ⚠ {errorMsg}
              </p>
            )}
          </div>

          {/* Footer note */}
          <div
            className="mt-4 flex items-center justify-center gap-6 font-sans text-[12px] anim"
            style={{
              color: "rgba(255,255,255,0.55)",
              ["--d" as string]: `${0.08 + QUESTIONS.length * 0.09 + 0.1}s`,
            }}
          >
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block rounded-full"
                style={{
                  width: 5,
                  height: 5,
                  background: "rgba(255,255,255,0.3)",
                }}
              />
              Anonymous feedback
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <span
                className="inline-block rounded-full"
                style={{
                  width: 5,
                  height: 5,
                  background: "rgba(255,255,255,0.3)",
                }}
              />
              Asthra 11.0 — SJCET Palai
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}

// ── Shared Header ──────────────────────────────────────────────────────────

function Header() {
  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between border-b px-6 py-4"
      style={{
        background: "rgba(15, 15, 15, 0.2)",
        backdropFilter: "blur(20px)",
        borderColor: "rgba(255,255,255,0.1)",
      }}
    >
      <Link
        href="/"
        data-robot-action="home"
        data-robot-from="feedback"
        className="inline-flex items-center gap-2 font-sans text-[14px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        style={{ color: "rgba(255,255,255,0.7)", letterSpacing: "-0.01em" }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.color = "#fff")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.color =
            "rgba(255,255,255,0.7)")
        }
      >
        <BackIcon />
        Home
      </Link>

      <span
        className="font-display text-white select-none"
        style={{
          fontSize: "clamp(16px, 2vw, 20px)",
          letterSpacing: "-0.04em",
        }}
      >
        Asthra 11.0
      </span>

      <Link
        href="/scan"
        data-robot-action="scan-start"
        data-robot-from="feedback"
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
        Scan ID
      </Link>
    </header>
  );
}

// ── Icons ──────────────────────────────────────────────────────────────────

function BackIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
      style={{ animation: "spin 0.8s linear infinite" }}
    >
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}
