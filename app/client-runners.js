// =============================================================
// 浏览器端代码运行器（共享模块）
// -------------------------------------------------------------
// 提供在浏览器 iframe 沙箱中运行 JavaScript 和 React 代码的功能
// 供 Playground 页面和 CodeBlock 组件共同使用
// =============================================================

"use client";

export function createRunnerIframe(options = {}) {
  const { visible = false } = options;
  const iframe = document.createElement("iframe");
  iframe.setAttribute("sandbox", "allow-scripts allow-popups");
  if (!visible) {
    iframe.style.display = "none";
  }
  return iframe;
}

export function setupIframeMessaging(iframe, resultType, timeoutMs, resolve) {
  const handler = (event) => {
    if (event.source !== iframe.contentWindow) return;
    const data = event.data;
    if (!data || data.type !== resultType) return;
    window.removeEventListener("message", handler);
    clearTimeout(timer);
    if (iframe.parentNode && !iframe._retained) {
      iframe.parentNode.removeChild(iframe);
    }
    resolve(data);
  };
  window.addEventListener("message", handler);
  const timer = setTimeout(() => {
    window.removeEventListener("message", handler);
    if (iframe.parentNode && !iframe._retained) {
      iframe.parentNode.removeChild(iframe);
    }
    resolve({ type: resultType, logs: [], errors: ["执行超时（10 秒），请检查是否有死循环或异步阻塞。"] });
  }, timeoutMs);
  return { handler, timer };
}

