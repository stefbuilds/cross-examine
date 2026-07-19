// Shared card primitive using project tokens.
import * as React from "react";

import { cn } from "@/lib/utils";

type CardVariant = "transparent" | "default" | "secondary" | "tertiary";

const variantClasses: Record<CardVariant, string> = {
  transparent: "border-none bg-transparent shadow-none",
  default: "border border-border bg-card shadow-[0_18px_50px_rgba(50,50,50,0.08)]",
  secondary: "border border-border bg-secondary shadow-[0_18px_50px_rgba(50,50,50,0.06)]",
  tertiary: "border border-primary/20 bg-primary/10 shadow-[0_18px_50px_rgba(127,118,202,0.12)]",
};

type CardRootProps = React.HTMLAttributes<HTMLDivElement> & { variant?: CardVariant };

function CardRoot({ className, variant = "default", ...props }: CardRootProps) {
  return <div className={cn("relative flex flex-col gap-3 overflow-visible rounded-[var(--radius-3xl)] p-5 text-card-foreground", variantClasses[variant], className)} data-slot="card" {...props} />;
}

function CardHeader(props: React.HTMLAttributes<HTMLDivElement>) { return <div data-slot="card-header" {...props} />; }
function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) { return <h3 className={cn("font-heading text-lg font-semibold", className)} data-slot="card-title" {...props} />; }
function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) { return <p className={cn("text-sm leading-6 text-muted-foreground", className)} data-slot="card-description" {...props} />; }
function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn("flex flex-1 flex-col", className)} data-slot="card-content" {...props} />; }
function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn("flex items-center", className)} data-slot="card-footer" {...props} />; }

const Card = Object.assign(CardRoot, { Header: CardHeader, Title: CardTitle, Description: CardDescription, Content: CardContent, Footer: CardFooter });

export { Card, CardRoot, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export type { CardRootProps, CardVariant };
