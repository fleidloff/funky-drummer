import { chromium } from 'playwright'

const [url, out, selector, scheme] = process.argv.slice(2)
const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 420, height: 900 },
  deviceScaleFactor: 4,
  colorScheme: scheme,
})
await page.goto(url, { waitUntil: 'networkidle' })
await page.locator(selector).first().screenshot({ path: out })
await browser.close()
