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

const ROLE_ACCENT: Record<string, string> = {
  coordinator: "rgba(34,211,238,0.9)",
  technical: "rgba(100,200,255,0.85)",
  design: "rgba(200,120,255,0.85)",
};

const ROLE_BG: Record<string, string> = {
  coordinator: "rgba(34,211,238,0.06)",
  technical: "rgba(100,200,255,0.05)",
  design: "rgba(200,120,255,0.05)",
};

// ── Coordinator Hero Card ──────────────────────────────────────────────────

function CoordinatorCard({ contributor, index }: { contributor: Contributor; index: number }) {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: 28,
        overflow: "hidden",
        background: "rgba(20,20,20,0.55)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(34,211,238,0.2)",
        boxShadow: "0 0 0 1px rgba(34,211,238,0.05), 0 24px 60px rgba(0,0,0,0.6), 0 0 40px rgba(34,211,238,0.06)",
        animation: "fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both",
        ["--d" as string]: `${index * 0.12}s`,
      }}
    >
      {/* Photo */}
      <div style={{ width: "100%", aspectRatio: "4/3", overflow: "hidden", position: "relative", background: "rgba(255,255,255,0.04)" }}>
        {contributor.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={contributor.image_url}
            alt={contributor.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 64, color: "rgba(34,211,238,0.3)", fontFamily: "Inter, system-ui, sans-serif", fontWeight: 700 }}>
              {contributor.name[0]}
            </span>
          </div>
        )}
        {/* Gradient overlay on photo */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,10,10,0.85) 0%, transparent 55%)" }} />
      </div>

      {/* Info */}
      <div style={{ padding: "20px 24px 24px" }}>
        {/* Role badge */}
        <span style={{
          display: "inline-block",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(34,211,238,0.95)",
          background: "rgba(34,211,238,0.1)",
          border: "1px solid rgba(34,211,238,0.25)",
          borderRadius: 20,
          padding: "3px 10px",
          marginBottom: 10,
          fontFamily: "Inter, system-ui, sans-serif",
        }}>
          ★ {ROLE_LABELS[contributor.role]}
        </span>

        <h2
          className="font-display text-white"
          style={{ fontSize: "clamp(22px, 3vw, 28px)", lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 6 }}
        >
          {contributor.name}
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: "Inter, system-ui, sans-serif" }}>
          {contributor.department} · {contributor.year}
        </p>
      </div>
    </div>
  );
}

// ── Team Member Card ───────────────────────────────────────────────────────

function MemberCard({ contributor, index }: { contributor: Contributor; index: number }) {
  const accent = ROLE_ACCENT[contributor.role];
  const bg = ROLE_BG[contributor.role];

  return (
    <div
      style={{
        borderRadius: 20,
        background: "rgba(15,15,15,0.5)",
        backdropFilter: "blur(16px)",
        border: `1px solid rgba(255,255,255,0.08)`,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 12,
        animation: "fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both",
        ["--d" as string]: `${0.1 + index * 0.06}s`,
        transition: "border 0.3s ease, box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.border = `1px solid rgba(255,255,255,0.16)`;
        (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(0,0,0,0.4)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.border = `1px solid rgba(255,255,255,0.08)`;
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 72,
        height: 72,
        borderRadius: "50%",
        overflow: "hidden",
        border: `2px solid ${accent}30`,
        background: bg,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {contributor.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={contributor.image_url} alt={contributor.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 26, color: accent, fontWeight: 700, fontFamily: "Inter, system-ui, sans-serif" }}>
            {contributor.name[0]}
          </span>
        )}
      </div>

      {/* Name */}
      <div>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", fontFamily: "Inter, system-ui, sans-serif", marginBottom: 3 }}>
          {contributor.name}
        </p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "Inter, system-ui, sans-serif" }}>
          {contributor.department} · {contributor.year}
        </p>
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

  const coordinators = contributors.filter((c) => c.role === "coordinator");
  const technical = contributors.filter((c) => c.role === "technical");
  const design = contributors.filter((c) => c.role === "design");

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
            The ASTHRA Welcome Robot was built by students of the Department of Electronics &amp; Computer Engineering, SJCET Palai.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 sm:px-6 lg:px-12 pb-20">
        <div className="max-w-4xl mx-auto">

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
            <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>

              {/* Coordinators — large hero cards */}
              {coordinators.length > 0 && (
                <div>
                  <p
                    className="font-sans font-semibold uppercase tracking-[0.14em] mb-6 anim"
                    style={{ fontSize: "11px", color: "rgba(34,211,238,0.85)", ["--d" as string]: "0.15s" }}
                  >
                    ★ Coordinators
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, maxWidth: 620 }}>
                    {coordinators.map((c, i) => (
                      <CoordinatorCard key={c.id} contributor={c} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Team */}
              {technical.length > 0 && (
                <div>
                  <p
                    className="font-sans font-semibold uppercase tracking-[0.14em] mb-6 anim"
                    style={{ fontSize: "11px", color: "rgba(100,200,255,0.8)", ["--d" as string]: "0.2s" }}
                  >
                    Technical Team
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
                    {technical.map((c, i) => (
                      <MemberCard key={c.id} contributor={c} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* Design Team */}
              {design.length > 0 && (
                <div>
                  <p
                    className="font-sans font-semibold uppercase tracking-[0.14em] mb-6 anim"
                    style={{ fontSize: "11px", color: "rgba(200,120,255,0.8)", ["--d" as string]: "0.25s" }}
                  >
                    Design Team
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
                    {design.map((c, i) => (
                      <MemberCard key={c.id} contributor={c} index={i} />
                    ))}
                  </div>
                </div>
              )}
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
                Dept. of ECE, SJCET Palai
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
