---
name: redesign-existing-projects
description: Upgrades existing websites and apps to premium quality using Apple.com's design language as the reference system. Audits current design against the Apple reference below and applies it without breaking functionality. Works with any CSS framework or vanilla CSS.
---

# Redesign Skill

## How This Works

When applied to an existing project, follow this sequence:

1. **Scan** — Read the codebase. Identify the framework, styling method (Tailwind, vanilla CSS, styled-components, etc.), and current design patterns.
2. **Diagnose** — Compare the current design against the Apple reference system below. List every mismatch: wrong accent colors, wrong type scale, missing pill buttons, unwanted shadows/gradients, wrong spacing rhythm, etc.
3. **Fix** — Apply targeted visual upgrades working with the existing stack so the UI matches the reference system. Do not rewrite from scratch. Improve what's there.

**This skill is visual-only.** Never change component logic, state, data flow, event handlers, routing, API calls, or prop contracts. Only touch markup structure when needed to support a visual pattern (e.g. wrapping text in a new `<span>` for styling), CSS/className, and static copy that is purely decorative (e.g. an eyebrow label). If a visual change seems to require a behavior change, stop and flag it instead of making it.

## Target Design System: Apple

### Overview

Apple's web presence is a masterclass in **reverent product photography framed by near-invisible UI**. Every page is a stack of edge-to-edge "tiles" — alternating light and dark canvases, each centered on a headline, a one-line tagline, two tiny blue pill CTAs, and a crisp product render. Nothing competes with the content. Typography is confident but quiet; color is either pure white, an off-white parchment, or a near-black tile; interactive elements are a single, quiet blue.

Density is unusually low even by contemporary SaaS standards. Each tile occupies roughly one viewport, and there is no decorative chrome — no borders, no gradients, no decorative frames, no shadows on headlines. Elevation appears only when a product image rests on a surface (a single soft `rgba(0, 0, 0, 0.22) 3px 5px 30px` drop for visual weight). The result feels more like a museum gallery: the wall disappears and the content takes over.

Utility surfaces (store/configurator-style UI) retain the same chassis but switch modes: a tight grid of white utility cards at `{rounded.lg}` (18px) radius with a thin border, paired with a persistent thin sub-nav strip. Across all surfaces the typographic system, spacing rhythm, and the single blue accent stay consistent — this is one design language expressed at different volumes.

