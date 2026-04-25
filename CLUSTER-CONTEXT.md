# Vein and Vascular cluster — research provenance

Five tools designed to be deployable at a real vein/vascular center (the user is Director of Operations at one), forkable by any other vein practice in the country, and useful enough that they don't feel like demoware.

## Why a cluster, not standalone repos

Each tool stands alone, but they share:
- Same audience (vein patients + practice staff)
- Same fork-and-brand pattern (one `practice.json`, deploy to Pages)
- Shared CV utilities (`stockingfit`, `veinmap` both use fiducial-as-scale; `veinmap` shares pattern with `chosen-ideas/woundlog`)
- Cross-promotion potential (a `veinquest` walkthrough can link to `stockingfit` for compression-stocking sizing, and to `postsclera` for post-op tracking)

Bundled, they're a vein-practice operational starter kit. Separately, each is a single-purpose viral demo.

## The five

| Slug | What it does | Operational value |
|---|---|---|
| veinquest | Pre-consult QR-card patient education | Saves 10–15 min consult time per patient; improves consult quality |
| stockingfit | Phone-camera compression stocking sizer | Reduces wrong-size returns; reduces staff measurement time |
| postsclera | Daily post-op companion (PWA) | Absorbs ~80% of "is this normal?" post-op calls |
| vqol | VEINES-QOL/Sym longitudinal PRO tracker | Outcomes data for marketing + payer negotiations |
| veinmap | Calibrated photographic vein map with pre/post | Patient-driven marketing; visible-results retention |

## Anti-overlap check

| vs | Verdict |
|---|---|
| Round-1 chosen (labpilot/pillgraph/opencpt/bodyclock) | Clean — different audience |
| Round-3 chosen (stethoscope.html/pulsecam/woundlog) | `veinmap` shares CV pattern with `woundlog` — should share `lib/fiducial-cv` |
| `outbreaktinder` | Clean |
| Upstream Intelligence | Clean — patient-facing + practice-marketing, not claims/PA/RCM |
| `honeypot-med` | Clean |

## Viral mechanics

- **TikTok**: visible vein before/after (`veinmap`) is the killer — every cosmetic procedure on TikTok is before/after content
- **HN**: `stockingfit` is the dev-magnet ("phone-camera fiducial measurement, no install, no model")
- **Reddit**: r/vascular, r/varicoseveins, r/lymphedema all active and underserved
- **Practice owners**: HN/dev distribution → fork → deploy = organic word-of-mouth among practice operators
- **Vein industry conferences**: AVF, AVLS, ACP — surgeons + practice managers all attend; a free open-source toolkit is unusual + buzzy

## Personal-utility note

User is Director of Operations at a vein/vascular center. Every tool here is intended to:
1. Deploy at user's own practice in v0.1
2. Be forkable by other practices with no engineering needed
3. Build operational + marketing value, not just educational filler

This is the explicit anti-pattern from earlier rounds where ideas were "tools and mock ups and educational pieces not actually useful for my cases" (user feedback, 2026-04-25).

## Estimated MVP effort (per tool)

| Tool | Effort | Long pole |
|---|---|---|
| veinquest | 1–2 weeks | Content authoring + per-practice config UX |
| stockingfit | 2–3 weeks | CV reliability across lighting/skin tones |
| postsclera | 2 weeks | Content authoring + notification cadence |
| vqol | 1–2 weeks | Licensing research; multi-language validation |
| veinmap | 3–4 weeks | CV reliability + composition-lock UX |

Cluster total: ~10–13 weeks for all five at production polish. v0.1 of any single tool: 1–2 weeks.

## Sequencing recommendation

1. `vqol` first — easiest, biggest practice-marketing win, lowest engineering risk
2. `postsclera` second — content-heavy but patterns mature
3. `veinquest` third — content + branding template
4. `stockingfit` fourth — CV work
5. `veinmap` last — most ambitious; builds on `stockingfit` CV foundation

## Public data + licensing notes

- **Brand size charts** (`stockingfit`) — publicly published; verify retail-spec-sheet usage rights
- **VEINES-QOL/Sym** (`vqol`) — research published; verify licensing for free non-commercial use; clinical-practice use is generally permitted but commercial SaaS hosting may need permission
- **Society of Vascular Surgery / American Venous Forum guidelines** (`veinquest`, `postsclera`) — public; cite directly
- **ArUco markers + ISO/IEC 7810** (`stockingfit`, `veinmap`) — public standards
- All other content user-authored as practicing operator
