# DESIGN.md - Air Composer (design source of truth)

Product name and concept are fixed: **Air Composer**, a fully client-side webcam instrument (theremin, formant/talk box, conductor) built on MediaPipe tasks-vision + Tone.js. Vite + vanilla TypeScript, no framework. Do not re-architect.

## Layout / IA intent

Single-page app with 3 sequential layers, never shown together:

1. **Pre-camera landing** (`#landing`) - value prop, animated demo canvas, privacy promise, 1 CTA ("Start playing"). The camera prompt fires only after the CTA. This ordering is a hard rule; it exists to defuse the persona's number-1 bounce trigger.
2. **Loading** (`#loading`) - model + audio warmup.
3. **Instrument stage** - fullscreen mirrored video + overlay canvas, slim top toolbar (mode selector left, mode controls right). Clip recorder, coach hints, and key-detection readout live as compact chips over the stage, never as panels that cover the hands.

Mobile (<768px) gets the existing gate screen: preview image, explanation, copy-link button. Keep it; refine copy per BRAND voice rules (drop the clipboard emoji).

## Hero / landing concept

Headline: "Play a theremin with your hands. Just a webcam." Subtext keeps the no-install promise; teaser line sells play-along key detection as the headline trick. Center: the looping `#demo-canvas` animation (stylized hands trailing violet note-streaks with a gold waveform pulse) so visitors see the magic before granting anything. A marked SWAP POINT in index.html allows replacing the canvas with a muted looping screen-recording video; prefer the real recording once one exists, it converts better with this persona. Below: mono-type privacy line, then the single CTA.

## Key screens list

1. Pre-camera landing (desktop)
2. Mobile gate
3. Loading / warmup
4. Theremin mode (pitch range shifting via arrow keys, scale snap controls)
5. Formant / talk box mode (H toggles vowel guide overlay)
6. Conductor mode (4 arrangements, Space play/pause)
7. Play-along ("Match the music"): detected key chip + live in-tune confidence meter
8. Clip recorder flow: arm, 15s record (red state), preview, share sheet / webm download, share-the-link intents
9. First-jam coach overlay (guided hints over the live instrument, dismissible)

## Empty / loading / error state intent

- **Camera denied:** stage never appears; show a calm explainer with browser-specific re-enable steps and a "Try again" action. Never a raw console-style error.
- **Mic denied (play-along only):** the instrument keeps working; the Match-the-music toggle shows an inline note that listening needs mic access. Degrade, never block.
- **No hands detected >3s:** gentle overlay hint ("Raise your hands into frame"), violet, auto-dismissing. Not an error color.
- **Model/CDN load failure:** loading screen swaps to a retry state with a plain-language line; keep the spinner honest (no fake progress).
- **Low confidence key detection:** show the confidence meter low rather than hiding it; honesty is a feature here.
- **Recording failure / unsupported MediaRecorder:** fall back to download-only messaging before the user records, not after.

## Metadata / OG intent (X-readiness mandatory)

- Title "Air Composer | Play Music With Your Hands", description, `summary_large_image` card, `twitter:site/creator` @michaelpyon: present in HEAD and on the live deploy. `og.png` returns 200.
- Canonical and og:url point to `https://air-composer.michaelpyon.com` while the roster live URL is `air-composer.vercel.app`; V2 verified both serve the same build (same etag). Keep michaelpyon.com as canonical; confirm the domain still resolves before the X post and update the mobile-gate copy-link URL to match whichever is posted.
- OG image intent: a stage-dark still of hands with violet trails + gold key readout, headline overlaid in Sora. If og.png is currently generic, regenerating it to show the actual product moment is the highest-leverage X asset.

## Data honesty

The product claims: no recording/upload, all processing client-side, real key detection via Krumhansl-Schmuckler. **These claims are true in the current code** (MediaPipe + Tone.js run locally; there is no backend, no env keys, no analytics observed in the repo). The 15s clip is recorded locally only when the user initiates it and is shared via the native share sheet or downloaded; keep copy explicit that recording is user-initiated. Nothing needs a disclosure banner. Rule for future work: if any telemetry, CDN-hosted model note, or server feature (e.g. the deferred pin-line/daily-nudge backend bet) is added, the privacy line must be updated in the same commit.

## The screenshot-worthy moment to engineer

**The in-key jam clip.** Play a song in the room, toggle Match the music, and the stage shows: detected key chip (gold, mono type) + confidence meter climbing + violet hand trails landing on snapped notes. The 15s clip recorder should default its framing to include the key chip and meter so every shared clip carries the proof of the trick. That single frame - hands, trails, "Key: A minor / 92% in tune" - is the X post.
