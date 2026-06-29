// =============================================================
// Shell (Bash) 语法高亮器
// -------------------------------------------------------------
// 作用：把一段 Shell 脚本转换成带 <span class="tok-xxx"> 标签的
//       HTML，用于在代码编辑器下方的 <pre> 高亮层中渲染彩色代码。
//
// 实现思路：与 JS / Java 高亮器相同——「单遍扫描 + 主正则
//   交替 (alternation)」。把所有 token 类型按优先级写进一个正则的
//   多个分组里，用 exec 循环扫描整段代码，命中即包 span。
//
// 与 JS 高亮器的差异：
//   1. 注释：只有 # 单行
//   2. 字符串：双引号 "..."（允许 $ 插值，简化整段当一个 string）、
//      单引号 '...'、反引号 `...` 命令替换
//   3. 数字：纯数字
//   4. 关键字集合不同（if/then/elif/fi/for/do/done/case/esac/...）
//   5. 变量引用 $var ${var} $1 $@ $# $? $0 单独一类（tok-builtin）
//   6. 内建命令（echo/printf/read/cd/ls/cat/grep/...）单独一类
//   7. 不强制函数名高亮（shell 函数定义较复杂，省略 function token）
//
// 颜色映射（CSS class → 颜色，定义在 globals.css）：
//   tok-comment  : 绿色斜体（注释）
//   tok-string   : 橙红色（字符串与反引号命令替换）
//   tok-number   : 绿色（数字）
//   tok-keyword  : 蓝色粗体（if/then/for/case/...）
//   tok-builtin  : 青色（变量引用与内建命令，颜色更突出）
// =============================================================

// ---- HTML 转义：防止用户代码里的 < > & 破坏 HTML 结构 ----
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ---- token 类型定义（顺序即优先级，越靠前越先匹配） ----
const TOKENS = [
  {
    type: "comment",
    // 注释：# 单行
    re: /#[^\n]*/,
  },
  {
    type: "string",
    // 字符串：双引号 "..."（允许 $ 插值，简化整段当一个 string）、
    //         单引号 '...'、反引号 `...` 命令替换
    re: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/,
  },
  {
    type: "number",
    // 纯数字
    re: /\b\d+\b/,
  },
  {
    type: "keyword",
    // Shell 关键字（控制流与定义语句）
    re: /\b(?:if|then|else|elif|fi|for|do|done|while|until|case|esac|in|function|return|exit|break|continue|local|export|unset|alias|source|echo|printf|read|set|shift|trap)\b/,
  },
  {
    type: "builtin",
    // 变量引用：$var、${var}、$1、$@、$#、$?、$0 —— 单独一类
    re: /\$\{[A-Za-z_][A-Za-z0-9_]*\}|\$[A-Za-z_][A-Za-z0-9_]*|\$[0-9@#?]/,
  },
  {
    type: "builtin",
    // 内建命令（与变量引用同属 builtin 类，颜色更突出）
    re: /\b(?:echo|printf|read|cd|pwd|ls|cat|grep|sed|awk|find|cp|mv|rm|mkdir|rmdir|touch|chmod|chown|export|source|alias|unalias)\b/,
  },
];

// 把所有 token 正则合并成一个「主正则」
const MASTER_REGEX = new RegExp(
  TOKENS.map((t) => `(${t.re.source})`).join("|"),
  "g"
);

/**
 * 把 Shell 脚本高亮成 HTML 字符串。
 * @param {string} code 原始 Shell 代码
 * @returns {string} 带 <span> 标签的 HTML（已转义，可直接放进 dangerouslySetInnerHTML）
 */
export function highlightShell(code) {
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
