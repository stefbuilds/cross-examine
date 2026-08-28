# Cross-Examine: Execution-Grounded Verification for AI-Authored Python Changes

**Stefanos Palyvos**  
Research software technical report, 29 August 2026

## Abstract

AI coding systems can produce changes that satisfy an existing test suite while silently altering behavior the suite does not cover. Cross-Examine is a verification harness for Python changes that separates model-authored proposals from model-free execution. A language model may propose behavioral claims and probes, but it cannot determine a verdict. Cross-Examine resolves base and head revisions into isolated worktrees, captures base behavior for selected inputs, replays the same inputs against the changed revision, performs a bounded adversarial search with Hypothesis, and reduces executed findings with a pure deterministic aggregation function. This report describes the system architecture, evidence model, initial validation, limitations, and the accompanying CrossExamine-Bench data contract. A bundled deterministic regression demonstrates the central failure mode: a changed function returns `None` instead of `[]` for an empty-list input even though representative non-empty behavior is preserved. Both direct replay and adversarial shrinking recover `[]` as the counterexample. Historical public-repository trials further illustrate the system's abstention behavior under unsupported imports, dependency failures, and non-JSON return values. The project is positioned as bounded behavioral verification rather than proof of program correctness.

## 1. Motivation

Modern code-generation agents increasingly make repository-scale edits. Existing CI remains necessary, but its evidence is limited to assertions that developers anticipated. A changed implementation can therefore remain green while altering behavior at an untested boundary. The verification problem is not simply whether generated code compiles or whether tests pass; it is whether the observable behavior being replaced remains consistent with the intended contract.

Cross-Examine targets this gap by treating the changed revision as a claim requiring independent evidence. Its core design principle is separation of authority: generative models may propose what should be checked, but executable observations determine whether a claim is supported, refuted, or unverifiable.

## 2. System model

Cross-Examine operates on a Python repository and two Git revisions. Its pipeline has five stages:

1. **Ingest.** Resolve base and head into detached worktrees, inspect changed Python files, identify candidate callables, and discover conservative test commands.
2. **Characterize.** Ask a schema-constrained model for behavioral claims and optional probe plans. Model output is untrusted proposal data and cannot contain an outcome or verdict.
3. **Cross-examine.** Execute Layer A base capture/head replay, then optionally perform Layer B bounded adversarial search and shrinking.
4. **Aggregate.** Reduce findings into a product verdict using a pure function with no model call or I/O.
5. **Render.** Persist and display the report, including exact commands, captured output, receipts, and reproducing inputs where available.

The executable stages are designed to be model-free after characterization. This prevents persuasive model prose from becoming self-validating evidence.

## 3. Claims, findings, and verdicts

A claim describes a behavioral property associated with a target symbol. Claims can represent preservation requirements or intended changes. Preserve-critical claims receive stronger treatment during aggregation.

Each executed check yields one of three outcomes:

- **VERIFIED**: execution supports the tested property within the observed input;
- **REFUTED**: base/head execution demonstrates a behavioral disagreement with the claim;
- **UNVERIFIABLE**: the system cannot legitimately decide under its current execution or serialization contract.

Cross-Examine exposes three aggregate verdicts:

- **BROKEN** if a preserve-critical claim is refuted;
- **RISKY** if a noncritical refutation occurs, a critical claim is unverifiable, or required critical coverage is absent;
- **SAFE (bounded)** only when the executed critical scope contains no such failure.

`SAFE` is deliberately not a proof of correctness. It means that no executed check in the bounded scope refuted the represented claims.

## 4. Evidence receipts

Cross-Examine binds an executed command and its captured output using a stable SHA-256 evidence hash. The persisted report retains the command, output, and digest. This makes findings auditable and discourages unsupported result summaries.

Execution manifests additionally record policy identity, argument digests, working-directory identity, executable identity, runtime, operating system, exit status, timeout state, truncation state, and redaction behavior. These records are intended to make bounded execution replayable enough to diagnose why a finding was reached or why execution abstained.

## 5. Layer A: base capture and head replay

Layer A treats the base revision as an empirical behavioral reference for selected inputs. It executes the target callable against base, records the serialized result, then executes the head revision against the identical request. A disagreement can refute a preservation claim without requiring a hand-authored expected value.

This approach is especially useful for maintenance changes where the existing implementation is the available behavioral contract. It remains limited by the selected input corpus and cannot decide whether a deliberate behavior change is semantically correct unless an independent oracle is supplied.

## 6. Layer B: bounded adversarial search

Layer B uses Hypothesis to search a constrained input domain for differential behavior. When a difference is found, Hypothesis shrinking is used to reduce it to a small reproducing example. This complements fixed characterization probes by searching nearby boundaries that a generated change may mishandle.

The search is intentionally bounded. Cross-Examine v1 focuses on synchronous callables with JSON-compatible inputs and outputs. Unsupported values, imports, setup requirements, or execution conditions cause abstention rather than fabricated evidence.

## 7. Deterministic regression case

The bundled hero fixture captures the motivating regression. The target is:

`normalizer.core:normalize`

The preservation claim is that empty-list normalization remains unchanged. On the base revision, the request corresponding to `[]` returns:

```json
{"value": []}
```

On the head revision, the same input returns:

```json
{"value": null}
```

Layer A therefore refutes the preserve-critical claim. The base/head evidence receipts have hashes:

- base: `06e8f8804958c2ce59ce90e6ae5297dc16ab5a454e9dc6f6714ccf0b8ab09acd`
- head: `ecc2ad0f3776b8ff16fe4e2358cdcf824322ac73efac936fb11cd36bc015d506`

