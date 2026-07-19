// 用 TypeScript 编译器检查所有 mantine 组件文件
import ts from "typescript";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "app", "mantine");

const files = [
  "page.js",
  "layout.js",
  "components/notifications.js",
  "components/FormDemo.jsx",
  "components/DataDemo.jsx",
  "components/FeedbackDemo.jsx",
  "components/LayoutDemo.jsx",
];

let allOK = true;

for (const file of files) {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${file}: 文件不存在`);
    allOK = false;
    continue;
  }

  const source = fs.readFileSync(filePath, "utf-8");
  const isJsx = file.endsWith(".jsx");

  // 根据扩展名选择 script kind
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.ES2020,
    true,
    isJsx ? ts.ScriptKind.TSX : ts.ScriptKind.JS
  );

  // 检查语法错误
  const diagnostics = (sourceFile.parseDiagnostics || []);
  if (diagnostics.length === 0) {
    console.log(`✅ ${file}`);
  } else {
    allOK = false;
    console.log(`❌ ${file}:`);
    for (const d of diagnostics) {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(d.start || 0);
      const msg = ts.flattenDiagnosticMessageText(d.messageText, "\n");
      console.log(`  行 ${line + 1} 列 ${character + 1}: ${msg}`);
    }
  }
}

console.log(allOK ? "\n🎉 所有文件语法 OK" : "\n⚠️ 有文件语法错误");
process.exit(allOK ? 0 : 1);
