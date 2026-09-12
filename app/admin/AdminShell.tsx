"use client";

import { useState, useEffect, useTransition, useRef, useCallback } from "react";
import Image from "next/image";
import {
  getFeedbackAnalytics,
  getContributors,
  addContributor,
  updateContributor,
  deleteContributor,
  type Contributor,
  type AnalyticsData,
} from "./adminActions";

// ── Constants ──────────────────────────────────────────────────────────────

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "asthra2025";

const QUESTION_LABELS: Record<string, string> = {
  q1_overall_design: "Overall Design",
  q2_ui_visual: "UI & Visual Interface",
  q3_id_scanning: "ID Scanning",
  q4_event_registration: "Event Registration",
  q5_overall_experience: "Overall Experience",
};

const ROLE_LABELS: Record<string, string> = {
  coordinator: "Coordinator",
  technical: "Technical Team",
  design: "Design Team",
};

const ROLE_COLORS: Record<string, string> = {
  coordinator: "rgba(34,211,238,0.9)",
  technical: "rgba(34,211,238,0.7)",
  design: "rgba(200,120,255,0.9)",
};

// ── Lock Screen ────────────────────────────────────────────────────────────

function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      onUnlock();
    } else {
      setError("Incorrect password.");
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setPw("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "rgba(15,15,15,0.7)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20,
          padding: "40px 32px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
          animation: "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        {/* Lock icon */}
        <div className="flex justify-center mb-6">
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(34,211,238,0.08)",
              border: "1.5px solid rgba(34,211,238,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(34,211,238,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>

        <h1
          className="font-display text-white text-center mb-1"
          style={{ fontSize: 24, letterSpacing: "-0.04em" }}
        >
          Admin Access
        </h1>
        <p className="text-center font-sans mb-8" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
          Asthra 11.0 Dashboard
        </p>

        <form onSubmit={handleSubmit} style={{ animation: shake ? "shake 0.5s ease" : "none" }}>
          <input
            type="password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setError(""); }}
            placeholder="Enter password"
            autoFocus
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 12,
              border: error ? "1px solid rgba(255,100,100,0.6)" : "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              fontSize: 15,
              outline: "none",
              fontFamily: "Inter, system-ui, sans-serif",
              boxSizing: "border-box",
            }}
          />
          {error && (
            <p style={{ fontSize: 12, color: "rgba(255,100,100,0.8)", marginTop: 8 }}>{error}</p>
          )}
          <button
            type="submit"
            style={{
              width: "100%",
              marginTop: 16,
              padding: "12px",
              borderRadius: 12,
              border: "none",
              background: "rgba(34,211,238,0.12)",
              color: "rgba(34,211,238,0.95)",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Inter, system-ui, sans-serif",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(34,211,238,0.22)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(34,211,238,0.12)")}
          >
            Unlock Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Analytics Tab ──────────────────────────────────────────────────────────

