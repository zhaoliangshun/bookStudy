// =============================================================
// 外网在线运行平台（External Playground）定义
// -------------------------------------------------------------
// 当本地未安装某语言的运行环境时，可将代码发送到外部在线平台运行。
// 每个平台通过 open(code, langLower) 方法在新标签页打开并尽量自动填入代码。
//
// 四种代码传递方式：
//   1. form  — 创建临时 <form> POST 提交（CodePen / JSFiddle）
//   2. url   — URL 直接携带编码后的代码（Python Tutor）
//   3. fetch — 先 fetch 获取分享 ID 再跳转（Go Playground）
//   4. copy  — 平台不支持 URL 传码，打开空白页 + 复制代码到剪贴板
// =============================================================

// ---------- 辅助：创建临时表单并 POST 提交 ----------
// CodePen / JSFiddle 通过表单 POST 接收代码，这是最可靠的代码传递方式。
// 表单 target="_blank" 在新标签页打开，提交后立即移除临时表单。
function submitForm(action, fields) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = action;
  form.target = "_blank";
  form.style.display = "none";
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
  form.remove();
}

// ---------- 辅助：复制代码到剪贴板 ----------
// 优先使用现代 Clipboard API，降级到 execCommand 兼容旧浏览器。
async function copyCode(code) {
  try {
    await navigator.clipboard.writeText(code);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = code;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

// ---------- 辅助：先开新标签页，再复制代码 ----------
// 注意：必须先 window.open（在用户手势同步调用栈内），再 await 复制。
// 反过来会导致 window.open 被 popup blocker 拦截（脱离了用户手势上下文）。
async function openAndCopy(url, code) {
  window.open(url, "_blank", "noopener,noreferrer");
  return await copyCode(code);
}

// ---------- 轻量 Toast 提示 ----------
// 用固定定位的 div 显示提示，3 秒后自动淡出。
// 不依赖 React 状态，可在非组件代码（如本模块）中直接调用。
let toastTimer = null;
function showToast(message, type = "info") {
  let toast = document.getElementById("ext-pg-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "ext-pg-toast";
    toast.className = "ext-pg-toast";
    document.body.appendChild(toast);
  }
  toast.className = "ext-pg-toast ext-pg-toast-" + type;
  toast.textContent = message;
  // 触发重排后再设置 opacity，确保过渡动画生效
  void toast.offsetWidth;
  toast.style.opacity = "1";
  toast.style.transform = "translateX(-50%) translateY(0)";
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(10px)";
  }, 3000);
}

// ---------- Replit 语言标识映射 ----------
const REPLIT_LANG = {
  py: "python3", python: "python3",
  java: "java10",
  c: "c", cpp: "cpp", "c++": "cpp", cc: "cpp",
  cs: "csharp", csharp: "csharp",
  rb: "ruby", ruby: "ruby",
  swift: "swift",
  sh: "bash", bash: "bash", shell: "bash", zsh: "bash",
  ts: "typescript", typescript: "typescript",
  js: "nodejs", javascript: "nodejs", node: "nodejs",
};

// ---------- OnlineGDB 语言页面对照 ----------
const ONLINEGDB_SLUG = {
  c: "online_c_compiler",
  cpp: "online_cpp_compiler",
  "c++": "online_cpp_compiler",
  cc: "online_cpp_compiler",
  java: "online_java_compiler",
  rb: "online_ruby_compiler",
  ruby: "online_ruby_compiler",
  swift: "online_swift_compiler",
  sh: "online_bash_shell",
  bash: "online_bash_shell",
  shell: "online_bash_shell",
  zsh: "online_bash_shell",
};

// ---------- OneCompiler 语言标识映射 ----------
// OneCompiler 支持 70+ 语言，URL 格式：https://onecompiler.com/{lang}
const ONECOMPILER_LANG = {
  py: "python", python: "python",
  js: "javascript", javascript: "javascript", node: "javascript", jsx: "javascript",
  ts: "typescript", typescript: "typescript", tsx: "typescript",
  java: "java",
  c: "c",
  cpp: "cpp", "c++": "cpp", cc: "cpp",
  cs: "csharp", csharp: "csharp",
  go: "golang", golang: "golang",
  rb: "ruby", ruby: "ruby",
  swift: "swift",
  sh: "bash", bash: "bash", shell: "bash", zsh: "bash",
  sql: "postgresql",
  scss: "scss", sass: "sass",
  html: "html",
};

