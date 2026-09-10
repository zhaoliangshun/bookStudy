import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const requestedBatch = process.argv
  .find((arg) => arg.startsWith("--batch="))
  ?.slice("--batch=".length);
const batchNumbers = requestedBatch
  ? requestedBatch.split(",").map(Number)
  : Array.from({ length: 15 }, (_, index) => index + 1);
const batches = await Promise.all(
  batchNumbers.map((batchNumber) =>
    import(`../app/courses-data/csharp4-chapters-batch${batchNumber}.js`)
  )
);
const requestedChapter = process.argv
  .find((arg) => arg.startsWith("--chapter="))
  ?.slice("--chapter=".length);
const allChapters = batches.flatMap(({ chapters: items }) => items);
const chapters = requestedChapter
  ? allChapters.filter(({ id }) => id === requestedChapter)
  : allChapters;
const failures = [];

if (chapters.length === 0) {
  throw new Error(`没有找到章节：${requestedChapter}`);
}

const duplicateIds = chapters
  .map(({ id }) => id)
  .filter((id, index, ids) => ids.indexOf(id) !== index);
if (duplicateIds.length > 0) {
  failures.push(`重复章节 ID：${[...new Set(duplicateIds)].join(", ")}`);
}

for (const chapter of chapters) {
  if (!chapter.id || !chapter.group || !chapter.title || !chapter.content || !chapter.code) {
    failures.push(`${chapter.id ?? "(无 ID)"}：缺少必要字段`);
  }
  if (chapter.lang !== "cs") {
    failures.push(`${chapter.id}：lang 应为 cs，实际为 ${chapter.lang}`);
  }
  const fences = chapter.content.match(/```/g)?.length ?? 0;
  if (fences % 2 !== 0) {
    failures.push(`${chapter.id}：Markdown 代码围栏数量不是偶数`);
  }
  if (/^\\`$/m.test(chapter.content)) {
    failures.push(`${chapter.id}：存在单个反引号组成的错误代码围栏`);
  }
}

const workDir = mkdtempSync(join(tmpdir(), "verify-csharp4-"));
const projectFile = join(workDir, "Verify.csproj");
const programFile = join(workDir, "Program.cs");

writeFileSync(
  projectFile,
  `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <TreatWarningsAsErrors>false</TreatWarningsAsErrors>
  </PropertyGroup>
</Project>
`
);

try {
  const restore = spawnSync("dotnet", ["restore", projectFile], {
    cwd: workDir,
    encoding: "utf8",
    timeout: 60_000,
  });
  if (restore.status !== 0) {
    throw new Error(restore.stderr || restore.stdout || "dotnet restore 失败");
  }

  for (const [index, chapter] of chapters.entries()) {
    writeFileSync(programFile, chapter.code);
    const result = spawnSync(
      "dotnet",
      ["build", projectFile, "-c", "Release", "--no-restore", "--nologo", "-v:q"],
      {
        cwd: workDir,
        encoding: "utf8",
        timeout: 30_000,
      }
    );
    if (result.status !== 0) {
      const diagnostic = `${result.stdout}\n${result.stderr}`
        .split("\n")
        .filter((line) => /\berror CS\d+/.test(line))
        .slice(0, 8)
        .join("\n");
      failures.push(`${chapter.id}（${chapter.title}）编译失败：\n${diagnostic}`);
    }
    process.stdout.write(
      `\r检查 C# 示例 ${String(index + 1).padStart(2, " ")}/${chapters.length}`
    );
  }
  process.stdout.write("\n");
} finally {
  rmSync(workDir, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error(`发现 ${failures.length} 个问题：\n\n${failures.join("\n\n")}`);
  process.exitCode = 1;
} else {
  console.log(`通过：${chapters.length} 章结构完整，全部 C# 示例可在 .NET 8 编译。`);
}
