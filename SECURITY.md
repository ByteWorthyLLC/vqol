# Security

## Supported Versions

Until v0.1.0 is released, security fixes target the default branch only.

## Reporting a Vulnerability

Report vulnerabilities privately to:

```text
security@byteworthy.io
```

If that address is unavailable, open a GitHub security advisory or email the maintainer listed in `GOVERNANCE.md`.

## Privacy and Business Associate Status

vqol is designed as a static, local-only patient tool. ByteWorthy LLC does not receive, process, store, or transmit patient data from a default deployment.

ByteWorthy LLC is not a Business Associate for practices that fork, deploy, host, or modify this software. If a practice enables aggregate submission or changes the deployment architecture, that practice owns its own HIPAA, state privacy, security, and Business Associate analysis.

## Security Boundaries

- No backend by default.
- No accounts or authentication by default.
- No telemetry by default.
- Patient data remains in browser IndexedDB unless the user exports it or a practice fork enables explicit aggregate submission.
- Device Lab reports are generated locally and leave the device only if the tester downloads, copies, or submits them.
