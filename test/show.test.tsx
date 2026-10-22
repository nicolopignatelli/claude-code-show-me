import type { On } from 'claude-code'
import { expect, test, type TestBody } from 'claude-code/testing'
import { decodePng, encodePng } from '../hooks/png.ts'

const TOOL = 'mcp__show-me__show'
const DIR = '/tmp/test/show-me'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const whiteImage = (width: number, height: number) =>
  encodePng({ width, height, rgba: new Uint8Array(width * height * 4).fill(255) })

/**
 * Stands in for the engine beneath the plugin: env, a file system in memory
 * (bytes kept as base64), and a Chrome that writes a white PNG of the window
 * size times the scale factor.
 */
const engine = (on: On, files: Map<string, string>, runs: string[][], chromeInstalled = true) => {
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('tool.register', () => ({ value: { tool: TOOL } }))
  on('env.get', (_, e) => ({ value: e.name === 'TMPDIR' ? '/tmp/test/' : undefined }))
  on('fs.write', (_, e) => {
    files.set(e.path, e.text)
    return { value: undefined }
  })
  on('fs.read', (_, e) => {
    const content = files.get(e.path)
    if (content === undefined) throw new Error(`ENOENT: ${e.path}`)
    return { value: e.as === 'bytes' ? { base64: content } : content }
  })
  on('fs.exists', (_, e) => ({ value: chromeInstalled && e.path === CHROME }))
  on('fs.stat', (_, e) => {
    const content = files.get(e.path)
    if (content === undefined) throw new Error(`ENOENT: ${e.path}`)
    return { value: { kind: 'file', size: content.length, mtimeMs: 0, isLink: false, ...(e.resolve ? { realPath: e.path } : {}) } }
  })
  on('process.run', (_, e) => {
    runs.push([...e.argv])
    const flag = (name: string) => e.argv.find(arg => arg.startsWith(`--${name}=`))?.slice(name.length + 3)
    const screenshot = flag('screenshot')
    if (screenshot) {
      const [width, height] = flag('window-size')!.split(',').map(Number)
      const scale = Number(flag('force-device-scale-factor'))
      files.set(screenshot, whiteImage(Math.round(width * scale), Math.round(height * scale)).toBase64())
    }
    return {
      value: { exitCode: e.argv[0] === CHROME ? 0 : 127, stdout: '', stderr: '', isStdoutTruncated: false, isStderrTruncated: false },
    }
  })
}

const idOf = (files: Map<string, string>) => {
  const json = [...files.keys()].filter(p => p.endsWith('.json')).at(-1)!
  return json.slice(DIR.length + 1, -'.json'.length)
}

// The call's row, once the call has resolved: where the picture is drawn.
const mount = ($: Parameters<TestBody>[0], id: string, surface: 'terminal' | 'desktop') =>
  $.ui.mount({
    plugin: 'show-me',
    surface,
    component: 'ToolUse',
    requestId: id,
    props: { tool_use_id: id, tool: TOOL, input: {}, isRunning: false, isErrored: false, isInterrupted: false },
  })

test('html is written, rendered by Chrome at up to twice the density, and drawn as the picture and its caption alone', async ($, on) => {
  const files = new Map<string, string>()
  const runs: string[][] = []
  engine(on, files, runs)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  const ran = await $.tool.call({ tool: TOOL, html: '<p>hi</p>', width: 400, height: 200, caption: 'The point' })
  expect(ran.deny).toBeUndefined()
  const id = idOf(files)
  expect(files.get(`${DIR}/${id}.html`)).toBe('<p>hi</p>')

  const argv = runs.at(-1)!
  expect(argv).toContain('--force-device-scale-factor=2')
  expect(argv).toContain('--window-size=400,200')
  expect(argv.at(-1)).toBe(`file://${DIR}/${id}.html`)
  expect(String(ran.result)).toContain(`${DIR}/${id}.png`)

  const inline = decodePng(Uint8Array.fromBase64(files.get(`${DIR}/${id}.png.b64`)!))
  expect([inline.width, inline.height]).toEqual([800, 400])

  const terminal = await mount($, id, 'terminal')
  expect((await terminal.find({ type: 'Image' }))?.props.alt).toBe(
    "This terminal can't draw pictures; ctrl+o shows where the file is.",
  )
  expect(await terminal.find({ type: 'Text', text: 'The point' })).toBeDefined()
  expect(await terminal.find({ type: 'Link' })).toBeUndefined()
  await terminal.unmount()

  const result = await $.ui.mount({
    plugin: 'show-me',
    surface: 'terminal',
    component: 'ToolResult',
    requestId: id,
    props: { tool_use_id: id, tool: TOOL, output: '', isErrored: false },
  })
  expect(await result.find({ type: 'Text' })).toBeUndefined()
  await result.unmount()
})

test('a wide canvas is rendered no denser than the inline picture keeps', async ($, on) => {
  const files = new Map<string, string>()
  const runs: string[][] = []
  engine(on, files, runs)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  await $.tool.call({ tool: TOOL, html: '<p>wide</p>', width: 4000, height: 400 })
  expect(runs.at(-1)).toContain('--force-device-scale-factor=0.64')
})

