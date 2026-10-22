# Zoom

A detail magnified beside its context, with guide lines joining the two, so the person
sees both what it is and where it is.

**Use it when** the detail is too small to judge in place (an icon, a 1-px misalignment,
a hairline, a tiny label) and where it sits matters too. **Not when** a tighter crop
already shows the detail at a readable size (Quote).

## Composing it

- **Context**: the whole region the detail lives in, at a scale that fits the canvas
  width: a header strip, a card, a full screen. Outline the detail's spot in it.
- **Magnified panel**: the detail cropped square or close to it, enlarged 3–6× in CSS
  pixels; past that a screenshot turns to mush. Capture at 2× or more when you know you
  will zoom. Crop so the detail fills about half the panel: a crop four times the
  detail's width leaves it a speck again.
- **Guide lines** from two corners of the outline to the matching corners of the panel,
  thin and muted, so they connect without competing with the accent.
- **Placement**: the panel below or beside the context, on the same side as the detail,
  so the guide lines stay short and do not cross the context.
- **Say the magnification** ("4×") quietly under the panel, and the point beside it.

## Template

One SVG in CSS pixels covers the canvas; each picture is a nested `<svg>` whose
`viewBox` is its crop in screenshot pixels. Positions in the outer SVG are canvas pixels:
for a context of width `CW` shown at `w`, a screenshot point `(sx, sy)` lands at
`(x + (sx − CX) × w / CW, y + (sy − CY) × w / CW)`.

```html
<!doctype html>
<meta charset="utf-8">
<style>
  html, body { margin: 0; background: #F5F5F7; }
  svg.canvas { display: block; width: 100vw; height: 100vh; }
  .frame { fill: none; stroke: #E5E5EA; stroke-width: 1; }
  .guide { stroke: #6E6E73; stroke-width: 1.5; stroke-dasharray: 4 4; }
  .halo { fill: none; stroke: #FFFFFF; stroke-width: 6; }
  .mark { fill: none; stroke: #E5484D; stroke-width: 2.5; }
  text { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  .point { font-size: 20px; font-weight: 600; fill: #1C1C1E; }
  .muted { font-size: 16px; fill: #6E6E73; }
</style>
<svg class="canvas" viewBox="0 0 WIDTH HEIGHT">
  <!-- Context, outlined at the detail's spot. -->
  <svg x="32" y="32" width="CTX_W" height="CTX_H" viewBox="CX CY CW CH">
    <image href="/absolute/path/shot.png" width="FULL_W" height="FULL_H"/>
  </svg>
  <rect class="frame" x="32" y="32" width="CTX_W" height="CTX_H"/>
  <rect class="halo" x="SX" y="SY" width="SW" height="SH" rx="4"/>
  <rect class="mark" x="SX" y="SY" width="SW" height="SH" rx="4"/>

  <!-- Guide lines: outline corners to panel corners. -->
  <line class="guide" x1="SX" y1="SY+SH" x2="PX" y2="PY"/>
  <line class="guide" x1="SX+SW" y1="SY+SH" x2="PX+PW" y2="PY"/>

  <!-- Magnified panel. -->
  <svg x="PX" y="PY" width="PW" height="PH" viewBox="DX DY DW DH">
    <image href="/absolute/path/shot.png" width="FULL_W" height="FULL_H"/>
  </svg>
  <rect class="halo" x="PX" y="PY" width="PW" height="PH" rx="6"/>
  <rect class="mark" x="PX" y="PY" width="PW" height="PH" rx="6"/>
  <text class="muted" x="PX+PW" y="PY+PH+24" text-anchor="end">4× magnified</text>

  <!-- The point, beside the panel. -->
  <text class="point" x="TX" y="TY">What the detail is, in words</text>
</svg>
```

Write the numbers in. Height: the context, the panel and its note, plus 32 of padding top
and bottom.

## Mistakes to avoid

- **Magnifying past what the capture holds**: blur reads as a defect that is not there.
- **Guide lines that cross the context** or the point's text.
- **An outline in the context that does not match the panel's crop**: the person compares
  the two and the mismatch reads as a different spot.
