// =============================================================
// 轻量级 Markdown 渲染组件
// -------------------------------------------------------------
// 支持的语法：
//   # ## ### 标题
//   - 无序列表 / 1. 有序列表
//   > 引用
//   | 表格 |
//   ``` 代码块 ```
//   `行内代码`
//   **加粗**
//   普通段落
//
// 这不是完整的 Markdown 解析器，但足够渲染本教程的内容。
// 作为 Server Component（无需 'use client'），渲染纯静态内容。
// =============================================================

import React from "react";
import { CodeBlock } from "./CodeBlock";

// 把一行文本中的行内标记（`代码`、**加粗**）解析为 React 元素
function renderInline(text, keyPrefix) {
  const parts = [];
  // 正则：匹配 `代码` 或 **加粗**
  const regex = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let lastIndex = 0;
  let match;
  let i = 0;
  while ((match = regex.exec(text)) !== null) {
    // 匹配前的普通文本
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("`")) {
      // 行内代码
      parts.push(
        <code key={`${keyPrefix}-${i}`} className="md-inline-code">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("**")) {
      // 加粗
      parts.push(
        <strong key={`${keyPrefix}-${i}`} className="md-strong">
          {token.slice(2, -2)}
        </strong>
      );
    }
    lastIndex = regex.lastIndex;
    i++;
  }
  // 剩余文本
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

// 解析表格行（| a | b |）返回单元格数组
function parseTableRow(line) {
  return line
    .split("|")
    .map((cell) => cell.trim())
    .filter((cell, idx, arr) => {
      // 去掉首尾空 cell（由行首/行尾的 | 产生）
      if (idx === 0 && cell === "") return false;
      if (idx === arr.length - 1 && cell === "") return false;
      return true;
    });
}

// 判断是否是表格分隔行（| --- | --- |）
function isTableSeparator(line) {
  const cells = parseTableRow(line);
  return cells.length > 0 && cells.every((c) => /^-+:?$|^:?-+:?$|^:?-+$/.test(c));
}

// 主渲染函数：把 markdown 字符串转为 React 元素数组
export function MarkdownRenderer({ content }) {
  const lines = content.split("\n");
  const blocks = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 跳过空行
    if (line.trim() === "") {
      i++;
      continue;
    }

    // 代码块 ```lang ... ```
    // 严格匹配：行首可选空白 + 3个及以上反引号 + 可选空白 + 可选语言名(无空格) + 可选空白 + 行尾
    const fencedMatch = line.trim().match(/^(`{3,})\s*(\S*)\s*$/);
    if (fencedMatch) {
      const lang = fencedMatch[2];
      const codeLines = [];
      i++;
      while (i < lines.length) {
        const closeFence = lines[i].trim().match(/^(`{3,})\s*$/);
        if (closeFence && closeFence[1].length >= fencedMatch[1].length) {
          break;
        }
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) {
        i++; // 跳过结束的 ```
      }
      blocks.push(
        <CodeBlock key={key++} code={codeLines.join("\n")} lang={lang} />
      );
      continue;
    }

    // 标题 # ## ### ####
    const headingMatch = line.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const Tag = `h${level}`;
      blocks.push(
        <Tag key={key++} className={`md-heading md-h${level}`}>
          {renderInline(text, `h-${key}`)}
        </Tag>
      );
      i++;
      continue;
    }

    // 引用 >
    if (line.trim().startsWith(">")) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push(
        <blockquote key={key++} className="md-blockquote">
          {renderInline(quoteLines.join(" "), `bq-${key}`)}
        </blockquote>
      );
      continue;
    }

    // 表格（当前行是 | 开头，且下一行是分隔行）
    if (line.includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const headers = parseTableRow(line);
      i += 2; // 跳过表头和分隔行
      const rows = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim() !== "") {
        rows.push(parseTableRow(lines[i]));
        i++;
      }
      blocks.push(
        <div key={key++} className="md-table-wrap">
          <table className="md-table">
            <thead>
              <tr>
                {headers.map((h, idx) => (
                  <th key={idx}>{renderInline(h, `th-${key}-${idx}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ridx) => (
                <tr key={ridx}>
                  {row.map((cell, cidx) => (
                    <td key={cidx}>{renderInline(cell, `td-${key}-${ridx}-${cidx}`)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // 无序列表 - 或 *
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={key++} className="md-list">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item, `li-${key}-${idx}`)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // 有序列表 1.
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="md-list md-olist">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item, `oli-${key}-${idx}`)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // 普通段落（连续非空行合并）
    const paraLines = [];
    const isFenceLine = (l) => /^(`{3,})\s*(\S*)\s*$/.test(l.trim());
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith(">") &&
      !isFenceLine(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={key++} className="md-paragraph">
        {renderInline(paraLines.join(" "), `p-${key}`)}
      </p>
    );
  }

  // 最后一个代码 demo 不需要那么高的编辑区域，把最大高度减半（800 → 400）。
  // 从末尾向前找到最后一个 CodeBlock 元素，用 cloneElement 注入 maxHeight prop。
  for (let j = blocks.length - 1; j >= 0; j--) {
    if (blocks[j].type === CodeBlock) {
      blocks[j] = React.cloneElement(blocks[j], { maxHeight: 400 });
      break;
    }
  }

  return <div className="md-body">{blocks}</div>;
}

export default MarkdownRenderer;
