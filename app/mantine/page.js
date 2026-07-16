"use client";

import TutorialPage from "../components/TutorialPage";
import {
  mantineChapters,
  mantineChapterGroups,
} from "../courses-data/mantine-tutorial-data";

// Mantine 教程页
// 使用通用 TutorialPage 组件渲染侧边栏 + Markdown 内容 + 代码示例
export default function MantineBook() {
  return (
    <TutorialPage
      chapters={mantineChapters}
      chapterGroups={mantineChapterGroups}
      bookPath="/mantine"
      bookTitle="Mantine"
      defaultLang="md"
      tip="点击章节开始学习"
      footerText="Mantine v9.4.1 · CSS Modules 驱动的 React 组件库"
    />
  );
}
