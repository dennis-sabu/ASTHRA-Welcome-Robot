/**
 * robotResponses — the single source of truth for every line the robot
 * ever says. Keeping all utterances here makes it easy to audit tone,
 * to localize the assistant later, and to swap in an AI-generated
 * response while keeping the rest of the architecture untouched.
 *
 * All functions are pure: they take data and return a string. No side
 * effects, no DOM access, no speech synthesis. The RobotVoice provider
 * is the only thing that actually calls `speechSynthesis.speak`.
 */

import type { EventItem } from "./data";
import { events as ALL_EVENTS } from "./data";

/* ────────────────────────── Constants ────────────────────────── */

export const WELCOME_LINE =
  "Welcome to Asthra 11.0! I'm your virtual tech-fest assistant. How can I help you?";

/* ────────────────────────── Navigation ────────────────────────── */

export const NAV_LINES = {
  homeFromEvents: "Taking you back to the Asthra home screen.",
  homeFromScan: "Returning to the Asthra home screen.",
  scanFromHome: "Opening the ID verification station.",
  scanFromEvents: "Opening ID verification. Scan your college ID to continue.",
  eventsFromHome: "Opening the Asthra event directory.",
  eventsFromScan: "Let's explore the events.",
} as const;

/* ────────────────────────── Event directory ────────────────────────── */

export const EVENTS_LINES = {
  loading: "Loading the event directory. Let me show you what's happening at Asthra.",
  arrived:
    "Here are the events and workshops at Asthra. Select one and I'll tell you what it is and where it's happening.",
} as const;

/* ────────────────────────── Filters ────────────────────────── */

export const FILTER_LINES = {
  all: "Showing all Asthra events and workshops.",
  event: "Showing the competitions and events.",
  workshop: "Showing the available workshops.",
} as const;

export type EventFilter = keyof typeof FILTER_LINES;

/* ────────────────────────── Schedule / map ────────────────────────── */

export const SCHEDULE_LINES = {
  open: "Opening the Asthra schedule. I'll help you find what's happening and when.",
} as const;

export const MAP_LINES = {
  open: "Opening the Asthra venue map. Select an event or location and I'll help you find it.",
  selected: (venue: string) =>
    `This event is being conducted at ${venue}.`,
} as const;

/* ────────────────────────── Scan ────────────────────────── */

export const SCAN_LINES = {
  cameraStart: "Starting the ID scan. Please hold your ID card steady inside the scan area.",
  processing: "Analyzing ID card. Please hold still.",
  recognized: (firstName: string) =>
    `Identity confirmed. Welcome, ${firstName}. Enjoy Asthra!`,
  cameraError:
    "I couldn't access the camera. Please allow camera access and try again.",
  scanError: "I couldn't read the ID clearly. Please hold it steady and try again.",
  networkError: "The scanner is temporarily unavailable. Please try again in a moment.",
} as const;

/* ────────────────────────── Ask Robot ────────────────────────── */

export const ASK_ROBOT_LINES = {
  intro:
    "Sure. Ask me about events, workshops, venues, schedules, registration, or anything related to Asthra.",
  idle: "How can I help?",
  thinking: "Thinking…",
  empty:
    "I didn't catch that. Try asking about an event, a venue, or say list events.",
} as const;

/* ────────────────────────── Event explanation ────────────────────────── */

/**
 * The short, two-step line spoken the moment the user selects an event.
 * Always references the event by name so the visitor hears immediate
 * confirmation that their click landed on the right item.
 */
export function getEventLoadingLine(event: EventItem): string {
  return `Let me check the details for ${event.name}.`;
}

/**
 * The full explanation the robot reads after the event panel updates.
 * Targets 1–3 sentences and never reads the description verbatim —
 * instead it summarises the description into a conversational clause
 * and always cites the venue (and room, when available) in plain prose.
 */
export function getEventExplanationLine(event: EventItem): string {
  const summary = summariseDescription(event.description);
  const where = formatLocation(event);
  return `${event.name}. ${summary} ${where}`;
}

/**
 * Render the venue + room in conversational prose.
 * - "It's being conducted at the Main Block." (venue only)
 * - "It's being conducted in the Main Block, Lab 204." (venue + room)
 * - "It's being conducted in Lab 204." (room only)
 */
export function formatLocation(event: EventItem): string {
  const venue = event.venue?.trim();
  const room = event.room?.trim();
  if (venue && room) {
    // Avoid "Main Block, Main Block, Lab 101" duplication if the room
    // string already starts with the venue.
    if (room.toLowerCase().startsWith(venue.toLowerCase())) {
      return `It's being conducted in ${room}.`;
    }
    return `It's being conducted in ${venue}, ${room}.`;
  }
  if (venue) return `It's being conducted at ${venue}.`;
  if (room) return `It's being conducted in ${room}.`;
  return "The location hasn't been announced yet.";
}

/**
 * Shorten a long event description into one short conversational clause.
 * Strips trailing punctuation, keeps the first complete sentence, and
 * always trims to roughly ~140 characters so the robot never rambles.
 */
