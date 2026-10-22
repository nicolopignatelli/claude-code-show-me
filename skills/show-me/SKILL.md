---
name: show-me
description: Explain with a picture inline in the conversation instead of asking the person to open something. Use whenever a picture would make your point faster than prose - quoting part of a screen or screenshot, comparing two states, magnifying a detail, walking through a flow, drawing a structure or data flow, proposing a change on a real screen, laying out many variants side by side, or showing the shape of a few numbers. You compose the picture as HTML or SVG and the show tool draws it in the terminal.
---

# Showing things with pictures

You can put a picture in the conversation with the `show` tool (`mcp__show-me__show`). Use
it when the person would otherwise have to open a browser, a file or an image viewer to
follow you, or when a sentence like "the second button from the left, under the header"
is doing the work a picture does better.

A picture is a composition you make for the point, not a screenshot you pass along. A
screenshot is one ingredient: crop it, mark it, set it beside another, magnify part of it.
Or draw from nothing when there is no screen to show.

## The loop

1. **Know the point.** One sentence: what should the person see? That sentence becomes the
   caption. If you cannot say it, you do not need a picture yet.
2. **Pick the form** from the list below and read its file in `forms/` for the template.
3. **Gather the ingredients**: screenshots as PNG files on disk (take them with a browser
   tool when the source is a page; for a phone, use the tool's device emulation, since a
   narrow headless window can lay a page out wider than it is), their pixel sizes
   (`file shot.png` prints them), and any numbers or names the picture carries.
4. **Compose** the HTML or SVG from the template, adapted to this point.
5. **Show it**: `show({ html, width, height, size, caption })`.
6. **Check it**: read the rendered PNG the result names. If a mark misses, a label
   overlaps or text is too small to read, fix the markup and show it again before you
   talk about it.

## Forms

| Form | Use it when | File |
|---|---|---|
| Quote | you mean one part of a screen and want the person to see exactly which | `forms/quote.md` |
| Compare | two states differ and the difference is the point: A/B, before/after, ours vs theirs | `forms/compare.md` |
| Zoom | a detail is too small to see in context, but where it sits matters too | `forms/zoom.md` |
| Sequence | the point is an order: a flow, a screen changing over time, steps to reproduce | `forms/sequence.md` |
| Diagram | there is no screen: architecture, data flow, a state machine, a timeline | `forms/diagram.md` |
| Proposal overlay | you suggest a change and want it seen on the real screen | `forms/proposal-overlay.md` |
| Contact sheet | many variants at once: breakpoints, languages, states of one component | `forms/contact-sheet.md` |
| Chart | a few numbers, where their shape (a jump, a trend, a gap) is the point | `forms/chart.md` |

## The tool

- **`html`**: a whole HTML document drawn in a `width` × `height` CSS-pixel window. The
  window is the picture: lay the page out to fill it exactly, `margin: 0` on the body.
- **`svg`**: an SVG document drawn to fill `width` × `height`. Prefer it for diagrams and
  charts: it also draws as crisp vectors outside the terminal. A picture that holds a
  screenshot goes as `html` (an inline `<svg>` inside is fine): outside the terminal a
  screenshot cannot be drawn, and `html` falls back to the caption cleanly.
- **`png`**: a path to an existing PNG, shown as it is. Use it only when the picture
  already makes the point unchanged.
- **Images** inside markup are referenced by absolute path: `<img src="/Users/me/shot.png">`.
  The markup is rendered from a temp folder, so a relative path finds nothing.
- **`size`**: a share of the terminal's width. `small` (about 40%) for a detail or a few
  lines, `medium` (about 70%, the default) for a section, `large` (the full width) for a
  whole screen the person should read or any picture that runs wide.
- **`caption`**: the point, in one line.

## Rules for every picture

- **One point per picture.** Two points are two pictures.
- **Canvas width**: about 1200 CSS pixels for `medium` and `large`, about 700 for `small`.
  The height follows the content; leave no empty band.
- **Text you add is readable at the size shown**: at least 16 px for labels and body text
  on a 1200-px canvas, 20 px on a 700-px one. If a screenshot's own text must be read,
  crop tighter rather than shrinking it.
- **Fonts**: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`; code in
  `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`.
- **One accent colour for marks**, `#E5484D`, with a 2-px white halo where it sits on a
  screenshot so it stays visible on any background. Ink `#1C1C1E`, muted text `#6E6E73`,
  canvas background `#F5F5F7`, surfaces `#FFFFFF`.
- **Labels are words beside the thing**, not numbers pointing to a legend, unless there
  are more than four marks.
- **Place marks from what you see.** Overlay in the screenshot's own pixel coordinates
  (an SVG with `viewBox="0 0 <pixel width> <pixel height>"` over the image) and read the
  positions off the image. For a live page, take positions from the page itself: the
  browser tool's script evaluation gives `getBoundingClientRect()` in CSS pixels; multiply
  by the screenshot's device pixel ratio.
- **No decoration.** No shadows, gradients, icons or titles that do not carry the point.
