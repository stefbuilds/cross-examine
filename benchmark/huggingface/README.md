---
license: cc-by-4.0
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

Upload `data/verified.jsonl` and `data/compatibility_shadow.jsonl` alongside this card. The complete schema and methodology live in the Cross-Examine GitHub repository.

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

Suitable for developing and evaluating behavioral-regression detectors, counterexample generators, differential verification tools, and abstention policies. The current verified set is intentionally a seed release and is not large enough for statistically meaningful model rankings.

## License

Benchmark metadata: CC BY 4.0. Cross-Examine software: MIT. Referenced third-party repositories retain their original licenses and are not redistributed.

## Citation

Please cite the corresponding Cross-Examine software release and state the benchmark version used.
