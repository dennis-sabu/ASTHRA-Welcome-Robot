import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { RobotVoiceProvider } from "./components/RobotVoice";
import RobotHud from "./components/RobotHud";
import GlobalActionBridge from "./components/GlobalActionBridge";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Intelligence Designed To Evolve",
  description:
    "Asthra 11.0 — the premier AI, robotics, and engineering technology festival at SJCET Palai. Scan your ID or explore all events.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${mono.variable} h-full`}
    >
      <head>
        {/* Inter via Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />

        {/* BubbledotICG-FinePos — retro dot-matrix display font */}
        <link
          href="https://db.onlinewebfonts.com/c/8cb707a9b8a73f8a7403336b861c3074?family=BubbledotICG-FinePos"
          rel="stylesheet"
        />

        {/* Font Awesome 6.5.2 — brand icons for trust avatars */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
          integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#000] text-white">
        <RobotVoiceProvider>
          {/* GlobalActionBridge runs at the root so every page picks up
              data-robot-action clicks without explicit wiring. */}
          <GlobalActionBridge />
          {children}
          {/* The HUD sits above all routes; it reads the robot state from
              the provider and is hidden automatically if TTS is unavailable. */}
          <RobotHud />
        </RobotVoiceProvider>
      </body>
    </html>
  );
}
