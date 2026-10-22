# show-me

A mod for [Claude Code](https://claude.com/claude-code) that lets Claude **explain with
pictures inside the conversation**. When a picture makes the point faster than a
paragraph, Claude composes one and shows it inline, next to the words about it: part of
a screen with the thing it means marked, two versions side by side, a flow step by step,
a diagram of how something works, the shape of a few numbers. You never switch to a
browser or an image viewer to follow along.

The pictures are not screenshots passed along. Claude writes each one as HTML or SVG,
in whatever form serves the point, and the mod renders it and draws it in your terminal.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install show-me --marketplace nicolopignatelli/claude-code-show-me
```

Answer `y` to add the marketplace, then press Enter to install at the user scope. The mod
is active right away, with no restart, and in every session you start after that.

From a shell instead:

```
claude plugin install show-me --marketplace nicolopignatelli/claude-code-show-me
```

In the Claude desktop app, where `/plugin` does not run: click **+** next to the prompt
box, then **Plugins**, **Add marketplace** with `nicolopignatelli/claude-code-show-me`,
then **Add plugin**.

**What it needs:**

- **Google Chrome or Chromium**, to render the pictures Claude composes. The mod finds
  it in its usual install location on macOS and Windows, or as `google-chrome` or
  `chromium` on your PATH. Without it, Claude can still show existing PNG files.
- **A terminal that draws pictures**: one with the kitty graphics protocol (kitty,
  Ghostty), or iTerm2 3.5 or later with fullscreen rendering. tmux blocks pictures.

## Using it

You don't call it yourself. The mod gives Claude a tool, `show`, and a skill that
teaches it when a picture beats prose and how to make a good one. You can also ask
directly:

- "Show me which button you mean."
- "Compare the header on desktop and on a phone."
- "Draw how the checkout creates the account."
- "Chart the sign-ups per week for the last three months."

## The forms

The skill teaches eight forms, each with a template Claude adapts:

| Form | When |
|---|---|
| **Quote** | one part of a screen, the thing meant marked: outline, spotlight, underline, arrow |
| **Compare** | two states at the same scale, the difference marked on both |
| **Zoom** | a detail magnified beside its context, joined by guide lines |
| **Sequence** | states in order, the action marked on each: a flow, steps to reproduce |
| **Diagram** | drawn from nothing: architecture, data flow, a state machine |
| **Proposal overlay** | a suggested change drawn onto the real screen, marked as a proposal |
| **Contact sheet** | many variants in a grid with named axes: breakpoints, themes, languages |
| **Chart** | a few numbers when their shape is the point |

Every picture follows the same rules: one point per picture, said by its caption; one
accent colour for marks; text readable at the size shown; marks placed from looking at
the source, or from the real positions of elements when the source is a live page; and
Claude reads back each rendered picture to check it before talking about it.

## What you see

| Where you run Claude Code | What you see |
|---|---|
| A terminal that draws pictures | The picture and its caption, nothing else. While it renders, a one-line summary |
| Any other terminal | The caption, and a line saying ctrl+o shows where the file is |
| The desktop app, VS Code | Diagrams and charts drawn natively as vectors; for anything else, the caption |

Press **ctrl+o** for the full tool call and its result, including the paths of the
rendered PNG and of the HTML or SVG source.

**Sizes.** Claude picks how much room a picture takes: `small` (about 40% of the
terminal's width) for a detail, `medium` (about 70%) for a section, `large` (the full
width) for a whole screen or anything that runs wide. Pictures render at up to twice the
pixel density, so they stay sharp at full width.

## What it writes

Each picture writes a few files to `show-me/` in your system's temp folder (`$TMPDIR` or
`%TEMP%`), named after the tool call: the HTML or SVG source, the rendered PNG, the inline
copy the transcript draws again when you scroll back or resume, and a small JSON for the
transcript row.

The mod sends nothing anywhere. Chrome renders the markup from that temp folder and loads
only what the markup itself references. Your operating system clears its temp folder on
its own schedule.

## Limits

- **Pictures off the terminal are best effort.** The desktop app and VS Code have no way
  to draw a raster picture from a mod, so a picture built on a screenshot shows its
  caption there.
- **Files up to 4 MiB**, the most a mod can read at once.
- **The mod API is early access.** This version was built with Claude Code 2.1.308, and
  the API may change between releases.

## Development

```
git clone https://github.com/nicolopignatelli/claude-code-show-me
cd claude-code-show-me
claude --plugin-dir .          # a session with the mod loaded from this folder; edits reload it
claude plugin test .           # the tests in test/, run in Claude Code's mod runtime
claude plugin validate .       # what Claude Code reads from the manifest, hooks and marketplace
```

Once a session has loaded the mod, Claude Code writes its type declarations to
`.claude-plugin/types/`, and `tsc -p .` type-checks the mod against them.

| File | What it does |
|---|---|
| `hooks/register.tsx` | Registers the `show` tool, renders markup with Chrome, and draws the picture as the call's row |
| `hooks/png.ts` | PNG decode, encode and shrink by area averaging |
| `hooks/lib/fflate.js` | [fflate](https://github.com/101arrowz/fflate) 0.8.2, unmodified (MIT, see `hooks/lib/fflate.LICENSE`) |
| `skills/show-me/SKILL.md` | When to show a picture, how to call `show`, the rules every picture follows |
| `skills/show-me/forms/` | One file per form: when it fits, its template, the mistakes to avoid |
| `DESIGN.md` | The design of record |

## License

MIT, see [LICENSE](LICENSE). Bundles fflate 0.8.2 by Arjun Barrett, also MIT.
