import { EvidenceCodeBlock } from "@/components/ui/code-block";

import type { Finding } from "./report-model";

function EvidenceBlock({ label, value }: { label: string; value: string }) {
  return <EvidenceCodeBlock code={value} label={label} />;
}

export function FindingEvidence({ finding }: { finding: Finding }) {
  return (
    <div className="grid gap-3 border-t border-border bg-[#e9e8e6]/60 p-4 md:p-5">
      <EvidenceBlock label="Exact command" value={finding.command} />
      <EvidenceBlock label="Captured output" value={finding.output} />
      {finding.repro_input !== null && (
        <EvidenceBlock label="Reproducing input" value={finding.repro_input} />
      )}
      <div className="grid gap-3 md:grid-cols-2">
        {finding.expected !== null && (
          <EvidenceBlock label="Expected" value={finding.expected} />
        )}
        {finding.actual !== null && (
          <EvidenceBlock label="Actual" value={finding.actual} />
        )}
      </div>
    </div>
  );
}