function AnalyticsTab({ data }: { data: AnalyticsData }) {
  const keys = Object.keys(QUESTION_LABELS) as (keyof typeof QUESTION_LABELS)[];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Summary card */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
        <StatCard label="Total Submissions" value={data.totalSubmissions} />
        {keys.map((k) => (
          <StatCard
            key={k}
            label={QUESTION_LABELS[k]}
            value={`${data.averages[k as keyof typeof data.averages]}/5`}
            sub="avg rating"
          />
        ))}
      </div>

      {/* Rating bars per question */}
      <div>
        <h2 className="font-sans font-semibold mb-4 text-white" style={{ fontSize: 15, opacity: 0.8 }}>
          Rating Distribution
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {keys.map((k) => (
            <div key={k}>
              <p className="font-sans mb-3" style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
                {QUESTION_LABELS[k]}
              </p>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = data.distributions[k]?.[star] ?? 0;
                const pct = data.totalSubmissions > 0 ? (count / data.totalSubmissions) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3 mb-1.5">
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", width: 16, textAlign: "right" }}>{star}★</span>
                    <div style={{ flex: 1, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.07)" }}>
                      <div
                        style={{
                          height: "100%",
                          borderRadius: 4,
                          width: `${pct}%`,
                          background: star >= 4 ? "rgba(34,211,238,0.75)" : star === 3 ? "rgba(255,255,255,0.4)" : "rgba(255,100,100,0.6)",
                          transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", width: 28 }}>{count}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Recent submissions */}
      {data.recent.length > 0 && (
        <div>
          <h2 className="font-sans font-semibold mb-4 text-white" style={{ fontSize: 15, opacity: 0.8 }}>
            Recent Submissions (last 20)
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "Inter, system-ui, sans-serif" }}>
              <thead>
                <tr>
                  {["Submitted", "Design", "UI", "ID Scan", "Event Reg", "Overall"].map((h) => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "rgba(255,255,255,0.4)", borderBottom: "1px solid rgba(255,255,255,0.07)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recent.map((row) => (
                  <tr key={row.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "8px 12px", color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}>
                      {new Date(row.submitted_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    {[row.q1_overall_design, row.q2_ui_visual, row.q3_id_scanning, row.q4_event_registration, row.q5_overall_experience].map((v, i) => (
                      <td key={i} style={{ padding: "8px 12px", color: v >= 4 ? "rgba(34,211,238,0.9)" : v === 3 ? "rgba(255,255,255,0.7)" : "rgba(255,100,100,0.8)", fontWeight: 600 }}>
                        {v ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.totalSubmissions === 0 && (
        <p className="font-sans text-center" style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, padding: "40px 0" }}>
          No feedback submissions yet.
        </p>
      )}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16,
      padding: "20px 20px",
    }}>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "Inter, system-ui, sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 700, color: "#fff", fontFamily: "Inter, system-ui, sans-serif", lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4, fontFamily: "Inter, system-ui, sans-serif" }}>{sub}</p>}
    </div>
  );
}

// ── Contributor Form ───────────────────────────────────────────────────────

function ContributorForm({
  initial,
  coordinatorCount,
  onSave,
  onCancel,
}: {
  initial?: Contributor;
  coordinatorCount: number;
  onSave: (formData: FormData) => Promise<void>;
  onCancel: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(initial?.image_url ?? null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await onSave(fd);
    });
  };

  const maxCoordReached = coordinatorCount >= 2 && initial?.role !== "coordinator";

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter, system-ui, sans-serif",
    boxSizing: "border-box",
    outline: "none",
  };

  // Selects need a solid dark bg so native option text is readable
  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: "pointer",
    background: "#1a1a1a",
    color: "#fff",
    colorScheme: "dark",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    fontFamily: "Inter, system-ui, sans-serif",
    display: "block",
    marginBottom: 6,
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Image upload */}
      <div>
        <label style={labelStyle}>Photo</label>
        <div className="flex items-center gap-4">
          {preview && (
            <div style={{ width: 60, height: 60, borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(255,255,255,0.1)", flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPreview(URL.createObjectURL(file));
            }}
            style={{ ...inputStyle, padding: "8px 12px", cursor: "pointer" }}
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Full Name *</label>
        <input type="text" name="name" required defaultValue={initial?.name} placeholder="e.g. Alex Johnson" style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>Department *</label>
        <select name="department" required defaultValue={initial?.department ?? ""} style={selectStyle}>
          <option value="" disabled style={{ background: "#1a1a1a" }}>Select department</option>
          <option value="Electronics and Computer Engineering" style={{ background: "#1a1a1a" }}>Electronics and Computer Engineering (ECE)</option>
          <option value="Computer Science and Engineering" style={{ background: "#1a1a1a" }}>Computer Science and Engineering (CSE)</option>
          <option value="Electronics and Communication Engineering" style={{ background: "#1a1a1a" }}>Electronics and Communication Engineering (EC)</option>
          <option value="Electrical and Electronics Engineering" style={{ background: "#1a1a1a" }}>Electrical and Electronics Engineering (EEE)</option>
          <option value="Mechanical Engineering" style={{ background: "#1a1a1a" }}>Mechanical Engineering (ME)</option>
          <option value="Civil Engineering" style={{ background: "#1a1a1a" }}>Civil Engineering (CE)</option>
          <option value="Information Technology" style={{ background: "#1a1a1a" }}>Information Technology (IT)</option>
        </select>
      </div>

      <div>
        <label style={labelStyle}>Year of Study *</label>
        <select name="year" required defaultValue={initial?.year ?? ""} style={selectStyle}>
          <option value="" disabled style={{ background: "#1a1a1a" }}>Select year</option>
          <option value="1st Year" style={{ background: "#1a1a1a" }}>1st Year</option>
          <option value="2nd Year" style={{ background: "#1a1a1a" }}>2nd Year</option>
          <option value="3rd Year" style={{ background: "#1a1a1a" }}>3rd Year</option>
          <option value="4th Year" style={{ background: "#1a1a1a" }}>4th Year</option>
        </select>
      </div>

      <div>
        <label style={labelStyle}>Role *</label>
        <select name="role" required defaultValue={initial?.role ?? ""} style={selectStyle}>
          <option value="" disabled style={{ background: "#1a1a1a" }}>Select role</option>
          <option value="coordinator" disabled={maxCoordReached} style={{ background: "#1a1a1a" }}>
            Coordinator {maxCoordReached ? "(max 2 reached)" : ""}
          </option>
          <option value="technical" style={{ background: "#1a1a1a" }}>Technical Team</option>
          <option value="design" style={{ background: "#1a1a1a" }}>Design Team</option>
        </select>
        {maxCoordReached && (
          <p style={{ fontSize: 11, color: "rgba(34,211,238,0.8)", marginTop: 4, fontFamily: "Inter, system-ui, sans-serif" }}>
            ⚠ Maximum 2 coordinators already assigned.
          </p>
        )}
      </div>

      {error && (
        <p style={{ fontSize: 13, color: "rgba(255,100,100,0.85)", fontFamily: "Inter, system-ui, sans-serif" }}>⚠ {error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          style={{
            flex: 1,
            padding: "11px",
            borderRadius: 10,
            border: "none",
            background: "rgba(34,211,238,0.12)",
            color: "rgba(34,211,238,0.95)",
            fontSize: 14,
            fontWeight: 600,
            cursor: isPending ? "not-allowed" : "pointer",
            fontFamily: "Inter, system-ui, sans-serif",
            opacity: isPending ? 0.6 : 1,
          }}
        >
          {isPending ? "Saving…" : initial ? "Save Changes" : "Add Contributor"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "11px 20px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "transparent",
            color: "rgba(255,255,255,0.5)",
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Contributors Tab ───────────────────────────────────────────────────────

function ContributorsTab({ contributors, onRefresh }: { contributors: Contributor[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const coordinatorCount = contributors.filter((c) => c.role === "coordinator").length;

  const handleAdd = async (formData: FormData) => {
    const result = await addContributor(formData);
    if (result.error) { alert(result.error); return; }
    setShowForm(false);
    onRefresh();
  };

  const handleUpdate = async (id: string, formData: FormData) => {
    const result = await updateContributor(id, formData);
    if (result.error) { alert(result.error); return; }
    setEditingId(null);
    onRefresh();
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteContributor(id);
      if (result.error) alert(result.error);
      setDeletingId(null);
      onRefresh();
    });
  };

  const grouped = {
    coordinator: contributors.filter((c) => c.role === "coordinator"),
    technical: contributors.filter((c) => c.role === "technical"),
    design: contributors.filter((c) => c.role === "design"),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "Inter, system-ui, sans-serif" }}>
            {contributors.length} contributor{contributors.length !== 1 ? "s" : ""} · {coordinatorCount}/2 coordinators
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: "9px 18px",
              borderRadius: 10,
              border: "1px solid rgba(34,211,238,0.25)",
              background: "rgba(34,211,238,0.08)",
              color: "rgba(34,211,238,0.9)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Inter, system-ui, sans-serif",
            }}
          >
            + Add Contributor
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
          <h3 className="font-sans font-semibold text-white mb-5" style={{ fontSize: 15 }}>New Contributor</h3>
          <ContributorForm
            coordinatorCount={coordinatorCount}
            onSave={handleAdd}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Grouped lists */}
      {(["coordinator", "technical", "design"] as const).map((role) => (
        grouped[role].length > 0 && (
          <div key={role}>
            <p className="font-sans font-semibold mb-3" style={{ fontSize: 12, color: ROLE_COLORS[role], textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {ROLE_LABELS[role]}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {grouped[role].map((c) => (
                <div key={c.id}>
                  {editingId === c.id ? (
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
                      <h3 className="font-sans font-semibold text-white mb-5" style={{ fontSize: 15 }}>Edit: {c.name}</h3>
                      <ContributorForm
                        initial={c}
                        coordinatorCount={coordinatorCount}
                        onSave={(fd) => handleUpdate(c.id, fd)}
                        onCancel={() => setEditingId(null)}
                      />
                    </div>
                  ) : (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 14,
                      padding: "14px 16px",
                    }}>
                      {/* Avatar */}
                      <div style={{ width: 44, height: 44, borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(255,255,255,0.1)", flexShrink: 0, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {c.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.image_url} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <span style={{ fontSize: 16, color: "rgba(255,255,255,0.4)" }}>{c.name[0]}</span>
                        )}
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", fontFamily: "Inter, system-ui, sans-serif" }}>{c.name}</p>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "Inter, system-ui, sans-serif" }}>{c.department} · {c.year}</p>
                      </div>
                      {/* Actions */}
                      <div className="flex gap-2">
                        <button onClick={() => setEditingId(c.id)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.55)", fontSize: 12, cursor: "pointer", fontFamily: "Inter, system-ui, sans-serif" }}>Edit</button>
                        <button
                          onClick={() => { if (confirm(`Delete ${c.name}?`)) handleDelete(c.id); }}
                          disabled={deletingId === c.id}
                          style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,100,100,0.2)", background: "transparent", color: "rgba(255,100,100,0.7)", fontSize: 12, cursor: "pointer", fontFamily: "Inter, system-ui, sans-serif" }}
                        >
                          {deletingId === c.id ? "…" : "Delete"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      ))}

      {contributors.length === 0 && !showForm && (
        <p className="font-sans text-center" style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, padding: "40px 0" }}>
          No contributors yet. Add the first one above.
        </p>
      )}
    </div>
  );
}

// ── Main Admin Shell ───────────────────────────────────────────────────────

export default function AdminShell() {
  const [unlocked, setUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<"analytics" | "contributors">("analytics");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setDataError("");
    try {
      const [a, c] = await Promise.all([getFeedbackAnalytics(), getContributors()]);
      setAnalytics(a);
      setContributors(c);
    } catch (e: unknown) {
      setDataError(e instanceof Error ? e.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (unlocked) loadData();
  }, [unlocked, loadData]);

  if (!unlocked) return <LockScreen onUnlock={() => setUnlocked(true)} />;

  const tabs = [
    { id: "analytics" as const, label: "Feedback Analytics" },
    { id: "contributors" as const, label: "Contributors" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "transparent", color: "#fff" }}>
      {/* Top bar */}
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(10,10,10,0.6)",
          backdropFilter: "blur(20px)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div>
          <span className="font-display" style={{ fontSize: 18, letterSpacing: "-0.04em" }}>Asthra Admin</span>
          <span style={{ marginLeft: 10, fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "Inter, system-ui, sans-serif" }}>Asthra 11.0 · SJCET Palai</span>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: loading ? "not-allowed" : "pointer", fontFamily: "Inter, system-ui, sans-serif" }}
        >
          {loading ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "0 24px",
          display: "flex",
          gap: 4,
          background: "rgba(10,10,10,0.45)",
          backdropFilter: "blur(20px)",
          position: "sticky",
          top: 61,
          zIndex: 19,
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: "14px 18px",
              border: "none",
              background: "transparent",
              color: activeTab === t.id ? "#fff" : "rgba(255,255,255,0.4)",
              fontSize: 14,
              fontWeight: activeTab === t.id ? 600 : 400,
              cursor: "pointer",
              borderBottom: activeTab === t.id ? "2px solid rgba(34,211,238,0.8)" : "2px solid transparent",
              fontFamily: "Inter, system-ui, sans-serif",
              transition: "color 0.2s ease",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>
        {loading && (
          <div className="flex justify-center items-center" style={{ padding: "80px 0" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(34,211,238,0.6)" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}>
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
          </div>
        )}

        {dataError && !loading && (
          <div style={{ padding: 20, borderRadius: 12, background: "rgba(255,100,100,0.08)", border: "1px solid rgba(255,100,100,0.2)", color: "rgba(255,100,100,0.85)", fontSize: 14, fontFamily: "Inter, system-ui, sans-serif" }}>
            ⚠ {dataError}
            <br />
            <span style={{ fontSize: 12, opacity: 0.7 }}>Make sure SUPABASE_SERVICE_ROLE_KEY is set in .env.local</span>
          </div>
        )}

        {!loading && !dataError && (
          <>
            {activeTab === "analytics" && analytics && <AnalyticsTab data={analytics} />}
            {activeTab === "contributors" && (
              <ContributorsTab contributors={contributors} onRefresh={loadData} />
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}
