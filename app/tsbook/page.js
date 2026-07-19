"use client";

import TutorialPage from "../components/TutorialPage";
import { tsBookChapters, tsBookChapterGroups } from "../courses-data/tsbook-tutorial-data";

export default function TypeScriptBook() {
  return (
    <TutorialPage
      chapters={tsBookChapters}
      chapterGroups={tsBookChapterGroups}
      bookPath="/tsbook"
      bookTitle="TypeScript 全解"
      defaultLang="ts"
      tip="从入门到精通 · 每个知识点都有可运行示例 · Ctrl+K 搜索章节"
      footerText="TypeScript 全解 · 大而全的 TypeScript 知识体系 · 代码可在线编辑运行"
    />
  );
}
