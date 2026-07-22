# Air Composer, suggestions

Last refreshed by an audience pass on 2026-05-30. Builds on the prior converged
pass (pre-camera landing, record-and-share clip, play-along key detection as the
headline). The repo is honest and works end to end, and the live URL already
serves the fixed build, so this pass is pure additive polish.

## The evangelist

A creative coder or generative-music tinkerer who hangs out in r/InternetIsBeautiful,
r/creativecoding, and the Tone.js and p5.js Discords. Right now they screen-record
WebGL toys and tiny browser instruments and post 15 second clips with a "no install,
just open the tab" caption. They will screenshot or clip Air Composer the moment they
wave a hand and a clean violet note-streak follows it in tune, especially the
"it listens to the song in your room and snaps you to the key" trick, because that
is a genuinely novel hook they have not seen before. They bounce in 5 seconds if the
first thing they hit is a cold camera permission wall with no context, if the audio
is harsh or laggy, or if it feels like a one-note gimmick with nothing to explore. The
prior pass already removed the cold-wall bounce with a pre-camera landing, a privacy
promise, and a no-camera demo animation, which is exactly what this persona needs to
feel safe clicking Start.

## Ground-truth findings (repo HEAD, verified)

Working and honest. Evidence:

- No fabricated or stale data. Grep for `mta|gtfs|example.com|as of|updated daily|
  real-time|api/status|railway` across `src` and `index.html` returns nothing. There
  is no `api/` directory. The earlier "## Air Composer" lines in AUDIENCE_PASS_LOG.md
  that mention MTA GTFS feeds are a log mix-up with The Low Line, not this repo. The
  correct, later log block describes this app accurately (hand-tracking instrument).
- No false authority claims. The app claims only what it does: a browser webcam
  theremin and talk box, with optional room-listening key detection. All processing is
  client-side (MediaPipe tasks-vision, Tone.js, Web Audio). The "Nothing is recorded or
  uploaded, everything runs in your browser" promise in `index.html` is true; there is
  no network upload of audio or video.
- No invented claims about real people, companies, or places.
- Reliability hardening is present: `tracker.init()` is wrapped in a retry loop with an
  on-brand error card (`src/main.ts`), MediaPipe is pinned to `^0.10.32`
  (`package.json`), and camera-denied has a real fallback state.
- Build is clean: `npm install` then `npm run build` (`tsc && vite build`) succeeds,
  997 modules, no type errors.
- Live check: `https://air-composer.vercel.app` serves the fixed build. It shows the
  pre-camera landing with headline "Play a theremin with your hands. Just a webcam.",
  the "Start playing" button, and the privacy note. No deploy mismatch for this app.

Canonical and OG host check (resolved wave 2, no change needed): curled both hosts
with a Twitterbot user agent. `https://air-composer.michaelpyon.com` is attached and
serves this exact app (HTTP 200, same etag as `air-composer.vercel.app`), and
`https://air-composer.michaelpyon.com/og.png` returns HTTP 200 with content-type
image/png, a real 229 KB raster card. So `og:url`, `canonical`, `og:image`,
`twitter:image`, and the in-app copy-link all point at a working host. The earlier
mismatch worry was unfounded, the custom domain is the correct canonical and link
previews already resolve. No URL change made.

## Prioritized plan

### Shipped wave 3

- [x] Guided "first jam" coach over the live instrument (was bigger bet 6). Added
  `src/ui/FirstJamCoach.ts` + styles in `src/style.css`: a small scripted overlay pinned
  below the toolbar that walks a first-timer through 3 short prompts (raise your left
  hand for pitch, raise your right hand for volume and tone, hit Match the music to play
  in tune), with step dots, Next, and Skip. Auto-advances on a timer, shows once per
  device, and is a pure text overlay with no audio or tracking coupling. Chained off the
  welcome popup dismissal so the two never overlap. Respects reduced motion. So the empty
  instrument is never silent and unexplained. Additive, full build verified.
