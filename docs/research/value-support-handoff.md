# Python value-support research handoff

## Superseding status — 2026-07-19

- **Historical source:** the original Phase 0 research is preserved verbatim at commit
  `5bea8baf5f031d9bfdff592b3e85e001842c651b`.
- **Applies-to snapshot:** this handoff describes the 2026-07-18 Phase 0 working-tree
  design/audit snapshot and declares no product implementation pin. It is distinct from
  current product commit `c3daef6d428aa775fae29b5f327c12dc6c2f3c4b`.
- **Current state:** new value families and Enum support are `future`; lossless integrity
  for current values is separately `development-only`.
- **Dependency gate:** P2 must first make current ambiguous or lossy paths abstain. P7
  may add new lossless value families only after P4 corpus migration and the P6
  development-benchmark contract, with each Layer A increment passing end to end before
  its matching Layer B extension. This research grants no implementation authority.
- **Current truth:** see the authoritative [capability status](../capability-status.md).
  The original prose below remains historical design evidence, not a current protocol,
  codec, or implemented value family.

Date: 2026-07-18  
Status: recommendation, not an implemented contract

## Decision

The next increment should support **top-level members of plain `enum.Enum` as probe results**, for functions whose inputs are already in the lossless JSON domain. Do not add Enum input generation in the same increment.

The increment has a mandatory compatibility foundation:

1. introduce probe protocol v2 and observation codec v1;
2. wrap every successful top-level result in a collision-proof value node;
3. persist protocol/codec versions with corpus checks and never compare v1 with v2;
4. reject rather than coerce values outside the exact JSON domain; and
5. make every unknown, malformed, ambiguous, or over-limit observation `UNVERIFIABLE`.

This is deliberately narrower than “support enums.” It excludes `IntEnum`, `StrEnum`, `Flag`, `IntFlag`, Enum arguments, nested Enum members, Enum dictionary keys, and feeding Enum results into metamorphic relations. Those exclusions are what make the first increment small, deterministic, and defensible.

The next candidate after this increment is exact built-in `set`/`frozenset` **result** support, but only after Cross-Examine adopts an explicit exact-type observation policy and canonical-byte element ordering. Paths have higher raw prevalence, but their platform, worktree, disclosure, and filesystem semantics make them a worse second implementation target.

## Why this is the smallest useful increment