export function encodeCodeForScript(code) {
  return code
    .replace(/\\/g, "\\\\")
    .replace(/<\/script>/gi, "<\\/script>")
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .replace(/'/g, "\\'");
}

export async function runClientReact(code, containerRef) {
  return new Promise((resolve) => {
    const encodedCode = encodeCodeForScript(code);

    const html = '<!DOCTYPE html>' +
'<html>' +
'<head>' +
'  <meta charset="utf-8">' +
'  <meta name="viewport" content="width=device-width,initial-scale=1">' +
'  <style>' +
'    * { box-sizing: border-box; margin: 0; padding: 0; }' +
'    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 16px; background: #fff; color: #000; }' +
'    #root { min-height: 50px; }' +
'    .react-error { color: #e53935; background: #ffebee; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 13px; white-space: pre-wrap; word-break: break-word; border-left: 4px solid #e53935; }' +
'    button { font-family: inherit; font-size: 14px; padding: 8px 16px; border-radius: 6px; border: 1px solid #d0d7de; background: #f6f8fa; cursor: pointer; transition: background 0.15s; }' +
'    button:hover { background: #eaeef2; }' +
'    button.primary { background: #2563eb; color: #fff; border-color: #2563eb; }' +
'    button.primary:hover { background: #1d4ed8; }' +
'    input, textarea { font-family: inherit; font-size: 14px; padding: 8px 12px; border-radius: 6px; border: 1px solid #d0d7de; outline: none; }' +
'    input:focus, textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }' +
'  </style>' +
'</head>' +
'<body>' +
'  <div id="root"></div>' +
'  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"><\/script>' +
'  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>' +
'  <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>' +
'  <script>' +
'    (function () {' +
'      var __logs = [];' +
'      function __fmt(a) {' +
'        if (a === null) return "null";' +
'        if (a === undefined) return "undefined";' +
'        if (typeof a === "object") {' +
'          try { return JSON.stringify(a, null, 2); }' +
'          catch (e) { return String(a); }' +
'        }' +
'        return String(a);' +
'      }' +
'      ["log","info","warn","error","debug"].forEach(function (level) {' +
'        var orig = console[level] ? console[level].bind(console) : function(){};' +
'        console[level] = function () {' +
'          var args = Array.prototype.slice.call(arguments);' +
'          var msg = args.map(__fmt).join(" ");' +
'          __logs.push(msg);' +
'          orig.apply(console, args);' +
'        };' +
'      });' +
'' +
'      window.onerror = function (msg, src, line, col, err) {' +
'        var errMsg = msg + (line ? " (line " + line + ")" : "");' +
'        if (err && err.stack) errMsg = err.message + "\\n" + err.stack;' +
'        renderError(errMsg);' +
'        window.parent.postMessage({ type: "pg-react-result", logs: __logs, errors: [errMsg], rendered: true }, "*");' +
'        return true;' +
'      };' +
'      window.addEventListener("unhandledrejection", function(e) {' +
'        var msg = "Unhandled Promise: " + (e.reason && e.reason.message ? e.reason.message : e.reason);' +
'        renderError(msg);' +
'      });' +
'' +
'      function renderError(msg) {' +
'        var root = document.getElementById("root");' +
'        root.innerHTML = "<div class=\\"react-error\\">" + msg.replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</div>";' +
'      }' +
'' +
'      function postResult(errors, extra) {' +
'        window.parent.postMessage(Object.assign({' +
'          type: "pg-react-result",' +
'          logs: __logs,' +
'          errors: errors || [],' +
'          rendered: true' +
'        }, extra || {}), "*");' +
'      }' +
'' +
'      try {' +
'        var userCode = \'' + encodedCode + '\';' +
'' +
'        var transformed = Babel.transform(userCode, {' +
'          presets: ["react", "typescript"],' +
'          filename: "playground.tsx"' +
'        }).code;' +
'' +
'        var moduleExports = {};' +
'        var module = { exports: moduleExports };' +
'        var exports = moduleExports;' +
'' +
'        var useState = React.useState;' +
'        var useEffect = React.useEffect;' +
'        var useRef = React.useRef;' +
'        var useMemo = React.useMemo;' +
'        var useCallback = React.useCallback;' +
'        var useContext = React.useContext;' +
'        var useReducer = React.useReducer;' +
'        var useLayoutEffect = React.useLayoutEffect;' +
'        var useImperativeHandle = React.useImperativeHandle;' +
'        var useDebugValue = React.useDebugValue;' +
'        var useDeferredValue = React.useDeferredValue;' +
'        var useTransition = React.useTransition;' +
'        var useId = React.useId;' +
'        var useSyncExternalStore = React.useSyncExternalStore;' +
'        var useInsertionEffect = React.useInsertionEffect;' +
'        var createContext = React.createContext;' +
'        var createElement = React.createElement;' +
'        var Fragment = React.Fragment;' +
'        var StrictMode = React.StrictMode;' +
'        var Suspense = React.Suspense;' +
'        var memo = React.memo;' +
'        var forwardRef = React.forwardRef;' +
'' +
'        var factory = new Function("React", "ReactDOM", "module", "exports",' +
'          "useState", "useEffect", "useRef", "useMemo", "useCallback",' +
'          "useContext", "useReducer", "useLayoutEffect", "useImperativeHandle",' +
'          "useDebugValue", "useDeferredValue", "useTransition", "useId",' +
'          "useSyncExternalStore", "useInsertionEffect",' +
'          "createContext", "createElement", "Fragment", "StrictMode", "Suspense",' +
'          "memo", "forwardRef",' +
'          transformed + "\\n;return { exports: module.exports, App: typeof App !== \\"undefined\\" ? App : null };"' +
'        );' +
'' +
'        var result = factory(React, ReactDOM, module, moduleExports,' +
'          useState, useEffect, useRef, useMemo, useCallback,' +
'          useContext, useReducer, useLayoutEffect, useImperativeHandle,' +
'          useDebugValue, useDeferredValue, useTransition, useId,' +
'          useSyncExternalStore, useInsertionEffect,' +
'          createContext, createElement, Fragment, StrictMode, Suspense,' +
'          memo, forwardRef);' +
'        var App = result.App || (result.exports && result.exports.default ? result.exports.default : null);' +
'' +
'        var rootEl = document.getElementById("root");' +
'        if (App && typeof App === "function") {' +
'          try {' +
'            var root = ReactDOM.createRoot(rootEl);' +
'            root.render(React.createElement(App));' +
'            setTimeout(function() { postResult([]); }, 800);' +
'          } catch (renderErr) {' +
'            renderError(renderErr.message + "\\n" + (renderErr.stack || ""));' +
'            postResult([renderErr.message]);' +
'          }' +
'        } else if (userCode.indexOf("ReactDOM.createRoot") >= 0 || userCode.indexOf("ReactDOM.render") >= 0) {' +
'          setTimeout(function() { postResult([]); }, 800);' +
'        } else {' +
'          postResult([]);' +
'        }' +
'' +
'      } catch (e) {' +
'        var msg = e.message + (e.stack ? "\\n" + e.stack : "");' +
'        renderError(msg);' +
'        postResult([e.message]);' +
'      }' +
'    })();' +
'  <\/script>' +
'</body>' +
'</html>';

    const iframe = createRunnerIframe({ visible: true });
    iframe._retained = true;
    iframe.style.cssText = "width:100%;height:100%;border:none;border-radius:4px;background:#fff;";
    iframe.setAttribute("title", "React Preview");
    iframe.setAttribute("name", "react-preview-" + Date.now());

    if (containerRef) {
      containerRef.innerHTML = "";
      containerRef.appendChild(iframe);
    } else {
      iframe.style.display = "none";
      document.body.appendChild(iframe);
    }

    setupIframeMessaging(iframe, "pg-react-result", 15000, (data) => {
      resolve({
        output:
          (data.logs || []).join("\n") ||
          ((data.errors || []).length ? "" : "(组件已渲染，查看预览区域)"),
        error: (data.errors || []).join("\n"),
      });
    });
    iframe.srcdoc = html;
  });
}
