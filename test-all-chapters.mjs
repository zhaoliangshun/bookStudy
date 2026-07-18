import ts from "typescript";
import { runInSandbox } from "./app/sandbox-runner.js";
import { chapters as ch1 } from "./app/courses-data/tsx-chapters-batch1.js";
import { chapters as ch2 } from "./app/courses-data/tsx-chapters-batch2.js";
import { chapters as ch3 } from "./app/courses-data/tsx-chapters-batch3.js";

const TS_COMPILER_OPTIONS = {
  target: ts.ScriptTarget.ES2020,
  module: ts.ModuleKind.CommonJS,
  strict: false,
  esModuleInterop: true,
  allowSyntheticDefaultImports: true,
  isolatedModules: true,
  jsx: ts.JsxEmit.ReactJSX,
};

const allChapters = [...ch1, ...ch2, ...ch3];
let passed = 0, failed = 0;

for (const chapter of allChapters) {
  process.stdout.write(`测试 ${chapter.id}... `);
  try {
    const output = ts.transpileModule(chapter.code, {
      compilerOptions: TS_COMPILER_OPTIONS,
      fileName: "user-code.tsx",
      reportDiagnostics: true,
    });
    const hasErrors = output.diagnostics?.some(d => d.category === ts.DiagnosticCategory.Error);
    if (hasErrors) {
      console.log("❌ 转译错误");
      failed++;
      continue;
    }
    const result = await runInSandbox(output.outputText);
    if (result.error) {
      console.log("❌ 运行错误:", result.error.split("\n")[0]);
      failed++;
    } else {
      console.log(`✅ (${result.output.length} 字符)`);
      passed++;
    }
  } catch (e) {
    console.log("❌ 异常:", e.message);
    failed++;
  }
}
console.log(`\n总计: ${passed} 通过, ${failed} 失败`);
