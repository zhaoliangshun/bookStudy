// 提取指定章节 demo 到 /tmp/<id>-verify 供手动编译验证
import { writeFileSync, mkdirSync, rmSync } from "fs";
import { csharp5Chapters } from "../app/courses-data/csharp5-tutorial-data.js";

const ids = process.argv.slice(2);
const csproj = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <AllowUnsafeBlocks>true</AllowUnsafeBlocks>
  </PropertyGroup>
</Project>`;
for (const id of ids) {
  const ch = csharp5Chapters.find((c) => c.id === id);
  if (!ch) { console.error("未找到 " + id); continue; }
  const d = `/tmp/${id}-verify`;
  rmSync(d, { recursive: true, force: true });
  mkdirSync(d, { recursive: true });
  writeFileSync(`${d}/Runner.csproj`, csproj);
  writeFileSync(`${d}/Program.cs`, ch.code);
  console.log(d);
}
