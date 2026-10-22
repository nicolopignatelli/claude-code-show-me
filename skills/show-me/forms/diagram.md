# Diagram

A structure drawn from nothing: boxes for the parts, arrows for what moves between them.

**Use it when** there is no screen to show: architecture, a data flow, who calls whom, a
state machine, a timeline. **Not when** the point is about what the person sees on a
screen (Quote, Sequence).

## Composing it

- **Read the real thing first.** A diagram of code is drawn from the code you just read,
  not from memory or names: every box and arrow maps to a function, a route, a service, a
  message that exists.
- **Lanes for actors.** When several systems take part (the browser, the backend, a
  payment provider, an identity provider), give each a column with its name on top, and
  put each step in the lane of whoever does it. The eye then reads who does what without
  labels saying so.
- **Top to bottom is time**; left to right is who. Keep arrows short and straight;
  route around boxes with right angles rather than crossing them.
- **Box text: a name and what it does.** Line one is the thing (a route, a function, a
  screen), line two what it does here, in plain words.
- **One accent**: the box or arrow the point is about gets the accent border; everything
  else stays neutral.
- **Draw it as `svg`**: pure vectors, crisp at any size, and it draws outside the
  terminal too.

## Template

Coordinates are canvas pixels (the `viewBox` equals `width` × `height`). Boxes 64 tall;
16-px text minimum; code names in the monospace stack.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 HEIGHT">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#8E8E93"/>
    </marker>
  </defs>
  <style>
    text { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; font-size: 16px; fill: #1C1C1E; }
    .lane { font-weight: 600; fill: #6E6E73; }
    .divider { stroke: #E5E5EA; stroke-width: 1; }
    .box { fill: #FFFFFF; stroke: #D1D1D6; stroke-width: 1.5; }
    .focus { fill: #FFFFFF; stroke: #E5484D; stroke-width: 2.5; }
    .name { font-weight: 600; }
    .code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-weight: 600; font-size: 15px; }
    .does { fill: #6E6E73; }
    .flow { stroke: #8E8E93; stroke-width: 1.75; fill: none; marker-end: url(#arrow); }
    .soft { stroke-dasharray: 5 5; }
    .note { fill: #6E6E73; }
  </style>
  <rect width="100%" height="100%" fill="#F5F5F7"/>

  <!-- Lanes: a header per actor, a divider between them. -->
  <text class="lane" x="LANE_CX" y="48" text-anchor="middle">Actor</text>
  <line class="divider" x1="DIV_X" y1="64" x2="DIV_X" y2="HEIGHT-24"/>

  <!-- A box: name on line one, what it does on line two. -->
  <rect class="box" x="X" y="Y" width="W" height="64" rx="10"/>
  <text class="name" x="X+W/2" y="Y+27" text-anchor="middle">Name</text>
  <text class="does" x="X+W/2" y="Y+49" text-anchor="middle">what it does here</text>

  <!-- Arrows: straight, or right-angled around boxes; dashed for "not a call". -->
  <line class="flow" x1="…" y1="…" x2="…" y2="…"/>
  <path class="flow" d="M… H… V… H…"/>
  <text class="note" x="…" y="…">a short label, where there is room</text>
</svg>
```

Write the numbers in. Leave at least 40 px between boxes so arrows have room.

## Mistakes to avoid

- **Boxes that do not exist in the code**, or names changed to sound tidier.
- **Arrows crossing boxes** or each other, when a right-angled route would not.
- **Every box accented**, so nothing is.
- **Text that runs out of its box**: count the characters (about 8.5 px each at 16 px,
  9.5 in monospace) before choosing the box width.
