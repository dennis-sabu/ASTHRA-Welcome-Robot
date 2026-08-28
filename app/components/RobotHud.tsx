"use client";

import { useState } from "react";
import { useRobotVoice } from "./RobotVoice";
import { answerAskRobot } from "@/lib/robotResponses";

/**
 * RobotHud — the assistant's dialogue bubble.
 *
 * Sits in the bottom-left corner across the whole app. Renders:
 *
 *   - A small robot face that animates with the current state
 *     (idle blink, thinking scan, speaking waveform).
 *   - The current caption (whatever the robot is about to say, saying,
 *     or last said).
 *   - A Stop button that cancels any in-flight utterance.
 *   - A small Ask Robot launcher that opens AskRobotPanel.
 *
 * The whole panel collapses into a single floating button on small
 * viewports so it never blocks content.
 */
export default function RobotHud() {
  const { state, caption, supported, stop, dispatch } = useRobotVoice();
  const [askOpen, setAskOpen] = useState(false);

  // Reduced-motion: stop the eye blink + waveform animation.
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  if (!supported) {
    // Browser doesn't support TTS — render nothing rather than a broken
    // bubble that promises speech we can't deliver.
    return null;
  }

  return (
    <>
      <div
        className="fixed bottom-4 left-4 z-40 max-w-[320px] sm:max-w-[360px]"
        role="region"
        aria-label="Asthra assistant"
      >
        <div
          className="flex items-end gap-3 px-3 py-3 rounded-[20px] backdrop-blur-md"
          style={{
            background: "rgba(10,10,10,0.88)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
          }}
        >
          <RobotFace
            state={state}
            animate={!reduceMotion}
            onClick={() => setAskOpen((v) => !v)}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="font-sans text-[10px] uppercase font-semibold"
                style={{ letterSpacing: "0.18em", color: "var(--accent)" }}
              >
                Asthra 11.0
              </span>
              <StateBadge state={state} />
            </div>

            <p
              aria-live="polite"
              className="font-sans text-[12.5px] leading-[18px] line-clamp-3"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              {caption}
            </p>

            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={stop}
                disabled={state === "idle"}
                aria-label="Stop robot voice"
                className="font-sans font-semibold rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  padding: "4px 10px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                Stop
              </button>
              <button
                type="button"
                onClick={() => {
                  setAskOpen(true);
                  dispatch({ type: "ask-robot-intro" });
                }}
                className="font-sans font-semibold rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  padding: "4px 10px",
                  background: "#fff",
                  color: "#000",
                }}
              >
                Ask Robot
              </button>
            </div>
          </div>
        </div>
      </div>

      {askOpen && (
        <AskRobotPanel onClose={() => setAskOpen(false)} />
      )}
    </>
  );
}

function StateBadge({ state }: { state: "idle" | "thinking" | "speaking" }) {
  const labels = { idle: "Idle", thinking: "Thinking", speaking: "Speaking" } as const;
  const colors = {
    idle: { bg: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.35)" },
    thinking: { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)" },
    speaking: { bg: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)" },
  } as const;
  return (
    <span
      className="font-sans font-semibold rounded-full"
      style={{
        fontSize: "9px",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        padding: "2px 6px",
        ...colors[state],
      }}
    >
      {labels[state]}
    </span>
  );
}

/* ───────────────────── Robot face SVG ───────────────────── */

