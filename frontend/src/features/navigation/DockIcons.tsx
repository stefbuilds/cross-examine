// Terminal motion adapted from AnimateIcons, Avijit Dey (@avijit07x), MIT.
// https://github.com/Avijit07x/animateicons
import { motion, useReducedMotion } from "framer-motion";
import type { SVGProps } from "react";

export function TerminalIcon({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  return <motion.svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial="normal" animate={active && !reduced ? "animate" : "normal"}>
    <motion.path d="M12 19h8" variants={{ normal: { scaleX: 1, originX: 0, transition: { duration: .3 } }, animate: { scaleX: [1, .3, 1], originX: 0, transition: { duration: .6, times: [0, .5, 1] } } }} />
    <motion.path d="m4 17 6-6-6-6" variants={{ normal: { x: 0, opacity: 1 }, animate: { x: [0, -2, 0], opacity: [1, .6, 1], transition: { duration: .5, delay: .1 } } }} />
  </motion.svg>;
}

export function LogsIcon(props: SVGProps<SVGSVGElement>) {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" {...props}><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12h.01M4 6h.01M4 18h.01M8 18h2m-2-6h2M8 6h2m4 0h6m-6 6h6m-6 6h6" /></svg>;
}

// User-supplied Pleroma paths; corrected the pasted SVG's self-closing paths
// so their animations are valid children. Reduced motion shows the final mark.
export function PleromaIcon({ size = 20, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  const reduced = useReducedMotion();
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" {...props}><g fill="currentColor">
    <path d="M6 3.5c0 -0.75 0.75 -1.5 1.5 -1.5h3.5v20h-5Z">
      {!reduced && <animate fill="freeze" attributeName="d" dur="0.4s" values="M6 2c0 0 0.75 0 1.5 0h3.5v0h-5Z;M6 3.5c0 -0.75 0.75 -1.5 1.5 -1.5h3.5v20h-5Z" />}
    </path>
    <path d="M13.5 2h5v8.5c0 0.75 -0.75 1.5 -1.5 1.5h-3.5Z">
      {!reduced && <animate fill="freeze" attributeName="d" dur="0.7s" keyTimes="0;0.714;1" values="M13.5 2h0v8.5c0 0.75 0 1.5 0 1.5h0Z;M13.5 2h0v8.5c0 0.75 0 1.5 0 1.5h0Z;M13.5 2h5v8.5c0 0.75 -0.75 1.5 -1.5 1.5h-3.5Z" />}
    </path>
    <path d="M13.5 17h5v3.5c0 0.75 -0.75 1.5 -1.5 1.5h-3.5Z">
      {!reduced && <animate fill="freeze" attributeName="d" dur="1s" keyTimes="0;0.8;1" values="M13.5 17h0v0c0 0 0 0 0 0h0Z;M13.5 17h0v0c0 0 0 0 0 0h0Z;M13.5 17h5v3.5c0 0.75 -0.75 1.5 -1.5 1.5h-3.5Z" />}
    </path>
  </g></svg>;
}

export function CirclesFourIcon(props: SVGProps<SVGSVGElement>) {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 256 256" {...props}><path fill="currentColor" d="M80 40a40 40 0 1 0 40 40a40 40 0 0 0-40-40m0 64a24 24 0 1 1 24-24a24 24 0 0 1-24 24m96 16a40 40 0 1 0-40-40a40 40 0 0 0 40 40m0-64a24 24 0 1 1-24 24a24 24 0 0 1 24-24m-96 80a40 40 0 1 0 40 40a40 40 0 0 0-40-40m0 64a24 24 0 1 1 24-24a24 24 0 0 1-24 24m96-64a40 40 0 1 0 40 40a40 40 0 0 0-40-40m0 64a24 24 0 1 1 24-24a24 24 0 0 1-24 24" /></svg>;
}
