# Security Policy

## Supported versions

BindHome security fixes target the latest supported release line.

Until `v1.0.0` is published, security fixes target the current `main` / 1.0 release candidate. After publication, users should normally update to the latest available BindHome release before reporting an issue that is already fixed upstream.

| Version | Supported |
| --- | --- |
| Latest release | Yes |
| Older releases | Best effort only |
| Development branches | No support guarantee |

## Reporting a vulnerability

**Do not report security vulnerabilities through public GitHub Issues, Discussions, pull requests, or logs.**

Use GitHub's private vulnerability reporting from the repository **Security** tab when the **Report a vulnerability** action is available.

If private vulnerability reporting is temporarily unavailable, open a public issue containing only a request for a private security contact channel. Do **not** include the vulnerability, proof of concept, credentials, tokens, Registry contents, Home Assistant configuration, network information, or exploit details in that issue.

A useful private report should include:

- affected BindHome version or commit;
- affected Home Assistant version;
- vulnerability type and realistic impact;
- minimal reproduction steps;
- whether authentication or administrator access is required;
- whether the issue exposes or modifies BindHome Registry data;
- any known workaround;
- proof of concept only when needed to demonstrate the issue safely.

Never include real Home Assistant access tokens, passwords, private keys, cookies, webhook secrets, or unrelated personal/home data.

## Scope

Security reports are especially relevant when they involve:

- authorization or administrator-boundary bypasses;
- unintended Registry disclosure or mutation;
- unsafe backup/restore behavior;
- arbitrary file access or code execution;
- injection through panel, WebSocket, action, or persisted Registry data;
- cross-site scripting or unsafe rendering in the BindHome panel;
- privilege escalation through logical entity/service delegation;
- integrity failures that can publish state that was not durably persisted.

Normal bugs, feature requests, unsupported Home Assistant versions, stale hardware bindings, and expected administrator capabilities should use the regular issue templates unless they create a security boundary violation.

## Disclosure

Please allow time for the report to be reproduced, fixed, tested, and released before publishing technical details. BindHome will aim to coordinate disclosure through the private report when that channel is available.
