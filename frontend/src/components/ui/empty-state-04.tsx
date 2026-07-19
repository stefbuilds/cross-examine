// Shared empty-state composition.
import { FolderCheck, PlusIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty-state-04-utils/empty";
import { Marquee } from "@/components/ui/empty-state-04-utils/marquee";

export default function EmptyState({ action }: { action?: ReactNode }) {
  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-sm pt-0">
        <Empty className="px-0 py-8 md:px-0 md:py-8">
          <EmptyHeader>
            <div aria-hidden className="mask-y-from-60% mask-x-from-95% mb-3 w-full max-w-xs space-y-2">
              <Marquee className="h-56 [--duration:12s]" repeat={5} vertical>
                <div className="flex w-full items-center gap-3 rounded-lg border border-border px-4 py-3">
                  <FolderCheck className="shrink-0 fill-muted text-muted-foreground/70" />
                  <div className="h-5 w-full rounded-lg bg-muted" />
                  <div className="ms-auto size-6 shrink-0 rounded-full bg-muted" />
                </div>
              </Marquee>
            </div>
            <EmptyTitle>No verification runs yet</EmptyTitle>
            <EmptyDescription>Create a run to capture exact commands, outputs, and grounded verdicts.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            {action ?? (
              <Button asChild>
                <Link to="/run">
                  <PlusIcon /> New verification run
                </Link>
              </Button>
            )}
          </EmptyContent>
        </Empty>
      </div>
    </div>
  );
}
