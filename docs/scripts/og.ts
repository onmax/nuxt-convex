// Draws the site's Open Graph image (public/og/home.png, 1200x630) and the README banner
// (public/og/readme-banner.png, 3200x1120) in headless Chromium. Run it after changing either
// with `pnpm docs:og`. It needs Playwright's Chromium: `pnpm --filter docs exec playwright-core install chromium`.
import { mkdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const out = new URL('../public/og/', import.meta.url)

// The docs' Convex accent ramp (app/assets/css/main.css). Chromium reads OKLCH directly.
const convex = {
  200: 'oklch(0.895 0.052 46)',
  300: 'oklch(0.825 0.09 44)',
  400: 'oklch(0.745 0.14 42)',
  500: 'oklch(0.675 0.185 40)',
  600: 'oklch(0.585 0.19 38)',
}
const alpha = (color: string, value: number) => color.replace(')', ` / ${value})`)

// The page is set as content, with no origin to load files from, so fonts go in as data URLs.
async function font(family: string, specifier: string) {
  const file = await readFile(fileURLToPath(import.meta.resolve(specifier)))
  return `@font-face{font-family:"${family}";src:url("data:font/woff2;base64,${file.toString('base64')}") format("woff2");font-weight:100 900}`
}
const fontFaces = await font('Inter', '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')
  + await font('JetBrains Mono', '@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2')

// The same marks the docs header draws (app/components/app/AppHeader.vue).
const convexMark = `<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="convex-mark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F3B01C"/><stop offset="0.55" stop-color="#EE342F"/><stop offset="1" stop-color="#8D2676"/></linearGradient></defs><path fill="url(#convex-mark)" d="M15.09 18.916c3.488-.387 6.776-2.246 8.586-5.348c-.857 7.673-9.247 12.522-16.095 9.545a3.47 3.47 0 0 1-1.547-1.314c-1.539-2.417-2.044-5.492-1.318-8.282c2.077 3.584 6.3 5.78 10.374 5.399m-10.501-7.65c-1.414 3.266-1.475 7.092.258 10.24c-6.1-4.59-6.033-14.41-.074-18.953a3.440 3.440 0 0 1 1.893-.707c2.825-.15 5.695.942 7.708 2.977c-4.09.04-8.073 2.66-9.785 6.442m11.757-5.437C14.283 2.951 11.053.992 7.515.933c6.84-3.105 15.253 1.929 16.17 9.37a3.6 3.6 0 0 1-.334 2.02c-1.278 2.594-3.647 4.607-6.416 5.352c2.029-3.763 1.778-8.36-.589-11.847"/></svg>`
const nuxtMark = `<svg viewBox="0 0 48 32" class="wide" aria-hidden="true"><path fill="#00DC82" d="M26.88 32H44.64C45.2068 32.0001 45.7492 31.8009 46.24 31.52C46.7308 31.2391 47.2367 30.8865 47.52 30.4C47.8033 29.9135 48.0002 29.3615 48 28.7998C47.9998 28.2381 47.8037 27.6864 47.52 27.2001L35.52 6.56C35.2368 6.0736 34.8907 5.72084 34.4 5.44C33.9093 5.15916 33.2066 4.96 32.64 4.96C32.0734 4.96 31.5307 5.15916 31.04 5.44C30.5493 5.72084 30.2032 6.0736 29.92 6.56L26.88 11.84L20.8 1.59962C20.5165 1.11326 20.1708 0.600786 19.68 0.32C19.1892 0.0392139 18.6467 0 18.08 0C17.5133 0 16.9708 0.0392139 16.48 0.32C15.9892 0.600786 15.4835 1.11326 15.2 1.59962L0.32 27.2001C0.0363166 27.6864 0.000246899 28.2381 3.05588e-07 28.7998C-0.000246288 29.3615 0.0367437 29.9134 0.32 30.3999C0.603256 30.8864 1.10919 31.2391 1.6 31.52C2.09081 31.8009 2.63324 32.0001 3.2 32H14.4C18.8379 32 22.068 30.0092 24.32 26.24L29.76 16.8L32.64 11.84L41.44 26.88H29.76L26.88 32ZM14.24 26.88H6.4L18.08 6.72L24 16.8L20.0786 23.636C18.5831 26.0816 16.878 26.88 14.24 26.88Z"/></svg>`
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
    radial-gradient(${l.width * 0.5}px ${l.height * 0.75}px at 82% 78%,${alpha(convex[500], 0.2)},transparent 70%),
    radial-gradient(${l.width * 0.35}px ${l.height * 0.6}px at 104% 6%,rgb(0 220 130/.08),transparent 70%),
    radial-gradient(${l.width * 0.4}px ${l.height * 0.7}px at 0% 0%,${alpha(convex[500], 0.07)},transparent 70%)}
