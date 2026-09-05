"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
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
  const [qrEvent, setQrEvent] = useState<EventItem | null>(null);

  const filterTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectedId) params.set("event", selectedId);
    else params.delete("event");
    const qs = params.toString();
    router.replace(qs ? `/events?${qs}` : "/events", { scroll: false });
  }, [selectedId, router]);

  // Close QR modal whenever user switches to a different event
  useEffect(() => { setQrEvent(null); }, [selectedId]);

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
      if (filter !== "all") {
        if (filter === "competition" && e.type !== "competition" && e.type !== "event") return false;
        if (filter === "workshop" && e.type !== "workshop") return false;
        if (filter === "exhibition" && e.type !== "exhibition") return false;
        if (filter === "event" && e.type !== "event" && e.type !== "competition") return false;
      }
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        (e.room ? e.room.toLowerCase().includes(q) : false) ||
        (e.day ? e.day.toLowerCase().includes(q) : false) ||
        (e.date ? e.date.toLowerCase().includes(q) : false)
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
    <main className="relative min-h-screen w-full overflow-x-hidden text-white">
            {/* ── Nav bar ── */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between border-b px-6 py-4"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)", borderColor: "rgba(255,255,255,0.08)" }}
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
            <div className="flex flex-wrap gap-1.5 p-1" role="tablist" aria-label="Filter by type">
              {([
                { id: "all", label: "All" },
                { id: "competition", label: "Competitions" },
                { id: "workshop", label: "Workshops" },
                { id: "exhibition", label: "Exhibitions" },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={filter === tab.id}
                  onClick={() => handleFilterChange(tab.id as EventFilter)}
                  className="rounded-full font-sans font-semibold capitalize transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                  style={{
                    padding: "10px 18px",
                    fontSize: "clamp(12px, 1.3vw, 14px)",
                    letterSpacing: "-0.01em",
                    background: filter === tab.id ? "#fff" : "transparent",
                    color: filter === tab.id ? "#000" : "rgba(255,255,255,0.6)",
                  }}
                >
                  {tab.label}
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

      {/* ── Events list (full width) ── */}
      <section className="px-6 lg:px-12 py-10">
        <div className="max-w-[1200px] mx-auto">

          {/* Event cards — full-width 3-col grid */}
          {filtered.length === 0 ? (
            <p className="text-center py-16 font-sans text-[15px]" style={{ color: "rgba(255,255,255,0.4)" }}>
              No events match your search.
            </p>
          ) : (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((e) => {
                const dept = getDepartment(e.department);
                const isActive = selectedId === e.id;
                return (
                  <li key={e.id}>
                    <button
                      onClick={() => handleSelect(e.id)}
                      data-robot-action="event"
                      data-event-id={e.id}
                      aria-pressed={isActive}
                      className="group w-full text-left rounded-[20px] p-5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer flex flex-col justify-between"
                      style={{
                        background: "#0a0a0a",
                        border: `1px solid rgba(255,255,255,0.08)`,
                      }}
                      onMouseEnter={(el) => {
                        (el.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.22)";
                      }}
                      onMouseLeave={(el) => {
                        (el.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                      }}
                    >
                      <div>
                        {/* Event image — 4:5 portrait to match 640×800 px assets */}
                        {e.image && (
                          <div
                            className="relative w-full rounded-[14px] overflow-hidden mb-4 bg-[#141414] border border-white/5"
                            style={{ aspectRatio: "4/5" }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={e.image}
                              alt={e.name}
                              loading="lazy"
                              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                            {typeof e.registrationRequired === "boolean" && (
                              <span
                                className="absolute top-2.5 right-2.5 rounded-full font-sans font-semibold text-[10px] tracking-wider uppercase px-2.5 py-1 backdrop-blur-md"
                                style={{
                                  background: e.registrationRequired ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.92)",
                                  color: e.registrationRequired ? "#fff" : "#000",
                                  border: e.registrationRequired ? "1px solid rgba(255,255,255,0.2)" : "none",
                                }}
                              >
                                {e.registrationRequired ? "Reg. Required" : "Open Entry"}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-3 gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className="rounded-full font-sans font-semibold uppercase"
                              style={{
                                padding: "3px 9px",
                                fontSize: "10.5px",
                                letterSpacing: "0.08em",
                                background: "rgba(255,255,255,0.08)",
                                color: "rgba(255,255,255,0.8)",
                              }}
                            >
                              {e.type}
                            </span>
                            {e.day && (
                              <span
                                className="rounded-full font-mono-tech text-[10.5px] px-2 py-0.5"
                                style={{
                                  background: "rgba(255,255,255,0.05)",
                                  color: "rgba(255,255,255,0.6)",
                                  border: "1px solid rgba(255,255,255,0.08)",
                                }}
                              >
                                {e.day}
                              </span>
                            )}
                          </div>
                          <span
                            className="font-mono-tech text-[12px] shrink-0"
                            style={{ color: "rgba(255,255,255,0.4)" }}
                          >
                            {e.time ?? (e.date ? e.date : "")}
                          </span>
                        </div>

                        <h3
                          className="font-display text-white"
                          style={{ fontSize: "clamp(20px, 2.5vw, 24px)", lineHeight: 1.08 }}
                        >
                          {e.name}
                        </h3>

                        <p
                          className="mt-1 font-sans font-semibold uppercase tracking-[0.08em]"
                          style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}
                        >
                          {dept?.shortName ?? "ASTHRA"} · {e.venue}
                        </p>

                        <p
                          className="mt-2 font-sans text-[13px] line-clamp-2"
                          style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}
                        >
                          {e.description}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* ── Event Detail Floating Modal ── */}
      {selected && selectedDept && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-8"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}
          onClick={() => setSelectedId(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selected.name}
        >
          {/* Modal card — two-column, large */}
          <div
            className="relative w-full flex rounded-[28px] overflow-hidden"
            style={{
              maxWidth: 900,
              height: "min(88vh, 700px)",
              background: "#0a0a0a",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 48px 120px rgba(0,0,0,0.85)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedId(null)}
              className="absolute top-5 right-5 z-10 flex items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
              style={{ width: 36, height: 36, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)" }}
              aria-label="Close"
            >
              <CloseIcon />
            </button>

            {/* Left — full-height image */}
            {selected.image && (
              <div className="hidden sm:block shrink-0 w-[320px] bg-[#111]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selected.image}
                  alt={selected.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Right — flex column: scrollable details + pinned register button */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* Scrollable content */}
              <div
                className="flex-1 overflow-y-auto p-7 pt-6 pb-4"
                style={{ scrollbarWidth: "none" }}
              >
                <EventDetail
                  event={selected}
                  deptName={selectedDept.name}
                  onRegister={() => setQrEvent(selected)}
                  hideImage
                  hideRegisterButton
                />
              </div>

              {/* Pinned footer — always visible, never needs scrolling */}
              {selected.registrationUrl && (
                <div
                  className="shrink-0 px-7 py-5"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <button
                    onClick={() => setQrEvent(selected)}
                    className="w-full flex items-center justify-center gap-2.5 rounded-[14px] font-sans font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                    style={{
                      padding: "14px 20px",
                      fontSize: "15px",
                      background: "#fff",
                      color: "#000",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    <QrIcon />
                    {selected.registrationRequired === false ? "View Event Page" : "Register Now"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer
        className="px-6 lg:px-12 py-6 border-t font-sans text-[13px]"
        style={{ borderColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}
      >
        <div className="max-w-[1200px] mx-auto">
          © {new Date().getFullYear()} Asthra Tech Fest · SJCET Palai
        </div>
      </footer>

      {/* ── QR Registration Modal ── */}
      {qrEvent && qrEvent.registrationUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.80)", backdropFilter: "blur(6px)" }}
          onClick={() => setQrEvent(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Register for ${qrEvent.name}`}
        >
          {/* Modal card — stop click from bubbling to backdrop */}
          <div
            className="relative w-full max-w-[340px] rounded-[24px] p-7 flex flex-col items-center gap-5"
            style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setQrEvent(null)}
              className="absolute top-4 right-4 flex items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
              style={{ width: 32, height: 32, background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}
              aria-label="Close"
            >
              <CloseIcon />
            </button>

            {/* Event name */}
            <div className="text-center pt-1">
              <p className="font-sans font-semibold text-[11px] uppercase tracking-[0.12em] mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                {qrEvent.registrationRequired ? "Registration" : "Event Page"}
              </p>
              <h3 className="font-display text-white" style={{ fontSize: "clamp(20px, 3vw, 24px)", lineHeight: 1.1 }}>
                {qrEvent.name}
              </h3>
            </div>

            {/* QR code */}
            <div className="rounded-[14px] p-4" style={{ background: "#fff" }}>
              <QRCodeSVG
                value={qrEvent.registrationUrl}
                size={200}
                bgColor="#ffffff"
                fgColor="#000000"
                level="M"
              />
            </div>

            {/* Instruction */}
            <div className="text-center">
              <p className="font-sans font-semibold text-[12px] uppercase tracking-[0.1em] mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                Scan to {qrEvent.registrationRequired ? "register" : "view"}
              </p>
              <p className="font-sans text-[11px] break-all" style={{ color: "rgba(255,255,255,0.25)" }}>
                {qrEvent.registrationUrl}
              </p>
            </div>

            {/* Tap outside hint */}
            <p className="font-sans text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>
              Tap outside to go back
            </p>
          </div>
        </div>
      )}
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
  onRegister,
  hideImage = false,
  hideRegisterButton = false,
}: {
  event: EventItem;
  deptName: string;
  onRegister: () => void;
  hideImage?: boolean;
  hideRegisterButton?: boolean;
}) {
  const isOpenEntry = event.registrationRequired === false;

  return (
    <div className="animate-fade-up" data-robot-caption={event.name}>
      {/* Event image — hidden when shown in two-col modal (left panel handles it) */}
      {event.image && !hideImage && (
        <div
          className="relative w-full rounded-[16px] overflow-hidden mb-5 bg-[#141414] border border-white/10"
          style={{ aspectRatio: "4/5" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.image}
            alt={event.name}
            className="w-full h-full object-contain"
          />
        </div>
      )}

      {/* Badges row */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span
          className="inline-block rounded-full font-sans font-semibold uppercase"
          style={{
            padding: "4px 12px",
            fontSize: "11px",
            letterSpacing: "0.08em",
            background: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.85)",
          }}
        >
          {event.type}
        </span>
        {event.day && (
          <span
            className="inline-block rounded-full font-mono-tech text-[11px] px-2.5 py-1"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.75)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {event.day}
          </span>
        )}
        {typeof event.registrationRequired === "boolean" && (
          <span
            className="inline-block rounded-full font-sans font-semibold text-[10px] uppercase tracking-wider px-2.5 py-1"
            style={{
              background: event.registrationRequired ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.92)",
              color: event.registrationRequired ? "rgba(255,255,255,0.85)" : "#000",
              border: event.registrationRequired ? "1px solid rgba(255,255,255,0.2)" : "none",
            }}
          >
            {event.registrationRequired ? "Registration Required" : "Open / Walk-in"}
          </span>
        )}
      </div>

      {/* Name */}
      <h2
        className="font-display text-white mt-3"
        style={{ fontSize: "clamp(26px, 3.2vw, 36px)", lineHeight: 1.05 }}
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

        {/* Room — large display if available */}
        {event.room && (
          <div
            className="rounded-[14px] p-4"
            style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p
              className="font-sans font-semibold uppercase tracking-[0.1em] mb-1"
              style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}
            >
              Room / Lab
            </p>
            <p
              className="font-display"
              style={{ fontSize: "clamp(28px, 3.5vw, 38px)", color: "#fff", lineHeight: 1 }}
            >
              {event.room}
            </p>
          </div>
        )}

        <MetaRow
          icon={<ClockIcon />}
          label="Time & Schedule"
          value={event.time ?? (event.date ? `${event.day ? event.day + " · " : ""}${event.date}` : "Scheduled during fest")}
        />

        {typeof event.registrationRequired === "boolean" && (
          <MetaRow
            icon={<TicketIcon />}
            label="Registration"
            value={event.registrationRequired ? "Pre-registration required to participate" : "Open entry · No pre-registration needed"}
          />
        )}
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
          {event.room ? (
            <>
              Head to <span className="font-semibold text-white">{event.venue}</span>, then look for{" "}
              <span style={{ fontWeight: 600, color: "#fff" }}>{event.room}</span>. Volunteers can help if you get lost.
            </>
          ) : (
            <>
              Head to <span className="font-semibold text-white">{event.venue}</span>. Event staff and student volunteers will guide you to the area.
            </>
          )}
        </p>
      </div>

      {/* ── Register button ── */}
      {event.registrationUrl && !hideRegisterButton && (
        <button
          onClick={onRegister}
          className="mt-5 w-full flex items-center justify-center gap-2.5 rounded-[14px] font-sans font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
          style={{
            padding: "14px 20px",
            fontSize: "15px",
            background: "#fff",
            color: "#000",
            letterSpacing: "-0.01em",
          }}
        >
          <QrIcon />
          {isOpenEntry ? "View Event Page" : "Register Now"}
        </button>
      )}
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

function TicketIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
      <path d="M13 5v2" />
      <path d="M13 11v2" />
      <path d="M13 17v2" />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="5" height="5" rx="1" />
      <rect x="16" y="3" width="5" height="5" rx="1" />
      <rect x="3" y="16" width="5" height="5" rx="1" />
      <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
      <path d="M21 21v.01" />
      <path d="M12 7v3a2 2 0 0 1-2 2H7" />
      <path d="M3 12h.01" />
      <path d="M12 3h.01" />
      <path d="M12 16v.01" />
      <path d="M16 12h1" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 shrink-0 transition-transform duration-200"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
