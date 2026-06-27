// =============================================================
// GraphQL / SDL 语法高亮器
// -------------------------------------------------------------
// 作用：把一段 GraphQL 源代码（SDL + Query + Resolvers JS）转换成
//       带 <span class="tok-xxx"> 标签的 HTML。
//
// GraphQL 特有的 token：
//   1. 注释 # ...（与 Python 相同）
//   2. 字符串 "..."（双引号，GraphQL 不用单引号）
//   3. 操作关键字：query mutation subscription fragment
//   4. 类型定义关键字：type input interface enum union scalar schema
//                       directive extend on implements
//   5. 内置标量类型：String Int Float Boolean ID
//   6. 指令：@include @skip @deprecated
//   7. 变量：$name
//   8. 字段名/参数名：标识符后跟 : 或 ( 或出现在选定集里
// =============================================================

// ---- HTML 转义 ----
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const TOKENS = [
  {
    type: "comment",
    // 单行注释 # ...（到行尾）
    re: /#[^\n]*/,
  },
  {
    type: "string",
    // 双引号字符串（GraphQL 标准），带转义
    re: /"(?:\\.|[^"\\])*"/,
  },
  {
    type: "keyword",
    // GraphQL 操作关键字
    re: /\b(?:query|mutation|subscription|fragment)\b/,
  },
  {
    type: "keyword",
    // SDL 类型定义关键字（非操作关键字，但仍属关键字）
    re: /\b(?:type|interface|input|enum|union|scalar|schema|directive|extend|implements|on)\b/,
  },
  {
    type: "type",
    // 内置标量类型
    re: /\b(?:String|Int|Float|Boolean|ID)\b/,
  },
  {
    type: "decorator",
    // 指令 @xxx
    re: /@[A-Za-z_][A-Za-z0-9_]*/,
  },
  {
    type: "variable",
    // 变量 $name
    re: /\$[A-Za-z_][A-Za-z0-9_]*/,
  },
  {
    type: "literal",
    // 布尔值、null
    re: /\b(?:true|false|null)\b/,
  },
  {
    type: "number",
    // 数字（整数/浮点）
    re: /\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/,
  },
  {
    type: "function",
    // 字段名（标识符后紧跟 : 或 () 或出现在选定集里）
    // 这里用标识符后紧跟 ( 匹配字段参数调用
    re: /[A-Za-z_][A-Za-z0-9_]*(?=\s*(?::|\(|\{))/,
  },
];

// 合并主正则
const MASTER_REGEX = new RegExp(
  TOKENS.map((t) => `(${t.re.source})`).join("|"),
  "g"
);

/**
 * 把 GraphQL 源代码高亮成 HTML 字符串。
 * @param {string} code 原始代码
 * @returns {string} 带 <span> 标签的 HTML
 */
export function highlightGraphQL(code) {
  let result = "";
  let lastIndex = 0;
  let match;

  MASTER_REGEX.lastIndex = 0;

  while ((match = MASTER_REGEX.exec(code)) !== null) {
    if (match.index > lastIndex) {
      result += escapeHtml(code.slice(lastIndex, match.index));
    }

    let type = null;
    for (let i = 1; i <= TOKENS.length; i++) {
      if (match[i] !== undefined) {
        type = TOKENS[i - 1].type;
        break;
      }
    }
    if (!type) type = "plain";

    result += `<span class="tok-${type}">${escapeHtml(match[0])}</span>`;
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < code.length) {
    result += escapeHtml(code.slice(lastIndex));
  }

  return result;
}