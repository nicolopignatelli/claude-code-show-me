# Compare

Two pictures side by side, at the same scale, each labelled, with the difference marked
on both.

**Use it when** the point is how two states differ: A/B, before/after, desktop vs phone,
ours vs theirs, light vs dark. **Not when** one state alone makes the point (Quote) or
there are more than three (Contact sheet).

## Making the two comparable

- **Same scale.** Show both at the same CSS-pixel scale, so a button that looks bigger is
  bigger. Divide each screenshot's pixels by its own device pixel ratio first: a 2×
  desktop capture and a 2× phone capture both show at half their pixel size.
- **Same region.** Crop both to the same part of the screen (the same element, the same
  section), aligned on it, so the eye moves straight across.
- **Same state otherwise.** Take both captures the same way: same page state, same
  banners open or closed, same data. A difference you did not mean is noise.
- **Phone captures come from device emulation** (a browser tool's viewport emulation with
  the mobile flag), not a narrow headless window: a narrow window can lay the page out
  wider than it is and clip it.
- **Side by side** when both are wider than tall or one is a phone; **stacked** when both
  are wide and the difference runs horizontally.

## Marking the difference

Mark the same thing on both, in the same way, so the eye compares like with like: an
outline on both, a dashed outline where the thing is hidden or missing. Say the
difference in words under each panel; the caption says what it means.

## Template

Each panel is an inline SVG whose `viewBox` is its crop in that screenshot's pixels, and
whose CSS size is the crop divided by the device pixel ratio. Marks are in screenshot
pixels; with a 2× capture shown at 1×, `k = 2`: stroke `3k`, halo `7k`, corner `8k`.

```html
<!doctype html>
<meta charset="utf-8">
<style>
  html, body { margin: 0; background: #F5F5F7; }
  body {
    display: flex; gap: 48px; align-items: flex-start; justify-content: center;
    padding: 32px; box-sizing: border-box; width: 100vw; height: 100vh;
    font: 16px/1.4 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #1C1C1E;
  }
  figure { margin: 0; }
  .title { font-weight: 600; margin: 0 0 10px; }
  .title span { color: #6E6E73; font-weight: 400; }
  .panel { display: block; border-radius: 10px; background: #FFFFFF; box-shadow: 0 0 0 1px #E5E5EA; }
  .note { margin: 10px 0 0; color: #E5484D; font-weight: 600; }
  .halo { fill: none; stroke: #FFFFFF; }
  .mark { fill: none; stroke: #E5484D; }
</style>

<figure>
  <p class="title">A <span>· what it is</span></p>
  <svg class="panel" viewBox="AX AY AW AH" width="AW/dpr" height="AH/dpr">
    <image href="/absolute/path/a.png" width="A_FULL_W" height="A_FULL_H"/>
    <rect class="halo" x="…" y="…" width="…" height="…" rx="8k" stroke-width="7k"/>
    <rect class="mark" x="…" y="…" width="…" height="…" rx="8k" stroke-width="3k"/>
  </svg>
  <p class="note">What is different here, in words</p>
</figure>

<figure>
  <p class="title">B <span>· what it is</span></p>
  <svg class="panel" viewBox="BX BY BW BH" width="BW/dpr" height="BH/dpr">
    <image href="/absolute/path/b.png" width="B_FULL_W" height="B_FULL_H"/>
    <!-- Hidden or missing: the same mark, dashed. -->
    <rect class="halo" x="…" y="…" width="…" height="…" rx="8k" stroke-width="7k"/>
    <rect class="mark" x="…" y="…" width="…" height="…" rx="8k" stroke-width="3k"
          stroke-dasharray="6k 5k"/>
  </svg>
  <p class="note">What is different here, in words</p>
</figure>
```

Canvas: `width` = both panels + the gap + 64 of padding (stay near 1200; crop tighter
rather than going wider), `height` = the taller panel + about 140 for titles and notes.
Write the numbers in: every `k` and `/dpr` multiplied out.

## Mistakes to avoid

- **Different scales**, so sizes cannot be compared.
- **Different regions or states**, so the eye hunts for the difference you mean among
  differences you do not.
- **A difference marked on one side only.**
- **The difference left to the eye**: always say it under the panel.
