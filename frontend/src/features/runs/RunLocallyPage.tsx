import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useLoaderData } from "react-router-dom";

import type { RunSummary } from "@/app/api";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state-04";

import { NewRunPage } from "./NewRunPage";

export function RunLocallyPage() {
  const runs = useLoaderData() as RunSummary[];
  const [showForm, setShowForm] = useState(false);

  if (runs.length === 0 && !showForm) {
    return (
      <main className="page-shell">
        <EmptyState
          action={(
            <Button onClick={() => setShowForm(true)} type="button">
              <PlusIcon /> Start local verification
            </Button>
          )}
        />
      </main>
    );
  }

  return <NewRunPage />;
}
