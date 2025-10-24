import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// use global fetch available in Node 18+

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public', 'fonts');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const cssUrl = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Playfair+Display:wght@600;700&display=swap';

async function main(){
  console.log('Fetching CSS...');
  const res = await fetch(cssUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36' } });
  const css = await res.text();
  const re = /(https?:\/\/fonts\.gstatic\.com\/[^\)\'\"]+\.woff2)/g;
  const urls = Array.from(css.matchAll(re)).map(m => m[1]);
  const unique = [...new Set(urls)];
  console.log('Found', unique.length, 'unique woff2 urls');
  for (const u of unique){
    const file = u.split('/').pop().split('?')[0];
    const out = path.join(outDir, file);
    if (fs.existsSync(out)) { console.log('Already downloaded', file); continue; }
    console.log('Downloading', file);
    const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36' } });
    if (!r.ok) throw new Error('Failed to download ' + u + ' ' + r.status);
    const ab = await r.arrayBuffer();
    const buf = Buffer.from(ab);
    fs.writeFileSync(out, buf);
    console.log('Saved', out);
  }
  // write a local CSS file that mirrors the Google Fonts CSS but points at local files
  try {
    const localCss = css.replace(re, (m) => {
      const file = m.split('/').pop().split('?')[0];
      return `/fonts/${file}`;
    });
    const cssOut = path.join(__dirname, '..', 'src', 'fonts-local.css');
    fs.writeFileSync(cssOut, '/* Auto-generated local copy of Google Fonts CSS */\n' + localCss, 'utf8');
    console.log('Wrote local CSS to', cssOut);
  } catch (e) {
    console.warn('Failed to write local CSS:', e.message || e);
  }
  console.log('Done. Files in', outDir);
}

main().catch(e=>{ console.error(e); process.exit(1); });