export function summariseDescription(description: string): string {
  const trimmed = description.trim();
  if (!trimmed) return "Details will be announced soon.";

  // Take the first sentence (terminated by ., !, ?).
  const firstSentence = trimmed.split(/(?<=[.!?])\s+/)[0] ?? trimmed;

  if (firstSentence.length <= 160) return firstSentence.trim();
  // Hard cap on very long single sentences.
  const sliced = `${firstSentence.slice(0, 157).trimEnd()}…`;
  return sliced;
}

/* ────────────────────────── Ask-Robot intent matching ────────────────────────── */

/**
 * A tiny structured intent matcher. Each matcher has a regex pattern and
 * a builder that turns the matched query into a robot line. We check the
 * patterns in order and return the first match — keep more specific
 * patterns before more general ones.
 */
type Intent = {
  pattern: RegExp;
  build: (match: RegExpMatchArray, query: string) => string | null;
};

function findEventByName(query: string): EventItem | undefined {
  const q = query.toLowerCase();
  // Try an exact match first, then a substring match.
  return (
    ALL_EVENTS.find((e) => e.name.toLowerCase() === q) ??
    ALL_EVENTS.find((e) => e.name.toLowerCase().includes(q)) ??
    ALL_EVENTS.find((e) => q.includes(e.name.toLowerCase()))
  );
}

function findEventsByDepartment(query: string): EventItem[] {
  const q = query.toLowerCase();
  // Map common abbreviations to the department IDs used in data.ts.
  const aliasMap: Record<string, string> = {
    cse: "cse",
    "computer science": "cse",
    ece: "ece",
    electronics: "ece",
    eee: "eee",
    electrical: "eee",
    mech: "mech",
    mechanical: "mech",
    civil: "civil",
    it: "it",
    "information technology": "it",
  };
  const matchedId = Object.keys(aliasMap).find((k) => q.includes(k));
  if (!matchedId) return [];
  const targetId = aliasMap[matchedId];
  return ALL_EVENTS.filter((e) => e.department === targetId);
}

const ASK_INTENTS: Intent[] = [
  {
    // "what is X" / "tell me about X" / "what's X"
    pattern: /\b(what(?:'s| is)?|tell me about|describe|explain)\b[\s:]+(.+)/i,
    build: (_m, query) => {
      const name = extractNameAfterQuestion(query);
      if (!name) return null;
      const event = findEventByName(name);
      if (!event) {
        return `I couldn't find an event called ${name}. Try the event directory to browse the full list.`;
      }
      return getEventExplanationLine(event);
    },
  },
  {
    // "where is X" / "where's X" / "location of X"
    pattern: /\bwhere(?:'s| is)?\b[\s:]+(.+)/i,
    build: (_m, query) => {
      const name = extractNameAfterQuestion(query);
      if (!name) return null;
      const event = findEventByName(name);
      if (!event) {
        return `I couldn't find an event called ${name}. Try the event directory to browse the full list.`;
      }
      return formatLocation(event);
    },
  },
  {
    // "when is X" / "what time is X"
    pattern: /\b(when|what time)\b[\s:]+(.+)/i,
    build: (_m, query) => {
      const name = extractNameAfterQuestion(query);
      if (!name) return null;
      const event = findEventByName(name);
      if (!event) {
        return `I couldn't find an event called ${name}. Try the event directory to browse the full list.`;
      }
      return `${event.name} is scheduled for ${event.time}.`;
    },
  },
  {
    // "list events" / "what events" / "show me events"
    pattern: /\b(list|show|what)\b.*\bevents?\b/i,
    build: () => {
      return `There are ${ALL_EVENTS.length} events and workshops across multiple departments. Open the event directory and I'll help you explore them.`;
    },
  },
  {
    // "list workshops"
    pattern: /\b(list|show|what)\b.*\bworkshops?\b/i,
    build: () => {
      const count = ALL_EVENTS.filter((e) => e.type === "workshop").length;
      return `There are ${count} workshops at Asthra. Switch the directory filter to workshops to see them.`;
    },
  },
  {
    // department-specific
    pattern: /\b(cse|computer science|ece|eee|mech|civil|it)\b/i,
    build: (_m, query) => {
      const matches = findEventsByDepartment(query);
      if (!matches.length) return null;
      const names = matches.slice(0, 3).map((e) => e.name).join(", ");
      const more = matches.length > 3 ? ` and ${matches.length - 3} more` : "";
      return `The ${query.toUpperCase()} events include ${names}${more}. Open the event directory for the full list.`;
    },
  },
];

/**
 * For "what is Robo Race", strip the leading question to get "Robo Race".
 * For "tell me about AI/ML Workshop", strip "tell me about" to get the name.
 */
function extractNameAfterQuestion(query: string): string | null {
  const cleaned = query
    .replace(
      /\b(what(?:'s| is)?|tell me about|describe|explain|where(?:'s| is)?|when is|what time is)\b/gi,
      "",
    )
    .replace(/[?!.]/g, "")
    .trim();
  return cleaned || null;
}

export function answerAskRobot(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) return ASK_ROBOT_LINES.empty;
  for (const intent of ASK_INTENTS) {
    const match = trimmed.match(intent.pattern);
    if (!match) continue;
    const line = intent.build(match, trimmed);
    if (line) return line;
  }
  return ASK_ROBOT_LINES.empty;
}
