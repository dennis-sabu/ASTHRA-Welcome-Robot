"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRobotVoice } from "../components/RobotVoice";

// ── API configuration ──────────────────────────────────────────────────────
// .env.local provides ONLY the base URL — never include "/scan-id" here.
const API_URL = process.env.NEXT_PUBLIC_SCANNER_API_URL ?? "http://127.0.0.1:8000";

// ── FastAPI response shape ─────────────────────────────────────────────────
interface ScanApiResponse {
  success: boolean;
  name: string | null;
  message: string;
  confidence: number;
  processing_time_ms?: number;
}

// ── State machine phases ───────────────────────────────────────────────────
type Phase = "ready" | "camera" | "processing" | "detected" | "error";

// ── Processing status labels ───────────────────────────────────────────────
const PROCESSING_STEPS = [
  "SCANNING",
  "ANALYZING ID CARD",
  "VERIFYING DETAILS",
  "IDENTIFYING VISITOR",
] as const;

// ── ID card aspect ratio (ISO/IEC 7810 ID-1: 85.6 × 53.98 mm) ─────────────
const CARD_ASPECT = 85.6 / 53.98; // ≈ 1.586

// ── Timeout for the FastAPI call ──────────────────────────────────────────
const SCAN_TIMEOUT_MS = 90_000;

