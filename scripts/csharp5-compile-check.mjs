// csharp5 主 demo 编译验证脚本
// 在 net8.0 控制台项目中逐章替换 Program.cs 并增量编译，记录编译错误
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from "fs";
import { execSync } from "child_process";

const files = [];
for (let i = 1; i <= 17; i++) files.push(`csharp5-chapters-batch${i}.js`);
files.push("csharp5-chapters-production.js");

const all = [];
for (const f of files) {
  const m = await import(`../app/courses-data/${f}`);
  for (const arr of Object.values(m)) {
    if (Array.isArray(arr)) for (const c of arr) if (c && c.id && c.title) all.push(c);
  }
}
// 按 csharp5-tutorial-data.js 的真实组装顺序过滤
const excluded = new Set(["csharp5-conclusion"]); // batch14 中的旧结语被 slice 排除
const chapters = all.filter((c) => !excluded.has(c.id) || true);
console.log("待验证章节数:", chapters.length);

const workDir = "/tmp/csharp5-verify";
const projDir = `${workDir}/demo`;

// 重建项目
rmSync(workDir, { recursive: true, force: true });
mkdirSync(projDir, { recursive: true });
writeFileSync(
  `${projDir}/demo.csproj`,
  `<Project Sdk="Microsoft.NET.Sdk">\n  <PropertyGroup>\n    <OutputType>Exe</OutputType>\n    <TargetFramework>net8.0</TargetFramework>\n    <Nullable>enable</Nullable>\n    <ImplicitUsings>enable</ImplicitUsings>\n  </PropertyGroup>\n</Project>\n`
);

// 先 restore 一次
execSync("dotnet restore demo.csproj", { cwd: projDir, stdio: "pipe" });

const results = [];
for (const c of chapters) {
  writeFileSync(`${projDir}/Program.cs`, c.code);
  let stderr = "";
  try {
    execSync("dotnet build --nologo -v q 2>&1", { cwd: projDir, stdio: "pipe", timeout: 60000 });
  } catch (e) {
    stderr = (e.stdout ? e.stdout.toString() : "") + (e.stderr ? e.stderr.toString() : "");
  }
  const errs = stderr
    .split("\n")
    .filter((l) => /error\s+CS\d+/.test(l))
    .map((l) => l.replace(/^.*?\s(warning|error)\s/, "$1 ").trim());
  results.push({ id: c.id, title: c.title, errors: [...new Set(errs)].slice(0, 8) });
  if (errs.length) {
    console.log(`FAIL ${c.id} ${c.title}`);
    for (const e of [...new Set(errs)].slice(0, 5)) console.log("   ", e);
  } else {
    console.log(`OK   ${c.id}`);
  }
}

const failed = results.filter((r) => r.errors.length);
console.log("\n========== 汇总 ==========");
console.log("总数:", results.length, "编译失败:", failed.length);
writeFileSync(
  `${workDir}/results.json`,
  JSON.stringify(failed, null, 2)
);
