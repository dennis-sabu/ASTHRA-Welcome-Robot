"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useOneShotWelcome } from "./useOneShotWelcome";

/**
 * HeroShell — full-page single-viewport layout.
 *
 * Three vertical regions:
 *   1. Header   — shrink-0, slideDown animation
 *   2. Hero     — flex-1, centered content
 *   3. Stats    — shrink-0, 4 count-up metrics
 *
 * Robot welcome fires once per session via useOneShotWelcome.
 * Navigation links carry data-robot-action for GlobalActionBridge.
 */
export default function HeroShell() {
  useOneShotWelcome();

  return (
    <section
      className="relative z-10 h-dvh w-full flex flex-col overflow-hidden"
      style={{
        padding:
          "clamp(16px, 2.4vh, 28px) clamp(14px, 3vw, 32px)",
      }}
    >
      {/* 1 — Header */}
      <SiteHeader />

      {/* 2 — Hero (grows to fill remaining space) */}
      <HeroCenter />

      {/* 3 — Stats footer */}
      <StatsRow />
    </section>
  );
}

/* ─────────────────────────── HEADER ─────────────────────────── */

function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [menuOpen]);

  // Close on resize above 720px
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth > 720) setMenuOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", menuOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [menuOpen]);

  const navLinks = [
    { label: "Home", href: "/", active: true, robotAction: null },
    { label: "Events", href: "/events", active: false, robotAction: "event-directory" },
    { label: "Scan ID", href: "/scan", active: false, robotAction: "scan" },
    { label: "Contact", href: "#", active: false, robotAction: null },
  ];

  return (
    <header
      className="relative shrink-0 flex items-center justify-center"
      style={{
        animation: "slideDown 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        zIndex: 2,
      }}
    >
      {/* ── Desktop layout ── */}
      <div
        className="hidden sm:flex items-center gap-[clamp(18px,2.8vw,28px)]"
        style={{ maxWidth: "720px", width: "100%" }}
      >
        {/* Logo circle */}
        <a
          href="/"
          aria-label="Asthra home"
          className="shrink-0 flex items-center justify-center rounded-full bg-white transition-transform hover:scale-[1.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          style={{
            width: "clamp(40px, 4.4vw, 46px)",
            height: "clamp(40px, 4.4vw, 46px)",
            boxShadow: "var(--nav-shadow)",
          }}
        >
          {/* Asthra "A" mark — replace with <img src="/assets/logo.webp"> when file is available */}
          <span
            className="font-display text-black select-none"
            style={{ fontSize: "clamp(16px, 1.9vw, 20px)", lineHeight: 1 }}
            aria-hidden="true"
          >
            A
          </span>
        </a>

        {/* White nav pill */}
        <nav
          aria-label="Primary"
          className="flex items-center flex-1 rounded-full bg-white px-2"
          style={{
            height: "clamp(44px, 5.2vw, 48px)",
            maxWidth: "430px",
            padding: "4px 8px",
            boxShadow: "var(--nav-shadow)",
          }}
        >
          {navLinks.map((link) => (
            <NavItem key={link.label} link={link} />
          ))}
        </nav>

        {/* Quick action button for Robot */}
        <button
          type="button"
          data-robot-action="ask-robot-intro"
          className="shrink-0 inline-flex items-center justify-center rounded-full font-sans font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
          style={{
            height: "clamp(44px, 5.2vw, 48px)",
            padding: "0 clamp(16px, 2vw, 22px)",
            background: "var(--pill-dark)",
            color: "var(--sign-in-text)",
            fontSize: "clamp(13px, 1.4vw, 15px)",
            letterSpacing: "-0.01em",
            boxShadow: "var(--nav-shadow)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#323234";
            (e.currentTarget as HTMLElement).style.color = "#fff";
            (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--pill-dark)";
            (e.currentTarget as HTMLElement).style.color = "var(--sign-in-text)";
            (e.currentTarget as HTMLElement).style.transform = "";
          }}
        >
          Ask Robot
        </button>
      </div>

      {/* ── Mobile layout ── */}
      <div className="sm:hidden flex items-center justify-between w-full">
        {/* Logo */}
        <a
          href="/"
          aria-label="Asthra home"
          className="flex items-center justify-center rounded-full bg-white"
          style={{
            width: 48,
            height: 48,
            boxShadow: "var(--nav-shadow)",
          }}
        >
          <span className="font-display text-black text-[18px]" aria-hidden="true">
            A
          </span>
        </a>

        {/* Burger */}
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="flex flex-col items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          style={{
            width: 48,
            height: 48,
            background: menuOpen ? "#fff" : "var(--pill-dark)",
            gap: 6.5,
          }}
        >
          <span
            className="block rounded-full transition-all"
            style={{
              width: 18,
              height: 1.5,
              background: menuOpen ? "#111" : "#fff",
              transform: menuOpen
                ? "translateY(8px) rotate(45deg)"
                : "none",
            }}
          />
          <span
            className="block rounded-full transition-all"
            style={{
              width: 18,
              height: 1.5,
              background: menuOpen ? "#111" : "#fff",
              opacity: menuOpen ? 0 : 1,
            }}
          />
          <span
            className="block rounded-full transition-all"
            style={{
              width: 18,
              height: 1.5,
              background: menuOpen ? "#111" : "#fff",
              transform: menuOpen
                ? "translateY(-8px) rotate(-45deg)"
                : "none",
            }}
          />
        </button>
      </div>

      {/* ── Mobile menu overlay + sheet ── */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <div
            className="sm:hidden fixed inset-0"
            style={{
              background: "rgba(0,0,0,0.62)",
              backdropFilter: "blur(6px)",
              animation: "overlayIn 0.28s ease both",
              zIndex: 40,
            }}
            onClick={() => setMenuOpen(false)}
          />

          {/* Sheet */}
          <div
            className="sm:hidden fixed top-[72px] left-4 right-4 rounded-[28px] bg-white p-[22px_18px_20px]"
            style={{
              animation: "menuIn 0.38s cubic-bezier(0.22,1,0.36,1) both",
              boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
              zIndex: 50,
            }}
            role="dialog"
            aria-label="Navigation menu"
          >
            <nav className="flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <a
                  key={link.label}
                  href={link.href}
                  data-robot-action={link.robotAction ?? undefined}
                  data-robot-from="home"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between rounded-[14px] px-4 py-3 font-sans font-medium text-[15px] transition hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
                  style={{
                    color: link.active ? "#000" : "#555",
                    animation: `linkIn 0.32s cubic-bezier(0.22,1,0.36,1) ${i * 0.05 + 0.08}s both`,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {link.label}
                  {link.active && (
                    <span className="flex gap-[5px]">
                      {[0, 1, 2].map((d) => (
                        <span
                          key={d}
                          className="block h-[3px] w-[3px] rounded-full bg-black"
                        />
                      ))}
                    </span>
                  )}
                </a>
              ))}

              {/* Quick action button for Robot in mobile */}
              <button
                type="button"
                data-robot-action="ask-robot-intro"
                onClick={() => setMenuOpen(false)}
                className="mt-2 flex items-center justify-center rounded-[14px] py-3 font-sans font-medium text-[15px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
                style={{
                  background: "var(--pill-dark)",
                  color: "var(--sign-in-text)",
                  animation: `linkIn 0.32s cubic-bezier(0.22,1,0.36,1) ${navLinks.length * 0.05 + 0.08}s both`,
                }}
              >
                Ask Robot
              </button>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}

