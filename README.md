# Air Composer

Play a theremin and talk box with your hands, using just a webcam. No installs,
no plugins. Everything runs in the browser.

Live: https://air-composer.michaelpyon.com

## What it is

Air Composer tracks your hands through the webcam and turns the motion into
music. Your left hand controls pitch, your right hand controls volume and
effects. It can also listen to a song playing in the room, find the key, and
snap your notes so you play along in tune.

All processing is client side. Hand tracking uses MediaPipe tasks-vision, audio
uses Tone.js and the Web Audio API. Nothing is recorded or uploaded.

## Modes

- Theremin. A continuous webcam theremin. Use the Up and Down arrow keys to
  shift the pitch range so you can reach full melodies.
- Formant (talk box). Shapes a vowel like timbre with your hand. Press H to
  toggle the on screen guide.
- Conductor. Drive 1 of 4 classical arrangements with gestures. Press Space to
  play and pause.

## Play along

Turn on Match the music. Air Composer listens through the mic, runs a
Krumhansl-Schmuckler key estimate, and snaps your notes to the detected key with
a confidence readout. Mic audio is analyzed locally and never leaves the device.

## Record and share

Record a 15 second clip of your jam and share it. Where the browser supports it,
the native Web Share sheet opens, otherwise the clip downloads as a webm.

## Run it locally

Requires Node 18 or newer.

```bash
npm install
npm run dev
```

Then open the printed local URL in a desktop browser and allow camera access.

To build a production bundle:

```bash
npm run build
npm run preview
```

## Browser support

Works best in a recent desktop Chrome, Edge, or Safari with a webcam. Mobile is
not supported, the app shows a desktop only notice on small screens because
hand tracking needs a steady camera and a pointer sized canvas.

## Tech

- TypeScript and Vite
- MediaPipe tasks-vision for hand landmark tracking
- Tone.js and the Web Audio API for synthesis and analysis
