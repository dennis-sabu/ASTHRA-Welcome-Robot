import type { Metadata } from "next";
import PixelBlast from "@/app/components/PixelBlast";
import MakersShowcase from "@/app/makers/MakersShowcase";

export const metadata: Metadata = {
  title: "Meet the Makers · Asthra 11.0",
  description: "The people who built the ASTHRA Welcome Robot — coordinators, technical team and design team from SJCET Palai.",
};

export default function MakersPage() {
  return (
    <div className="relative z-10 min-h-screen">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <PixelBlast
          variant="circle"
          color="#22d3ee"
          transparent
          speed={0.3}
          pixelSize={4}
          className="w-full h-full"
          style={{}}
        />
      </div>
      <MakersShowcase />
    </div>
  );
}
