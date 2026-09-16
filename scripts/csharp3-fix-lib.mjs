// =============================================================
// csharp3 批量修复工具库
// -------------------------------------------------------------
// 课程正文的 C# 代码存放在 JS 模板字符串里，本库负责：
//   1. 在「原始文件文本」层面定位 ```csharp 围栏（文件里是转义后的 \`\`\`）
//   2. 在「C# 源码」层面做语法级变换（类型声明后置、补全 using 等）
//   3. 重新转义后写回，保证不破坏模板字符串的其他内容
// =============================================================

// ---------- 转义 / 反转义 ----------
// 模板字符串转义 → 真实字符串内容（严格按 JS 语义处理 \n \t \\ \` 等）
export function unescapeRaw(raw) {
  return raw.replace(
    /\\(u\{[0-9a-fA-F]+\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|.)/gs,
    (_m, g) => {
      switch (g[0]) {
        case "n": return "\n";
        case "t": return "\t";
        case "r": return "\r";
        case "b": return "\b";
        case "f": return "\f";
        case "v": return "\v";
        case "x": return String.fromCharCode(parseInt(g.slice(1), 16));
        case "u": {
          const hex = g.startsWith("u{") ? g.slice(2, -1) : g.slice(1);
          return String.fromCodePoint(parseInt(hex, 16));
        }
        default: return g; // \\ \' \" \` \$ 等 → 字符本身
      }
    }
  );
}
// C# 代码 → 安全的模板字符串内容
export function escapeRaw(code) {
  return code
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
}

// ---------- 定位围栏 ----------
// 注意：部分章节的代码块在源文件里写成单行、用 \n 转义换行，
// 所以围栏后的换行既可能是真实换行，也可能是字面的 `\n` 两个字符
const FENCE_RE = /\\`\\`\\`(csharp|cs|c#|csharp-run|cs-run|csharp-snippet|cs-snippet)(?:\\n|\r?\n)([\s\S]*?)\\`\\`\\`/g;

export function scanBlocks(raw) {
  const blocks = [];
  FENCE_RE.lastIndex = 0;
  let m;
  while ((m = FENCE_RE.exec(raw))) {
    blocks.push({
      lang: m[1],
      rawBody: m[2],
      start: m.index,
      end: m.index + m[0].length,
      bodyStart: m.index + m[0].indexOf(m[2]),
    });
  }
  return blocks;
}

// 章节 id 定位：把每个围栏归属到最近的 id: 'xxx'
export function scanChapterIds(raw) {
  const ids = [];
  const re = /^\s*id:\s*'([^']+)'/gm;
  let m;
  while ((m = re.exec(raw))) ids.push({ id: m[1], index: m.index });
  return ids;
}

export function blocksWithChapter(raw) {
  const blocks = scanBlocks(raw);
  const ids = scanChapterIds(raw);
  return blocks.map((b) => {
    const owner = ids.filter((x) => x.index < b.start).pop();
    return { ...b, chapterId: owner?.id ?? "?" };
  });
}

// 按章节给围栏编号（与校验脚本 key 一致：id#序号）
export function keyedBlocks(raw) {
  const counter = new Map();
  return blocksWithChapter(raw).map((b) => {
    const n = (counter.get(b.chapterId) ?? 0) + 1;
    counter.set(b.chapterId, n);
    return { ...b, key: `${b.chapterId}#${n}` };
  });
}

// ---------- 字面量屏蔽 ----------
// 返回等长字符串：把字符串/字符字面量、注释内容替换成空格，
// 只保留结构字符，便于做花括号深度计算
export function maskLiterals(code) {
  const out = code.split("");
  const blank = (from, to) => {
    for (let i = from; i < to && i < out.length; i++) {
      if (out[i] !== "\n") out[i] = " ";
    }
  };
  let i = 0;
  const n = code.length;
  while (i < n) {
    const c = code[i];
    const d = code[i + 1];
    const t = code[i + 2];
    // 行注释
    if (c === "/" && d === "/") {
      let j = i;
      while (j < n && code[j] !== "\n") j++;
      blank(i, j);
      i = j;
      continue;
    }
    // 块注释
    if (c === "/" && d === "*") {
      let j = i + 2;
      while (j < n && !(code[j] === "*" && code[j + 1] === "/")) j++;
      blank(i, Math.min(j + 2, n));
      i = Math.min(j + 2, n);
      continue;
    }
    // 原始字符串 """ ... """
    if (c === '"' && d === '"' && t === '"') {
      let q = 0;
      let j = i;
      while (j < n && q < 3) {
        if (code[j] === '"') q++;
        else q = 0;
        j++;
      }
      const openEnd = j;
      let closeStart = -1;
      let q2 = 0;
      while (j < n) {
        if (code[j] === '"') {
          q2++;
          if (q2 === 3) {
            closeStart = j - 2;
            break;
          }
        } else q2 = 0;
        j++;
      }
      blank(openEnd, closeStart === -1 ? n : closeStart);
      i = closeStart === -1 ? n : j;
      continue;
    }
    // 逐字字符串 @"..."
    if ((c === "@" || c === "$" || (c === "@" && d === "$") || (c === "$" && d === "@")) && (d === '"' || t === '"')) {
      const qIdx = code.indexOf('"', i);
      let j = qIdx + 1;
      while (j < n) {
        if (code[j] === '"') {
          if (code[j + 1] === '"') {
            j += 2;
            continue;
          }
          break;
        }
        j++;
      }
      blank(qIdx, j);
      i = j + 1;
      continue;
    }
    // 普通字符串 / 插值字符串
    if (c === '"') {
      let j = i + 1;
      while (j < n) {
        if (code[j] === "\\") {
          j += 2;
          continue;
        }
        if (code[j] === '"') break;
        j++;
      }
      blank(i + 1, j);
      i = j + 1;
      continue;
    }
    // 字符字面量
    if (c === "'") {
      let j = i + 1;
      while (j < n) {
        if (code[j] === "\\") {
          j += 2;
          continue;
        }
        if (code[j] === "'") break;
        if (code[j] === "\n") break;
        j++;
      }
      blank(i + 1, j);
      i = j + 1;
      continue;
    }
    i++;
  }
  return out.join("");
}

