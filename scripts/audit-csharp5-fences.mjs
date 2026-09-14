import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { csharp5Chapters } from "../app/courses-data/csharp5-tutorial-data.js";

const fenceRe = /```(csharp|cs)\n([\s\S]*?)```/g;
const snippets = [];

for (const chapter of csharp5Chapters) {
  let match;
  const content = chapter.content ?? "";
  while ((match = fenceRe.exec(content))) {
    snippets.push({
      id: chapter.id,
      title: chapter.title,
      source: "content",
      code: match[2],
    });
  }
  snippets.push({
    id: chapter.id,
    title: chapter.title,
    source: "main",
    code: chapter.code,
  });
}

const workDir = mkdtempSync(join(tmpdir(), "audit-csharp5-"));
const projectFile = join(workDir, "Verify.csproj");
const programFile = join(workDir, "Program.cs");
const dotnet = process.env.DOTNET_HOST_PATH || "dotnet";

writeFileSync(
  projectFile,
  `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
</Project>
`
);

const restore = spawnSync(dotnet, ["restore", projectFile], {
  cwd: workDir,
  encoding: "utf8",
  timeout: 60_000,
});
if (restore.status !== 0) {
  throw new Error(restore.stderr || restore.stdout || "dotnet restore 失败");
}

const failures = [];
for (const [index, snippet] of snippets.entries()) {
  writeFileSync(programFile, snippet.code);
  const result = spawnSync(
    dotnet,
    ["build", projectFile, "-c", "Release", "--no-restore", "--nologo", "-v:q"],
    { cwd: workDir, encoding: "utf8", timeout: 30_000 }
  );
  if (result.status !== 0) {
    const diagnostic = `${result.stdout}\n${result.stderr}`
      .split("\n")
      .filter((line) => /\berror CS\d+/.test(line))
      .slice(0, 3)
      .join(" | ");
    failures.push(
      `${snippet.id} [${snippet.source}] ${snippet.title}: ${diagnostic}`
    );
  }
  if ((index + 1) % 20 === 0 || index + 1 === snippets.length) {
    process.stdout.write(`\r检查 ${index + 1}/${snippets.length}`);
  }
}
process.stdout.write("\n");
rmSync(workDir, { recursive: true, force: true });

console.log(`共 ${snippets.length} 个 csharp 代码块，失败 ${failures.length} 个`);
for (const failure of failures.slice(0, 80)) console.log(failure);
if (failures.length > 80) console.log(`… 还有 ${failures.length - 80} 条`);
process.exitCode = failures.length > 0 ? 1 : 0;
