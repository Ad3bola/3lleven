# 3lleven Design System

A build playbook for distinctive, non-generic client websites. The 3lleven site is the
reference implementation; **this document is brand-agnostic** — every client gets their
own colors, type, and voice dropped into the same architecture.

> The goal of every build: it should look **designed for this client**, not generated.
> If a stranger could guess it was made by an AI from a screenshot, we failed.

---

## 0. The anti-slop rules (what we never ship)

These are the "tells" that make a site read as generic/AI-generated. Avoid all of them
unless a specific brand genuinely calls for one.

**Visual tells**
- ❌ Blue→purple / indigo gradients (hero text gradients, gradient buttons, gradient blobs).
- ❌ Inter, Roboto, Plus Jakarta Sans, or system-font-only typography.
- ❌ Everything rounded — `rounded-2xl`, pill buttons (`border-radius: 980px`).
- ❌ Frosted-glass nav (`backdrop-filter: blur()` + semi-transparent bg).
- ❌ Soft-shadow cards in 3-col grids with `hover:shadow-xl hover:-translate-y-1`.
- ❌ Dark mode defaulting to `slate-900`/`gray-950` with the same purple accents glowing.

**Structural tells**
- ❌ Centered hero: big headline with one gradient word + gray subhead + two CTAs (one
  filled, one outlined) + a floating gradient blob.
- ❌ Feature sections always in groups of 3 or 6 (icon, bold title, two lines).
- ❌ Invented stats bars ("10K+ users · 99.9% uptime · 24/7 support").
- ❌ Testimonial cards with circular avatar initials on colored backgrounds.
- ❌ Four-column footers regardless of whether there's content for them.
- ❌ Emoji or stock Lucide icons standing in for real iconography.

**What we ship instead:** a committed aesthetic point of view derived from the client's
actual brand — distinctive type, a disciplined palette with one real accent, sharp or
intentional edges, real structure (asymmetry, hairlines, negative space), honest copy.

---

## 1. The build process

1. **Extract the brand.** Find the client's real identity — logo, existing colors, a
   brand file. Derive tokens from *that*, not from defaults. (For 3lleven the source of
   truth was `assets/3lleven-logo.html` → `#0A0A0A` ink, `#E8FF00` accent, DM Mono.)
   If the brand is thin, commit to a bold direction and confirm it with the client first.
2. **Set up the token system** (Section 3) — light + dark, one `:root` block to swap.
3. **Build the shared stylesheet** (`style.css`) — design system + shared components.
   Every page links it. One file to retheme the whole site.
4. **Build page-by-page** in the brand language, header order first. Each page links
   `style.css` and adds only its page-specific CSS inline.
5. **Honesty pass** on copy (Section 10) — no fabricated stats or false claims.
6. **Verify** (Section 12) — both themes, responsive, grep for slop, real-device check.

**Git workflow:** work on a `dev` branch; `main` is production (auto-deploys via
Cloudflare Pages). Stage and review on `dev`, merge `dev → main` only on approval.

---

## 2. Architecture

```
/style.css          ← the design system + shared components (links from EVERY page)
/index.html         ← page markup + a small inline <style> for page-specific layout
/work.html, ...     ← same pattern
```

- **Shared in `style.css`:** tokens, base/reset, `.wrap`, nav, mobile menu, hamburger,
  buttons, `.sec-head/.sec-headline/.sec-sub`, the page-hero pattern, cards, CTA block,
  footer, `.fade-up`, reduced-motion, theme-transition rules.
- **Page-specific stays inline** in that page's `<head>` `<style>` (e.g. the pricing
  calculator, the contract layout, a comparison table unique to one page).
- **JS is per-page and small.** Standard snippet on every page: theme toggle + hamburger.
  Theme persists via `localStorage` key — keep the key identical site-wide
  (`'<brand>-theme'`). Page-specific JS (sliders, calculators, multi-step forms) stays in
  that page only. Respect `prefers-reduced-motion`.
- **Extraction tip:** to move an approved inline `<style>` into `style.css` without
  visual drift, move it *verbatim* (a script that copies bytes between `<style>…</style>`
  and swaps in `<link rel="stylesheet" href="style.css">`), then verify the page renders
  identically. Identical bytes = identical render.

---

## 3. Design tokens — the foundation

The entire palette is CSS variables, defined once, swapped per theme. **This is the block
you copy and recolor for each new client.** Everything else references these.

