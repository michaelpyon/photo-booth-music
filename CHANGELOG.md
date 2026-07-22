# Changelog

## 2026-07-22

- Split Theremin and Conductor controls into isolated mode groups so controls do not
  leak across mode switches.
- Reworked the wide desktop landing into a stronger split composition without
  changing the product copy or instrument direction.
- Fixed the mobile gate initialization order and added a resilient desktop-link copy
  fallback.
- Replaced emoji controls and the emoji favicon with text labels and drawn geometry.
- Updated X card attribution to @mikaships.
- Added reduced-motion handling to the landing demo and hid the dismissed landing
  from assistive technology.
- Removed an unused camera fallback implementation and its duplicate styles.
- Upgraded Vite within major version 7 and cleared all dependency advisories.
- Verified camera, microphone, MediaPipe, all 3 modes, key matching, mobile, reduced
  motion, and actual WebM clip generation in 2 clean end-to-end rounds.
