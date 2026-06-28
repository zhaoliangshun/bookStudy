// =============================================================
// C# 语法高亮器
// -------------------------------------------------------------
// 作用：把一段 C# 源代码转换成带 <span class="tok-xxx"> 标签的
//       HTML，用于在代码编辑器下方的 <pre> 高亮层中渲染彩色代码。
//
// 实现思路：与 Java/Python 高亮器相同——「单遍扫描 + 主正则
//   交替 (alternation)」。把所有 token 类型按优先级写进一个正则的
//   多个分组里，用 exec 循环扫描整段代码，命中即包 span。
//
// C# 特性支持：
//   1. 注释：// 单行、/* */ 多行、/// XML 文档注释
//   2. 字符串：普通 "..."、插值 $"..."、原义 @"..."、原义插值 @$"..."
//   3. 字符：'...'
//   4. 关键字：class/interface/struct/record/enum/public/private...
//   5. 上下文关键字：var/async/await/get/set/value/init/where/select...
//   6. 字面量：true/false/null
//   7. 特性：[Attribute]
//   8. 预处理指令：#region/#nullable/#if/#endif...
//   9. 类型名：大写字母开头的标识符
// =============================================================

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const TOKENS = [
  {
    type: "comment",
    // 注释：/// XML 文档、/* */ 多行、// 单行
    re: /\/\/\/[^\n]*|\/\*[\s\S]*?\*\/|\/\/[^\n]*/,
  },
  {
    type: "string",
    // C# 字符串：
    //   1) @$"..." 或 $@"..." 原义插值（可跨行）
    //   2) @"..." 原义字符串
    //   3) $"..." 插值字符串
    //   4) "..." 普通字符串
    re: /@?\$"(?:[^"\\]|"")*"|\$@"(?:[^"\\]|"")*"|@"(?:[^"]|"")*"|"(?:\\.|[^"\\])*"/,
  },
  {
    type: "char",
    // 字符字面量 '...'
    re: /'(?:\\.|[^'\\])*'/,
  },
  {
    type: "preprocessor",
    // 预处理指令：#region #endregion #nullable #if #else #endif #define #undef #pragma #warning #error #line
    re: /#\s*(?:region|endregion|nullable|if|elif|else|endif|define|undef|pragma|warning|error|line|default|hidden)[^\n]*/,
  },
  {
    type: "annotation",
    // 特性：[Attribute(...)]
    re: /\[[A-Za-z_][A-Za-z0-9_.]*(?:\([^)]*\))?\]/,
  },
  {
    type: "number",
    // C# 数字：整数（0x/0b 前缀，_ 分隔符）、浮点、科学计数法、后缀 f/F/d/D/m/M/l/L/u/U/ul/UL
    re: /\b0[xX][0-9a-fA-F_]+|\b0[bB][01_]+|\b\d+(?:_\d+)*(?:\.\d+(?:_\d+)*)?(?:[eE][+-]?\d+)?[fFdDmMlLuU]*\b/,
  },
  {
    type: "keyword",
    // C# 关键字（不含字面量）
    re: /\b(?:abstract|as|base|bool|break|byte|case|catch|char|checked|class|const|continue|decimal|default|delegate|do|double|else|enum|event|explicit|extern|finally|fixed|float|for|foreach|goto|if|implicit|in|int|interface|internal|is|lock|long|namespace|new|object|operator|out|override|params|private|protected|public|readonly|ref|return|sbyte|sealed|short|sizeof|stackalloc|static|string|struct|switch|this|throw|try|typeof|uint|ulong|unchecked|unsafe|ushort|using|virtual|void|volatile|while|record|partial|nameof|when|yield)\b/,
  },
  {
    type: "literal",
    // 布尔与空值
    re: /\b(?:true|false|null)\b/,
  },
  {
    type: "contextual",
    // 上下文关键字：var、async、await、get、set、value、init、where、select、from、group、into、orderby、join、let、on、equals、by、ascending、descending、global、dynamic、unmanaged、notnull、managed、file
    re: /\b(?:var|async|await|get|set|value|init|where|select|from|group|into|orderby|join|let|on|equals|by|ascending|descending|global|dynamic|unmanaged|notnull|managed|file)\b/,
  },
  {
    type: "type",
    // 类型名：大写字母开头的标识符（如 String, Console, List, Dictionary）
    re: /\b[A-Z][A-Za-z0-9_]*\b/,
  },
  {
    type: "function",
    // 「标识符紧跟 (」视为方法调用，着色为函数名。
    re: /[A-Za-z_][A-Za-z0-9_]*(?=\s*\()/,
  },
];

const MASTER_REGEX = new RegExp(
  TOKENS.map((t) => `(${t.re.source})`).join("|"),
  "g"
);

/**
 * 把 C# 源代码高亮成 HTML 字符串。
 * @param {string} code 原始 C# 代码
 * @returns {string} 带 <span> 标签的 HTML（已转义，可直接放进 dangerouslySetInnerHTML）
 */
export function highlightCsharp(code) {
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
