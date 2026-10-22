# show-me — design

Status: agreed and built 2026-10-22; every form tried on a real case. This is the design
of record: a change to the mod's behaviour starts here.

## Goal

Claude explains things visually inside the conversation: it composes the picture that makes
its point (a quote of a screen, a comparison, a diagram drawn from nothing) and shows it
inline, next to the words about it. You never switch to a browser to follow along.

The mod is not a screenshot viewer. A screenshot is one ingredient a picture may use.

## The split

- **The mod** does the one thing only a mod can: put a picture into the transcript at a
  chosen size, on every surface.
- **A skill** shipped with the mod carries the visual vocabulary: when a picture beats
  prose, the forms that work, a template per form, how to place things precisely.
- **Claude** authors every picture as HTML or SVG, in whatever style serves the point.
  Crop, boxes, arrows, highlights are a few lines of markup, not features of the mod.

## The tool

`show({ html | svg | png, size, caption })`, exactly one of the three sources.

The target is **Claude Code in the terminal**. Other surfaces (the Claude desktop app, VS
Code, mobile) are best effort.

| Source | Terminal (kitty graphics) | Other surfaces, best effort |
|---|---|---|
| `html` | rendered by Chrome headless to PNG, drawn as `Image` | the caption |
| `svg` | rendered by Chrome headless to PNG, drawn as `Image` | native `Svg` element when the markup fits 131,072 characters, and the caption |
| `png` | drawn as `Image`, shrunk to fit the Image limit | the caption |

Remote surfaces have no `Image`, only `Svg`, so a picture built on a screenshot cannot be
drawn there; diagrams and charts, being pure vectors, can.

- **One call per picture.** Rendering Claude's own composition is the loop every picture
  goes through, so it cannot cost several browser-tool calls.
- **The result returns the rendered PNG's path**, so Claude can read it and check the
  picture before talking about it.
- **Size**: a share of the terminal's width and a row cap, the picture keeping its
  aspect inside: `small` (about 40%, 12 rows) for a detail, `medium` (about 70%, 24 rows,
  the default) for a section, `large` (the full width, up to 255 columns, 40 rows) for a
  whole screen or anything that runs wide. Markup renders at up to 2× and the inline PNG
  keeps up to 2560 pixels, so a full-width picture stays sharp.
- **Caption**: one line under the picture, the point it makes.
- **The row is the picture**: once drawn, the call's transcript row shows the picture and
  its caption alone; while it renders, a one-line summary (`html: 1200×630, size: …`).
  ctrl+o shows the full call and the result with the rendered PNG's and the source's
  paths. Where a terminal cannot draw pictures, the placeholder points there.
- Files go to `show-me/` in the system temp folder, named after the tool call: the source,
  the rendered PNG, a small JSON the transcript row draws from.

Carried over from inline-images: PNG decode/encode/shrink (`png.ts`, fflate) and the sized
`Image` drawing. Nothing else.

**Dependency**: Chrome or Chromium, for `html`/`svg` in the terminal only. `png` works
without it. Without Chrome, `show` says so and names the way out (pass a PNG).

## Out of scope

- An annotation schema or a fixed overlay style.
- A rasterizer of our own (the mod runtime has no WebAssembly; a pure-JS one is a project
  of its own, only if Chrome proves a real barrier).
- A pane, page capture, live browsing: the chrome-devtools tools already do those.

## The skill's shape

One skill, `show-me`, with progressive disclosure inside it rather than a main skill plus
subskills:

- `SKILL.md` (~100 lines): when a picture beats prose, how to call `show`, the rules every
  form follows, and an index of the forms, one line each saying when to use it.
- `forms/<form>.md`, one per form: when it fits, its template (HTML or SVG), how to adapt
  it, the mistakes to avoid. Claude reads only the form it is about to draw.

Why not subskills: every skill's description sits in every session's context and competes
for triggering; eight form skills would cost that always and trigger on their own words
("compare", "chart", "diagram") in conversations that never wanted a picture. One skill
triggers on the intent to show something; the forms are files it reads. Splitting is
worth revisiting only if one form grows big enough to be useful without the rest.

## Forms (the skill)

Agreed 2026-10-22. Each form is a short HTML/SVG template in the skill, adapted per picture,
and each is tried on a real case before the skill ships.

1. **Quote** — part of a screen, the thing meant marked in the style the point needs:
   spotlight (rest dimmed), underline, outline, a label in real text beside it.
2. **Compare** — two pictures at the same scale, side by side or stacked, each labelled, the
   difference marked on both. A/B, before/after, ours vs theirs.
3. **Zoom** — a detail magnified beside its context, guide lines joining the two.
4. **Sequence** — states in order, joined left to right, a short caption each: a flow, a
   screen over time, steps to reproduce.
5. **Diagram** — drawn from nothing: architecture, data flow, state machine, timeline.
6. **Proposal overlay** — a change drawn onto the real screen: a ghost element where one
   would go, a block outlined where it would move.
7. **Contact sheet** — many pictures in one grid: breakpoints, languages, component states.
8. **Chart** — a few numbers as a small bar or line chart when their shape is the point;
   follows a `dataviz` skill when the session has one, else the template's own few rules
   (other people installing the mod may not have it).

Rules for every form: one point per picture, stated by the caption; one accent colour for
marks; text inside the picture readable at the chosen size; marks placed by looking at the
source, or from real element positions (chrome-devtools `evaluate_script`) for a live page.

## Open questions

1. **Fonts.** Chrome renders with the machine's fonts; the skill should name a font stack
   that exists on macOS, Linux and Windows so pictures look alike everywhere.