export default function ScanFlow() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const guideRef = useRef<HTMLDivElement | null>(null);
  const isScanningRef = useRef(false);
  const startingRef = useRef(false);
  const resetFlagRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const [phase, setPhase] = useState<Phase>("ready");
  const [flash, setFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recognizedName, setRecognizedName] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState(0);
  const [videoReady, setVideoReady] = useState(false);

  const { dispatch, stop } = useRobotVoice();

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setVideoReady(false);
  }, []);

  const attachStream = useCallback(
    (stream: MediaStream) => {
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;

      const onLoaded = () => {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          setVideoReady(true);
          video.play().catch(() => {});
        }
      };

      if (video.readyState >= 1 && video.videoWidth > 0 && video.videoHeight > 0) {
        onLoaded();
      } else {
        video.addEventListener("loadedmetadata", onLoaded, { once: true });
      }
    },
    []
  );

  async function openCamera() {
    if (startingRef.current || isScanningRef.current) return;
    startingRef.current = true;
    setError(null);
    setRecognizedName(null);
    setVideoReady(false);
    setPhase("camera");
    dispatch({ type: "scan-start" });

    try {
      stopStream();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      attachStream(stream);
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access was blocked. Please allow camera access and try again.");
      setPhase("error");
      dispatch({ type: "scan-camera-error" });
    } finally {
      startingRef.current = false;
    }
  }

  // Re-attach the still-running stream when we return to the camera panel
  // after a failed scan — no new getUserMedia() permission prompt needed.
  useEffect(() => {
    if (phase !== "camera") return;
    const stream = streamRef.current;
    const video = videoRef.current;
    if (!stream || !video) return;
    if (video.srcObject === stream) return;
    attachStream(stream);
  }, [phase, attachStream]);

  useEffect(() => {
    return () => {
      resetFlagRef.current = true;
      abortRef.current?.abort("unmount");
      stopStream();
      stop();
    };
  }, [stop, stopStream]);

  /**
   * Map the visible card-guide rectangle (CSS/display coordinates) into the
   * actual video pixel coordinates, accounting for `object-fit: cover`
   * scaling, centering and any letterboxing.
   */
  function computeSourceRect(
    vw: number,
    vh: number
  ): { sx: number; sy: number; sw: number; sh: number } {
    const container = containerRef.current;
    const guide = guideRef.current;

    if (!container || !guide) {
      // Fallback: centered card-sized region (88% height)
      const sh = Math.min(vh * 0.88, vh);
      const sw = Math.min(sh * CARD_ASPECT, vw);
      return {
        sx: Math.max(0, Math.round((vw - sw) / 2)),
        sy: Math.max(0, Math.round((vh - sh) / 2)),
        sw: Math.round(sw),
        sh: Math.round(sh),
      };
    }

    const cRect = container.getBoundingClientRect();
    const gRect = guide.getBoundingClientRect();

    // object-fit: cover — the video is scaled to fill the container and
    // centered, with the overflow cropped evenly on both sides.
    const scale = Math.max(cRect.width / vw, cRect.height / vh);
    const dispW = vw * scale;
    const dispH = vh * scale;
    const offsetX = (cRect.width - dispW) / 2;
    const offsetY = (cRect.height - dispH) / 2;

    const sx0 = (gRect.left - cRect.left - offsetX) / scale;
    const sy0 = (gRect.top - cRect.top - offsetY) / scale;
    const sw0 = gRect.width / scale;
    const sh0 = gRect.height / scale;

    // Safety margin (6% on each side) so card borders and name text are never clipped
    const marginX = sw0 * 0.06;
    const marginY = sh0 * 0.06;

    const sx = Math.max(0, Math.round(sx0 - marginX));
    const sy = Math.max(0, Math.round(sy0 - marginY));
    const sxEnd = Math.min(vw, Math.round(sx0 + sw0 + marginX));
    const syEnd = Math.min(vh, Math.round(sy0 + sh0 + marginY));

    return {
      sx,
      sy,
      sw: Math.max(10, sxEnd - sx),
      sh: Math.max(10, syEnd - sy),
    };
  }

  const captureAndSend = async () => {
    // Scanning lock — protects against double clicks / stale handlers.
    if (isScanningRef.current) return;

    const video = videoRef.current;
    if (!video || !streamRef.current || !videoReady) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh || video.readyState < 2) {
      setError("The camera is not ready yet. Please wait a moment and try again.");
      return;
    }

    isScanningRef.current = true;
    resetFlagRef.current = false;
    setError(null);

    // Brief capture flash.
    setFlash(true);
    await new Promise((r) => setTimeout(r, 160));
    setFlash(false);

    const { sx, sy, sw, sh } = computeSourceRect(vw, vh);

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(2, Math.round(sw));
    canvas.height = Math.max(2, Math.round(sh));
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      isScanningRef.current = false;
      return;
    }

    if (canvas.width < 100 || canvas.height < 100) {
      isScanningRef.current = false;
      setError("Invalid capture dimensions. Please hold the card inside the guide frame.");
      return;
    }

    // Natural orientation — matches the preview. No mirroring applied.
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    if (process.env.NODE_ENV !== "production") {
      console.log("Camera:", {
        videoWidth: vw,
        videoHeight: vh,
        readyState: video.readyState,
      });
      console.log("Crop:", {
        sourceCropX: sx,
        sourceCropY: sy,
        sourceCropWidth: sw,
        sourceCropHeight: sh,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
      });
    }

    canvas.toBlob(
      async (blob) => {
        if (!blob || blob.size < 2048) {
          isScanningRef.current = false;
          setError("Could not capture a clear image. Please try again.");
          return;
        }

        if (process.env.NODE_ENV !== "production") {
          console.log("Capture:", {
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
            blobSize: blob.size,
            mimeType: blob.type,
          });
          console.log("Request:", {
            requestStartedAt: new Date().toISOString(),
          });
        }

        // We have everything we need from the camera now — release it
        // immediately rather than keeping it live through the OCR call.
        // FastAPI/PaddleOCR can take 10-20s+; the webcam must not stay
        // active (hidden behind the processing screen) for that whole time.
        stopStream();

        await sendToApi(blob);
      },
      "image/jpeg",
      0.94
    );
  };

  async function sendToApi(blob: Blob) {
    setPhase("processing");
    setProcessingStep(0);
    dispatch({ type: "scan-processing" });

    const stepInterval = window.setInterval(() => {
      setProcessingStep((prev) =>
        prev < PROCESSING_STEPS.length - 1 ? prev + 1 : prev
      );
    }, 2400);

    const controller = new AbortController();
    abortRef.current = controller;
    const timeoutId = window.setTimeout(
      () => controller.abort("timeout"),
      SCAN_TIMEOUT_MS
    );

    try {
      const formData = new FormData();
      formData.append("file", blob, "id-card.jpg");

      const response = await fetch(`${API_URL}/scan-id`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      clearInterval(stepInterval);
      if (resetFlagRef.current) return;

      if (!response.ok) {
        console.error("FastAPI HTTP error:", response.status, response.statusText);
        await handleScanFailure("The scanner returned an error. Please try again.", "scan-error");
        return;
      }

      const result: ScanApiResponse = await response.json();
      if (process.env.NODE_ENV !== "production") {
        console.log("Response:", {
          success: result.success,
          name: result.name,
          confidence: result.confidence,
          processing_time_ms: result.processing_time_ms,
        });
      }
      if (resetFlagRef.current) return;

      if (result.success && result.name) {
        setRecognizedName(result.name);
        setPhase("detected");
        dispatch({ type: "scan-recognized", firstName: result.name.split(" ")[0] });
      } else {
        await handleScanFailure(
          result.message || "Couldn't read the ID clearly. Please position the full card inside the frame and try again.",
          "scan-error"
        );
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      clearInterval(stepInterval);
      if (resetFlagRef.current) return;

      const timedOut = err instanceof DOMException && err.name === "AbortError";
      if (timedOut) {
        await handleScanFailure("The scan took too long. Please try again.", "scan-network-error");
      } else {
        console.error("Fetch error:", err);
        await handleScanFailure("Scanner service unavailable. Please try again.", "scan-network-error");
      }
    } finally {
      isScanningRef.current = false;
      abortRef.current = null;
    }
  }

  async function handleScanFailure(
    message: string,
    voiceAction: "scan-error" | "scan-network-error"
  ) {
    // The camera was already stopped right after capture (see captureAndSend),
    // so retrying needs a brand-new getUserMedia() stream — the old one is gone.
    // Clear the scanning guard first so openCamera() doesn't bail out
    // thinking a scan is still in progress (its own flag hasn't been reset
    // yet — that happens in sendToApi's `finally`, which runs after this).
    isScanningRef.current = false;
    setProcessingStep(0);

    await openCamera();

    // openCamera() resets error state for a clean start — apply the failure
    // reason and voice cue after, so the visitor actually sees/hears it.
    setError(message);
    dispatch({ type: voiceAction });
  }

  function reset() {
    resetFlagRef.current = true;
    abortRef.current?.abort("user-reset");
    stopStream();
    stop();
    isScanningRef.current = false;
    setRecognizedName(null);
    setError(null);
    setProcessingStep(0);
    setPhase("ready");
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden text-white" style={{ background: "#000" }}>
      <header
        className="sticky top-0 z-20 flex items-center justify-between border-b px-6 py-4"
        style={{ background: "#000", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <Link
          href="/"
          data-robot-action="home"
          data-robot-from="scan"
          className="inline-flex items-center gap-2 font-sans text-[14px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          style={{ color: "rgba(255,255,255,0.7)", letterSpacing: "-0.01em" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)")}
        >
          <BackIcon />
          Home
        </Link>

        <span
          className="font-display text-white select-none"
          style={{ fontSize: "clamp(16px, 2vw, 20px)", letterSpacing: "-0.04em" }}
        >
          Asthra 11.0
        </span>

        <Link
          href="/events"
          data-robot-action="event-directory"
          data-robot-from="scan"
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
          Events
        </Link>
      </header>

      <section className="px-4 sm:px-6 lg:px-12 py-10">
        <div className="max-w-2xl mx-auto">
          {phase === "detected" && recognizedName ? (
            <GreetingCard name={recognizedName} onReset={reset} />
          ) : (
            <div
              className="rounded-[24px] overflow-hidden"
              style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {phase === "ready" && <ReadyPanel onStart={openCamera} />}

              {phase === "camera" && (
                <ScanningPanel
                  videoRef={videoRef}
                  containerRef={containerRef}
                  guideRef={guideRef}
                  videoReady={videoReady}
                  isFlash={flash}
                  error={error}
                  onCapture={captureAndSend}
                  onCancel={reset}
                />
              )}

              {phase === "processing" && (
                <ProcessingPanel step={processingStep} onCancel={reset} />
              )}

              {phase === "error" && (
                <ErrorPanel message={error ?? "Something went wrong."} onRetry={openCamera} />
              )}

              <div
                className="border-t px-6 py-3 flex items-center justify-between font-sans text-[12px]"
                style={{ borderColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}
              >
                <span>AI-powered ID recognition</span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block rounded-full"
                    style={{ width: 6, height: 6, background: "rgba(255,255,255,0.5)" }}
                  />
                  Kiosk ready
                </span>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function ReadyPanel({ onStart }: { onStart: () => void }) {
  return (
    <div className="px-8 sm:px-12 py-14 sm:py-20 text-center">
      <p
        className="font-sans font-semibold uppercase tracking-[0.14em] mb-5"
        style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}
      >
        Welcome kiosk
      </p>

      <h2
        className="font-display text-white"
        style={{ fontSize: "clamp(42px, 7vw, 72px)", lineHeight: 1.02 }}
      >
        Scan your ID
        <span style={{ color: "#fff" }}>.</span>
      </h2>

      <p
        className="mt-4 font-sans text-[15px] max-w-md mx-auto"
        style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}
      >
        {"I'll greet you by name — spoken aloud by the Asthra assistant. Hold your ID flat inside the card frame and tap "}
        <strong style={{ color: "rgba(255,255,255,0.8)" }}>Scan now</strong>.
      </p>

      <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onStart}
          id="open-camera-btn"
          data-robot-action="scan-start"
          className="inline-flex items-center justify-center gap-2 rounded-full font-sans font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
          style={{
            background: "#fff",
            color: "#000",
            fontSize: "clamp(14px, 1.5vw, 16px)",
            padding: "14px clamp(24px, 3vw, 32px)",
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.15), 0 0 22px rgba(255,255,255,0.25), 0 0 44px rgba(255,255,255,0.08)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-1px) scale(1.01)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "";
          }}
        >
          <ScanIcon />
          Open camera
        </button>
      </div>

      <div
        className="mt-8 flex items-center justify-center gap-6 font-sans text-[12px]"
        style={{ color: "rgba(255,255,255,0.35)" }}
      >
        <span className="flex items-center gap-1.5">
          <span className="inline-block rounded-full" style={{ width: 6, height: 6, background: "rgba(255,255,255,0.45)" }} />
          Camera stays on device
        </span>
        <span className="hidden sm:flex items-center gap-1.5">
          <span className="inline-block rounded-full" style={{ width: 6, height: 6, background: "rgba(255,255,255,0.45)" }} />
          No recording
        </span>
      </div>
    </div>
  );
}

function ScanningPanel({
  videoRef,
  containerRef,
  guideRef,
  videoReady,
  isFlash,
  error,
  onCapture,
  onCancel,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  guideRef: React.RefObject<HTMLDivElement | null>;
  videoReady: boolean;
  isFlash: boolean;
  error: string | null;
  onCapture: () => void;
  onCancel: () => void;
}) {
  return (
    <div>
      {/* Landscape ID card viewport (1.586 / 1) so the card fits prominently */}
      <div
        ref={containerRef}
        className="relative w-full bg-black overflow-hidden"
        style={{ aspectRatio: "1.586 / 1" }}
      >
        {/* Live video – natural orientation for ID card scanning */}
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          playsInline
          muted
          autoPlay
        />

        {/* Capture flash */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "#fff",
            opacity: isFlash ? 0.65 : 0,
            transition: "opacity 0.12s ease",
            zIndex: 20,
          }}
        />

        {/* Dim background surround with subtle cutout for ID card focus */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "rgba(0, 0, 0, 0.45)",
            maskImage: "radial-gradient(ellipse 88% 88% at 50% 50%, transparent 88%, black 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 88% 88% at 50% 50%, transparent 88%, black 100%)",
          }}
        />

        {/* Large ID card guide frame — occupies 88% of container */}
        <div
          ref={guideRef}
          className="absolute rounded-xl pointer-events-none"
          style={{
            width: "88%",
            height: "88%",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.18), inset 0 0 0 1px rgba(255,255,255,0.08)",
          }}
        >
          {/* Prominent corner brackets */}
          <CardCorner pos="tl" />
          <CardCorner pos="tr" />
          <CardCorner pos="bl" />
          <CardCorner pos="br" />

          {/* Animated scan line */}
          {videoReady && (
            <div
              className="absolute left-2 right-2 animate-scan"
              style={{
                height: 2,
                background: "rgba(255,255,255,0.95)",
                boxShadow: "0 0 12px 3px rgba(255,255,255,0.6)",
                borderRadius: 1,
              }}
            />
          )}

          {/* Loading state */}
          {!videoReady && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="font-sans text-[13px] font-semibold text-white/60 animate-pulse">
                Starting camera…
              </p>
            </div>
          )}
        </div>

        {/* Scanning badge */}
        <div
          className="absolute top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full font-sans font-semibold uppercase z-10"
          style={{
            background: "rgba(255,255,255,0.92)",
            color: "#000",
            fontSize: "11px",
            letterSpacing: "0.1em",
            padding: "4px 12px",
          }}
        >
          <span
            className="inline-block rounded-full animate-pulse"
            style={{ width: 6, height: 6, background: "#000" }}
          />
          Scanning
        </div>
      </div>

      {/* Inline error / retry hint */}
      {error && (
        <div className="px-5 py-3 flex items-start gap-2.5 border-t" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,70,70,0.06)" }}>
          <AlertIcon />
          <p className="font-sans text-[13px]" style={{ color: "rgba(255,255,255,0.7)" }}>
            {error}
          </p>
        </div>
      )}

      {/* Action bar */}
      <div
        className="flex items-center justify-between px-5 py-4 border-t"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <p className="font-sans text-[13px]" style={{ color: "rgba(255,255,255,0.45)" }}>
          {videoReady ? "Align your ID inside the frame and tap Scan now" : "Waiting for camera…"}
        </p>
        <div className="flex items-center gap-3">
          <button
            id="scan-capture-btn"
            onClick={onCapture}
            disabled={!videoReady}
            className="rounded-full font-sans font-semibold text-[13px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ padding: "9px 20px", background: "#fff", color: "#000" }}
            onMouseEnter={(e) => {
              if (!(e.currentTarget as HTMLButtonElement).disabled)
                (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = "")}
          >
            Scan now
          </button>
          <button
            id="scan-cancel-btn"
            onClick={onCancel}
            className="font-sans font-semibold text-[13px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
            style={{ color: "rgba(255,255,255,0.6)", textDecoration: "underline", textUnderlineOffset: 3 }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)")}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

type CornerPos = "tl" | "tr" | "bl" | "br";
function CardCorner({ pos }: { pos: CornerPos }) {
  const styles: Record<CornerPos, React.CSSProperties> = {
    tl: { top: -2, left: -2, borderTop: "3px solid #fff", borderLeft: "3px solid #fff", borderRadius: "4px 0 0 0" },
    tr: { top: -2, right: -2, borderTop: "3px solid #fff", borderRight: "3px solid #fff", borderRadius: "0 4px 0 0" },
    bl: { bottom: -2, left: -2, borderBottom: "3px solid #fff", borderLeft: "3px solid #fff", borderRadius: "0 0 0 4px" },
    br: { bottom: -2, right: -2, borderBottom: "3px solid #fff", borderRight: "3px solid #fff", borderRadius: "0 0 4px 0" },
  };
  return <div className="absolute w-7 h-7 pointer-events-none" style={styles[pos]} />;
}

function ProcessingPanel({ step, onCancel }: { step: number; onCancel: () => void }) {
  const label = PROCESSING_STEPS[Math.min(step, PROCESSING_STEPS.length - 1)];
  const isLast = step >= PROCESSING_STEPS.length - 1;

  return (
    <div className="px-8 sm:px-12 py-14 sm:py-20 text-center">
      <div className="flex justify-center mb-8">
        <div className="relative flex items-center justify-center" style={{ width: 72, height: 72 }}>
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true" style={{ animation: "spin 1.4s linear infinite" }}>
            <circle cx="36" cy="36" r="30" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
            <path d="M36 6 A30 30 0 0 1 66 36" stroke="rgba(255,255,255,0.85)" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="absolute inline-block rounded-full" style={{ width: 8, height: 8, background: "rgba(255,255,255,0.8)" }} />
        </div>
      </div>

      <p key={label} className="font-sans font-semibold uppercase tracking-[0.14em] animate-fade-up" style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
        {label}
      </p>

      <h2 className="font-display text-white mt-4" style={{ fontSize: "clamp(36px, 6vw, 56px)", lineHeight: 1.05 }}>
        Identifying<span style={{ color: "#fff" }}>.</span>
      </h2>

      <p className="mt-4 font-sans text-[14px] max-w-xs mx-auto" style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
        {isLast ? "Almost there — confirming your identity…" : "This may take a few seconds. Please wait."}
      </p>

      <div className="mt-8 flex items-center justify-center gap-2">
        {PROCESSING_STEPS.map((_, i) => (
          <span key={i} className="inline-block rounded-full transition-all duration-500" style={{ width: i === step ? 20 : 6, height: 6, background: i <= step ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.2)" }} />
        ))}
      </div>

      <div className="mt-10">
        <button id="processing-cancel-btn" onClick={onCancel} className="font-sans font-semibold text-[13px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "underline", textUnderlineOffset: 3 }} onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)")} onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)")}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function ErrorPanel({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="px-8 sm:px-12 py-12">
      <div className="flex items-start gap-3 mb-8">
        <div className="shrink-0 flex items-center justify-center rounded-full" style={{ width: 36, height: 36, background: "rgba(255,70,70,0.12)" }}>
          <AlertIcon />
        </div>
        <div>
          <h3 className="font-display text-white" style={{ fontSize: "clamp(26px, 3.5vw, 32px)", lineHeight: 1.02 }}>
            {"Couldn't scan"}<span style={{ color: "#ff4d6a" }}>.</span>
          </h3>
          <p className="mt-1 font-sans text-[14px]" style={{ color: "rgba(255,255,255,0.55)" }}>{message}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button id="retry-camera-btn" onClick={onRetry} className="rounded-full font-sans font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer" style={{ padding: "12px 22px", background: "#fff", color: "#000", fontSize: "14px" }}>
          Try again
        </button>
      </div>

      <p className="mt-6 font-sans text-[12px]" style={{ color: "rgba(255,255,255,0.3)" }}>
        Hold the card flat inside the white frame under good lighting, name clearly visible.
      </p>
    </div>
  );
}

