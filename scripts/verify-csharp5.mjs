import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import {
  csharp5Chapters,
  csharp5ChapterGroups,
} from "../app/courses-data/csharp5-tutorial-data.js";

const chapterId = process.argv
  .find((argument) => argument.startsWith("--chapter="))
  ?.slice("--chapter=".length);
const structureOnly = process.argv.includes("--structure-only");
const newOnly = process.argv.includes("--new-only");

const selected = csharp5Chapters.filter((chapter) => {
  if (chapterId) return chapter.id === chapterId;
  if (newOnly) {
    return chapter.id === "csharp5-preface"
      || chapter.id === "csharp5-conclusion"
      || Number(chapter.id.replace("csharp5-ch", "")) >= 116;
  }
  return true;
});

if (selected.length === 0) {
  throw new Error(`没有找到章节：${chapterId ?? "(筛选结果为空)"}`);
}

const failures = [];
const ids = csharp5Chapters.map(({ id }) => id);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicateIds.length > 0) {
  failures.push(`重复章节 ID：${[...new Set(duplicateIds)].join(", ")}`);
}

if (csharp5Chapters.length !== 128) {
  failures.push(`应有 128 篇，实际 ${csharp5Chapters.length} 篇`);
}

for (const group of csharp5ChapterGroups) {
  if (!csharp5Chapters.some((chapter) => chapter.group === group)) {
    failures.push(`空章节组：${group}`);
  }
}

for (const chapter of csharp5Chapters) {
  if (!chapter.id || !chapter.group || !chapter.title || !chapter.content || !chapter.code) {
    failures.push(`${chapter.id ?? "(无 ID)"}：缺少必要字段`);
  }
  if (!csharp5ChapterGroups.includes(chapter.group)) {
    failures.push(`${chapter.id}：未声明章节组 ${chapter.group}`);
  }
  if (chapter.lang !== "cs") {
    failures.push(`${chapter.id}：lang 应为 cs，实际为 ${chapter.lang}`);
  }
  const fences = chapter.content.match(/```/g)?.length ?? 0;
  if (fences % 2 !== 0) {
    failures.push(`${chapter.id}：Markdown 代码围栏数量不是偶数`);
  }
  if (/^\\`$/m.test(chapter.content)) {
    failures.push(`${chapter.id}：存在错误的单反引号代码围栏`);
  }
}

if (!structureOnly) {
  const workDir = mkdtempSync(join(tmpdir(), "verify-csharp5-"));
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
    <TreatWarningsAsErrors>false</TreatWarningsAsErrors>
  </PropertyGroup>
</Project>
`
  );

  try {
    const restore = spawnSync(dotnet, ["restore", projectFile], {
      cwd: workDir,
      encoding: "utf8",
      timeout: 60_000,
    });
    if (restore.status !== 0) {
      throw new Error(restore.stderr || restore.stdout || "dotnet restore 失败");
    }

    for (const [index, chapter] of selected.entries()) {
      writeFileSync(programFile, chapter.code);
      const result = spawnSync(
        dotnet,
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
        `\r检查 C# 示例 ${String(index + 1).padStart(3, " ")}/${selected.length}`
      );
    }
    process.stdout.write("\n");
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}

if (failures.length > 0) {
  console.error(`发现 ${failures.length} 个问题：\n\n${failures.join("\n\n")}`);
  process.exitCode = 1;
} else {
  const compiled = structureOnly ? "未编译 demo" : `编译 ${selected.length} 个 demo`;
  console.log(`通过：${csharp5Chapters.length} 篇结构完整，${compiled}，全部检查通过。`);
}