test('svg is rendered to fill the canvas, and drawn as vectors where the surface has no Image', async ($, on) => {
  const files = new Map<string, string>()
  const runs: string[][] = []
  engine(on, files, runs)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4"/></svg>'
  const ran = await $.tool.call({ tool: TOOL, svg, width: 300, height: 300, caption: 'A circle' })
  expect(ran.deny).toBeUndefined()
  const id = idOf(files)
  expect(files.get(`${DIR}/${id}.svg`)).toBe(svg)
  expect(files.get(`${DIR}/${id}.svg.html`)).toContain(svg)
  expect(runs.at(-1)!.at(-1)).toBe(`file://${DIR}/${id}.svg.html`)

  const desktop = await mount($, id, 'desktop')
  const drawn = await desktop.find({ type: 'Svg' })
  expect(drawn?.props.source).toBe(svg)
  expect(drawn?.props.alt).toBe('A circle')
  await desktop.unmount()
})

test('a png is shown as it is, and off the terminal only its caption', async ($, on) => {
  const files = new Map([['/work/shot.png', whiteImage(400, 200).toBase64()]])
  const runs: string[][] = []
  engine(on, files, runs)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  const ran = await $.tool.call({ tool: TOOL, png: '/work/shot.png', caption: 'Shot' })
  expect(ran.deny).toBeUndefined()
  expect(runs).toEqual([])
  const id = idOf(files)
  expect(files.get(`${DIR}/${id}.png.b64`)).toBe(files.get('/work/shot.png'))

  const desktop = await mount($, id, 'desktop')
  expect(await desktop.find({ type: 'Svg' })).toBeUndefined()
  expect(await desktop.find({ type: 'Text', text: 'Shot' })).toBeDefined()
  expect(await desktop.find({ type: 'Text', text: '/work/shot.png' })).toBeUndefined()
  await desktop.unmount()
})

test('a png larger than the inline picture is shrunk to fit', async ($, on) => {
  const files = new Map([['/work/big.png', whiteImage(3000, 1000).toBase64()]])
  engine(on, files, [])
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  await $.tool.call({ tool: TOOL, png: '/work/big.png' })
  const inline = decodePng(Uint8Array.fromBase64(files.get(`${DIR}/${idOf(files)}.png.b64`)!))
  expect([inline.width, inline.height]).toEqual([2560, 853])
})

test('the size takes a share of the terminal width, capped by rows; medium when none is given', async ($, on) => {
  const files = new Map([['/work/shot.png', whiteImage(400, 200).toBase64()]])
  engine(on, files, [])
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  const drawn = async (size?: string) => {
    await $.tool.call({ tool: TOOL, png: '/work/shot.png', ...(size ? { size } : {}) })
    const id = idOf(files)
    const terminal = await mount($, id, 'terminal')
    const image = await terminal.find({ type: 'Image' })
    await terminal.unmount()
    files.delete(`${DIR}/${id}.json`)
    return { columns: image?.props.columns, rows: image?.props.rows }
  }

  // On the 80-column terminal the mount assumes, 76 columns are free.
  expect(await drawn('small')).toEqual({ columns: 30, rows: 8 })
  expect(await drawn()).toEqual({ columns: 53, rows: 13 })
  // Large takes them all; a 2:1 picture is then 19 rows tall, under its cap.
  expect(await drawn('large')).toEqual({ columns: 76, rows: 19 })
})

test('a call is refused with what to do: no single source, no canvas, no Chrome', async ($, on) => {
  engine(on, new Map(), [], false)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  expect((await $.tool.call({ tool: TOOL })).deny).toContain('exactly one')
  expect((await $.tool.call({ tool: TOOL, html: '<p/>', svg: '<svg/>' })).deny).toContain('exactly one')
  expect((await $.tool.call({ tool: TOOL, html: '<p/>' })).deny).toContain('width and height')
  expect((await $.tool.call({ tool: TOOL, html: '<p/>', width: 100, height: 100 })).deny).toContain('No Chrome')
})

test("while no picture is drawn yet the call's row names the source and its canvas instead of the markup, and shows it all when expanded", async ($, on) => {
  engine(on, new Map(), [])
  const seen: unknown[] = []
  on('ui.render', { component: 'ToolUse' }, ($, e) => {
    seen.push(e.props.input)
    const { Text } = $.ui.resolve(e)
    return <Text>row</Text>
  })
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  const input = { html: '<p>long markup</p>', width: 1200, height: 450, size: 'small', caption: 'The point' }
  const props = { tool_use_id: 't1', tool: TOOL, input, isRunning: false, isErrored: false, isInterrupted: false }
  await (await $.ui.mount({ plugin: 'show-me', surface: 'terminal', component: 'ToolUse', requestId: 't1', props })).unmount()
  expect(seen.at(-1)).toEqual({ html: '1200×450', size: 'small', caption: 'The point' })

  const expanded = { ...props, isExpanded: true }
  await (await $.ui.mount({ plugin: 'show-me', surface: 'terminal', component: 'ToolUse', requestId: 't1', props: expanded })).unmount()
  expect(seen.at(-1)).toEqual(input)
})
