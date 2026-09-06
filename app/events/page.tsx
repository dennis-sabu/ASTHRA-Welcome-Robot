import { Suspense } from "react";
import EventsBrowser from "./EventsBrowser";
import PixelBlast from "@/app/components/PixelBlast";

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
    <div className="relative z-10 min-h-screen">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <PixelBlast
          variant="circle"
          color="#22d3ee"
          transparent
          speed={0.3}
          pixelSize={4}
          className="w-full h-full"
          style={{}}
        />
      </div>
      <Suspense fallback={<EventsFallback />}>
        <EventsBrowser />
      </Suspense>
    </div>
  );
}
