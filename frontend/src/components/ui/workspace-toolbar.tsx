import { Link, useLocation } from "react-router-dom";
import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CommandPalette } from "@/components/ui/command-palette";

const routeLabels: Record<string, string> = {
  corpus: "Corpus",
  fixtures: "Fixtures",
  run: "Run locally",
  runs: "Runs",
  settings: "Settings",
  trials: "Trials",
};

export function WorkspaceToolbar() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  return (
    <header className="sticky top-0 z-20 flex h-[54px] items-center justify-between gap-4 border-b bg-background/88 px-4 backdrop-blur-xl md:px-7">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            {segments.length === 0 ? (
              <BreadcrumbPage>Evidence</BreadcrumbPage>
            ) : (
              <Link className="transition-colors hover:text-foreground" to="/">Evidence</Link>
            )}
          </BreadcrumbItem>
          {segments.map((segment, index) => {
            const last = index === segments.length - 1;
            const label = routeLabels[segment] ?? (segment.length > 18 ? `${segment.slice(0, 10)}…` : segment);
            return (
              <Fragment key={`${segment}-${index}`}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {last ? <BreadcrumbPage>{label}</BreadcrumbPage> : <span>{label}</span>}
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <CommandPalette />
    </header>
  );
}
