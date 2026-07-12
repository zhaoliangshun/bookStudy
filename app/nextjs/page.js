"use client";

import TutorialPage from "../components/TutorialPage";
import { nextjsChapters, nextjsChapterGroups } from "../courses-data/nextjs-tutorial-data";

export default function NextjsBook() {
  return (
    <TutorialPage
      chapters={nextjsChapters}
      chapterGroups={nextjsChapterGroups}
      bookPath="/nextjs"
      bookTitle="Next.js 16 教程"
      defaultLang="jsx"
      tip="点击章节开始阅读"
      footerText="Next.js 16 教程 · 25 章系统化内容 · 涵盖基础入门、数据交互、高级路由、性能缓存、配置部署"
    />
  );
}
