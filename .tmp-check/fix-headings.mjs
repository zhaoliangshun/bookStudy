import { readFileSync, writeFileSync } from "fs";

const cn = (n) => {
  const d = ["零","一","二","三","四","五","六","七","八","九"];
  if (n <= 10) return n === 10 ? "十" : d[n];
  if (n < 20) return "十" + (n % 10 ? d[n % 10] : "");
  return d[Math.floor(n / 10)] + "十" + (n % 10 ? d[n % 10] : "");
};

const files = ["batch3","batch4","batch5","batch6","batch7","batch8","batch9","batch10"];
let fixed = 0;
for (const f of files) {
  const p = `app/courses-data/csharp2-chapters-${f}.js`;
  let src = readFileSync(p, "utf8");
  // id 可能是单引号或双引号；把损坏的字面量 $1 还原为「第N章\u3000」
  const re = /(id: ["']csharp2-ch(\d+)["'],[\s\S]*?content: `## )\$1/g;
  src = src.replace(re, (_m, prefix, num) => {
    fixed++;
    return `${prefix}第${cn(parseInt(num))}章\u3000`;
  });
  writeFileSync(p, src, "utf8");
}
console.log("恢复标题编号:", fixed);
if (fixed !== 43) { console.log("⚠️ 数量不符(期望43)"); process.exit(1); }
console.log("✓ 全部恢复");