// ---------- Programiz 语言页面对照 ----------
// Programiz 在线编译器，URL 格式：https://www.programiz.com/{lang}/online-compiler/
const PROGRAMIZ_SLUG = {
  py: "python-programming", python: "python-programming",
  java: "java",
  c: "c-programming",
  cpp: "cpp", "c++": "cpp", cc: "cpp",
  cs: "csharp", csharp: "csharp",
  go: "golang",
  rb: "ruby", ruby: "ruby",
  swift: "swift",
  sql: "sql",
};

// ---------- JDoodle 语言标识映射 ----------
// JDoodle 支持 88+ 语言，URL 格式：https://www.jdoodle.com/online-{lang}-compiler/
const JDOODLE_SLUG = {
  py: "python", python: "python",
  java: "java",
  c: "c-language",
  cpp: "cpp", "c++": "cpp", cc: "cpp",
  cs: "csharp", csharp: "csharp",
  go: "go",
  rb: "ruby", ruby: "ruby",
  swift: "swift",
  sh: "bash-shell", bash: "bash-shell", shell: "bash-shell", zsh: "bash-shell",
  sql: "sql",
};

// ---------- paiza.io 语言标识映射 ----------
// paiza.io 在线 IDE，URL 格式：https://paiza.io/projects/new?language={lang}
const PAIZA_LANG = {
  py: "python3", python: "python3",
  js: "javascript", javascript: "javascript", node: "javascript", jsx: "javascript",
  ts: "typescript", typescript: "typescript", tsx: "typescript",
  java: "java",
  c: "c",
  cpp: "cpp", "c++": "cpp", cc: "cpp",
  cs: "csharp", csharp: "csharp",
  go: "go",
  rb: "ruby", ruby: "ruby",
  sh: "bash", bash: "bash", shell: "bash", zsh: "bash",
};

// ---------- Wandbox 语言标识映射 ----------
// Wandbox 是开源编译器云服务，支持通过 POST API 获取永久链接
// 主要用于 C/C++ 等编译型语言的快速测试
const WANDOX_LANG = {
  c: "gcc-head",
  cpp: "gcc-head", "c++": "gcc-head", cc: "gcc-head",
};