// ---------- 顶层成员切分 ----------
const MODIFIERS =
  "(?:public|private|protected|internal|static|abstract|sealed|partial|readonly|unsafe|file|new|required|volatile|ref|scoped)";
const TYPE_KEYWORDS = "(?:class|struct|interface|enum|record|delegate)";
const DECL_START_RE = new RegExp(
  `^(?:\\s*\\[[^\\]]*\\]\\s*)*(?:${MODIFIERS}\\s+)*${TYPE_KEYWORDS}\\b`
);

function isDeclStart(line) {
  return DECL_START_RE.test(line);
}

/**
 * 把 C# 代码切分为顶层成员：
 *   using / decl（类型声明）/ stmt（语句、局部函数等）
 * @returns {{kind:string,start:number,end:number}[]}
 */
export function splitMembers(code) {
  const masked = maskLiterals(code);
  const n = code.length;
  const members = [];
  let i = 0;
  const skipWsAndComments = (pos) => {
    while (pos < n) {
      if (/\s/.test(code[pos])) {
        pos++;
        continue;
      }
      if (code[pos] === "/" && code[pos + 1] === "/") {
        while (pos < n && code[pos] !== "\n") pos++;
        continue;
      }
      if (code[pos] === "/" && code[pos + 1] === "*") {
        pos += 2;
        while (pos < n && !(code[pos] === "*" && code[pos + 1] === "/")) pos++;
        pos += 2;
        continue;
      }
      break;
    }
    return pos;
  };

  while (i < n) {
    const start = skipWsAndComments(i);
    if (start >= n) break;
    // 归属到上一个成员的尾随注释
    // 去掉行注释后再判断成员类型（形如 `[Flags] // 可组合` + `enum X`）
    const head = code.slice(start, start + 400).replace(/\/\/[^\n]*/g, "");
    const lineStart = code.lastIndexOf("\n", start) + 1;
    // 区分 using 指令（using System.Text;）与 using 声明（using var client = ...）
    const firstLine = code.slice(start, start + Math.max(0, masked.indexOf(";", start) - start + 1));
    const isUsing =
      /^global\s+using\s/.test(head) ||
      (/^using\s/.test(head) &&
        !/^using\s+var\b/.test(head) &&
        /^using\s+(?:static\s+)?[\w\.]+\s*(?:=\s*[^;]+)?;/.test(firstLine));
    const isDecl = isDeclStart(head);

    let end;
    if (isUsing) {
      end = masked.indexOf(";", start);
      end = end === -1 ? n : end + 1;
    } else if (isDecl) {
      end = scanDeclaration(masked, code, start);
    } else {
      end = scanStatement(masked, code, start);
    }
    members.push({ kind: isUsing ? "using" : isDecl ? "decl" : "stmt", start, end });
    i = end;
  }
  return members;
}

// 扫描类型声明：到匹配的 } 结尾（或 record/delegate 的 ;）
function scanDeclaration(masked, code, start) {
  const n = code.length;
  let depth = 0;
  let seenBrace = false;
  let i = start;
  while (i < n) {
    const c = masked[i];
    if (c === "{") {
      depth++;
      seenBrace = true;
    } else if (c === "}") {
      depth--;
      if (seenBrace && depth === 0) {
        return i + 1;
      }
    } else if (c === ";" && depth === 0 && !seenBrace) {
      return i + 1;
    }
    i++;
  }
  return n;
}

// 扫描语句：到 ; 或到块结束的 }
const CONTINUE_KEYWORDS = /^\s*(else|catch|finally|while|do)\b/;