- [x] One-tap share-the-link intents from the record flow (was bigger bet 5). The clip
  result panel already had Download / native Share / Done. Added a "Post the link" row
  with X, Reddit, and Copy link buttons (`src/ui/ClipRecorderUI.ts` + styles in
  `src/style.css`). These open prefilled web intents (twitter.com/intent/tweet,
  reddit.com/submit) with the verified canonical app URL and an honest caption, plus a
  clipboard copy. A web intent cannot attach a local video file, so the saved-clip note
  now honestly tells the player to download the clip and attach it to the post. Always
  available, independent of the Web Share API. Additive, tsc + build verified.
- [x] Visible in-tune confidence meter during play-along (was bigger bet 8). The
  KeyDetector already reported a confidence value that only showed as a small text
  percentage in the badge. Turned it into a real live meter (`confidence-meter` in
  `src/ui/ThereminControls.ts` + styles in `src/style.css`): a labelled horizontal bar
  that fills and glows as the room-key lock strengthens, with a `locked` state past 70%
  and an ARIA meter role. Makes the headline "snap you to the key" trick feel live and
  screenshot-worthy. Additive, tsc + build verified.
- [x] Canonical / OG host re-check (autonomous-safe canonical fix). Re-curled both hosts
  with a desktop browser user agent on 2026-05-30: `air-composer.michaelpyon.com` and
  `air-composer.vercel.app` both return HTTP 200 with the identical etag and serve this
  exact Air Composer page, and `air-composer.michaelpyon.com/og.png` returns HTTP 200
  image/png (229 KB). Canonical, og:url, og:image, and twitter:image already point at the
  preferred custom domain. No change needed; verified, not assumed.

### Shipped wave 2

- README.md (was quick win 3). The repo had no README or CLAUDE.md, so a creative
  coder landing from a shared clip had nothing to read before forking. Added a short,
  accurate README: what it is, the 3 modes (theremin, formant talk box, conductor) with
  their real keyboard shortcuts, play-along key detection, record-and-share, local run
  steps (npm install, npm run dev), browser support, and tech stack. Static, build
  verified, no deploy needed. Helps the share-driven discovery loop this persona drives.
- Verified the canonical and OG host defect was not real (see ground-truth note above).
  Custom domain is attached and serving, og.png is a real PNG, link previews resolve.
  No change made.

### Implemented in the prior pass (quick win, shipped)

1. Discoverable keyboard shortcuts. The app already wired Arrow keys (theremin pitch
   range), H (formant guide), and Space (conductor play and pause) in `src/main.ts`,
   but they were invisible, so a first-timer never found them and the instrument felt
   shallower than it is. Added a small, dismissible, on-brand hint chip
   (`src/ui/KeyboardHints.ts` + styles in `src/style.css`) pinned bottom-left that
   shows the shortcut for the active mode and updates on mode switch. Remembered per
   device via localStorage. Hidden under 900px since shortcuts are desktop-only.
   Effort S. Additive, build verified. Helps the evangelist discover the pitch-range
   shift that makes real melodies playable, which is what turns a 5 second clip into a
   30 second one. Deploy needed to see live.

### Quick wins

2. [x] Audio "first note" warmth check (code review, no change needed). Reviewed the full
   first-note path in `src/audio/ThereminSynth.ts` + `src/audio/AudioEngine.ts`. The
   default patch is already warm and click-free on the first gesture: pure sine
   (gainSine 1, gainSaw 0) through a wide-open lowpass (8000 Hz), the output gain ramps
   from 0 to 0.7 over a 50 ms linear attack so there is no startup pop, and oscillator
   pitch uses an exponential ramp. Effective peak through the 0.7 master is roughly 0.49
   for a pure sine, so it does not clip. A pure sine has no harmonics to make the lowpass
   resonance harsh. No code change made: softening attack or filter would be a
   speculative, ear-only tweak that I cannot verify without a deploy, and the patch is
   already correct, so changing it would risk regressing the sound. Confirmed, not
   assumed.

### Bigger bets

7. Pin-line plus daily push (the prior pass's explicitly deferred bet). A way to save a
   favorite patch or scale and get a daily nudge to play. This is a multi-week
   notification and persistence feature, out of scope for a contained additive pass.
   Effort L. Needs backend or service worker plus deploy.
8. Visible "in tune" confidence meter during play-along. The KeyDetector reports a
   confidence value (`setDetectedKey` in `ThereminControls.ts`); turning that into a
   small live meter would make the headline feature feel magical and screenshot-worthy.
   Effort M. Deploy to verify.
