import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

const opened = "M36 1H504C523 1 539 17 539 36C539 56 523 71 504 71H336C312 71 312 87 336 87H483C509 87 529 107 529 133C529 159 509 179 483 179H57C31 179 11 159 11 133C11 107 31 87 57 87H204C228 87 228 71 204 71H36C17 71 1 56 1 36C1 17 17 1 36 1Z";
// Same command topology; the upper lobe rests within the navbar's top edge.
const closed = "M270 87H270C270 87 270 87 270 87C270 87 270 87 270 87H270C270 87 270 87 270 87H483C509 87 529 107 529 133C529 159 509 179 483 179H57C31 179 11 159 11 133C11 107 31 87 57 87H270C270 87 270 87 270 87H270C270 87 270 87 270 87C270 87 270 87 270 87Z";

/** One perimeter for both pills and the 132px bridge. No interior strokes. */
export function JoinedPillSurface({ expanded }: { expanded: boolean }) {
  const rim = useId();
  const reduced = useReducedMotion();
  return <svg aria-hidden="true" className="joined-pill-surface" viewBox="0 0 540 180" preserveAspectRatio="none">
    <defs><linearGradient id={rim} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#e5ecff" stopOpacity=".38" /><stop offset=".4" stopColor="#aabfff" stopOpacity=".2" /><stop offset="1" stopColor="#e5ecff" stopOpacity=".22" /></linearGradient></defs>
    <motion.path initial={false} animate={{ d: expanded ? opened : closed }} transition={{ duration: reduced ? 0 : .64, ease: [.22, 1, .36, 1] }} fill="#000" stroke={`url(#${rim})`} strokeWidth="1" vectorEffect="non-scaling-stroke" />
  </svg>;
}
