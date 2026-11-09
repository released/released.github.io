import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";


const ROOT = resolve(fileURLToPath(new URL("../", import.meta.url)));
const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};


function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].filter(Boolean);
  const chrome = candidates.find(existsSync);
  if (!chrome) {
    throw new Error("Chrome/Edge was not found. Set CHROME_PATH to run the browser smoke test.");
  }
  return chrome;
}


function startStaticServer() {
  const server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url, "http://127.0.0.1");
      let relative = decodeURIComponent(requestUrl.pathname).replace(/^\/+/, "");
      if (!relative || relative.endsWith("/")) {
        relative += "index.html";
      }
      const target = resolve(ROOT, normalize(relative));
      if (target !== ROOT && !target.startsWith(`${ROOT}${sep}`)) {
        response.writeHead(403).end("Forbidden");
        return;
      }
      const info = await stat(target);
      if (!info.isFile()) {
        response.writeHead(404).end("Not found");
        return;
      }
      const content = await readFile(target);
      response.writeHead(200, {
        "Content-Type": MIME_TYPES[extname(target)] ?? "application/octet-stream",
        "Cache-Control": "no-store",
      });
      response.end(content);
    } catch (error) {
      response.writeHead(404).end(error.message);
    }
  });
  return new Promise((resolvePromise, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolvePromise(server));
  });
}


async function waitForFile(path, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (existsSync(path)) {
      try {
        const content = await readFile(path, "utf8");
        if (content.trim()) {
          return content;
        }
      } catch {
        // Chrome may briefly lock DevToolsActivePort while writing it.
      }
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 100));
  }
  throw new Error(`Timed out waiting for ${path}`);
}


async function removeDirectoryWithRetry(path) {
  let lastError;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      await rm(path, { recursive: true, force: true });
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 150));
    }
  }
  throw lastError;
}


class CdpClient {
  constructor(webSocketUrl) {
    this.nextId = 1;
    this.pending = new Map();
    this.socket = new WebSocket(webSocketUrl);
  }

  async open() {
    await new Promise((resolvePromise, reject) => {
      this.socket.addEventListener("open", resolvePromise, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (!message.id || !this.pending.has(message.id)) {
        return;
      }
      const { resolvePromise, reject } = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) {
        reject(new Error(message.error.message));
      } else {
        resolvePromise(message.result);
      }
    });
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    return new Promise((resolvePromise, reject) => {
      this.pending.set(id, { resolvePromise, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text);
    }
    return result.result.value;
  }

  close() {
    this.socket.close();
  }
}


async function waitFor(client, expression, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await client.evaluate(expression)) {
      return;
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 100));
  }
  throw new Error(`Timed out waiting for browser expression: ${expression}`);
}


async function layoutMetrics(client) {
  return client.evaluate(`(() => {
    const viewport = document.documentElement.clientWidth;
    return {
      viewport,
      scrollWidth: document.documentElement.scrollWidth,
      offenders: [...document.querySelectorAll('body *')]
        .filter((node) => node.getBoundingClientRect().right > viewport + 1)
        .slice(0, 12)
        .map((node) => ({
          tag: node.tagName,
          className: String(node.className),
          right: Math.round(node.getBoundingClientRect().right),
          width: Math.round(node.getBoundingClientRect().width),
        })),
    };
  })()`);
}


