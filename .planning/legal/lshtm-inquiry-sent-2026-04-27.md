# LSHTM Instrument Licensing Inquiry - Sent Copy

Date prepared: 2026-04-27

To:

- Sara Schroter, PhD <sschroter@bmj.com>

CC:

- LSHTM Research Data Management <researchdatamanagement@lshtm.ac.uk>

Subject:

Permission request - VEINES-QOL/Sym item text and scoring constants in a free open-source patient app

Body:

Dear Dr. Schroter,

I am writing to request permission to include the VEINES-QOL/Sym instrument item text, validated translations, and scoring constants in a free, open-source patient-facing application, and to understand any conditions or fees that would apply.

I am Kevin Richards, the developer of ByteWorthy LLC, and I am building clinical tools for vein practices in the United States. I have a direct patient-care operations interest in this work: VEINES-QOL/Sym is one of the few disease-specific patient-reported outcome instruments suitable for longitudinal vein and vascular care.

I am developing vqol, a static open-source progressive web app that allows patients with chronic venous disease to self-administer a VEINES-QOL/Sym workflow, track their own scores over time, and export a trend summary for their clinician. The source code is hosted publicly at https://github.com/ByteWorthyLLC/vqol under the MIT license. The reference deployment has no backend, no server, no user accounts, and no telemetry. Patient data is stored only in the patient's own browser through IndexedDB. An optional practice-owned aggregate endpoint exists for deploying practices, but it is off by default and is not used by the reference deployment.

The distribution model is fork-and-deploy: a vein practice can fork the repository, add its own branding through one practice.json file, and deploy a free copy to GitHub Pages or Cloudflare Pages for its patients. We do not sell the instrument, we do not sell the app, and we do not aggregate patient data in the reference deployment.

The specific permissions I am requesting are:

1. Item text. Permission to bundle the full English VEINES-QOL/Sym item text, response options, and item-level coding in a public GitHub repository, with proper attribution to Lamping, Schroter et al. (2003) in the repository README, app scoring documentation, and clinician PDF export.

2. Scoring manual. Access to, or permission to reference, the normative means and standard deviations from the VEINES-QOL/VEINES-SYM Scoring Manual (Lamping & Schroter, LSHTM, 2007) sufficient to implement the published scoring algorithm and present scores in standard deviation units relative to the validation sample.

3. Validated translations. Permission to include validated non-English language versions so that practices serving non-English-speaking patients can deploy the correct validated version rather than creating ad hoc translations.

4. Fork-and-deploy use. Confirmation of whether a vein practice that forks this repository and deploys it for its own patients needs a separate license from LSHTM, provided the practice maintains attribution and does not alter the item text.

5. Citation requirements. Confirmation of the preferred citations to include in the app and documentation. I currently cite Lamping et al. 2003 (J Vasc Surg 37:410-419, DOI: 10.1067/mva.2003.152) and Kahn et al. 2006 (J Clin Epidemiol 59:1049-1056, DOI: 10.1016/j.jclinepi.2005.10.016).

6. Fees. The app is free and non-commercial. If LSHTM charges a licensing fee for this use case, please let me know the amount and structure. I am willing to document the terms publicly in the repository so that any practice forking the repo understands the licensing situation.

If permission cannot be granted, I will keep the public project in reference-only mode: the app will not display verbatim instrument text or LSHTM scoring constants, and deploying practices will need their own licensing relationship before enabling a permissioned VEINES-QOL/Sym mode.

I recognize that Prof. Lamping is no longer with us, and I am grateful for your continued stewardship of this instrument. VEINES-QOL/Sym is important work, and I want to handle the copyright, attribution, and redistribution boundaries correctly.

Would you be willing to reply by email, or point me to the appropriate LSHTM office if instrument licensing is handled institutionally?

Thank you for your time.

Sincerely,

Kevin Richards
ByteWorthy LLC
scale@getbyteworthy.com
https://github.com/ByteWorthyLLC/vqol