```css
:root, [data-theme="dark"] {
  --bg:         #0A0A0A;        /* page background            */
  --surface:    #141414;        /* raised panels              */
  --surface2:   #1C1C1C;        /* cards / chips              */
  --fg:         #F5F2ED;        /* body text                  */
  --muted:      #8C8C86;        /* secondary text             */
  --dim:        #555555;        /* captions / meta            */
  --border:     #262626;        /* hairlines                  */
  --border2:    #3A3A38;        /* stronger borders           */
  --accent:     #E8FF00;        /* THE accent — used sparingly */
  --accent-rgb: 232,255,0;      /* same accent as r,g,b (see below) */
  --accent-ink: #0A0A0A;        /* text/icons that sit ON the accent */
  --bad:        #E0796A;        /* negative/error state       */
  --bad-rgb:    224,121,106;
  --grid-line:  rgba(255,255,255,0.09);
  --maxw: 1120px;
}

[data-theme="light"] {
  --bg:         #ECE6D7;        /* warm tan/beige, not pure white */
  --surface:    #F5F1E8;
  --surface2:   #F5F1E8;
  --fg:         #1C1B14;        /* warm near-black, not #000 */
  --muted:      #6E6755;
  --dim:        #978F7B;
  --border:     #D8D0BD;
  --border2:    #C7BDA6;
  --accent:     #4F6228;        /* light-mode accent can differ from dark */
  --accent-rgb: 79,98,40;
  --accent-ink: #F5F1E5;        /* light text ON a dark accent */
  --bad:        #A6573C;
  --bad-rgb:    166,87,60;
  --grid-line:  rgba(0,0,0,0.06);
}
```

### The `--accent-rgb` trick (most important pattern)
Store the accent **both** as a hex (`--accent`) and as raw channels (`--accent-rgb:
232,255,0`). Then every translucent tint, glow, or border derived from the accent uses
`rgba(var(--accent-rgb), 0.08)`. Because the channels are a token, **a single per-theme
(or per-client) edit recolors every derived tint at once.** Never hardcode
`rgba(232,255,0,…)` anywhere — always `rgba(var(--accent-rgb), …)`.

### The `--accent-ink` rule (contrast safety)
`--accent-ink` is whatever text/icon color is readable *on top of* the accent. When the
accent is bright (lime on black), ink is dark. When the accent is deep (olive on tan),
ink is light. Any element that fills with `background: var(--accent)` sets
`color: var(--accent-ink)`. This is what prevents the classic "lime text on cream"
contrast failure when switching themes.

### Light mode is not "white mode"
Pure `#FFF`/`#000` reads cheap. Use a warm off-white/tan base and a warm near-black so
light mode feels like an intentional editorial palette, not an inverted dark mode.

---

## 4. Typography

Pick **three roles**, none of them Inter/Roboto/Plus Jakarta:

| Role | Job | 3lleven example |
|------|-----|-----------------|
| **Display** | Big headlines, personality | Bricolage Grotesque (600–700) |
| **Signature/mono** | Eyebrows, labels, nav, buttons, meta, captions | DM Mono |
| **Body** | Paragraphs (can equal display at 400) | Bricolage Grotesque 400 |

- The **signature face is the glue** — using a distinctive mono (or condensed, or
  high-contrast serif) consistently for all UI chrome is what ties a site together and
  makes it unmistakable. Choose it from the client's brand.
- Headlines: large, tight tracking (`letter-spacing: -0.03em` to `-0.045em`), short
  line-height (`0.92`–`1.06`). One emphasized word/phrase gets the accent treatment
  (an underline via `text-decoration-color: var(--accent)`, *not* a gradient).
- Sources for non-generic faces: Google Fonts (beyond the top 10), Fontshare, the
  client's existing brand fonts. Load via `<link>` in each page `<head>`.

---

## 5. Color & accent discipline

- **The accent is a scalpel, not a paint roller.** One accent moment per viewport: a key
  word, the logo mark, the primary button fill, an active state, a hover underline.
- Dominant neutrals + one sharp accent beats a timid evenly-distributed palette.
- **No gradients** for brand color. A solid-color underline or block, never a 3-stop
  gradient. (Decorative texture like a hairline grid or diagonal hatch is fine.)
- Semantic colors (`--bad`, and an optional `--good` if not the accent) are also tokens
  so they can be tuned to fit the palette — e.g. a muted terracotta instead of bright
  coral so "negative" still belongs to the earthy scheme.

---

## 6. Layout, spacing, structure

- One container width token (`--maxw`) + a `.wrap { max-width: var(--maxw); margin: 0
  auto; padding: 0 28px; }` helper.
- **Sections share one background; don't slice the page with divider lines.** Separation
  comes from generous vertical padding (`90–110px`) and tonal shifts, not hairlines
  between every section. Hairlines are for *within* components (table rows, list items).
- Edges: pick an intentional radius and hold it everywhere (3lleven = `2–4px`). Pills only
  if the brand truly wants them.
- Asymmetry, hairline rules, real negative space, and an animated/textured background beat
  a centered stack of cards. The hero can be left-aligned and asymmetric.

---

## 7. Component kit

Reusable patterns proven on the 3lleven build. Each lives in `style.css` unless noted.

- **Nav** — solid bar (no blur), hairline bottom border, ported SVG/text wordmark, mono
  links with an accent underline that wipes in on hover, a text/SVG theme toggle (never a
  🌙 emoji), a square-ish accent CTA. Active page: persistent accent underline
  (`.nav-links a.active`). Mobile: solid dropdown + animated hamburger.
- **Page hero** — `.page-hero` (full-height, for sparse/landing pages) and
  `.page-hero.compact` (short, for content pages). Mono status eyebrow with a pulsing
  accent dot, big display headline with one accent-underlined phrase, mono sub, button
  pair. Optional animated hairline grid background (`.hero-grid`).