Layer B independently searches the bounded domain, finds the same divergence, and shrinks the counterexample to `[]`. Its recorded evidence hash is:

`376b787ec5368b22d6b6d19167bbb45f78f2beea808d1754ba76b4989d260f76`

Representative non-empty examples remain unchanged in the same execution capture. Because the empty-list claim is preserve-critical, the deterministic aggregate verdict is `BROKEN`.

This case demonstrates the intended use of Cross-Examine: existing representative behavior can remain green while a boundary semantic changes, and the verifier produces a minimal executable witness rather than a prose warning.

## 8. Historical compatibility trials

On 15 July 2026, Cross-Examine was exercised against three public Python repository changes using manually supplied preserve-critical claims because a model API credential was unavailable. These runs were compatibility observations, not blinded benchmark evaluation.

### python-slugify

A function-level change was executed with Layer A and Layer B. Within the supplied claim and discovered-test scope, the run produced a bounded `SAFE` result. The trial also exposed a Windows child-encoding issue: generated Unicode could fail under inherited cp1252. The execution policy was subsequently hardened to force UTF-8 child I/O.

### humanize

The source checkout depended on a build-generated module and tests required absent optional dependencies. Cross-Examine returned `RISKY` with unverifiable findings instead of asserting either preservation or regression.

### validators

The target could return a non-JSON `ValidationError`, while optional test dependencies were also absent. Cross-Examine again abstained on unsupported comparisons and classified dependency-caused failures as unverifiable rather than mislabeling the change as broken.

These trials are preserved in the benchmark package as `compatibility_shadow` records and are explicitly excluded from accuracy scoring.

## 9. CrossExamine-Bench

The accompanying `benchmark/` directory defines a provenance-first data contract for behavioral-regression evaluation. A record is promoted to the `verified` split only when it has executable evidence and appropriately immutable provenance. Historical observations are segregated into a non-scoring shadow split.

The seed release is intentionally small. Its purpose is to establish the benchmark schema, evaluation protocol, evidence requirements, and first execution-grounded case without overstating statistical significance.

As the verified set grows, useful metrics include regression recall, counterexample validity, false-alarm rate on verified-preservation cases, abstention precision, and median time-to-counterexample.

## 10. Safety and execution boundaries

Cross-Examine executes repository code and therefore must only be run against repositories the operator trusts. The harness uses argument-vector subprocesses rather than shell invocation, an executable allowlist, a reduced child environment that strips secret-shaped variables, execution deadlines, output caps, and receipt redaction. These controls constrain the harness but do not constitute hostile-code containment. Production use against untrusted repositories requires stronger sandboxing.

## 11. Limitations

The current implementation has several important limits:

- Python-only repository targets;
- synchronous callable focus;
- JSON-compatible argument and return-value contract;
- bounded rather than exhaustive adversarial search;
- repository setup/build steps are not universally inferred;
- base behavior is not automatically a semantic oracle for intended changes;
- model characterization quality affects which properties are represented, even though the model cannot decide outcomes;
- a `SAFE` result is conditional on executed coverage and must not be interpreted as correctness proof.

These limitations motivate explicit abstention. In the present design, refusing to conclude is preferable to generating evidence-shaped text without execution support.

## 12. Reproducibility

The deterministic hero can be executed without a model API key using the checked-in characterization fixture. On macOS or Linux:

```bash
hero_workspace=$(mktemp -d)
env -u OPENAI_API_KEY -u CROSS_EXAMINE_DB -u CROSS_EXAMINE_RUNS \
  CROSS_EXAMINE_DEMO_CHARACTERIZER=fixture \
  uv run --isolated --no-editable cross-examine demo --no-open \
  --workspace "$hero_workspace"
```

The expected first-run summary is:

```text
Characterization: deterministic hero fixture
Verdict: BROKEN
Corpus: +2 this run · 2 total
Refuted claim: preserve-empty
Reproducing input: []
```

The canonical captured report is stored at `src/cross_examine/fixture_data/broken.json`.

## 13. Research directions

Three extensions are especially valuable:

1. **Larger blinded benchmark.** Collect immutable real-world base/head revision pairs with independently validated behavioral labels.
2. **Multi-model characterization study.** Hold execution constant while varying the model that proposes claims, measuring represented-property coverage rather than allowing model output to alter verdict policy.
3. **Independent intended-change oracles.** Introduce executable specifications, reference implementations, or property-level tests so Cross-Examine can distinguish deliberate correct changes from unintended behavioral drift.

A further engineering priority is stronger isolation for repository execution, followed by richer codecs and setup contracts for projects that cannot be imported directly from source checkouts.

## 14. Conclusion

Cross-Examine treats AI-authored code as something to verify rather than something to trust because its tests are green. Its central contribution is architectural: model proposals and executable authority are separated. The system captures base behavior, replays the changed revision, searches bounded adversarial inputs, stores evidence receipts, and computes the final verdict with deterministic policy. The initial execution-grounded regression demonstrates how this design can expose a boundary change that representative behavior misses, while historical compatibility trials demonstrate that unsupported conditions lead to abstention rather than invented certainty.

The accompanying citation metadata and CrossExamine-Bench seed release document the project as a research-software artifact and establish a foundation for broader empirical evaluation.

## Artifact availability

Repository: `https://github.com/stefbuilds/cross-examine`  
Historical evidence explorer: `https://cross-examine-six.vercel.app`  
Current license: Proprietary — Copyright (c) 2026 Stefanos Palyvos. All rights reserved. No copying, redistribution, modification, publication, or reuse without prior written permission.