/* ─────────────────────── Nav Item (desktop) ─────────────────────── */

function NavItem({
  link,
}: {
  link: {
    label: string;
    href: string;
    active: boolean;
    robotAction: string | null;
  };
}) {
  return (
    <a
      href={link.href}
      data-robot-action={link.robotAction ?? undefined}
      data-robot-from="home"
      className="relative flex items-center justify-center rounded-full px-4 py-2 font-sans font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2e2e2e]"
      style={{
        color: "var(--nav-text)",
        fontSize: "clamp(13px, 1.4vw, 15px)",
        letterSpacing: "-0.01em",
        opacity: link.active ? 1 : 0.5,
        flex: 1,
        minHeight: 36,
      }}
      onMouseEnter={(e) => {
        if (!link.active) (e.currentTarget as HTMLElement).style.opacity = "0.75";
      }}
      onMouseLeave={(e) => {
        if (!link.active) (e.currentTarget as HTMLElement).style.opacity = "0.5";
      }}
    >
      {link.label}
      {/* Active indicator: three dots */}
      {link.active && (
        <span
          className="absolute flex gap-[5px]"
          style={{ bottom: 5, left: "50%", transform: "translateX(-50%)" }}
          aria-hidden="true"
        >
          {["-5px", "0px", "5px"].map((x, i) => (
            <span
              key={i}
              className="block h-[3px] w-[3px] rounded-full bg-[#2e2e2e]"
            />
          ))}
        </span>
      )}
    </a>
  );
}

