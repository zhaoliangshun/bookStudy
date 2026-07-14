// =============================================================
// 共享沙箱执行工具
// -------------------------------------------------------------
// 作用：把"在 vm 沙箱里执行一段 JS 代码并捕获输出"的逻辑封装起来，
//       供 /api/run（Node.js 教程）和 /api/run-ts（TS 教程）复用。
//
// 设计要点：
// 1. 内置模块白名单预加载到 MODULE_CACHE，避免 Turbopack 静态分析
//    动态 require 报错。
// 2. 提供完整的 process（基于 EventEmitter）、console、require 等全局。
// 3. 用 async IIFE 包裹用户代码，支持顶层 await。
// 4. 执行后做"事件循环排空"等待，让尾随的异步回调能输出。
// =============================================================

import vm from "node:vm";
import { createRequire } from "node:module";
import path from "node:path";
import { EventEmitter } from "node:events";

// stdout/输出最大累计字节数：超过则截断并提示，防止用户代码用
// for 循环大量 console.log 把内存撑爆。
const MAX_OUTPUT_BYTES = 1 * 1024 * 1024; // 1MB

// 通过当前模块路径创建 CommonJS 风格 require
const nodeRequire = createRequire(import.meta.url);

// 允许用户代码 require 的内置模块白名单
export const ALLOWED_MODULES = [
  // 安全：移除 fs，沙箱不允许用户代码直接读写宿主文件系统
  "path",
  "os",
  "url",
  "crypto",
  "util",
  "events",
  "stream",
  "buffer",
  "querystring",
  "string_decoder",
  "zlib",
  "assert",
  "timers",
];

// 模块加载阶段一次性 require 所有允许的模块到缓存。
// 用字面量字符串避免 Turbopack 对动态 require 的静态分析失败。
const MODULE_CACHE = {
  // 安全：不再缓存 fs，require("fs") 会落到 sandboxRequire 抛错分支
  path: nodeRequire("path"),
  os: nodeRequire("os"),
  url: nodeRequire("url"),
  crypto: nodeRequire("crypto"),
  util: nodeRequire("util"),
  events: nodeRequire("events"),
  stream: nodeRequire("stream"),
  buffer: nodeRequire("buffer"),
  querystring: nodeRequire("querystring"),
  string_decoder: nodeRequire("string_decoder"),
  zlib: nodeRequire("zlib"),
  assert: nodeRequire("assert"),
  timers: nodeRequire("timers"),
};

// 把任意值格式化为可读字符串（模拟 console.log 行为）
function formatArg(arg, seen = new WeakSet()) {
  if (typeof arg === "string") return arg;
  if (
    typeof arg === "number" ||
    typeof arg === "boolean" ||
    arg === null ||
    arg === undefined
  ) {
    return String(arg);
  }
  if (typeof arg === "bigint") return arg.toString() + "n";
  if (typeof arg === "function") return arg.toString();
  if (arg instanceof Error) return `${arg.name}: ${arg.message}`;
  if (arg instanceof Buffer) return arg.toString("utf8");
  if (typeof arg === "object") {
    try {
      return JSON.stringify(
        arg,
        (_key, value) => {
          if (typeof value === "bigint") return value.toString() + "n";
          if (typeof value === "function")
            return `[Function: ${value.name || "anonymous"}]`;
          if (value instanceof RegExp) return value.toString();
          if (typeof value === "object" && value !== null) {
            if (seen.has(value)) return "[Circular]";
            seen.add(value);
          }
          return value;
        },
        2
      );
    } catch {
      return String(arg);
    }
  }
  return String(arg);
}

// 安全：判断 URL 是否指向内网/本机地址，用于阻止 SSRF 攻击。
// 拦截范围：
//   - localhost / *.localhost
//   - 127.0.0.0/8、0.0.0.0/8（含 0.0.0.0）
//   - 10.0.0.0/8、172.16.0.0/12、192.168.0.0/16（私网）
//   - 169.254.0.0/16（链路本地 / 云元数据服务，如 AWS 169.254.169.254）
//   - ::1（IPv6 回环）、fc00::/7（IPv6 唯一本地地址）
function isPrivateUrl(urlStr) {
  let parsed;
  try {
    parsed = new URL(urlStr);
  } catch {
    throw new Error("Invalid URL: " + urlStr);
  }
  const hostname = parsed.hostname.toLowerCase();

  // localhost 域名
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    return true;
  }

  // IPv4 解析
  const v4 = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const a = Number(v4[1]);
    const b = Number(v4[2]);
    if (a === 127) return true;                              // 127.0.0.0/8 回环
    if (a === 0) return true;                                // 0.0.0.0/8（含 0.0.0.0）
    if (a === 10) return true;                               // 10.0.0.0/8 私网
    if (a === 192 && b === 168) return true;                 // 192.168.0.0/16 私网
    if (a === 172 && b >= 16 && b <= 31) return true;        // 172.16.0.0/12 私网
    if (a === 169 && b === 254) return true;                 // 169.254.0.0/16 链路本地/云元数据
    return false;
  }

  // IPv6 解析（URL 中可能带方括号）
  const ip = hostname.replace(/^\[|\]$/g, "");
  if (ip === "::1") return true;                             // IPv6 回环
  if (/^f[cd][0-9a-f]{2}(?::|$)/i.test(ip)) return true;     // fc00::/7 唯一本地地址

  return false;
}

/**
 * 在 vm 沙箱中执行一段 JavaScript 代码，捕获输出与异常。
 * @param {string} code - 已转译好的 JS 源代码
 * @returns {Promise<{output: string, error: string|null, exports: any}>}
 */
export async function runInSandbox(code) {
  const logs = [];
  // 累计输出字节数，超过 MAX_OUTPUT_BYTES 后停止 push
  let outputBytes = 0;
  let truncated = false;

  // 用户创建的 timer id 集合：在 finally 中全部清理，
  // 避免 setInterval 残留导致事件循环无法退出、日志串到下次请求
  const userTimers = new Set();

  const pushLog = (text) => {
    if (truncated) return;
    const s = String(text);
    if (outputBytes + s.length > MAX_OUTPUT_BYTES) {
      const remain = MAX_OUTPUT_BYTES - outputBytes;
      if (remain > 0) logs.push(s.slice(0, remain));
      logs.push(`\n[输出已截断] 输出超过 ${MAX_OUTPUT_BYTES} 字节，仅显示前半部分。`);
      truncated = true;
      return;
    }
    logs.push(s);
    outputBytes += s.length;
  };

  const timers = new Map();
  const captureConsole = {
    log: (...args) => pushLog(args.map((a) => formatArg(a)).join(" ")),
    info: (...args) => pushLog(args.map((a) => formatArg(a)).join(" ")),
    warn: (...args) => pushLog(args.map((a) => formatArg(a)).join(" ")),
    error: (...args) => pushLog(args.map((a) => formatArg(a)).join(" ")),
    debug: (...args) => pushLog(args.map((a) => formatArg(a)).join(" ")),
    table: (data) => pushLog(formatArg(data)),
    dir: (obj) => pushLog(formatArg(obj)),
    trace: (...args) =>
      pushLog("Trace: " + args.map((a) => formatArg(a)).join(" ")),
    time: (label = "default") => timers.set(label, process.hrtime.bigint()),
    timeEnd: (label = "default") => {
      const start = timers.get(label);
      if (start !== undefined) {
        const ms = Number(process.hrtime.bigint() - start) / 1e6;
        pushLog(`${label}: ${ms.toFixed(3)}ms`);
        timers.delete(label);
      }
    },
    group: (...args) => pushLog(args.map((a) => formatArg(a)).join(" ")),
    groupEnd: () => {},
    assert: (condition, ...args) => {
      if (!condition) pushLog("Assertion failed: " + args.map((a) => formatArg(a)).join(" "));
    },
    count: (label = "default") => {
      const count = (captureConsole._counts?.[label] || 0) + 1;
      if (!captureConsole._counts) captureConsole._counts = {};
      captureConsole._counts[label] = count;
      pushLog(`${label}: ${count}`);
    },
    // 安全：仅清空日志数组，保留 outputBytes/truncated 累计，
    // 防止用户反复 console.clear() 后大量输出绕过 MAX_OUTPUT_BYTES 上限
    clear: () => { logs.length = 0; },
  };

  // 自定义 require：只放行白名单中的模块
  const sandboxRequire = (moduleName) => {
    if (Object.prototype.hasOwnProperty.call(MODULE_CACHE, moduleName)) {
      return MODULE_CACHE[moduleName];
    }
    throw new Error(
      `模块 "${moduleName}" 不被允许运行。仅支持内置模块：${ALLOWED_MODULES.join(", ")}`
    );
  };

  // 包装 setTimeout/setInterval/setImmediate：记录 id，便于 finally 清理
  const wrapTimer = (originalFn) => (...args) => {
    const id = originalFn(...args);
    userTimers.add(id);
    return id;
  };
  const wrapClear = (originalFn) => (id) => {
    if (id !== undefined && id !== null) userTimers.delete(id);
    return originalFn(id);
  };

  // 构造沙箱上下文
  const sandbox = {
    console: captureConsole,
    require: sandboxRequire,
    module: { exports: {} },
    exports: {},
    Buffer,
    setTimeout: wrapTimer(setTimeout),
    setInterval: wrapTimer(setInterval),
    setImmediate: wrapTimer(setImmediate),
    clearTimeout: wrapClear(clearTimeout),
    clearInterval: wrapClear(clearInterval),
    clearImmediate: wrapClear(clearImmediate),
    process: Object.assign(new EventEmitter(), {
      version: process.version,
      versions: process.versions,
      argv: ["node", "sandbox.js"],
      env: { NODE_ENV: "sandbox", LANG: "en_US.UTF-8", LC_ALL: "en_US.UTF-8" },
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
      cwd: () => process.cwd(),
      // 安全：禁止 chdir，防止用户代码改变工作目录后访问敏感文件
      chdir: () => { throw new Error("chdir is not allowed in sandbox"); },
      uptime: () => process.uptime(),
      hrtime: process.hrtime.bind(process),
      memoryUsage: process.memoryUsage.bind(process),
      cpuUsage: process.cpuUsage.bind(process),
      nextTick: process.nextTick.bind(process),
      stdout: { write: (s) => pushLog(String(s).replace(/\n$/, "")) },
      stderr: { write: (s) => pushLog(String(s).replace(/\n$/, "")) },
      // 安全：暴露假的只读 stdin，避免用户代码通过真实 stdin 读取宿主进程输入
      stdin: { on: () => {}, resume: () => {}, pause: () => {}, read: () => null, isTTY: false },
      exit: (code) => {
        const err = new Error(`process.exit(${code ?? 0}) 被调用，程序结束`);
        err.code = "NODE_EXIT";
        throw err;
      },
    }),
    __dirname: process.cwd(),
    __filename: path.join(process.cwd(), "sandbox.js"),
    URL,
    URLSearchParams,
    TextEncoder,
    TextDecoder,
    performance,
    AbortController,
    fetch: (input, init) => {
      // 安全：SSRF 防护——发起请求前检查目标 URL，阻止访问内网/本机地址
      // input 可能是 string / URL / Request 对象
      const urlStr = typeof input === "string"
        ? input
        : (input && typeof input.url === "string" ? input.url : String(input));
      if (isPrivateUrl(urlStr)) {
        return Promise.reject(
          new Error("Access to internal network addresses is not allowed")
        );
      }
      // 沙箱中的 fetch：转发到全局 fetch，失败时返回错误
      if (typeof fetch === "function") {
        return fetch(input, init);
      }
      return Promise.reject(new TypeError("fetch is not available in this environment"));
    },
  };
  sandbox.exports = sandbox.module.exports;

  // 转发真实进程事件到沙箱 process
  const forwardUnhandled = (reason) => {
    try {
      sandbox.process.emit("unhandledRejection", reason);
    } catch {}
  };
  const forwardWarning = (warning) => {
    try {
      sandbox.process.emit("warning", warning);
    } catch {}
  };
  process.on("unhandledRejection", forwardUnhandled);
  process.on("warning", forwardWarning);

  let raceTimer = null;

  try {
    vm.createContext(sandbox, { name: "tutorial-sandbox" });

    // 包进 async IIFE 支持顶层 await
    const wrappedCode = `(async () => {\n${code}\n})();`;
    const script = new vm.Script(wrappedCode, { filename: "user-code.js" });
    const promise = script.runInContext(sandbox, {
      timeout: 3000,
      displayErrors: true,
    });

    // 等待异步任务完成 + 总超时
    await Promise.race([
      promise,
      new Promise((_, reject) => {
        raceTimer = setTimeout(
          () => reject(new Error("代码执行超时（超过 5 秒）")),
          5000
        );
      }),
    ]);

    // 事件循环排空等待：让 stream/setTimeout 等尾随回调能输出
    let lastLogCount = logs.length;
    for (let i = 0; i < 5; i++) {
      await new Promise((r) => setTimeout(r, 20));
      if (logs.length === lastLogCount) break;
      lastLogCount = logs.length;
    }

    try {
      sandbox.process.emit("exit", 0);
    } catch {}

    return {
      output: logs.join("\n"),
      error: null,
      exports: sandbox.module.exports,
    };
  } catch (err) {
    if (err?.code === "NODE_EXIT") {
      try {
        sandbox.process.emit("exit", 0);
      } catch {}
      return {
        output: logs.join("\n"),
        error: null,
        exports: sandbox.module.exports,
      };
    }
    const message = err?.stack || err?.message || String(err);
    return { output: logs.join("\n"), error: message };
  } finally {
    process.removeListener("unhandledRejection", forwardUnhandled);
    process.removeListener("warning", forwardWarning);
    if (raceTimer) clearTimeout(raceTimer);
    // 清理用户代码创建的所有 timer（setInterval/setTimeout/setImmediate）
    // 防止残留 timer 持续触发，污染下次请求或阻止事件循环退出
    for (const id of userTimers) {
      try { clearTimeout(id); } catch {}
      try { clearInterval(id); } catch {}
      try { clearImmediate(id); } catch {}
    }
    userTimers.clear();
  }
}
