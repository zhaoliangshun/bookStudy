export default async function run(page, ui) {
  const out = {};
  // 1. 页面是否挂载、章节数是否正确
  out.title = await page.title();
  out.bodyChars = (await page.evaluate(() => document.body.innerText.length));

  // 2. 侧边栏章节总数
  const meta = await page.evaluate(() => {
    const el = document.querySelector(".sidebar-meta, .sidebar-tip, aside");
    return el ? el.innerText.slice(0, 200) : null;
  });
  out.meta = meta;

  // 3. 主标题（当前章）
  out.h1 = await page.evaluate(() => {
    const h = document.querySelector(".chapter-main-title");
    return h ? h.innerText.trim() : null;
  });

  // 4. 是否出现"生产检查"小节（默认章是前言，切到 ch126 验证）
  out.hasEditor = await page.evaluate(() => !!document.querySelector(".monaco-editor, .md-code-editor-container"));
  return out;
}
