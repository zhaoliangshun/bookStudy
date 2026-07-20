"use client";

import TutorialPage from "../components/TutorialPage";
import { tsxProChapters, tsxProChapterGroups } from "../courses-data/tsx-pro-tutorial-data";

export default function TsxProTutorial() {
  return (
    <TutorialPage
      chapters={tsxProChapters}
      chapterGroups={tsxProChapterGroups}
      bookPath="/tsx-pro"
      bookTitle="TS + React 全栈精通"
      defaultLang="tsx"
      tip="🚀 从 0 到 1 完整覆盖 TypeScript + React 日常开发 100% 知识点，共 70 章"
      footerText="TypeScript + React 全栈精通 · 70 章 · 入门到精通 · 每个知识点都有详细注释的可运行 demo"
    />
  );
}
