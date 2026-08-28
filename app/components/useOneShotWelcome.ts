"use client";

import { useEffect, useRef } from "react";
import { useRobotVoice, WELCOME_LINE } from "./RobotVoice";

/**
 * useOneShotWelcome — speak the welcome line exactly once per browser
 * session, and only on the user's very first interaction with the page.
 *
 * The flag lives in `sessionStorage` keyed `asthra:welcome-spoken`.
 *   - On first visit of the session, the flag is absent; we speak the
 *     welcome line on the first pointerdown/keydown/touchstart.
 *   - On any subsequent visit within the same session, the flag is set
 *     and the hook is a no-op.
 *
 * This satisfies both requirements: no duplicate welcome on
 * /scan ↔ /events navigation (which would otherwise reload the page),
 * and no auto-play before a real user gesture.
 */
export function useOneShotWelcome() {
  const { speak, supported } = useRobotVoice();
  const firedRef = useRef(false);

  useEffect(() => {
    if (!supported || typeof window === "undefined") return;

    const KEY = "asthra:welcome-spoken";
    const alreadySpoken = window.sessionStorage.getItem(KEY) === "1";
    if (alreadySpoken) {
      firedRef.current = true;
      return;
    }

    function handler() {
      if (firedRef.current) return;
      firedRef.current = true;
      window.sessionStorage.setItem(KEY, "1");
      window.setTimeout(() => speak(WELCOME_LINE), 0);
      cleanup();
    }

    function cleanup() {
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("keydown", handler);
      window.removeEventListener("touchstart", handler);
    }

    window.addEventListener("pointerdown", handler, { once: true });
    window.addEventListener("keydown", handler, { once: true });
    window.addEventListener("touchstart", handler, { once: true });

    return cleanup;
  }, [speak, supported]);
}
