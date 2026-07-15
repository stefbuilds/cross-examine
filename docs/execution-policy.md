# Execution policy and host-process capabilities

Cross-Examine’s current executor is `bounded-host-process`. It is a
trusted-input host-process adapter, **not a sandbox**. Use it only for
repositories and revisions an operator is willing to execute with their local
account permissions.

Each command is governed by a typed `ExecutionPolicy`. The policy records a
version and stable identity, wall-clock and output limits, allowed executable
basenames, an environment-name allowlist, and allowed working-directory roots.
Invalid, empty, secret-permitting, or contradictory policies are rejected.
Legacy `run_command()` callers receive the existing conservative defaults and
may narrow, but never widen, their timeout or output cap.

Every command returns `CommandEvidence` with an `ExecutionManifest`. The
manifest contains the policy identity, rendered argv and digest, resolved CWD
and executable identities, Python/OS metadata, duration, exit result, timeout
and truncation states, and whether receipt redaction was applied. It is an
audit receipt, not proof of host isolation.

## Capability report

| Control | Status | Meaning |
| --- | --- | --- |
| argv without shell, executable allowlist, environment allowlist, CWD boundary, wall-clock deadline, output cap | Enforced | The adapter checks these before or while running the child. |
| process-tree cleanup | Best effort | POSIX uses a dedicated process group but may fall back to the direct child if group signalling is denied; Windows invokes `taskkill /T /F`. |
| filesystem isolation, network isolation, CPU/memory quotas, syscall containment | Not supported | The child shares host authority; a container or VM adapter is required. |

The policy can constrain the child’s selected CWD, but it does not prevent
absolute-path access elsewhere on the host. The policy can strip secrets from
the child environment and redact secret-shaped values in persisted evidence,
but it cannot protect secrets already present in repository files or available
through host services. No control makes untrusted code safe to run locally.

Future container or VM adapters should implement `ExecutionRunner`, emit the
same manifest contract, and update their capability report to state only the
controls they actually enforce.