function scanStatement(masked, code, start) {
  const n = code.length;
  let depth = 0;
  let i = start;
  while (i < n) {
    const c = masked[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) {
        // 可能是 if/try/循环块的结尾，检查后面是否为续接关键字
        let j = i + 1;
        while (j < n && /[\s]/.test(code[j])) j++;
        if (CONTINUE_KEYWORDS.test(code.slice(j, j + 10))) {
          i = j;
          continue;
        }
        return i + 1;
      }
    } else if (c === ";" && depth === 0) {
      return i + 1;
    }
    i++;
  }
  return n;
}

// ---------- 变换：类型声明后置 ----------
/**
 * C# 顶级语句必须出现在所有类型声明之前。
 * 把顶层类型声明整体挪到文件末尾，语句保持原有顺序。
 * @returns {string|null} 变更后的代码；无需变更返回 null
 */
export function moveTypesAfterStatements(code) {
  const members = splitMembers(code);
  const decls = members.filter((m) => m.kind === "decl");
  if (decls.length === 0) return null;
  const stmts = members.filter((m) => m.kind === "stmt");
  if (stmts.length === 0) return null;
  const lastStmtEnd = Math.max(...stmts.map((m) => m.end));
  const firstDeclStart = Math.min(...decls.map((m) => m.start));
  // 需要搬动的条件：存在类型声明出现在语句之前（幂等：已修好的不会再动）
  if (firstDeclStart > lastStmtEnd) return null;

  // 类型声明连同紧邻其上的注释一起搬走
  const movedDecls = decls.map((d) => {
    let s = d.start;
    // 向前吞掉紧挨着的注释行（中间不能有空行）
    while (s > 0) {
      const prevLineEnd = s - 1; // 上一行行尾（不含 \n）
      const prevLineStart = code.lastIndexOf("\n", s - 2) + 1;
      const prev = code.slice(prevLineStart, prevLineEnd);
      if (prev.trim() === "" || !/^\s*(\/\/|\/\*|\*).*$/.test(prev)) break;
      s = prevLineStart;
    }
    return { from: s, to: d.end, text: code.slice(s, d.end).replace(/\s+$/, "") };
  });
  // 头部：按原顺序保留 using 与语句，挖掉类型声明（含其注释）
  const parts = [];
  let segStart = 0;
  for (const d of movedDecls) {
    parts.push(code.slice(segStart, d.from));
    segStart = d.to;
  }
  const declTexts = movedDecls.map((d) => d.text);
  parts.push(code.slice(segStart));
  const head = parts.join("");
  const tail = declTexts.join("\n\n");
  const note =
    "// 说明：C# 的顶级语句必须写在类型声明之前，\n" +
    "// 所以演示代码放在前面，类型定义放在文件末尾。\n";
  return `${head.replace(/\n{3,}/g, "\n\n").replace(/\s*$/, "\n")}\n${note}\n${tail}\n`;
}

// ---------- 变换：补全 using ----------
export function hasUsing(code, ns) {
  return new RegExp(`^\\s*using\\s+${ns.replace(/\./g, "\\.")}\\s*;`, "m").test(code);
}

/**
 * 在代码最前面插入 using 指令（放在已有 using 之后 / 注释之后）
 */
export function addUsings(code, namespaces) {
  if (!namespaces.length) return code;
  const lines = code.split("\n");
  let insertAt = 0;
  // 跳过开头的注释、空行、#define 等预处理指令
  while (insertAt < lines.length) {
    const l = lines[insertAt].trim();
    if (l === "" || l.startsWith("//") || l.startsWith("/*") || l.startsWith("*") || l.startsWith("#")) {
      insertAt++;
      continue;
    }
    if (/^using\s/.test(l) || /^global\s+using\s/.test(l)) {
      insertAt++;
      continue;
    }
    break;
  }
  const additions = namespaces.map((ns) => `using ${ns};`);
  const newLines = [...lines.slice(0, insertAt), ...additions, ...lines.slice(insertAt)];
  return newLines.join("\n");
}

// ---------- 文件级应用 ----------
/**
 * 对某个 batch 文件应用变换
 * @param {string} file 绝对路径
 * @param {(ctx:{key:string,chapterId:string,lang:string,code:string})=>string|null} transform
 * @param {Set<string>} only 只处理这些 key（可选）
 */
import { readFileSync, writeFileSync } from "node:fs";

export function applyTransform(file, transform, only = null, { dryRun = false } = {}) {
  const raw = readFileSync(file, "utf8");
  const blocks = keyedBlocks(raw);
  let out = "";
  let cursor = 0;
  const changes = [];
  for (const b of blocks) {
    if (only && !only.has(b.key)) continue;
    const code = unescapeRaw(b.rawBody);
    const next = transform({ key: b.key, chapterId: b.chapterId, lang: b.lang, code });
    if (next == null || next === code) continue;
    const newRaw = escapeRaw(next);
    out += raw.slice(cursor, b.bodyStart) + newRaw;
    cursor = b.bodyStart + b.rawBody.length;
    changes.push({ key: b.key, lang: b.lang });
  }
  out += raw.slice(cursor);
  if (!dryRun && changes.length) writeFileSync(file, out, "utf8");
  return changes;
}
