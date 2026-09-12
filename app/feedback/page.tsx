import PixelBlast from "@/app/components/PixelBlast";
import FeedbackFlow from "./FeedbackFlow";

export const metadata = {
    title: "Feedback · Asthra",
    description: "Share your feedback on the ASTHRA Welcome Robot experience.",
};

export default function FeedbackPage() {
    return (
        <div className="relative z-10 min-h-screen">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <PixelBlast
                    variant="circle"
                    color="#22d3ee"
                    transparent
                    speed={0.3}
                    pixelSize={6}
                    patternDensity={2.2}
                    patternScale={1.2}
                    className="w-full h-full"
                    style={{}}
                />
            </div>
            {/* Background shadow fade & vignette overlay for enhanced content visibility */}
            <div
                className="fixed inset-0 z-[1] pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse 90% 80% at 50% 45%, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.75) 65%, rgba(0, 0, 0, 0.94) 100%), linear-gradient(180deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.25) 20%, rgba(0, 0, 0, 0.3) 75%, rgba(0, 0, 0, 0.85) 100%)",
                }}
            />

            {/* Feedback content — sits above background layers */}
            <div className="relative z-[2]">
                <FeedbackFlow />
            </div>
        </div>
    );
}