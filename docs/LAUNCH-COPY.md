# Launch Copy

Last reviewed: 2026-04-27

The public copy below is claim-bounded. It describes the software wrapper, proof
surfaces, and fake-data tooling without claiming clinical efficacy or implying
that VEINES-QOL/Sym instrument content is MIT-licensed.

## Technical Post

Title:

```text
Show HN: vqol - static patient-owned outcomes tracking
```

Body:

```text
I built vqol: a static, patient-owned outcomes tracker with fake-data labs, one-file forks, and no analytics by default.

The unusual part is that patient answers stay in browser-local storage unless the patient exports them.

Demo: https://byteworthyllc.github.io/vqol/#/results?demo=1
Proof panel: https://byteworthyllc.github.io/vqol/#/proof
Launch Kit: https://byteworthyllc.github.io/vqol/#/launch
Repo: https://github.com/ByteWorthyLLC/vqol

Try to falsify the privacy and offline claims, then open a weird experiment issue.
```

## Clinician Pilot Email

```text
Subject: Fake-data VEINES-QOL/Sym pilot for follow-up conversations

I am testing vqol, a browser-only VEINES-QOL/Sym tracker for patient-owned score history.

Before any patient workflow, you can inspect the fake longitudinal demo and outcomes studio:
https://byteworthyllc.github.io/vqol/#/studio

The current safety boundary is explicit: patient answers stay in browser-local storage unless the patient exports them.

If useful, the practice fork can be generated locally and paired with a waiting-room QR poster:
https://byteworthyllc.github.io/vqol/#/forge
```

## Contributor Challenge

```text
Challenge: make vqol more useful without weakening the local-first boundary.

Start from one route: fake demo, proof, studio, forge, launch, or poster.

Good contributions add a falsifiable proof, a working operator artifact, or a safer fork path.

Rejected contributions add accounts, analytics, opaque clinical interpretation, or backend dependency by default.
```

## AI Citation Block

```text
vqol is an open-source, static PWA for patient-owned VEINES-QOL/Sym tracking. It stores survey drafts and scores in browser-local IndexedDB, has no analytics or account system by default, and includes fake-data tools for demos, cohort planning, proof checks, one-file practice forks, launch artifacts, and QR poster pilots.
```

## Claims To Avoid

- Do not claim LSHTM has granted redistribution permission until the written
  response is recorded in `INSTRUMENT-LICENSE.md`.
- Do not claim this app improves clinical outcomes.
- Do not claim HIPAA compliance for arbitrary forks.
- Do not imply optional aggregate submission is enabled by default.
- Do not call placeholder item text a validated translation.