function RobotFace({
  state,
  animate,
  onClick,
}: {
  state: "idle" | "thinking" | "speaking";
  animate: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Toggle ask robot panel"
      className={`shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white`}
      style={{
        background: state === "speaking" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: state === "speaking" ? "0 0 14px rgba(255,255,255,0.2)" : "none",
        transition: "background 0.2s, box-shadow 0.2s",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className={`h-8 w-8 ${state === "idle" && animate ? "animate-float" : ""}`}
        aria-hidden="true"
      >
        {/* Antenna */}
        <line
          x1="16"
          y1="2"
          x2="16"
          y2="6"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle
          cx="16"
          cy="2"
          r="1.4"
          fill={state === "thinking" ? "rgba(255,255,255,0.5)" : "#fff"}
        >
          {state === "thinking" && animate && (
            <animate
              attributeName="opacity"
              values="1;0.3;1"
              dur="1.1s"
              repeatCount="indefinite"
            />
          )}
        </circle>

        {/* Head */}
        <rect
          x="5"
          y="6"
          width="22"
          height="18"
          rx="4"
          fill="rgba(255,255,255,0.04)"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.5"
        />

        {/* Eyes */}
        <Eyes state={state} animate={animate} />

        {/* Mouth */}
        <Mouth state={state} animate={animate} />

        {/* Side ears */}
        <rect x="3" y="11" width="2" height="8" rx="1" fill="rgba(255,255,255,0.5)" />
        <rect x="27" y="11" width="2" height="8" rx="1" fill="rgba(255,255,255,0.5)" />
      </svg>
    </button>
  );
}

function Eyes({
  state,
  animate,
}: {
  state: "idle" | "thinking" | "speaking";
  animate: boolean;
}) {
  if (state === "speaking") {
    // Closed, smiling — happy to talk.
    return (
      <g stroke="rgba(255,255,255,0.9)" strokeWidth="1.6" strokeLinecap="round" fill="none">
        <path d="M10 16 Q11.5 18 13 16" />
        <path d="M19 16 Q20.5 18 22 16" />
      </g>
    );
  }
  // Round eyes for idle/thinking.
  return (
    <g fill="#fff">
      <circle cx="11" cy="15" r="1.4">
        {state === "idle" && animate && (
          <animate
            attributeName="r"
            values="1.4;0.2;1.4"
            dur="3.6s"
            repeatCount="indefinite"
          />
        )}
        {state === "thinking" && animate && (
          <animate
            attributeName="cx"
            values="11;13;9;11"
            dur="1.4s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      <circle cx="21" cy="15" r="1.4">
        {state === "idle" && animate && (
          <animate
            attributeName="r"
            values="1.4;0.2;1.4"
            dur="3.6s"
            begin="0.2s"
            repeatCount="indefinite"
          />
        )}
        {state === "thinking" && animate && (
          <animate
            attributeName="cx"
            values="21;19;23;21"
            dur="1.4s"
            repeatCount="indefinite"
          />
        )}
      </circle>
    </g>
  );
}

function Mouth({
  state,
  animate,
}: {
  state: "idle" | "thinking" | "speaking";
  animate: boolean;
}) {
  if (state === "speaking") {
    // Animated waveform mouth.
    return (
      <g stroke="rgba(255,255,255,0.8)" strokeWidth="1.6" strokeLinecap="round" fill="none">
        <line x1="11" y1="22" x2="11" y2="22">
          {animate && (
            <animate attributeName="y2" values="20;24;20" dur="0.4s" repeatCount="indefinite" />
          )}
        </line>
        <line x1="13.5" y1="22" x2="13.5" y2="22">
          {animate && (
            <animate attributeName="y2" values="24;19;24" dur="0.42s" repeatCount="indefinite" />
          )}
        </line>
        <line x1="16" y1="22" x2="16" y2="22">
          {animate && (
            <animate attributeName="y2" values="19;25;19" dur="0.38s" repeatCount="indefinite" />
          )}
        </line>
        <line x1="18.5" y1="22" x2="18.5" y2="22">
          {animate && (
            <animate attributeName="y2" values="24;20;24" dur="0.4s" repeatCount="indefinite" />
          )}
        </line>
        <line x1="21" y1="22" x2="21" y2="22">
          {animate && (
            <animate attributeName="y2" values="20;24;20" dur="0.45s" repeatCount="indefinite" />
          )}
        </line>
      </g>
    );
  }
  // Idle / thinking — straight mouth.
  return (
    <line
      x1="13"
      y1="22"
      x2="19"
      y2="22"
      stroke="rgba(255,255,255,0.6)"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  );
}

/* ───────────────────── Ask Robot panel ───────────────────── */

function AskRobotPanel({ onClose }: { onClose: () => void }) {
  const { dispatch } = useRobotVoice();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      dispatch({ type: "ask-robot-empty" });
      return;
    }
    dispatch({ type: "ask-robot-thinking" });
    const answer = answerAskRobot(trimmed);
    window.setTimeout(() => {
      dispatch({ type: "ask-robot-answer", text: answer });
    }, 320);
  }

  const suggestions = [
    "What is Robo Race?",
    "Where is the AI/ML Workshop?",
    "List events",
    "When is Cipher CTF?",
  ];

  return (
    <div
      className="fixed bottom-[120px] left-4 right-4 sm:right-auto sm:max-w-[360px] z-40 animate-fade-up"
      role="dialog"
      aria-label="Ask the Asthra robot"
    >
      <form
        onSubmit={handleSubmit}
        className="rounded-[20px] p-4 backdrop-blur-md"
        style={{
          background: "rgba(10,10,10,0.95)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <p
            className="font-sans font-semibold uppercase"
            style={{ fontSize: "11px", letterSpacing: "0.18em", color: "var(--accent)" }}
          >
            Ask the Asthra robot
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="font-sans text-[14px] rounded transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            style={{ color: "rgba(255,255,255,0.5)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)")}
          >
            ✕
          </button>
        </div>

        <label htmlFor="ask-robot-input" className="sr-only">
          Ask a question
        </label>
        <input
          id="ask-robot-input"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try: where is Robo Race?"
          className="w-full rounded-[12px] font-sans text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white"
          style={{
            background: "#111",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "10px 14px",
          }}
        />

        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setQuery(s)}
              className="font-sans font-semibold rounded-full transition cursor-pointer"
              style={{
                fontSize: "10px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "4px 10px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <button
          type="submit"
          className="mt-3 w-full rounded-[14px] font-sans font-semibold text-[14px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
          style={{ padding: "10px", background: "#fff", color: "#000" }}
        >
          Ask
        </button>
      </form>
    </div>
  );
}
