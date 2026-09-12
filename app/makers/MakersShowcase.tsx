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

// ── Coordinator Hero Card ──────────────────────────────────────────────────

function CoordinatorCard({ contributor, index }: { contributor: Contributor; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        borderRadius: 24,
        overflow: "hidden",
        background: "rgba(18, 18, 22, 0.65)",
        backdropFilter: "blur(24px)",
        border: hovered ? "1px solid rgba(34, 211, 238, 0.45)" : "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: hovered
          ? "0 22px 50px -10px rgba(0, 0, 0, 0.75), 0 0 35px -5px rgba(34, 211, 238, 0.2)"
          : "0 16px 40px -10px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.03)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.35s ease, box-shadow 0.35s ease",
        animation: "fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        ["--d" as string]: `${index * 0.12}s`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Photo */}
      <div
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          overflow: "hidden",
          position: "relative",
          background: "rgba(255, 255, 255, 0.03)",
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
              transform: hovered ? "scale(1.03)" : "scale(1)",
              transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
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
              background: "linear-gradient(180deg, rgba(34, 211, 238, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
            }}
          >
            <span
              style={{
                fontSize: 38,
                color: "rgba(34, 211, 238, 0.4)",
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 700,
                opacity: 0.7,
              }}
            >
              {contributor.name[0]}
            </span>
          </div>
        )}

        {/* Soft bottom vignette into card body */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: "linear-gradient(180deg, transparent 55%, rgba(18, 18, 22, 0.75) 85%, rgba(18, 18, 22, 0.98) 100%)",
          }}
        />

        {/* Sleek role badge */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(10, 10, 14, 0.75)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(34, 211, 238, 0.35)",
            borderRadius: 20,
            padding: "4px 10px",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#22d3ee",
              boxShadow: "0 0 8px #22d3ee",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#22d3ee",
              fontFamily: "Inter, system-ui, sans-serif",
            }}
          >
            Coordinator
          </span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "14px 16px 16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <span
            style={{
              display: "inline-block",
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#22d3ee",
              marginBottom: 4,
              fontFamily: "Inter, system-ui, sans-serif",
            }}
          >
            Coordinator
          </span>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#ffffff",
              fontFamily: "Inter, system-ui, sans-serif",
              lineHeight: 1.25,
              marginBottom: 3,
            }}
          >
            {contributor.name}
          </h3>
          <p
            style={{
              fontSize: 12,
              color: "rgba(255, 255, 255, 0.55)",
              fontFamily: "Inter, system-ui, sans-serif",
              lineHeight: 1.4,
            }}
          >
            {contributor.department}
          </p>
        </div>

        <div
          style={{
            marginTop: 10,
            paddingTop: 8,
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            fontSize: 11,
            color: "rgba(255, 255, 255, 0.4)",
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          {contributor.year}
        </div>
      </div>
    </div>
  );
}

// ── Team Member Card ───────────────────────────────────────────────────────

function MemberCard({ contributor, index }: { contributor: Contributor; index: number }) {
  const [hovered, setHovered] = useState(false);
  const isTechnical = contributor.role === "technical";
  const accent = isTechnical ? "#22d3ee" : "#c084fc";
  const accentBorder = isTechnical ? "rgba(34, 211, 238, 0.35)" : "rgba(192, 132, 252, 0.35)";
  const accentBg = isTechnical ? "rgba(34, 211, 238, 0.1)" : "rgba(192, 132, 252, 0.1)";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 20,
        overflow: "hidden",
        background: "rgba(18, 18, 22, 0.6)",
        backdropFilter: "blur(20px)",
        border: hovered ? `1px solid ${accentBorder}` : "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: hovered
          ? `0 14px 34px -8px rgba(0, 0, 0, 0.6), 0 0 24px -6px ${accent}25`
          : "0 8px 24px -6px rgba(0, 0, 0, 0.45)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.3s ease, box-shadow 0.3s ease",
        animation: "fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        ["--d" as string]: `${0.08 + index * 0.05}s`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Photo with square framing */}
      <div
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          position: "relative",
          overflow: "hidden",
          background: "rgba(255, 255, 255, 0.03)",
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
              transform: hovered ? "scale(1.04)" : "scale(1)",
              transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
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
              background: `linear-gradient(180deg, ${accentBg} 0%, rgba(255, 255, 255, 0.02) 100%)`,
            }}
          >
            <span
              style={{
                fontSize: 38,
                color: accent,
                fontWeight: 700,
                fontFamily: "Inter, system-ui, sans-serif",
                opacity: 0.7,
              }}
            >
              {contributor.name[0]}
            </span>
          </div>
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: "linear-gradient(180deg, transparent 60%, rgba(18, 18, 22, 0.8) 100%)",
          }}
        />
      </div>

      {/* Info */}
      <div style={{ padding: "14px 16px 16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <span
            style={{
              display: "inline-block",
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: accent,
              marginBottom: 4,
              fontFamily: "Inter, system-ui, sans-serif",
            }}
          >
            {ROLE_LABELS[contributor.role] ?? contributor.role}
          </span>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#ffffff",
              fontFamily: "Inter, system-ui, sans-serif",
              lineHeight: 1.25,
              marginBottom: 3,
            }}
          >
            {contributor.name}
          </h3>
          <p
            style={{
              fontSize: 12,
              color: "rgba(255, 255, 255, 0.55)",
              fontFamily: "Inter, system-ui, sans-serif",
              lineHeight: 1.4,
            }}
          >
            {contributor.department}
          </p>
        </div>

        <div
          style={{
            marginTop: 10,
            paddingTop: 8,
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            fontSize: 11,
            color: "rgba(255, 255, 255, 0.4)",
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          {contributor.year}
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
            The ASTHRA Welcome Robot was built by students of the Department of Electronics &amp; Computer (ER), SJCET Palai.
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
                  <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/[0.08]">
                    <p
                      className="font-sans font-semibold uppercase tracking-[0.14em]"
                      style={{ fontSize: "11px", color: "rgba(34,211,238,0.9)" }}
                    >
                      Project Coordinators
                    </p>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "Inter, system-ui, sans-serif" }}>
                      {coordinators.length}/2 Leads
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                    {coordinators.map((c, i) => (
                      <CoordinatorCard key={c.id} contributor={c} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Team */}
              {technical.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/[0.08]">
                    <p
                      className="font-sans font-semibold uppercase tracking-[0.14em]"
                      style={{ fontSize: "11px", color: "rgba(100,200,255,0.9)" }}
                    >
                      Technical Team
                    </p>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "Inter, system-ui, sans-serif" }}>
                      {technical.length} Member{technical.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                    {technical.map((c, i) => (
                      <MemberCard key={c.id} contributor={c} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* Design Team */}
              {design.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/[0.08]">
                    <p
                      className="font-sans font-semibold uppercase tracking-[0.14em]"
                      style={{ fontSize: "11px", color: "rgba(200,120,255,0.9)" }}
                    >
                      Design Team
                    </p>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "Inter, system-ui, sans-serif" }}>
                      {design.length} Member{design.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
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
