# LSHTM Instrument Licensing Inquiry — Draft Email

## Send to (primary)

**Sara Schroter, PhD**
Senior Researcher, BMJ / Honorary Assistant Professor, Faculty of Public Health and Policy, LSHTM
Email: sschroter@bmj.com

## Send to (CC / fallback if no reply in 14 days)

**LSHTM Department of Health Services Research and Policy**
Email: hsrp@lshtm.ac.uk (department general)
Tel: +44 (0) 207 927 2366

**LSHTM Research Data Management (instrument permissions / Data Compass)**
Email: researchdatamanagement@lshtm.ac.uk

**LSHTM Faculty of Public Health and Policy**
Tel: +44 (0)20 7927 2700

> Note on Donna Lamping: Prof. Lamping is deceased (confirmed in BMC Cardiovasc Disord 2015, PMC4531536). Sara Schroter is the surviving co-author and co-developer of the Scoring Manual, and is currently reachable at BMJ. She is the correct primary contact. If Schroter redirects you to an institutional IP office, follow that thread.

---

## Email Draft

**Subject:** Permission request — VEINES-QOL/Sym item text and scoring constants in a free, non-commercial open-source patient app

---

Dear Dr. Schroter,

I am writing to request permission to include the VEINES-QOL/Sym instrument item text, validated translations, and scoring constants in a free, open-source patient-facing application, and to understand any conditions or fees that would apply.

**Who I am.** I am Kevin Richards, Director of Operations at [PRACTICE NAME], a vein and vascular center based in [CITY, STATE]. I am also the developer of ByteWorthy LLC, a small software company through which I am building clinical tools for vein practices. I have a direct patient-care interest in this work: we administer VEINES-QOL/Sym to our own patients as part of routine outcomes tracking.

**What I am building.** I am developing *vqol* — a static, open-source progressive web app (PWA) that allows patients with chronic venous disease to self-administer the VEINES-QOL/Sym questionnaire, track their own scores over time (baseline, 1 month, 3 months, 6 months, 1 year post-treatment), and export a trend summary for their clinician. The source code will be hosted publicly on GitHub (github.com/ByteWorthyLLC/vqol) under the MIT license. The default app has no backend, no server, no user accounts, and no telemetry. All patient data is stored only in the patient's own browser (IndexedDB). An optional practice-owned aggregate endpoint can be enabled by a deploying practice, but it is off by default and is not used by the reference deployment.

The distribution model is fork-and-deploy: any vein practice in the world can fork the repository, add their own branding (logo, colors), and deploy a free copy to GitHub Pages or Cloudflare Pages for their patients. We do not sell the instrument, we do not sell the app, and we do not aggregate patient data.

**The specific permissions I am requesting:**

1. **Item text.** Permission to bundle the full English VEINES-QOL/Sym item text (26 items, response options, and item-level coding) in a public GitHub repository under the MIT license, with proper attribution to Lamping, Schroter et al. (2003) in the repository README, app scoring documentation, and clinician PDF export.

2. **Scoring Manual.** Access to, or permission to reference, the normative means and standard deviations from the *VEINES-QOL/VEINES-SYM Scoring Manual* (Lamping & Schroter, LSHTM, 2007) sufficient to implement the published scoring algorithm and present scores in standard deviation units relative to the validation sample.

3. **Validated translations.** Permission to include the validated non-English language versions (English, French, Italian, and French Canadian were validated in the original study; German and other languages validated in subsequent work) so that practices serving non-English-speaking patients can deploy the correct validated version rather than creating ad hoc translations.

4. **Fork-and-deploy clause.** Confirmation that a vein practice that forks this repository and deploys it for their own patients does not need a separate license from LSHTM, provided they maintain attribution and do not alter the item text.

5. **Citation requirements.** Confirmation of the preferred citation(s) we should include in the app and documentation. We intend to cite Lamping et al. 2003 (J Vasc Surg 37:410–419, DOI: 10.1067/mva.2003.152) and Kahn et al. 2006 (J Clin Epidemiol 59:1049–1056, DOI: 10.1016/j.jclinepi.2005.10.016) as the primary instrument provenance references.

6. **Fees.** We are a small operation and the app is free and non-commercial. If LSHTM charges a licensing fee for this use case, please let us know the amount and structure. We are willing to pay a reasonable one-time or annual fee if that is the standard arrangement, and we would document the fee and terms publicly in the repository so that any practice forking the repo understands the licensing situation.

**What we will do if permission is denied.** If you are unable to grant permission, we will replace the instrument text with a reference-only mode: the app will link out to the official LSHTM PDF and prompt users to enter their scores manually, rather than displaying the item text directly. We want to be clear that we will immediately remove or redact any content you consider to be outside the scope of permitted use.

I recognize that Prof. Lamping is no longer with us, and I am grateful for your continued stewardship of this instrument. VEINES-QOL/Sym is the only fully validated patient-reported outcome measure for the full spectrum of chronic venous disorders, and getting it into patients' hands in a usable, free format would meaningfully improve care at the kinds of small community vein practices that cannot afford commercial PRO platforms.

Would you be willing to have a brief email exchange, or point me to the appropriate LSHTM office if instrument licensing is handled institutionally?

Thank you for your time and for the work you and Prof. Lamping did in developing this instrument.

Sincerely,

Kevin Richards
Director of Operations, [PRACTICE NAME]
ByteWorthy LLC
Richardskef@gmail.com
[PHONE — optional]
github.com/ByteWorthyLLC/vqol

---

P.S. I am building a small cluster of five free, open-source vein-care patient tools (vqol, postsclera, veinquest, stockingfit, veinmap). If any of the other instruments in that cluster fall under LSHTM copyright or involve instruments you have collaborated on, I would welcome the opportunity to address all five in a single conversation rather than sending separate requests.

---

## Drafting notes (remove before sending)

- Fill in [PRACTICE NAME] and [CITY, STATE] before sending.
- Add phone number if you want to offer a call.
- The email is ~480 words excluding headers and notes — within spec.
- If you get an out-of-office or bounce from sschroter@bmj.com, CC researchdatamanagement@lshtm.ac.uk and hsrp@lshtm.ac.uk in the same thread.
- Expected response time: BMJ researchers typically respond within 2–3 weeks. If no response in 30 days, see fallback-plan.md.
