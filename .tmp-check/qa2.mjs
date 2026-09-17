export default async function run(page, ui) {
  const out = {};
  // 导航到 ch126（扩充最多的章节）
  await page.goto("http://localhost:3000/csharp5#csharp5-ch126", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);

  out.h1 = await page.evaluate(() => {
    const h = document.querySelector(".chapter-main-title");
    return h ? h.innerText.trim() : null;
  });

  // 正文里应出现新增的小节标题
  const body = await page.evaluate(() => document.body.innerText);
  out.hasValidationLib = body.includes("验证库怎么落地");
  out.hasCulture = body.includes("文化、可空与枚举");
  out.hasOverGetting = body.includes("over-getting");
  out.hasChecklist = body.includes("生产检查");
  out.bodyChars = body.length;

  // 检查是否有裸露的转义反斜杠（编辑事故的可见症状）
  out.strayBackslash = (body.match(/\\`/g) || []).length;

  // 代码块数量
  out.codeBlocks = await page.evaluate(
    () => document.querySelectorAll(".md-code-block-wrap").length
  );
  return out;
}
