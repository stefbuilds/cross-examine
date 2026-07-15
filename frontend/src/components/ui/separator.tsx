import * as React from "react";

import { cn } from "@/lib/utils";

function Separator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn("h-px w-full bg-border", className)} {...props} />;
}

export { Separator };
