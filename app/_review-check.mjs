// 临时审查脚本：检查各章节文件 code 字段的语法和转译错误
// 用法: node app/_review-check.mjs
import vm from "node:vm";
import ts from "typescript";

const BASE = "./app";

const fileGroups = {
  "Node.js 教程": Array.from({ length: 15 }, (_, i) => `chapters-batch${i + 1}.js`),
  "Node.js 进阶": Array.from({ length: 5 }, (_, i) => `nodejs2-chapters-batch${i + 1}.js`),
  "Node.js 源码": Array.from({ length: 5 }, (_, i) => `nodejs3-chapters-batch${i + 1}.js`),
  "TypeScript 教程": Array.from({ length: 12 }, (_, i) => `ts-chapters-batch${i + 1}.js`),
  "TypeScript 进阶": Array.from({ length: 5 }, (_, i) => `ts2-chapters-batch${i + 1}.js`),
  "TypeScript 高阶": Array.from({ length: 5 }, (_, i) => `ts3-chapters-batch${i + 1}.js`),
};

const isTS = (f) => f.startsWith("ts") || f.startsWith("ts2") || f.startsWith("ts3");

const TS_COMPILER_OPTIONS = {
  target: ts.ScriptTarget.ES2020,
  module: ts.ModuleKind.CommonJS,
  strict: false,
  noImplicitAny: false,
  experimentalDecorators: true,
  emitDecoratorMetadata: true,
  removeComments: false,
  esModuleInterop: true,
  allowSyntheticDefaultImports: true,
  isolatedModules: true,
  noEmitOnError: false,
  reportDiagnostics: false,
};

// 解析文件，提取每个章节的 id, title, code
// 由于文件是 ES module 模板字符串，直接用正则匹配 code: ` ... ` 不够稳健。
// 改用：用 node 的 vm 模块以 CommonJS 方式不能直接 import ESM。
// 简单做法：用动态 import() 加载模块拿到 chapters 数组。
function extractChapters(filePath) {
  // 这些文件用 export const chapters，是 ESM。用 import() 动态加载。
  return import(filePath).then((m) => m.chapters || []);
}

async function main() {
  const issues = [];
  for (const [groupName, files] of Object.entries(fileGroups)) {
    for (const f of files) {
      const full = `${BASE}/${f}`;
      let chapters = [];
      try {
        const mod = await import(`./${f}`);
        chapters = mod.chapters || [];
      } catch (e) {
        issues.push(`${f}:0 - 文件加载失败 - ${e.message}`);
        continue;
      }
      for (let idx = 0; idx < chapters.length; idx++) {
        const ch = chapters[idx];
        if (!ch || !ch.code) continue;
        const code = ch.code;
        const tsFile = isTS(f);
        if (tsFile) {
          // 用 ts.transpileModule 检查语法
          const out = ts.transpileModule(code, {
            compilerOptions: TS_COMPILER_OPTIONS,
            fileName: "user-code.ts",
            reportDiagnostics: true,
          });
          const diags2 = (out.diagnostics || []);
          if (diags2.length > 0) {
            for (const d of diags2) {
              const msg = ts.flattenDiagnosticMessageText(d.messageText, "\n");
              let loc = "";
              if (d.file && typeof d.start === "number") {
                const { line, character } = d.file.getLineAndCharacterOfPosition(d.start);
                loc = `第${line + 1}行第${character + 1}列`;
              }
              issues.push(`${f} - 章节 ${ch.id} - [TS转译] ${loc} ${msg}`);
            }
          }
          // 再对转译后的 JS 做语法检查
          const js = out.outputText || "";
          if (js) {
            try {
              new vm.Script(`(async()=>{${js}\n})();`, { filename: `${ch.id}.js` });
            } catch (e) {
              issues.push(`${f} - 章节 ${ch.id} - [JS语法] ${e.message}`);
            }
          }
        } else {
          // JS 代码做语法检查
          try {
            new vm.Script(`(async()=>{${code}\n})();`, { filename: `${ch.id}.js` });
          } catch (e) {
            issues.push(`${f} - 章节 ${ch.id} - [JS语法] ${e.message}`);
          }
        }
      }
    }
  }
  // 输出结果
  if (issues.length === 0) {
    console.log("未发现语法/转译错误。");
  } else {
    console.log(`发现 ${issues.length} 个潜在问题：\n`);
    issues.forEach((s) => console.log(s));
  }
}

main().catch((e) => {
  console.error("脚本执行出错:", e);
  process.exit(1);
});