// =============================================================
// 外网平台定义
// =============================================================
// 每个平台对象包含：
//   label — 显示名称
//   icon  — 图标 emoji
//   open(code, langLower) — 异步打开平台，尽量自动填入代码
export const PLAYGROUNDS = {
  // ---- CodePen：前端三件套（JS / HTML / CSS）的黄金标准 ----
  // 通过 POST 表单提交，data 字段为 JSON 字符串，含 title + js/html/css
  codepen: {
    label: "CodePen",
    icon: "✏️",
    open: (code, langLower) => {
      const field =
        langLower === "css" || langLower === "scss" || langLower === "sass"
          ? "css"
          : langLower === "html"
          ? "html"
          : "js";
      submitForm("https://codepen.io/pen/define", {
        data: JSON.stringify({ title: "bookStudy 代码", [field]: code }),
      });
    },
  },

  // ---- JSFiddle：与 CodePen 类似，POST 表单 ----
  jsfiddle: {
    label: "JSFiddle",
    icon: "🟣",
    open: (code, langLower) => {
      const field =
        langLower === "css" || langLower === "scss" || langLower === "sass"
          ? "css"
          : langLower === "html"
          ? "html"
          : "js";
      submitForm("https://jsfiddle.net/api/post/library/pure/", {
        [field]: code,
        wrap: "l",
      });
    },
  },

  // ---- TypeScript Playground ----
  // #code 片段使用 LZ-string 压缩，无法在前端不引入库的情况下直接传明文
  // 因此采用「打开空白页 + 复制代码」策略
  tsplayground: {
    label: "TS Playground",
    icon: "🔷",
    open: async (code) => {
      const ok = await openAndCopy("https://www.typescriptlang.org/play", code);
      showToast(
        ok
          ? "TypeScript 代码已复制，请粘贴到 TS Playground 编辑器中"
          : "复制失败，请手动复制代码",
        ok ? "info" : "error"
      );
    },
  },

  // ---- Go Playground ----
  // 官方 Go Playground 支持通过 POST /share 获取分享 ID，再用 ID 打开
  // 若 fetch 因 CORS 等原因失败，回退到「打开空白页 + 复制代码」
  goplayground: {
    label: "Go Playground",
    icon: "🐹",
    open: async (code) => {
      try {
        const res = await fetch("https://go.dev/share", {
          method: "POST",
          headers: { "Content-Type": "text/plain; charset=utf-8" },
          body: code,
        });
        if (!res.ok) throw new Error("share failed");
        const id = (await res.text()).trim();
        window.open("https://go.dev/p/" + id, "_blank", "noopener,noreferrer");
      } catch {
        const ok = await openAndCopy("https://go.dev/play/", code);
        showToast(
          ok
            ? "Go 代码已复制，请粘贴到 Go Playground 编辑器中"
            : "复制失败，请手动复制代码",
          ok ? "info" : "error"
        );
      }
    },
  },

  // ---- Python Tutor：逐行可视化执行 Python 代码 ----
  // URL 的 #code 片段直接携带 encodeURIComponent 编码的明文代码
  pythontutor: {
    label: "Python Tutor",
    icon: "🎓",
    open: (code) => {
      window.open(
        "https://pythontutor.com/render.html#code=" +
          encodeURIComponent(code) +
          "&cumulative=false&curInstr=0&mode=display",
        "_blank",
        "noopener,noreferrer"
      );
    },
  },

  // ---- Replit：支持多语言的在线 IDE ----
  // 不支持 URL 传码，打开对应语言空白项目 + 复制代码
  replit: {
    label: "Replit",
    icon: "🌀",
    open: async (code, langLower) => {
      const rl = REPLIT_LANG[langLower] || "python3";
      const ok = await openAndCopy("https://replit.com/languages/" + rl, code);
      showToast(
        ok
          ? "代码已复制，请粘贴到 Replit 编辑器中"
          : "复制失败，请手动复制代码",
        ok ? "info" : "error"
      );
    },
  },

  // ---- SassMeister：SCSS/Sass 在线编译 ----
  sassmeister: {
    label: "SassMeister",
    icon: "💅",
    open: async (code) => {
      const ok = await openAndCopy("https://www.sassmeister.com/", code);
      showToast(
        ok
          ? "SCSS 代码已复制，请粘贴到 SassMeister 编辑器中"
          : "复制失败，请手动复制代码",
        ok ? "info" : "error"
      );
    },
  },

  // ---- .NET Fiddle：C# 在线运行 ----
  dotnetfiddle: {
    label: ".NET Fiddle",
    icon: "🟦",
    open: async (code) => {
      const ok = await openAndCopy("https://dotnetfiddle.net/", code);
      showToast(
        ok
          ? "C# 代码已复制，请粘贴到 .NET Fiddle 编辑器中"
          : "复制失败，请手动复制代码",
        ok ? "info" : "error"
      );
    },
  },

  // ---- DB Fiddle：SQL 在线运行 ----
  dbfiddle: {
    label: "DB Fiddle",
    icon: "🗄️",
    open: async (code) => {
      const ok = await openAndCopy("https://www.db-fiddle.com/", code);
      showToast(
        ok
          ? "SQL 代码已复制，请粘贴到 DB Fiddle 编辑器中"
          : "复制失败，请手动复制代码",
        ok ? "info" : "error"
      );
    },
  },

  // ---- GraphQL Bin：GraphQL 在线调试 ----
  graphqlbin: {
    label: "GraphQL Bin",
    icon: "◈",
    open: async (code) => {
      const ok = await openAndCopy("https://graphqlbin.com/v2/new", code);
      showToast(
        ok
          ? "GraphQL 代码已复制，请粘贴到 GraphQL Bin 编辑器中"
          : "复制失败，请手动复制代码",
        ok ? "info" : "error"
      );
    },
  },

  // ---- OnlineGDB：多语言在线编译器 ----
  // 支持 C / C++ / Java / Ruby / Swift / Shell 等
  onlinegdb: {
    label: "OnlineGDB",
    icon: "💻",
    open: async (code, langLower) => {
      const slug = ONLINEGDB_SLUG[langLower] || "online_c_compiler";
      const ok = await openAndCopy("https://www.onlinegdb.com/" + slug, code);
      showToast(
        ok
          ? "代码已复制，请粘贴到 OnlineGDB 编辑器中"
          : "复制失败，请手动复制代码",
        ok ? "info" : "error"
      );
    },
  },

  // ---- OneCompiler：支持 70+ 语言的在线编译器 ----
  // URL 格式：https://onecompiler.com/{lang}
  // 不支持 URL 传码，打开空白页 + 复制代码
  onecompiler: {
    label: "OneCompiler",
    icon: "1️⃣",
    open: async (code, langLower) => {
      const ol = ONECOMPILER_LANG[langLower] || "python";
      const ok = await openAndCopy("https://onecompiler.com/" + ol, code);
      showToast(
        ok
          ? "代码已复制，请粘贴到 OneCompiler 编辑器中"
          : "复制失败，请手动复制代码",
        ok ? "info" : "error"
      );
    },
  },

  // ---- Programiz：面向初学者的在线编译器 ----
  // 界面简洁，适合教学场景
  programiz: {
    label: "Programiz",
    icon: "📚",
    open: async (code, langLower) => {
      const slug = PROGRAMIZ_SLUG[langLower] || "python-programming";
      const ok = await openAndCopy(
        "https://www.programiz.com/" + slug + "/online-compiler/",
        code
      );
      showToast(
        ok
          ? "代码已复制，请粘贴到 Programiz 编辑器中"
          : "复制失败，请手动复制代码",
        ok ? "info" : "error"
      );
    },
  },

  // ---- JDoodle：支持 88+ 语言的在线编程平台 ----
  // 老牌在线编译器，支持多文件项目
  jdoodle: {
    label: "JDoodle",
    icon: "🍲",
    open: async (code, langLower) => {
      const slug = JDOODLE_SLUG[langLower] || "python";
      const ok = await openAndCopy(
        "https://www.jdoodle.com/online-" + slug + "-compiler/",
        code
      );
      showToast(
        ok
          ? "代码已复制，请粘贴到 JDoodle 编辑器中"
          : "复制失败，请手动复制代码",
        ok ? "info" : "error"
      );
    },
  },

  // ---- paiza.io：支持多语言的在线 IDE ----
  // URL 可携带 language 参数指定语言，但代码需手动粘贴
  paiza: {
    label: "paiza.io",
    icon: "🇯🇵",
    open: async (code, langLower) => {
      const lang = PAIZA_LANG[langLower] || "python3";
      const ok = await openAndCopy(
        "https://paiza.io/projects/new?language=" + lang,
        code
      );
      showToast(
        ok
          ? "代码已复制，请粘贴到 paiza.io 编辑器中"
          : "复制失败，请手动复制代码",
        ok ? "info" : "error"
      );
    },
  },

  // ---- Sololearn：社交化编程学习平台 ----
  // 支持多语言在线运行，适合手机端使用
  sololearn: {
    label: "Sololearn",
    icon: "🎓",
    open: async (code, langLower) => {
      const slMap = {
        py: "python", python: "python",
        js: "javascript", javascript: "javascript", node: "javascript", jsx: "javascript",
        ts: "typescript", typescript: "typescript", tsx: "typescript",
        java: "java",
        c: "c",
        cpp: "cpp", "c++": "cpp", cc: "cpp",
        cs: "csharp", csharp: "csharp",
        go: "go",
        rb: "ruby", ruby: "ruby",
        swift: "swift",
        sql: "sql",
      };
      const sl = slMap[langLower] || "python";
      const ok = await openAndCopy(
        "https://www.sololearn.com/compiler-playground/" + sl,
        code
      );
      showToast(
        ok
          ? "代码已复制，请粘贴到 Sololearn 编辑器中"
          : "复制失败，请手动复制代码",
        ok ? "info" : "error"
      );
    },
  },

  // ---- Trinket：Python 教学专用在线平台 ----
  // 支持 Python 2/3，可嵌入网页，适合教学场景
  trinket: {
    label: "Trinket",
    icon: "🐍",
    open: async (code) => {
      const ok = await openAndCopy("https://trinket.io/python3", code);
      showToast(
        ok
          ? "Python 代码已复制，请粘贴到 Trinket 编辑器中"
          : "复制失败，请手动复制代码",
        ok ? "info" : "error"
      );
    },
  },

  // ---- Reeborg's World：Python 海龟绘图/网格机器人教学平台 ----
  // 适合学习循环、函数、递归等基础概念
  reeborg: {
    label: "Reeborg",
    icon: "🤖",
    open: async (code) => {
      const ok = await openAndCopy("https://reeborg.ca/reeborg.html", code);
      showToast(
        ok
          ? "Python 代码已复制，请粘贴到 Reeborg's World 的编辑器中"
          : "复制失败，请手动复制代码",
        ok ? "info" : "error"
      );
    },
  },

  // ---- Python Anywhere：云端 Python 开发环境 ----
  // 提供 IPython Shell 和 Bash 终端，适合 Web 开发测试
  pythonanywhere: {
    label: "PythonAnywhere",
    icon: "☁️",
    open: async (code) => {
      const ok = await openAndCopy(
        "https://www.pythonanywhere.com/try-ipython/",
        code
      );
      showToast(
        ok
          ? "Python 代码已复制，请粘贴到 PythonAnywhere IPython Shell 中"
          : "复制失败，请手动复制代码",
        ok ? "info" : "error"
      );
    },
  },

  // ---- Coding Ground (Tutorialspoint)：多语言在线 IDE ----
  // 提供 Cloud IDE 环境，支持 80+ 语言
  codingground: {
    label: "CodingGround",
    icon: "🎯",
    open: async (code, langLower) => {
      const cgMap = {
        py: "python", python: "python",
        js: "nodejs", javascript: "nodejs", node: "nodejs", jsx: "nodejs",
        ts: "typescript", typescript: "typescript", tsx: "typescript",
        java: "java",
        c: "c",
        cpp: "cpp", "c++": "cpp", cc: "cpp",
        cs: "csharp", csharp: "csharp",
        go: "go",
        rb: "ruby", ruby: "ruby",
        swift: "swift",
        sh: "bash", bash: "bash", shell: "bash", zsh: "bash",
        sql: "sqlite",
        scss: "sass", sass: "sass",
      };
      const cg = cgMap[langLower] || "python";
      const ok = await openAndCopy(
        "https://www.tutorialspoint.com/online_" + cg + "_compiler.php",
        code
      );
      showToast(
        ok
          ? "代码已复制，请粘贴到 CodingGround 编辑器中"
          : "复制失败，请手动复制代码",
        ok ? "info" : "error"
      );
    },
  },

  // ---- Wandbox：开源编译器云服务 ----
  // 支持 GCC/Clang 等多版本编译器，通过 POST API 获取永久链接
  // 主要用于 C/C++ 等编译型语言
  wandbox: {
    label: "Wandbox",
    icon: "📦",
    open: async (code, langLower) => {
      try {
        const compiler = WANDOX_LANG[langLower] || "gcc-head";
        const res = await fetch("https://wandbox.org/api/compile.json", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: code,
            compiler: compiler,
            save: true,
            runtime: false,
          }),
        });
        if (!res.ok) throw new Error("wandbox share failed");
        const data = await res.json();
        if (data.url) {
          window.open(data.url, "_blank", "noopener,noreferrer");
          return;
        }
        throw new Error("no url in response");
      } catch {
        const ok = await openAndCopy("https://wandbox.org/", code);
        showToast(
          ok
            ? "代码已复制，请粘贴到 Wandbox 编辑器中"
            : "复制失败，请手动复制代码",
          ok ? "info" : "error"
        );
      }
    },
  },

  // ---- CodeSandbox：前端在线沙盒 ----
  // 适合 React/Vue/Next.js 等前端项目
  codesandbox: {
    label: "CodeSandbox",
    icon: "📦",
    open: async (code) => {
      const ok = await openAndCopy("https://codesandbox.io/s/new", code);
      showToast(
        ok
          ? "JavaScript 代码已复制，请粘贴到 CodeSandbox 编辑器中"
          : "复制失败，请手动复制代码",
        ok ? "info" : "error"
      );
    },
  },

  // ---- StackBlitz：基于 Vite 的前端在线 IDE ----
  // 启动速度快，支持现代前端框架
  stackblitz: {
    label: "StackBlitz",
    icon: "⚡",
    open: async (code) => {
      const ok = await openAndCopy(
        "https://stackblitz.com/edit/js-?file=index.js",
        code
      );
      showToast(
        ok
          ? "JavaScript 代码已复制，请粘贴到 StackBlitz 编辑器中"
          : "复制失败，请手动复制代码",
        ok ? "info" : "error"
      );
    },
  },

  // ---- SQLite Online：SQL 在线运行 ----
  sqliteonline: {
    label: "SQLite Online",
    icon: "🗄️",
    open: async (code) => {
      const ok = await openAndCopy("https://sqliteonline.com/", code);
      showToast(
        ok
          ? "SQL 代码已复制，请粘贴到 SQLite Online 编辑器中"
          : "复制失败，请手动复制代码",
        ok ? "info" : "error"
      );
    },
  },

  // ---- DB Fiddle for SQLite ----
  sqlitefiddle: {
    label: "SQLite Fiddle",
    icon: "🔧",
    open: async (code) => {
      const ok = await openAndCopy(
        "https://sqlitefiddle.com/",
        code
      );
      showToast(
        ok
          ? "SQL 代码已复制，请粘贴到 SQLite Fiddle 编辑器中"
          : "复制失败，请手动复制代码",
        ok ? "info" : "error"
      );
    },
  },

  // ---- CodeChef IDE：多语言在线编译器 ----
  // 主要面向算法竞赛，但开放给所有人使用
  codechef: {
    label: "CodeChef",
    icon: "👨‍🍳",
    open: async (code) => {
      const ok = await openAndCopy("https://www.codechef.com/ide", code);
      showToast(
        ok
          ? "代码已复制，请粘贴到 CodeChef IDE 编辑器中"
          : "复制失败，请手动复制代码",
        ok ? "info" : "error"
      );
    },
  },

  // ---- GeeksforGeeks IDE：多语言在线编译器 ----
  gfg: {
    label: "GfG IDE",
    icon: "🧠",
    open: async (code) => {
      const ok = await openAndCopy(
        "https://ide.geeksforgeeks.org/",
        code
      );
      showToast(
        ok
          ? "代码已复制，请粘贴到 GeeksforGeeks IDE 编辑器中"
          : "复制失败，请手动复制代码",
        ok ? "info" : "error"
      );
    },
  },
};

