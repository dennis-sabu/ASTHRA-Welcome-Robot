"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  events,
  getDepartment,
  getEvent,
  type EventItem,
} from "@/lib/data";
import { useRobotVoice } from "../components/RobotVoice";
import { type EventFilter } from "@/lib/robotResponses";

export default function EventsBrowser() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialId = searchParams.get("event");
  const [selectedId, setSelectedId] = useState<string | null>(initialId);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<EventFilter>("all");
  const { dispatch, stop } = useRobotVoice();

  const filterTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectedId) params.set("event", selectedId);
    else params.delete("event");
    const qs = params.toString();
    router.replace(qs ? `/events?${qs}` : "/events", { scroll: false });
  }, [selectedId, router]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      dispatch({ type: "events-arrived" });
    }, 250);
    return () => {
      window.clearTimeout(t);
      if (filterTimerRef.current) window.clearTimeout(filterTimerRef.current);
    };
  }, [dispatch]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      if (filter !== "all" && e.type !== filter) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.room.toLowerCase().includes(q)
      );
    });
  }, [query, filter]);

  const selected = selectedId ? getEvent(selectedId) : null;
  const selectedDept = selected ? getDepartment(selected.department) : null;

  function handleSelect(id: string) {
    const event = getEvent(id);
    if (!event) {
      setSelectedId(id);
      return;
    }
    setSelectedId(id);
    stop();
    dispatch({ type: "event-loading", event });
    window.setTimeout(() => {
      dispatch({ type: "event-selected", event });
    }, 240);
  }

  function handleFilterChange(value: EventFilter) {
    setFilter(value);
    if (filterTimerRef.current) window.clearTimeout(filterTimerRef.current);
    filterTimerRef.current = window.setTimeout(() => {
      dispatch({ type: "filter", value });
    }, 350);
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden text-white" style={{ background: "#000" }}>
      {/* ── Nav bar ── */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between border-b px-6 py-4"
        style={{ background: "#000", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <Link
          href="/"
          data-robot-action="home"
          data-robot-from="events"
          className="inline-flex items-center gap-2 font-sans text-[14px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          style={{ color: "rgba(255,255,255,0.7)", letterSpacing: "-0.01em" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)")}
        >
          <BackIcon />
          Home
        </Link>

        {/* Asthra mark */}
        <span
          className="font-display text-white select-none"
          style={{ fontSize: "clamp(16px, 2vw, 20px)", letterSpacing: "-0.04em" }}
        >
          Asthra 11.0
        </span>

        <Link
          href="/scan"
          data-robot-action="scan"
          data-robot-from="events"
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
          <ScanIcon />
          Scan ID
        </Link>
      </header>

      {/* ── Hero band ── */}
      <section className="px-6 lg:px-12 pt-14 pb-10" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-[1200px] mx-auto">
          <p
            className="font-sans font-semibold uppercase tracking-[0.14em] mb-4"
            style={{ fontSize: "clamp(11px, 1.2vw, 13px)", color: "rgba(255,255,255,0.45)" }}
          >
            What&apos;s on
          </p>
          <h1
            className="font-display text-white"
            style={{
              fontSize: "clamp(42px, 7vw, 90px)",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
            }}
          >
            Find an event
            <span style={{ color: "#fff" }}>.</span>
          </h1>

          {/* Search bar */}
          <div
            className="mt-8 flex flex-col sm:flex-row gap-2 items-stretch rounded-full p-2"
            style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="relative flex-1">
              <SearchIconAbsolute />
              <label htmlFor="event-search" className="sr-only">
                Search events
              </label>
              <input
                id="event-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, venue, or room…"
                className="w-full pl-11 pr-4 py-3.5 bg-transparent font-sans text-[15px] text-white placeholder:text-white/35 focus:outline-none"
                style={{ letterSpacing: "-0.01em" }}
              />
            </div>
            <div className="flex gap-1.5 p-1" role="tablist" aria-label="Filter by type">
              {(["all", "event", "workshop"] as const).map((f) => (
                <button
                  key={f}
                  role="tab"
                  aria-selected={filter === f}
                  onClick={() => handleFilterChange(f)}
                  className="rounded-full font-sans font-semibold capitalize transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                  style={{
                    padding: "10px 18px",
                    fontSize: "clamp(12px, 1.3vw, 14px)",
                    letterSpacing: "-0.01em",
                    background: filter === f ? "#fff" : "transparent",
                    color: filter === f ? "#000" : "rgba(255,255,255,0.6)",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <p
            className="mt-3 font-sans text-[13px]"
            style={{ color: "rgba(255,255,255,0.4)" }}
            aria-live="polite"
          >
            {filtered.length} {filtered.length === 1 ? "result" : "results"}
            {query && (
              <>
                {" "}for{" "}
                <span className="font-semibold text-white">&ldquo;{query}&rdquo;</span>
              </>
            )}
          </p>
        </div>
      </section>

      {/* ── Events list + detail ── */}
      <section className="px-6 lg:px-12 py-10">
        <div className="max-w-[1200px] mx-auto grid lg:grid-cols-[1fr_380px] gap-8">

          {/* Event cards */}
          <div>
            {filtered.length === 0 ? (
              <p className="text-center py-16 font-sans text-[15px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                No events match your search.
              </p>
            ) : (
              <ul className="grid sm:grid-cols-2 gap-4">
                {filtered.map((e) => {
                  const dept = getDepartment(e.department)!;
                  const isActive = selectedId === e.id;
                  return (
                    <li key={e.id}>
                      <button
                        onClick={() => handleSelect(e.id)}
                        data-robot-action="event"
                        data-event-id={e.id}
                        aria-pressed={isActive}
                        className="w-full text-left rounded-[20px] p-5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                        style={{
                          background: isActive ? "#111" : "#0a0a0a",
                          border: `1px solid ${isActive ? "#fff" : "rgba(255,255,255,0.08)"}`,
                          boxShadow: isActive ? "0 0 0 1px rgba(255,255,255,0.12)" : "none",
                        }}
                        onMouseEnter={(el) => {
                          if (!isActive) (el.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.18)";
                        }}
                        onMouseLeave={(el) => {
                          if (!isActive) (el.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className="rounded-full font-sans font-semibold uppercase"
                            style={{
                              padding: "4px 10px",
                              fontSize: "11px",
                              letterSpacing: "0.08em",
                              background: "rgba(255,255,255,0.08)",
                              color: "rgba(255,255,255,0.75)",
                            }}
                          >
                            {e.type === "workshop" ? "Workshop" : "Event"}
                          </span>
                          <span
                            className="font-mono-tech text-[12px]"
                            style={{ color: "rgba(255,255,255,0.4)" }}
                          >
                            {e.time}
                          </span>
                        </div>

                        <h3
                          className="font-display text-white"
                          style={{ fontSize: "clamp(20px, 2.5vw, 26px)", lineHeight: 1.05 }}
                        >
                          {e.name}
                        </h3>

                        <p
                          className="mt-1 font-sans font-semibold uppercase tracking-[0.08em]"
                          style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}
                        >
                          {dept.shortName}
                        </p>

                        <p
                          className="mt-2 font-sans text-[13px] line-clamp-2"
                          style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}
                        >
                          {e.description}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Detail panel */}
          <aside className="lg:sticky lg:top-[73px] self-start">
            <div
              className="rounded-[20px] p-6"
              style={{
                background: "#0a0a0a",
                border: "1px solid rgba(255,255,255,0.08)",
                minHeight: 400,
              }}
            >
              {selected && selectedDept ? (
                <EventDetail event={selected} deptName={selectedDept.name} />
              ) : (
                <EmptyDetail />
              )}
            </div>
          </aside>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 lg:px-12 py-6 border-t font-sans text-[13px]"
        style={{ borderColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}
      >
        <div className="max-w-[1200px] mx-auto">
          © {new Date().getFullYear()} Asthra Tech Fest · SJCET Palai
        </div>
      </footer>
    </main>
  );
}

function EmptyDetail() {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full py-16">
      <div
        className="flex items-center justify-center rounded-full mb-5"
        style={{ width: 52, height: 52, background: "#111", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <PinIcon />
      </div>
      <p
        className="font-display text-white"
        style={{ fontSize: "clamp(22px, 2.5vw, 28px)", lineHeight: 1.05 }}
      >
        Pick an event
      </p>
      <p
        className="mt-2 font-sans text-[14px]"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        Tap any event to see its details.
      </p>
    </div>
  );
}

function EventDetail({
  event,
  deptName,
}: {
  event: EventItem;
  deptName: string;
}) {
  return (
    <div className="animate-fade-up" data-robot-caption={event.name}>
      {/* Type badge */}
      <span
        className="inline-block rounded-full font-sans font-semibold uppercase"
        style={{
          padding: "4px 12px",
          fontSize: "11px",
          letterSpacing: "0.08em",
          background: "rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.75)",
        }}
      >
        {event.type === "workshop" ? "Workshop" : "Event"}
      </span>

      {/* Name */}
      <h2
        className="font-display text-white mt-4"
        style={{ fontSize: "clamp(28px, 3.5vw, 38px)", lineHeight: 1.02 }}
      >
        {event.name}
      </h2>

      <p
        className="mt-1 font-sans text-[13px]"
        style={{ color: "rgba(255,255,255,0.45)" }}
      >
        {deptName}
      </p>

      <p
        className="mt-4 font-sans text-[14px] leading-[22px]"
        style={{ color: "rgba(255,255,255,0.75)" }}
      >
        {event.description}
      </p>

      {/* Metadata rows */}
      <div className="mt-6 flex flex-col gap-3">
        <MetaRow icon={<PinIcon />} label="Venue" value={event.venue} />

        {/* Room — large display */}
        <div
          className="rounded-[14px] p-4"
          style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <p
            className="font-sans font-semibold uppercase tracking-[0.1em] mb-1"
            style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}
          >
            Room
          </p>
          <p
            className="font-display"
            style={{ fontSize: "clamp(32px, 4vw, 44px)", color: "#fff", lineHeight: 1 }}
          >
            {event.room}
          </p>
        </div>

        <MetaRow icon={<ClockIcon />} label="Time" value={event.time} />
      </div>

      {/* Navigation hint */}
      <div
        className="mt-5 rounded-[14px] p-4"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <p
          className="font-sans font-semibold uppercase tracking-[0.1em] mb-1"
          style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}
        >
          How to get there
        </p>
        <p className="font-sans text-[13px] leading-[20px]" style={{ color: "rgba(255,255,255,0.7)" }}>
          Head to{" "}
          <span className="font-semibold text-white">{event.venue}</span>, then
          look for{" "}
          <span style={{ fontWeight: 600, color: "#fff" }}>{event.room}</span>.
          Volunteers can help if you get lost.
        </p>
      </div>
    </div>
  );
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-[14px] p-4"
      style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div
        className="shrink-0 flex items-center justify-center rounded-full"
        style={{
          width: 36,
          height: 36,
          background: "rgba(255,255,255,0.05)",
          color: "var(--accent)",
        }}
      >
        {icon}
      </div>
      <div>
        <p
          className="font-sans font-semibold uppercase tracking-[0.1em]"
          style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}
        >
          {label}
        </p>
        <p className="mt-0.5 font-sans font-semibold text-white text-[14px]">{value}</p>
      </div>
    </div>
  );
}

/* ── Icons ── */
function BackIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function SearchIconAbsolute() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: "rgba(255,255,255,0.35)" }}>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
