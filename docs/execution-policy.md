# Execution policy and host-process capabilities

Cross-Examine’s current executor is `bounded-host-process`. It is a
trusted-input host-process adapter, **not a sandbox**. Use it only for
repositories and revisions an operator is willing to execute with their local
account permissions.

This policy governs the trusted-input command boundary. See the
[capability matrix](capability-status.md) for current scope.

Each command is governed by a typed `ExecutionPolicy`. The policy records a
version and stable identity, wall-clock and output limits, allowed executable
basenames, an environment-name allowlist, and allowed working-directory roots.
Invalid, empty, secret-permitting, or contradictory policies are rejected.
Legacy `run_command()` callers receive the existing conservative defaults and
may narrow, but never widen, their timeout or output cap. The effective supported
command-timeout ceiling is 120 seconds. The API currently accepts values through
600 seconds, but the executor rejects values above 120; this inconsistency is a
development bug, not a supported wider policy.

A successfully launched child returns `CommandEvidence` with an
`ExecutionManifest`. A pre-spawn policy rejection has no child manifest. The
manifest contains the policy identity, rendered argv and digest, resolved CWD
and executable identities, Python/OS metadata, duration, exit result, timeout
and truncation states, and whether receipt redaction was applied. It is returned
to the immediate runner only: v1 findings and reports do not persist or render
it in SQLite, API/CLI export, or React. It is execution metadata, not proof of
host isolation.

## Capability report

| Control | Status | Meaning |
| --- | --- | --- |
| argv without shell, top-level executable basename allowlist, environment allowlist, CWD boundary, wall-clock deadline, output cap | Enforced | The adapter checks harness launches before or while running the child. Target code can launch other commands with its inherited host authority. |
| process-tree cleanup | Best effort | POSIX uses a dedicated process group but may fall back to the direct child if group signalling is denied; Windows invokes `taskkill /T /F`. |
| filesystem isolation, network isolation, CPU/memory quotas, syscall containment | Not supported | The child shares host authority; a container or VM adapter is required. |
| authenticated non-loopback service exposure | Not supported | `127.0.0.1` is the only supported serving posture. The current CLI does not enforce it, and a non-loopback bind exposes unauthenticated trusted-host execution endpoints. |

The policy can constrain the child’s selected CWD, but it does not prevent
absolute-path access elsewhere on the host. The policy can strip secrets from
the child environment and redact secret-shaped values in persisted evidence,
but it cannot protect secrets already present in repository files or available
through host services. No control makes untrusted code safe to run locally.

Run `cross-examine serve` only on `127.0.0.1`. Binding to `0.0.0.0` or another
non-loopback interface is unsupported and unsafe until an explicit authenticated
trusted-host service policy exists.

Future container or VM adapters should implement `ExecutionRunner`, emit the
same manifest contract, and update their capability report to state only the
controls they actually enforce.
