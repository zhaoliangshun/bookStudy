// =============================================================
// React 沙箱页面
// -------------------------------------------------------------
// 左侧：Monaco 代码编辑器（支持 JSX / TSX 语法高亮）
// 右侧：实时预览 iframe + 控制台输出
//
// 工作原理：
//   1. 用户在左侧编辑 React 代码（必须 export default 一个组件）
//   2. 代码通过 postMessage 发送到右侧 iframe
//   3. iframe 内用 Babel Standalone 转译 JSX / TS
//   4. 把裸模块导入（import xxx from 'pkg'）改写为 esm.sh CDN URL
//   5. 用 Blob URL 动态 import 用户模块，拿到 default 导出
//   6. 用 ReactDOM.createRoot 渲染默认导出
//
// 安全设计：
//   - iframe sandbox="allow-scripts"（不含 allow-same-origin），
//     与父页面同源隔离，无法访问父窗口的 cookie / localStorage
//   - 通过 postMessage 双向通信
//   - 重写 iframe 内的 console.* 收集输出回传父窗口
//   - window.onerror / unhandledrejection 捕获错误
//
// 快捷键：
//   Ctrl/Cmd + Enter  运行代码
//   Ctrl/Cmd + S      保存到本地
// =============================================================

"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";

// Monaco Editor 依赖浏览器环境，必须关 SSR
const MonacoEditor = dynamic(
  () => import("../components/MonacoEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="monaco-loading-placeholder">
        正在加载编辑器…
      </div>
    ),
  }
);

// =============================================================
// 默认示例代码
// -------------------------------------------------------------
// 展示：useState 状态、事件处理、列表渲染、第三方包导入
// 用户可在此基础上自由修改
// =============================================================
const DEFAULT_CODE = `// React 沙箱：左侧写代码，右侧实时渲染
// 1. 可以导入任意 npm 包（自动通过 esm.sh CDN 加载）
// 2. 代码末尾必须 export default 一个 React 组件
// 3. 按 Ctrl/Cmd + Enter 运行，或开启自动运行
// 4. 下方 CSS 编辑器写的样式会自动注入预览 iframe

import { useState } from 'react';
// 取消下面这行注释试试导入第三方包
// import { marked } from 'marked';

function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('世界');
  const [items, setItems] = useState(['苹果', '香蕉', '橙子']);

  const addItem = () => {
    setItems(prev => [...prev, \`项目 \${prev.length + 1}\`]);
  };

  return (
    <div className="app">
      <h1 className="title">
        你好, {name}!
      </h1>

      <label className="field">
        <span className="field-label">你的名字：</span>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="输入名字"
        />
      </label>

      <section className="card">
        <h3 className="card-title">计数器</h3>
        <p className="counter-text">
          当前值：<strong className="counter-value">{count}</strong>
        </p>
        <div className="btn-group">
          <button className="btn" onClick={() => setCount(c => c + 1)}>+1</button>
          <button className="btn" onClick={() => setCount(c => c - 1)}>-1</button>
          <button className="btn btn-reset" onClick={() => setCount(0)}>重置</button>
        </div>
      </section>

      <section className="card">
        <h3 className="card-title">列表（共 {items.length} 项）</h3>
        <ul className="list">
          {items.map((item, i) => (
            <li key={i} className="list-item">{item}</li>
          ))}
        </ul>
        <button className="btn" onClick={addItem}>添加项目</button>
      </section>
    </div>
  );
}

export default App;
`;

// =============================================================
// 默认 CSS 代码
// -------------------------------------------------------------
// 演示常见样式：卡片布局、按钮、列表
// 用户可自由修改，修改后会自动注入预览 iframe
// =============================================================
const DEFAULT_CSS = `/* React 沙箱：CSS 样式 */
/* 修改后会自动注入预览 iframe，无需重新运行 */

.app {
  padding: 24px;
  max-width: 520px;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  color: #1e293b;
}

.title {
  color: #2563eb;
  margin: 0 0 20px;
  font-size: 24px;
}

.field {
  display: block;
  margin-bottom: 20px;
}

.field-label {
  display: block;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 4px;
}

.input {
  padding: 8px 12px;
  font-size: 14px;
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  box-sizing: border-box;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-title {
  margin: 0 0 12px;
  font-size: 15px;
  color: #334155;
}

.counter-text {
  margin: 0 0 12px;
}

.counter-value {
  font-size: 20px;
  color: #2563eb;
  font-weight: 700;
}

.btn-group {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 6px 14px;
  font-size: 13px;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  color: #334155;
}

.btn:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.btn:active {
  transform: translateY(1px);
}

.btn-reset {
  color: #dc2626;
  border-color: #fecaca;
}

.btn-reset:hover {
  background: #fef2f2;
  border-color: #f87171;
}

.list {
  margin: 0 0 12px;
  padding-left: 20px;
}

.list-item {
  padding: 4px 0;
  color: #475569;
}

.list-item:hover {
  color: #2563eb;
}
`;

// localStorage 存储 key
const STORAGE_KEY = "react-sandbox:code";
const CSS_STORAGE_KEY = "react-sandbox:css";

// =============================================================
// iframe HTML 文档构造
// -------------------------------------------------------------
// 这个 HTML 加载到右侧 iframe 中，作为 React 运行时环境：
//   - 加载 Babel Standalone 用于 JSX / TS 转译
//   - 重写 console.* 把输出转发到父窗口
//   - 监听 window.error / unhandledrejection 捕获错误
//   - 接收父窗口的 postMessage 触发代码执行
//   - 用 Blob URL + 动态 import 加载用户模块
// =============================================================
function buildIframeHtml() {
  // 注意：在模板字符串里写 JS 字符串需要双重转义
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  html, body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
  #root { min-height: 100vh; }
  #rs-loading {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.9); color: #64748b;
    font-size: 13px; pointer-events: none;
  }
</style>
<!-- 用户 CSS 会动态注入到这里 -->
<style id="rs-user-style"></style>
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@19.2.4",
    "react/jsx-runtime": "https://esm.sh/react@19.2.4/jsx-runtime",
    "react/jsx-dev-runtime": "https://esm.sh/react@19.2.4/jsx-dev-runtime",
    "react-dom": "https://esm.sh/react-dom@19.2.4",
    "react-dom/client": "https://esm.sh/react-dom@19.2.4/client"
  }
}
</script>
<script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.26.4/babel.min.js"></script>
</head>
<body>
<div id="root"></div>
<div id="rs-loading" style="display:none;">正在编译运行…</div>
<script type="module">
  // ---------- 控制台转发 ----------
  // 重写 console.* 把输出通过 postMessage 转发到父窗口显示
  ['log','info','warn','error','debug'].forEach(level => {
    var orig = console[level] ? console[level].bind(console) : function(){};
    console[level] = function () {
      var args = Array.prototype.slice.call(arguments);
      var serialized = args.map(function (a) {
        if (a === null) return 'null';
        if (a === undefined) return 'undefined';
        if (typeof a === 'function') return a.toString();
        if (typeof a === 'object') {
          try {
            // 处理循环引用：用 Error 兜底
            var seen = [];
            return JSON.stringify(a, function (k, v) {
              if (typeof v === 'object' && v !== null) {
                if (seen.indexOf(v) >= 0) return '[Circular]';
                seen.push(v);
              }
              if (typeof v === 'function') return '[Function]';
              if (typeof v === 'undefined') return '[Undefined]';
              return v;
            }, 2);
          } catch (e) { return String(a); }
        }
        return String(a);
      });
      parent.postMessage({
        type: 'rs-log',
        level: level,
        args: serialized
      }, '*');
      orig.apply(console, args);
    };
  });

  // ---------- 错误捕获 ----------
  window.addEventListener('error', function (e) {
    var msg = e.message || '未知错误';
    if (e.filename || e.lineno) {
      msg += '\\n  at ' + (e.filename || '<inline>') + ':' + (e.lineno || 0) + ':' + (e.colno || 0);
    }
    if (e.error && e.error.stack) msg += '\\n' + e.error.stack;
    parent.postMessage({ type: 'rs-error', message: msg }, '*');
  });
  window.addEventListener('unhandledrejection', function (e) {
    var reason = e.reason;
    var msg = 'Unhandled Promise Rejection: ';
    if (reason && reason.message) msg += reason.message + (reason.stack ? '\\n' + reason.stack : '');
    else msg = msg + String(reason);
    parent.postMessage({ type: 'rs-error', message: msg }, '*');
  });

  // ---------- 运行时状态 ----------
  var currentRoot = null;
  var currentBlobUrl = null;

  function showLoading(show) {
    var el = document.getElementById('rs-loading');
    if (el) el.style.display = show ? 'flex' : 'none';
  }

  // ---------- 卸载当前组件并清理 ----------
  function unmountCurrent() {
    if (currentRoot) {
      try { currentRoot.unmount(); } catch (e) {}
      currentRoot = null;
    }
    var rootEl = document.getElementById('root');
    if (rootEl) rootEl.innerHTML = '';
    if (currentBlobUrl) {
      try { URL.revokeObjectURL(currentBlobUrl); } catch (e) {}
      currentBlobUrl = null;
    }
  }

  // ---------- 核心执行函数 ----------
  async function runCode(code) {
    parent.postMessage({ type: 'rs-clear' }, '*');
    showLoading(true);

    try {
      // 1. 用 Babel 转译 JSX / TS
      //    - preset-env (modules:false)：保留 ES module 语法
      //    - preset-react (runtime:automatic)：使用新 JSX 转换，无需 import React
      //    - preset-typescript：允许 TS 语法
      if (typeof Babel === 'undefined') {
        throw new Error('Babel Standalone 还未加载完成，请稍后再试');
      }

      var transpiled = Babel.transform(code, {
        presets: [
          ['env', { modules: false, targets: { esmodules: true } }],
          ['react', { runtime: 'automatic' }],
          'typescript'
        ],
        filename: 'user.tsx'
      }).code;

      // 2. 把裸模块导入改写为 esm.sh CDN URL
      //    形如：import xxx from 'pkg' → import xxx from 'https://esm.sh/pkg'
      //    跳过相对路径、绝对路径、完整 URL
      //    跳过 react / react-dom 及其子路径：它们走 iframe 的 import map，
      //    这样用户代码里的 React 和运行时渲染用的 React 是同一个实例，
      //    否则会出现 "Cannot read properties of null (reading 'useState')"
      //    这种 Hooks 错误（两个 React 实例的 internal state 不互通）
      var cdnCode = transpiled.replace(
        /(\\bfrom\\s+|\\bimport\\s+|\\bexport\\s+from\\s+)(['"])([^'"\\s]+)['"]/g,
        function (match, kw, quote, pkg) {
          if (pkg.charAt(0) === '.' || pkg.charAt(0) === '/' || pkg.indexOf('http') === 0) {
            return match;
          }
          // react / react-dom / react/jsx-runtime / react-dom/client 等保持原样，
          // 由 import map 解析到固定版本
          if (pkg === 'react' || pkg === 'react-dom' ||
              pkg.indexOf('react/') === 0 || pkg.indexOf('react-dom/') === 0) {
            return match;
          }
          return kw + quote + 'https://esm.sh/' + pkg + quote;
        }
      );

      // 3. 生成 Blob URL 并动态 import 用户代码
      var blob = new Blob([cdnCode], { type: 'text/javascript' });
      currentBlobUrl = URL.createObjectURL(blob);

      var mod;
      try {
        mod = await import(currentBlobUrl);
      } finally {
        // 加载完成后立即释放 Blob URL（模块已缓存到内存）
        try { URL.revokeObjectURL(currentBlobUrl); } catch (e) {}
        currentBlobUrl = null;
      }

      if (!mod.default) {
        throw new Error('代码必须 export default 一个 React 组件（当前没有默认导出）');
      }
      if (typeof mod.default !== 'function' && typeof mod.default !== 'object') {
        throw new Error('默认导出必须是 React 组件（函数或类），当前类型：' + typeof mod.default);
      }

      // 4. 卸载之前的组件，再渲染新的
      unmountCurrent();

      // 5. 用 ReactDOM 渲染默认导出
      //    关键：通过裸模块名 'react' / 'react-dom/client' 加载，
      //    与用户代码用的是同一个 React 实例（都走 import map）。
      //    否则会因为存在两个 React 实例，useState 找不到对应的 renderer internals
      //    而报 "Cannot read properties of null (reading 'useState')"。
      var React = await import('react');
      var ReactDOMClient = await import('react-dom/client');

      var rootEl = document.getElementById('root');
      currentRoot = ReactDOMClient.createRoot(rootEl);
      currentRoot.render(React.createElement(mod.default));

      parent.postMessage({ type: 'rs-success' }, '*');
    } catch (err) {
      var errMsg = err && err.message ? err.message : String(err);
      if (err && err.stack) errMsg += '\\n' + err.stack;
      parent.postMessage({ type: 'rs-error', message: errMsg }, '*');
    } finally {
      showLoading(false);
    }
  }

  // ---------- 监听父窗口消息 ----------
  window.addEventListener('message', function (event) {
    var data = event.data;
    if (!data || typeof data !== 'object') return;
    if (data.type === 'rs-run') {
      runCode(data.code);
    } else if (data.type === 'rs-update-css') {
      // 注入 / 更新用户 CSS：直接替换 <style id="rs-user-style"> 的内容
      // 不需要重新运行 React，浏览器会自动重新应用样式
      var styleEl = document.getElementById('rs-user-style');
      if (styleEl) {
        styleEl.textContent = data.css || '';
      }
    }
  });

  // 通知父窗口已就绪
  parent.postMessage({ type: 'rs-ready' }, '*');
</script>
</body>
</html>`;
}

// =============================================================
// 主页面组件
// =============================================================
export default function ReactSandboxPage() {
  // ---------- 状态管理 ----------
  // 用户代码（初始用默认代码，避免 SSR/客户端 hydration 不一致）
  const [code, setCode] = useState(DEFAULT_CODE);
  // 用户 CSS（同样初始用默认 CSS，避免 SSR 不一致）
  const [css, setCss] = useState(DEFAULT_CSS);
  // 控制台日志列表：[{ level, text, ts }]
  const [logs, setLogs] = useState([]);
  // 错误信息
  const [error, setError] = useState("");
  // 是否正在运行
  const [isRunning, setIsRunning] = useState(false);
  // isRunning 的 ref：让 runCode 内部访问最新值而不把它作为依赖，
  // 避免"isRunning 变化 → runCode 重建 → 自动运行 effect 触发 → 又运行"
  // 这种死循环
  const isRunningRef = useRef(false);
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);
  // 是否运行过
  const [hasRun, setHasRun] = useState(false);
  // 自动运行开关
  const [autoRun, setAutoRun] = useState(true);
  // 工具栏可见性（默认显示，可点击 ✕ 收起腾出空间）
  const [toolbarVisible, setToolbarVisible] = useState(true);
  // 保存提示 toast
  const [toast, setToast] = useState("");
  // iframe 是否已就绪（Babel 加载完成、监听器已注册）
  const [iframeReady, setIframeReady] = useState(false);
  // 当前激活的编辑器 tab：'tsx' 或 'css'
  // 两个 tab 切换显示，而不是上下分栏，最大化编辑器可用空间
  const [activeTab, setActiveTab] = useState("tsx");
  // 控制台是否展开（默认折叠，给预览区留更多空间）
  const [consoleOpen, setConsoleOpen] = useState(false);

  // ---------- ref ----------
  // iframe DOM 引用
  const iframeRef = useRef(null);
  // iframe 未就绪时暂存待运行的代码，就绪后立即执行
  const pendingCodeRef = useRef(null);
  // 运行请求 ID（用于丢弃过期请求）
  const runIdRef = useRef(0);
  // toast 定时器
  const toastTimerRef = useRef(null);
  // 暂存的 CSS：iframe 就绪前用户改了 CSS，先存这里，就绪后注入
  const pendingCssRef = useRef(null);

  // ---------- iframe 初始化 ----------
  // 用 useMemo 缓存 HTML 字符串，避免每次渲染都重新构造
  const iframeHtml = useMemo(() => buildIframeHtml(), []);

  // ---------- 加载本地保存的代码 ----------
  // 在挂载后从 localStorage 读取，避免 SSR 不一致
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        const savedCode = localStorage.getItem(STORAGE_KEY);
        if (savedCode !== null && savedCode !== DEFAULT_CODE) {
          setCode(savedCode);
        }
        const savedCss = localStorage.getItem(CSS_STORAGE_KEY);
        if (savedCss !== null && savedCss !== DEFAULT_CSS) {
          setCss(savedCss);
        }
      } catch {}
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // ---------- 自动保存（防抖） ----------
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, code);
      } catch {}
    }, 800);
    return () => clearTimeout(timer);
  }, [code]);

  // ---------- CSS 自动保存（防抖） ----------
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(CSS_STORAGE_KEY, css);
      } catch {}
    }, 800);
    return () => clearTimeout(timer);
  }, [css]);

  // ---------- 向 iframe 发送运行消息 ----------
  // 必须在监听 iframe 消息的 useEffect 之前定义，
  // 否则依赖数组 [sendRunMessage] 会触发 TDZ 错误
  const sendRunMessage = useCallback((codeToRun) => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage({ type: "rs-run", code: codeToRun }, "*");
  }, []);

  // ---------- 向 iframe 发送 CSS 更新消息 ----------
  // CSS 不需要重新运行 React，直接更新 <style> 标签内容即可
  const sendCssUpdate = useCallback((cssToUpdate) => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage(
      { type: "rs-update-css", css: cssToUpdate },
      "*"
    );
  }, []);

  // ---------- css 的 ref ----------
  // 让事件监听器能拿到最新 css 而不用把它加入 deps（避免重新注册监听）
  const cssRef = useRef(css);
  useEffect(() => {
    cssRef.current = css;
  }, [css]);

  // ---------- CSS 自动注入（防抖 300ms） ----------
  // CSS 修改不触发 React 重渲染，只更新 iframe 里的 <style>，
  // 比代码运行的防抖时间短，体验更即时
  useEffect(() => {
    if (!iframeReady) return;
    const timer = setTimeout(() => {
      sendCssUpdate(css);
    }, 300);
    return () => clearTimeout(timer);
  }, [css, iframeReady, sendCssUpdate]);

  // ---------- iframe 就绪后立即注入初始 CSS ----------
  // 确保 React 渲染前，CSS 样式已经生效（避免首屏无样式闪烁）
  // 用 cssRef 拿最新 css，不把它加入 deps（避免每次改 css 都重新触发）
  useEffect(() => {
    if (iframeReady) {
      sendCssUpdate(cssRef.current);
    }
  }, [iframeReady, sendCssUpdate]);

  // ---------- 监听 iframe 消息 ----------
  useEffect(() => {
    const handler = (event) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;

      // 安全：只接受来自当前 iframe 的消息
      const iframe = iframeRef.current;
      if (iframe && event.source !== iframe.contentWindow) return;

      switch (data.type) {
        case "rs-ready":
          setIframeReady(true);
          // iframe 就绪后，先把当前 CSS 注入进去（React 还没运行也能先有样式）
          // 用 cssRef 拿最新值，避免把 css 加入 effect deps 导致重新注册监听器
          sendCssUpdate(cssRef.current);
          // 如果有等待执行的代码，立即执行
          if (pendingCodeRef.current !== null) {
            const c = pendingCodeRef.current;
            pendingCodeRef.current = null;
            sendRunMessage(c);
          }
          break;

        case "rs-log":
          setLogs((prev) => [
            ...prev,
            {
              level: data.level,
              text: data.args.join(" "),
              ts: Date.now(),
            },
          ]);
          break;

        case "rs-clear":
          setLogs([]);
          setError("");
          break;

        case "rs-error":
          setError(data.message || "未知错误");
          setIsRunning(false);
          break;

        case "rs-success":
          setIsRunning(false);
          setHasRun(true);
          break;
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [sendRunMessage]);

  // ---------- 运行代码 ----------
  // silent: true 表示自动运行，不显示"正在执行"占位
  // 注意依赖：不包含 isRunning！否则运行结束(isRunning:true→false)时
  // runCode 会重建，触发自动运行 effect 再次执行，形成死循环。
  // 用 isRunningRef 在回调内部访问最新值即可。
  const runCode = useCallback(
    (silent = false) => {
      const currentId = ++runIdRef.current;
      setIsRunning(true);
      if (!silent) {
        setLogs([]);
        setError("");
      }

      if (!iframeReady) {
        // iframe 还没准备好，等 ready 后自动执行
        pendingCodeRef.current = code;
        return;
      }

      // 清空旧结果
      setLogs([]);
      setError("");
      sendRunMessage(code);

      // 超时保护：30 秒未响应则报告错误
      // （包加载可能较慢，给足时间）
      setTimeout(() => {
        if (runIdRef.current === currentId && isRunningRef.current) {
          setError("运行超时（30 秒），可能是因为：\n1. 网络较慢，npm 包加载超时\n2. 代码中有死循环\n3. 导入的包不存在");
          setIsRunning(false);
        }
      }, 30000);
    },
    [code, iframeReady, sendRunMessage]
  );

  // ---------- 自动运行（防抖 800ms） ----------
  // 关键：只在 code / autoRun / iframeReady 变化时触发，
  // 不依赖 runCode。这样运行结束后 isRunning 变化不会触发新一轮自动运行。
  // 用 runCodeRef 拿到最新的 runCode 实现，避免闭包陈旧。
  const runCodeRef = useRef(runCode);
  useEffect(() => {
    runCodeRef.current = runCode;
  }, [runCode]);

  useEffect(() => {
    if (!autoRun || !iframeReady) return;
    const timer = setTimeout(() => {
      runCodeRef.current(true);
    }, 800);
    return () => clearTimeout(timer);
  }, [code, autoRun, iframeReady]);

  // ---------- 显示 toast 提示 ----------
  // 提前定义：下面的 manualSave / resetCode / keydown 处理器都要用
  const showToast = useCallback((msg) => {
    setToast(msg);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToast("");
      toastTimerRef.current = null;
    }, 1600);
  }, []);

  // ---------- 手动保存 ----------
  const manualSave = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, code);
      localStorage.setItem(CSS_STORAGE_KEY, css);
      showToast("已保存到本地");
    } catch {
      showToast("保存失败");
    }
  }, [code, css, showToast]);

  // ---------- 全局快捷键：Ctrl/Cmd + Enter 运行 ----------
  useEffect(() => {
    const handler = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === "Enter") {
        if (!(document.activeElement instanceof HTMLTextAreaElement)) {
          e.preventDefault();
          runCode();
        }
      } else if (mod && e.key === "s") {
        e.preventDefault();
        manualSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [runCode, manualSave]);

  // ---------- 组件卸载清理 ----------
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // ---------- 重置代码（同时重置 CSS） ----------
  const resetCode = useCallback(() => {
    setCode(DEFAULT_CODE);
    setCss(DEFAULT_CSS);
    setLogs([]);
    setError("");
    setHasRun(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CSS_STORAGE_KEY);
    } catch {}
    showToast("已重置为默认代码和样式");
  }, [showToast]);

  // ---------- 清空控制台 ----------
  const clearConsole = useCallback(() => {
    setLogs([]);
    setError("");
  }, []);

  // ---------- 复制代码 ----------
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);

  const handleCopy = useCallback(async () => {
    // 根据当前激活的 tab 复制对应内容
    const textToCopy = activeTab === "tsx" ? code : css;
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = textToCopy;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {}
    }
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 1500);
  }, [code, css, activeTab]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  // ---------- 衍生状态 ----------
  const lineCount = useMemo(() => code.split("\n").length, [code]);
  const charCount = code.length;
  const cssLineCount = useMemo(() => css.split("\n").length, [css]);
  const cssCharCount = css.length;
  // 任意一个有改动就显示"重置"按钮
  const hasChanges = code !== DEFAULT_CODE || css !== DEFAULT_CSS;
  const errorLogCount = logs.filter((l) => l.level === "error").length;
  const warnLogCount = logs.filter((l) => l.level === "warn").length;

  return (
    <div className="app-shell">
      <main className="content playground-content playground-fullscreen">
        {/* 工具栏切换按钮 */}
        {!toolbarVisible && (
          <button
            className="pg-toolbar-toggle"
            onClick={() => setToolbarVisible(true)}
            title="显示工具栏"
            aria-label="显示工具栏"
          >
            ☰
          </button>
        )}

        {/* 顶部工具栏 */}
        <div className={`pg-toolbar${toolbarVisible ? "" : " pg-toolbar-hidden"}`}>
          <div className="pg-pane-label">
            <span className="dot dot-red"></span>
            <span className="dot dot-yellow"></span>
            <span className="dot dot-green"></span>
            <span className="pg-pane-title">React 沙箱</span>
            <span className="pg-filename">app.tsx</span>
          </div>

          <div className="pg-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setAutoRun((v) => !v)}
              title="代码改变后自动执行（TSX 0.8s / CSS 0.3s）"
            >
              {autoRun ? "⚡ 自动运行: 开" : "⏸ 自动运行: 关"}
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleCopy}
              title="复制当前 tab 的代码"
            >
              {copied ? "✓ 已复制" : "复制"}
            </button>
            <button
              className="btn btn-secondary"
              onClick={manualSave}
              title="保存到本地 (Ctrl/Cmd+S)"
            >
              💾 保存
            </button>
            {hasChanges && (
              <button
                className="btn btn-secondary"
                onClick={resetCode}
                title="恢复默认代码和样式"
              >
                ↺ 重置
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={() => runCode(false)}
              disabled={isRunning}
              title="运行代码 (Ctrl/Cmd+Enter)"
            >
              {isRunning ? "⏳ 运行中..." : "▶ 运行"}
            </button>
            <button
              className="pg-toolbar-close"
              onClick={() => setToolbarVisible(false)}
              title="收起工具栏"
              aria-label="收起工具栏"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 左右分栏：编辑器 + 预览 */}
        <div className="pg-split rs-split">
          {/* 左侧：代码编辑器（tab 切换 TSX / CSS，同一时刻只显示一个） */}
          <section
            className="pg-editor-pane rs-editor-pane"
            style={{ flexGrow: 0.5, flexShrink: 1, flexBasis: 0 }}
          >
            {/* 编辑器顶部 tab 切换：TSX / CSS（始终可见，不依赖工具栏） */}
            <div className="rs-editor-tabs" role="tablist" aria-label="编辑器切换">
              <button
                className={`rs-editor-tab ${activeTab === "tsx" ? "active" : ""}`}
                onClick={() => setActiveTab("tsx")}
                role="tab"
                aria-selected={activeTab === "tsx"}
                title="切换到 TSX 代码编辑器"
              >
                TSX
              </button>
              <button
                className={`rs-editor-tab ${activeTab === "css" ? "active" : ""}`}
                onClick={() => setActiveTab("css")}
                role="tab"
                aria-selected={activeTab === "css"}
                title="切换到 CSS 样式编辑器"
              >
                CSS
              </button>
              <span className="rs-editor-tab-info">
                {activeTab === "tsx"
                  ? `${lineCount} 行 · ${charCount} 字`
                  : `${cssLineCount} 行 · ${cssCharCount} 字`}
              </span>
            </div>

            {/* 只渲染当前激活的编辑器，避免隐藏容器中 Monaco 尺寸测量失败 */}
            {activeTab === "tsx" ? (
              <div className="rs-editor-pane-content active">
                <div className="editor-wrap pg-editor-wrap">
                  <MonacoEditor
                    value={code}
                    onChange={setCode}
                    language="tsx"
                    onRun={() => runCode(false)}
                  />
                </div>
              </div>
            ) : (
              <div className="rs-editor-pane-content active">
                <div className="editor-wrap pg-editor-wrap">
                  <MonacoEditor
                    value={css}
                    onChange={setCss}
                    language="css"
                  />
                </div>
              </div>
            )}
          </section>

          {/* 分隔条（视觉用，固定 50/50 不拖动） */}
          <div className="pg-split-divider" title="React 沙箱为固定分栏" />

          {/* 右侧：实时预览 + 可折叠控制台 */}
          <section
            className="pg-output-pane rs-preview-pane"
            style={{ flexGrow: 0.5, flexShrink: 1, flexBasis: 0 }}
          >
            {/* 预览区：控制台折叠时占据全部右侧空间 */}
            <div className="rs-preview-wrap">
              <div className="pg-pane-header">
                <div className="pg-pane-label">
                  <span className="pg-pane-title">实时预览</span>
                </div>
                <span className="pg-pane-hint">
                  {isRunning
                    ? "运行中..."
                    : hasRun
                    ? error
                      ? "运行出错"
                      : "运行成功"
                    : iframeReady
                    ? "点击运行查看效果"
                    : "正在加载运行时…"}
                </span>
              </div>
              <div className="rs-iframe-container">
                <iframe
                  ref={iframeRef}
                  srcDoc={iframeHtml}
                  sandbox="allow-scripts"
                  title="React 预览"
                  className="rs-preview-iframe"
                />
              </div>
            </div>

            {/* 控制台：可折叠，默认隐藏 */}
            <div className={`rs-console-wrap ${consoleOpen ? "open" : "collapsed"}`}>
              <button
                className="rs-console-toggle"
                onClick={() => setConsoleOpen((v) => !v)}
                title={consoleOpen ? "收起控制台" : "展开控制台"}
                aria-expanded={consoleOpen}
              >
                <span className="rs-console-toggle-arrow">
                  {consoleOpen ? "▼" : "▶"}
                </span>
                <span className="rs-console-toggle-title">控制台</span>
                {errorLogCount > 0 && (
                  <span className="rs-badge rs-badge-error">
                    {errorLogCount} 错误
                  </span>
                )}
                {warnLogCount > 0 && (
                  <span className="rs-badge rs-badge-warn">
                    {warnLogCount} 警告
                  </span>
                )}
                {logs.length > 0 && (
                  <span className="rs-badge">{logs.length} 条</span>
                )}
                {!consoleOpen && logs.length === 0 && !error && (
                  <span className="rs-console-toggle-empty">无输出</span>
                )}
              </button>
              {consoleOpen && (
                <div className="rs-console-body">
                  <div className="rs-console-toolbar">
                    <span className="rs-console-toolbar-hint">
                      console 输出（log / warn / error / debug）
                    </span>
                    <button
                      className="rs-console-clear"
                      onClick={clearConsole}
                      title="清空控制台"
                    >
                      🗑 清空
                    </button>
                  </div>
                  <div className="rs-console-content">
                    {error && (
                      <pre className="rs-console-error">{error}</pre>
                    )}
                    {logs.length === 0 && !error && (
                      <div className="rs-console-empty">
                        暂无输出，代码里调用 console.log 试试看
                      </div>
                    )}
                    {logs.map((log, i) => (
                      <div
                        key={i}
                        className={`rs-console-log rs-log-${log.level}`}
                      >
                        <span className="rs-log-level">[{log.level}]</span>
                        <span className="rs-log-text">{log.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* 底部状态栏 */}
        <div className="pg-statusbar">
          <span className="pg-status-item">⚛ React 19.2.4</span>
          <span className="pg-status-item">
            {iframeReady ? "运行时已就绪" : "运行时加载中…"}
          </span>
          <span className="pg-status-item">
            {activeTab === "tsx" ? "TSX 编辑器" : "CSS 编辑器"}
          </span>
          <span className="pg-status-item pg-status-hint">
            {autoRun
              ? "⚡ 自动运行 · TSX 0.8s / CSS 0.3s"
              : "Ctrl/Cmd + Enter 运行 · Ctrl/Cmd + S 保存"}
          </span>
        </div>
      </main>

      {toast && <div className="pg-toast">{toast}</div>}
    </div>
  );
}