Enums have a bounded symbolic identity and appear on both sides of real APIs. In an eight-repository panel, enum types appeared in 77 annotated argument functions and 43 annotated return functions. Click, for example, exposes `ParameterSource` through both [`set_parameter_source` and `get_parameter_source`](https://github.com/pallets/click/blob/333c28d79cd982990ee98eef61ec20ab1a4f38ba/src/click/core.py#L931). Python defines a member name and value, supports lookup by name, and explicitly permits aliases; aliases therefore need canonical treatment rather than duplicate cases ([Python `enum` documentation](https://docs.python.org/3.12/library/enum.html)).

Enums also expose a current loss: Python's JSON encoder accepts integer- and float-derived enums as numbers, erasing nominal identity ([Python `json` encoder table](https://docs.python.org/3.12/library/json.html#json.JSONEncoder)). The recommended first increment avoids that larger equality-policy decision by accepting plain `Enum` only.

The result-first boundary matters. Enum arguments require annotation-directed reconstruction in each revision. Adding only a Hypothesis `sampled_from()` strategy would send strings or integers through JSON and call the target with the wrong runtime type. Cross-Examine already demonstrates this defect for tuples: the runner describes `tuple[int, ...]`, but a JSON request reaches the target as `list`. Layer A must gain a typed request contract and correct call-shape generation before any new non-JSON input strategy is eligible.

## Discovery: current support and abstentions

### Signature descriptions

`probe_runner._describe_annotation()` currently recognizes:

| Annotation | Described | Layer A fixed inputs | Layer B strategy | Important limitation |
| --- | --- | --- | --- | --- |
| `bool`, `int`, finite `float`, `str`, `None` | yes | yes | yes | `bool` is kept distinct from `int` by input validation |
| `Optional[T]` / `T | None` | yes, one non-None branch only | yes when the inner catalog exists | yes | general unions are unsupported |
| `list[T]` | yes recursively | only `list[int]` and `list[str]` | yes recursively | Layer A and Layer B cover different domains |
| `tuple[T, ...]` | yes recursively | no | yes | JSON transport reconstructs it as `list`, so Layer B currently tests the wrong type |
| `dict[str, T]` | yes recursively | no | yes recursively | Layer A has no fixed dictionary catalog |
| Enum, Path, Decimal, set/frozenset, named tuple, dataclass | no | no | no | required parameters lead to abstention |
| `Literal`, general `Union`, `Annotated`, protocols, arbitrary classes | no | no | no | displayed as unsupported |

`typing.get_type_hints()` evaluates annotations during description. This is an existing execution surface, not a safe serialization primitive. The value-support work should not add more evaluation, imports, registries, or constructors to the parent or worker.

### Argument forms

- Positional-only, positional-or-keyword, and keyword-only parameters are described.
- `*args` and `**kwargs` are skipped.
- Supported positional-or-keyword parameters are always supplied positionally.
- A supported defaulted parameter is always supplied; omission/default behavior is not exercised.
- An unsupported defaulted parameter is skipped. Any later positional-or-keyword value can then bind to the wrong parameter unless it is moved to `kwargs`.
- Probe-plan validation admits keyword-only parameters, but relation execution always sends its seed positionally.
- Requests are plain JSON `{args: [...], kwargs: {...}}`; the runner binds no typed value descriptor before invoking the target.

These call-shape issues do not block result-only Enum observation, but they are hard prerequisites for the later Enum-input phase.

### Results

The current runner accepts whatever `json.dumps(..., allow_nan=False)` accepts and then compares canonical JSON envelope bytes.

- Exact JSON scalars, lists, and string-key dictionaries work.
- Non-finite floats abstain.
- Sets and general objects become `UnserializableResult`, then `UNVERIFIABLE`.
- Tuples and named tuples are silently flattened to arrays.
- `IntEnum` and other number-derived enums can be flattened to numbers.
- Integer dictionary keys can be coerced to strings. `{1: "x"}` and `{"1": "x"}` both encode as `{"1":"x"}`.
- Nested aliases and shared references are flattened into a tree; cycles fail.

The v2 prerequisite should define the existing lossless JSON domain more strictly: exact `None`, `bool`, `int`, finite `float`, `str`, exact `list`, and exact `dict` with string keys, recursively bounded. Tuple values, non-string dictionary keys, subclasses, cycles, and repeated mutable references must abstain rather than be normalized into apparent equality.

### Exceptions

Target exceptions are already observations, normalized as `{type, message}`. Matching `ValueError("negative")` behavior is verified in Layer A. `ImportError` and subclasses are treated as probe failures because they are presumed dependency failures.

This is not general structured-exception support:

- only the unqualified class name and `str(exc)` are captured;
- `str(exc)` can execute a target-defined hook;
- `args`, `errno`, filenames, syntax locations, notes, groups, cause/context, and custom state are not represented; and
- two distinct exception classes can collapse to the same observation.

Protocol v2 must not expand arbitrary exception serialization. Exact built-in exceptions may retain current behavior through a separately bounded safe path; custom exception formatting must not be invoked merely to serialize. Unsupported exception structure remains `UNVERIFIABLE` until a type-specific exception contract is designed.

### Pipeline, corpus, and verdict behavior

- Layer A captures base envelopes and replays identical stored JSON requests against head.
- Layer B uses deterministic Hypothesis settings (`max_examples=60`, `derandomize=True`, no database) and compares canonical envelopes.
- Metamorphic idempotence feeds the first raw envelope value back as a request, which is unsafe for any future tag until revision-local decoding exists.
- Only verified Layer-A fixtures pin to the corpus.
- Corpus identity includes repository, target, input, and expected envelope, but has no protocol or codec compatibility key.
- `aggregate()` is pure. Unsupported critical behavior produces `RISKY`, as required; it does not need to change.
- A decided finding must continue to carry exact commands, captured output, and valid evidence receipts.

## Ecosystem evidence

### Repository panel

An AST-based directional scan covered pinned production sources from CPython, Pydantic, Django, pandas, pytest, Click, HTTPX, and FastAPI: 2,116 files and 35,932 functions, including 8,281 functions with annotated arguments and 10,934 with annotated returns. Concrete class resolution was heuristic, overloads and private APIs were included, and the panel was purposive rather than a random PyPI sample. The counts therefore rank implementation value; they are not ecosystem-wide percentages.

| Candidate | Argument functions | Return functions | Definitions / other signal | Direction |
| --- | ---: | ---: | ---: | --- |
| Path / `PathLike` | 166 | 63 | — | highest raw signature prevalence; strongly argument-led |
| Dataclass types | 241 | 181 | 141 classes | very prevalent, but broad and object-like |
| Plain/derived Enum types | 77 | 43 | 55 classes | both directions; finite domains |
| `set` | 60 | 48 | built-in | balanced |
| `frozenset` | 5 | 5 | built-in | low on its own; pair with set |
| Named-tuple types | 15 | 24 | 45 types | more result-led |
| `Decimal` | 16 | 5 | built-in | narrow and argument-led |
| Raised exceptions | — | — | 6,184 functions / 9,984 `raise` nodes | ubiquitous behavior, not a new argument shape |

Primary examples include pytest's path APIs ([`legacy_path`](https://github.com/pytest-dev/pytest/blob/67a174fcee355334c53588be2eeba8df702477e9/src/_pytest/compat.py#L36), [`_mk_tmp`](https://github.com/pytest-dev/pytest/blob/67a174fcee355334c53588be2eeba8df702477e9/src/_pytest/tmpdir.py#L282)), FastAPI's [`set[str]` result](https://github.com/fastapi/fastapi/blob/afe41126f624af30038cc8e17b2aaf60ebd4b838/fastapi/utils.py#L43), pytest's [`CaptureResult` named tuple](https://github.com/pytest-dev/pytest/blob/67a174fcee355334c53588be2eeba8df702477e9/src/_pytest/capture.py#L611), pytest's [`Decimal`-accepting `approx`](https://github.com/pytest-dev/pytest/blob/67a174fcee355334c53588be2eeba8df702477e9/src/_pytest/approx.py#L721), and Pydantic's [`conset` / `confrozenset`](https://github.com/pydantic/pydantic/blob/428b0dba8924c8c3c588458928fb69c9eb203d3d/pydantic/types.py#L850).

### Typeshed corroboration

A second scan pinned [typeshed commit `85ffb50`](https://github.com/python/typeshed/tree/85ffb50ed31880ce3d6199a34dcf88163b7c10c4) and parsed all 5,214 `.pyi` files: 69,223 function/method signatures and 157,543 annotated argument/return slots. Conservative import/class resolution found candidate presence in 337 signatures for set/frozenset, 268 for named-tuple types, 151 for enum types, 58 for dataclass types, 34 for direct `pathlib` classes, and 29 for directly resolved `Decimal`. Raw path-related alias tokens were much higher, which is consistent with the repository panel and also shows why direct-class counts understate path APIs.

The two samples agree on the decision-relevant point: Path and dataclass coverage is larger, but Enum has enough real surface area to justify a narrow increment while avoiding general object construction.

## Prevalence / risk / value comparison

Scores are relative to this repository's present architecture. “False-refutation risk” assumes canonical byte equality remains the deterministic oracle.

| Candidate | Ecosystem value | Deterministic normalization | Cross-process stability | Safe input construction | False-refutation / false-verification risk | Recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| Plain `Enum` | medium-high; both args and results | high for stable type + canonical name; bounded JSON value can be fingerprinted | high when module/qualname is stable | feasible later through revision-local member lookup, but not with today's raw JSON calls | medium: exact identity is stricter than some application equality; aliases and class moves need explicit rules | **First: top-level results only** |
| `set` + `frozenset` | medium-high; balanced | medium: recursively encode, then sort full canonical bytes | high only with exact built-ins, limits, and no hash/iteration order | feasible only for supported hashable elements | medium-high: Python equates set/frozenset by members, while mutability/type is observable | second research/implementation candidate |
| Path / `PathLike` | highest raw signature value | medium for exact stdlib lexical paths; never resolve | low-medium across OS/flavor/worktree roots | relative synthetic paths are feasible; arbitrary `PathLike` executes `__fspath__` | high: platform flavor, absolute roots, path disclosure, and existence assumptions | defer; exact stdlib only if revisited |
| `Decimal` | low-medium prevalence; high in finance/data niches | high structurally via sign/digits/exponent | high without ambient-context normalization | feasible with bounded stdlib construction | high policy ambiguity: `1.0 == 1.00`, signed zero, NaN, scale/significance | defer until exact-representation policy is approved |
| Named tuple | medium result value | medium-high from exact tuple storage + declared fields | medium-high with stable type identity | constructor/custom `__new__` makes arguments unsafe in first pass | high: Python tuple equality ignores named type/fields, but consumers can observe both | defer; output-only before inputs if revisited |
| Dataclass | highest apparent structured-type value | low-medium; fields, descriptors, slots, inheritance, aliases, cycles | low-medium with stable type and a graph policy | poor without invoking `__init__`, `__post_init__`, defaults, factories, descriptors | very high: `compare=False`, properties, alias identity, custom equality, and mutable state | explicit exclusion |
| Structured exceptions | ubiquitous behavioral value; not an input family | low generically; medium for individual built-in schemas | low-medium because messages/paths/state vary | not applicable | very high if generic: hooks, secrets, class conflation, args/state loss | separate hardening track, type-specific only |

Python documents sets as unordered and only partially ordered, so direct iteration or ordinary sorting is not canonical ([set/frozenset documentation](https://docs.python.org/3.12/library/stdtypes.html#set-types-set-frozenset)). `Path` selects the local concrete flavor and only pure paths can represent a foreign flavor safely ([`pathlib` documentation](https://docs.python.org/3.12/library/pathlib.html)). Decimal retains signed zeros and multiple equal representations, and even NaN equality is exceptional ([`decimal` documentation](https://docs.python.org/3.12/library/decimal.html)). Dataclass `asdict()` recursively uses `deepcopy()`, while descriptor-typed fields invoke `__get__`; neither is an inert serialization primitive ([`dataclasses` documentation](https://docs.python.org/3.12/library/dataclasses.html)).

## Recommended contract: observation codec v1

### Semantic policy

The codec records an **exact supported observation**, not Python `==`, not `repr()`, and not a general serialization graph.

For the first increment:

- JSON observations preserve exact supported JSON node kinds and values.
- A plain Enum observation is `(qualified type identity, canonical member name, exact JSON-compatible underlying value)`.
- Canonical encoded-byte equality means equal behavior.
- Two valid but different supported nodes are different observations.
- Any unsupported node, unstable type identity, version mismatch, hook-dependent extraction, cycle/alias ambiguity, or limit breach prevents comparison and yields `UNVERIFIABLE`.

Including the bounded underlying value avoids falsely verifying `Color.RED` when the stable member name remains but its public `.value` changes. If `_value_` is not in the strict JSON domain, the Enum observation is unsupported. Alias spellings are not preserved: aliases are the same member and normalize to the canonical `_name_` ([Python documents aliases through `__members__`](https://docs.python.org/3.12/library/enum.html#enum.EnumType.__members__)).

### Canonical envelope

Every protocol-v2 envelope has exactly these keys and types:

```json
{
  "cross_examine_probe": 2,
  "observation_codec": 1,
  "ok": true,
  "value": {
    "kind": "json",
    "value": ["an exact JSON value"]
  },
  "exception": null,
  "probe_error": null
}
```

A supported Enum result is structurally disjoint from an ordinary dictionary result:

```json
{
  "cross_examine_probe": 2,
  "observation_codec": 1,
  "ok": true,
  "value": {
    "kind": "enum",
    "schema": 1,
    "type": "package.module:Color",
    "member": "RED",
    "value": {"kind": "json", "value": "red"}
  },
  "exception": null,
  "probe_error": null
}
```

An ordinary target result equal to `{"kind":"enum", ...}` remains nested inside a `kind: "json"` node and cannot be mistaken for metadata.

Probe failures use inert codes rather than formatting the unsupported value:

```json
{
  "cross_examine_probe": 2,
  "observation_codec": 1,
  "ok": false,
  "value": null,
  "exception": null,
  "probe_error": {
    "code": "unsupported_observation",
    "path": "$.value",
    "detail": "plain enum underlying value is outside codec v1"
  }
}
```

`detail` comes from a fixed verifier-owned catalog. It must not contain `repr(value)`, `str(value)`, absolute target paths, or target exception formatting.

Canonical bytes use UTF-8 JSON with `ensure_ascii=False`, `allow_nan=False`, `separators=(",", ":")`, and `sort_keys=True`. Parsing must reject duplicate object keys, extra/missing envelope fields, unknown node kinds or schemas, invalid numbers, and incorrect primitive types.

### Plain Enum acceptance rules

Accept only when all conditions hold:

1. `type(value)` is a stable importable module-level class: no `<locals>`, private/dynamic generated identity, or malformed module/qualname.
2. `type(value)` has exact `enum.EnumType` metaclass and is a subclass of `enum.Enum` but not `IntEnum`, `StrEnum`, `Flag`, or `IntFlag`.
3. Extraction bypasses target overrides: no `str`, `repr`, `.name`, `.value`, iteration, equality, hashing, constructor, import, registry callback, or custom JSON hook.
4. The canonical name is read from the existing member's internal Enum storage and is a bounded identifier.
5. The underlying value is read without a target hook and passes the exact, bounded JSON observation validator.
6. Total depth, nodes, string bytes, integer digits, and output bytes are below fixed limits.
7. The result is top-level. A nested Enum is unsupported in codec v1.

The parent and Hypothesis worker only validate and compare inert nodes. They never import or rehydrate the Enum class.

### Resource and security limits

Exact constants should be selected once in code and tests. The initial recommended ceilings are: depth 16, 1,024 total nodes, 256 dictionary/list items per node, 64 KiB per string, 4,300 decimal digits for an integer (matching Python's default conversion protection), and 256 KiB for the encoded observation within the existing 2 MiB command-output cap.

Reject exact-container subclasses, cycles, and repeated mutable references. Do not use `pickle`, `marshal`, YAML constructors, `json.object_hook`, `dataclasses.asdict`, `deepcopy`, arbitrary `getattr`, `iter`, `os.fspath`, `repr`, `str`, target equality/hash/order, or user constructors. The executor remains a trusted-input host-process adapter; this codec reduces accidental execution during observation but does not contain target code.

### Outcomes

- Both revisions emit valid codec-v1 nodes and canonical bytes match: `VERIFIED` for preservation claims.
- Both emit valid supported nodes and canonical bytes differ: existing Layer A/B rules apply; preserve-critical behavior may be `REFUTED`.
- Either revision emits an unsupported/malformed/over-limit observation, unknown version, incompatible version, or missing Enum identity: `UNVERIFIABLE`.
- A codec/reconstruction error is never normalized as a target exception.
- An identical unsupported value on base and head is still `UNVERIFIABLE`, never `VERIFIED`.

## Counterexamples that constrain the design

The following captured outputs are reproducible with Python 3.12:

```text
PYTHONHASHSEED=1 -> ["beta", "gamma", "alpha"]
PYTHONHASHSEED=2 -> ["gamma", "alpha", "beta"]
PYTHONHASHSEED=3 -> ["gamma", "beta", "alpha"]

enum_alias FIRST True
intenum_json 1 plain_int_json 1
namedtuple_json [1, 2] list_json [1, 2]
decimal_equal_but_structurally_distinct True DecimalTuple(sign=0, digits=(1, 0), exponent=-1) DecimalTuple(sign=0, digits=(1, 0, 0), exponent=-2)
int-key dict -> {"1": "x"}
str-key dict -> {"1": "x"}
```

The current probe's tuple mismatch is also concrete:

```text
describe -> {"annotation":{"items":{"kind":"int"},"kind":"tuple"},...}
call     -> {"cross_examine_probe":1,...,"value":"list"}
```

| Counterexample | Unsafe shortcut | Required response |
| --- | --- | --- |
| `IntEnum.ONE`, `1`, and derived-enum peers | delegate to JSON primitive encoding | exclude derived enums in v1; dispatch candidate types before JSON if later added |
| Enum aliases | serialize the spelling used by source | canonicalize the actual member name; do not duplicate aliases |
| stable member name, changed `.value` | serialize name only | include a bounded exact-JSON underlying-value fingerprint or abstain |
| tag-shaped ordinary dictionary | reserve a magic dictionary key inside raw values | use a top-level `kind: json` wrapper |
| tuple annotation transported as list | add a tuple strategy without decoder | no new typed inputs until revision-local typed reconstruction exists |
| set output under different hash seeds | `list(the_set)` | later sort complete canonical element bytes; never target repr/order/hash |
| `set({1}) == frozenset({1})` | use Python equality without type policy | later decide and document exact-type observation before implementation |
| `Decimal("1.0") == Decimal("1.00")` | either stringify/normalize silently | defer until exact representation versus numeric equality is an approved oracle |
| named tuples of different classes compare as tuples | flatten to array or tag without policy | defer; result-only exact-type semantics require explicit approval |
| dataclass `compare=False` field changes | serialize all fields or only equality fields generically | neither is neutral; abstain and exclude dataclasses |
| repeated child `[x, x]` versus `[[], []]` | tree serialization | reject repeated mutable references until graph identity is in scope |
| custom `__str__`/`__repr__` writes a file or hangs | format unsupported values/exceptions | never invoke the hook; emit fixed codec error and abstain |
| v1 corpus array versus v2 typed node | compare stored strings | version-filter corpus; never reinterpret legacy rows |
| target prints a forged tagged stdout line | accept the last parseable line | strict framing/nonce or dedicated control channel; at minimum strict schema and per-call nonce |

## Explicit exclusions

The first increment does not support:

- Enum inputs or signatures, even though they are the recommended Phase 1B;
- `IntEnum`, `StrEnum`, `Flag`, `IntFlag`, unnamed flag combinations, aliases as distinct cases, local/dynamic enum classes, nested enums, or enum dictionary keys;
- decoding/reconstructing any rich value in the parent or Hypothesis worker;
- rich values in ProbePlan domains or relation feedback;
- set/frozenset, Path/PathLike, Decimal, named tuple, dataclass, attrs/Pydantic models, arbitrary records, arbitrary iterables/mappings, or container subclasses;
- arbitrary exception attributes, custom exception construction/formatting, exception groups, tracebacks, locals, notes, cause/context, or path-bearing state;
- cycles, shared-reference preservation, descriptors, properties, slots, `__dict__` walking, generic `repr`/`str`, or user-defined equality/hash/order;
- arbitrary pickle-like serialization, type registries, parent-side imports, or user-defined code execution merely to encode/decode;
- any claim that the host-process executor contains malicious target code.

## Compatibility and versioning rules

1. `cross_examine_probe` versions the envelope and execution semantics. Set it to 2.
2. `observation_codec` versions the value algebra and equality semantics. Start at 1.
3. Store both versions on `BehaviorFixture` and every `corpus_checks` row.
4. Add both versions to corpus identity. Replay and count only rows exactly compatible with the current protocol and codec.
5. Existing rows default to `(probe_version=1, codec_version=0)`. Retain them for history, but exclude them from replay and the current compatible corpus total.
6. Never migrate a v1 expected envelope by parsing and re-encoding it. A v1 array may have been a list, tuple, or named tuple; a scalar may have been a derived Enum.
7. A base fixture and head result with different versions are `UNVERIFIABLE`, not different behavior.
8. Unknown future node kinds, tag schemas, fields, and versions fail closed.
9. The Layer-B worker envelope can keep its own version, but it must import the current probe constants rather than hard-code probe version 1.
10. Evidence receipt hashing remains over the exact command and captured output. Protocol bytes naturally remain bound by the existing receipt contract.

## Migration plan

### Phase 0: compatibility and lossless-baseline gate

Add protocol/codec versioning, strict envelope validation, collision-proof top-level JSON nodes, resource limits, and corpus compatibility filtering. Tighten “JSON-compatible” to the exact lossless domain; formerly coerced tuple, derived-enum, subclass, or non-string-key observations now abstain. Run Layer A end to end before any Layer B extension.

### Phase 1A: recommended first increment — Enum results

Add the plain top-level Enum node and safe extraction. Exercise it in Layer A and in Layer B only when existing JSON input strategies cause the target to return a top-level Enum. Probe plans must reject tagged relation feedback. No new input strategy is added.

### Phase 1B: separate approval — Enum signatures and inputs

Only after Phase 1A is stable:

- describe finite canonical members without executing class hooks;
- cap eligible enums at 32 distinct members and exclude flags;
- bind requests to each revision's signature before decoding;
- reconstruct the existing local member by validated canonical name, never by value or `_missing_`;
- repair omitted defaults and positional/keyword call shapes;
- implement Layer-A member catalogs first;
- then reuse the same typed request builder in Hypothesis with declaration-ordered `sampled_from()`;
- missing/incompatible head member or annotation is `UNVERIFIABLE`; and
- keep Enum values out of current metamorphic plan relations.

Whether Phase 1B later includes `IntEnum`/`StrEnum` is a separate equality-policy decision.

### Phase 2: one candidate at a time

Evaluate exact built-in set/frozenset results next. Do not treat Path, Decimal, named tuple, dataclass, or structured exceptions as an automatic queue; each needs its own observation/equality ADR and adversarial corpus before implementation.

## Exact implementation map

No production edit is part of this handoff. The implementation should use the following map.

### Phase 0 and Phase 1A production files

| File | Exact responsibility |
| --- | --- |
| `src/cross_examine/cross_examine/value_codec.py` (new) | `ObservationCodecError(code, path, detail)`, exact JSON validator, `encode_observation(value)`, Enum extractor, canonical bytes, limits, cycle/repeated-reference checks, inert error catalog |
| `src/cross_examine/cross_examine/probe_protocol.py` | `PROBE_VERSION = 2`, `OBSERVATION_CODEC_VERSION = 1`, strict duplicate-key/schema/version validation, canonical node comparison, safe display rendering |
| `src/cross_examine/cross_examine/probe_runner.py` | replace the `json.dumps(value)` eligibility gate with codec encoding; never format unsupported values; emit strict v2 envelopes; keep requests JSON-only |
| `src/cross_examine/schema.py` | add protocol/codec versions to `BehaviorFixture`; do not change `aggregate()` |
| `src/cross_examine/cross_examine/layer_a.py` | persist/validate versions; mismatch or codec failure becomes abstention; reject rich relation feedback; preserve exact command/output/receipts |
| `src/cross_examine/cross_examine/hypothesis_worker.py` | remove hard-coded probe version; compare only validated same-version nodes; unsupported result on either side becomes worker `unverifiable`; add no Enum strategy |
| `src/cross_examine/persistence/database.py` | add non-null `probe_version` and `codec_version` columns with legacy defaults |
| `src/cross_examine/corpus/repository.py` | include versions in identity and writes; filter replay/current totals to exact compatibility; retain legacy history |
| `src/cross_examine/pipeline.py` | carry versions through corpus fixtures and dedupe; never mix versions |
| `src/cross_examine/probe_plans.py` | keep all plan domains JSON-only; conservatively reject any future tagged value and keyword-only relation shape that execution cannot honor |

### Phase 0 and Phase 1A tests

| Test file | Required cases |
| --- | --- |
| `tests/unit/test_value_codec.py` (new) | exact JSON kinds; reject tuple/non-string keys/subclasses/non-finite floats; tag-shaped dict is data; plain Enum node; alias canonicalization; changed underlying value; exclude derived/flag/local/nested/unsupported-value enums; hook bombs; limits/cycles/repeated references; byte stability across processes |
| `tests/unit/test_probe_runner.py` | strict v2 envelope; Enum result; codec error contains no target repr/str; malformed request remains probe error; exact built-in exception path remains bounded; no custom exception formatting |
| `tests/unit/test_probe_protocol.py` (new or existing protocol tests) | duplicate/missing/extra keys; wrong types; unknown protocol/codec/node schema; same-version canonical equality; cross-version rejection; per-call nonce/framing behavior |
| `tests/integration/test_layer_a.py` | matching Enum verifies; same stable type with changed member/value refutes; Enum versus JSON scalar differs; unsupported nested/derived enum abstains; ordinary tag-shaped dict verifies as JSON; receipts remain exact; v1 fixture versus v2 head abstains |
| `tests/integration/test_layer_b.py` | JSON-input function returning Enum can be compared; unsupported Enum result is `UNVERIFIABLE`; deterministic repeated run; no Enum input strategy; no hard-coded v1 parser |
| `tests/integration/test_probe_plan_relations.py` | tagged result is never fed back as a raw dict; relation abstains; keyword-only relation parameter is rejected or correctly assembled |
| `tests/integration/test_corpus.py` | v1 retained but not replayed/counted; v2 identity includes versions; compatible v2 Enum observations dedupe; incompatible versions cannot refute |
| `tests/unit/test_validation.py` | decided Enum findings still require exact commands, captured output, related receipts, and valid hashes |

### Phase 1B files and tests, not part of the first increment

- `probe_runner.py`: non-evaluating Enum annotation description, local signature binding, revision-local member selection.
- `edge_catalog.py`: declaration-ordered bounded Enum catalog and valid omission/positional/keyword call-shape builder.
- `hypothesis_worker.py`: shared typed request strategy and declaration-ordered shrinking.
- `test_edge_catalog.py`: omission, positional-only, keyword-only, positional-or-keyword, unsupported-default-before-later-value, deterministic cap.
- `test_hypothesis_worker.py`: canonical member order, more-than-32 abstention, typed reconstruction, reproducible minimum.
- Layer A integration first, then Layer B integration; missing head members must abstain, never refute.

## Deterministic acceptance criteria

Phase 0 and Phase 1A are acceptable only when all statements below have fresh executable evidence:

1. Two fresh child processes encode every accepted JSON/Enum fixture to byte-identical canonical nodes.
2. Repeating with at least `PYTHONHASHSEED=1,2,3,4` produces identical accepted output.
3. A tag-shaped ordinary dictionary cannot be interpreted as an Enum node.
4. Plain Enum aliases produce one canonical member observation.
5. A stable Enum type/member/value match verifies; a supported member or underlying-value change is observable; a version/unsupported ambiguity abstains.
6. `IntEnum`, `StrEnum`, `Flag`, nested Enum, local Enum, custom-metaclass Enum, and unsupported underlying value all produce fixed `unsupported_observation` errors and critical `RISKY`, never `VERIFIED`.
7. No serialization test's marker proves invocation of target `__str__`, `__repr__`, `__iter__`, `__eq__`, `__hash__`, `__fspath__`, property, descriptor, constructor, import, or registry hook.
8. Depth/node/string/integer/output limits fail within the probe timeout without unbounded parent allocation.
9. An unsupported value on both base and head yields `UNVERIFIABLE`; an unsupported value on only one side also yields `UNVERIFIABLE`, not a behavioral refutation.
10. Layer A works end to end before any new Layer-B input strategy exists.
11. Layer B can compare top-level Enum results only for existing JSON-compatible inputs and produces the same minimized semantic repro across two runs.
12. Probe-plan relation feedback never passes an encoded node to target code as a raw dictionary.
13. Legacy v1 corpus rows remain queryable as history but are excluded from replay and compatible totals; no v1/v2 comparison reaches `REFUTED`.
14. Every decided finding still contains the exact executed command, captured output, and matching evidence receipts/hashes.
15. `aggregate()` remains pure and unchanged; critical abstention remains `RISKY`.

Run focused verification first:

```bash
uv run pytest \
  tests/unit/test_value_codec.py \
  tests/unit/test_probe_protocol.py \
  tests/unit/test_probe_runner.py \
  tests/integration/test_layer_a.py \
  tests/integration/test_layer_b.py \
  tests/integration/test_probe_plan_relations.py \
  tests/integration/test_corpus.py \
  tests/unit/test_validation.py
```

Then run the repository-required backend gate:

```bash
uv run pytest
```

Expected final output: exit code 0 and no failed/error tests. Do not commit backend changes without that fresh output.

## Research conclusion

The data does not support a broad “Python objects” codec. It supports one narrow observation family with meaningful prevalence: plain Enum results. Even that addition is unsafe without protocol/corpus versioning and a strict lossless baseline, because the current transport already erases tuple, derived-enum, and dictionary-key distinctions.

The recommended sequence preserves Cross-Examine's architecture: deterministic child observation, inert cross-process data, Layer A before Layer B, unchanged pure aggregation, and risk-biased abstention. General arbitrary object serialization remains out of scope.
