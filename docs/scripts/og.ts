// Draws the site's Open Graph image (public/og/home.png, 1200x630) and the README banner
// (public/og/readme-banner.png, 3200x1120) in headless Chromium. Run it after changing either
// with `pnpm docs:og`. It needs Playwright's Chromium: `pnpm --filter docs exec playwright-core install chromium`.
import { mkdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const out = new URL('../public/og/', import.meta.url)

// The page is set as content, with no origin to load files from, so fonts go in as data URLs.
async function font(family: string, specifier: string) {
  const file = await readFile(fileURLToPath(import.meta.resolve(specifier)))
  return `@font-face{font-family:"${family}";src:url("data:font/woff2;base64,${file.toString('base64')}") format("woff2");font-weight:100 900}`
}
const fontFaces = await font('Inter', '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')
  + await font('JetBrains Mono', '@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2')

// The same marks the docs header draws.
const convexMark = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#e56a3b" d="M9.5 11.5L2 2h7.5l13 18h-7.5l-3-4.5-3 4.5H2l7.5-8.5Z"/><path fill="#e56a3b" d="M15.5 2h7l-5.5 8-3.5-5 2-3Z"/></svg>`
const nuxtMark = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#00dc82" d="M13.464 19.83h8.922c.283 0 .562-.073.807-.21a1.6 1.6 0 0 0 .591-.574a1.53 1.53 0 0 0 .216-.783a1.53 1.53 0 0 0-.217-.782L17.792 7.414a1.6 1.6 0 0 0-.591-.573a1.65 1.65 0 0 0-.807-.21c-.283 0-.562.073-.807.21a1.6 1.6 0 0 0-.59.573L13.463 9.99L10.47 4.953a1.6 1.6 0 0 0-.591-.573a1.65 1.65 0 0 0-.807-.21c-.284 0-.562.073-.807.21a1.6 1.6 0 0 0-.591.573L.216 17.481a1.53 1.53 0 0 0-.217.782c0 .275.074.545.216.783a1.6 1.6 0 0 0 .59.574c.246.137.525.21.808.21h5.6c2.22 0 3.856-.946 4.982-2.79l2.733-4.593l1.464-2.457l4.395 7.382h-5.859Zm-6.341-2.46l-3.908-.002l5.858-9.842l2.923 4.921l-1.957 3.29c-.748 1.196-1.597 1.632-2.916 1.632"/></svg>`
const vueMark = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#41b883" d="M24 1.61h-9.94L12 5.16L9.94 1.61H0l12 20.78ZM12 14.08L5.16 2.23h4.43L12 6.41l2.41-4.18h4.43Z"/></svg>`
const check = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`

// The page from the docs' installation guide. Each «class|text» is one highlighted token.
const code = [
  '«t|<script» «a|setup» «a|lang»«p|=»«s|"ts"»«t|>»',
  '«k|import» «p|{» api «p|}» «k|from» «s|\'#convex/api\'»',
  '',
  '«k|const» «p|{» data«p|:» tasks «p|}» «p|=»',
  '  «k|await» «f|useConvexQuery»«p|(»api«p|.»tasks«p|.»list«p|)»',
  '«t|</script>»',
  '',
  '«t|<template>»',
  '  «t|<li» «a|v-for»«p|=»«s|"task in tasks"» «a|:key»«p|=»«s|"task._id"»«t|>»',
  '    «p|{{» task«p|.»text «p|}}»',
  '  «t|</li>»',
  '«t|</template>»',
]
const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
function highlight(line: string) {
  return line
    .split(/(«[a-z]\|[^»]*»)/)
    .map((part) => {
      const token = /^«([a-z])\|([^»]*)»$/.exec(part)
      return token ? `<span class="${token[1]}">${escape(token[2]!)}</span>` : escape(part)
    })
    .join('') || ' '
}

// The newest task arrives at the top, the way a live query would push it.
const tasks = [
  { text: 'Watch it update live', done: false, fresh: true },
  { text: 'Render the list on the server', done: true },
  { text: 'Define the tasks table', done: true },
]

interface Layout {
  width: number
  height: number
  copy: { left: number, top: number, width: number }
  brand: number
  title: number
  sub: number
  install: number
  window: { left: number, top: number, width: number, code: number }
  list: { left: number, top: number, width: number }
}

const layouts: Record<'og' | 'banner', Layout> = {
  og: {
    width: 1200,
    height: 630,
    copy: { left: 72, top: 64, width: 560 },
    brand: 22,
    title: 76,
    sub: 25,
    install: 19,
    window: { left: 664, top: 50, width: 580, code: 14 },
    list: { left: 806, top: 418, width: 352 },
  },
  banner: {
    width: 1600,
    height: 560,
    copy: { left: 88, top: 68, width: 660 },
    brand: 24,
    title: 84,
    sub: 26,
    install: 20,
    window: { left: 776, top: 70, width: 520, code: 14.5 },
    list: { left: 1252, top: 262, width: 300 },
  },
}

function page(l: Layout) {
  const lines = code.map(line => `<div class="line"><span>${highlight(line)}</span></div>`).join('')
  const items = tasks.map(task => `<li class="${task.done ? 'done' : ''}${task.fresh ? ' fresh' : ''}"><i>${task.done ? check : ''}</i><span>${task.text}</span>${task.fresh ? '<em>just now</em>' : ''}</li>`).join('')

  return `<!doctype html><html><head><meta charset="utf-8"><style>${fontFaces}
*{box-sizing:border-box}
html,body{margin:0;width:${l.width}px;height:${l.height}px;overflow:hidden}
body{position:relative;background:#09090b;color:#fafafa;font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased}
.bg{position:absolute;inset:0;
  background:
    radial-gradient(${l.width * 0.5}px ${l.height * 0.75}px at 82% 78%,rgb(229 106 59/.22),transparent 70%),
    radial-gradient(${l.width * 0.35}px ${l.height * 0.6}px at 104% 6%,rgb(0 220 130/.08),transparent 70%),
    radial-gradient(${l.width * 0.4}px ${l.height * 0.7}px at 0% 0%,rgb(229 106 59/.07),transparent 70%)}
.grid{position:absolute;inset:0;
  background-image:linear-gradient(#ffffff0a 1px,transparent 1px),linear-gradient(90deg,#ffffff0a 1px,transparent 1px);
  background-size:40px 40px;background-position:-1px -1px;
  -webkit-mask-image:radial-gradient(ellipse 80% 90% at 60% 40%,#000 30%,transparent 85%)}

.copy{position:absolute;left:${l.copy.left}px;top:${l.copy.top}px;bottom:${l.copy.top}px;width:${l.copy.width}px;display:flex;flex-direction:column}
.brand{display:flex;align-items:center;gap:12px;font-size:${l.brand}px;font-weight:600;letter-spacing:-.01em}
.brand span{display:flex;align-items:center;gap:9px}
.brand svg{width:${l.brand * 1.25}px;height:${l.brand * 1.25}px}
.brand .x{color:#52525b;font-weight:400;position:relative;top:-2px}
h1{margin:auto 0 0;font-size:${l.title}px;line-height:1;letter-spacing:-.045em;font-weight:700}
h1 .convex{background:linear-gradient(180deg,#fccdb3 0%,#f0854e 45%,#e56a3b 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
p{margin:${l.sub}px 0 0;font-size:${l.sub}px;line-height:1.38;color:#a1a1aa;letter-spacing:-.012em;font-weight:400;text-wrap:balance}
p b{color:#e4e4e7;font-weight:500}
.foot{margin-top:auto;display:flex;align-items:center;gap:22px}
.install{font:500 ${l.install}px/1 "JetBrains Mono",monospace;padding:16px 22px;border:1px solid #27272a;border-radius:12px;background:#111113cc;color:#e4e4e7;white-space:nowrap}
.install span{color:#00dc82;margin-right:4px}
.marks{display:flex;align-items:center;gap:14px}
.marks svg{width:${l.install * 1.6}px;height:${l.install * 1.6}px}

.window{position:absolute;left:${l.window.left}px;top:${l.window.top}px;width:${l.window.width}px;border:1px solid #27272a;border-radius:16px;background:#0f0f11f2;overflow:hidden;
  box-shadow:0 0 0 1px #00000080,0 40px 80px -20px #000000e6,inset 0 1px 0 #ffffff0d}
.bar{display:flex;align-items:center;gap:8px;height:44px;padding:0 18px;border-bottom:1px solid #1f1f23;background:#131316}
.bar i{width:11px;height:11px;border-radius:50%;background:#2e2e33}
.bar b{margin-left:12px;font:400 13px "JetBrains Mono",monospace;color:#a1a1aa}
.bar b span{color:#52525b}
.code{padding:20px 0 22px;font:400 ${l.window.code}px/1.72 "JetBrains Mono",monospace;color:#e4e4e7;white-space:pre}
.line{padding:0 22px 0 0;display:flex}
.line span{white-space:pre}
.line::before{content:counter(n);counter-increment:n;width:46px;padding-right:18px;text-align:right;color:#3f3f46;flex:none}
.code{counter-reset:n}
.line:nth-child(4),.line:nth-child(5){background:linear-gradient(90deg,rgb(229 106 59/.10),rgb(229 106 59/.02) 70%,transparent);box-shadow:inset 2px 0 0 #e56a3b}
.k{color:#f0854e}.s{color:#e9d8a6}.f{color:#5eead4}.t{color:#7dd3a8}.a{color:#a5b4fc}.p{color:#71717a}

.list{position:absolute;left:${l.list.left}px;top:${l.list.top}px;width:${l.list.width}px;border:1px solid #2e2e33;border-radius:14px;background:#141417;padding:16px 16px 14px;
  box-shadow:0 30px 60px -12px #000000f0,0 0 0 1px #0000009c,inset 0 1px 0 #ffffff12}
.list header{display:flex;align-items:center;justify-content:space-between;margin:0 2px 12px}
.list header b{font-size:15px;font-weight:600;letter-spacing:-.01em}
.live{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:500;color:#00dc82;background:rgb(0 220 130/.1);border:1px solid rgb(0 220 130/.25);padding:4px 10px 4px 8px;border-radius:999px}
.live::before{content:"";width:7px;height:7px;border-radius:50%;background:#00dc82;box-shadow:0 0 0 3px rgb(0 220 130/.2)}
ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px}
li{display:flex;align-items:center;gap:11px;padding:9px 12px;border-radius:9px;background:#1c1c20;font-size:14px;color:#d4d4d8}
li i{flex:none;width:17px;height:17px;border-radius:5px;border:1.5px solid #3f3f46;display:flex;align-items:center;justify-content:center}
li.done i{background:#e56a3b;border-color:#e56a3b}
li.done span{color:#71717a;text-decoration:line-through;text-decoration-color:#52525b}
li i svg{width:12px;height:12px}
li.fresh{background:rgb(229 106 59/.12);box-shadow:inset 0 0 0 1px rgb(229 106 59/.35);color:#fafafa}
li em{margin-left:auto;font-style:normal;font-size:12px;color:#f0854e}
</style></head><body>
<div class="bg"></div><div class="grid"></div>
<div class="copy">
  <div class="brand"><span>${convexMark}Convex</span><span class="x">×</span><span>${nuxtMark}Nuxt</span></div>
  <h1><span class="convex">Convex</span> for<br>Nuxt and Vue</h1>
  <p>Realtime queries that render on the server and stay live in the browser.</p>
  <div class="foot"><div class="install"><span>$</span> pnpm add nuxt-convex convex</div><div class="marks">${nuxtMark}${vueMark}</div></div>
</div>
<div class="window"><div class="bar"><i></i><i></i><i></i><b><span>app/pages/</span>index.vue</b></div><div class="code">${lines}</div></div>
<div class="list"><header><b>Tasks</b><span class="live">Live</span></header><ul>${items}</ul></div>
</body></html>`
}

await mkdir(out, { recursive: true })
const browser = await chromium.launch()
try {
  for (const [file, layout, scale] of [['home.png', layouts.og, 1], ['readme-banner.png', layouts.banner, 2]] as const) {
    const tab = await browser.newPage({ viewport: { width: layout.width, height: layout.height }, deviceScaleFactor: scale, colorScheme: 'dark' })
    await tab.setContent(page(layout), { waitUntil: 'load' })
    await tab.evaluate(() => document.fonts.ready)
    await tab.screenshot({ path: fileURLToPath(new URL(file, out)) })
    await tab.close()
    console.log(`docs/public/og/${file}`)
  }
}
finally {
  await browser.close()
}
