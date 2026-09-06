import ScanFlow from "./ScanFlow";
import PixelBlast from "@/app/components/PixelBlast";

export const metadata = {
  title: "Scan My ID · Asthra",
  description: "Scan your college ID to receive a personalized greeting.",
};

export default function ScanPage() {
  return (
    <div className="relative z-10 min-h-screen">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <PixelBlast
          variant="circle"
          color="#22d3ee"
          transparent
          speed={0.3}
          pixelSize={4}
        />
      </div>
      <ScanFlow />
    </div>
  );
}
