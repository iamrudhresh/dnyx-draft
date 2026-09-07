# Security Policy

## Supported Versions

We actively support and patch security issues on the latest `4.x` release
line only. Older major versions do not receive security fixes.

| Version | Supported          |
| ------- | ------------------ |
| 4.x     | :white_check_mark: |
| < 4.0   | :x:                |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Instead, report it privately using one of these channels:

1. **Preferred**: Use GitHub's [private vulnerability reporting](https://github.com/dnyxtech/dnyx-draft/security/advisories/new) (Security tab → "Report a vulnerability").
2. **Alternative**: Email **admin@dnyxtech.com** with a description of the issue, steps to reproduce, and its potential impact.

Please include:

- A clear description of the vulnerability and its impact
- Steps to reproduce (a minimal repro is ideal)
- The affected version/commit
- Any suggested remediation, if you have one

## What to Expect

- We aim to acknowledge new reports within **5 business days**.
- We'll work with you to understand and confirm the issue, then develop and test a fix.
- We ask that you give us a reasonable amount of time to ship a fix before any public disclosure.
- Once a fix is released, we'll credit you in the release notes/changelog, unless you'd prefer to remain anonymous.

Because Dnyx Draft is a local-first, client-side application (documents and keys are stored in the browser's IndexedDB, never on a server), most security-relevant reports will concern the client bundle, the encryption/vault code (`lib/crypto`), Live Share/Share Snapshot API routes, or supply-chain issues in dependencies. Reports in these areas are especially appreciated.

We appreciate your help in keeping Dnyx Draft and its users secure.
