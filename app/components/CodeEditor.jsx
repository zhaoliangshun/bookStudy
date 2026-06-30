"use client";

// =============================================================
// 可复用代码编辑器组件
// -------------------------------------------------------------
// 功能：
//   1. 行号显示（与内容滚动同步）
//   2. 语法高亮（叠加技术：透明 textarea 覆盖在高亮 pre 上）
//   3. 可编辑（textarea 接收输入，高亮层实时更新）
//   4. VS Code 风格快捷键：
//      Tab / Shift+Tab     缩进 / 减少缩进
//      Ctrl/Cmd + /        注释 / 取消注释
//      Ctrl/Cmd + ] / [    增减缩进
//      Ctrl/Cmd + D        复制当前行
//      Ctrl/Cmd + Shift+K  删除当前行
//      Alt + ↑ / ↓         上移 / 下移当前行
//      Ctrl/Cmd + Enter    运行代码（通过 onRun 回调）
//
// 用法：
//   <CodeEditor
//     value={code}
//     onChange={setCode}
//     highlight={highlightJavaScript}  // 返回 HTML 字符串的函数
//     comment="//"                     // 行注释前缀
//     onRun={handleRun}                // 可选，Ctrl+Enter 回调
//     placeholder="输入代码..."
//     minHeight={200}
//     maxHeight={520}
//     readOnly={false}
//   />
// =============================================================

import { useRef, useState, useEffect, useCallback, useMemo } from "react";

