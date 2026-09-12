import { supabase } from "./supabase";

export interface FeedbackRatings {
  q1_overall_design: number;
  q2_ui_visual: number;
  q3_id_scanning: number;
  q4_event_registration: number;
  q5_overall_experience: number;
}

export interface SubmitResult {
  success: boolean;
  error?: string;
}

/**
 * Inserts one anonymous feedback row into the `feedbacks` table.
 *
 * @param ratings  - The 5 star ratings mapped to their column names.
 * @param sessionId - A UUID generated once per browser session (stored in sessionStorage)
 *                   so we can group answers from the same visitor without any login.
 */
export async function submitFeedback(
  ratings: FeedbackRatings,
  sessionId: string
): Promise<SubmitResult> {
  const userAgent =
    typeof window !== "undefined" ? window.navigator.userAgent : null;

  const { error } = await supabase.from("feedbacks").insert({
    session_id: sessionId,
    ...ratings,
    user_agent: userAgent,
    // submitted_at defaults to now() in the DB
  });

  if (error) {
    console.error("[feedbackActions] Supabase insert error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Returns (or lazily creates) a stable session UUID for this browser tab.
 * Stored in sessionStorage so it persists across soft navigations but resets
 * when the user opens a fresh tab — giving each "visit" its own identity
 * without any login.
 */
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return crypto.randomUUID();

  const KEY = "asthra_feedback_session";
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(KEY, id);
  }
  return id;
}
