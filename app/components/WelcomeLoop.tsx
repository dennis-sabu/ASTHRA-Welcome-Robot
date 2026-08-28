"use client";

/**
 * WelcomeLoop — full-bleed video background for the home screen.
 *
 * Uses the CloudFront MP4 video as the primary background. The parent
 * page gives this element `position: absolute; inset: 0` context so it
 * fills the full viewport behind all other UI.
 */
export default function WelcomeLoop() {
  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[#000]"
      aria-hidden="true"
    >
      {/* Full-viewport cover video */}
      <video
        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
        autoPlay
        muted
        loop
        playsInline
        style={{ zIndex: 0 }}
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark vignette overlay so text is always legible */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.55) 100%)",
          zIndex: 1,
        }}
      />
    </div>
  );
}
