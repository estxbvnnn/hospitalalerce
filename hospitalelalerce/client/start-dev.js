const { spawn } = require('child_process');
const fetch = global.fetch || require('node-fetch'); // node v18+ tiene fetch, fallback si no
const path = require('path');

const ROOT = __dirname;
const SERVER_CMD = 'node';
const SERVER_ARGS = ['server.js'];
const NG_CMD = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const NG_ARGS = ['ng', 'serve', '--host', '0.0.0.0', '--port', '4200', '--proxy-config', 'proxy.conf.json'];

function spawnProcess(cmd, args, opts = {}) {
  const p = spawn(cmd, args, Object.assign({ cwd: ROOT, stdio: 'inherit', shell: true }, opts));
  p.on('error', (err) => console.error(`[start-dev] Error spawning ${cmd}:`, err));
  return p;
}

async function waitForPing(url, timeoutMs = 30000, intervalMs = 500) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch (e) {
      // ignore, wait and retry
    }
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error(`Timeout waiting for ${url}`);
}

(async () => {
  console.log('[start-dev] Starting backend server...');
  const serverProc = spawnProcess(SERVER_CMD, SERVER_ARGS);

  // forward exits
  const shutdown = (code) => {
    try { serverProc.kill(); } catch (e) {}
    try { ngProc && ngProc.kill(); } catch (e) {}
    process.exit(code ?? 0);
  };
  process.on('SIGINT', () => shutdown());
  process.on('SIGTERM', () => shutdown());

  const pingUrl = 'http://localhost:3000/api/ping';
  try {
    console.log(`[start-dev] Waiting for backend at ${pingUrl} ...`);
    await waitForPing(pingUrl, 60000, 500);
    console.log('[start-dev] Backend is up. Starting Angular dev server...');
    var ngProc = spawnProcess(NG_CMD, NG_ARGS);
    ngProc.on('exit', (code) => {
      console.log('[start-dev] ng serve exited with code', code);
      shutdown(code);
    });
  } catch (err) {
    console.error('[start-dev] Backend did not respond in time:', err.message || err);
    console.error('[start-dev] You can still try to start frontend separately: npm start');
    // keep server running for debugging
  }
})();
