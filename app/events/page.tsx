import { Suspense } from "react";
import EventsBrowser from "./EventsBrowser";

export const metadata = {
  title: "Explore Events · Asthra",
  description: "Search and find every event and workshop at Asthra.",
};

function EventsFallback() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center text-white/60">
      Loading events…
    </main>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<EventsFallback />}>
      <EventsBrowser />
    </Suspense>
  );
}
