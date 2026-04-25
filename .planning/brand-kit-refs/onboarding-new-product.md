# Onboarding a new ByteWorthy product

> 30-minute guide. Get a new product repo from "empty" to "branded + README + GitHub-configured" in one focused session.

## Pre-flight (5 min)

1. **Pick the product slug**: lowercase, hyphenated, ≤20 chars (e.g., `byteworthy-engage`)
2. **Pick the metaphor**: see `asset-manifest.json` → `available_for_future_products.metaphors_proposed`
3. **Pick the accent**: from `available_for_future_products.accents_unused`. Validate WCAG AA against `#FAFAF7` cream.
4. **Pick the letter**: from `available_for_future_products.letters_unused`
5. **Update the registry**: edit `_style/asset-manifest.json` → move your accent/letter from "available" to "registry_assignments"
6. **Reserve the GitHub repo**: `gh repo create byteworthyllc/<slug> --private --description "<keyword-rich description>"`

## Step 1 — Write the config (10 min)

```bash
cd ~/Projects/<slug>
cp ~/Projects/byteworthy-brand-2026-04/_style/byteworthy.config.template.yaml byteworthy.config.yaml
```

Fill in:
- `product.*` — name, slug, category, one_line tagline
- `positioning.paragraph` — the AEO-optimized 3-4 sentence positioning
- `icp.*` — primary, secondary, size, geo, excluded
- `design.*` — accent hex, name, dark variant, metaphor, letter form
- `pricing.*` — Pioneer pricing + tiers
- `stack.*` — frameworks, database, deploy target
- `architecture.diagram_topology` — list of node labels for the architecture diagram (5-9 nodes)
- `verticals` — 3-5 specific use cases
- `faq` — 7-10 questions (answers generated from product context)
- `glossary` — 5-10 product-specific terms with 1-line definitions
- `repo.topics` — 8-12 GitHub topics for SEO

## Step 2 — Generate assets (10 min)

For each required asset (per `asset-manifest.json`):

```bash
# Hero
node ~/.claude/skills/videoagent-image-studio/tools/generate.js \
  --model midjourney \
  --aspect-ratio 21:9 \
  --prompt "$(envsubst < _style/prompts/hero.template.txt)"

# Section: quickstart
node ~/.claude/skills/videoagent-image-studio/tools/generate.js \
  --model midjourney \
  --aspect-ratio 21:9 \
  --prompt "$(envsubst < _style/prompts/section-quickstart.template.txt)"

# Social preview
node ~/.claude/skills/videoagent-image-studio/tools/generate.js \
  --model ideogram \
  --aspect-ratio 16:9 \
  --prompt "$(envsubst < _style/prompts/social.template.txt)"

# Comparison shot
node ~/.claude/skills/videoagent-image-studio/tools/generate.js \
  --model ideogram \
  --aspect-ratio 16:9 \
  --prompt "$(envsubst < _style/prompts/comparison.template.txt)"

# Architecture diagram
node ~/.claude/skills/videoagent-image-studio/tools/generate.js \
  --model recraft \
  --aspect-ratio 16:9 \
  --prompt "$(envsubst < _style/prompts/diagram.template.txt)"

# Mark variant
node ~/.claude/skills/videoagent-image-studio/tools/generate.js \
  --model recraft \
  --aspect-ratio 1:1 \
  --prompt "$(envsubst < _style/prompts/mark.template.txt)"
```

Variables substituted from `byteworthy.config.yaml`:
- `${PRODUCT_NAME}`, `${PRODUCT_SLUG}`, `${ONE_LINER}`
- `${ACCENT_HEX}`, `${ACCENT_NAME}`, `${ACCENT_DARK}`
- `${METAPHOR}`, `${LETTER_FORM}`
- `${ARCHITECTURE_NODES}` (joined as list)

Then download + compress:

```bash
# Download grids (Midjourney returns 4 variants)
# Pick best variant (manually OR use first by default)
# Compress with pngquant
for f in *.png; do
  pngquant --quality=65-85 --force --output "${f}" "${f}"
done
```

## Step 3 — Generate the README (5 min)

