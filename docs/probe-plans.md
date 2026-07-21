# ProbePlan execution contract

The v1 proposal path is list-based, single-seed, and non-minimizing. See the
[capability matrix](capability-status.md) for current scope.

`ProbePlan` is an optional, versioned proposal attached to a characterized
claim. It never carries a verdict. The only supported oracle category is
`metamorphic`; deterministic code discovers the callable signature, validates
the JSON-shaped domain, executes one relation seed in both revisions, and
passes the resulting findings to pure aggregation.

Version 1 requires: a plan and claim id, target symbol, bounded parameter
values, one supported relation, priority (0–10), budget (1–16), and JSON
provenance. The validator rejects unknown targets and parameters, input domains
that target variadic parameters, untyped or unsupported values, arbitrary objects
or code, unsupported relations, and incompatible argument shapes.

Supported conservative relations are identity/idempotence,
normalization-stability, permutation invariance, and partition/concatenation
consistency. The reliable sequence path requires a discovered list parameter.
Although tuple-shaped proposals can pass parts of v1 eligibility, JSON reload
supplies lists, so tuple plans are unsupported until a lossless typed contract exists.
If the signature, value shape, base relation, or execution cannot establish
eligibility, the plan produces `UNVERIFIABLE` evidence. A refutation is only
possible when the relation holds on base and fails on head for a
preserve-critical claim.

Plans are ranked deterministically by relation strength, existing corpus
coverage, explicit priority, declared budget, then plan id. Budget validates the
proposal's value-list size and influences ordering; it is not the number of values
executed. V1 executes only the first value as one deterministic seed. Every eligible
plan targets a catalogued changed-file candidate through a characterized claim, but
characterization does not prove complete candidate coverage.
Legacy claims with no plan retain the existing fixed catalog in
Layer A and Hypothesis differential search in Layer B. For a planned claim,
Layer B deliberately does not reinterpret “any base/head difference” as the
property under test; the relation result is the evidence.

Each relation finding persists its plan, seed input, relation outcome for base
and head, and child command/output envelopes. V1 runs no minimizer: its stored
counterexample is the original deterministic first seed even though current output
uses a `MINIMIZED COUNTEREXAMPLE` label. Structured plan data is persisted in
`Finding.provenance`, but the React report contract does not render it; the UI renders
the stored command/output evidence subset.
