"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getContributors, type Contributor } from "@/app/admin/adminActions";

// ── Role config ────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  coordinator: "Coordinator",
  technical: "Technical Team",
  design: "Design Team",
};

const ROLE_ACCENTS: Record<string, string> = {
  coordinator: "#22d3ee",
  technical: "#22d3ee",
  design: "#c084fc",
};

const ROLE_ACCENT_BORDERS: Record<string, string> = {
  coordinator: "rgba(34, 211, 238, 0.4)",
  technical: "rgba(34, 211, 238, 0.35)",
  design: "rgba(192, 132, 252, 0.35)",
};


// ── Unified Card (all roles) ───────────────────────────────────────────────

function PersonCard({ contributor, index }: { contributor: Contributor; index: number }) {
  const [hovered, setHovered] = useState(false);
  const accent = ROLE_ACCENTS[contributor.role] ?? "#22d3ee";
  const accentBorder = ROLE_ACCENT_BORDERS[contributor.role] ?? "rgba(34,211,238,0.35)";
  const accentBg = `${accent}14`;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 24,
        overflow: "hidden",
        background: `linear-gradient(160deg, ${accentBg} 0%, rgba(14,14,18,0.92) 40%)`,
        backdropFilter: "blur(24px)",
        border: hovered ? `1px solid ${accentBorder}` : "1px solid rgba(255,255,255,0.09)",
        boxShadow: hovered
          ? `0 24px 56px -12px rgba(0,0,0,0.75), 0 0 40px -8px ${accent}45`
          : `0 8px 32px -8px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)`,
        transform: hovered ? "translateY(-6px) scale(1.01)" : "translateY(0) scale(1)",
        transition: "transform 0.38s cubic-bezier(0.22,1,0.36,1), border-color 0.38s ease, box-shadow 0.38s ease",
        animation: "fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both",
        ["--d" as string]: `${0.04 + index * 0.04}s`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Glowing accent top bar */}
      <div
        style={{
          height: 3,
          width: "100%",
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          opacity: hovered ? 1 : 0.45,
          transition: "opacity 0.38s ease",
        }}
      />

      {/* Photo — taller portrait crop */}
      <div
        style={{
          width: "100%",
          aspectRatio: "4 / 5",
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(180deg, ${accentBg} 0%, rgba(10,10,14,0.6) 100%)`,
        }}
      >
        {contributor.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={contributor.image_url}
            alt={contributor.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transform: hovered ? "scale(1.06)" : "scale(1)",
              transition: "transform 0.55s cubic-bezier(0.22,1,0.36,1)",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: 56,
                color: accent,
                fontWeight: 800,
                fontFamily: "Inter, system-ui, sans-serif",
                opacity: 0.55,
                textShadow: `0 0 40px ${accent}80`,
              }}
            >
              {contributor.name[0]}
            </span>
          </div>
        )}

        {/* Rich bottom gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: "linear-gradient(180deg, transparent 45%, rgba(14,14,18,0.7) 80%, rgba(14,14,18,0.97) 100%)",
          }}
        />

        {/* Subtle side glow on hover */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `radial-gradient(ellipse at 50% 110%, ${accent}20 0%, transparent 65%)`,
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        />
      </div>

      {/* Info */}
      <div style={{ padding: "18px 20px 20px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          {/* Role label */}
          <span
            style={{
              display: "block",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.13em",
              textTransform: "uppercase",
              color: accent,
              marginBottom: 7,
              fontFamily: "Inter, system-ui, sans-serif",
              textShadow: `0 0 12px ${accent}60`,
            }}
          >
            {ROLE_LABELS[contributor.role] ?? contributor.role}
          </span>
          <h3
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "#ffffff",
              fontFamily: "Inter, system-ui, sans-serif",
              lineHeight: 1.2,
              marginBottom: 5,
              letterSpacing: "-0.02em",
            }}
          >
            {contributor.name}
          </h3>
          <p
            style={{
              fontSize: 12.5,
              color: "rgba(255,255,255,0.5)",
              fontFamily: "Inter, system-ui, sans-serif",
              lineHeight: 1.45,
            }}
          >
            {contributor.department}
          </p>
        </div>
        <div
          style={{
            marginTop: 14,
            paddingTop: 10,
            borderTop: `1px solid ${accent}22`,
            fontSize: 11,
            color: "rgba(255,255,255,0.35)",
            fontFamily: "Inter, system-ui, sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>{contributor.year}</span>
          <span style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: `${accent}80` }}>SJCET</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Showcase ──────────────────────────────────────────────────────────

export default function MakersShowcase() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContributors()
      .then(setContributors)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden text-white">
      {/* Header */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between border-b px-6 py-4"
        style={{
          background: "rgba(10,10,10,0.5)",
          backdropFilter: "blur(20px)",
          borderColor: "rgba(255,255,255,0.1)",
        }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-sans text-[14px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          style={{ color: "rgba(255,255,255,0.7)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)")}
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Home
        </Link>

        <span className="font-display text-white select-none" style={{ fontSize: "clamp(16px,2vw,20px)", letterSpacing: "-0.04em" }}>
          Asthra 11.0
        </span>

        <Link
          href="/feedback"
          className="inline-flex items-center gap-2 rounded-full font-sans font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          style={{ background: "var(--pill-dark)", color: "var(--sign-in-text)", fontSize: "clamp(12px,1.3vw,14px)", padding: "8px 16px" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#323234"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--pill-dark)"; (e.currentTarget as HTMLElement).style.color = "var(--sign-in-text)"; }}
        >
          Feedback
        </Link>
      </header>

      {/* Page intro */}
      <section className="px-4 sm:px-6 lg:px-12 pt-12 pb-8">
        <div className="max-w-3xl mx-auto text-center">
          <p
            className="font-sans font-semibold uppercase tracking-[0.14em] mb-4 anim"
            style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", ["--d" as string]: "0s" }}
          >
            The People Behind It
          </p>
          <h1
            className="font-display text-white anim"
            style={{ fontSize: "clamp(38px,7vw,64px)", lineHeight: 1.02, ["--d" as string]: "0.05s" }}
          >
            Meet the
            <br />
            Makers
            <span style={{ color: "rgba(34,211,238,0.9)" }}>.</span>
          </h1>
          <p
            className="mt-4 font-sans text-[15px] max-w-md mx-auto anim"
            style={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.65, ["--d" as string]: "0.12s" }}
          >
            The ASTHRA Welcome Robot was built by students of the Department of Electronics &amp; Computer (ER), SJCET Palai.
          </p>
        </div>
      </section>

      {/* All members — single continuous grid */}
      <section className="px-4 sm:px-6 lg:px-12 pb-20">
        <div className="max-w-7xl mx-auto">

          {loading && (
            <div className="flex justify-center items-center" style={{ padding: "80px 0" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(34,211,238,0.7)" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}>
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            </div>
          )}

          {!loading && contributors.length === 0 && (
            <p className="text-center font-sans" style={{ color: "rgba(255,255,255,0.3)", fontSize: 15, paddingTop: 60 }}>
              The team is being assembled. Check back soon!
            </p>
          )}

          {!loading && contributors.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 20,
              }}
            >
              {contributors.map((c, i) => (
                <PersonCard key={c.id} contributor={c} index={i} />
              ))}
            </div>
          )}

          {/* Footer */}
          {!loading && (
            <div
              className="mt-16 flex items-center justify-center gap-6 font-sans text-[12px] anim"
              style={{ color: "rgba(255,255,255,0.35)", ["--d" as string]: "0.4s" }}
            >
              <span className="flex items-center gap-1.5">
                <span className="inline-block rounded-full" style={{ width: 5, height: 5, background: "rgba(255,255,255,0.3)" }} />
                Dept. of ER, SJCET Palai
              </span>
              <span className="hidden sm:flex items-center gap-1.5">
                <span className="inline-block rounded-full" style={{ width: 5, height: 5, background: "rgba(255,255,255,0.3)" }} />
                Asthra 11.0
              </span>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
