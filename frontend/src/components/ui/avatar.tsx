import * as React from "react";
import { Avatar as AvatarPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

type AvatarProps = React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
  seed?: number;
  size?: "sm" | "md" | "lg";
};

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, seed, size, children, style, ...props }, ref) => {
  const uimaxAvatar = seed !== undefined || size !== undefined;
  const dims = size === "sm" ? "size-5" : size === "lg" ? "size-10" : "size-7";
  const hue = ((seed ?? 0) % 3) * 14;
  return (
    <AvatarPrimitive.Root
      ref={ref}
      aria-hidden={uimaxAvatar || undefined}
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full",
        uimaxAvatar ? cn("bg-orb inline-block", dims) : "size-8",
        className,
      )}
      style={uimaxAvatar && hue ? { ...style, filter: `hue-rotate(-${hue}deg)` } : style}
      {...props}
    >
      {children}
    </AvatarPrimitive.Root>
  );
});
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn("flex size-full items-center justify-center rounded-full bg-primary font-heading text-[10px] font-semibold text-primary-foreground", className)}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image ref={ref} className={cn("aspect-square size-full", className)} {...props} />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

export { Avatar, AvatarFallback, AvatarImage };