// =============================================================
// 语言 → 可用外网平台列表
// =============================================================
// 顺序即菜单展示顺序，最常用的排在前面
const LANG_EXTERNAL_MAP = {
  // JavaScript / Node.js → CodePen + JSFiddle + CodeSandbox + StackBlitz + 多语言平台
  js: ["codepen", "jsfiddle", "stackblitz", "codesandbox", "onecompiler", "paiza", "sololearn", "codingground", "codechef", "gfg"],
  javascript: ["codepen", "jsfiddle", "stackblitz", "codesandbox", "onecompiler", "paiza", "sololearn", "codingground", "codechef", "gfg"],
  jsx: ["codepen", "jsfiddle", "stackblitz", "codesandbox", "onecompiler", "paiza", "sololearn", "codingground", "codechef", "gfg"],
  node: ["codepen", "jsfiddle", "stackblitz", "codesandbox", "onecompiler", "paiza", "sololearn", "codingground", "codechef", "gfg"],
  // TypeScript → TS Playground + CodePen + 多语言平台
  ts: ["tsplayground", "codepen", "onecompiler", "paiza", "sololearn", "codingground", "codechef", "gfg"],
  typescript: ["tsplayground", "codepen", "onecompiler", "paiza", "sololearn", "codingground", "codechef", "gfg"],
  tsx: ["tsplayground", "codepen", "onecompiler", "paiza", "sololearn", "codingground", "codechef", "gfg"],
  // Python → Python Tutor（可视化）+ Trinket（教学）+ 多语言平台
  py: ["pythontutor", "trinket", "programiz", "onecompiler", "jdoodle", "paiza", "replit", "sololearn", "codingground", "pythonanywhere", "reeborg", "codechef", "gfg"],
  python: ["pythontutor", "trinket", "programiz", "onecompiler", "jdoodle", "paiza", "replit", "sololearn", "codingground", "pythonanywhere", "reeborg", "codechef", "gfg"],
  // Java → OnlineGDB + Replit + 多语言平台
  java: ["onlinegdb", "replit", "programiz", "onecompiler", "jdoodle", "paiza", "sololearn", "codingground", "codechef", "gfg"],
  // C → OnlineGDB + Replit + Wandbox + 多语言平台
  c: ["onlinegdb", "replit", "wandbox", "programiz", "onecompiler", "jdoodle", "paiza", "sololearn", "codingground", "codechef", "gfg"],
  // C++ → OnlineGDB + Replit + Wandbox + 多语言平台
  cpp: ["onlinegdb", "replit", "wandbox", "programiz", "onecompiler", "jdoodle", "paiza", "sololearn", "codingground", "codechef", "gfg"],
  "c++": ["onlinegdb", "replit", "wandbox", "programiz", "onecompiler", "jdoodle", "paiza", "sololearn", "codingground", "codechef", "gfg"],
  cc: ["onlinegdb", "replit", "wandbox", "programiz", "onecompiler", "jdoodle", "paiza", "sololearn", "codingground", "codechef", "gfg"],
  // C# → .NET Fiddle + Replit + 多语言平台
  cs: ["dotnetfiddle", "replit", "programiz", "onecompiler", "jdoodle", "paiza", "sololearn", "codingground", "codechef", "gfg"],
  csharp: ["dotnetfiddle", "replit", "programiz", "onecompiler", "jdoodle", "paiza", "sololearn", "codingground", "codechef", "gfg"],
  // Go → Go Playground（官方）+ 多语言平台
  go: ["goplayground", "programiz", "onecompiler", "jdoodle", "paiza", "sololearn", "codingground", "codechef", "gfg"],
  golang: ["goplayground", "programiz", "onecompiler", "jdoodle", "paiza", "sololearn", "codingground", "codechef", "gfg"],
  // Sass / SCSS → SassMeister + CodePen
  scss: ["sassmeister", "codepen", "onecompiler", "codingground"],
  sass: ["sassmeister", "codepen", "onecompiler", "codingground"],
  // GraphQL → GraphQL Bin
  gql: ["graphqlbin"],
  graphql: ["graphqlbin"],
  // Ruby → OnlineGDB + Replit + 多语言平台
  rb: ["onlinegdb", "replit", "programiz", "onecompiler", "jdoodle", "paiza", "sololearn", "codingground", "codechef", "gfg"],
  ruby: ["onlinegdb", "replit", "programiz", "onecompiler", "jdoodle", "paiza", "sololearn", "codingground", "codechef", "gfg"],
  // Swift → OnlineGDB + Replit + 多语言平台
  swift: ["onlinegdb", "replit", "programiz", "onecompiler", "jdoodle", "sololearn", "codingground", "codechef", "gfg"],
  // Shell → OnlineGDB + Replit + 多语言平台
  sh: ["onlinegdb", "replit", "onecompiler", "jdoodle", "paiza", "codingground", "codechef", "gfg"],
  bash: ["onlinegdb", "replit", "onecompiler", "jdoodle", "paiza", "codingground", "codechef", "gfg"],
  shell: ["onlinegdb", "replit", "onecompiler", "jdoodle", "paiza", "codingground", "codechef", "gfg"],
  zsh: ["onlinegdb", "replit", "onecompiler", "jdoodle", "paiza", "codingground", "codechef", "gfg"],
  // SQL → DB Fiddle + SQLite Online + 多语言平台
  sql: ["dbfiddle", "sqliteonline", "sqlitefiddle", "programiz", "onecompiler", "jdoodle", "sololearn", "codingground"],
  // HTML → CodePen + JSFiddle + CodeSandbox + StackBlitz
  html: ["codepen", "jsfiddle", "stackblitz", "codesandbox", "onecompiler"],
  // CSS → CodePen + JSFiddle
  css: ["codepen", "jsfiddle"],
};

// ---------- 获取某语言可用的外网平台列表 ----------
// 返回 [{ id, label, icon }] 数组；无可用平台时返回空数组
export function getExternalPlaygrounds(langLower) {
  const ids = LANG_EXTERNAL_MAP[langLower];
  if (!ids || ids.length === 0) return [];
  return ids.map((id) => ({
    id,
    label: PLAYGROUNDS[id]?.label || id,
    icon: PLAYGROUNDS[id]?.icon || "🌐",
  }));
}

// ---------- 打开指定外网平台 ----------
export async function openExternal(id, code, langLower) {
  const pg = PLAYGROUNDS[id];
  if (!pg) return;
  await pg.open(code, langLower);
}
