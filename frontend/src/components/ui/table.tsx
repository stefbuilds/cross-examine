// Shared semantic table primitive.
import type * as React from "react";

import { cn } from "@/lib/utils";

export function Table({ className, ...props }: React.ComponentProps<"table">) { return <div className="relative w-full overflow-x-auto" data-slot="table-container"><table className={cn("w-full caption-bottom text-sm", className)} data-slot="table" {...props} /></div>; }
export function TableHeader({ className, ...props }: React.ComponentProps<"thead">) { return <thead className={cn("[&_tr]:border-b-2 [&_tr]:border-border", className)} data-slot="table-header" {...props} />; }
export function TableBody({ className, ...props }: React.ComponentProps<"tbody">) { return <tbody className={cn("[&_tr:last-child]:border-0 [&_tr:hover]:bg-primary/[0.06] [&_tr:hover]:shadow-[inset_2px_0_0_0_var(--primary)]", className)} data-slot="table-body" {...props} />; }
export function TableRow({ className, ...props }: React.ComponentProps<"tr">) { return <tr className={cn("border-b transition-colors", className)} data-slot="table-row" {...props} />; }
export function TableHead({ className, ...props }: React.ComponentProps<"th">) { return <th className={cn("h-11 whitespace-nowrap px-4 text-left align-middle text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground", className)} data-slot="table-head" {...props} />; }
export function TableCell({ className, ...props }: React.ComponentProps<"td">) { return <td className={cn("p-4 align-middle", className)} data-slot="table-cell" {...props} />; }
