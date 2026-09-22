import * as React from "react";
import { ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

const Breadcrumb = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<"nav">>((props, ref) => (
  <nav aria-label="Breadcrumb" ref={ref} {...props} />
));
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = React.forwardRef<HTMLOListElement, React.ComponentPropsWithoutRef<"ol">>(({ className, ...props }, ref) => (
  <ol className={cn("flex flex-wrap items-center gap-1.5 break-words text-xs text-muted-foreground sm:gap-2", className)} ref={ref} {...props} />
));
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<"li">>(({ className, ...props }, ref) => (
  <li className={cn("inline-flex items-center gap-1.5", className)} ref={ref} {...props} />
));
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, React.ComponentPropsWithoutRef<"a">>(({ className, ...props }, ref) => (
  <a className={cn("transition-colors hover:text-foreground", className)} ref={ref} {...props} />
));
BreadcrumbLink.displayName = "BreadcrumbLink";

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return <span aria-current="page" className={cn("font-medium text-foreground", className)} {...props} />;
}

function BreadcrumbSeparator({ className, ...props }: React.ComponentProps<"li">) {
  return <li aria-hidden="true" className={className} role="presentation" {...props}><ChevronRight className="size-3.5" /></li>;
}

function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return <span aria-hidden="true" className={cn("grid size-5 place-items-center", className)} role="presentation" {...props}><MoreHorizontal className="size-4" /></span>;
}

export { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator };
