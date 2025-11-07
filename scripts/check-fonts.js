import { chromium } from 'playwright';

(async ()=>{
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const fonts = new Set();
  page.on('request', req => {
    const url = req.url();
    if (url.endsWith('.woff2') || url.includes('/fonts/')) fonts.add(url);
  });
  page.on('response', async res => {
    const url = res.url();
    if (url.endsWith('.woff2') || url.includes('/fonts/')) {
      console.log('Font response:', url, res.status());
    }
  });

  const base = process.env.BASE_URL || 'http://localhost:5173';
  console.log('Opening', base);
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  console.log('Collected font requests:');
  for (const f of fonts) console.log(' -', f);
  await browser.close();
})();
