# Proposal overlay

A change you suggest, drawn onto the real screen, so the person judges it in place
instead of imagining it from a description.

**Use it when** you propose a UI change: an element added, moved, resized or removed.
**Not when** you report what is there (Quote), or the change needs a before and an after
side by side to be understood (Compare, with the proposal as the after).

## Composing it

- **Start from the real screen in the state the change lives in.** If the proposal
  replaces something that covers the page (a banner, a dialog), capture the page without
  it (dismiss it in a throwaway browser profile) and draw the proposed version on top.
- **Draw the proposal recognisably, but marked as a proposal**: the same shapes and
  colours the product uses, outlined with a dashed accent line, so nobody mistakes it for
  a screenshot.
- **Text you are not proposing stays a placeholder**: grey bars where copy goes. Copy is
  its own decision; real-looking invented text gets read as a copy proposal. Keep real
  labels only where they already exist (button names). If the layout only works with
  less text than there is today, say so in a note: the proposal then depends on a copy
  decision, and the person must see that.
- **Where it moves from**, when something moves: a dashed outline of the old spot,
  muted, so the move reads at a glance.
- **Notes beside the screen**, not on it: what the proposal is, what it changes for the
  person, each with a thin leader line to the spot.

## Template

The screen is a nested SVG at its CSS size whose `viewBox` is the screenshot's pixels;
the proposal is drawn inside it in screenshot pixels (`k` = device pixel ratio). Notes
and leaders sit in the outer SVG, in canvas pixels.

```html
<!doctype html>
<meta charset="utf-8">
<style>
  html, body { margin: 0; background: #F5F5F7; }
  svg.canvas { display: block; width: 100vw; height: 100vh; }
  text { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  .frame { fill: none; stroke: #D1D1D6; stroke-width: 1.5; }
  .proposal { fill: #FFFFFF; stroke: #E5484D; stroke-dasharray: 6k 5k; stroke-width: 3k; }
  .was { fill: none; stroke: #8E8E93; stroke-dasharray: 6k 5k; stroke-width: 2k; }
  .placeholder { fill: #D1D1D6; }
  .leader { stroke: #E5484D; stroke-width: 2; }
  .point { font-size: 18px; font-weight: 600; fill: #E5484D; }
  .muted { font-size: 16px; fill: #6E6E73; }
</style>
<svg class="canvas" viewBox="0 0 WIDTH HEIGHT">
  <svg x="40" y="28" width="SCREEN_W" height="SCREEN_H" viewBox="0 0 FULL_W FULL_H">
    <image href="/absolute/path/screen-without-it.png" width="FULL_W" height="FULL_H"/>
    <!-- The proposed element, in the product's own shapes and colours. -->
    <rect class="proposal" x="…" y="…" width="…" height="…" rx="…"/>
    <rect class="placeholder" x="…" y="…" width="…" height="20" rx="10"/>
    <!-- Real labels only where they already exist. -->
  </svg>
  <rect class="frame" x="40" y="28" width="SCREEN_W" height="SCREEN_H" rx="16"/>

  <!-- Notes beside the screen, a leader to each spot. -->
  <line class="leader" x1="NOTE_X-8" y1="…" x2="SPOT_X" y2="…"/>
  <text class="point" x="NOTE_X" y="…">What the proposal is</text>
  <text class="muted" x="NOTE_X" y="…">what it changes for the person</text>
</svg>
```

Write the numbers in. A phone screen fits a canvas about 900 wide, notes in the right
half; a desktop screen goes full width with the notes below it.

## Mistakes to avoid

- **A proposal that looks like the shipped product**: without the dashed outline it reads
  as a screenshot of something that exists.
- **Invented copy** in the proposed element.
- **The old element left in the screenshot under the new one**, so the picture shows
  both and proves nothing.
- **A proposal drawn on a screen it does not fit**: check the real sizes (element
  rectangles from the page) so what you draw could be built as drawn.
