// Visual grammar imported from coss.com's Accordion on 21st.dev.
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { ChevronDownIcon } from "lucide-react";
import type React from "react";

import { cn } from "@/lib/utils";

export function Accordion(
  props: AccordionPrimitive.Root.Props,
): React.ReactElement {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

export function AccordionItem({
  className,
  ...props
}: AccordionPrimitive.Item.Props): React.ReactElement {
  return (
    <AccordionPrimitive.Item
      className={cn("last:border-b-0", className)}
      data-slot="accordion-item"
      {...props}
    />
  );
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props): React.ReactElement {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          "group flex flex-1 cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium outline-none transition hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        data-slot="accordion-trigger"
        {...props}
      >
        {children}
        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none size-4 shrink-0 opacity-80 transition-transform duration-200 ease-in-out group-data-[panel-open]:rotate-180"
          data-slot="accordion-indicator"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionPanel({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props): React.ReactElement {
  return (
    <AccordionPrimitive.Panel
      className="h-[var(--accordion-panel-height)] overflow-hidden text-muted-foreground text-sm transition-[height] duration-200 ease-in-out data-[ending-style]:h-0 data-[starting-style]:h-0"
      data-slot="accordion-panel"
      {...props}
    >
      <div className={cn("pt-1 pb-1", className)}>{children}</div>
    </AccordionPrimitive.Panel>
  );
}

export { AccordionPrimitive, AccordionPanel as AccordionContent };
