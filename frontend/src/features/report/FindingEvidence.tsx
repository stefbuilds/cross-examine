import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/components/ai-elements/code-block";

import type { Finding } from "./report-model";

function EvidenceBlock({
  label,
  value,
  language = "bash",
}: {
  label: string;
  value: string;
  language?: "bash";
}) {
  return (
    <CodeBlock code={value} language={language}>
      <CodeBlockHeader>
        <CodeBlockTitle>
          <CodeBlockFilename>{label}</CodeBlockFilename>
        </CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton aria-label={`Copy ${label}`} />
        </CodeBlockActions>
      </CodeBlockHeader>
    </CodeBlock>
  );
}

export function FindingEvidence({ finding }: { finding: Finding }) {
  return (
    <div className="grid gap-3 border-t border-border/50 bg-black/[0.02] p-4 dark:bg-white/[0.02]">
      <EvidenceBlock
        label="Exact command"
        language="bash"
        value={finding.command}
      />
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
