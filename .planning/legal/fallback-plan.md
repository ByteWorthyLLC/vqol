# Fallback Plan — LSHTM Denies or Does Not Respond

Trigger: No response within 30 days of first email, or explicit denial.

---

## Decision Gate

```
LSHTM responds with permission  →  proceed as planned, document terms in LICENSE-INSTRUMENT.md
LSHTM responds with denial      →  Option A or Option B (below)
No response in 30 days          →  send one follow-up to CC addresses; if no response in 14 more days → Option A
```

---

## Option A — Reference-Only Mode (recommended, lowest friction)

**What it is:** Ship the app with placeholder question text. Instead of displaying the 26 items, the app shows:
- A short description of VEINES-QOL/Sym
- A link to the official LSHTM instrument PDF (available via ePROVIDE/Mapi Research Trust request or LSHTM directly)
- A numeric score-entry form where the patient (or clinician) manually enters pre-calculated subscale scores

The app's scoring engine, trend visualization, PDF export, and white-label fork system all work exactly as designed. Only the item text is excluded from the bundle.

**What it does not break:**
- Score tracking and trend charting
- Clinician PDF export
- The fork-and-deploy model for practices
- All four other tools in the cluster (postsclera, veinquest, stockingfit, veinmap — none of which depend on VEINES item text)

**What it does break:**
- In-app self-administration (the patient cannot fill out the questionnaire inside the app; they must do it on paper or via another system and enter their scores)
- The primary UX value proposition for patients who don't already have a paper questionnaire

**Liability shift:** This approach is clean. The app never bundles copyrighted text. Practices link their patients to the official source. Zero copyright exposure.

**Implementation cost:** ~1 day of UI work. Replace the item-text components with a score-entry form. Add a prominent citation block and external link.

**Recommended if:** LSHTM does not respond or gives a non-committal response.

---

## Option B — Deployer-Uploaded Instrument (moderate friction, more complete UX)

**What it is:** The repository ships with an empty `instrument/veines-qol.json` file. Each practice that forks the repo obtains the item text directly from LSHTM (via Mapi/ePROVIDE or direct request), and drops it into that file before deploying. The app renders whatever is in the file.

This is the "bring your own instrument" model. The repository does not bundle the item text; the deploying practice takes on the licensing responsibility.

**How this works in practice:**
- The repo README clearly states: "This app requires you to obtain the VEINES-QOL/Sym instrument text from LSHTM and populate `instrument/veines-qol.json`. See [link] for how to request it."
- A `instrument/veines-qol.example.json` ships in the repo with placeholder text and the correct data schema, so developers know exactly what format is required.
- The `vqol` GitHub Pages demo (your practice's own deployment) can include the real text once you have confirmed your own license.

**Liability:** Shifts cleanly to the deploying practice. The OSS repository itself never contains the copyrighted text.

**Downside:** Adds friction for practices trying to fork and deploy. They have to navigate the Mapi/LSHTM process themselves. Most small vein practices will not do this. Effectively limits the audience to technically capable practices or larger groups with compliance staff.

**Recommended if:** You want to ship v1.0 now and leave the door open for practices to self-license, while simultaneously continuing the LSHTM conversation.

---

## Option C — Generic PRO Framework with Swappable Instruments

**What it is:** Ship the app as a generic "PRO framework for vein/vascular outcomes" rather than a VEINES-specific tool. The framework supports any scored questionnaire via a JSON instrument definition file. The VEINES-QOL/Sym, when licensed, slots in as one instrument. Other instruments can be added.

**Open instruments that could be bundled immediately (no LSHTM permission required):**

| Instrument | Domain | License status |
|------------|--------|----------------|
| **Aberdeen Varicose Vein Questionnaire (AVVQ)** | Varicose veins | Published in peer-reviewed literature with full item text; widely reproduced; no evidence of active commercial licensing. Risk: low but unconfirmed — same research-permission logic as VEINES. |
| **VVSymQ** | Varicose vein symptoms | Proprietary (Merck/BTG); not available. |
| **EQ-5D-3L** | Generic HRQoL | Proprietary (EuroQol Group); requires registration, free for non-commercial use — EuroQol has a straightforward online permission process. |
| **SF-12 / PROMIS Global** | Generic HRQoL | PROMIS instruments are NIH-funded, freely available under a liberal use policy with citation. Ideal as a companion generic measure. |
| **Villalta Scale (patient-reported version)** | Post-thrombotic syndrome | Published instrument; item text in literature; no active commercial licensing identified. |

**Recommended add-on regardless of VEINES outcome:** Bundle PROMIS Global-10 (NIH, open) as the generic HRQoL comparator. It complements VEINES and has zero licensing risk.

**Recommended if:** LSHTM denies and you want a more complete tool set on day one. The framework approach also positions the cluster as a platform rather than a single-instrument app, which is better long-term.

---

## Recommended Path

**Ship Option A on the same timeline as the planned v1.0.** It keeps the project on schedule and eliminates legal risk entirely. Continue the LSHTM conversation in parallel.

If LSHTM grants permission before v1.0 ships: enable full in-app item rendering (upgrade from Option A to full mode). This is a one-day diff.

If LSHTM grants permission after v1.0: tag a v1.1 release that adds in-app self-administration.

Separately, initiate the EuroQol registration (15-minute process at euroqol.org) to bundle EQ-5D-3L as the generic HRQoL companion measure — this is worth doing regardless of the VEINES outcome.

---

## 30-Day Follow-Up Checklist

- [ ] Day 0: Send inquiry to sschroter@bmj.com
- [ ] Day 14: If no response, resend with CC to researchdatamanagement@lshtm.ac.uk and hsrp@lshtm.ac.uk
- [ ] Day 30: If still no response, implement Option A and note "LSHTM contacted, awaiting response" in README
- [ ] Day 44: If no response after follow-up, close the active inquiry and proceed with Option A as permanent mode
- [ ] Ongoing: Update README and LICENSE-INSTRUMENT.md the moment any response is received
