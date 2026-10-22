# Chart

A few numbers drawn so their shape shows: a jump, a trend, a plateau, a gap.

**Use it when** the shape is the point and a sentence of numbers would hide it. **Not
when** one number is the point (say it), or there are so many series that the picture
needs a dashboard.

If the session has a `dataviz` skill, load it before drawing and follow it: its rules
win over these. The rules below are the minimum for when it is not there.

## Getting the numbers

- **From the source, read-only**, with the query or command that produced them at hand:
  the person may ask how a bar was counted.
- **Say what the period is** (weeks Monday to Sunday, days in which time zone) and mark
  an **incomplete period** (the current week so far) differently, so a short last bar
  does not read as a collapse.
- **Count what you name**: if the source holds test or internal rows you could not
  exclude, say so under the chart.

## Drawing it

- **Form**: bars for counts per period, a line for a continuous measure over time, one
  axis only (two measures of different scale are two charts).
- **One series, one colour** (`#2a78d6`), no legend: the title names it. Several series:
  a fixed order of distinct hues, a legend, and direct labels on at most four.
- **Bars at most 24 px wide**, rounded only at the top (4 px), square on one shared
  baseline; the band's leftover is air.
- **A recessive grid**: three or four light gridlines, small muted axis labels.
- **Labels, not a number on every bar**: annotate the shape that is the point (a bracket
  over a plateau with "about 22 a week", the drop in the accent), plus the partial
  period. Text stays in ink colours, never the data colour.
- **The incomplete period** hatched at 45° with a "so far" label.
- **Draw it as `svg`**, and generate the geometry with a short script rather than by
  hand: bar heights are arithmetic, and arithmetic by eye drifts.

## Template

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 520">
  <defs>
    <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="6" height="6" fill="#d6e4f7"/>
      <line x1="0" y1="0" x2="0" y2="6" stroke="#2a78d6" stroke-width="2"/>
    </pattern>
  </defs>
  <style>
    text { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; font-size: 16px; fill: #1C1C1E; }
    .title { font-weight: 600; }
    .muted { fill: #6E6E73; }
    .axis { fill: #6E6E73; font-size: 15px; }
    .grid { stroke: #E5E5EA; stroke-width: 1; }
    .base { stroke: #8E8E93; stroke-width: 1; }
    .accent { fill: #E5484D; font-weight: 600; }
  </style>
  <rect width="1200" height="520" fill="#fcfcfb"/>
  <text class="title" x="80" y="40">What is counted, per period</text>
  <text class="muted" x="80" y="64">The period, the window, the source</text>

  <!-- Gridlines with their values; baseline last, over the bars' feet. -->
  <line class="grid" x1="80" y1="Y(v)" x2="1160" y2="Y(v)"/>
  <text class="axis" x="68" y="Y(v)+5" text-anchor="end">v</text>

  <!-- A bar: square at the baseline, 4-px rounded top. -->
  <path d="M x,BASE V t+4 Q x,t x+4,t H x+20 Q x+24,t x+24,t+4 V BASE Z" fill="#2a78d6"/>
  <text class="axis" x="x+12" y="BASE+26" text-anchor="middle">Period</text>

  <!-- An annotation: a bracket over the bars it describes, the words above it. -->
  <path d="M a,yy+8 V yy H b V yy+8" fill="none" stroke="#8E8E93" stroke-width="1.5"/>
  <text class="muted" x="(a+b)/2" y="yy-10" text-anchor="middle">about N a week</text>
</svg>
```

## Mistakes to avoid

- **A partial period drawn like a full one**, so it reads as a fall.
- **Annotations sitting on gridlines**: move the words between lines.
- **A number on every bar**, or the data colour used for text.
- **A conclusion about why**: the chart shows the shape; a cause needs its own evidence.