/* ─────────────────────────── HERO ─────────────────────────── */

function HeroCenter() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div
        className="flex flex-col items-center text-center w-full"
        style={{ maxWidth: "900px" }}
      >
        {/* Trust row */}
        <TrustRow />

        {/* Headline */}
        <Headline />

        {/* Subhead */}
        <p
          className="anim"
          style={{
            maxWidth: "min(560px, 92%)",
            fontSize: "clamp(calc(13.5px + 2pt), calc(1.55vw + 2pt), calc(16.5px + 2pt))",
            color: "#d0d0d0",
            opacity: 0, // will be overridden by .anim
            lineHeight: 1.55,
            fontWeight: 400,
            marginTop: "clamp(14px, 2vh, 20px)",
            "--d": "0.28s",
          } as React.CSSProperties}
        >
          Greetings! I am your AI Welcome Assistant for Asthra 11.0. Tap below to explore events, navigate festival venues, or scan your  ID to begin.
        </p>

        {/* CTA */}
        <Link
          href="/events"
          data-robot-action="event-directory"
          data-robot-from="home"
          className="anim-pulse"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "clamp(20px, 3vh, 28px)",
            padding:
              "clamp(11px, 1.6vh, 13px) clamp(22px, 3vw, 28px)",
            borderRadius: 999,
            background: "#fff",
            color: "#000",
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: "clamp(13.5px, 1.5vw, 14.5px)",
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.15), 0 0 22px rgba(255,255,255,0.32), 0 0 44px rgba(255,255,255,0.12)",
            transition: "transform 0.2s, box-shadow 0.2s",
            opacity: 0,
            "--d": "0.4s",
          } as React.CSSProperties}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.transform = "translateY(-2px) scale(1.02)";
            el.style.boxShadow =
              "0 0 0 1px rgba(255,255,255,0.25), 0 0 32px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.2)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.transform = "";
            el.style.boxShadow =
              "0 0 0 1px rgba(255,255,255,0.15), 0 0 22px rgba(255,255,255,0.32), 0 0 44px rgba(255,255,255,0.12)";
          }}
        >
          Explore Events
        </Link>

        {/* Accessible caption (robot speech mirror) */}
        <p
          aria-live="polite"
          className="sr-only"
          id="robot-caption-live"
        />
      </div>
    </div>
  );
}

/* ─────────────────────── Trust Row ─────────────────────── */

function TrustRow() {
  const avatars = [
    { icon: "fa-solid fa-robot", label: "AI Robot" },
    { icon: "fa-solid fa-[#000] fa-microchip", label: "Robotics" },
    { icon: "fa-solid fa-bolt", label: "Tech Fest" },
  ];

  return (
    <div
      className="anim flex items-center"
      style={{
        "--d": "0.05s",
        marginBottom: "clamp(16px, 2.5vh, 26px)",
        opacity: 0,
      } as React.CSSProperties}
    >
      {avatars.map((a, i) => (
        <div
          key={a.label}
          title={a.label}
          className="relative flex items-center justify-center rounded-full"
          style={{
            width: "var(--trust-size)",
            height: "var(--trust-size)",
            background: "var(--trust-bg)",
            border: "1px solid var(--trust-border)",
            padding: 5,
            marginLeft:
              i > 0 ? "calc(var(--trust-size) * -0.42)" : undefined,
            zIndex: i === 0 ? 1 : i === 1 ? 2 : 4,
            transition: "transform 0.35s",
          }}
          onMouseEnter={(e) => {
            const offset = i === 0 ? "-2px" : i === 1 ? "-4px" : "-2px";
            (e.currentTarget as HTMLElement).style.transform = `translateY(${offset})`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "";
          }}
        >
          {/* Inner white circle */}
          <div
            className="flex items-center justify-center rounded-full w-full h-full bg-white"
          >
            <i
              className={a.icon}
              style={{
                fontSize: "calc(var(--trust-size) * 0.34)",
                color: "#111",
              }}
              aria-label={a.label}
            />
          </div>
        </div>
      ))}

      {/* Trust pill */}
      <div
        className="flex items-center rounded-full"
        style={{
          height: "var(--trust-size)",
          background: "var(--trust-bg)",
          border: "1px solid var(--trust-border)",
          marginLeft: "calc(var(--trust-size) * -0.42)",
          paddingLeft: "calc(var(--trust-size) * 0.58)",
          paddingRight: "clamp(12px, 1.6vw, 16px)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            fontSize: "clamp(12px, 1.4vw, 13.5px)",
            color: "var(--trust-text)",
          }}
        >
          SJCET Palai · Electronics and Computer Department.
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────── Headline ─────────────────────── */

function Headline() {
  return (
    <h1
      className="headline anim"
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 400,
        color: "#fff",
        fontSize: "clamp(28px, 6.2vw, 80px)",
        letterSpacing: "-0.04em",
        lineHeight: 1.12,
        whiteSpace: "nowrap",
        overflow: "hidden",
        opacity: 0,
        "--d": "0.08s",
      } as React.CSSProperties}
    >
      <span
        className="block"
        style={{
          animation: "headlineFade 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both",
        }}
      >
        Intelligence
      </span>
      <span
        className="block"
        style={{
          animation: "headlineFade 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both",
        }}
      >
        Designed To Evolve
      </span>
    </h1>
  );
}

