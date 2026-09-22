import { useEffect, useRef } from "react";

const FRAME_MS = 1000 / 60;
const ARROW_PATH =
  "M248,121.58a15.76,15.76,0,0,1-11.29,15l-.2.06-78,21.84-21.84,78-.06.2a15.77,15.77,0,0,1-15,11.29h-.3a15.77,15.77,0,0,1-15.07-10.67L41,61.41a1,1,0,0,1-.05-.16A16,16,0,0,1,61.25,40.9l.16.05,175.92,65.26A15.78,15.78,0,0,1,248,121.58Z";

/** The UImaxxing pointer follows and turns around its 3.94px click hotspot. */
export function PointerCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || !window.matchMedia("(pointer: fine)").matches) return;

    const root = document.documentElement;
    root.setAttribute("data-cursor", "live");

    const animateMotion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let hasMoved = false;
    let needsHitTest = false;
    let directionX = 0;
    let directionY = 0;
    let targetAngle = 0;
    let currentAngle = 0;
    let hoveredElement: Element | null = null;

    const onPointerMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;

      const dx = targetX - directionX;
      const dy = targetY - directionY;
      if (dx * dx + dy * dy >= 256) {
        targetAngle = (180 * Math.atan2(dy, dx)) / Math.PI + 135;
        while (targetAngle - currentAngle > 180) targetAngle -= 360;
        while (targetAngle - currentAngle < -180) targetAngle += 360;
        directionX = targetX;
        directionY = targetY;
      }

      needsHitTest = true;
      if (!hasMoved) {
        hasMoved = true;
        currentAngle = targetAngle;
        currentX = targetX;
        currentY = targetY;
        directionX = targetX;
        directionY = targetY;
        cursor.setAttribute("data-ready", "");
      }
    };
    const onLeave = () => cursor.removeAttribute("data-ready");
    const onEnter = () => {
      if (hasMoved) cursor.setAttribute("data-ready", "");
    };
    const onDown = () => cursor.setAttribute("data-press", "");
    const onUp = () => cursor.removeAttribute("data-press");
    const onScroll = () => {
      needsHitTest = true;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    let previousFrame = performance.now();
    let frame = 0;
    const render = (now: number) => {
      const elapsedFrames = Math.min((now - previousFrame) / FRAME_MS, 4);
      previousFrame = now;
      const ease = (amount: number) => 1 - Math.pow(1 - amount, elapsedFrames);

      currentAngle += (targetAngle - currentAngle) * (animateMotion ? ease(0.18) : 1);
      if (animateMotion) {
        currentX += (targetX - currentX) * ease(0.45);
        currentY += (targetY - currentY) * ease(0.45);
      } else {
        currentX = targetX;
        currentY = targetY;
      }

      if (needsHitTest && hasMoved) {
        needsHitTest = false;
        const element = document.elementFromPoint(targetX, targetY);
        if (element && element !== hoveredElement) {
          hoveredElement = element;
          cursor.toggleAttribute("data-hidden", getComputedStyle(element).cursor !== "none");
        }
      }

      cursor.style.transform = `translate3d(${currentX - 3.94}px, ${currentY - 3.94}px, 0) rotate(${currentAngle.toFixed(2)}deg)`;
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      root.removeAttribute("data-cursor");
    };
  }, []);

  return (
    <div ref={cursorRef} className="pointer-cursor" aria-hidden="true">
      <svg viewBox="0 0 256 256" className="pointer-cursor-glyph">
        <path d={ARROW_PATH} fill="none" stroke="var(--cursor-halo)" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" />
        <path d={ARROW_PATH} fill="var(--cursor-ink)" />
      </svg>
    </div>
  );
}
