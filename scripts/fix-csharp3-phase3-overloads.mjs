// 阶段3：把「同名局部函数」（重载演示）搬进静态类
// -------------------------------------------------------------
// C# 顶级语句里的局部函数不能重名（无法重载），
// 所以 void Print(int) / void Print(string) 这类演示必须放进静态类。
// 变换：
//   1. 找出重名的顶层局部函数
//   2. 搬进文件末尾的 static class Demo，方法加 public static
//   3. 调用点补上 Demo. 前缀
import { readFileSync } from "node:fs";
import { splitMembers, applyTransform } from "./csharp3-fix-lib.mjs";

const FUNC_RE =
  /^(?:public\s+|private\s+|internal\s+|static\s+)*(?:async\s+)?[\w\.\[\]<>,\?]+(?:\s*<[^>]*>)?\s+([A-Za-z_]\w*)\s*(?:<[^>]*>)?\s*\(([^;]*)\)\s*(?:=>|\{)/s;

function findLocalFunctions(code) {
  const members = splitMembers(code);
  const funcs = [];
  for (const m of members) {
    if (m.kind !== "stmt") continue;
    const text = code.slice(m.start, m.end);
    const mm = text.replace(/\/\/[^\n]*/g, "").trimStart().match(FUNC_RE);
    if (!mm) continue;
    funcs.push({ ...m, name: mm[1], text });
  }
  return { members, funcs };
}

export function wrapOverloads(code) {
  const { funcs } = findLocalFunctions(code);
  if (!funcs.length) return null;
  const byName = new Map();
  for (const f of funcs) {
    if (!byName.has(f.name)) byName.set(f.name, []);
    byName.get(f.name).push(f);
  }
  const overloads = [...byName.entries()].filter(([, list]) => list.length > 1);
  if (!overloads.length) return null;
  const names = new Set(overloads.map(([n]) => n));

  // 1. 从语句里移除这些函数定义
  const remove = [];
  for (const f of funcs) {
    if (names.has(f.name)) remove.push([f.start, f.end]);
  }
  remove.sort((a, b) => a[0] - b[0]);
  let head = "";
  let cursor = 0;
  for (const [s, e] of remove) {
    head += code.slice(cursor, s);
    cursor = e;
  }
  head += code.slice(cursor);

  // 2. 调用点补 Demo. 前缀（排除定义处、new 表达式、已有前缀）
  let body = head;
  for (const name of names) {
    const re = new RegExp(`(?<![\\w.])(${name})\\s*\\(`, "g");
    body = body.replace(re, (match, _g1, offset) => {
      const before = body.slice(Math.max(0, offset - 12), offset);
      const trimmed = before.trimEnd();
      if (/(?:^|\s)(?:new|void|int|string|double|bool|var|return|static|public|private)$/.test(trimmed)) {
        return match; // 定义处 / new 表达式
      }
      if (trimmed.endsWith(".")) return match;
      return `Demo.${match}`;
    });
  }

  // 3. 生成静态类
  const methods = funcs
    .filter((f) => names.has(f.name))
    .map((f) =>
      f.text
        .trim()
        .replace(/^(?:public\s+|private\s+|internal\s+)?(?:static\s+)?/, "public static ")
        .split("\n")
        .map((l) => (l.trim() ? "    " + l : l))
        .join("\n")
    );
  const note =
    "// 说明：顶级语句里的局部函数不能重名，无法演示重载；\n" +
    "// 所以重载的方法统一放进静态类 Demo，调用时写 Demo.方法名。\n";
  const cls = `${note}\nstatic class Demo\n{\n${methods.join("\n\n")}\n}\n`;
  return `${body.replace(/\n{3,}/g, "\n\n").replace(/\s*$/, "\n")}\n${cls}`;
}

// ---- 主流程：只处理 CS0128（重名）的代码段 ----
const results = JSON.parse(readFileSync("scripts/csharp3-verify-results.json", "utf8"));
const targets = new Set();
for (const f of results.buildFails) {
  if (f.detail.some((d) => d.startsWith("CS0128"))) targets.add(f.key);
}
// 另外扫描：任何存在重名局部函数的运行失败/编译失败段
console.log(`目标代码段 ${targets.size} 段：${[...targets].join(", ")}`);

if (process.argv.includes("--dry")) process.exit(0);

let total = 0;
for (let i = 1; i <= 15; i++) {
  const file = `app/courses-data/csharp3-chapters-batch${i}.js`;
  const changes = applyTransform(
    file,
    ({ key, code }) => (targets.has(key) ? wrapOverloads(code) : null),
    targets
  );
  if (changes.length) {
    console.log(`${file}: ${changes.length} 段已改为静态类`);
    total += changes.length;
  }
}
console.log(`合计 ${total} 段`);
