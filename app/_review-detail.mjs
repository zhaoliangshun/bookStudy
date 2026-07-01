// 精准诊断脚本：对每个有问题的章节打印出错行及上下文
import ts from "typescript";

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

const targets = [
  ["ts-chapters-batch5.js", "ts-compile-flow"],
  ["ts-chapters-batch7.js", "ts-type-gymnastics"],
  ["ts2-chapters-batch4.js", "ts2-declaration-files"],
];

for (const [file, chId] of targets) {
  const mod = await import(`./${file}`);
  const ch = (mod.chapters || []).find((c) => c.id === chId);
  if (!ch) {
    console.log(`未找到章节 ${chId} in ${file}`);
    continue;
  }
  const code = ch.code;
  const lines = code.split("\n");
  const out = ts.transpileModule(code, {
    compilerOptions: TS_COMPILER_OPTIONS,
    fileName: "user-code.ts",
    reportDiagnostics: true,
  });
  console.log(`\n========== ${file} / ${chId} ==========`);
  console.log(`输出 JS 长度: ${out.outputText?.length || 0}`);
  const diags = out.diagnostics || [];
  for (const d of diags) {
    const msg = ts.flattenDiagnosticMessageText(d.messageText, "\n");
    let line = -1, col = -1;
    if (d.file && typeof d.start === "number") {
      const p = d.file.getLineAndCharacterOfPosition(d.start);
      line = p.line + 1;
      col = p.character + 1;
    }
    console.log(`诊断: 第${line}行第${col}列 - ${msg}`);
    if (line >= 1) {
      const ctx = lines[line - 1] || "(无)";
      console.log(`  内容: ${ctx}`);
      // 上下文
      for (let l = Math.max(1, line - 2); l <= Math.min(lines.length, line + 2); l++) {
        const mark = l === line ? ">>>" : "   ";
        console.log(`  ${mark} ${l}: ${lines[l - 1]}`);
      }
    }
  }
}
