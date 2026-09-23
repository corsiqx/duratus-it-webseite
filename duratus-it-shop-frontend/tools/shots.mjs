// Visual checks with headless Chrome over the DevTools protocol (no extra packages, Node 22+).
// The dev server must run on :4203.
//
// Usage: node tools/shots.mjs <outDir> <width> <height> <step> [<step> ...]
// Steps:
//   reset                 open the shop and clear the demo state in localStorage
//   goto:/path            open a route and wait until it rendered
//   eval:<js>             run JavaScript in the page (awaited), result is printed
//   wait:<ms>             pause
//   shot:<name>           screenshot of the viewport  -> <outDir>/<name>.png
//   full:<name>           screenshot of the whole page -> <outDir>/<name>.png
//   audit                 print elements that overflow the viewport horizontally
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [outDir, width, height, ...steps] = process.argv.slice(2);
if (!outDir || !width || !height) {
  console.error('node tools/shots.mjs <outDir> <width> <height> <steps…>');
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

const BASE = 'http://localhost:4203';
const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 9300 + Math.floor(Math.random() * 500);
const profile = join(tmpdir(), `shop-shots-${port}`);
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--hide-scrollbars', '--no-first-run', 'about:blank'], {
  stdio: 'ignore',
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function connect() {
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const page = targets.find((target) => target.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      // Chrome still starting
    }
    await sleep(200);
  }
  throw new Error('Chrome did not start');
}

const ws = new WebSocket(await connect());
await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));
let nextId = 1;
const pending = new Map();
ws.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    message.error ? reject(new Error(message.error.message)) : resolve(message.result);
  }
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });

const evaluate = async (expression) => {
  const result = await send('Runtime.evaluate', { expression: `(async () => { ${expression} })()`, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? 'eval failed');
  return result.result.value;
};

const w = Number(width);
const h = Number(height);
await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: w < 768 });
if (w < 768) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });

const settle = async () => {
  await sleep(300);
  await evaluate(`await document.fonts.ready; await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));`);
  await sleep(500);
};

try {
  for (const step of steps) {
    const [command, ...rest] = step.split(':');
    const arg = rest.join(':');
    if (command === 'reset') {
      await send('Page.navigate', { url: BASE });
      await sleep(1200);
      await evaluate(`localStorage.clear();`);
    } else if (command === 'goto') {
      await send('Page.navigate', { url: `${BASE}${arg}` });
      await sleep(1200);
      await settle();
    } else if (command === 'eval') {
      const value = await evaluate(arg);
      if (value !== undefined) console.log(`eval → ${JSON.stringify(value)}`);
      await settle();
    } else if (command === 'wait') {
      await sleep(Number(arg));
    } else if (command === 'shot' || command === 'full') {
      let clip;
      if (command === 'full') {
        const size = await evaluate(`return { w: document.documentElement.clientWidth, h: document.documentElement.scrollHeight };`);
        clip = { x: 0, y: 0, width: size.w, height: size.h, scale: 1 };
      }
      const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: command === 'full', ...(clip ? { clip } : {}) });
      const file = join(outDir, `${arg}.png`);
      writeFileSync(file, Buffer.from(data, 'base64'));
      console.log(`shot → ${file}`);
    } else if (command === 'audit') {
      const issues = await evaluate(`
        const W = document.documentElement.clientWidth, out = [];
        for (const el of document.querySelectorAll('body *')) {
          if (el.closest('#portal-sidebar[inert], .sr-only, [popover]:not(:popover-open), dialog:not([open]), fieldset.overflow-x-auto')) continue;
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height || getComputedStyle(el).visibility === 'hidden') continue;
          if (r.right > W + 0.5 || r.left < -0.5) out.push(el.tagName + '.' + String(el.className).slice(0, 60) + ' [' + Math.round(r.left) + ',' + Math.round(r.right) + ']');
        }
        return { path: location.pathname, scrollWidth: document.documentElement.scrollWidth, viewport: W, issues: out.slice(0, 15) };`);
      console.log(`audit → ${JSON.stringify(issues)}`);
    } else {
      throw new Error(`Unknown step ${step}`);
    }
  }
} finally {
  ws.close();
  chrome.kill();
}
