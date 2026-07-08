# BRAND.md - Air Composer

## Positioning line (in Devon's language)

**"A real instrument in a browser tab. Wave your hands, it plays in key. No install, no upload, no account."**

Secondary framing for the X post: "webcam theremin + talk box that key-detects the song in your room. all client-side."

## Palette direction

Keep and sharpen the existing stage-dark system. This is a performance instrument; the UI is a dark stage and the hands are the show.

- Base: near-black stage `#08080c`, surfaces `#12121a`, borders `#1e1e2a`
- Primary accent: brass gold `#c9a84c` (active `#e8d48b`) - the "instrument" color: pitch lines, detected key, anything musical
- Secondary accent: violet `#a78bfa` (light `#c4b5fd`) - the "magic" color: hand trails, landing glow, tracking
- Danger: `#ff5f5f` reserved strictly for record state and real errors
- Rule: gold means music, violet means motion/tracking, red means recording. Never mix the meanings; never introduce a 4th accent.
- Glows stay at low alpha (existing 0.06 to 0.4 range). No full-saturation neon washes.

## Type system

- Display and body: **Sora** (400/500/600/700). Headlines 600 to 700, tight tracking, no all-caps shouting.
- Mono: **JetBrains Mono** for anything technical or honest: detected key readout, BPM/confidence numbers, keyboard shortcut chips, the privacy line. Mono is the credibility voice.
- Scale: 1 headline size per screen. Landing headline is the only text above ~2.5rem anywhere in the product.

## Spacing and motion personality

- Spacing: generous and calm. The instrument viewport owns the screen; controls live in a single slim toolbar. Nothing floats mid-canvas except transient coach hints.
- Motion: **physical, audio-reactive, never decorative.** Trails, meters, and pulses may only move in response to hands or sound. UI chrome transitions are fast and dry (150 to 200ms ease-out). No looping background animations on control surfaces, no parallax, no scroll effects.
- The only always-moving element allowed on the pre-camera landing is the demo canvas, because it is demonstrating the product.

## Voice and tone rules

1. Plain, confident, technically honest. Name the algorithm (Krumhansl-Schmuckler). Never say "AI-powered."
2. Privacy stated as fact, not marketing: "Nothing is recorded or uploaded. Everything runs in your browser."
3. Instructions are physical: "Raise your left hand," not "Utilize the pitch control."
4. Playful is fine, cute is not. "Warming up your air instrument" passes; emoji in UI copy does not (the mobile-gate clipboard emoji should go).
5. Zero hype adjectives: no "revolutionary," "seamless," "unleash," "magical" (show the magic, never claim it).

## 3 reference products to measure taste against

1. **Ableton Learning Music** - restraint, instant interactivity, dark UI where sound is the hero
2. **Teenage Engineering (OP-1 field / teenage.engineering)** - instrument-grade economy: every control earns its pixels, mono type as a design feature
3. **Patatap** - payoff density: sound plus visual within 1 second of input, no chrome between the user and the toy

## 3 anti-references (must never look like)

1. **Generic AI-template SaaS landing** - purple-to-blue gradient hero, emoji feature grid, "Get Started Free" buttons, testimonial cards. Instant credibility death with this persona.
2. **Novelty webcam-filter apps** (Photo Booth clone energy, Snap filter sites) - gimmick framing would cheapen the fact that this is a playable instrument with real DSP.
3. **Abandoned Google Experiment page** (Semi-Conductor's current state) - a one-trick demo with a giant logo, a single button, and no depth. Air Composer must read as maintained and deep: 3 modes, key detection, recording.
