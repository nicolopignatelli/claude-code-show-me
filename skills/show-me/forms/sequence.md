# Sequence

States in order, left to right, joined by arrows, each with a short caption: what the
person sees and what they do to get to the next one.

**Use it when** the point is an order: a user flow, a screen changing over time, steps to
reproduce a bug, the stages of a process. **Not when** only the first and last state
matter (Compare), or there is no screen at all (Diagram).

## Composing it

- **Three to five steps.** Fewer is a Compare; more does not fit at a size anyone can
  read: split it, or show the steps that carry the point and say how many were skipped.
- **Crop each step to the region that carries it**: the control acted on and enough
  around it to recognise the screen, not the whole viewport. Three whole screens side by
  side make a strip too short to read; three crops stay readable. Keep the same scale for
  every step, and the same crop size where the screens allow, so the eye reads the change
  and not the framing.
- **Show it `large`**: a sequence runs wide, and large takes the terminal's full width.
- **Mark the action on each step**, the thing the person clicks or types to move on, with
  the same outline everywhere. On the last step mark what the point is about.
- **Captions under each step**: a number, then one line in the person's words ("Choose
  where the book starts"), not the system's ("POST /start").
- **Arrows in the gaps**, small and muted; the steps carry the weight.
- **Capture the real flow** in one browser session, step by step, the same viewport
  throughout. Read the code behind a button before clicking it on production: stop
  before anything that writes data, sends mail, charges or calls a paid model.

## Template

Each step is an inline SVG whose `viewBox` is the step's crop in screenshot pixels and
whose CSS size is the crop at the shared scale. With crops of 1400 × 1000 screenshot
pixels shown 336 × 240, `k = 1400 / 336 ≈ 4.2`: stroke `3k`, halo `7k`, corner `8k`.

```html
<!doctype html>
<meta charset="utf-8">
<style>
  html, body { margin: 0; background: #F5F5F7; }
  body {
    display: flex; align-items: flex-start; justify-content: center; gap: 0;
    padding: 32px; box-sizing: border-box; width: 100vw; height: 100vh;
    font: 16px/1.35 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #1C1C1E;
  }
  figure { margin: 0; width: 336px; }
  .shot { display: block; border-radius: 8px; background: #FFFFFF; box-shadow: 0 0 0 1px #E5E5EA; }
  figcaption { margin-top: 12px; }
  .n { font-weight: 700; color: #E5484D; margin-right: 6px; }
  .arrow { width: 34px; height: 240px; display: flex; align-items: center; justify-content: center; color: #6E6E73; font-size: 22px; }
  .halo { fill: none; stroke: #FFFFFF; }
  .mark { fill: none; stroke: #E5484D; }
</style>

<figure>
  <svg class="shot" viewBox="CX CY 1400 1000" width="336" height="240">
    <image href="/absolute/path/step-1.png" width="2560" height="1600"/>
    <rect class="halo" x="…" y="…" width="…" height="…" rx="8k" stroke-width="7k"/>
    <rect class="mark" x="…" y="…" width="…" height="…" rx="8k" stroke-width="3k"/>
  </svg>
  <figcaption><span class="n">1</span>What they see — what they do</figcaption>
</figure>
<div class="arrow">→</div>
<!-- …one figure per step, an arrow between each… -->
```

Canvas: `width` 1200 for three steps of 336 (four steps: 260 each, five: 205; below 200
the steps stop being recognisable), `height` = step height + about 120 for captions.
Write the numbers in.

## Mistakes to avoid

- **Different crops or zoom per step**, so a change of framing reads as a change of screen.
- **Steps with no marked action**: the person cannot tell how one leads to the next.
- **System words in captions** (routes, events, component names).
- **A flow followed on production past a write**: a sequence is not worth a fake
  account or a real charge.
