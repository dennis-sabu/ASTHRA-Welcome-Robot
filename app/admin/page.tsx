import type { Metadata } from "next";
import AdminShell from "@/app/admin/AdminShell";
import PixelBlast from "@/app/components/PixelBlast";

export const metadata: Metadata = {
  title: "Admin · Asthra",
  // Prevent search engines from indexing this page
  robots: { index: false, follow: false },
};

export default function AdminPage() {
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
      <div className="relative z-10">
        <AdminShell />
      </div>
    </div>
  );
}
