import { cn } from "@/lib/utils";

export function GradientButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center justify-center rounded-control bg-gradient-to-r from-accent-peach via-fg to-accent-blue px-4 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Circular "aurora orb" button — the signature sphere from the Figma design
 * (send buttons, voice orb, arrow buttons). Gradient lives in `.bg-orb`;
 * icons sit dark on the lit sphere, matching the reference.
 */
export function GradientIconButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "bg-orb flex size-11 items-center justify-center rounded-full text-white shadow-[0_0_24px_-4px_rgba(122,133,235,0.55)] transition-transform hover:scale-105",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
