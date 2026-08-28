---
license: other
language:
- en
task_categories:
- text-classification
pretty_name: CrossExamine-Bench
tags:
- code
- software-verification
- behavioral-regression
- ai-generated-code
- testing
size_categories:
- n<1K
---

# CrossExamine-Bench

CrossExamine-Bench is a provenance-first seed benchmark for behavioral regressions in AI-authored or AI-assisted Python changes.

The first verified record is execution-grounded: Cross-Examine's deterministic hero fixture shows `normalizer.core:normalize([])` returning `[]` on the base implementation and `null`/`None` on the changed implementation. Layer A direct replay and Layer B adversarial shrinking both recover the empty list as the counterexample.

Three additional records are included under the `compatibility_shadow` split. They document historical public-repository compatibility trials and **must not be treated as labeled benchmark truth**.

## Data files

The data files are proprietary materials. Do not upload, redistribute, or publish `data/verified.jsonl` or `data/compatibility_shadow.jsonl` without prior written permission from Stefanos Palyvos.

## Fields

- `case_id`
- `repository`
- `base_ref`
- `head_ref`
- `target_symbol`
- `claim`
- `repro_input`
- `expected`
- `actual`
- `outcome`
- `verdict`
- `evidence_hashes`
- `provenance`

## Uses

Use requires prior written permission from Stefanos Palyvos. The current verified set is intentionally a seed release and is not large enough for statistically meaningful model rankings.

## License

Proprietary. Copyright (c) 2026 Stefanos Palyvos. All rights reserved. No copying, redistribution, modification, publication, or reuse is permitted without prior written permission. Referenced third-party repositories retain their original licenses and are not redistributed.

## Citation

If permission to use the benchmark is granted, cite the corresponding Cross-Examine software release and state the benchmark version used. Citation does not itself grant permission to use the materials.