.grid{position:absolute;inset:0;
  background-image:linear-gradient(#ffffff0a 1px,transparent 1px),linear-gradient(90deg,#ffffff0a 1px,transparent 1px);
  background-size:40px 40px;background-position:-1px -1px;
  -webkit-mask-image:radial-gradient(ellipse 80% 90% at 60% 40%,#000 30%,transparent 85%)}

.copy{position:absolute;left:${l.copy.left}px;top:${l.copy.top}px;bottom:${l.copy.top}px;width:${l.copy.width}px;display:flex;flex-direction:column}
.brand{display:flex;align-items:center;gap:12px;font-size:${l.brand}px;font-weight:600;letter-spacing:-.01em}
.brand span{display:flex;align-items:center;gap:9px}
.brand svg{width:${l.brand * 1.25}px;height:${l.brand * 1.25}px}
.brand svg.wide{width:auto;height:${l.brand * 0.9}px}
.brand .x{color:#52525b;font-weight:400;position:relative;top:-2px}
h1{margin:auto 0 0;font-size:${l.title}px;line-height:1;letter-spacing:-.045em;font-weight:700}
h1 .convex{background:linear-gradient(180deg,${convex[200]} 0%,${convex[400]} 50%,${convex[500]} 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
p{margin:${l.sub}px 0 0;font-size:${l.sub}px;line-height:1.38;color:#a1a1aa;letter-spacing:-.012em;font-weight:400;text-wrap:balance}
p b{color:#e4e4e7;font-weight:500}
.foot{margin-top:auto;display:flex;align-items:center;gap:22px}
.install{font:500 ${l.install}px/1 "JetBrains Mono",monospace;padding:16px 22px;border:1px solid #27272a;border-radius:12px;background:#111113cc;color:#e4e4e7;white-space:nowrap}
.install span{color:#00dc82;margin-right:4px}
.marks{display:flex;align-items:center;gap:14px}
.marks svg{width:${l.install * 1.6}px;height:${l.install * 1.6}px}
.marks svg.wide{width:auto;height:${l.install * 1.15}px}

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
.line:nth-child(4),.line:nth-child(5){background:linear-gradient(90deg,${alpha(convex[500], 0.12)},${alpha(convex[500], 0.02)} 70%,transparent);box-shadow:inset 2px 0 0 ${convex[500]}}
.k{color:${convex[400]}}.s{color:#e9d8a6}.f{color:#5eead4}.t{color:#7dd3a8}.a{color:#a5b4fc}.p{color:#71717a}

.list{position:absolute;left:${l.list.left}px;top:${l.list.top}px;width:${l.list.width}px;border:1px solid #2e2e33;border-radius:14px;background:#141417;padding:16px 16px 14px;
  box-shadow:0 30px 60px -12px #000000f0,0 0 0 1px #0000009c,inset 0 1px 0 #ffffff12}
.list header{display:flex;align-items:center;justify-content:space-between;margin:0 2px 12px}
.list header b{font-size:15px;font-weight:600;letter-spacing:-.01em}
.live{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:500;color:#00dc82;background:rgb(0 220 130/.1);border:1px solid rgb(0 220 130/.25);padding:4px 10px 4px 8px;border-radius:999px}
.live::before{content:"";width:7px;height:7px;border-radius:50%;background:#00dc82;box-shadow:0 0 0 3px rgb(0 220 130/.2)}
ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px}
li{display:flex;align-items:center;gap:11px;padding:9px 12px;border-radius:9px;background:#1c1c20;font-size:14px;color:#d4d4d8}
li i{flex:none;width:17px;height:17px;border-radius:5px;border:1.5px solid #3f3f46;display:flex;align-items:center;justify-content:center}
li.done i{background:${convex[600]};border-color:${convex[600]}}
li.done span{color:#71717a;text-decoration:line-through;text-decoration-color:#52525b}
li i svg{width:12px;height:12px}
li.fresh{background:${alpha(convex[500], 0.12)};box-shadow:inset 0 0 0 1px ${alpha(convex[400], 0.35)};color:#fafafa}
li em{margin-left:auto;font-style:normal;font-size:12px;color:${convex[300]}}
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
