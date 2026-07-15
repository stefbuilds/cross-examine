"use client"

import { useEffect, useMemo, useState } from "react"
import { Dithering } from "@paper-design/shaders-react"

interface PaperDesignBackgroundProps {
  // Visual intensity 0..1
  intensity?: number
  // Enable subtle parallax mouse move
  parallax?: boolean
  // Optional className to adjust z-index or positioning
  className?: string
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    setReducedMotion(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

export function PaperDesignBackground({
  intensity = 0.8,
  parallax = true,
  className = "",
}: PaperDesignBackgroundProps) {
  const reducedMotion = useReducedMotion();
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );

  // Read the existing application theme without owning global theme state.
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setIsDark(root.classList.contains("dark"));
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    sync();
    return () => observer.disconnect();
  }, []);

  // Derived colors and speeds for light/dark
  const config = useMemo(() => {
    const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v))
    const t = clamp(intensity)

    if (isDark) {
      return {
        back: "#00000000",
        front: mix("#7F76CA", "#D08CE8", t * 0.35),
        bg: "#100e18",
        speed: 0.28 + t * 0.35,
        px: Math.round(2 + t * 2), // 2..4
        scale: 1.05 + t * 0.15,
        glow: "radial-gradient(60% 40% at 50% 40%, rgba(208,140,232,0.12), transparent 70%)",
      }
    } else {
      return {
        back: "#00000000",
        front: mix("#7F76CA", "#AC82DB", t * 0.35),
        bg: "#F5F1FA",
        speed: 0.22 + t * 0.28,
        px: Math.round(2 + t * 2),
        scale: 1.03 + t * 0.12,
        glow: "radial-gradient(60% 40% at 50% 40%, rgba(127,118,202,0.12), transparent 70%)",
      }
    }
  }, [isDark, intensity])

  // Optional mouse parallax
  useEffect(() => {
    if (!parallax || reducedMotion) return
    const root = document.getElementById("paper-bg-parallax")
    if (!root) return

    const strength = 8 // px at edges
    const onMove = (e: MouseEvent) => {
      const { innerWidth: w, innerHeight: h } = window
      const x = (e.clientX / w) * 2 - 1
      const y = (e.clientY / h) * 2 - 1
      root.style.setProperty("--parallax-x", `${(-x * strength).toFixed(2)}px`)
      root.style.setProperty("--parallax-y", `${(-y * strength).toFixed(2)}px`)
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [parallax, reducedMotion])

  return (
    <div
      id="paper-bg-parallax"
      className={[
        "pointer-events-none fixed inset-0",
        // Default behind app; override with className if needed
        "z-0",
        !reducedMotion && "transition-colors duration-500",
        className,
      ].join(" ")}
      style={{
        backgroundColor: config.bg,
        transform: parallax && !reducedMotion ? "translate3d(var(--parallax-x,0), var(--parallax-y,0), 0)" : undefined,
        willChange: parallax && !reducedMotion ? "transform" : undefined,
      }}
    >
      {/* Core dithering shader */}
      <Dithering
        colorBack={config.back}
        colorFront={config.front}
        speed={config.speed}
        shape="wave"
        type="4x4"
        pxSize={config.px}
        scale={config.scale}
        style={{
          height: "100vh",
          width: "100vw",
        }}
      />

      {/* Soft glow layer (theme-aware) */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: config.glow,
          mixBlendMode: isDark ? "screen" : "multiply",
          opacity: 1,
        }}
      />

      {/* Subtle vignette for depth */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: "radial-gradient(120% 80% at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.25) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Film grain for texture */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.25' numOctaves='2' stitchTiles='stitch'/%3E%3C/fe%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.11'/%3E%3C/svg%3E\")",
          backgroundSize: "cover",
          opacity: 0.5,
          mixBlendMode: isDark ? "screen" : "multiply",
        }}
      />

      {/* Top shine sweep for a premium feel */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 35%)",
          opacity: isDark ? 0.25 : 0.4,
        }}
      />
    </div>
  )
}

/**
 * Utility: linear RGB mix between two hex colors (simple)
 */
function mix(a: string, b: string, t: number): string {
  const ah = a.replace("#", "")
  const bh = b.replace("#", "")
  const ai = parseInt(ah, 16)
  const bi = parseInt(bh, 16)
  const ar = (ai >> 16) & 0xff
  const ag = (ai >> 8) & 0xff
  const ab = ai & 0xff
  const br = (bi >> 16) & 0xff
  const bg = (bi >> 8) & 0xff
  const bb = bi & 0xff
  const rr = Math.round(ar + (br - ar) * t)
  const rg = Math.round(ag + (bg - ag) * t)
  const rb = Math.round(ab + (bb - ab) * t)
  return `#${((1 << 24) + (rr << 16) + (rg << 8) + rb).toString(16).slice(1)}`
}
