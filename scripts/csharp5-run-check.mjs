// csharp5 主 demo 运行时冒烟测试
// 逐章编译并执行（超时 20s，stdin 屏蔽），记录崩溃/超时章节
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { execSync, spawnSync } from "child_process";

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

const workDir = "/tmp/csharp5-verify";
const projDir = `${workDir}/demo`;
mkdirSync(projDir, { recursive: true });

const crashed = [];
const timeouts = [];
for (const c of all) {
  writeFileSync(`${projDir}/Program.cs`, c.code);
  try {
    execSync("dotnet build --nologo -v q", { cwd: projDir, stdio: "pipe", timeout: 90000 });
  } catch (e) {
    console.log(`BUILD-FAIL ${c.id}`);
    crashed.push(c.id);
    continue;
  }
  const r = spawnSync("dotnet", [`${projDir}/bin/Debug/net8.0/demo.dll`], {
    cwd: projDir,
    timeout: 20000,
    input: "",
    encoding: "utf8",
  });
  if (r.error && r.error.code === "ETIMEDOUT") {
    console.log(`TIMEOUT   ${c.id} ${c.title}`);
    timeouts.push(c.id);
  } else if (r.status !== 0) {
    const errLines = (r.stderr || "").split("\n").filter((l) => /Exception|error/.test(l)).slice(0, 2).join(" | ");
    console.log(`CRASH     ${c.id} ${c.title} :: ${errLines}`);
    crashed.push(c.id);
  } else {
    console.log(`RUN-OK    ${c.id}`);
  }
}

console.log("\n========== 运行汇总 ==========");
console.log("崩溃:", crashed.join(", ") || "无");
console.log("超时:", timeouts.join(", ") || "无");
