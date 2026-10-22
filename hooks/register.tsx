import type { EngineInterface, Register } from 'claude-code'
import { decodePng, encodePng, pngSize, shrink, UnsupportedImage } from './png.ts'

const TOOL = 'mcp__show-me__show'

// The inline picture is at most 255 terminal cells wide; 2560 pixels keeps it
// sharp at that width, and the PNG is shrunk further if it passes the 2 MiB an
// Image accepts.
const INLINE_MAX = { width: 2560, height: 3200 }
const IMAGE_MAX_BYTES = 2 * 1024 * 1024

// A terminal cell is about twice as tall as it is wide.
const CELL_ASPECT = 2

// The most room a picture takes in the transcript, per size: a share of the
// terminal's width and a number of rows. The picture keeps its aspect inside
// that box, so one of the two limits is usually not reached.
const SIZES = {
  small: { share: 0.4, rows: 12 },
  medium: { share: 0.7, rows: 24 },
  large: { share: 1, rows: 40 },
} as const
const IMAGE_MAX_COLUMNS = 255
// Columns kept free beside the picture, and rows kept free for the prompt
// and the lines around it.
const MARGIN = { columns: 4, rows: 8 }
type Size = keyof typeof SIZES

// Markup is rendered at up to twice the pixel density, and never denser than
// the inline picture keeps, so the PNG Claude reads back is the one shown.
const MAX_SCALE = 2
// Chrome takes the page as loaded once this much virtual time passes with no
// pending request, so images and scripts have run before the screenshot.
const RENDER_SCRIPT_BUDGET_MS = 5000
const RENDER_TIMEOUT_MS = 60_000

// Absolute paths are checked on disk; bare names are looked up on PATH.
const CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
]
const CHROME_COMMANDS = ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']

// The most an Svg element takes on the desktop app, VS Code and mobile.
const SVG_MAX_CHARACTERS = 131_072

// Drawn instead of the picture where the terminal cannot show one, right
// above the caption, so it says what to do rather than repeating the caption.
const NO_PICTURE = "This terminal can't draw pictures; ctrl+o shows where the file is."

type Kind = 'html' | 'svg' | 'png'

type ShowInput = {
  html?: string
  svg?: string
  png?: string
  width?: number
  height?: number
  size?: Size
  caption?: string
}

/** What the tool leaves beside its files for the transcript row to draw from. */
type Shown = {
  kind: Kind
  /** The file the person can open: the HTML or SVG as Claude wrote it, or the PNG shown. */
  sourcePath: string
  /** The CSS pixels markup was drawn in; absent for a PNG. */
  canvas?: { width: number; height: number }
  inline: { width: number; height: number }
  size: Size
  caption?: string
}

const DESCRIPTION = `Show the person a picture inline in the conversation: one you compose to make your point, or an existing PNG. Load the show-me skill before composing a picture: it holds the forms that work (quote, compare, zoom, sequence, diagram, proposal overlay, contact sheet, chart) and a template for each.

Give exactly one source:
- html: a whole HTML document, drawn in a window of width x height CSS pixels. Reference local images by absolute path (src="/Users/me/shot.png").
- svg: an SVG document, drawn to fill width x height CSS pixels.
- png: the path of a PNG file, shown as it is.

Markup is rendered with the machine's Chrome. The result gives the rendered PNG's path: read it to check the picture before you talk about it.

Pick the size for what you show: small for a detail or a few lines, medium (the default) for a section, large for a whole screen the person should read. The caption is one line under the picture: the point it makes.`

const INPUT_SCHEMA = {
  type: 'object',
  properties: {
    html: { type: 'string', description: 'A whole HTML document. Give this, svg or png.' },
    svg: { type: 'string', description: 'An SVG document. Give this, html or png.' },
    png: { type: 'string', description: 'A PNG file, absolute or relative to the working directory. Give this, html or svg.' },
    width: { type: 'integer', minimum: 16, maximum: 4000, description: 'The width markup is drawn in, in CSS pixels; required with html or svg.' },
    height: { type: 'integer', minimum: 16, maximum: 4000, description: 'The height markup is drawn in, in CSS pixels; required with html or svg.' },
    size: {
      type: 'string',
      enum: Object.keys(SIZES),
      description: 'How much room the picture takes in the conversation: small, medium (the default) or large.',
    },
    caption: { type: 'string', description: 'One line under the picture: the point it makes.' },
  },
}

const outputDir = async ($: EngineInterface) => {
  const temp = (await $.env.get('TMPDIR')) ?? (await $.env.get('TEMP')) ?? '/tmp'
  return `${temp.replace(/[\\/]+$/, '')}/show-me`
}