async function run() {
  const server = await startStaticServer();
  const address = server.address();
  const origin = `http://127.0.0.1:${address.port}`;
  const chromeProfile = await mkdtemp(join(tmpdir(), "option-byte-chrome-"));
  const devToolsFile = join(chromeProfile, "DevToolsActivePort");
  const chrome = spawn(
    findChrome(),
    [
      "--headless=new",
      "--disable-gpu",
      "--disable-extensions",
      "--no-first-run",
      "--remote-debugging-port=0",
      "--window-size=390,1200",
      `--user-data-dir=${chromeProfile}`,
      `${origin}/rl78/`,
    ],
    { stdio: "ignore" },
  );

  let client;
  try {
    const devToolsContent = await waitForFile(devToolsFile);
    const [port] = devToolsContent.trim().split(/\r?\n/);
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    const target =
      targets.find((item) => item.type === "page" && item.url.startsWith(`${origin}/rl78/`))
      ?? targets.find((item) => item.type === "page");
    assert.ok(target, "Chrome page target");
    client = new CdpClient(target.webSocketDebuggerUrl);
    await client.open();
    await client.send("Runtime.enable");
    await client.send("Page.enable");
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 1200,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await client.send("Page.reload");

    await waitFor(client, "document.querySelectorAll('#model-select option').length === 37");
    assert.equal(await client.evaluate("document.querySelectorAll('.bit-card').length"), 8);
    const rlLayout = await layoutMetrics(client);
    assert.equal(rlLayout.viewport, 390, JSON.stringify(rlLayout));
    assert.equal(rlLayout.scrollWidth, rlLayout.viewport, JSON.stringify(rlLayout));

    const rlValues = await client.evaluate(`(() => {
      const input = document.querySelector('.hex-control.primary input');
      input.value = 'FFF7F9';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      return [...document.querySelectorAll('.summary-hex')].map((node) => node.textContent);
    })()`);
    assert.deepEqual(rlValues.slice(0, 3), ["0xFF", "0xF7", "0xF9"]);

    const checkboxUpdate = await client.evaluate(`(() => {
      const before = document.querySelector('input[data-word="C0"]').value;
      document.querySelector('#word-panel .bit-checkbox:not(:disabled)').click();
      return {
        before,
        after: document.querySelector('input[data-word="C0"]').value,
        combined: document.querySelector('.hex-control.primary input').value,
      };
    })()`);
    assert.notEqual(checkboxUpdate.after, checkboxUpdate.before);
    assert.equal(checkboxUpdate.combined.slice(0, 2), checkboxUpdate.after);

    const resetValue = await client.evaluate(`(() => {
      document.querySelector('#reset-defaults').click();
      return document.querySelector('.hex-control.primary input').value;
    })()`);
    assert.equal(resetValue, "367AC9");

    const inputValidation = await client.evaluate(`(() => {
      const input = document.querySelector('input[data-word="C3"]');
      input.value = '8';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      const invalid = input.getAttribute('aria-invalid') === 'true'
        && document.querySelector('#input-status').textContent.includes('恰好為 2');
      input.value = '85';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      return { invalid, recovered: !input.hasAttribute('aria-invalid') };
    })()`);
    assert.deepEqual(inputValidation, { invalid: true, recovered: true });

    const rlModels = await client.evaluate(`(() => {
      const select = document.querySelector('#model-select');
      return [...select.options].map((option) => {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        return {
          model: option.value,
          tabs: document.querySelectorAll('.word-tab').length,
          inputs: document.querySelectorAll('.hex-input').length,
          hasC4: Boolean(document.querySelector('input[data-word="C4"]')),
        };
      });
    })()`);
    assert.equal(rlModels.length, 37);
    assert.ok(rlModels.every((item) => item.tabs === 4 || item.tabs === 5));
    assert.deepEqual(
      rlModels.filter((item) => item.hasC4).map((item) => item.model),
      ["RL78/F22,F25", "RL78/F23,F24"],
    );

    const f22 = await client.evaluate(`(() => {
      const select = document.querySelector('#model-select');
      select.value = 'RL78/F22,F25';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return {
        tabs: document.querySelectorAll('.word-tab').length,
        hasC4: Boolean(document.querySelector('input[data-word="C4"]')),
      };
    })()`);
    assert.deepEqual(f22, { tabs: 5, hasC4: true });

    await client.send("Page.navigate", { url: `${origin}/rh850/` });
    await waitFor(client, "document.querySelectorAll('#model-select option').length === 4");
    assert.equal(await client.evaluate("document.querySelectorAll('.bit-card').length"), 32);
    const rhLayout = await layoutMetrics(client);
    assert.equal(rhLayout.viewport, 390, JSON.stringify(rhLayout));
    assert.equal(rhLayout.scrollWidth, rhLayout.viewport, JSON.stringify(rhLayout));

    const rhResult = await client.evaluate(`(() => {
      const input = document.querySelector('input[data-word="OPBT0"]');
      input.value = '80000001';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      const checked = (bit) => document.querySelector(
        'input[aria-label^="OPBT0 bit' + bit + ' "]'
      ).checked;
      return {
        output: document.querySelector('.summary-hex').textContent,
        bit31: checked(31),
        bit30: checked(30),
        bit0: checked(0),
        hasWarnings: document.querySelectorAll('#warning-list li').length > 0,
      };
    })()`);
    assert.deepEqual(rhResult, {
      output: "0x80000001",
      bit31: true,
      bit30: false,
      bit0: true,
      hasWarnings: true,
    });

    const rhModels = await client.evaluate(`(() => {
      const select = document.querySelector('#model-select');
      return [...select.options].map((option) => {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        return {
          model: option.value,
          tabs: document.querySelectorAll('.word-tab').length,
          inputs: document.querySelectorAll('.hex-input').length,
        };
      });
    })()`);
    assert.equal(rhModels.length, 4);
    assert.ok(rhModels.every((item) => item.tabs === 2 && item.inputs === 2));

    console.log("Browser smoke checks passed for RL78 and RH850.");
  } finally {
    if (client) {
      try {
        await client.send("Browser.close");
      } catch {
        chrome.kill();
      }
      client.close();
    } else {
      chrome.kill();
    }
    if (chrome.exitCode === null) {
      await Promise.race([
        new Promise((resolvePromise) => chrome.once("exit", resolvePromise)),
        new Promise((resolvePromise) => setTimeout(resolvePromise, 3000)),
      ]);
    }
    server.close();
    await removeDirectoryWithRetry(chromeProfile);
  }
}


await run();
