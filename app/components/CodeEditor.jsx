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

import { useRef, useCallback, useMemo } from "react";

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

  // ---------- 编辑器滚动同步 ----------
  const handleScroll = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (highlightRef.current) {
      highlightRef.current.scrollTop = ta.scrollTop;
      highlightRef.current.scrollLeft = ta.scrollLeft;
    }
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = ta.scrollTop;
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
      {/* 行号 */}
      <div
        className="line-numbers"
        ref={lineNumbersRef}
        aria-hidden="true"
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className="line-number">
            {i + 1}
          </div>
        ))}
      </div>
      {/* 编辑区：高亮层 + textarea 叠加 */}
      <div className="editor-area">
        <pre
          ref={highlightRef}
          className="editor-highlight"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: highlightedHTML }}
        />
        <textarea
          ref={textareaRef}
          className="code-editor"
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
      </div>
    </div>
  );
}
