# Quote

Part of a screen, with the thing you mean marked so there is no doubt which one.

**Use it when** you refer to one element or region of a screen: a misaligned field, the
button a flow starts from, the line of copy you want changed. **Not when** the point is a
difference between two screens (Compare) or the detail is too small to see in place (Zoom).

## Choosing the crop

- Crop to the target plus enough context to recognise where it is: usually the enclosing
  card, panel or section, rarely the whole screen.
- The target should take a fair share of the crop, roughly a tenth of its area or more.
  If it would be a speck, crop tighter or use Zoom.
- If the screenshot's own text must be read, crop until it would show at 14 px or more
  after scaling to the canvas width.

## Choosing the mark

| Mark | When |
|---|---|
| Outline | one element, the default |
| Spotlight | the region matters and the rest distracts: dim everything else |
| Underline | a line or a word of text |
| Arrow + label | the target is small or the label must sit away from it |

Combine at most two (a spotlight with a label, an outline with an arrow). Put the label
where it covers nothing the person needs: in empty space beside the target, or outside
the crop's busy side.

## Template

Coordinates are in the screenshot's own pixels: `W` × `H` is the full image, `CX CY CW CH`
the crop. Canvas: `width` 1200 (700 for `small`), `height` = `width × CH / CW`, rounded.
Sizes are in image pixels too, so scale them by `k = CW / width`: a stroke of `3 × k`,
a label of `18 × k`, a halo of `2 × k` on each side.

```html
<!doctype html>
<meta charset="utf-8">
<style>
  html, body { margin: 0; background: #F5F5F7; }
  svg { display: block; width: 100vw; height: 100vh; }
  .halo { fill: none; stroke: #FFFFFF; stroke-linecap: round; stroke-linejoin: round; }
  .mark { fill: none; stroke: #E5484D; stroke-linecap: round; stroke-linejoin: round; }
  .label {
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    font-weight: 600; fill: #E5484D;
    stroke: #FFFFFF; paint-order: stroke; stroke-linejoin: round;
  }
</style>
<svg viewBox="CX CY CW CH">
  <defs>
    <marker id="head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#E5484D"/>
    </marker>
  </defs>

  <image href="/absolute/path/to/shot.png" x="0" y="0" width="W" height="H"/>

  <!-- Spotlight: the crop, minus a hole around the target, dimmed. -->
  <path fill="rgba(28, 28, 30, 0.55)" fill-rule="evenodd"
        d="M CX CY h CW v CH h -CW z  M TX TY h TW v TH h -TW z"/>

  <!-- Outline: halo first, then the accent on top. Pad the target by about 6k. -->
  <rect class="halo" x="TX" y="TY" width="TW" height="TH" rx="8k" stroke-width="7k"/>
  <rect class="mark" x="TX" y="TY" width="TW" height="TH" rx="8k" stroke-width="3k"/>

  <!-- Underline, for text. -->
  <line class="halo" x1="X1" y1="Y" x2="X2" y2="Y" stroke-width="7k"/>
  <line class="mark" x1="X1" y1="Y" x2="X2" y2="Y" stroke-width="3k"/>

  <!-- Arrow from the label towards the target; the head stops short of it. -->
  <line class="halo" x1="AX" y1="AY" x2="BX" y2="BY" stroke-width="7k"/>
  <line class="mark" x1="AX" y1="AY" x2="BX" y2="BY" stroke-width="3k" marker-end="url(#head)"/>

  <!-- Label: words, beside the target. -->
  <text class="label" x="LX" y="LY" font-size="18k" stroke-width="5k">The total drops below the fold</text>
</svg>
```

Write the numbers in, not the letters: every `k` above is multiplied out
(`stroke-width="4.5"`), and only the marks you use stay in the markup.

## Mistakes to avoid

- **A mark placed without looking.** Read the screenshot first; for a live page take the
  rectangle from the page. After showing, read the rendered PNG and check the mark sits on
  the target.
- **A label over the thing it names**, or over text the person needs to read.
- **A crop so loose the target is a speck**, or so tight the person cannot tell where it is.
- **Several marks for several points.** Show one picture per point.
