
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0E1116] text-[#edf3ff]">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {children}
      </div>
    </div>
  );
}