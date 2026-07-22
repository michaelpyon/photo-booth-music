# Evaluation

## Baseline

Baseline `6a39f53` built successfully, but the production bundle lagged behind the
canonical source and the local launch pass found 3 material gaps:

- Theremin and Conductor controls shared one DOM container, so both control sets
  remained visible after a mode switch.
- The mobile gate script ran before `#app` existed and depended on the CSS fallback.
- The build tree reported 4 dependency advisories, including 2 high-severity
  development-server findings.

The UI also retained emoji-based controls and a centered wide-screen hero that did
not meet the portfolio design rules.

## Launch gate

Passing requires 2 clean end-to-end rounds with 0 console or page errors. Each round
must prove metadata, desktop and mobile entry, camera and microphone permission,
MediaPipe initialization, all 3 modes, isolated mode controls, onboarding, reduced
motion, key matching, clip recording, and the X and Reddit share intents.

### Round 1

Clean. All 14 launch assertions passed with 0 console or page errors. A fake camera
and microphone reached video ready state 4, produced a 1440x900 render canvas, loaded
the welcome and first-jam flows, played Conductor mode, activated Match the music,
and recorded a real WebM preview with download, native share, X, Reddit, and copy-link
actions.

The 390x844 mobile gate exposed a 52px copy target and copied the canonical desktop
URL. The reduced-motion context held the landing demo on a static frame.

### Round 2

Clean on committed product tree `301e553`. The same 14 launch assertions passed with
0 console or page errors after a fresh dependency install and production build.
`npm audit` reported 0 vulnerabilities.

Final customer scores: 9/9/9/10 for made-for-me, first 5 seconds, taste match, and
job success.

Result: ready to deploy with a 2-round clean streak.

## Known non-blocker

A normal headless browser can log 2 Web Audio autoplay warnings while Tone.js is
imported before the first click. The app creates and resumes its own audio engine
inside the Start playing gesture, and the warnings do not produce a page error or
block audio, camera, mode, or recording behavior.

## Public verification

Pending deployment of the committed gate record.
