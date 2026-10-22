# Contact sheet

Many variants of one thing in a grid, so the person scans them all at once and sees which
one breaks the pattern.

**Use it when** the question is "does it hold across all of them?": breakpoints, themes,
languages, the states of one component, the same screen for several users. **Not when**
there are two or three variants and the difference between them is the point (Compare).

## Composing it

- **A grid with named axes.** Rows for one dimension, columns for the other (themes ×
  widths, languages × states), each with a header. A single dimension is one row.
- **One shared scale** when sizes matter (breakpoints): each cell is its capture at the
  same CSS-pixel scale, so a phone looks as narrow next to a desktop as it is. Equal cell
  sizes only when the variants are the same size anyway.
- **Same state in every cell**: the same page, the same scroll, the same data, banners
  the same. Capture them in one browser session, changing only the axis. Content that
  rotates on its own (a carousel, a random hero) will differ: say so rather than mark it.
- **Mark only the outlier**, the same way in every cell where it occurs, and say what it
  is in one note; the cells that hold need no marks.
- **Let the cells be small.** A contact sheet shows structure, not text; when a cell's
  text matters, follow it with a Quote or a Zoom of that cell.

## Template

One outer SVG in canvas pixels; each cell a nested SVG at its scaled size, `viewBox` its
capture in screenshot pixels. Marks inside a cell are in screenshot pixels: for a cell
drawn at scale `s` of a capture with device pixel ratio `r`, `k = r / s`, stroke `3k`.

```html
<!doctype html>
<meta charset="utf-8">
<style>
  html, body { margin: 0; background: #F5F5F7; }
  svg.canvas { display: block; width: 100vw; height: 100vh; }
  text { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; font-size: 16px; }
  .axis { font-weight: 600; fill: #1C1C1E; }
  .axis-sub { fill: #6E6E73; }
  .cell { fill: none; stroke: #D1D1D6; stroke-width: 1; }
  .halo { fill: none; stroke: #FFFFFF; }
  .mark { fill: none; stroke: #E5484D; }
  .note { font-weight: 600; fill: #E5484D; }
</style>
<svg class="canvas" viewBox="0 0 WIDTH HEIGHT">
  <!-- Column headers, row headers. -->
  <text class="axis" x="COL_X" y="44">Column <tspan class="axis-sub">· detail</tspan></text>
  <text class="axis" x="32" y="ROW_Y+16">Row</text>

  <!-- One cell. -->
  <svg x="COL_X" y="ROW_Y" width="CELL_W" height="CELL_H" viewBox="0 0 FULL_W FULL_H">
    <image href="/absolute/path/variant.png" width="FULL_W" height="FULL_H"/>
    <rect class="halo" x="…" y="…" width="…" height="…" rx="…" stroke-width="7k"/>
    <rect class="mark" x="…" y="…" width="…" height="…" rx="…" stroke-width="3k"/>
  </svg>
  <rect class="cell" x="COL_X" y="ROW_Y" width="CELL_W" height="CELL_H"/>

  <!-- The outlier, in words, under its column. -->
  <text class="note" x="COL_X" y="…">What breaks here</text>
</svg>
```

Write the numbers in. Width near 1200: pick the shared scale from the widest row
(`s = (1200 − headers − gaps − 64) / sum of the row's CSS widths`).

## Mistakes to avoid

- **Mixed scales across cells** on a breakpoint sheet: the narrow screen no longer looks
  narrow.
- **Marks on every cell**, so the outlier does not stand out.
- **Unlabelled axes**: the person cannot tell which cell is which.
- **A difference you did not cause** (rotating content, a different scroll position) left
  unexplained, so it reads as the finding.
