"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

/**
 * RobotVoice — Asthra's context-aware tech-fest assistant voice.
 *
 * Exposes a small state machine:
 *
 *   idle       — nothing playing, default resting state
 *   thinking   — context detected, brief "loading" line about to fire
 *   speaking   — an utterance is currently being spoken
 *
 * The provider exposes:
 *
 *   state            — "idle" | "thinking" | "speaking"
 *   lastText         — most recently spoken string (for captions)
 *   currentContext   — the last dispatched context, used by the HUD
 *   supported        — whether speechSynthesis is available
 *   caption          — what to show in the bubble right now
 *
 *   speakContext(ctx, text)
 *       Speak `text` under the given semantic context. The previous
 *       utterance is always cancelled first, and a request ID is bumped
 *       so any in-flight callbacks from a stale context are ignored.
 *
 *   setThinking(ctx)
 *       Flip into the thinking state without speaking. Used for the
 *       "let me check that…" delay before an event explanation.
 *
 *   stop()
 *       Cancel the current utterance and return to idle.
 *
 *   dispatch(action, payload?)
 *       Dispatch a semantic action (e.g. "event-directory") from a
 *       UI element via a `data-robot-action` attribute. Looks up the
 *       response in `lib/robotResponses.ts` and speaks it.
 */

import {
  WELCOME_LINE,
  EVENTS_LINES,
  NAV_LINES,
  FILTER_LINES,
  MAP_LINES,
  SCHEDULE_LINES,
  SCAN_LINES,
  ASK_ROBOT_LINES,
  getEventLoadingLine,
  getEventExplanationLine,
  type EventFilter,
} from "@/lib/robotResponses";
import type { EventItem } from "@/lib/data";

export type RobotState = "idle" | "thinking" | "speaking";

export type RobotContext = {
  /** Stable identifier for the source of the action, e.g. "event-directory",
   * "scan", "event:codex", "filter:workshop". */
  action: string;
  /** When present, the event that triggered the action. */
  event?: EventItem;
  /** Optional human-readable label, used in captions. */
  label?: string;
};

export type RobotAction =
  | { type: "event-directory"; from?: "home" | "scan" }
  | { type: "scan"; from?: "home" | "events" }
  | { type: "home"; from?: "events" | "scan" }
  | { type: "events-arrived" }
  | { type: "filter"; value: EventFilter }
  | { type: "event-loading"; event: EventItem }
  | { type: "event-selected"; event: EventItem }
  | { type: "scan-start" }
  | { type: "scan-detected"; firstName: string }
  | { type: "scan-camera-error" }
  | { type: "scan-lookup"; id: string; firstName?: string }
  | { type: "schedule" }
  | { type: "map"; venue?: string }
  | { type: "ask-robot-intro" }
  | { type: "ask-robot-thinking" }
  | { type: "ask-robot-answer"; text: string }
  | { type: "ask-robot-empty" }
  | { type: "stop" }
  | { type: "text"; text: string; label?: string };

type VoiceStatus = "idle" | "speaking";

type RobotVoiceContextValue = {
  state: RobotState;
  speaking: boolean;
  supported: boolean;
  lastText: string | null;
  currentContext: RobotContext | null;
  caption: string;
  /** Convenience wrapper around `speakContext` for ad-hoc lines
   * (e.g. the home page's manual replay-greeting button). */
  speak: (text: string, label?: string) => void;
  speakContext: (ctx: RobotContext, text: string) => void;
  setThinking: (ctx: RobotContext, label?: string) => void;
  stop: () => void;
  dispatch: (action: RobotAction) => void;
};

const RobotVoiceContext = createContext<RobotVoiceContextValue | null>(null);

/** Robotic voice profile — pitch slightly lowered, rate slightly fast. */
const ROBOT_PROFILE = {
  rate: 0.95,
  pitch: 1.0,
  volume: 1,
} as const;

/* ─── Speech-synthesis support detection ──────────────────────────── */

let speechSupportCache: boolean | null = null;
function readSpeechSupport(): boolean {
  if (typeof window === "undefined") return true;
  if (speechSupportCache !== null) return speechSupportCache;
  speechSupportCache =
    typeof window.speechSynthesis !== "undefined" &&
    typeof window.SpeechSynthesisUtterance !== "undefined";
  return speechSupportCache;
}
function subscribeSpeechSupport(): () => void {
  return () => {};
}

/* ─── Race-condition protection ───────────────────────────────────── */

let speechRequestId = 0;

