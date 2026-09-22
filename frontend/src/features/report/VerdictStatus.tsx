import { CircleCheck, CircleX, TriangleAlert } from "lucide-react";

import type { Verdict } from "./report-model";

const variants = {
  safe: {
    Icon: CircleCheck,
    container: "bg-emerald-50 dark:bg-emerald-950/40",
    label: "text-emerald-700 dark:text-emerald-300",
  },
  risky: {
    Icon: TriangleAlert,
    container: "bg-orange-50 dark:bg-orange-950/40",
    label: "text-amber-700 dark:text-amber-300",
  },
  broken: {
    Icon: CircleX,
    container: "bg-rose-50 dark:bg-rose-950/40",
    label: "text-rose-700 dark:text-rose-300",
  },
} as const;

/** Compact verdict status presentation. */
export function VerdictStatus({ verdict }: { verdict: Verdict }) {
  const { Icon, container, label } = variants[verdict];

  return (
    <div
      className={`flex h-[35px] w-28 items-center justify-center rounded-xl sm:w-40 ${container}`}
    >
      <h1 className={`flex items-center font-semibold ${label}`}>
        <Icon className="mr-2 h-4 w-4" strokeWidth={3} />
        {verdict.toUpperCase()}
      </h1>
    </div>
  );
}