**Key Characteristics:**
- Content-first presentation; UI recedes so the content can speak.
- Alternating full-bleed tile sections: white/parchment ↔ near-black, with the color change itself acting as the section divider.
- Single blue accent (`{colors.primary}` — #0066cc) carries every interactive element. No second brand color exists.
- Two button grammars: tiny blue pill CTAs (`{rounded.pill}`) and compact utility rects (`{rounded.sm}`).
- SF Pro Display + SF Pro Text — negative letter-spacing at display sizes for the signature "Apple tight" headline feel.
- Whisper-soft elevation used only when an image needs to breathe — exactly one drop-shadow in the entire system.
- Tight two-row nav: slim `{component.global-nav}` + surface-specific `{component.sub-nav-frosted}` with persistent right-aligned primary CTA.
- Section rhythm: light hero → dark tile → light utility tile → dark tile → parchment footer — a predictable pulse.

### Colors

#### Brand & Accent
- **Action Blue** (`{colors.primary}` — #0066cc): The single brand-level interactive color. All text links, all blue pill CTAs, and the focus ring root. This is Apple's quiet but universal "click me" signal. Press state shifts to a slightly darker variant via the active scale transform rather than a hex change.
- **Focus Blue** (`{colors.primary-focus}` — #0071e3): A marginally brighter sibling of Action Blue, reserved for the keyboard focus ring on buttons (`outline: 2px solid`).
- **Sky Link Blue** (`{colors.primary-on-dark}` — #2997ff): A brighter blue used on dark surfaces for in-copy links and inline callouts, where Action Blue would disappear against the tile background.

#### Surface
- **Pure White** (`{colors.canvas}` — #ffffff): The dominant canvas. Content, utility cards, grid sections.
- **Parchment** (`{colors.canvas-parchment}` — #f5f5f7): The signature Apple off-white. Used for alternating light tiles, footer region, and default page canvas in utility sections. Just different enough from white to create rhythm.
- **Pearl Button** (`{colors.surface-pearl}` — #fafafc): A near-white used as the fill for secondary "ghost" buttons — lighter than the parchment canvas so the button still reads as a button against `{colors.canvas-parchment}`.
- **Near-Black Tile 1** (`{colors.surface-tile-1}` — #272729): The primary dark-tile surface.
- **Near-Black Tile 2** (`{colors.surface-tile-2}` — #2a2a2c): A micro-step lighter — used where a dark tile sits directly above or below Tile 1 to create the faintest separation.
- **Near-Black Tile 3** (`{colors.surface-tile-3}` — #252527): A micro-step darker — used at the bottom of the stack and in embedded video/player frames.
- **Pure Black** (`{colors.surface-black}` — #000000): Reserved for true void — video player backgrounds, edge-to-edge photographic overlays, the global nav bar background.
- **Translucent Chip Gray** (`{colors.surface-chip-translucent}` — #d2d2d7): The base hex of the translucent gray chip used over photography for circular control buttons. In production, applied at ~64% alpha as `rgba(210, 210, 215, 0.64)`.

#### Text
- **Near-Black Ink** (`{colors.ink}` — #1d1d1f): The voice of every headline, every body paragraph, and the dark utility button's fill. Chosen instead of pure black to keep the page feeling photographic rather than printed.
- **Body** (`{colors.body}` — #1d1d1f): Same hex as ink — one near-black tone for all text on light surfaces.
- **Body On Dark** (`{colors.body-on-dark}` — #ffffff): All text on dark tiles and on the global nav bar.
- **Body Muted** (`{colors.body-muted}` — #cccccc): Secondary copy on dark tiles where pure white would be too loud.
- **Ink Muted 80** (`{colors.ink-muted-80}` — #333333): Body text on the white Pearl Button surface — slightly softer than pure black.
- **Ink Muted 48** (`{colors.ink-muted-48}` — #7a7a7a): Disabled button text and legal fine-print.

#### Hairlines & Borders
- **Divider Soft** (`{colors.divider-soft}` — #f0f0f0): The "border" tone on secondary buttons — functions as a ring shadow rather than a hard line. In production, often applied as `rgba(0, 0, 0, 0.04)`.
- **Hairline** (`{colors.hairline}` — #e0e0e0): The 1px hairline border on utility cards and configurator chips.

#### Brand Gradient
**No decorative gradients.** Atmospheric depth on imagery is inherent to the photography, not a CSS gradient overlay. Apple is the rare luxury-brand site with zero gradient-based design tokens.

### Typography

#### Font Family
- **Display**: `SF Pro Display, system-ui, -apple-system, sans-serif` — optimized for sizes ≥ 19px. Defines the voice of every headline.
- **Body / UI**: `SF Pro Text, system-ui, -apple-system, sans-serif` — used for body copy, captions, buttons, and links below 20px.
- **OpenType features**: `font-variant-numeric: numerator` enabled on numeric links (pricing tables, spec sheets). Display sizes rely on tight tracking rather than contextual ligatures.

#### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.hero-display}` | 56px | 600 | 1.07 | -0.28px | Hero headline; the signature "Apple tight" tracking |
| `{typography.display-lg}` | 40px | 600 | 1.10 | 0 | Tile headlines |
| `{typography.display-md}` | 34px | 600 | 1.47 | -0.374px | Section heads (SF Pro Text at display proportions) |
| `{typography.lead}` | 28px | 400 | 1.14 | 0.196px | Tile subcopy |
| `{typography.lead-airy}` | 24px | 300 | 1.5 | 0 | Airy lead paragraphs (the rare weight 300) |
| `{typography.tagline}` | 21px | 600 | 1.19 | 0.231px | Sub-tile tagline; sub-nav category name |
| `{typography.body-strong}` | 17px | 600 | 1.24 | -0.374px | Inline strong emphasis |
| `{typography.body}` | 17px | 400 | 1.47 | -0.374px | Default paragraph |
| `{typography.dense-link}` | 17px | 400 | 2.41 | 0 | Footer / utility link lists (relaxed leading) |
| `{typography.caption}` | 14px | 400 | 1.43 | -0.224px | Secondary captions, button text |
| `{typography.caption-strong}` | 14px | 600 | 1.29 | -0.224px | Emphasized captions |
| `{typography.button-large}` | 18px | 300 | 1.0 | 0 | Hero CTAs (the rare weight 300) |
| `{typography.button-utility}` | 14px | 400 | 1.29 | -0.224px | Utility/nav button labels |
| `{typography.fine-print}` | 12px | 400 | 1.0 | -0.12px | Fine-print, footer body |
| `{typography.micro-legal}` | 10px | 400 | 1.3 | -0.08px | Micro legal disclaimers |
| `{typography.nav-link}` | 12px | 400 | 1.0 | -0.12px | Global nav menu items |

#### Principles

- **Negative letter-spacing at display sizes.** Every headline at 17px and up carries a slight tracking tighten (`-0.12 → -0.374px`). This produces the iconic "Apple tight" headline cadence. Never used at 12px or below.
- **Body copy at 17px, not 16px.** Apple breaks the SaaS convention and runs paragraph text at 17px. The extra pixel gives the page an unmistakable "reading, not scanning" pace.
- **Weight 300 is real and rare.** Used deliberately on a handful of large-size reads (`{typography.button-large}` at 18px/300 and `{typography.lead-airy}` at 24px/300). It's a light-atmosphere cue reserved for moments where content should feel airy.
- **Weight 600, not 700, for headlines.** Weight 700 is used sparingly for `{typography.tagline}` (21px) when a touch more assertion is needed.
- **Line-height is context-specific.** Display sizes use 1.07–1.19 (tight). Body uses 1.47. Utility link stacks in the footer use an unusually relaxed 2.41 (`{typography.dense-link}`).
- **Weight 500 is deliberately absent.** The ladder is 300 / 400 / 600 / 700. Mid-weight readings always use 600.

#### Note on Font Substitutes
SF Pro is Apple's proprietary system font. When building off-system:

- Use `system-ui, -apple-system, BlinkMacSystemFont` as the first stack entry — on macOS/iOS/Safari this resolves to the real SF Pro.
- For non-Apple platforms, **Inter** (Google Fonts, variable) is the closest open-source equivalent. Inter at weight 600 with `font-feature-settings: "ss03"` approximates SF Pro's rounded "a" character.
- Nudge `letter-spacing` down by `-0.01em` on display sizes to re-create the Apple tight feel; Inter's default tracking runs slightly wider than SF Pro.
- For body text, tighten line-height by `0.03` (from 1.47 → 1.44) when substituting Inter — Inter's taller x-height needs less leading.

### Layout

#### Spacing System
- **Base unit:** 8px. Sub-base values (2, 4, 5, 6, 7) are used for tight typographic adjustments; structural layout snaps to 8/12/16/20/24.
- **Tokens:** `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 17px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 48px · `{spacing.section}` 80px.
- **Section vertical padding:** `{spacing.section}` (80px) inside a tile; tiles stack edge-to-edge with 0 gap (the color change provides the break).
- **Card padding:** `{spacing.lg}` (24px) inside utility grid cards.
- **Button padding:** 8–11px vertical, 15–22px horizontal.

#### Grid & Container
- **Max content width:** ~980px on text-heavy sections, ~1440px on utility grids, full-bleed for hero/product tiles.
- **Column patterns:** 3 to 5 column utility card grid; 2-column side-by-side tiles occasionally; single-column centered stack on hero tiles.
- **Gutters:** 20–24px between cards in a utility grid.

#### Whitespace Philosophy
Whitespace is the content's pedestal. Every tile begins with at least 64px of air above its headline and 48–64px below. Nothing crowds a hero image — the nearest content is at least 40px away. The footer is the only area that breaks this — there, density is deliberate so the full information architecture is visible at a glance.

### Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, no border | Full-bleed tiles, global nav, footer, body sections |
| Soft hairline | 1px `rgba(0, 0, 0, 0.08)` border | Utility cards, sub-nav frosted-glass separator |
| Backdrop blur | `backdrop-filter: blur(N)` on Parchment 80% | Sub-nav and floating sticky bars |
| Product shadow | `rgba(0, 0, 0, 0.22) 3px 5px 30px 0` | Product/hero imagery resting on a surface (the only true "shadow" in the system) |

**Shadow philosophy.** Use **exactly one** drop-shadow, applied to photographic/hero imagery — never to cards, never to buttons, never to text. Elevation in the UI comes from (a) surface-color change (light tile ↔ dark tile) and (b) backdrop-blur on sticky bars.

### Shapes

#### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | Full-bleed tiles (no corner rounding) |
| `{rounded.xs}` | 5px | Inline links styled as subtle chips (rare) |
| `{rounded.sm}` | 8px | Dark utility buttons, inline card imagery |
| `{rounded.md}` | 11px | White Pearl Button capsules |
| `{rounded.lg}` | 18px | Utility cards, grid cards |
| `{rounded.pill}` | 9999px | Primary blue pill CTAs, sub-nav buy button, option chips, search input — the signature pill |
| `{rounded.full}` | 9999px / 50% | Circular control chips floating over photography |

### Components

**`global-nav`** — Persistent, ultra-thin black nav bar pinned to the top. Background `{colors.surface-black}`, height 44px, text `{colors.on-dark}` in `{typography.nav-link}` (12px / 400 / -0.12px tracking). Links quiet, spaced ~20px apart, running edge-to-edge. Right-aligned cluster for utility icons. On mobile, collapses to hamburger at ~834px.

**`sub-nav-frosted`** — Sticks below the global nav. Background `{colors.canvas-parchment}` at 80% opacity with backdrop-filter blur. Height 52px. Left: section name in `{typography.tagline}` (21px / 600). Right: inline nav links in `{typography.button-utility}` (14px), ending in a persistent `{component.button-primary}`.

**`button-primary`** — Background `{colors.primary}` (Action Blue #0066cc), text `{colors.on-primary}` in `{typography.body}` (17px / 400), rounded `{rounded.pill}`, padding 11px × 22px. Active: `transform: scale(0.95)`. Focus: 2px solid `{colors.primary-focus}` outline.

**`button-secondary-pill`** — Second CTA when two pills appear together. Background transparent, text `{colors.primary}`, 1px solid `{colors.primary}` border, rounded `{rounded.pill}`, padding 11px × 22px.

**`button-dark-utility`** — Nav-level actions. Background `{colors.ink}` (#1d1d1f), text `{colors.on-dark}` in `{typography.button-utility}`, rounded `{rounded.sm}` (8px), padding 8px × 15px. Active shrinks via `transform: scale(0.95)`.

**`button-pearl-capsule`** — Secondary button. Background `{colors.surface-pearl}` (#fafafc), text `{colors.ink-muted-80}` in `{typography.caption}` (14px), 3px solid `{colors.divider-soft}` border (soft ring, not a visible line), rounded `{rounded.md}` (11px), padding 8px × 14px.

**`button-hero`** — Larger primary CTA. Same Action Blue as `{component.button-primary}`, but `{typography.button-large}` (18px / 300) and more padding (14px × 28px). Used sparingly.

**`button-icon-circular`** — Floats over imagery. 44 × 44px, background `{colors.surface-chip-translucent}` at ~64% alpha, icon in `{colors.ink}`, rounded `{rounded.full}`.

**`text-link`** — Inline body links in `{colors.primary}` (Action Blue).

**`text-link-on-dark`** — Inline body links on dark tiles in `{colors.primary-on-dark}` (Sky Link Blue #2997ff) — Action Blue would disappear against `{colors.surface-tile-1}`.

**`tile-light`** — Full-bleed light tile. Background `{colors.canvas}`, text `{colors.ink}`, rounded `{rounded.none}`, vertical padding `{spacing.section}` (80px). Centered stack: headline in `{typography.display-lg}` (40px / 600) → one-line tagline in `{typography.lead}` (28px / 400) → up to two `{component.button-primary}`/`{component.button-secondary-pill}` CTAs → hero image resting on the surface with the system shadow.

**`tile-parchment`** — Same as `{component.tile-light}` but on `{colors.canvas-parchment}` (#f5f5f7). Used to break two consecutive white tiles.

**`tile-dark`** — Full-bleed dark tile. Background `{colors.surface-tile-1}` (#272729), text `{colors.on-dark}`, rounded `{rounded.none}`, vertical padding `{spacing.section}` (80px). Same content stack as the light tile but with `{component.text-link-on-dark}` for inline copy.

**`tile-dark-2`** / **`tile-dark-3`** — Micro-step variants on `{colors.surface-tile-2}` / `{colors.surface-tile-3}`, used where dark tiles stack consecutively.

**`utility-card`** — Grid card. Background `{colors.canvas}` (white), 1px solid `{colors.hairline}` border, rounded `{rounded.lg}` (18px), padding `{spacing.lg}` (24px). Top: image (1:1 crop, `{rounded.sm}` inner radius). Below: title in `{typography.body-strong}` (17px / 600), meta line in `{typography.body}` (17px / 400), and a `{component.text-link}`. No shadow by default.

**`option-chip`** — Pill-shaped tappable cell. Background `{colors.canvas}`, text `{colors.ink}` in `{typography.caption}`, rounded `{rounded.pill}`, padding 12px × 16px. Selected state: border upgrades to 2px solid `{colors.primary-focus}`.

**`floating-sticky-bar`** — Floats at the bottom of the viewport during scroll. Background `{colors.canvas-parchment}` at 80% opacity with `backdrop-filter: blur(N)`, height 64px, padding 12px × 32px. Left: status/summary text. Right: `{component.button-primary}`.

**`search-input`** — Background `{colors.canvas}`, text `{colors.ink}` in `{typography.body}` (17px), 1px solid `rgba(0, 0, 0, 0.08)` border, rounded `{rounded.pill}`, padding 12px × 20px, height 44px. Leading icon at 14px, muted tint.

**`footer`** — Background `{colors.canvas-parchment}` (#f5f5f7), text `{colors.ink-muted-80}`. Link columns in `{typography.dense-link}` (17px / 400 / 2.41 line-height). Column headings in `{typography.caption-strong}` (14px / 600). Legal row at the bottom in `{typography.fine-print}` (12px / 400) with `{colors.ink-muted-48}` text. Vertical padding 64px.

### Do's and Don'ts

**Do**
- Use `{colors.primary}` (Action Blue #0066cc) for every interactive element — links, pill CTAs, focus signals — and nothing else. The single accent is non-negotiable.
- Set headlines with negative letter-spacing (`-0.28 → -0.374px`) for the "Apple tight" cadence.
- Run body copy at 17px / 400 / 1.47 / -0.374px — not 16px.
- Alternate light/parchment and dark tiles for full-bleed section rhythm. The color change IS the divider.
- Reserve `{rounded.pill}` for primary CTAs and any element that should read as an "action."
- Apply the single shadow (`rgba(0, 0, 0, 0.22) 3px 5px 30px`) only to hero/product imagery — never to cards, buttons, or text.
- Use `transform: scale(0.95)` as the active/press state on every button.
- Keep the global nav true black (`{colors.surface-black}`) — the only place pure black appears.

**Don't**
- Don't introduce a second accent color.
- Don't add shadows to cards, buttons, or text.
- Don't use gradients as decorative backgrounds.
- Don't set body copy at weight 500 — the ladder is 300 / 400 / 600 / 700, with 500 deliberately absent.
- Don't round full-bleed tiles — tiles are rectangular and edge-to-edge.
- Don't tighten line-height below 1.47 for body copy.
- Don't mix radii grammars — `{rounded.sm}` for compact utility, `{rounded.lg}` for cards, `{rounded.pill}` for pills, nothing in between (except the rare `{rounded.md}` Pearl Button).
- Don't use `{colors.primary-on-dark}` (Sky Link Blue) on light surfaces — it's dark-tile-only.

### Responsive Behavior

| Name | Width | Key Changes |
|---|---|---|
| Small phone | ≤ 419px | Single-column tiles; sub-nav collapses to name + primary CTA only; hero typography drops to 28px |
| Phone | 420–640px | Single-column stack; hero images scale to 80% of tile width; hero h1 drops to 34px |
| Large phone | 641–735px | Tiles transition to tighter padding (48px vertical vs 80px) |
| Tablet portrait | 736–833px | Global nav collapses to hamburger; sub-nav hides secondary links, keeps primary CTA |
| Tablet landscape | 834–1023px | Global nav returns fully expanded; 3-column grids become 2-column |
| Small desktop | 1024–1068px | Tiles use 2/3 width with margin gutters; hero h1 stays at 40px |
| Desktop | 1069–1440px | Full layout; 4–5 column grids; 1440px content max |
| Wide desktop | ≥ 1441px | Content locks at 1440px, margins absorb extra width |

**Touch targets:** minimum 44 × 44px. `{component.button-icon-circular}` is exactly 44 × 44px. Utility nav links can sit tighter (~32 × 80px) on desktop since the mobile hamburger replaces them at ≤ 833px.

**Collapsing strategy:** nav row → logo + hamburger + icon at 834px and below; tiles stack 2-col → 1-col at 834px with padding tightening 80px → 48px; grids step 5 → 4 → 3 → 2 → 1 columns across breakpoints; hero type steps 56px → 40px → 34px → 28px.

## Fix Priority

Apply changes in this order for maximum visual impact with minimum risk:

1. **Font swap** — switch to the SF Pro stack (or Inter fallback per the substitute notes) — biggest instant improvement, lowest risk.
2. **Color palette cleanup** — collapse to the single Action Blue accent + the ink/parchment/tile neutrals above.
3. **Remove stray shadows/gradients/borders** — flatten everything except the one product-image shadow.
4. **Layout and spacing** — 8px-based rhythm, `{spacing.section}` tile padding, tile-alternation for section breaks.
5. **Replace generic components** — swap default buttons/cards/inputs for the pill/utility-card/frosted-nav grammar above.
6. **Add hover/active/focus states** — `scale(0.95)` press state, `{colors.primary-focus}` focus ring.
7. **Polish typography scale and tracking** — apply the hierarchy table and negative letter-spacing as the final pass.

## Rules

- **Visual-only.** Do not change component logic, state, data flow, event handlers, routing, API calls, or prop contracts. Only markup structure needed to support styling, CSS/className, and purely decorative static copy.
- If a requested visual change would require touching behavior/logic, stop and flag it instead of making the change.
- Work with the existing tech stack. Do not migrate frameworks or styling libraries.
- Test after every change to confirm functionality is unaffected.
- Before importing any new library (e.g. a font), check the project's dependency file first.
- If the project uses Tailwind, check the version (v3 vs v4) before modifying config.
- If the project has no framework, use vanilla CSS.
- Keep changes reviewable and focused. Small, targeted improvements over big rewrites.
