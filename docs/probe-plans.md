# ProbePlan execution contract

`ProbePlan` is an optional, versioned proposal attached to a characterized
claim. It never carries a verdict. The only supported oracle category is
`metamorphic`; deterministic code discovers the callable signature, validates
the JSON-only domain, executes the relation in both revisions, and aggregates
the resulting findings.

Version 1 requires: a plan and claim id, target symbol, bounded parameter
values, one supported relation, priority (0–10), budget (1–16), and JSON
provenance. The validator rejects unknown targets and parameters, variadics,
untyped or unsupported values, arbitrary objects or code, unsupported
relations, and incompatible argument shapes.

Supported conservative relations are identity/idempotence,
normalization-stability, permutation invariance, and partition/concatenation
consistency. Sequence relations require a discovered list or tuple parameter.
If the signature, value shape, base relation, or execution cannot establish
eligibility, the plan produces `UNVERIFIABLE` evidence. A refutation is only
possible when the relation holds on base and fails on head for a
preserve-critical claim.

Plans are ranked deterministically by relation strength, existing corpus
coverage, explicit priority, bounded cost, then plan id. Every eligible plan
targets a changed symbol because it must attach to a characterized claim.
Legacy claims with no plan retain the existing fixed catalog in
Layer A and Hypothesis differential search in Layer B. For a planned claim,
Layer B deliberately does not reinterpret “any base/head difference” as the
property under test; the relation result is the evidence.

Each relation finding persists its plan, seed input, relation outcome for base
and head, every child command/output/envelope, and the minimized deterministic
counterexample in `Finding.provenance` and the rendered evidence text.