export default function CodeEditor({
  value = "",
  onChange,
  highlight,
  comment = "//",
  onRun,
  placeholder = "",
  minHeight = 120,
  maxHeight = 520,
  readOnly = false,
}) {
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const lineNumbersRef = useRef(null);
  // 选区层 inner（和高亮层共用 transform 同步滚动）
  const selectionRef = useRef(null);
  // 隐藏测量 span（测量等宽字体单字符宽度，用于计算选区矩形）
  const measureRef = useRef(null);
  // 字符宽度（测量后存入 state 触发矩形重算）
  const [charWidth, setCharWidth] = useState(0);
  // 选区起止位置（由 selectionchange 事件驱动更新）
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  // 高亮 HTML（依赖外部高亮函数 + 代码内容）
  const highlightedHTML = useMemo(() => {
    if (highlight) return highlight(value) + "\n";
    // 无高亮函数时做简单 HTML 转义
    return (
      value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;") + "\n"
    );
  }, [value, highlight]);

  // 行数
  const lineCount = useMemo(
    () => (value ? value.split("\n").length : 1),
    [value]
  );

  // ---------- 测量等宽字体单字符宽度 ----------
  // 用于计算选区矩形：选区跨越的每行，left = 列数 × charWidth。
  // 等宽字体下所有 ASCII 字符宽度一致，测一个 'x' 即可。
  useEffect(() => {
    if (measureRef.current) {
      setCharWidth(measureRef.current.getBoundingClientRect().width);
    }
  }, []);

  // ---------- 监听选区变化 ----------
  // selectionchange 是 document 级别事件，需要判断 activeElement 是否
  // 是当前 textarea，避免多实例互相干扰。
  useEffect(() => {
    const handler = () => {
      const ta = textareaRef.current;
      if (!ta) return;
      if (document.activeElement === ta) {
        setSelection({ start: ta.selectionStart, end: ta.selectionEnd });
      }
    };
    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
  }, []);

  // ---------- 计算选区矩形 ----------
  // 根据 selectionStart/End 把选区拆成每行一个矩形 div。
  // 矩形坐标基于内容原点（不含滚动偏移），滚动同步由 transform 统一处理。
  const selectionRects = useMemo(() => {
    if (charWidth === 0) return [];
    const { start, end } = selection;
    if (start === end) return []; // 无选区，不绘制
    const lineHeight = 13 * 1.6; // 与 CSS font-size:13px / line-height:1.6 对应
    const paddingLeft = 16; // editor-highlight-inner 的 padding-left
    const paddingTop = 14; // editor-highlight-inner 的 padding-top
    const lines = value.split("\n");
    const rects = [];
    let pos = 0; // 当前字符在全文中的偏移
    for (let i = 0; i < lines.length; i++) {
      const lineLen = lines[i].length;
      const lineStart = pos;
      const lineEnd = pos + lineLen; // 不含行尾 \n
      // 选区和这一行有交集就生成矩形
      if (start < lineEnd && end > lineStart) {
        const selStart = Math.max(start, lineStart);
        const selEnd = Math.min(end, lineEnd);
        rects.push({
          left: paddingLeft + (selStart - lineStart) * charWidth,
          top: paddingTop + i * lineHeight,
          width: (selEnd - selStart) * charWidth,
          height: lineHeight,
        });
      }
      pos = lineEnd + 1; // +1 跳过 \n
    }
    return rects;
  }, [selection, charWidth, value]);

  // ---------- 编辑器滚动同步 ----------
  // 关键：用 transform: translate() 同步，而不是 scrollTop。
  // 高亮层、选区层、行号列都用同一个 transform 值平移，确保三者
  // 在同一帧移动。选区层是自绘的（textarea 原生选区已隐藏），
  // 所以选区背景和高亮文字完全同步，不再有 1 帧错位闪动。
  const handleScroll = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const x = ta.scrollLeft;
    const y = ta.scrollTop;
    const tf = `translate(${-x}px, ${-y}px)`;
    // 高亮层 inner div 平移
    if (highlightRef.current?.firstElementChild) {
      highlightRef.current.firstElementChild.style.transform = tf;
    }
    // 选区层 inner 平移（和高亮层同一个 transform 值，保证同帧同步）
    if (selectionRef.current) {
      selectionRef.current.style.transform = tf;
    }
    // 行号列只用 Y 轴平移
    if (lineNumbersRef.current?.firstElementChild) {
      lineNumbersRef.current.firstElementChild.style.transform = `translateY(${-y}px)`;
    }
  }, []);

  // ---------- 内部辅助：写入新值并恢复光标 ----------
  const applyEdit = useCallback(
    (newVal, restoreSelection) => {
      onChange(newVal);
      const ta = textareaRef.current;
      if (!ta) return;
      requestAnimationFrame(() => {
        if (ta && restoreSelection) {
          restoreSelection(ta);
        }
      });
    },
    [onChange]
  );

  // ---------- 增减缩进 ----------
  function changeIndent(ta, value, start, end, indent) {
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const lineEndIdx = value.indexOf("\n", end);
    const lineEndReal = lineEndIdx === -1 ? value.length : lineEndIdx;

    const block = value.slice(lineStart, lineEndReal);
    let lines = block.split("\n");

    if (indent) {
      lines = lines.map((ln) => "  " + ln);
    } else {
      lines = lines.map((ln) => {
        if (ln.startsWith("  ")) return ln.slice(2);
        if (ln.startsWith(" ")) return ln.slice(1);
        if (ln.startsWith("\t")) return ln.slice(1);
        return ln;
      });
    }

    const newBlock = lines.join("\n");
    const newVal =
      value.slice(0, lineStart) + newBlock + value.slice(lineEndReal);
    applyEdit(newVal, (ta) => {
      ta.selectionStart = lineStart;
      ta.selectionEnd = lineStart + newBlock.length;
    });
  }

  // ---------- 注释 / 取消注释 ----------
  function toggleComment(ta, value, start, end) {
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const lineEndIdx = value.indexOf("\n", end);
    const lineEndReal = lineEndIdx === -1 ? value.length : lineEndIdx;

    const block = value.slice(lineStart, lineEndReal);
    const lines = block.split("\n");

    const allCommented = lines.every((ln) => {
      const trimmed = ln.trim();
      return trimmed === "" || trimmed.startsWith(comment);
    });

    let newLines;
    if (allCommented) {
      newLines = lines.map((ln) => {
        const idx = ln.indexOf(comment);
        if (idx === -1) return ln;
        let after = ln.slice(0, idx) + ln.slice(idx + comment.length);
        if (after.startsWith(" ")) after = after.slice(1);
        return after;
      });
    } else {
      newLines = lines.map((ln) => {
        if (ln.trim() === "") return comment;
        const m = ln.match(/^(\s*)(.*)$/);
        return m[1] + comment + " " + m[2];
      });
    }

    const newBlock = newLines.join("\n");
    const newVal =
      value.slice(0, lineStart) + newBlock + value.slice(lineEndReal);
    applyEdit(newVal, (ta) => {
      ta.selectionStart = lineStart;
      ta.selectionEnd = lineStart + newBlock.length;
    });
  }

  // ---------- 复制当前行 ----------
  function duplicateLine(ta, value, start, end) {
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const lineEndIdx = value.indexOf("\n", end);
    const lineEndReal = lineEndIdx === -1 ? value.length : lineEndIdx;

    const line = value.slice(lineStart, lineEndReal);
    const insertText = line + "\n" + line;
    const newVal =
      value.slice(0, lineStart) + insertText + value.slice(lineEndReal);
    applyEdit(newVal, (ta) => {
      const selStart = lineStart + line.length + 1;
      ta.selectionStart = selStart;
      ta.selectionEnd = selStart + line.length;
    });
  }

  // ---------- 删除当前行 ----------
  function deleteLine(ta, value, start, end) {
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    let lineEndIdx = value.indexOf("\n", end);
    if (lineEndIdx === -1) {
      if (lineStart > 0) {
        const newVal = value.slice(0, lineStart - 1);
        applyEdit(newVal, (ta) => {
          ta.selectionStart = ta.selectionEnd = Math.min(
            lineStart - 1,
            newVal.length
          );
        });
      }
      return;
    }
    const newVal = value.slice(0, lineStart) + value.slice(lineEndIdx + 1);
    applyEdit(newVal, (ta) => {
      ta.selectionStart = ta.selectionEnd = lineStart;
    });
  }

  // ---------- 移动当前行 ----------
  function moveLine(ta, value, start, end, dir) {
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const lineEndIdx = value.indexOf("\n", end);
    const lineEndReal = lineEndIdx === -1 ? value.length : lineEndIdx;
    const currentBlock = value.slice(lineStart, lineEndReal);

    if (dir === -1) {
      if (lineStart === 0) return;
      const prevLineEnd = lineStart - 1;
      const prevLineStart = value.lastIndexOf("\n", prevLineEnd - 1) + 1;
      const prevBlock = value.slice(prevLineStart, prevLineEnd);
      const newVal =
        value.slice(0, prevLineStart) +
        currentBlock +
        "\n" +
        prevBlock +
        value.slice(lineEndReal);
      applyEdit(newVal, (ta) => {
        const offset = currentBlock.length + 1;
        ta.selectionStart = prevLineStart;
        ta.selectionEnd = prevLineStart + offset - 1;
      });
    } else {
      if (lineEndIdx === -1) return;
      const nextLineStart = lineEndIdx + 1;
      const nextLineEndIdx = value.indexOf("\n", nextLineStart);
      const nextLineEnd = nextLineEndIdx === -1 ? value.length : nextLineEndIdx;
      const nextBlock = value.slice(nextLineStart, nextLineEnd);
      const newVal =
        value.slice(0, lineStart) +
        nextBlock +
        "\n" +
        currentBlock +
        value.slice(nextLineEnd);
      applyEdit(newVal, (ta) => {
        const offset = nextBlock.length + 1;
        ta.selectionStart = lineStart + offset;
        ta.selectionEnd = lineStart + offset + currentBlock.length;
      });
    }
  }

  // ---------- 键盘快捷键处理 ----------
  const handleKeyDown = useCallback(
    (e) => {
      if (readOnly) return;
      const ta = textareaRef.current;
      if (!ta) return;
      const mod = e.ctrlKey || e.metaKey;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const val = value;

      // Ctrl/Cmd + Enter：运行代码
      if (mod && e.key === "Enter") {
        e.preventDefault();
        if (onRun) onRun();
        return;
      }

      // Ctrl/Cmd + /：注释 / 取消注释
      if (mod && e.key === "/") {
        e.preventDefault();
        toggleComment(ta, val, start, end);
        return;
      }

      // Ctrl/Cmd + ] 或 [：增减缩进
      if (mod && (e.key === "]" || e.key === "[")) {
        e.preventDefault();
        changeIndent(ta, val, start, end, e.key === "]" ? "  " : null);
        return;
      }

      // Ctrl/Cmd + D：复制当前行
      if (mod && (e.key === "d" || e.key === "D") && !e.shiftKey) {
        e.preventDefault();
        duplicateLine(ta, val, start, end);
        return;
      }

      // Ctrl/Cmd + Shift + K：删除当前行
      if (mod && e.shiftKey && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        deleteLine(ta, val, start, end);
        return;
      }

      // Alt + ↑/↓：上移 / 下移当前行
      if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
        e.preventDefault();
        moveLine(ta, val, start, end, e.key === "ArrowUp" ? -1 : 1);
        return;
      }

      // Tab：缩进 / Shift+Tab：减少缩进
      if (e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          changeIndent(ta, val, start, end, null);
        } else {
          if (start === end) {
            const newVal = val.slice(0, start) + "  " + val.slice(end);
            applyEdit(newVal, (ta) => {
              ta.selectionStart = ta.selectionEnd = start + 2;
            });
          } else {
            changeIndent(ta, val, start, end, "  ");
          }
        }
        return;
      }
    },
    [value, readOnly, onRun]
  );

  return (
    <div
      className="editor-wrap ce-editor-wrap"
      style={{
        minHeight: `${minHeight}px`,
        maxHeight: `${maxHeight}px`,
      }}
    >
      {/* 行号：外层做裁剪容器，内层 inner 用 transform 平移同步滚动 */}
      <div
        className="line-numbers"
        ref={lineNumbersRef}
        aria-hidden="true"
      >
        <div className="line-numbers-inner">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className="line-number">
              {i + 1}
            </div>
          ))}
        </div>
      </div>
      {/* 编辑区：选区层 + 高亮层 + textarea 叠加 */}
      <div className="editor-area">
        {/* 选区层（最底）：自绘选区背景矩形。
            隐藏 textarea 原生 ::selection（它由合成器即时绘制，
            和高亮层的 transform 同步差 1 帧 → 滚动时错位闪动）。
            改为自己画选区，和高亮层共用同一个 transform 值，
            保证选区背景和彩色文字在同一帧移动，彻底消除闪动。 */}
        <div className="editor-selection" aria-hidden="true">
          <div className="editor-selection-inner" ref={selectionRef}>
            {selectionRects.map((r, i) => (
              <div
                key={i}
                className="editor-selection-rect"
                style={{
                  left: `${r.left}px`,
                  top: `${r.top}px`,
                  width: `${r.width}px`,
                  height: `${r.height}px`,
                }}
              />
            ))}
          </div>
        </div>
        {/* 高亮层：外层 pre 做裁剪容器（overflow:hidden），内层 inner 用
            transform 平移同步滚动。 */}
        <pre
          ref={highlightRef}
          className="editor-highlight"
          aria-hidden="true"
        >
          <div
            className="editor-highlight-inner"
            dangerouslySetInnerHTML={{ __html: highlightedHTML }}
          />
        </pre>
        <textarea
          ref={textareaRef}
          className="code-editor ce-code-editor"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          wrap="off"
          readOnly={readOnly}
          placeholder={placeholder}
        />
        {/* 隐藏测量 span：测量等宽字体单字符宽度，用于计算选区矩形 */}
        <span ref={measureRef} className="editor-measure" aria-hidden="true">
          x
        </span>
      </div>
    </div>
  );
}