export function RobotVoiceProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [state, setState] = useState<RobotState>("idle");
  const [lastText, setLastText] = useState<string | null>(null);
  const [currentContext, setCurrentContext] =
    useState<RobotContext | null>(null);
  const supported = useSyncExternalStore(
    subscribeSpeechSupport,
    readSpeechSupport,
    () => true,
  );
  const audioCtxRef = useRef<AudioContext | null>(null);
  // Live ref of the most recent request ID — used to invalidate late
  // callbacks from SpeechSynthesis after a cancellation.
  const requestRef = useRef(0);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined") return;
    // Bump the request ID so any in-flight onstart/onend callbacks drop.
    requestRef.current++;
    speechRequestId++;
    window.speechSynthesis?.cancel();
    setStatus("idle");
    setState("idle");
  }, []);

  const setThinking = useCallback((ctx: RobotContext, label?: string) => {
    setCurrentContext({ ...ctx, label: label ?? ctx.label });
    setState("thinking");
    // While thinking, we don't speak yet — the actual utterance fires
    // from `speakContext` once the content is ready.
  }, []);

  const speakContext = useCallback(
    (ctx: RobotContext, text: string) => {
      if (typeof window === "undefined") return;
      const trimmed = text.trim();
      if (!trimmed || typeof window.speechSynthesis === "undefined") return;

      // Cancel previous utterance and invalidate any in-flight callbacks.
      window.speechSynthesis.cancel();
      speechRequestId++;
      requestRef.current = speechRequestId;
      const myRequest = speechRequestId;

      setCurrentContext({ ...ctx, label: ctx.label ?? text });
      setLastText(trimmed);
      setState("speaking");

      const utterance = new SpeechSynthesisUtterance(trimmed);
      utterance.rate = ROBOT_PROFILE.rate;
      utterance.pitch = ROBOT_PROFILE.pitch;
      utterance.volume = ROBOT_PROFILE.volume;

      const voices = window.speechSynthesis.getVoices();
      const englishVoice =
        voices.find((v) => /en[-_]?(GB|US)/i.test(v.lang)) ?? voices[0];
      if (englishVoice) utterance.voice = englishVoice;

      utterance.onstart = () => {
        if (requestRef.current !== myRequest) return;
        setStatus("speaking");
      };
      utterance.onend = () => {
        if (requestRef.current !== myRequest) return;
        setStatus("idle");
        setState("idle");
      };
      utterance.onerror = () => {
        if (requestRef.current !== myRequest) return;
        setStatus("idle");
        setState("idle");
      };

      window.speechSynthesis.speak(utterance);
      setStatus("speaking");

      // Sci-fi carrier tone, same trick as before.
      if (typeof window.AudioContext !== "undefined") {
        try {
          if (!audioCtxRef.current) {
            audioCtxRef.current = new AudioContext();
          }
          const ctx = audioCtxRef.current;
          if (ctx.state === "suspended") {
            ctx.resume().catch(() => {});
          }
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.value = 110;
          gain.gain.value = 0.012;
          osc.connect(gain).connect(ctx.destination);
          osc.start();
          const cleanup = () => {
            try {
              osc.stop();
              osc.disconnect();
              gain.disconnect();
            } catch {
              /* already stopped */
            }
          };
          utterance.onend = () => {
            cleanup();
            if (requestRef.current !== myRequest) return;
            setStatus("idle");
            setState("idle");
          };
          utterance.onerror = () => {
            cleanup();
            if (requestRef.current !== myRequest) return;
            setStatus("idle");
            setState("idle");
          };
        } catch {
          /* Web Audio unavailable */
        }
      }
    },
    [],
  );

  /* ─── Central dispatch ──────────────────────────────────────── */

  const dispatch = useCallback(
    (action: RobotAction) => {
      switch (action.type) {
        case "event-directory": {
          const from = action.from ?? "home";
          const line =
            from === "scan"
              ? NAV_LINES.eventsFromScan
              : NAV_LINES.eventsFromHome;
          speakContext({ action: "event-directory" }, line);
          break;
        }
        case "scan": {
          const from = action.from ?? "home";
          const line =
            from === "events" ? NAV_LINES.scanFromEvents : NAV_LINES.scanFromHome;
          speakContext({ action: "scan" }, line);
          break;
        }
        case "home": {
          const from = action.from ?? "events";
          const line =
            from === "scan" ? NAV_LINES.homeFromScan : NAV_LINES.homeFromEvents;
          speakContext({ action: "home" }, line);
          break;
        }
        case "events-arrived": {
          speakContext(
            { action: "events-arrived" },
            EVENTS_LINES.arrived,
          );
          break;
        }
        case "filter": {
          const line = FILTER_LINES[action.value];
          speakContext(
            { action: `filter:${action.value}`, label: line },
            line,
          );
          break;
        }
        case "event-loading": {
          const { event } = action;
          const loadingLine = getEventLoadingLine(event);
          // Speak the loading line immediately. The explanation will be
          // dispatched by the page once the detail panel has updated.
          speakContext(
            {
              action: `event-loading:${event.id}`,
              event,
              label: `Checking ${event.name}…`,
            },
            loadingLine,
          );
          break;
        }
        case "event-selected": {
          const { event } = action;
          const line = getEventExplanationLine(event);
          speakContext(
            { action: `event:${event.id}`, event, label: event.name },
            line,
          );
          break;
        }
        case "scan-start": {
          speakContext({ action: "scan-start" }, SCAN_LINES.cameraStart);
          break;
        }
        case "scan-detected": {
          speakContext(
            { action: "scan-detected", label: action.firstName },
            SCAN_LINES.detected,
          );
          break;
        }
        case "scan-camera-error": {
          speakContext(
            { action: "scan-camera-error" },
            SCAN_LINES.cameraError,
          );
          break;
        }
        case "scan-lookup": {
          // The caller is responsible for resolving the student record
          // and passing the first name; we just speak the canonical
          // "Identity confirmed. Welcome, X" line.
          const firstName =
            (action as { firstName?: string }).firstName ??
            action.id;
          speakContext(
            { action: "scan-lookup", label: firstName },
            SCAN_LINES.manualLookupSuccess(firstName),
          );
          break;
        }
        case "schedule": {
          speakContext({ action: "schedule" }, SCHEDULE_LINES.open);
          break;
        }
        case "map": {
          if (action.venue) {
            speakContext(
              { action: "map", label: action.venue },
              MAP_LINES.selected(action.venue),
            );
          } else {
            speakContext({ action: "map" }, MAP_LINES.open);
          }
          break;
        }
        case "ask-robot-intro": {
          speakContext(
            { action: "ask-robot-intro" },
            ASK_ROBOT_LINES.intro,
          );
          break;
        }
        case "ask-robot-thinking": {
          setThinking({ action: "ask-robot-thinking" }, ASK_ROBOT_LINES.thinking);
          break;
        }
        case "ask-robot-answer": {
          speakContext(
            { action: "ask-robot-answer" },
            action.text,
          );
          break;
        }
        case "ask-robot-empty": {
          speakContext(
            { action: "ask-robot-empty" },
            ASK_ROBOT_LINES.empty,
          );
          break;
        }
        case "stop": {
          stop();
          break;
        }
        case "text": {
          speakContext(
            { action: "text", label: action.label ?? action.text },
            action.text,
          );
          break;
        }
      }
    },
    [speakContext, setThinking, stop],
  );

  /* ─── Derived caption text for the HUD ─────────────────────── */

  const caption = useMemo(() => {
    if (state === "thinking") {
      return currentContext?.label ?? ASK_ROBOT_LINES.thinking;
    }
    if (state === "speaking" && lastText) {
      return lastText;
    }
    return ASK_ROBOT_LINES.idle;
  }, [state, lastText, currentContext]);

  const speak = useCallback(
    (text: string, label?: string) => {
      speakContext({ action: "text", label }, text);
    },
    [speakContext],
  );

  const value = useMemo<RobotVoiceContextValue>(
    () => ({
      state,
      speaking: status === "speaking",
      supported,
      lastText,
      currentContext,
      caption,
      speak,
      speakContext,
      setThinking,
      stop,
      dispatch,
    }),
    [
      state,
      status,
      supported,
      lastText,
      currentContext,
      caption,
      speak,
      speakContext,
      setThinking,
      stop,
      dispatch,
    ],
  );

  return (
    <RobotVoiceContext.Provider value={value}>
      {children}
    </RobotVoiceContext.Provider>
  );
}

export function useRobotVoice(): RobotVoiceContextValue {
  const ctx = useContext(RobotVoiceContext);
  if (!ctx) {
    throw new Error("useRobotVoice must be used inside a RobotVoiceProvider");
  }
  return ctx;
}

/** Convenience exports so other modules don't need to import from
 * `robotResponses.ts` for the one-line constants they need. */
export { WELCOME_LINE, ASK_ROBOT_LINES };
export type { EventFilter };
