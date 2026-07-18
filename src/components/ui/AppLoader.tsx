'use client';

import { Wave } from "@/components/ui/wave";

interface AppLoaderProps {
  fadeOut?: boolean;
}

export default function AppLoader({ fadeOut = false }: AppLoaderProps) {
  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#05050f] transition-opacity duration-500 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <Wave className="size-12 text-[#a8b4f8]" style={{ ["--duration" as any]: "0.9s", ["--delay" as any]: "120ms" }} />
    </div>
  );
}
