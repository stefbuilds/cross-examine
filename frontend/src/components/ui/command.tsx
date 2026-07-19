import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive className={cn("flex h-full w-full flex-col overflow-hidden bg-popover text-popover-foreground", className)} ref={ref} {...props} />
));
Command.displayName = "Command";

function CommandDialog({
  children,
  description = "Search routes and actions",
  title = "Command palette",
  ...props
}: React.ComponentProps<typeof Dialog> & { description?: string; title?: string }) {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-xl [&>button:last-child]:hidden">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>
        <Command>{children}</Command>
      </DialogContent>
    </Dialog>
  );
}

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b border-input px-5" cmdk-input-wrapper="">
    <Search aria-hidden="true" className="mr-3 size-5 text-muted-foreground" />
    <CommandPrimitive.Input
      className={cn("h-14 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground", className)}
      ref={ref}
      {...props}
    />
  </div>
));
CommandInput.displayName = "CommandInput";

const CommandList = React.forwardRef<React.ElementRef<typeof CommandPrimitive.List>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>>(
  ({ className, ...props }, ref) => <CommandPrimitive.List className={cn("max-h-80 overflow-y-auto overflow-x-hidden", className)} ref={ref} {...props} />,
);
CommandList.displayName = "CommandList";

const CommandEmpty = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Empty>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>>(
  (props, ref) => <CommandPrimitive.Empty className="py-10 text-center text-sm text-muted-foreground" ref={ref} {...props} />,
);
CommandEmpty.displayName = "CommandEmpty";

const CommandGroup = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Group>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Group
      className={cn("overflow-hidden p-2 text-foreground [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-muted-foreground", className)}
      ref={ref}
      {...props}
    />
  ),
);
CommandGroup.displayName = "CommandGroup";

const CommandSeparator = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>>(
  ({ className, ...props }, ref) => <CommandPrimitive.Separator className={cn("h-px bg-border", className)} ref={ref} {...props} />,
);
CommandSeparator.displayName = "CommandSeparator";

const CommandItem = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Item>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Item
      className={cn("relative flex cursor-default select-none items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent/20 data-[selected=true]:text-foreground data-[disabled=true]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0", className)}
      ref={ref}
      {...props}
    />
  ),
);
CommandItem.displayName = "CommandItem";

function CommandShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <kbd className={cn("ml-auto inline-flex h-5 items-center rounded border bg-background px-1.5 font-mono text-[10px] text-muted-foreground", className)} {...props} />;
}

export { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut };
