"use client";

import { useEffect } from "react";
import { useRobotVoice } from "./RobotVoice";
import { getEvent } from "@/lib/data";

/**
 * GlobalActionBridge — a document-level click listener that lets any
 * element on any page drive the robot just by adding a
 * `data-robot-action="…"` attribute. It reads:
 *
 *   data-robot-action="event-directory"     → nav cue + loading line
 *   data-robot-action="scan"               → nav cue
 *   data-robot-action="home"               → nav cue
 *   data-robot-action="schedule"           → schedule opener
 *   data-robot-action="map"                → map opener (optional data-venue)
 *   data-robot-action="filter"             → filter announcement (data-value)
 *   data-robot-action="event"              → event selected (data-event-id)
 *   data-robot-action="event-loading"      → event loading line (data-event-id)
 *
 * It deliberately does NOT intercept the click — navigation proceeds
 * normally. The cue is the audio feedback; routing is the user's click.
 */
export default function GlobalActionBridge() {
  const { dispatch, speakContext, setThinking } = useRobotVoice();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target;
      if (!(target instanceof Element)) return;

      // Walk up to find the nearest element declaring data-robot-action.
      // This lets users put the attribute on a wrapper or on the button itself.
      let node: Element | null = target;
      let action: string | null = null;
      while (node) {
        action = node.getAttribute("data-robot-action");
        if (action) break;
        node = node.parentElement;
      }
      if (!action) return;

      switch (action) {
        case "event-directory": {
          dispatch({ type: "event-directory" });
          break;
        }
        case "scan": {
          dispatch({ type: "scan" });
          break;
        }
        case "home": {
          dispatch({ type: "home" });
          break;
        }
        case "schedule": {
          dispatch({ type: "schedule" });
          break;
        }
        case "map": {
          const venue = target
            .closest("[data-robot-action='map']")
            ?.getAttribute("data-venue");
          dispatch({ type: "map", venue: venue ?? undefined });
          break;
        }
        case "filter": {
          const value = (
            target
              .closest("[data-robot-action='filter']")
              ?.getAttribute("data-value") ?? "all"
          ) as "all" | "event" | "workshop";
          dispatch({ type: "filter", value });
          break;
        }
        case "event": {
          const id = target
            .closest("[data-robot-action='event']")
            ?.getAttribute("data-event-id");
          if (!id) break;
          const event = getEvent(id);
          if (!event) break;
          // Two-step speech: short loading line, then the explanation
          // is dispatched by the page once the detail panel updates.
          dispatch({ type: "event-loading", event });
          break;
        }
        default: {
          // Unknown action — ignore.
          break;
        }
      }
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [dispatch, speakContext, setThinking]);

  return null;
}
