# Security policy

## Supported versions

Security fixes are applied to the latest release and the `main` branch.

| Version | Supported |
| --- | --- |
| 0.1.x | Yes |
| Earlier versions | No |

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability. Use
[GitHub private vulnerability reporting](https://github.com/stefbuilds/cross-examine/security/advisories/new)
and include:

- the affected version or commit;
- steps to reproduce the issue;
- the impact you observed; and
- any suggested mitigation, if available.

You can expect an acknowledgement within seven days. A remediation timeline will be shared
after the report has been reproduced and assessed.

## Execution boundary

Cross-Examine executes code from the repository it analyzes. The host-process runner limits
commands, environment variables, elapsed time, and captured output, but it is not a sandbox:
target code retains the operator's filesystem and network authority. Analyze only repositories
you trust, run the local server on `127.0.0.1`, and use a container or virtual machine when a
strong isolation boundary is required.