function GreetingCard({ name, onReset }: { name: string; onReset: () => void }) {
  const firstName = name.split(" ")[0];
  return (
    <div className="rounded-[24px] overflow-hidden animate-fade-up" style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)" }}>
      <div className="px-8 sm:px-12 py-12 sm:py-16 text-center">
        <p className="font-sans font-semibold uppercase tracking-[0.14em]" style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>
          Identity confirmed
        </p>
        <h2 className="font-display text-white mt-3" style={{ fontSize: "clamp(64px, 12vw, 108px)", lineHeight: 0.92 }}>
          {firstName}<span style={{ color: "#fff" }}>.</span>
        </h2>
        <p className="mt-4 font-sans text-[16px]" style={{ color: "rgba(255,255,255,0.7)" }}>
          Welcome, <span className="font-semibold text-white">{name}</span>.
        </p>
        <p className="mt-2 font-sans text-[14px]" style={{ color: "rgba(255,255,255,0.45)" }}>
          Welcome to <span className="font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>Asthra 11.0</span>.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/events" data-robot-action="event-directory" data-robot-from="scan" className="inline-flex items-center justify-center gap-2 rounded-full font-sans font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white" style={{ background: "#fff", color: "#000", fontSize: "clamp(14px, 1.5vw, 15px)", padding: "13px 26px" }} onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = "translateY(-1px)")} onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = "")}>
            Explore events <ArrowRight />
          </Link>
          <button id="scan-another-btn" onClick={onReset} className="rounded-full font-sans font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer" style={{ padding: "13px 26px", fontSize: "clamp(14px, 1.5vw, 15px)", background: "var(--pill-dark)", color: "var(--sign-in-text)" }}>
            Scan another
          </button>
        </div>
      </div>
    </div>
  );
}

function BackIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>;
}
function ScanIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="12" cy="12" r="3" /></svg>;
}
function AlertIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="#ff4d6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
}
function ArrowRight() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>;
}