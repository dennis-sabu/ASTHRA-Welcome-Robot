"use client";

import { useState } from "react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────

interface Question {
  id: number;
  label: string;
  category: string;
}

// ── Data ───────────────────────────────────────────────────────────────────

const QUESTIONS: Question[] = [
  {
    id: 1,
    category: "Overall Design",
    label:
      "How would you rate the overall look and design of the ASTHRA Welcome Robot?",
  },
  {
    id: 2,
    category: "UI & Visual Interface",
    label: "How would you rate the robot's UI design and visual interface?",
  },
  {
    id: 3,
    category: "ID Scanning",
    label: "How would you rate the ID card scanning and name recognition?",
  },
  {
    id: 4,
    category: "Event Registration",
    label:
      "How would you rate the QR-based event registration feature?",
  },
  {
    id: 5,
    category: "Overall Experience",
    label: "Overall, how would you rate the ASTHRA Welcome Robot?",
  },
];

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Needs Improvement",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

// ── Star Rating Component ──────────────────────────────────────────────────

function StarRating({
  questionId,
  rating,
  hovered,
  onRate,
  onHover,
  onLeave,
}: {
  questionId: number;
  rating: number;
  hovered: number;
  onRate: (n: number) => void;
  onHover: (n: number) => void;
  onLeave: () => void;
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
            aria-label={`Rate ${n} star${n !== 1 ? "s" : ""}`}
            onClick={() => onRate(n)}
            onMouseEnter={(e) => {
              onHover(n);
              (e.currentTarget as HTMLElement).style.transform = "scale(1.18)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "";
            }}
            onMouseDown={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(0.88)";
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1.12)";
            }}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              lineHeight: 1,
              transition: "transform 0.18s cubic-bezier(0.22,1,0.36,1)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 44,
              minHeight: 44,
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
}: {
  question: Question;
  index: number;
}) {
  const [rating, setRating] = useState(0);
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
        // Stagger entrance
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
          style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}
        >
          {question.category}
        </span>
        <span
          className="inline-flex items-center gap-1.5 font-sans"
          style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}
        >
          <span
            className="inline-block rounded-full"
            style={{
              width: 5,
              height: 5,
              background: hasRated
                ? "rgba(245,184,0,0.8)"
                : "rgba(255,255,255,0.25)",
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
            color: "rgba(255,255,255,0.88)",
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
            setRating(n);
            setHovered(0);
          }}
          onHover={setHovered}
          onLeave={() => setHovered(0)}
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
                  ? "rgba(255,255,255,0.6)"
                  : "rgba(255,100,100,0.8)"
                : "rgba(255,255,255,0.22)",
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
          style={{ fontSize: "12px", color: "rgba(255,255,255,0.22)" }}
        >
          {rating > 0 ? `${rating}/5 rated` : "Not yet rated"}
        </span>
      </div>
    </div>
  );
}

// ── Main Feedback Flow ─────────────────────────────────────────────────────

export default function FeedbackFlow() {
  return (
    <main className="relative min-h-screen w-full overflow-x-hidden text-white">
      {/* ── Sticky header ── */}
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
            (e.currentTarget as HTMLElement).style.background =
              "var(--pill-dark)";
            (e.currentTarget as HTMLElement).style.color = "var(--sign-in-text)";
          }}
        >
          Scan ID
        </Link>
      </header>

      {/* ── Page intro ── */}
      <section className="px-4 sm:px-6 lg:px-12 pt-12 pb-6">
        <div className="max-w-2xl mx-auto text-center">
          <p
            className="font-sans font-semibold uppercase tracking-[0.14em] mb-4 anim"
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.4)",
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
              color: "rgba(255,255,255,0.5)",
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
            <FeedbackCard key={q.id} question={q} index={i} />
          ))}

          {/* Footer note */}
          <div
            className="mt-4 flex items-center justify-center gap-6 font-sans text-[12px] anim"
            style={{
              color: "rgba(255,255,255,0.28)",
              ["--d" as string]: `${0.08 + QUESTIONS.length * 0.09 + 0.05}s`,
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
