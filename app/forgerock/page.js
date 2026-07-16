"use client";

import TutorialPage from "../components/TutorialPage";
import {
  forgerockChapters,
  forgerockChapterGroups,
} from "../courses-data/forgerock-tutorial-data";

// @forgerock/javascript-sdk 教程页
// 使用通用 TutorialPage 组件渲染侧边栏 + Markdown 内容 + 代码示例
export default function ForgeRockBook() {
  return (
    <TutorialPage
      chapters={forgerockChapters}
      chapterGroups={forgerockChapterGroups}
      bookPath="/forgerock"
      bookTitle="@forgerock/javascript-sdk"
      defaultLang="md"
      tip="点击章节开始学习"
      footerText="@forgerock/javascript-sdk v4.9.1 · Ping Identity 官方 JavaScript SDK"
    />
  );
}
