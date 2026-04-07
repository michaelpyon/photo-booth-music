# Air Composer Design Tokens

Concert hall elegance meets technology. Dark foundation with warm gold accents that evoke the brass and warmth of a live performance hall. Soft violet as a secondary accent for interactive and decorative elements.

## Palette

### Surfaces

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#08080c` | Page background, deep dark foundation |
| `--surface` | `#12121a` | Cards, panels, elevated containers |
| `--surface-hover` | `#1a1a24` | Hovered surface states |

### Text

| Token | Value | Usage |
|---|---|---|
| `--text-bright` | `#ffffff` | High-emphasis headings, active labels |
| `--text` | `#f0eff4` | Primary body text |
| `--text-muted` | `#9998a5` | Secondary text, descriptions, hints |
| `--text-subtle` | `#6b6a76` | Tertiary text, disabled labels |

### Accents

| Token | Value | Usage |
|---|---|---|
| `--accent` | `#c9a84c` | Primary accent (concert hall gold). CTAs, active states, spinners |
| `--accent-active` | `#e8d48b` | Brighter gold for hover/active emphasis |
| `--accent-secondary` | `#a78bfa` | Soft violet for secondary actions, links, decorative elements |
| `--accent-secondary-light` | `#c4b5fd` | Lighter violet for hover states on secondary elements |

### Danger

| Token | Value | Usage |
|---|---|---|
| `--danger` | `#ff5f5f` | Error states, destructive actions, "listen" mode indicator |

### Borders

| Token | Value | Usage |
|---|---|---|
| `--border` | `#1e1e2a` | Default borders, dividers, card outlines |
| `--border-hover` | `#2d2d3a` | Hovered borders, button outlines at rest |

### Backdrops

| Token | Value | Usage |
|---|---|---|
| `--backdrop` | `rgba(8, 8, 12, 0.85)` | Modal overlays, start prompt |
| `--backdrop-heavy` | `rgba(8, 8, 12, 0.88)` | Welcome popup backdrop (heavier blur) |

### Semantic Alpha Channels

| Token | Value | Usage |
|---|---|---|
| `--accent-glow` | `rgba(201, 168, 76, 0.06)` | Subtle gold glow (card shadows) |
| `--accent-glow-strong` | `rgba(201, 168, 76, 0.3)` | Visible gold glow (button hover) |
| `--accent-secondary-bg` | `rgba(167, 139, 250, 0.08)` | Violet tinted backgrounds |
| `--accent-secondary-border` | `rgba(167, 139, 250, 0.2)` | Violet tinted borders |
| `--danger-bg` | `rgba(255, 95, 95, 0.15)` | Danger badge backgrounds |
| `--danger-border` | `rgba(255, 95, 95, 0.4)` | Danger badge borders |
| `--danger-glow` | `rgba(255, 95, 95, 0.4)` | Pulse animation glow |
| `--detected-key-bg` | `rgba(201, 168, 76, 0.15)` | Key detection badge background |
| `--detected-key-border` | `rgba(201, 168, 76, 0.4)` | Key detection badge border |
| `--toolbar-bg` | `rgba(8, 8, 12, 0.7)` | Semi-transparent toolbar |

## Typography

| Token | Value | Usage |
|---|---|---|
| `--font-display` | Sora | Headings, titles, labels |
| `--font-body` | Sora | Body text, descriptions |
| `--font-mono` | JetBrains Mono | Buttons, badges, code, technical labels |

## Design Principles

1. **Concert hall warmth.** Gold replaces neon cyan as the primary accent. The feeling is a lit stage in a dark hall, not a nightclub.
2. **Violet as complement.** The secondary violet adds depth without competing with gold. Used for decorative and navigational elements.
3. **Deep, not black.** Surfaces use near-black blues (`#08080c`, `#12121a`) rather than pure black, creating depth and richness.
4. **Text hierarchy through opacity.** Four text tiers from bright white to subtle gray, used consistently across all components.
5. **Glow over glow.** Shadows and glows use the accent color at low opacity rather than generic white or black shadows.