```bash
# From a brand kit script (TBD - manually for now):
# Reads byteworthy.config.yaml + _style/templates/README.template.md
# Substitutes variables, writes README.md to repo root

# Manual fallback: copy klienta/README.md and find/replace product specifics
cp ~/Projects/byteworthy-brand-2026-04/klienta/README.md ./README.md
# Then carefully replace:
# - All "klienta" → "<your-slug>"
# - All "Klienta" → "<Your Product Name>"
# - All "white-label client portal..." → "<your-positioning>"
# - All "#D4A574" → "<your-accent>"
# - All "atelier" / "amber" mentions
# - Comparison table contents
# - FAQ Q&A
# - Glossary entries
# - Use cases (verticals)
```

## Step 4 — GitHub-side configuration (5 min)

```bash
# Set repo description, homepage, topics
gh repo edit byteworthyllc/<slug> \
  --description "$(yq '.product.one_line' byteworthy.config.yaml)" \
  --homepage "$(yq '.repo.has_homepage_url' byteworthy.config.yaml)?utm_source=github&utm_medium=repo-about" \
  --add-topic $(yq -r '.repo.topics[]' byteworthy.config.yaml)

# Upload social preview (must be done in GitHub UI manually — gh CLI doesn't support it yet)
echo "→ Open https://github.com/byteworthyllc/<slug>/settings"
echo "→ Scroll to 'Social preview' → Upload <brand_assets>/social-preview-light.png"

# Pin on org page (if it's a top product)
echo "→ Open https://github.com/byteworthyllc"
echo "→ Click 'Customize your pins' → add the new repo"
```

## Step 5 — Lint + commit (5 min)

```bash
# Lint check (TBD - manual for now)
# Validates all required sections present, all UTM params set, all images referenced
# Pseudocode:
# - grep for "{utm_source=github&utm_medium=readme}" → must appear ≥3 times
# - grep for "## Common questions about" → must appear once
# - grep for "## Glossary" → must appear once
# - check all image paths in README resolve to actual files

# Commit
git add .
git commit -m "feat: initial ByteWorthy-branded release"
git push origin main
```

## Step 6 — Add to org-profile (2 min)

Update `byteworthy-profile/README.md` → "The stack" table → add row for the new product.

Also update `_style/asset-manifest.json` → bump `manifest_version` and document the new registry assignment.

## Step 7 — Plan launch (defer to launch playbook)

Once branded + committed + GitHub-configured, follow `_style/viral-launch-playbook.md`:
- Write Show HN draft
- Write Twitter thread
- Write Reddit post
- Write LinkedIn carousel
- Schedule launch window

## Common pitfalls

| Pitfall | Symptom | Fix |
|---|---|---|
| Accent collision | Two products share an accent | Lint flags it; pick from `available_for_future_products.accents_unused` |
| WCAG fail | Accent text on cream fails 4.5:1 | Use the 700 or 800 step from generated palette for body-text use |
| Forgot UTM params | Untracked traffic from new repo | Lint regex catches missing `utm_source=github` in any byteworthy.io link |
| Mark drift | Letter form doesn't match canonical layered-arcs B construction | Use the same Recraft prompt template; reject if 3 arcs aren't visible |
| Hero painterly drift | Midjourney generates a stock-tech-3D look | Re-roll with stronger negative prompts ("no 3D, no isometric, hand-crafted line-art") |
| Token exhaustion mid-batch | Free tier (100 uses / token) runs out | Switch to paid tier OR stagger generation across days |
| Section illustration generic | Quick Start image doesn't match metaphor | Edit the prompt template to anchor more strongly to the product metaphor |

## Skills as products (special path)

For Claude skills published to `byteworthyllc/skills` repo:

1. Use `category: "Claude Skill"` in the config
2. README template variant emphasizes:
   - **Trigger phrases** section (when does the skill activate?)
   - **Tool requirements** (which tools does the skill need?)
   - **Example invocation** (paste-ready test cases)
3. No pricing section (skills are typically free)
4. Add to `_style/skills-registry.yaml` (TBD)

The brand kit handles skills the same as products — same hero, same comparison shot, same family bar. Just different README template variant.

## When to evolve the brand kit (vs the product)

- **Evolve the product** when: per-product copy needs updating, pricing changes, ICP shifts
- **Evolve the brand kit** when: a pattern emerges across 2+ products that should be canonical, OR the editorial direction needs a refinement that affects the whole family

Brand kit changes get a tag bump (1.0 → 1.1). Product configs pin to the version they target. Run `byteworthy lint` after a kit upgrade to see what each product needs to update.
