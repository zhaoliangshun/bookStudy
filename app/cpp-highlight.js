// =============================================================
// C++ 语法高亮器
// -------------------------------------------------------------
// 作用：把一段 C++ 源代码转换成带 <span class="tok-xxx"> 标签的
//       HTML，用于在代码编辑器下方的 <pre> 高亮层中渲染彩色代码。
//
// 实现思路：与 C / Java 高亮器相同——「单遍扫描 + 主正则
//   交替 (alternation)」。把所有 token 类型按优先级写进一个正则的
//   多个分组里，用 exec 循环扫描整段代码，命中即包 span。
//
// 与 C 高亮器的差异：
//   1. 关键字集合扩展：新增 class/public/private/protected/namespace/
//      using/template/typename/new/delete/this/throw/try/catch/noexcept/
//      operator/virtual/override/final/constexpr/decltype/auto 等面向
//      对象与模板相关关键字
//   2. 字面量增加 nullptr
//   3. 内建增加 std/cout/cin/endl/cerr 等 STL 常用对象
//   4. 注释仍为 // 与 /* */（与 C 一致）
//
// 颜色映射（CSS class → 颜色，定义在 globals.css）：
//   tok-comment  : 绿色斜体（注释）
//   tok-string   : 橙红色（字符串与 #include <...>）
//   tok-number   : 绿色（数字）
//   tok-keyword  : 蓝色粗体（int/class/template...）
//   tok-literal  : 蓝色（true/false/NULL/nullptr）
//   tok-builtin  : 青色（std/cout/printf 等库对象/函数）
//   tok-function : 黄色（用户函数调用名）
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
    // 注释：/* */ 多行或 // 单行
    re: /\/\*[\s\S]*?\*\/|\/\/[^\n]*/,
  },
  {
    type: "string",
    // 字符串：双引号 "..."、单引号 '...'（C++ 中是 char）、
    // 以及 #include <...> 形式的头文件名
    re: /#include\s*<[^>\n]*>|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/,
  },
  {
    type: "number",
    // C++ 数字：十六进制 0x、浮点（含科学计数法）、十进制整数
    re: /\b0[xX][0-9a-fA-F]+\b|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?[fFuUlL]*\b/,
  },
  {
    type: "keyword",
    // C++ 关键字（在 C 基础上扩展 C++ 特有关键字，不含 true/false/NULL/nullptr）
    re: /\b(?:int|char|float|double|void|short|long|unsigned|signed|const|static|extern|auto|register|volatile|struct|union|enum|typedef|sizeof|return|if|else|switch|case|default|for|while|do|break|continue|goto|inline|restrict|_Bool|_Complex|class|public|private|protected|namespace|using|template|typename|const_cast|dynamic_cast|reinterpret_cast|static_cast|new|delete|this|throw|try|catch|noexcept|operator|virtual|override|final|constexpr|decltype|lambda)\b/,
  },
  {
    type: "literal",
    // 布尔、空值与 nullptr
    re: /\b(?:true|false|NULL|nullptr)\b/,
  },
  {
    type: "builtin",
    // C 标准库函数 + STL 常用对象/类型
    re: /\b(?:std|cout|cin|endl|cerr|printf|scanf|puts|getchar|putchar|malloc|free|memcpy|strlen|strcpy|strcat|strcmp|sprintf|sscanf|fopen|fclose|fread|fwrite|fgets|fputs|fseek|ftell|vector|string|map)\b/,
  },
  {
    type: "function",
    // 「标识符紧跟 (」视为函数调用，着色为函数名。
    // 用前瞻 (?=\s*() 不消费 '('，让括号留给普通文本。
    re: /[A-Za-z_][A-Za-z0-9_]*(?=\s*\()/,
  },
];

// 把所有 token 正则合并成一个「主正则」
const MASTER_REGEX = new RegExp(
  TOKENS.map((t) => `(${t.re.source})`).join("|"),
  "g"
);

/**
 * 把 C++ 源代码高亮成 HTML 字符串。
 * @param {string} code 原始 C++ 代码
 * @returns {string} 带 <span> 标签的 HTML（已转义，可直接放进 dangerouslySetInnerHTML）
 */
export function highlightCpp(code) {
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