// The page Chrome opens: a file:// URL, absolute on every platform.
const fileUrl = (path: string) => {
  const slashed = path.replace(/\\/g, '/')
  return `file://${slashed.startsWith('/') ? '' : '/'}${encodeURI(slashed)}`
}

const reason = (error: unknown) => (error instanceof Error ? error.message : String(error))

// Found once per module load: the first installed path, else the first PATH
// command that answers --version.
let chrome: string | undefined
const findChrome = async ($: EngineInterface) => {
  if (chrome) return chrome
  for (const path of CHROME_PATHS) {
    if (await $.fs.exists(path)) return (chrome = path)
  }
  for (const command of CHROME_COMMANDS) {
    const answered = await $.process.run([command, '--version']).catch(() => undefined)
    if (answered?.exitCode === 0) return (chrome = command)
  }
  return undefined
}

// An SVG fills the window whatever its own width and height say.
const svgPage = (svg: string) =>
  `<!doctype html><meta charset="utf-8"><style>html,body{margin:0}svg{display:block;width:100vw;height:100vh}</style>${svg}`

/** The PNG as the Image takes it: as it is when it fits, else shrunk until it does. */
const inlinePng = (base64: string) => {
  const bytes = Uint8Array.fromBase64(base64)
  const size = pngSize(bytes)
  if (
    size &&
    size.width <= INLINE_MAX.width &&
    size.height <= INLINE_MAX.height &&
    bytes.length <= IMAGE_MAX_BYTES
  ) {
    return { base64, ...size }
  }
  const source = decodePng(bytes)
  let scale = Math.min(1, INLINE_MAX.width / source.width, INLINE_MAX.height / source.height)
  for (;;) {
    const width = Math.max(1, Math.round(source.width * scale))
    const height = Math.max(1, Math.round(source.height * scale))
    const png = encodePng(shrink(source, width, height))
    if (png.length <= IMAGE_MAX_BYTES) return { base64: png.toBase64(), width, height }
    scale *= 0.75
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.tool.register({ name: 'show', description: DESCRIPTION, inputSchema: INPUT_SCHEMA, isDeferred: false })
    return next(e)
  })

  on('tool.call', { tool: TOOL }, async ($, e) => {
    const input = e as unknown as ShowInput & { tool_use_id: string }
    const sources = (['html', 'svg', 'png'] as const).filter(kind => input[kind] !== undefined)
    if (sources.length !== 1) return { deny: 'Give exactly one of html, svg or png.' }
    const kind = sources[0]
    const dir = await outputDir($)
    const id = input.tool_use_id

    let sourcePath: string
    let renderedPath: string
    let canvas: Shown['canvas']
    if (kind === 'png') {
      const stat = await $.fs.stat(input.png!, { resolve: true }).catch((error: unknown) => reason(error))
      if (typeof stat === 'string') return { deny: `Could not find ${input.png}: ${stat}` }
      sourcePath = stat.realPath ?? input.png!
      renderedPath = sourcePath
    } else {
      if (input.width === undefined || input.height === undefined) {
        return { deny: `Give the width and height the ${kind} is drawn in, in CSS pixels.` }
      }
      canvas = { width: input.width, height: input.height }
      const browser = await findChrome($)
      if (!browser) {
        return { deny: 'No Chrome or Chromium found to render the markup. Install Google Chrome, or render the picture to a PNG some other way and show it as png.' }
      }
      sourcePath = `${dir}/${id}.${kind}`
      renderedPath = `${dir}/${id}.png`
      await $.fs.write(sourcePath, kind === 'html' ? input.html! : input.svg!)
      const pagePath = kind === 'html' ? sourcePath : `${dir}/${id}.svg.html`
      if (kind === 'svg') await $.fs.write(pagePath, svgPage(input.svg!))
      const scale = Math.min(MAX_SCALE, INLINE_MAX.width / canvas.width, INLINE_MAX.height / canvas.height)
      const ran = await $.process
        .run(
          [
            browser,
            '--headless',
            '--disable-gpu',
            '--hide-scrollbars',
            `--force-device-scale-factor=${scale}`,
            `--window-size=${canvas.width},${canvas.height}`,
            `--virtual-time-budget=${RENDER_SCRIPT_BUDGET_MS}`,
            `--screenshot=${renderedPath}`,
            fileUrl(pagePath),
          ],
          { timeoutMs: RENDER_TIMEOUT_MS },
        )
        .catch((error: unknown) => reason(error))
      if (typeof ran === 'string') return { deny: `Chrome did not finish rendering the ${kind}: ${ran}` }
      if (ran.exitCode !== 0) return { deny: `Chrome could not render the ${kind} (exit ${ran.exitCode}): ${ran.stderr.slice(-500)}` }
    }

    const file = await $.fs.read(renderedPath, { as: 'bytes' }).catch((error: unknown) => reason(error))
    if (typeof file === 'string') {
      return { deny: `Could not read ${renderedPath}: ${file}. A file over 4 MiB cannot be read; make the picture smaller first.` }
    }
    let inline
    try {
      inline = inlinePng(file.base64)
    } catch (error) {
      if (!(error instanceof UnsupportedImage)) throw error
      return { deny: `Cannot show ${renderedPath}: ${error.message}. Convert it to an 8-bit PNG first.` }
    }

    const size = input.size ?? 'medium'
    const shown: Shown = {
      kind,
      sourcePath,
      canvas,
      inline: { width: inline.width, height: inline.height },
      size,
      caption: input.caption,
    }
    await $.fs.write(`${dir}/${id}.png.b64`, inline.base64)
    await $.fs.write(`${dir}/${id}.json`, JSON.stringify(shown))

    const sourceNote = kind === 'png' ? '' : ` Source: ${sourcePath}.`
    return {
      result: `Shown to the person inline, ${size} (${inline.width}x${inline.height} pixels). Rendered picture: ${renderedPath}.${sourceNote}`,
    }
  }).catch(($, e, next) => ({
    deny: `show-me could not show the picture (${next.error.kind}${next.error.message ? `: ${next.error.message}` : ''}).`,
  }))

  // The call's row is the picture: while the call runs it names the source and
  // its canvas instead of printing the markup; once drawn it is the picture and
  // its caption alone. ctrl+o shows the call and its result in full, file
  // paths included.
  on('ui.render', { component: 'ToolUse', props: { tool: TOOL } }, async ($, e, next) => {
    if (e.props.isExpanded || e.props.isErrored || e.props.isInterrupted) return next(e)
    const dir = await outputDir($)
    const id = e.props.tool_use_id
    const shown = e.props.isRunning
      ? undefined
      : await $.fs
          .read(`${dir}/${id}.json`)
          .then(text => JSON.parse(text) as Shown)
          .catch(() => undefined)
    if (!shown) {
      const input = e.props.input as ShowInput
      const canvas = `${input.width}×${input.height}`
      const summary = {
        ...(input.html !== undefined ? { html: canvas } : {}),
        ...(input.svg !== undefined ? { svg: canvas } : {}),
        ...(input.png !== undefined ? { png: input.png } : {}),
        ...(input.size !== undefined ? { size: input.size } : {}),
        ...(input.caption !== undefined ? { caption: input.caption } : {}),
      }
      return next({ ...e, props: { ...e.props, input: summary } })
    }

    const caption = shown.caption ? [shown.caption] : []

    if (e.surface === 'terminal') {
      const { Box, Text, Image } = $.ui.resolve(e)
      const png = await $.fs.read(`${dir}/${id}.png.b64`).catch(() => undefined)
      const { width, height } = shown.inline
      const room = SIZES[shown.size]
      const free = Math.max(10, (e.viewport?.columns ?? 80) - MARGIN.columns)
      const maxRows = Math.min(room.rows, Math.max(8, (e.viewport?.rows ?? room.rows + MARGIN.rows) - MARGIN.rows))
      let columns = Math.min(IMAGE_MAX_COLUMNS, Math.max(10, Math.round(free * room.share)))
      let rows = Math.max(1, Math.round((columns * height) / width / CELL_ASPECT))
      if (rows > maxRows) {
        rows = maxRows
        columns = Math.max(1, Math.round((rows * CELL_ASPECT * width) / height))
      }
      return (
        <Box flexDirection="column">
          {png ? <Image source={{ png }} columns={columns} rows={rows} alt={NO_PICTURE} /> : null}
          {caption.map(line => (
            <Text>{line}</Text>
          ))}
        </Box>
      )
    }

    // Remote surfaces have no Image; an SVG that fits is drawn as vectors there,
    // anything else leaves the caption alone.
    const { Box, Text, Svg } = $.ui.resolve(e)
    const svg =
      shown.kind === 'svg' ? await $.fs.read(shown.sourcePath).catch(() => undefined) : undefined
    return (
      <Box flexDirection="column">
        {svg && svg.length <= SVG_MAX_CHARACTERS ? (
          <Svg source={svg} alt={shown.caption ?? 'A picture Claude drew'} width={shown.canvas?.width} />
        ) : null}
        {caption.map(line => (
          <Text>{line}</Text>
        ))}
      </Box>
    )
  })

  // The call's row draws the picture, so the result block under it stays empty
  // unless expanded or errored.
  on('ui.render', { component: 'ToolResult', props: { tool: TOOL } }, ($, e, next) => {
    if (e.props.isErrored || e.props.isExpanded) return next(e)
    const { Box } = $.ui.resolve(e)
    return <Box />
  })
}
