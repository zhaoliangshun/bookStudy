"use client";

// =============================================================
// useCopyCode —— 复制代码到剪贴板的共享 Hook
// -------------------------------------------------------------
// 在教程页面底部编辑器和 CodeBlock 中复用，提供统一的复制行为
// 和「✓ 已复制」反馈状态。
//
// 用法：
//   const { copied, handleCopy } = useCopyCode(code);
//   <button onClick={handleCopy}>{copied ? "✓ 已复制" : "复制"}</button>
// =============================================================

import { useState, useCallback, useRef, useEffect } from "react";

export default function useCopyCode(code) {
  // 是否已复制的反馈状态（1.5 秒后自动复位）
  const [copied, setCopied] = useState(false);
  // 用 ref 保存最新的 code，避免 handleCopy 闭包陈旧
  const codeRef = useRef(code);
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  const handleCopy = useCallback(async () => {
    const text = codeRef.current || "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 剪贴板 API 失败时的降级方案：使用临时 textarea
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        // 忽略复制失败
      }
      document.body.removeChild(textarea);
    }
  }, []);

  return { copied, handleCopy };
}
