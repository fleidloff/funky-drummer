import { chromium } from 'playwright'

const [url, out, w, h, scheme] = process.argv.slice(2)
const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: Number(w), height: Number(h) },
  deviceScaleFactor: 2,
  colorScheme: scheme,
})
await page.goto(url, { waitUntil: 'networkidle' })
await page.screenshot({ path: out, fullPage: false })
await browser.close()
