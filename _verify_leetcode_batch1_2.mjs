import { chapters as batch1 } from "./app/leetcode-chapters-batch1.js";
import { chapters as batch2 } from "./app/leetcode-chapters-batch2.js";

function check(label, chapters, expectedIds, expectedGroup) {
  console.log(`\n=== ${label} ===`);
  console.log(`count: ${chapters.length} (expected ${expectedIds.length})`);
  if (chapters.length !== expectedIds.length) {
    console.error(`COUNT MISMATCH`);
    process.exit(1);
  }
  const ids = chapters.map(c => c.id);
  const expected = expectedIds;
  for (let i = 0; i < expected.length; i++) {
    if (ids[i] !== expected[i]) {
      console.error(`ID MISMATCH at ${i}: got ${ids[i]} expected ${expected[i]}`);
      process.exit(1);
    }
  }
  for (const c of chapters) {
    if (c.group !== expectedGroup) {
      console.error(`GROUP MISMATCH for ${c.id}: got "${c.group}" expected "${expectedGroup}"`);
      process.exit(1);
    }
    if (typeof c.content !== "string" || c.content.length < 100) {
      console.error(`CONTENT TOO SHORT for ${c.id}: len=${c.content?.length}`);
      process.exit(1);
    }
    // 必须包含 6 个二级标题模块
    for (const sec of ["## 题目", "## 思路", "## Python 实现", "## JavaScript 实现", "## 复杂度", "## 拓展"]) {
      if (!c.content.includes(sec)) {
        console.error(`MISSING SECTION "${sec}" in ${c.id}`);
        process.exit(1);
      }
    }
    // 不能有未转义的反引号导致插值 ${} 错误（检查 content 里是否包含裸 ${）
    // 模板字符串内的 ${} 会被求值；若出现在 Python 代码中通常就是 bug
    const m = c.content.match(/\$\{[^}]*\}/g);
    if (m) {
      console.error(`UNESCAPED \${...} in ${c.id}: ${JSON.stringify(m)}`);
      process.exit(1);
    }
  }
  console.log(`ids: ${ids.join(", ")}`);
  console.log(`group: all = "${expectedGroup}" OK`);
  console.log(`content sections: all 6 present OK`);
  console.log(`no unescaped \${}: OK`);
}

check(
  "Batch 1 (数组基础)",
  batch1,
  ["lc-01","lc-02","lc-03","lc-04","lc-05","lc-06","lc-07","lc-08","lc-09","lc-10"],
  "数组基础"
);

check(
  "Batch 2 (字符串处理)",
  batch2,
  ["lc-11","lc-12","lc-13","lc-14","lc-15","lc-16","lc-17","lc-18","lc-19","lc-20"],
  "字符串处理"
);

console.log("\n✅ ALL CHECKS PASSED");
