"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamically import the Interactive Google Earth component
const InteractiveGoogleEarth = dynamic(
  () => import("@/components/simulation/interactive-google-earth"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full min-h-screen p-6 space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Skeleton className="lg:col-span-3 h-[600px]" />
          <Skeleton className="lg:col-span-1 h-[600px]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    ),
  }
);

export default function SimulationPage() {
  return (
    <div className="w-full min-h-screen p-6">
      <InteractiveGoogleEarth />
    </div>
  );
}
