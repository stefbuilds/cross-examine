import { Link } from "react-router-dom";

import { PaperDesignBackground } from "@/components/ui/neon-dither";
import { PixelHero } from "@/components/ui/pixel-perfect-hero";

export function WelcomePage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-background">
      <PaperDesignBackground className="-z-10" intensity={0.85} parallax />
      <PixelHero
        description="Cross-Examine independently captures the behavior a change must preserve, then presents the exact evidence behind every verdict."
        primaryAction={
          <Link
            className="relative inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-gradient-to-b from-primary/90 to-primary px-4 text-xs font-semibold text-primary-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_2px_4px_rgba(0,0,0,0.15),0_12px_24px_rgba(0,0,0,0.15)] ring-1 ring-primary/20 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:h-12 md:gap-2 md:px-8 md:text-sm"
            to="/evidence"
          >
            Enter dashboard
          </Link>
        }
        word1="Evidence,"
        word2="examined."
      />
    </main>
  );
}
