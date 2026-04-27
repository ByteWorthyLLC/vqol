# Governance

## Maintainer

Primary maintainer: Kevin Richards / ByteWorthy LLC.

## Decision Model

This is a solo-maintained OSS project. Decisions optimize for:

1. Patient data ownership.
2. Static fork-and-deploy simplicity.
3. Clear instrument licensing.
4. Accessibility for older patients.
5. Reuse across the vein and vascular tool cluster.

## Contribution Scope

Accepted contributions should keep the project small, static, and privacy-preserving. Larger architectural changes should be proposed in an issue before implementation.

## Release Process

Releases are manually tagged after:

- `npm run verify` passes.
- `CHANGELOG.md` is updated.
- Instrument licensing status is reviewed.
- Public demo, Device Lab reports, hard-gate docs, and release copy are checked.
