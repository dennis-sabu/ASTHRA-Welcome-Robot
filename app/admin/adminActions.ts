"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Contributor {
  id: string;
  name: string;
  department: string;
  year: string;
  role: "coordinator" | "technical" | "design";
  image_url: string | null;
  created_at: string;
}

export interface FeedbackRow {
  id: string;
  session_id: string;
  q1_overall_design: number;
  q2_ui_visual: number;
  q3_id_scanning: number;
  q4_event_registration: number;
  q5_overall_experience: number;
  user_agent: string | null;
  submitted_at: string;
}

export interface AnalyticsData {
  totalSubmissions: number;
  averages: {
    q1_overall_design: number;
    q2_ui_visual: number;
    q3_id_scanning: number;
    q4_event_registration: number;
    q5_overall_experience: number;
  };
  distributions: Record<string, Record<number, number>>;
  recent: FeedbackRow[];
}

// ── Feedback Analytics ─────────────────────────────────────────────────────

export async function getFeedbackAnalytics(): Promise<AnalyticsData> {
  const { data, error } = await supabaseAdmin
    .from("feedbacks")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error) throw new Error(error.message);
  const rows = (data ?? []) as FeedbackRow[];

  const keys = [
    "q1_overall_design",
    "q2_ui_visual",
    "q3_id_scanning",
    "q4_event_registration",
    "q5_overall_experience",
  ] as const;

  const averages = {} as AnalyticsData["averages"];
  const distributions: Record<string, Record<number, number>> = {};

  for (const key of keys) {
    const vals = rows.map((r) => r[key]).filter(Boolean);
    averages[key] = vals.length
      ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
      : 0;

    distributions[key] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const v of vals) distributions[key][v] = (distributions[key][v] ?? 0) + 1;
  }

  return {
    totalSubmissions: rows.length,
    averages,
    distributions,
    recent: rows.slice(0, 20),
  };
}

// ── Contributors ───────────────────────────────────────────────────────────

export async function getContributors(): Promise<Contributor[]> {
  const { data, error } = await supabaseAdmin
    .from("contributors")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Contributor[];
}

// ── Storage helpers ────────────────────────────────────────────────────────

/**
 * Ensures the 'contributors' storage bucket exists and is public.
 * Creates it automatically if not found — no manual Supabase setup needed.
 */
async function ensureBucket() {
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === "contributors");
  if (!exists) {
    const { error } = await supabaseAdmin.storage.createBucket("contributors", {
      public: true,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      fileSizeLimit: 5 * 1024 * 1024, // 5 MB
    });
    if (error && error.message !== "Bucket already exists") {
      throw new Error(`Could not create storage bucket: ${error.message}`);
    }
  }
}

export async function addContributor(formData: FormData): Promise<{ error?: string }> {
  const name = formData.get("name") as string;
  const department = formData.get("department") as string;
  const year = formData.get("year") as string;
  const role = formData.get("role") as string;
  const imageFile = formData.get("image") as File | null;

  if (!name || !department || !year || !role) {
    return { error: "All fields are required." };
  }

  // Enforce max 2 coordinators
  if (role === "coordinator") {
    const { count } = await supabaseAdmin
      .from("contributors")
      .select("*", { count: "exact", head: true })
      .eq("role", "coordinator");

    if ((count ?? 0) >= 2) {
      return { error: "Only 2 coordinators are allowed." };
    }
  }

  let image_url: string | null = null;

  if (imageFile && imageFile.size > 0) {
    await ensureBucket();

    const ext = imageFile.name.split(".").pop() ?? "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from("contributors")
      .upload(filename, buffer, {
        contentType: imageFile.type,
        upsert: false,
      });

    if (uploadError) return { error: `Image upload failed: ${uploadError.message}` };

    const { data: urlData } = supabaseAdmin.storage
      .from("contributors")
      .getPublicUrl(filename);

    image_url = urlData.publicUrl;
  }

  const { error } = await supabaseAdmin.from("contributors").insert({
    name,
    department,
    year,
    role,
    image_url,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/makers");
  return {};
}

export async function updateContributor(
  id: string,
  formData: FormData
): Promise<{ error?: string }> {
  const name = formData.get("name") as string;
  const department = formData.get("department") as string;
  const year = formData.get("year") as string;
  const role = formData.get("role") as string;
  const imageFile = formData.get("image") as File | null;

  if (!name || !department || !year || !role) {
    return { error: "All fields are required." };
  }

  // Check coordinator limit only if changing to coordinator
  if (role === "coordinator") {
    const { data: existing } = await supabaseAdmin
      .from("contributors")
      .select("role")
      .eq("id", id)
      .single();

    if (existing?.role !== "coordinator") {
      const { count } = await supabaseAdmin
        .from("contributors")
        .select("*", { count: "exact", head: true })
        .eq("role", "coordinator");

      if ((count ?? 0) >= 2) {
        return { error: "Only 2 coordinators are allowed." };
      }
    }
  }

  const updateData: Record<string, string | null> = { name, department, year, role };

  if (imageFile && imageFile.size > 0) {
    await ensureBucket();

    const ext = imageFile.name.split(".").pop() ?? "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from("contributors")
      .upload(filename, buffer, { contentType: imageFile.type, upsert: false });

    if (uploadError) return { error: `Image upload failed: ${uploadError.message}` };

    const { data: urlData } = supabaseAdmin.storage
      .from("contributors")
      .getPublicUrl(filename);

    updateData.image_url = urlData.publicUrl;
  }

  const { error } = await supabaseAdmin
    .from("contributors")
    .update(updateData)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/makers");
  return {};
}

export async function deleteContributor(id: string): Promise<{ error?: string }> {
  // Get image_url to clean up storage
  const { data: row } = await supabaseAdmin
    .from("contributors")
    .select("image_url")
    .eq("id", id)
    .single();

  if (row?.image_url) {
    // Extract filename from URL
    const parts = row.image_url.split("/");
    const filename = parts[parts.length - 1];
    if (filename) {
      await supabaseAdmin.storage.from("contributors").remove([filename]);
    }
  }

  const { error } = await supabaseAdmin.from("contributors").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/makers");
  return {};
}