- **Buttons** — `.btn` base; `.btn-accent` (accent fill + `--accent-ink`, hard offset
  shadow on hover) and `.btn-line` (bordered ghost). Mono label, uppercase, ~3px radius.
- **Cards** — flat `--surface2` fill, `1px var(--border)`, ~3–4px radius. Hover =
  border-color → accent + a small `translateY(-2px)`, **never a soft shadow lift**.
- **Marquee** — a mono ticker strip of short status phrases separated by an accent `/`.
  Keep content accurate (no invented claims). Disable under reduced-motion.
- **Comparison table** — hairline grid, mono headers, one highlighted column with a faint
  accent tint (`rgba(var(--accent-rgb),0.06)`), accent checkmarks. Cite real sources.
- **Interactive comparison** ("finder") — tabbed scenarios with two outcome columns
  (negative `--bad` / positive `--accent`); rendered from a small JS data array. Give
  paired rows a uniform `min-height` so both columns stay parallel and outcome bars align.
- **Before/After slider** — drag-to-compare two layered mocks. The "after" demonstrates
  the new aesthetic; a "before" that needs to look *bad* should look *believably* bad
  (muted, generic, low-effort) — not a garish parody that fights the palette.
- **Forms** — mono uppercase labels, `--bg` inputs with `--border2`, accent focus ring
  via `box-shadow: 0 0 0 3px rgba(var(--accent-rgb),0.18)`, accent-fill submit. Multi-step
  forms: mono progress chips, keep every field `id` stable for the form backend.
- **CTA block** — a bold solid block (accent or ink), sharp edges, optional diagonal-hatch
  texture, mono eyebrow, solid contrasting button. No radial-glow blob.
- **Footer** — mono, hairline top border, ported small wordmark, real social links only.

---

## 8. Motion

- High-impact moments over scattered micro-interactions: one orchestrated page-load
  (staggered `fadeUp` with `cubic-bezier(0.16,1,0.3,1)`), a slow pulsing accent dot, a
  scroll-reveal (`IntersectionObserver` adds `.visible` to `.fade-up`), accent underlines
  that wipe in on hover.
- Backgrounds can drift slowly (a panning hairline grid) for life without distraction.
- **Always** gate motion behind `@media (prefers-reduced-motion: reduce)` — disable
  marquees, pulses, and background animation; keep the site fully usable.

---

## 9. Accessibility

- Contrast: enforce the `--accent-ink` rule; never put the accent as text on a low-contrast
  surface (the lime-on-cream trap). Verify both themes.
- Visible focus states on inputs and buttons (the accent focus ring).
- Real semantic HTML (`<nav> <main> <section> <footer>`, labelled controls, `aria-label`
  on icon-only buttons).
- Respect `prefers-reduced-motion`. Don't convey meaning by color alone.

---

## 10. Copy & honesty

This is non-negotiable and as important as the visuals.

- **No fabricated metrics.** Never invent stats, uptimes, user counts, or client numbers.
- **Cite real, attributable sources** for any statistic (e.g. Google/SOASTA, Deloitte,
  BrightLocal) — with the year. If you can't source it, cut it.
- **Match the client's actual offering.** Don't claim "no subscriptions / cancel anytime /
  $0 fees" if that contradicts how they actually price. Reconcile copy to the truth on
  every page (pricing, contract, plan tables all have to agree).
- **Empty states stay confident, not apologetic.** A portfolio with no work yet says
  "coming soon," not "we have no clients."
- Prefer specific, plain, benefit-led lines over generic hype.

---

## 11. Pre-launch checklist

Run before any `dev → main` merge:

- [ ] Every page links `style.css`; no per-page duplicated design-system CSS.
- [ ] `grep` the build for slop tokens — **zero** matches outside intentional mocks:
      `gradient` brand colors, `backdrop-filter`, `980px`, `Inter`/`Plus Jakarta`,
      stray hardcoded `rgba(<accent>,…)` (should be `var(--accent-rgb)`).
- [ ] Light **and** dark themes both legible; accent always paired with `--accent-ink`;
      no contrast failures.
- [ ] Responsive at 1440 / 768 / 390; nav collapses; sticky/total bars work.
- [ ] Theme toggle persists across pages (shared `localStorage` key); active nav correct.
- [ ] All internal links resolve (no links to deleted pages); forms submit; calculators
      and multi-step flows work end-to-end.
- [ ] `prefers-reduced-motion` disables looping animations.
- [ ] Copy honesty pass complete; pricing/plan/contract claims all agree.
- [ ] Verify in a real browser (serve locally, screenshot key pages), not just by reading
      the code.

---

## Appendix — new-site quick start

1. Copy `style.css` from a finished build into the new repo.
2. Replace **only** the `:root` / `[data-theme]` token block (Section 3) with the new
   client's brand. Swap the two font `<link>`s and font-family names.
3. Copy a page (`index.html`) as the scaffold: nav, page-hero, footer, theme + hamburger
   JS are already wired — change content and the active nav item.
4. Build remaining pages from that scaffold; add page-specific CSS inline.
5. Run the Section 11 checklist. Stage on `dev`, review, merge to `main` on approval.