/* ─────────────────────────── STATS ─────────────────────────── */

const STATS = [
  { glyph: "*", target: 50, suffix: "+", decimals: 0, label: "Events & Workshops" },
  { glyph: "#", target: 300, suffix: "K+", decimals: 0, label: "Prize Pool (INR)" },
  { glyph: "<", target: 6, suffix: "", decimals: 0, label: "Engineering Depts" },
  { glyph: "%", target: 5000, suffix: "+", decimals: 0, label: "Innovators Attending" },
];

function StatsRow() {
  return (
    <div
      className="shrink-0 grid grid-cols-2 sm:grid-cols-4"
      style={{ maxWidth: "920px", width: "100%", margin: "0 auto" }}
    >
      {STATS.map((s, i) => (
        <StatItem key={s.label} stat={s} index={i} />
      ))}
    </div>
  );
}

function StatItem({
  stat,
  index,
}: {
  stat: (typeof STATS)[number];
  index: number;
}) {
  const valueRef = useRef<HTMLSpanElement>(null);
  const observed = useRef(false);

  useEffect(() => {
    const el = valueRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || observed.current) return;
        observed.current = true;

        const startDelay = 480 + index * 90;
        const duration = 1500 + index * 80;

        window.setTimeout(() => {
          const startTime = performance.now();
          function easeOutCubic(t: number) {
            return 1 - Math.pow(1 - t, 3);
          }
          function frame(now: number) {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);
            const val = easeOutCubic(t) * stat.target;
            if (el) el.textContent =
              val.toFixed(stat.decimals) + stat.suffix;
            if (t < 1) requestAnimationFrame(frame);
          }
          requestAnimationFrame(frame);
        }, startDelay);
      },
      { threshold: 0.25 }
    );

    obs.observe(el.parentElement!.parentElement!);
    return () => obs.disconnect();
  }, [stat, index]);

  const delay = [0.5, 0.58, 0.66, 0.74][index];

  return (
    <div
      className="anim flex flex-col items-center justify-center text-center py-4 px-2"
      style={{ "--d": `${delay}s`, opacity: 0 } as React.CSSProperties}
    >
      {/* Icon glyph */}
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(22px, 3vw, 33px)",
          color: "#fff",
          lineHeight: 1,
        }}
        aria-hidden="true"
      >
        {stat.glyph}
      </span>

      {/* Counting value */}
      <span
        ref={valueRef}
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 600,
          fontSize: "clamp(18px, 2.2vw, 26px)",
          color: "#fff",
          letterSpacing: "-0.025em",
          fontVariantNumeric: "tabular-nums",
          marginTop: 4,
        }}
      >
        {stat.target.toFixed(stat.decimals) + stat.suffix}
      </span>

      {/* Label */}
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "clamp(11px, 1.2vw, 12.5px)",
          color: "var(--muted)",
          marginTop: 3,
        }}
      >
        {stat.label}
      </span>
    </div>
  );
}
