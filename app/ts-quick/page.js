"use client";

import TutorialPage from "../components/TutorialPage";
import { tsQuickChapters, tsQuickChapterGroups } from "../courses-data/ts-quick-tutorial-data";

// =============================================================
// TypeScript 速查教程（ts-quick）页面
// -------------------------------------------------------------
// 与 /ts（深入教程）互补：本教程聚焦日常开发高频用法、避坑、模板代码。
// 运行接口：/api/run-ts（由 CodeBlock 内部调用，先 TS 转译再沙箱执行）
// =============================================================
export default function TypeScriptQuickTutorial() {
  return (
    <TutorialPage
      chapters={tsQuickChapters}
      chapterGroups={tsQuickChapterGroups}
      bookPath="/ts-quick"
      bookTitle="TypeScript 速查"
      defaultLang="ts"
      tip="点击章节查看高频用法 · 代码可在线编辑运行"
      footerText="TypeScript 速查教程 · 简单实用、马上能用 · 代码先经 TS 编译器转译再在沙箱中执行"
    />
  );
}
