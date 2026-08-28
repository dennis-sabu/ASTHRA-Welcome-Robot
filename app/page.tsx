import Link from "next/link";
import WelcomeLoop from "./components/WelcomeLoop";
import HeroShell from "./components/HeroShell";

export default function Home() {
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#1a1a2e] text-white">
      {/* Real tech-fest photography loop. */}
      <WelcomeLoop />

      {/* Centered content. */}
      <HeroShell />

      {/* Skip link for keyboard users. */}
      <Link
        href="/scan"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-white focus:text-black focus:px-3 focus:py-2 focus:rounded-md"
      >
        Skip to scan
      </Link>
    </main>
  );
}
